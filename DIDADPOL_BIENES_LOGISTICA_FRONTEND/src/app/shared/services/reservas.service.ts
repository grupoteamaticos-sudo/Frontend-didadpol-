import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReservasService {

  private apiUrl = `${environment.apiUrl}/reservas`;

  constructor(private http: HttpClient) {}

  // ✔ CREAR
  reservar(data: any) {
    return this.http.post(this.apiUrl, data).toPromise();
  }

  // ✔ LIBERAR
  liberar(data: any) {
    return this.http.patch(`${this.apiUrl}/liberar`, data).toPromise();
  }

  // ✔ CONSUMIR
  consumir(data: any) {
    return this.http.patch(`${this.apiUrl}/consumir`, data).toPromise();
  }

  // ✔ LISTAR ACTUAL (inventario)
  listar() {
    return this.http.get(this.apiUrl).toPromise();
  }

  // 🔥 HISTORIAL
  listarHistorial(): Promise<any> {
    return this.http.get(`${this.apiUrl}/historial`).toPromise();
  }
}
