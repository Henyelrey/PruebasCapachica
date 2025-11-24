import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, NotificationData } from '../../../core/services/notification.service';
import { Subject, takeUntil } from 'rxjs';

// Se añade la propiedad opcional 'isRemoving' para manejar la animación de salida.
export interface DisplayNotificationData extends NotificationData {
  isRemoving?: boolean;
}

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Contenedor principal para las notificaciones -->
    <div class="fixed top-5 right-5 z-[100] w-full max-w-sm space-y-3">
      <!-- Usamos @for para iterar sobre las notificaciones -->
      @for (notification of notifications; track notification.id) {
        <div 
          class="notification-item group flex w-full transform items-start rounded-lg border-l-4 p-4 shadow-xl transition-all duration-300 ease-in-out hover:scale-105"
          [ngClass]="getNotificationClasses(notification.type)"
          [class.removing]="notification.isRemoving"
          [attr.data-id]="notification.id"
        >
          <!-- Contenedor del Ícono -->
          <div class="flex-shrink-0 pt-0.5">
            @switch (notification.type) {
              @case ('success') {
                <svg class="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              }
              @case ('error') {
                <svg class="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
              }
              @case ('warning') {
                <svg class="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
              }
              @case ('info') {
                <svg class="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /></svg>
              }
            }
          </div>
          
          <!-- Contenido del Mensaje -->
          <div class="ml-3 flex-1">
            <p class="text-sm font-semibold" [ngClass]="getTitleClasses(notification.type)">
              {{ notification.title }}
            </p>
            @if (notification.message) {
              <p class="mt-1 text-sm" [ngClass]="getMessageClasses(notification.type)">
                {{ notification.message }}
              </p>
            }
          </div>
          
          <!-- Botón de Cerrar -->
          <div class="ml-4 flex-shrink-0">
            <button 
              type="button"
              (click)="dismiss(notification.id)"
              class="inline-flex rounded-md p-1 transition focus:outline-none focus:ring-2 focus:ring-offset-2"
              [ngClass]="getCloseButtonClasses(notification.type)"
            >
              <span class="sr-only">Cerrar</span>
              <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" /></svg>
            </button>
          </div>
        </div>

        <!-- Barra de Progreso -->
        @if (notification.duration && !notification.persistent) {
          <div class="h-1 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden -mt-2">
            <div 
              class="h-full animate-shrink"
              [ngClass]="getProgressBarClasses(notification.type)"
              [style.animation-duration]="notification.duration + 'ms'"
            ></div>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    /* Animación para la barra de progreso */
    @keyframes shrink {
      from { width: 100%; }
      to { width: 0%; }
    }
    .animate-shrink {
      animation: shrink linear forwards;
    }
    
    /* Animación de entrada */
    .notification-item {
      animation: slideInRight 0.4s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
    }
    @keyframes slideInRight {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    /* Animación de salida */
    .notification-item.removing {
      animation: slideOutRight 0.5s cubic-bezier(0.550, 0.085, 0.680, 0.530) both;
    }
    @keyframes slideOutRight {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }
  `]
})
export class NotificationComponent implements OnInit, OnDestroy {
  notifications: DisplayNotificationData[] = [];
  private destroy$ = new Subject<void>();
  

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    // Escuchar nuevas notificaciones del servicio
    this.notificationService.notifications$
      .pipe(takeUntil(this.destroy$))
      .subscribe(notification => {
        this.notifications.push({ ...notification, isRemoving: false });
      });

    // Escuchar eventos de descarte del servicio
    this.notificationService.dismiss$
      .pipe(takeUntil(this.destroy$))
      .subscribe(id => {
        this.dismissNotification(id);
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Llama al servicio para iniciar el descarte
  dismiss(id: string) {
    this.notificationService.dismiss(id);
  }

  /**
   * REFACTORIZADO: Maneja la animación de salida sin manipular el DOM directamente.
   * 1. Encuentra la notificación por ID.
   * 2. Marca la propiedad 'isRemoving' como true para activar la clase CSS de animación.
   * 3. Usa setTimeout para eliminar la notificación del array después de que la animación termine.
   */
  private dismissNotification(id: string) {
    const notification = this.notifications.find(n => n.id === id);
    if (notification && !notification.isRemoving) {
      notification.isRemoving = true;
      setTimeout(() => {
        this.notifications = this.notifications.filter(n => n.id !== id);
      }, 500); // Coincide con la duración de la animación 'slideOutRight'
    }
  }

  // --- MÉTODOS DE ESTILO ---

  getNotificationClasses(type: NotificationType): string {
    const baseClasses = 'bg-white dark:bg-gray-800';
    const typeClasses: Record<NotificationType, string> = {
        success: 'border-green-500',
        error: 'border-red-500',
        warning: 'border-yellow-500',
        info: 'border-blue-500',
        default: 'border-gray-500',
    };
    return `${baseClasses} ${typeClasses[type]}`;
  }


  getTitleClasses(type: string): string {
    return 'text-gray-900 dark:text-white';
  }

  getMessageClasses(type: string): string {
    return 'text-gray-600 dark:text-gray-300';
  }

  getCloseButtonClasses(type: NotificationType): string {
    const baseClasses = 'text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:ring-offset-white dark:focus:ring-offset-gray-800';

    const typeClasses: Record<NotificationType, string> = {
        success: 'hover:text-green-600 focus:ring-green-500',
        error: 'hover:text-red-600 focus:ring-red-500',
        warning: 'hover:text-yellow-600 focus:ring-yellow-500',
        info: 'hover:text-blue-600 focus:ring-blue-500',
        default: 'hover:text-gray-600 focus:ring-gray-500'
    };

    return `${baseClasses} ${typeClasses[type]}`;
  }

  getProgressBarClasses(type: NotificationType): string {
    const typeClasses: Record<NotificationType, string> = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        warning: 'bg-yellow-500',
        info: 'bg-blue-500',
        default: 'bg-gray-500'
    };

    return typeClasses[type];
    }

}
export type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'default';
