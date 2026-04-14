import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-catalogos-maestros',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './catalogos-maestros.html',
  styleUrl: './catalogos-maestros.scss',
})
export class CatalogosMaestros {

  // 🔹 Catálogo seleccionado
  catalogoSeleccionado: string = 'tipo_bien';

  // 🔹 Datos simulados
  catalogos: any = {
    tipo_bien: [
      { id: 1, nombre: 'Laptop' },
      { id: 2, nombre: 'Impresora' }
    ],
    departamento: [
      { id: 1, nombre: 'TI' },
      { id: 2, nombre: 'Logística' }
    ]
  };

  nuevoNombre: string = '';

  get listaActual() {
    return this.catalogos[this.catalogoSeleccionado];
  }

  agregar() {
    if (!this.nuevoNombre) {
      alert('Ingrese nombre');
      return;
    }

    this.listaActual.push({
      id: Date.now(),
      nombre: this.nuevoNombre
    });

    this.nuevoNombre = '';
  }

  eliminar(id: number) {
    this.catalogos[this.catalogoSeleccionado] =
      this.listaActual.filter((x: any) => x.id !== id);
  }
}
