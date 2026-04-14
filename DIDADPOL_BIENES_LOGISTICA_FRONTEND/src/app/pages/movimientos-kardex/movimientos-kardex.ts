import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { KardexService } from '../../shared/services/kardex.service';
import { InventarioApiService } from '../../shared/services/inventario-api.service';
import { BienesService } from '../../shared/services/bienes.service';

type Item = {
  id: string;
  code: string;
  name: string;
};

type Warehouse = {
  id: string;
  name: string;
};

export type KardexRow = {
  fecha: string;
  tipo: string;
  id_bodega: number;
  id_bien: number;
  entrada: number;
  salida: number;
  saldo: number;
  usuario?: string;
};

@Component({
  selector: 'app-movimientos-kardex',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './movimientos-kardex.html',
  styleUrl: './movimientos-kardex.scss',
})
export class MovimientosKardex implements OnInit {

  warehouses: Warehouse[] = [];
  items: Item[] = [];
  kardex: KardexRow[] = [];

  fText = '';
  fType: string = 'TODOS';
  fWarehouseId = 'TODOS';

  msg = '';
  err = '';

  constructor(
    private kardexService: KardexService,
    private inventarioApi: InventarioApiService,
    private bienesService: BienesService
  ) {}

  async ngOnInit() {
    await this.refresh();
  }

  async refresh() {
    this.msg = '';
    this.err = '';

    try {
      // =============================
      // BODEGAS (inventario)
      // =============================
      const data: any[] = await this.inventarioApi.obtenerInventario();

      const wMap = new Map<string, Warehouse>();

      for (const i of data) {
        if (!wMap.has(String(i.id_bodega))) {
          wMap.set(String(i.id_bodega), {
            id: String(i.id_bodega),
            name: i.nombre_bodega
          });
        }
      }

      this.warehouses = Array.from(wMap.values());

      // =============================
      // 🔥 BIENES (CATÁLOGO REAL)
      // =============================
      const bienes = await this.bienesService.listar();

      this.items = bienes.map((b: any) => ({
        id: String(b.id_bien),
        code: b.codigo_inventario,
        name: b.nombre_bien
      }));

      // =============================
      // KARDEX
      // =============================
      const resp: any = await this.kardexService.listar();
      const lista = Array.isArray(resp?.data) ? resp.data : [];

      this.kardex = lista.map((k: any) => ({
        fecha: k.fecha,
        tipo: k.tipo,
        id_bodega: Number(k.id_bodega),
        id_bien: Number(k.id_bien),
        entrada: Number(k.entrada),
        salida: Number(k.salida),
        saldo: Number(k.saldo),
        usuario: k.usuario
      }));

      this.kardex.sort((a, b) =>
        new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
      );

    } catch (error: any) {
      console.error(error);
      this.err = 'Error cargando kardex';
    }
  }

  itemName(id: number) {
    return this.items.find(i => Number(i.id) === id)?.name || '—';
  }

  itemCode(id: number) {
    return this.items.find(i => Number(i.id) === id)?.code || '—';
  }

  warehouseName(id?: number) {
    if (!id) return '—';
    return this.warehouses.find(w => Number(w.id) === id)?.name || '—';
  }

  filtered(): KardexRow[] {
    const txt = this.fText.trim().toLowerCase();

    return this.kardex.filter(k => {

      if (this.fType !== 'TODOS' && k.tipo !== this.fType) return false;

      if (this.fWarehouseId !== 'TODOS') {
        if (String(k.id_bodega) !== this.fWarehouseId) return false;
      }

      if (txt) {
        const hay = `${k.tipo} ${this.itemName(k.id_bien)} ${k.usuario || ''}`
          .toLowerCase();

        if (!hay.includes(txt)) return false;
      }

      return true;
    });
  }
}
