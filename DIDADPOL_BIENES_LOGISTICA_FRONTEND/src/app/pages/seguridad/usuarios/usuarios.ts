import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

import { SeguridadService, Usuario, Rol } from '../../../shared/services/seguridad.service';
import { AuditService } from '../../../shared/services/audit.service';
import { AuthService } from '../../../shared/services/auth.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-seg-usuarios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.scss',
})
export class SegUsuarios implements OnInit {

  usuarios: Usuario[] = [];
  rolesCatalogo: Rol[] = [];

  empleados: any[] = [];
  empleadosFiltrados: any[] = [];

  bloquearEmpleado = false;

  msg = '';
  err = '';
  loading = false;

  form;

  constructor(
    private fb: FormBuilder,
    private seg: SeguridadService,
    private audit: AuditService,
    private auth: AuthService,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      id_empleado: [{ value: '', disabled: true }, Validators.required],
      nombre_usuario: ['', Validators.required],
      correo_login: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      id_rol: ['', Validators.required],
      activo: [true]
    });
  }

  async ngOnInit() {
    if (!this.auth.isLoggedIn()) return;

    await this.loadAll();

    const empleadoId = this.route.snapshot.queryParamMap.get('empleadoId');

    if (empleadoId) {
      this.form.patchValue({ id_empleado: empleadoId });
      this.bloquearEmpleado = true;

      this.onEmpleadoChange({ target: { value: empleadoId } });
    }
  }

  async loadAll() {
    this.loading = true;
    this.msg = '';
    this.err = '';

    try {
      this.usuarios = await this.seg.listUsuarios();
      this.rolesCatalogo = await this.seg.listRoles();
      this.empleados = await this.seg.listEmpleados();

      const idsConUsuario = new Set(
        this.usuarios.map(u => String(u.idEmpleado))
      );

      this.empleadosFiltrados = this.empleados.filter(
        e => !idsConUsuario.has(String(e.id_empleado))
      );

    } catch (e: any) {
      this.err = e?.error?.message || e?.error?.msg || 'No se pudo cargar seguridad.';
    } finally {
      this.loading = false;
    }
  }

  filtrarEmpleados(event: any) {
    const val = (event.target.value || '').toLowerCase();

    this.empleadosFiltrados = this.empleados.filter(e => {
      const yaExiste = this.usuarios.some(
        u => String(u.idEmpleado) === String(e.id_empleado)
      );

      if (yaExiste) return false;

      return (
        (e.nombre || '').toLowerCase().includes(val) ||
        (e.codigo_empleado || '').toLowerCase().includes(val)
      );
    });
  }

  generarUsername(nombre: string) {
    if (!nombre) return '';

    const partes = nombre.toLowerCase().split(' ');

    if (partes.length >= 2) {
      return partes[0].charAt(0) + partes[1];
    }

    return partes[0];
  }

  generarEmail(username: string) {
    return username ? `${username}@didadpol.gob` : '';
  }

  onEmpleadoChange(event: any) {
    const id = event.target.value;

    const emp = this.empleados.find(e => String(e.id_empleado) === String(id));
    if (!emp) return;

    const username = this.generarUsername(emp.nombre);
    const email = this.generarEmail(username);

    this.form.patchValue({
      nombre_usuario: username,
      correo_login: email
    });
  }

  async submit() {
    this.msg = '';
    this.err = '';

    if (this.form.invalid) {
      this.err = 'Completá los campos requeridos.';
      return;
    }

    try {
      const v = this.form.value;

      const yaExiste = this.usuarios.some(
        u => String(u.idEmpleado) === String(v.id_empleado)
      );

      if (yaExiste) {
        this.err = 'Este empleado ya tiene usuario asignado';
        return;
      }

      await this.seg.createUsuario({
        idEmpleado: String(v.id_empleado),
        username: String(v.nombre_usuario),
        email: String(v.correo_login),
        password: String(v.password),
        activo: !!v.activo,
        roleId: String(v.id_rol),
      });

      const me = this.auth.getUser()?.username || 'admin';

      this.audit.log({
        user: me,
        type: 'CREATE',
        module: 'Seguridad/Usuarios',
        detail: `Creó usuario: ${v.nombre_usuario}`,
      });

      this.msg = 'Usuario creado correctamente';

      this.form.reset({
        id_empleado: '',
        nombre_usuario: '',
        correo_login: '',
        password: '',
        id_rol: '',
        activo: true
      });

      this.bloquearEmpleado = false;

      await this.loadAll();

    } catch (e: any) {
      this.err = e?.error?.message || e?.error?.msg || 'No se pudo crear el usuario.';
    }
  }

  async toggle(u: Usuario) {
    await this.seg.toggleActivo(u.id);
    await this.loadAll();
  }

  async delete(u: Usuario) {
    await this.seg.deleteUsuario(u.id);
    await this.loadAll();
  }

}

