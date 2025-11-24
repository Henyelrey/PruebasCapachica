import { Component, inject, OnInit, signal, computed, effect, ViewChild, ElementRef, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { MenuService, MenuItem } from '../../../core/services/menu.service';
import { User } from '../../../core/models/user.model';
import { Subscription, filter } from 'rxjs';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink, RouterLinkActive],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.css'],
  animations: [
    trigger('fadeInOut', [
      state('void', style({
        opacity: 0
      })),
      transition('void <=> *', animate('200ms ease-in-out')),
    ]),
    trigger('slideInOut', [
      state('void', style({
        transform: 'translateX(-10px)',
        opacity: 0
      })),
      transition('void <=> *', animate('300ms cubic-bezier(0.215, 0.610, 0.355, 1)')),
    ]),
    trigger('submenuAnimation', [
      state('open', style({
        height: '*',
        opacity: 1
      })),
      state('closed', style({
        height: '0',
        opacity: 0,
        overflow: 'hidden'
      })),
      transition('open <=> closed', [
        animate('300ms cubic-bezier(0.215, 0.610, 0.355, 1)')
      ])
    ])
  ]
})
export class AdminLayoutComponent implements OnInit, OnDestroy {
  authService = inject(AuthService);
  themeService = inject(ThemeService);
  menuService = inject(MenuService);
  router = inject(Router);
  
  @ViewChild('userMenuContainer') userMenuContainer!: ElementRef;
  @ViewChild('sidebarScrollContainer') sidebarScrollContainer!: ElementRef;
  
  // Signals para controlar estados de la UI
  sidebarOpen = signal(true);
  sidebarCollapsed = signal(false);
  darkMode = signal(false);
  userMenuOpen = false;
  menuItems = signal<MenuItem[]>([]);
  menuLoading = signal(false);
  currentPageTitle = signal('Dashboard');
  showScrollbar = signal(false);
  
  // Estado de submenús - cambiado para permitir múltiples submenús abiertos
  private openSubmenuIds = signal<string[]>([]);
  
  // Subscriptions
  private themeSubscription: Subscription | null = null;
  private menuSubscription: Subscription | null = null;
  private routerSubscription: Subscription | null = null;
  
  // Computed properties
  displayName = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return 'Usuario';
    return user.name || 'Usuario';
  });
  
  profilePhotoUrl = computed(() => {
    const user = this.authService.currentUser();
    if (!user || !user['foto_perfil']) return null;
    return user['foto_perfil'];
  });
  
  userRole = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return 'Usuario';
    
    const roles = this.authService.userRoles();
    
    if (roles && roles.length > 0) {
      return this.capitalize(roles[0]);
    } else if (user.roles && user.roles.length > 0) {
      const role = user.roles[0].name || user.roles[0];
      return this.capitalize(role.toString());
    }
    
    return 'Usuario';
  });

  // Nuevas propiedades computadas para los campos adicionales
  lastLoginFormatted = computed(() => {
    const user = this.authService.currentUser();
    if (!user || !user.last_login) return 'Nunca';
    
    // Formato de fecha (puedes ajustarlo según tus necesidades)
    const date = new Date(user.last_login);
    
    // Si es hoy, mostrar solo la hora
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return `Hoy, ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
    }
    
    // Si es ayer
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return `Ayer, ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
    }
    
    // Para otras fechas
    return date.toLocaleDateString() + ', ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  });
  
  userCountry = computed(() => {
    const user = this.authService.currentUser();
    return user?.country || 'No especificado';
  });
  
  preferredLanguage = computed(() => {
    const user = this.authService.currentUser();
    if (!user?.preferred_language) return 'No especificado';
    
    // Mapeo de códigos de idioma a nombres
    const languageMap: Record<string, string> = {
      'es': 'Español',
      'en': 'Inglés',
      'pt': 'Portugués',
      'fr': 'Francés',
      'de': 'Alemán'
    };
    
    return languageMap[user.preferred_language] || user.preferred_language;
  });
  
  userGender = computed(() => {
    const user = this.authService.currentUser();
    if (!user?.gender) return 'No especificado';
    
    const genderMap: Record<string, string> = {
      'male': 'Masculino',
      'female': 'Femenino',
      'other': 'Otro',
      'prefer_not_to_say': 'Prefiere no decirlo'
    };
    
    return genderMap[user.gender] || user.gender;
  });
  
  userAddress = computed(() => {
    const user = this.authService.currentUser();
    return user?.address || 'No especificada';
  });
  
  userBirthDate = computed(() => {
    const user = this.authService.currentUser();
    if (!user?.birth_date) return 'No especificada';
    
    // Formatear la fecha de nacimiento
    const date = new Date(user.birth_date);
    return date.toLocaleDateString();
  });
  
  // Listener para detectar cambios de tamaño de ventana
  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.adjustSidebarForMobile();
  }
  
  // Listener para detectar clics fuera de los menús
  @HostListener('document:click', ['$event'])
  handleDocumentClick(event: MouseEvent) {
    // Cerrar menú de usuario cuando se hace clic fuera
    if (this.userMenuOpen && this.userMenuContainer && 
        !this.userMenuContainer.nativeElement.contains(event.target)) {
      this.userMenuOpen = false;
    }
  }
  
  // Efecto para el tema
  private themeEffect = effect(() => {
    if (this.darkMode()) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
    console.log('Modo oscuro:', this.darkMode());
  });
  
  constructor() {
    // Los event listeners ahora se gestionan con @HostListener
  }

  ngOnInit() {
    // Suscribirse al servicio de tema
    this.themeSubscription = this.themeService.darkMode$.subscribe(isDark => {
      console.log('Dark mode subscription update:', isDark);
      this.darkMode.set(isDark);
    });
    
    // Inicializar tema
    this.themeService.initializeTheme();
    
    // Verificar autenticación y cargar perfil
    if (this.authService.isLoggedIn()) {
      console.log('AdminLayout: Usuario está autenticado, verificando perfil...');
      
      if (!this.authService.currentUser()) {
        console.log('AdminLayout: Perfil no cargado, intentando cargar...');
        
        this.authService.loadUserProfile(true).subscribe({
          next: user => {
            console.log('AdminLayout: Perfil cargado correctamente:', user);
            this.loadMenuItems();
          },
          error: err => {
            console.error('AdminLayout: Error al cargar perfil:', err);
          }
        });
      } else {
        console.log('AdminLayout: Perfil ya está cargado:', this.authService.currentUser());
        this.loadMenuItems();
      }
    } else {
      console.log('AdminLayout: Usuario no está autenticado');
    }
    
    // Ajustar sidebar para móviles
    this.adjustSidebarForMobile();
    
    // Cargar estado guardado del sidebar
    const savedCollapsed = localStorage.getItem('sidebarCollapsed');
    if (savedCollapsed === 'true') {
      this.sidebarCollapsed.set(true);
    }
    
    // Suscribirse a cambios de ruta para actualizar el título de la página y el menú
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateCurrentPageTitle();
        this.updateMenuStateBasedOnRoute();
      });
  }
  
  ngOnDestroy() {
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
    
    if (this.menuSubscription) {
      this.menuSubscription.unsubscribe();
    }
    
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }
  
  loadMenuItems() {
    this.menuLoading.set(true);
    this.menuSubscription = this.menuService.loadMenu().subscribe({
      next: (menuItems) => {
        this.menuItems.set(menuItems);
        this.menuLoading.set(false);
        this.updateCurrentPageTitle();
        this.updateMenuStateBasedOnRoute(); // Actualizar estado del menú
        console.log('Menú cargado:', menuItems);
        
        // Asegurar que se muestre el último elemento del menú
        setTimeout(() => this.scrollToBottom(), 100);
      },
      error: (error) => {
        console.error('Error al cargar menú:', error);
        this.menuLoading.set(false);
      }
    });
  }
  
  // Método para desplazarse al final del menú
  scrollToBottom() {
    if (this.sidebarScrollContainer && this.sidebarScrollContainer.nativeElement) {
      const element = this.sidebarScrollContainer.nativeElement;
      element.scrollTop = element.scrollHeight;
    }
  }
  
  // Para mostrar/ocultar scrollbar
  onSidebarMouseEnter() {
    this.showScrollbar.set(true);
  }
  
  onSidebarMouseLeave() {
    this.showScrollbar.set(false);
  }
  
  // Para verificar si la ruta actual es parte de un submenú
  isSubmenuActive(item: any): boolean {
  return item.children?.some((child: any) => this.router.url === child.path);
}


  
  // Para manejar los submenús - permite múltiples submenús abiertos
  toggleSubmenu(id: string): void {
    const currentOpenSubmenuIds = this.openSubmenuIds();
    if (currentOpenSubmenuIds.includes(id)) {
      // Si ya está abierto, lo cerramos
      this.openSubmenuIds.set(currentOpenSubmenuIds.filter(menuId => menuId !== id));
    } else {
      // Si no está abierto, lo agregamos al array de submenús abiertos
      this.openSubmenuIds.set([...currentOpenSubmenuIds, id]);
    }
  }

  isSubmenuOpen(id: string): boolean {
    return this.openSubmenuIds().includes(id);
  }
  
  // Método para verificar si un ítem de menú debería estar abierto basado en la ruta actual
  shouldMenuBeOpen(item: MenuItem): boolean {
    if (!item.children) return false;
    
    const currentPath = window.location.pathname;
    return item.children.some(child => currentPath.includes(child.path));
  }
  
  // Método para actualizar el estado del menú según la ruta actual
  updateMenuStateBasedOnRoute(): void {
    const items = this.menuItems();
    
    if (!items || !items.length) return;
    
    const currentPath = window.location.pathname;
    const newOpenSubmenuIds: string[] = [];
    
    // Buscar submenús que tengan un hijo con la ruta actual
    for (const item of items) {
      if (item.children && item.children.length > 0) {
        const hasActiveChild = item.children.some(child => 
          child.path && currentPath.includes(child.path)
        );
        
        // Si encontramos un submenú que contiene la ruta actual, lo añadimos a los abiertos
        if (hasActiveChild) {
          newOpenSubmenuIds.push(item.id);
        }
      }
    }
    
    // Actualizar submenús abiertos (ahora permitimos múltiples)
    this.openSubmenuIds.set(newOpenSubmenuIds);
  }

  toggleUserMenu(event: Event) {
    event.stopPropagation();
    this.userMenuOpen = !this.userMenuOpen;
  }

  userInitials(): string {
    const user = this.authService.currentUser();
    if (!user) return '';
    
    // Si tenemos nombre completo, usar las iniciales del nombre
    if (user.name) {
      const nameParts = user.name.split(' ');
      if (nameParts.length > 1) {
        return (nameParts[0].charAt(0) + nameParts[1].charAt(0)).toUpperCase();
      }
      return user.name.substring(0, 2).toUpperCase();
    }
    
    return 'U'; // Usuario por defecto si no hay información
  }

  toggleSidebar() {
    this.sidebarOpen.update(value => !value);
  }

  toggleSidebarCollapse() {
    this.sidebarCollapsed.update(value => !value);
    localStorage.setItem('sidebarCollapsed', this.sidebarCollapsed().toString());
  }

  toggleDarkMode() {
    console.log('Toggle dark mode, current:', this.darkMode());
    this.themeService.toggleDarkMode();
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        // Limpiar el menú al cerrar sesión
        this.menuService.resetMenu();
      },
      error: (err) => {
        console.error('Error al cerrar sesión:', err);
      }
    });
  }

  // Obtener título de la página actual
  updateCurrentPageTitle(): void {
    const items = this.menuItems();
    if (!items || !items.length) {
      this.currentPageTitle.set('Dashboard');
      return;
    }
    
    // Buscar el ítem activo basado en la ruta actual
    const currentPath = window.location.pathname;
    
    // Primero buscar en items principales
    let activeItem = items.find(item => item.path && currentPath.includes(item.path));
    let title = activeItem?.title;
    
    // Si no se encuentra, buscar en los subitems
    if (!title) {
      for (const item of items) {
        if (item.children) {
          const activeChild = item.children.find(child => child.path && currentPath.includes(child.path));
          if (activeChild) {
            title = activeChild.title;
            break;
          }
        }
      }
    }
    
    this.currentPageTitle.set(title || 'Dashboard');
  }
  
  // Obtener el título actual de la página
  getCurrentPageTitle(): string {
    return this.currentPageTitle();
  }

  // Métodos específicos para manejo de menú
  getMenuItemIcon(iconName: string): string {
    // Mapeo de nombres de iconos a SVG paths
    const iconMap: Record<string, string> = {
      'dashboard': 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z',
      'users': 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
      'users-group': 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
      'user': 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
      'building': 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
      'store': 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z',
      'briefcase': 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
      'calendar': 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
      'shop': 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z',
      'settings': 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
      'chart': 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
      'report': 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      'notification': 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
      'globe': 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      'language': 'M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129',
      'clock': 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
      'events': 'M3 4a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V4zm13-2v4M8 2v4M3 10h18M9 16a1 1 0 100-2 1 1 0 000 2zm6 0a1 1 0 100-2 1 1 0 000 2zM7 13h2m6 0h2',
    };
    
    return iconMap[iconName] || iconMap['dashboard']; // Fallback a dashboard
  }

  // Cerrar sidebar automáticamente en dispositivos móviles
  private adjustSidebarForMobile() {
    if (window.innerWidth < 1024) {
      this.sidebarOpen.set(false);
    } else {
      // En pantallas grandes, siempre mostramos el sidebar
      this.sidebarOpen.set(true);
    }
  }

  // Utility para capitalizar texto
  private capitalize(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }
}