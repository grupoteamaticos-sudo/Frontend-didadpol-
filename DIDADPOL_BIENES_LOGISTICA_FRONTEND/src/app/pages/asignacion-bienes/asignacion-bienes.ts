import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-asignacion-bienes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './asignacion-bienes.html',
  styleUrl: './asignacion-bienes.scss',
})
export class AsignacionBienes implements OnInit {

  empleados: any[] = [
    { id_empleado: 1, primer_nombre: 'Juan', primer_apellido: 'Pérez' },
    { id_empleado: 2, primer_nombre: 'María', primer_apellido: 'López' }
  ];

  bienes: any[] = [
    { id_bien_item: 1, nombre_bien: 'Laptop Dell' },
    { id_bien_item: 2, nombre_bien: 'Impresora HP' }
  ];

  asignaciones: any[] = [];

  empleadoSeleccionado: number | null = null;
  bienSeleccionado: number | null = null;
  observaciones: string = '';

  ngOnInit(): void {}

  asignarBien() {

    const empleado = this.empleados.find(e => e.id_empleado == this.empleadoSeleccionado);
    const bien = this.bienes.find(b => b.id_bien_item == this.bienSeleccionado);

    if (!empleado || !bien) {
      alert('Selecciona empleado y bien');
      return;
    }

    this.asignaciones.push({
      empleado: empleado.primer_nombre + ' ' + empleado.primer_apellido,
      bien: bien.nombre_bien,
      observaciones: this.observaciones
    });

    this.limpiar();
  }

  limpiar() {
    this.empleadoSeleccionado = null;
    this.bienSeleccionado = null;
    this.observaciones = '';
  }
}
