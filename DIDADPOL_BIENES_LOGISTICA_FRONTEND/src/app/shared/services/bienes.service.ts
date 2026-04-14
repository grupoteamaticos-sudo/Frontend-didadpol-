import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

// =====================
// TIPOS EXISTENTES
// =====================
export type TipoRegistro = 'ALTA' | 'BAJA' | 'AJUSTE';

export type TipoBien =
  | 'EQUIPO'
  | 'MOBILIARIO'
  | 'HERRAMIENTA'
  | 'VEHICULO'
  | 'OTRO';

export interface Bien {
  id: string;
  codigo: string;
  nombre: string;
  tipo: TipoBien;
  stock: number;
  creadoAt: string;
}

export interface RegistroDetalle {
  bienId: string;
  codigo: string;
  nombre: string;
  tipo: TipoBien;
  cantidad: number;
  nota?: string;
}

export interface RegistroBienes {
  id: string;
  tipoRegistro: TipoRegistro;
  proveedor?: string;
  documento?: string;
  descripcion?: string;
  detalles: RegistroDetalle[];
  creadoAt: string;
  user: string;
}

// =====================
// BACKEND
// =====================
export interface BienApi {
  id_bien: number;
  codigo_inventario: string;
  nombre_bien: string;
}

const LS_BIENES = 'didadpol_bienes';
const LS_REGISTROS = 'didadpol_registro_bienes';

function uid(prefix = 'id') {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

@Injectable({ providedIn: 'root' })
export class BienesService {

  private baseUrl = 'http://localhost:8091/api/bienes';

  constructor(private http: HttpClient) {}

  // =============================
  // 🔥 CATÁLOGO REAL
  // =============================
  async listar(): Promise<BienApi[]> {
    const resp: any = await this.http.get(this.baseUrl).toPromise();
    return Array.isArray(resp?.data) ? resp.data : [];
  }

  // =============================
  // 🔥 NUEVO → REGISTRO EN BACKEND
  // =============================
/*  async registrarEnBackend(body: any): Promise<any> {
  const token = localStorage.getItem('didadpol_session')
    ? JSON.parse(localStorage.getItem('didadpol_session')!).accessToken
    : null;

  return this.http.post(
    `${this.baseUrl}/registro`,
    body,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  ).toPromise();
}*/

  async registrarEnBackend(body: any): Promise<any> {
  const token = this.getToken();

  const res: any = await this.http.post(
    `${this.baseUrl}/registro`,
    body,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  ).toPromise();

  return res; // 🔥 asegurar retorno
}

private getToken(): string | null {
  try {
    const raw = localStorage.getItem('didadpol_session');
    return raw ? JSON.parse(raw).accessToken : null;
  } catch {
    return null;
  }
}

  // =============================
  // CREAR BIEN
  // =============================

  async crearBien(body: any): Promise<any> {
  const token = this.getToken();

  return this.http.post(
    `${this.baseUrl}/crear`,
    body,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  ).toPromise();
}

  // =============================
  // TIPOS
  // =============================
  listTiposBien(): TipoBien[] {
    return ['EQUIPO', 'MOBILIARIO', 'HERRAMIENTA', 'VEHICULO', 'OTRO'];
  }

  listTiposRegistro(): TipoRegistro[] {
    return ['ALTA', 'BAJA', 'AJUSTE'];
  }

  // =============================
  // (SE MANTIENE PARA NO ROMPER)
  // =============================
  listBienes(): Bien[] {
    return this.readJson<Bien[]>(LS_BIENES, []);
  }

  private saveBienes(b: Bien[]) {
    localStorage.setItem(LS_BIENES, JSON.stringify(b));
  }

  upsertBienByCodigo(input: {
    codigo: string;
    nombre: string;
    tipo: TipoBien;
    delta: number;
  }): Bien {
    const bienes = this.listBienes();
    const codigo = (input.codigo ?? '').trim();
    const nombre = (input.nombre ?? '').trim();

    let bien = bienes.find(x => x.codigo.toLowerCase() === codigo.toLowerCase());

    if (!bien) {
      bien = {
        id: uid('bien'),
        codigo,
        nombre,
        tipo: input.tipo,
        stock: 0,
        creadoAt: new Date().toISOString(),
      };
      bienes.unshift(bien);
    } else {
      if (nombre) bien.nombre = nombre;
      if (input.tipo) bien.tipo = input.tipo;
    }

    bien.stock = Math.max(0, Number(bien.stock || 0) + Number(input.delta || 0));
    this.saveBienes(bienes);
    return bien;
  }

  listRegistros(): RegistroBienes[] {
    return this.readJson<RegistroBienes[]>(LS_REGISTROS, []);
  }

  private saveRegistros(r: RegistroBienes[]) {
    localStorage.setItem(LS_REGISTROS, JSON.stringify(r));
  }

  private readJson<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  }
}
