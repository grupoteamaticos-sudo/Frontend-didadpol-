import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { SeguridadService, Permiso } from '../../../shared/services/seguridad.service';
import { AuditService } from '../../../shared/services/audit.service';
import { AuthService } from '../../../shared/services/auth.service';

@Component({
  selector: 'app-seg-permisos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './permisos.html',
  styleUrl: './permisos.scss',
})
export class SegPermisos implements OnInit {

  permisos: Permiso[] = [];
  usuarios: any[] = [];

  usuarioSeleccionado: any = null;

  // 🔥 NUEVO: control en memoria
  permisosOriginales: string[] = [];
  permisosSeleccionados: Set<string> = new Set();

  msg = '';
  err = '';

  form;

  constructor(
    private fb: FormBuilder,
    private seg: SeguridadService,
    private audit: AuditService,
    private auth: AuthService
  ) {
    this.form = this.fb.group({
      code: ['', Validators.required],
      name: ['', Validators.required],
    });
  }

  async ngOnInit() {
    await this.refresh();
  }

  async refresh() {
    try {
      this.permisos = await this.seg.listPermisos();
      this.usuarios = await this.seg.listUsuarios();
    } catch (e: any) {
      this.err = 'Error cargando datos';
    }
  }

  // =========================
  // CREAR PERMISO
  // =========================
  async create() {
    this.msg = '';
    this.err = '';

    if (this.form.invalid) {
      this.err = 'Code y nombre requeridos';
      return;
    }

    try {
      const v = this.form.value;

      await this.seg.createPermiso({
        code: String(v.code),
        name: String(v.name),
      });

      this.msg = 'Permiso creado';
      this.form.reset();

      await this.refresh();

    } catch (e: any) {
      this.err = 'Error creando permiso';
    }
  }

  async delete(p: Permiso) {
    await this.seg.deletePermiso(p.id);
    await this.refresh();
  }

  // =========================
  // CAMBIO DE USUARIO
  // =========================
  async onUsuarioChange(event: any) {
    const id = event.target.value;

    if (!id) {
      this.usuarioSeleccionado = null;
      this.permisosOriginales = [];
      this.permisosSeleccionados.clear();
      return;
    }

    this.usuarioSeleccionado =
      this.usuarios.find(u => String(u.id_usuario) === String(id)) || null;

    try {
      const data = await this.seg.getPermisosUsuario(id);

      this.permisosOriginales = data.map((p: any) =>
        String(p.id_permiso)
      );

      this.permisosSeleccionados = new Set(this.permisosOriginales);

    } catch (e) {
      this.err = 'Error cargando permisos';
    }
  }

  // =========================
  // CHECK
  // =========================
  hasPerm(id: string): boolean {
    return this.permisosSeleccionados.has(String(id));
  }

  // =========================
  // TOGGLE LOCAL (SIN BACKEND)
  // =========================
  togglePerm(id: string) {
    if (this.permisosSeleccionados.has(id)) {
      this.permisosSeleccionados.delete(id);
    } else {
      this.permisosSeleccionados.add(id);
    }
  }

  // =========================
  // GUARDAR CAMBIOS
  // =========================
  async guardarPermisos() {
    if (!this.usuarioSeleccionado) return;

    const userId = this.usuarioSeleccionado.id_usuario;

    const originales = new Set(this.permisosOriginales);

    const agregar = [...this.permisosSeleccionados].filter(id => !originales.has(id));
    const quitar = [...originales].filter(id => !this.permisosSeleccionados.has(id));

    try {

      for (const id of agregar) {
        await this.seg.addPermisoToUsuario(userId, id);
      }

      for (const id of quitar) {
        await this.seg.removePermisoFromUsuario(userId, id);
      }

      const me = this.auth.getUser()?.username || 'admin';

      this.audit.log({
        user: me,
        type: 'UPDATE',
        module: 'Seguridad/Permisos',
        detail: `Actualizó permisos usuario ${userId}`,
      });

      this.msg = 'Permisos actualizados correctamente';
      this.permisosOriginales = [...this.permisosSeleccionados];

    } catch (e: any) {
      this.err = 'Error guardando permisos';
    }
  }
}
