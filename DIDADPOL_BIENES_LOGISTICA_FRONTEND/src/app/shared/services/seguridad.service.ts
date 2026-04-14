import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

// =========================
// TYPES
// =========================
export type Permiso = {
  id: string;
  code: string;
  name: string;
};

export type Rol = {
  id: string;
  name: string;
  description: string;
  activo: boolean;
  permisos: string[];
};

export type Usuario = {
  id: string;
  idEmpleado: string;
  username: string;
  email: string;
  activo: boolean;
  bloqueado: boolean;
  roles: { id: string; name: string }[];
};

@Injectable({ providedIn: 'root' })
export class SeguridadService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private auth: AuthService) {}

  private headers(): HttpHeaders {
    const token = this.auth.getAccessToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  // =========================
  // ROLES
  // =========================
  async listRoles(): Promise<Rol[]> {
    const res: any = await firstValueFrom(
      this.http.get(`${this.apiUrl}/roles`, { headers: this.headers() })
    );

    const data = res?.roles || [];

    return data.map((r: any) => ({
      id: String(r.id_rol),
      name: r.nombre_rol,
      description: r.descripcion_rol || '',
      activo: r.estado_rol === 'ACTIVO',
      permisos: Array.isArray(r.permisos)
        ? r.permisos.map((p: any) => String(p.id_permiso))
        : [],
    }));
  }

  async createRol(nombre: string, descripcion: string = '') {
    return await firstValueFrom(
      this.http.post(
        `${this.apiUrl}/roles`,
        {
          nombre_rol: nombre.trim(),
          descripcion_rol: descripcion.trim(),
        },
        { headers: this.headers() }
      )
    );
  }

  async deleteRol(id: string) {
    return await firstValueFrom(
      this.http.delete(`${this.apiUrl}/roles/${id}`, {
        headers: this.headers(),
      })
    );
  }

  async addPermisoToRol(roleId: string, permisoId: string) {
    return await firstValueFrom(
      this.http.post(
        `${this.apiUrl}/roles/${roleId}/permisos`,
        { id_permiso: Number(permisoId) },
        { headers: this.headers() }
      )
    );
  }

  async removePermisoFromRol(roleId: string, permisoId: string) {
    return await firstValueFrom(
      this.http.delete(`${this.apiUrl}/roles/${roleId}/permisos`, {
        headers: this.headers(),
        body: { id_permiso: Number(permisoId) },
      })
    );
  }

  // =========================
  // PERMISOS
  // =========================
  async listPermisos(): Promise<Permiso[]> {
    const res: any = await firstValueFrom(
      this.http.get(`${this.apiUrl}/permisos`, {
        headers: this.headers(),
      })
    );

    const data = res?.permisos || [];

    return data.map((p: any) => ({
      id: String(p.id_permiso),
      code: p.codigo_permiso,
      name: p.nombre_permiso,
    }));
  }

  async createPermiso(data: {
    code: string;
    name: string;
    description?: string;
  }) {
    return await firstValueFrom(
      this.http.post(
        `${this.apiUrl}/permisos`,
        {
          codigo_permiso: data.code,
          nombre_permiso: data.name,
          descripcion_permiso: data.description || '',
        },
        { headers: this.headers() }
      )
    );
  }

  async deletePermiso(id: string) {
    return await firstValueFrom(
      this.http.delete(`${this.apiUrl}/permisos/${id}`, {
        headers: this.headers(),
      })
    );
  }

  // =========================
  // USUARIOS
  // =========================
  async listUsuarios(): Promise<any[]> {
  const res: any = await firstValueFrom(
    this.http.get(`${this.apiUrl}/usuarios`, {
      headers: this.headers(),
    })
  );

  const data = res?.data || [];

  return data.map((u: any) => ({
    id: String(u.id_usuario),
    id_usuario: String(u.id_usuario),

    idEmpleado: String(u.id_empleado),
    id_empleado: String(u.id_empleado),

    username: u.nombre_usuario,
    nombre_usuario: u.nombre_usuario,

    email: u.correo_login,
    correo_login: u.correo_login,

    activo: u.estado_usuario === 'ACTIVO',
    bloqueado: !!u.bloqueado,

    roles: Array.isArray(u.roles)
      ? u.roles.map((r: any) => ({
          id: String(r.id_rol),
          name: r.nombre_rol
        }))
      : [],
  }));
}

  async createUsuario(u: any) {
    return await firstValueFrom(
      this.http.post(
        `${this.apiUrl}/usuarios`,
        {
          id_empleado: Number(u.idEmpleado),
          nombre_usuario: u.username,
          correo_login: u.email,
          password: u.password,
          id_rol: Number(u.roleId),
        },
        { headers: this.headers() }
      )
    );
  }

  async toggleActivo(id: string) {
    return await firstValueFrom(
      this.http.patch(`${this.apiUrl}/usuarios/${id}/bloqueo`, {}, {
        headers: this.headers(),
      })
    );
  }

  async deleteUsuario(id: string) {
    return await firstValueFrom(
      this.http.patch(`${this.apiUrl}/usuarios/${id}/inactivar`, {}, {
        headers: this.headers(),
      })
    );
  }

  // =========================
  // EMPLEADOS
  // =========================
  async listEmpleados(): Promise<any[]> {
    const res: any = await firstValueFrom(
      this.http.get(`${this.apiUrl}/empleados`, {
        headers: this.headers(),
      })
    );

    return res?.data || [];
  }

  async createEmpleado(data: any) {
    return await firstValueFrom(
      this.http.post(`${this.apiUrl}/empleados`, data, {
        headers: this.headers(),
      })
    );
  }

  // =========================
  // PERSONAS
  // =========================
  async listPersonas(): Promise<any[]> {
    const res: any = await firstValueFrom(
      this.http.get(`${this.apiUrl}/personas`, {
        headers: this.headers(),
      })
    );

    return res?.data || [];
  }

  async createPersona(data: any) {
    return await firstValueFrom(
      this.http.post(`${this.apiUrl}/personas`, data, {
        headers: this.headers(),
      })
    );
  }

  // =========================
// PERMISOS POR USUARIO
// =========================

async getPermisosUsuario(userId: string) {
  const res: any = await firstValueFrom(
    this.http.get(`${this.apiUrl}/usuarios/${userId}/permisos`, {
      headers: this.headers(),
    })
  );

  return res?.permisos || [];
}

async addPermisoToUsuario(userId: string, permisoId: string) {
  return await firstValueFrom(
    this.http.post(
      `${this.apiUrl}/usuarios/${userId}/permisos`,
      { id_permiso: Number(permisoId) },
      { headers: this.headers() }
    )
  );
}

async removePermisoFromUsuario(userId: string, permisoId: string) {
  return await firstValueFrom(
    this.http.delete(
      `${this.apiUrl}/usuarios/${userId}/permisos`,
      {
        headers: this.headers(),
        body: { id_permiso: Number(permisoId) }
      }
    )
  );
}

  // =========================
  // CATÁLOGOS
  // =========================
  async listDepartamentos(): Promise<any[]> {
    const res: any = await firstValueFrom(
      this.http.get(`${this.apiUrl}/catalogos/departamentos`, {
        headers: this.headers(),
      })
    );
    return res?.data || [];
  }

  async listPuestos(): Promise<any[]> {
    const res: any = await firstValueFrom(
      this.http.get(`${this.apiUrl}/catalogos/puestos`, {
        headers: this.headers(),
      })
    );
    return res?.data || [];
  }

  async listSucursales(): Promise<any[]> {
    const res: any = await firstValueFrom(
      this.http.get(`${this.apiUrl}/catalogos/sucursales`, {
        headers: this.headers(),
      })
    );
    return res?.data || [];
  }

  async getPerfilUsuario(id: string) {
    const res: any = await firstValueFrom(
      this.http.get(`${this.apiUrl}/usuarios/${id}/perfil`, {
        headers: this.headers(),
      })
    );

    console.log('RESPUESTA BACKEND:', res);

    return res?.perfil;
  }


}

