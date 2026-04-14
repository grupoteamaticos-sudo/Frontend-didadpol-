import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

// layout principal
import { Layout } from './shared/layout/layout';

// páginas principales
import { Login } from './pages/login/login';
import { DashboardComponent } from './pages/dashboard/dashboard';

// seguridad

import { Seguridad } from './pages/seguridad/seguridad';
import { SegUsuarios } from './pages/seguridad/usuarios/usuarios';
import { SegEmpleados } from './pages/seguridad/empleados/empleados';
import { SegRoles } from './pages/seguridad/roles/roles';
import { SegPermisos } from './pages/seguridad/permisos/permisos';
import { SegPerfil } from './pages/seguridad/perfil/perfil';
import { SegBitacora } from './pages/seguridad/bitacora/bitacora';
import { SegPersonas } from './pages/seguridad/personas/personas';

// módulos de bienes/logística
import { RegistroBienesPage } from './pages/registro-bienes/registro-bienes';
import { InventarioReservas } from './pages/inventario-reservas/inventario-reservas';
import { SolicitudesLogistica } from './pages/solicitudes-logistica/solicitudes-logistica';
import { AsignacionBienes } from './pages/asignacion-bienes/asignacion-bienes';
import { Mantenimiento } from './pages/mantenimiento/mantenimiento';
import { CatalogosMaestros } from './pages/catalogos-maestros/catalogos-maestros';

// otras páginas
import { Rendicion } from './pages/rendicion/rendicion';
import { Sobre } from './pages/sobre/sobre';
import { Transparencia } from './pages/transparencia/transparencia';

export const routes: Routes = [
  // login público
  {
    path: 'login',
    component: Login,
  },

  // layout protegido
  {
    path: '',
    component: Layout,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },

      // dashboard
      { path: 'dashboard', component: DashboardComponent },

      // ================================
      // SEGURIDAD
      // ================================
      {
        path: 'seguridad',
        component: Seguridad,
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'usuarios' },
          {path: 'personas', component: SegPersonas},
          { path: 'usuarios', component: SegUsuarios },
          { path: 'empleados', component: SegEmpleados },
          { path: 'roles', component: SegRoles },
          { path: 'permisos', component: SegPermisos },
          { path: 'perfil', component: SegPerfil },
          { path: 'bitacora', component: SegBitacora },
        ],
      },

      // ================================
      // BIENES / LOGÍSTICA
      // ================================
      { path: 'registro-bienes', component: RegistroBienesPage },
      { path: 'inventario-reservas', component: InventarioReservas },

      // 🔥 NUEVA RUTA KARDEX (AGREGADA)
      {
        path: 'movimientos-kardex',
        loadComponent: () =>
          import('./pages/movimientos-kardex/movimientos-kardex')
            .then(m => m.MovimientosKardex)
      },

      { path: 'solicitudes-logistica', component: SolicitudesLogistica },
      { path: 'asignacion-bienes', component: AsignacionBienes },
      { path: 'mantenimiento', component: Mantenimiento },
      { path: 'catalogos-maestros', component: CatalogosMaestros },

      // ================================
      // OTROS
      // ================================
      { path: 'rendicion', component: Rendicion },
      { path: 'sobre', component: Sobre },
      { path: 'transparencia', component: Transparencia },
    ],
  },

  // fallback
  {
    path: '**',
    redirectTo: 'login',
  },
];
