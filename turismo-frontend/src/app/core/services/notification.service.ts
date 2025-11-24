import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface NotificationData {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  persistent?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationSubject = new Subject<NotificationData>();
  private dismissSubject = new Subject<string>();
  
  notifications$ = this.notificationSubject.asObservable();
  dismiss$ = this.dismissSubject.asObservable();

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  success(title: string, message?: string, duration: number = 5000) {
    this.show({
      id: this.generateId(),
      type: 'success',
      title,
      message,
      duration
    });
  }

  error(title: string, message?: string, duration: number = 8000) {
    this.show({
      id: this.generateId(),
      type: 'error',
      title,
      message,
      duration
    });
  }

  warning(title: string, message?: string, duration: number = 6000) {
    this.show({
      id: this.generateId(),
      type: 'warning',
      title,
      message,
      duration
    });
  }

  info(title: string, message?: string, duration: number = 5000) {
    this.show({
      id: this.generateId(),
      type: 'info',
      title,
      message,
      duration
    });
  }

  private show(notification: NotificationData) {
    this.notificationSubject.next(notification);
    
    // Auto-dismiss después del tiempo especificado
    if (!notification.persistent && notification.duration) {
      setTimeout(() => {
        this.dismiss(notification.id);
      }, notification.duration);
    }
  }

  dismiss(id: string) {
    this.dismissSubject.next(id);
  }

  // Método para mostrar notificaciones personalizadas
  custom(notification: Partial<NotificationData>) {
    this.show({
      id: this.generateId(),
      type: 'info',
      title: 'Notificación',
      duration: 5000,
      ...notification
    } as NotificationData);
  }
}