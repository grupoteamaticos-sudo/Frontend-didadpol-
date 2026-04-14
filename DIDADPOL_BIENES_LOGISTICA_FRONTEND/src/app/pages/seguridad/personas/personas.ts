import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

import { SeguridadService } from '../../../shared/services/seguridad.service';
import { AuditService } from '../../../shared/services/audit.service';
import { AuthService } from '../../../shared/services/auth.service';

@Component({
  selector: 'app-seg-personas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './personas.html',
  styleUrl: './personas.scss',
})
export class SegPersonas implements OnInit {

  msg = '';
  err = '';
  loading = false;

  form;

  constructor(
    private fb: FormBuilder,
    private seg: SeguridadService,
    private audit: AuditService,
    private auth: AuthService
  ) {
    this.form = this.fb.group({
      primer_nombre: ['', Validators.required],
      segundo_nombre: [''],
      primer_apellido: ['', Validators.required],
      segundo_apellido: [''],
      identidad: [''],
      fecha_nacimiento: [''],
      sexo: [''],

      tipo_telefono: ['CELULAR'],
      numero: [''],

      pais: ['Honduras'],
      departamento: [''],
      municipio: [''],
      colonia_barrio: [''],
      direccion_detallada: [''],

      correo: ['']
    });
  }

  ngOnInit() {}

  async submit() {
    this.msg = '';
    this.err = '';

    if (this.form.invalid) {
      this.err = 'Completá los campos requeridos.';
      return;
    }

    try {
      await this.seg.createPersona(this.form.value);

      const me = this.auth.getUser()?.username || 'admin';

      this.audit.log({
        user: me,
        type: 'CREATE',
        module: 'Seguridad/Personas',
        detail: `Creó persona: ${this.form.value.primer_nombre}`
      });

      this.msg = 'Persona creada ✅';

      this.form.reset({
        primer_nombre: '',
        segundo_nombre: '',
        primer_apellido: '',
        segundo_apellido: '',
        identidad: '',
        fecha_nacimiento: '',
        sexo: '',
        tipo_telefono: 'CELULAR',
        numero: '',
        pais: 'Honduras',
        departamento: '',
        municipio: '',
        colonia_barrio: '',
        direccion_detallada: '',
        correo: ''
      });

    } catch (e: any) {
      this.err = e?.error?.msg || 'No se pudo crear la persona.';
    }
  }
}
