import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { firstValueFrom } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class InventarioApiService {

  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {}

  private getHeaders() {
    const token = this.auth.getAccessToken();
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      })
    };
  }

  async obtenerInventario(): Promise<any[]> {
    try {
      const res: any = await firstValueFrom(
        this.http.get(`${this.apiUrl}/inventario`, this.getHeaders())
      );

      if (res?.ok && Array.isArray(res.data)) return res.data;
      if (Array.isArray(res)) return res;
      if (Array.isArray(res?.rows)) return res.rows;

      return [];

    } catch (error: any) {
      console.error('❌ Error inventario API:', error);
      throw new Error(
        error?.error?.message ||
        'Error al obtener inventario'
      );
    }
  }
}
