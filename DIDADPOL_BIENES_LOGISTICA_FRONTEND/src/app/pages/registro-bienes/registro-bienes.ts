import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import {
  BienesService,
  TipoBien,
  TipoRegistro,
} from '../../shared/services/bienes.service';

import { AuthService } from '../../shared/services/auth.service';
import { InventarioApiService } from '../../shared/services/inventario-api.service';

type Warehouse = {
  id: string;
  name: string;
};

type BienApi = {
  id_bien: number;
  codigo_inventario: string;
  nombre_bien: string;
};

@Component({
  selector: 'app-registro-bienes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './registro-bienes.html',
  styleUrl: './registro-bienes.scss',
})
export class RegistroBienesPage implements OnInit {

  msg = '';
  err = '';

  tiposRegistro: TipoRegistro[] = [];
  tiposBien: TipoBien[] = [];

  warehouses: Warehouse[] = [];
  catalogoBienes: BienApi[] = [];

  form!: FormGroup;

  // 🔥 NUEVO BIEN
  nuevoBien: any = {
    codigo_inventario: '',
    nombre_bien: '',
    marca: '',
    modelo: '',
    valor_unitario: 0
  };

  constructor(
    private fb: FormBuilder,
    private bienes: BienesService,
    private auth: AuthService,
    private inventarioApi: InventarioApiService
  ) {
    this.tiposRegistro = this.bienes.listTiposRegistro();
    this.tiposBien = this.bienes.listTiposBien();

    this.form = this.fb.group({
      tipoRegistro: ['ALTA', Validators.required],
      proveedor: [''],
      documento: [''],
      descripcion: [''],
      id_bodega: ['', Validators.required],
      detalles: this.fb.array([]),
    });

    this.addDetalle();
  }

  async ngOnInit(): Promise<void> {
    await this.cargarBodegas();
    await this.cargarBienes();
  }

  async cargarBodegas(): Promise<void> {
    try {
      const data = await this.inventarioApi.obtenerInventario();

      const map = new Map<string, Warehouse>();

      for (const i of data) {
        if (!map.has(String(i.id_bodega))) {
          map.set(String(i.id_bodega), {
            id: String(i.id_bodega),
            name: i.nombre_bodega
          });
        }
      }

      this.warehouses = Array.from(map.values());

    } catch (e) {
      console.error(e);
    }
  }

  async cargarBienes(): Promise<void> {
    try {
      this.catalogoBienes = await this.bienes.listar();
    } catch (e) {
      console.error(e);
    }
  }

  // =============================
  // FORM ARRAY
  // =============================
  get detallesFA(): FormArray {
    return this.form.get('detalles') as FormArray;
  }

  detalleFG(i: number): FormGroup {
    return this.detallesFA.at(i) as FormGroup;
  }

  addDetalle(): void {
    this.detallesFA.push(
      this.fb.group({
        codigo: ['', Validators.required],
        nombre: ['', Validators.required],
        tipo: ['EQUIPO' as TipoBien, Validators.required],
        cantidad: [1, [Validators.required, Validators.min(1)]],
        nota: [''],
      })
    );
  }

  removeDetalle(i: number): void {
    if (this.detallesFA.length <= 1) return;
    this.detallesFA.removeAt(i);
  }

  // =============================
  // AUTOCOMPLETE BIEN
  // =============================
  onSelectBien(event: Event, index: number): void {
    const select = event.target as HTMLSelectElement;
    const id = select.value;

    const bien = this.catalogoBienes.find(
      (b) => String(b.id_bien) === id
    );

    if (!bien) return;

    this.detalleFG(index).patchValue({
      codigo: bien.codigo_inventario,
      nombre: bien.nombre_bien
    });
  }

  // =============================
  // SUBMIT
  // =============================
  submit(): void {
    this.msg = '';
    this.err = '';

    if (this.form.invalid) {
      this.err = 'Completá los campos requeridos.';
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.value;

    for (const d of v.detalles || []) {
      if (!d.codigo) {
        this.err = 'Debe seleccionar un bien válido en todos los detalles';
        return;
      }
    }

    const user = this.auth.getUser()?.username || 'admin';

    const payload = {
      tipo_registro: v.tipoRegistro,
      proveedor: v.proveedor,
      documento: v.documento,
      descripcion: v.descripcion,
      usuario: user,
      id_bodega: Number(v.id_bodega),
      detalles: (v.detalles || []).map((d: any) => ({
        codigo_inventario: d.codigo,
        cantidad: Number(d.cantidad)
      }))
    };

    this.registrarBackend(payload);
  }

  async registrarBackend(body: any): Promise<void> {
    try {
      const res = await this.bienes.registrarEnBackend(body);

      if (!res || res.ok === false) {
        throw new Error(res?.message || 'Error en registro');
      }

      this.msg = 'Registro guardado correctamente';

      this.form.reset({
        tipoRegistro: 'ALTA',
        id_bodega: ''
      });

      this.detallesFA.clear();
      this.addDetalle();

    } catch (e: any) {
      console.error(e);
      this.err = e?.message || 'Error inesperado';
    }
  }

  // =============================
  // CREAR BIEN (NUEVO CUADRO)
  // =============================
  async guardarBien(): Promise<void> {
    try {
      const res = await fetch('http://localhost:8091/api/bienes/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.nuevoBien)
      });

      const data = await res.json();

      if (!data.ok) {
        throw new Error(data.message);
      }

      this.msg = 'Bien creado correctamente';

      await this.cargarBienes();

      this.nuevoBien = {
        codigo_inventario: '',
        nombre_bien: '',
        marca: '',
        modelo: '',
        valor_unitario: 0
      };

    } catch (e: any) {
      console.error(e);
      this.err = e?.message || 'Error al crear bien';
    }
  }
}
