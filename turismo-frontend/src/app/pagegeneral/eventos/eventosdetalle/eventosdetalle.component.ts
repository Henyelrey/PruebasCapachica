import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EventosService, Slider } from '../evento.service';       
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-eventosdetalle',  // Cambiado para que sea acorde
  templateUrl: './eventosdetalle.component.html',  // Cambiado para que coincida con el nuevo nombre
  styleUrls: ['./eventosdetalle.component.css'] ,
    imports: [CommonModule], // Cambiado para que coincida con el nuevo nombre
})
export class EventosdetalleComponent implements OnInit {


  evento: any = null;
  isLoading: boolean = true;
  errorMessage: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventosService: EventosService
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.eventosService.obtenerEvento(+id).subscribe((res) => {
        if (res.success) this.evento = res.data;
      });
    }
  }

  
  cargarDetalleEvento(id: number): void {
  this.isLoading = true;
  this.errorMessage = null;

  this.eventosService.getEventoById(id).subscribe({
    next: (evento) => {
      this.evento = evento;
      this.isLoading = false;

      if (!this.evento) {
        this.errorMessage = 'Evento no encontrado.';
      }
    },
    error: (err) => {
      this.errorMessage = 'Error al cargar el evento.';
      this.isLoading = false;
      console.error(err);
    }
  });
}


  private showErrorAndRedirect(message: string): void {
    this.errorMessage = message;
    this.isLoading = false;
    console.error(message);
  }

  regresarAListado(): void {
    this.router.navigate(['/eventos']);
  }
  getSliderUrlPorOrden(orden: number): string {
  return this.evento?.sliders?.find((s: Slider) => s.orden === orden)?.url_completa || 'ruta/por/defecto.jpg';
}
get imagenesSecundarias(): Slider[] {
  return this.evento?.sliders?.filter((s: Slider) => s.orden > 1) || [];
}




}
