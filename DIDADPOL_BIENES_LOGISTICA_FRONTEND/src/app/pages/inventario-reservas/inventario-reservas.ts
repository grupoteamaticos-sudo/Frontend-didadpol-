import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';

import { InventarioApiService } from '../../shared/services/inventario-api.service';
import { ReservasService } from '../../shared/services/reservas.service';
import { BienesService } from '../../shared/services/bienes.service';

type Item = {
  id: string;
  code: string;
  name: string;
  unit: string;
  active: boolean;
};

type Warehouse = {
  id: string;
  name: string;
  active: boolean;
};

type ReservaLocal = {
  id_bodega: number;
  id_bien: number;
  cantidad: number;
  estado: string;
};

@Component({
  selector: 'app-inventario-reservas',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './inventario-reservas.html',
  styleUrl: './inventario-reservas.scss',
})
export class InventarioReservas implements OnInit {

  warehouses: Warehouse[] = [];
  items: Item[] = [];
  inventarioRaw: any[] = [];

  reservas: ReservaLocal[] = [];
  historial: any[] = [];

  selectedReserva: ReservaLocal | null = null;

  msg = '';
  err = '';

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private reservasService: ReservasService,
    private inventarioApi: InventarioApiService,
    private bienesService: BienesService
  ) {
    this.form = this.fb.group({
      warehouseId: ['', Validators.required],
      itemId: ['', Validators.required],
      qty: [1, [Validators.required, Validators.min(1)]],
      solicitante: ['', Validators.required],
      motivo: ['', Validators.required],
    });
  }

  async ngOnInit() {
    await this.refresh();
  }

  async refresh() {
    try {

      const data = await this.inventarioApi.obtenerInventario();
      this.inventarioRaw = data;

      const warehouseMap = new Map<string, Warehouse>();

      for (const i of data) {
        if (!warehouseMap.has(String(i.id_bodega))) {
          warehouseMap.set(String(i.id_bodega), {
            id: String(i.id_bodega),
            name: String(i.nombre_bodega),
            active: true
          });
        }
      }

      this.warehouses = Array.from(warehouseMap.values());

      const bienes = await this.bienesService.listar();

      this.items = bienes.map((b: any) => ({
        id: String(b.id_bien),
        code: b.codigo_inventario,
        name: b.nombre_bien,
        unit: 'UND',
        active: true
      }));

      const resp: any = await this.reservasService.listar();
      const lista = Array.isArray(resp?.data) ? resp.data : [];

      this.reservas = lista.map((r: any) => ({
        id_bodega: Number(r.id_bodega),
        id_bien: Number(r.id_bien),
        cantidad: Number(r.stock_reservado || r.cantidad || 0),
        estado: 'RESERVADA'
      }));

      const hist: any = await this.reservasService.listarHistorial();
      this.historial = Array.isArray(hist?.data) ? hist.data : [];

      if (this.selectedReserva) {
        const existe = this.reservas.find(r =>
          r.id_bodega === this.selectedReserva?.id_bodega &&
          r.id_bien === this.selectedReserva?.id_bien
        );
        if (!existe) this.selectedReserva = null;
      }

    } catch (error) {
      console.error(error);
      this.err = 'Error cargando datos';
    }
  }

  getWarehouseName(id: number): string {
    return this.warehouses.find(w => Number(w.id) === id)?.name || id.toString();
  }

  getItemName(id: number): string {
    return this.items.find(i => Number(i.id) === id)?.name || id.toString();
  }

  // 🔥 CORREGIDO
  stock(warehouseId: string, itemId: string): number {

    if (!warehouseId || !itemId) return 0;

    const item = this.inventarioRaw.find((i: any) =>
      Number(i.id_bodega) === Number(warehouseId) &&
      Number(i.id_bien) === Number(itemId)
    );

    if (!item) return 0;

    return Number(
      item.stock_disponible ??
      (Number(item.stock_actual || 0) - Number(item.stock_reservado || 0))
    );
  }

  selectedWarehouseId(): string {
    return this.form.get('warehouseId')?.value || '';
  }

  selectedItemId(): string {
    return this.form.get('itemId')?.value || '';
  }

  selectReserva(r: ReservaLocal) {
    this.selectedReserva = r;
  }

  async submit() {
    this.msg = '';
    this.err = '';

    if (this.form.invalid) {
      this.err = 'Completá los campos requeridos.';
      return;
    }

    const v = this.form.value;

    const body = {
      id_bodega: Number(v.warehouseId),
      id_bien: Number(v.itemId),
      id_bien_lote: null,
      cantidad: Number(v.qty)
    };

    try {
      await this.reservasService.reservar(body);
      this.msg = 'Reserva creada en backend ✅';
      this.form.patchValue({ qty: 1, motivo: '' });
      await this.refresh();
    } catch (error: any) {
      this.err = error?.error?.message || 'Error al crear reserva';
    }
  }

  async liberarSeleccionada() {
    if (!this.selectedReserva) return;

    const r = this.selectedReserva;

    try {
      await this.reservasService.liberar({
        id_bodega: r.id_bodega,
        id_bien: r.id_bien,
        cantidad: r.cantidad,
        id_bien_lote: null
      });

      this.msg = 'Reserva liberada ✅';
      await this.refresh();
    } catch (error: any) {
      this.err = error?.error?.message || 'Error al liberar';
    }
  }

  async consumirSeleccionada() {
    if (!this.selectedReserva) return;

    const r = this.selectedReserva;

    try {
      await this.reservasService.consumir({
        id_bodega: r.id_bodega,
        id_bien: r.id_bien,
        cantidad: r.cantidad,
        id_bien_lote: null
      });

      this.msg = 'Reserva consumida ✅';
      await this.refresh();
    } catch (error: any) {
      this.err = error?.error?.message || 'Error al consumir';
    }
  }
}
