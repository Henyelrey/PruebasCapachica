import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pagos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8">
      <div class="container mx-auto px-4">
        
        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Proceso de Pago
          </h1>
          <p class="text-gray-600 dark:text-gray-400">
            Completa tu reserva de manera segura
          </p>
        </div>

        <!-- Yape Payment -->
        <div *ngIf="metodoPago === 'yape'" class="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          <div class="bg-purple-600 text-white p-6 text-center">
            <div class="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="text-3xl">💜</span>
            </div>
            <h2 class="text-2xl font-bold">Pagar con Yape</h2>
            <p class="text-purple-100 mt-2">Escanea el código QR</p>
          </div>
          
          <div class="p-6">
            <!-- QR Code simulado -->
            <div class="bg-gray-100 dark:bg-gray-700 aspect-square rounded-xl flex items-center justify-center mb-6">
              <div class="text-center">
                <div class="w-48 h-48 bg-white rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center mb-4">
                  <svg class="w-24 h-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h2M4 4h4m12 0h4M4 20h4m12 0h4"/>
                  </svg>
                </div>
                <p class="text-sm text-gray-500 dark:text-gray-400">Código QR de pago</p>
              </div>
            </div>

            <div class="space-y-4">
              <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div class="flex justify-between items-center">
                  <span class="text-gray-600 dark:text-gray-400">Monto a pagar:</span>
                  <span class="font-semibold text-lg dark:text-white">S/. {{montoSimulado}}</span>
                </div>
              </div>

              <div class="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                <h3 class="font-semibold text-purple-800 dark:text-purple-300 mb-2">Instrucciones:</h3>
                <ol class="text-sm text-purple-700 dark:text-purple-400 space-y-1">
                  <li>1. Abre tu app de Yape</li>
                  <li>2. Selecciona "Escanear QR"</li>
                  <li>3. Escanea el código mostrado</li>
                  <li>4. Confirma el pago en tu app</li>
                </ol>
              </div>

              <div class="flex space-x-3">
                <button (click)="simularPagoExitoso()" 
                        class="flex-1 bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors">
                  ✓ Simular pago exitoso
                </button>
                <button (click)="volverAReservas()" 
                        class="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:text-white dark:hover:bg-gray-700 transition-colors">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Visa/Mastercard Payment -->
        <div *ngIf="metodoPago === 'visa' || metodoPago === 'mastercard'" 
             class="max-w-lg mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          
          <div [class]="metodoPago === 'visa' ? 'bg-blue-600' : 'bg-red-600'" 
               class="text-white p-6 text-center">
            <div class="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="text-3xl">💳</span>
            </div>
            <h2 class="text-2xl font-bold">
              Pagar con {{metodoPago === 'visa' ? 'Visa' : 'Mastercard'}}
            </h2>
            <p class="text-blue-100 mt-2">Ingresa los datos de tu tarjeta</p>
          </div>

          <div class="p-6">
            <form class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Número de tarjeta
                </label>
                <input type="text" 
                       [(ngModel)]="datosTarjeta.numero" 
                       name="numero"
                       placeholder="1234 5678 9012 3456" 
                       maxlength="19"
                       (input)="formatearNumeroTarjeta($event)"
                       class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Fecha de expiración
                  </label>
                  <input type="text" 
                         [(ngModel)]="datosTarjeta.expiracion" 
                         name="expiracion"
                         placeholder="MM/AA" 
                         maxlength="5"
                         (input)="formatearExpiracion($event)"
                         class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    CVV
                  </label>
                  <input type="text" 
                         [(ngModel)]="datosTarjeta.cvv" 
                         name="cvv"
                         placeholder="123" 
                         maxlength="3"
                         class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nombre del titular
                </label>
                <input type="text" 
                       [(ngModel)]="datosTarjeta.titular" 
                       name="titular"
                       placeholder="JUAN PÉREZ" 
                       class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              </div>

              <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div class="flex justify-between items-center">
                  <span class="text-gray-600 dark:text-gray-400">Total a pagar:</span>
                  <span class="font-semibold text-xl dark:text-white">S/. {{montoSimulado}}</span>
                </div>
              </div>

              <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <div class="flex items-start space-x-2">
                  <svg class="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"/>
                  </svg>
                  <div>
                    <p class="text-sm font-medium text-blue-800 dark:text-blue-300">
                      Pago seguro
                    </p>
                    <p class="text-sm text-blue-600 dark:text-blue-400">
                      Tus datos están protegidos con encriptación SSL
                    </p>
                  </div>
                </div>
              </div>

              <div class="flex space-x-3">
                <button type="button" 
                        (click)="simularPagoExitoso()" 
                        [disabled]="!formularioValido()"
                        class="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                  💳 Pagar S/. {{montoSimulado}}
                </button>
                <button type="button" 
                        (click)="volverAReservas()" 
                        class="dark:text-white px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Loading State -->
        <div *ngIf="procesandoPago" 
             class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center max-w-sm">
            <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Procesando pago...
            </h3>
            <p class="text-gray-600 dark:text-gray-400">
              No cierres esta ventana
            </p>
          </div>
        </div>

        <!-- Success State -->
        <div *ngIf="pagoExitoso" 
             class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center max-w-sm">
            <div class="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-10 h-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">
              ¡Pago exitoso!
            </h3>
            <p class="text-gray-600 dark:text-gray-400 mb-6">
              Tu reserva ha sido confirmada
            </p>
            <button (click)="volverAReservas()" 
                    class="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors">
              Volver a mis reservas
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class PagosComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  metodoPago: 'yape' | 'visa' | 'mastercard' = 'yape';
  montoSimulado = 0;
  procesandoPago = false;
  pagoExitoso = false;

  datosTarjeta = {
    numero: '',
    expiracion: '',
    cvv: '',
    titular: ''
  };

  ngOnInit() {
    this.route.url.subscribe(segments => {
      const path = segments[segments.length - 1]?.path;
      if (path === 'yape') {
        this.metodoPago = 'yape';
      } else if (path === 'visa') {
        this.metodoPago = 'visa';
      }
    });

    // Simular monto desde query params o valor por defecto
    this.route.queryParams.subscribe(params => {
      this.montoSimulado = params['monto'] || Math.floor(Math.random() * 200) + 50;
    });
  }

  formatearNumeroTarjeta(event: any) {
    let value = event.target.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
    let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
    if (formattedValue !== this.datosTarjeta.numero) {
      this.datosTarjeta.numero = formattedValue;
    }
  }

  formatearExpiracion(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    this.datosTarjeta.expiracion = value;
  }

  formularioValido(): boolean {
    return !!(
      this.datosTarjeta.numero.replace(/\s/g, '').length >= 16 &&
      this.datosTarjeta.expiracion.length === 5 &&
      this.datosTarjeta.cvv.length === 3 &&
      this.datosTarjeta.titular.trim()
    );
  }

  simularPagoExitoso() {
    this.procesandoPago = true;
    
    // Simular demora de procesamiento
    setTimeout(() => {
      this.procesandoPago = false;
      this.pagoExitoso = true;
    }, 3000);
  }

  volverAReservas() {
    this.router.navigate(['/dashboard/reservas/mis-reservas']);
  }
}
