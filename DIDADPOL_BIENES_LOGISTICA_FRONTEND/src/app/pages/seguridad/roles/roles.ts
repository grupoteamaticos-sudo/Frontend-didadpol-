import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { SeguridadService, Rol } from '../../../shared/services/seguridad.service';
import { AuthService } from '../../../shared/services/auth.service';
import { AuditService } from '../../../shared/services/audit.service';

@Component({
  selector: 'app-seg-roles',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './roles.html',
  styleUrl: './roles.scss',
})
export class SegRoles implements OnInit {

  roles: Rol[] = [];

  selectedRoleId = '';

  msg = '';
  err = '';

  form;

  constructor(
    private fb: FormBuilder,
    private seg: SeguridadService,
    private auth: AuthService,
    private audit: AuditService
  ) {
    this.form = this.fb.group({
      nombre_rol: ['', Validators.required],
      descripcion_rol: ['']
    });
  }

  async ngOnInit() {
    if (!this.auth.isLoggedIn()) return;
    await this.refresh();
  }

  async refresh() {
    this.msg = '';
    this.err = '';

    try {
      this.roles = await this.seg.listRoles();
    } catch (e: any) {
      this.err = e?.error?.msg || 'Error cargando roles';
    }
  }

  async create() {
    this.msg = '';
    this.err = '';

    if (this.form.invalid) {
      this.err = 'Nombre requerido';
      return;
    }

    try {
      const v = this.form.value;

      await this.seg.createRol(
        String(v.nombre_rol || ''),
        String(v.descripcion_rol || '')
      );

      const me = this.auth.getUser()?.username || 'admin';

      this.audit.log({
        user: me,
        type: 'CREATE',
        module: 'Seguridad/Roles',
        detail: `Creó rol: ${v.nombre_rol}`,
      });

      this.msg = 'Rol creado correctamente';
      this.form.reset();

      await this.refresh();

    } catch (e: any) {
      this.err = e?.error?.msg || 'Error creando rol';
    }
  }

  selectRole(id: string) {
    this.selectedRoleId = id;
  }

  role(): Rol | undefined {
    return this.roles.find(r => r.id === this.selectedRoleId);
  }

  async deleteRole(r: Rol) {
    this.msg = '';
    this.err = '';

    try {
      await this.seg.deleteRol(r.id);

      const me = this.auth.getUser()?.username || 'admin';

      this.audit.log({
        user: me,
        type: 'DELETE',
        module: 'Seguridad/Roles',
        detail: `Eliminó rol: ${r.name}`,
      });

      this.selectedRoleId = '';

      await this.refresh();

    } catch (e: any) {
      this.err = e?.error?.msg || 'Error eliminando rol';
    }
  }
}
