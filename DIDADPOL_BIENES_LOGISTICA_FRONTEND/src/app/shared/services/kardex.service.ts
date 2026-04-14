import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class KardexService {

  private apiUrl = `${environment.apiUrl}/kardex`;

  constructor(private http: HttpClient) {}

  listar(params?: { id_bodega?: number; id_bien?: number }) {
    return this.http.get(this.apiUrl, { params: params as any }).toPromise();
  }
}
