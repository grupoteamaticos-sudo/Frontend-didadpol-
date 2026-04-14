import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-solicitudes-logistica',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './solicitudes-logistica.html',
  styleUrls: ['./solicitudes-logistica.scss']
})
export class SolicitudesLogistica {

  // Opciones basadas en tu diagrama
  tiposMovimiento = ['Asignación Inicial', 'Reasignación', 'Traslado de Bodega', 'Baja de Bien'];

  solicitudes = [
    { id: 'SOL-101', bien: 'Camioneta Toyota Hilux', tipo: 'Reasignación', solicitante: 'Jefatura de Bienes', fecha: '2026-04-12', estado: 'Pendiente' },
    { id: 'SOL-102', bien: 'Laptop Dell Latitude', tipo: 'Asignación Inicial', solicitante: 'Dpto. Logística', fecha: '2026-04-11', estado: 'Aprobado' }
  ];

  nuevaSol = {
    bien: '',
    tipo: '',
    motivo: '',
    ubicacionDestino: '',
    prioridad: 'Normal'
  };

  enviarSolicitud() {
    if (this.nuevaSol.bien && this.nuevaSol.tipo) {
      const id = `SOL-${Math.floor(Math.random() * 900) + 100}`;
      this.solicitudes.unshift({
        id: id,
        bien: this.nuevaSol.bien,
        tipo: this.nuevaSol.tipo,
        solicitante: 'Usuario Actual', // Esto vendría del login
        fecha: new Date().toLocaleDateString(),
        estado: 'Pendiente'
      });
      alert('Solicitud enviada al Departamento de Logística');
      this.limpiarForm();
    }
  }

  limpiarForm() {
    this.nuevaSol = { bien: '', tipo: '', motivo: '', ubicacionDestino: '', prioridad: 'Normal' };
  }
}
