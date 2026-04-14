import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SeguridadService } from '../../../shared/services/seguridad.service';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-seg-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './perfil.html',
  styleUrl: './perfil.scss',
})
export class SegPerfil implements OnInit {

  usuarios: any[] = [];
  usuarioSeleccionado: string = '';
  perfil: any = null;

  loading = false;
  err = '';

  constructor(
    private seg: SeguridadService,
    private cdr: ChangeDetectorRef) {}

  async ngOnInit() {
    await this.loadUsuarios();
  }

  async loadUsuarios() {
    try {
      this.usuarios = await this.seg.listUsuarios();
    } catch (e) {
      this.err = 'Error cargando usuarios';
    }
  }

  async buscar() {
    if (!this.usuarioSeleccionado) return;

    this.loading = true;
    this.err = '';
    this.perfil = null;

    try {
      const data = await this.seg.getPerfilUsuario(this.usuarioSeleccionado);

      console.log('PERFIL:', data);

      this.perfil = data;

      this.cdr.detectChanges(); // 👈 CLAVE

    } catch (e) {
      this.err = 'No se pudo obtener el perfil';
    } finally {
      this.loading = false;
    }
  }
}
