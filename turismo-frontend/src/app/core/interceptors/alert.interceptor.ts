import { Injectable } from '@angular/core';
import { NotificationService } from '../services/notification.service';

@Injectable({
  providedIn: 'root'
})
export class AlertInterceptor {
  private originalAlert: typeof window.alert;

  constructor(private notificationService: NotificationService) {
    this.originalAlert = window.alert;
    this.interceptAlert();
  }

  private interceptAlert() {
    window.alert = (message: string) => {
      // Detectar el tipo de mensaje basado en palabras clave
      const lowerMessage = message.toLowerCase();
      
      if (lowerMessage.includes('error') || lowerMessage.includes('falló') || lowerMessage.includes('fallo')) {
        this.notificationService.error('Error', message);
      } else if (lowerMessage.includes('advertencia') || lowerMessage.includes('cuidado')) {
        this.notificationService.warning('Advertencia', message);
      } else if (lowerMessage.includes('correcto') || lowerMessage.includes('éxito') || lowerMessage.includes('exitoso')) {
        this.notificationService.success('Éxito', message);
      } else {
        this.notificationService.info('Información', message);
      }
    };
  }

  // Método para restaurar el alert original si es necesario
  restoreOriginalAlert() {
    window.alert = this.originalAlert;
  }
}

// Para inicializar el interceptor automáticamente
export function initializeAlertInterceptor() {
  return () => {
    // Se inicializa automáticamente cuando se importa
  };
}