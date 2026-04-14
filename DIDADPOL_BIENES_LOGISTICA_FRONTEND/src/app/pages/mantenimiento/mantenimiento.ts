import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-mantenimiento',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mantenimiento.html',
  styleUrls: ['./mantenimiento.scss']
})
export class Mantenimiento {

  bienes = ['Vehículo Toyota Hilux', 'Portátil Dell XPS', 'Impresora Industrial'];
  proveedores = ['Proveedor A', 'Proveedor B', 'Proveedor C'];

  // Aquí se almacenarán los registros que aparecerán en la tabla
  lista: any[] = [
    { id: 'MNT-001', bien: 'Vehículo Toyota Hilux', encargado: 'Juan Pérez', estado: 'finalizado', fecha: '2026-04-10', costo: 1500 },
    { id: 'MNT-002', bien: 'Portátil Dell XPS', encargado: 'María López', estado: 'proceso', fecha: '2026-04-12', costo: 500 }
  ];

  form = {
    bien: '',
    tipo: '',
    proveedor: '',
    fecha: '',
    km: 0,
    costo: 0,
    estado: 'programado',
    descripcion: '',
    observaciones: ''
  };

  guardar() {
    if (this.form.bien) {
      const nuevoId = `MNT-00${this.lista.length + 1}`;
      this.lista.push({
        id: nuevoId,
        bien: this.form.bien,
        encargado: this.form.proveedor || 'No asignado',
        estado: this.form.estado,
        fecha: this.form.fecha,
        costo: this.form.costo
      });
      alert('Mantenimiento registrado con éxito');
      this.cancelar();
    }
  }

  cancelar() {
    this.form = { bien: '', tipo: '', proveedor: '', fecha: '', km: 0, costo: 0, estado: 'programado', descripcion: '', observaciones: '' };
  }
}
