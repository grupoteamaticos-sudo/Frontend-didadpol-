import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { SeguridadService } from '../../../shared/services/seguridad.service';
import { AuthService } from '../../../shared/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-seg-empleados',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './empleados.html',
  styleUrl: './empleados.scss',
})
export class SegEmpleados implements OnInit {

  empleados: any[] = [];
  personas: any[] = [];
  personasFiltradas: any[] = [];

  departamentos: any[] = [];
  puestos: any[] = [];
  sucursales: any[] = [];

  // 🔥 NUEVO
  empleadoCreadoId: number | null = null;
  mostrarCrearUsuario = false;

  msg = '';
  err = '';
  loading = false;

  form;

  constructor(
    private fb: FormBuilder,
    private seg: SeguridadService,
    private auth: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      id_persona: ['', Validators.required],
      codigo_empleado: ['', Validators.required],
      id_departamento: ['', Validators.required],
      id_puesto: ['', Validators.required],
      id_sucursal: ['', Validators.required],
      id_estatus_empleado: [1],
      fecha_ingreso: ['']
    });
  }

  async ngOnInit() {
    if (!this.auth.isLoggedIn()) return;
    await this.loadAll();
  }

  async loadAll() {
    this.loading = true;
    this.msg = '';
    this.err = '';

    try {
      this.empleados = await this.seg.listEmpleados();

      this.personas = await this.seg.listPersonas();
      this.personasFiltradas = this.personas;

      this.departamentos = await this.seg.listDepartamentos?.() || [];
      this.puestos = await this.seg.listPuestos?.() || [];
      this.sucursales = await this.seg.listSucursales?.() || [];

    } catch (e: any) {
      this.err = e?.error?.msg || 'Error cargando datos';
    } finally {
      this.loading = false;
    }
  }

  filtrarPersonas(event: any) {
    const val = event.target.value.toLowerCase();

    this.personasFiltradas = this.personas.filter(p =>
      p.nombre_completo.toLowerCase().includes(val)
    );
  }

  async submit() {
    this.msg = '';
    this.err = '';
    this.mostrarCrearUsuario = false;

    if (this.form.invalid) {
      this.err = 'Campos requeridos';
      return;
    }

    try {
      const res: any = await this.seg.createEmpleado(this.form.value);

      this.msg = 'Empleado creado correctamente';

      // 🔥 CAPTURAR ID DEL EMPLEADO
      this.empleadoCreadoId = res?.empleado?.id_empleado || res?.id_empleado || null;

      // 🔥 ACTIVAR OPCIÓN DE CREAR USUARIO
      if (this.empleadoCreadoId) {
        this.mostrarCrearUsuario = true;
      }

      this.form.reset({
        id_persona: '',
        codigo_empleado: '',
        fecha_ingreso: '',
        id_departamento: '',
        id_puesto: '',
        id_sucursal: '',
        id_estatus_empleado: 1
      });

      await this.loadAll();

    } catch (e: any) {
      this.err = e?.error?.msg || 'Error al crear empleado';
    }
  }

  // 🔥 REDIRECCIÓN
  irCrearUsuario() {
    this.router.navigate(['/seguridad/usuarios'], {
      queryParams: {
        empleadoId: this.empleadoCreadoId
      }
    });
  }

  personaName(id: any) {
    return this.personas.find(p => p.id_persona == id)?.nombre_completo || '—';
  }
}
