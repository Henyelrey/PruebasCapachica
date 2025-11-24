import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  public themeService = inject(ThemeService);
  
  profileForm!: FormGroup;
  user: User | null = null;
  
  loading = true;
  updating = false;
  submitted = false;
  updateError = '';
  updateSuccess = false;
  fileError = '';
  selectedFile: File | null = null;
  previewUrl: string | null = null; 
  userInitials = '';
  
  // Para controlar las pestañas
  activeTab = 'personal';
  
  // Mapa de idiomas
  languageOptions = [
    { value: '', label: 'Seleccionar idioma' },
    { value: 'es', label: 'Español' },
    { value: 'en', label: 'Inglés' },
    { value: 'pt', label: 'Portugués' },
    { value: 'fr', label: 'Francés' },
    { value: 'de', label: 'Alemán' }
  ];
  
  // Mapa de géneros
  genderOptions = [
    { value: '', label: 'Seleccionar género' },
    { value: 'male', label: 'Masculino' },
    { value: 'female', label: 'Femenino' },
    { value: 'other', label: 'Otro' },
    { value: 'prefer_not_to_say', label: 'Prefiero no decir' }
  ];
  
  ngOnInit() {
    this.initForm();
    this.loadUserProfile();
  }
  
  initForm(): void {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      country: [''],
      birth_date: [''],
      address: [''],
      gender: [''],
      preferred_language: ['']
    });
  }
  
  get f() { return this.profileForm.controls; }
  
  loadUserProfile() {
    this.loading = true;
    this.authService.getProfile().subscribe({
      next: (user) => {
        this.user = user;
        this.profileForm.patchValue({
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          country: user.country || '',
          birth_date: user.birth_date || '',
          address: user.address || '',
          gender: user.gender || '',
          preferred_language: user.preferred_language || ''
        });
        this.userInitials = this.getUserInitials();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        this.loading = false;
        this.updateError = 'Error al cargar el perfil. Inténtelo de nuevo más tarde.';
      }
    });
  }
  
  getUserInitials(): string {
    if (!this.user) return '';
    
    if (this.user.name) {
      const nameParts = this.user.name.split(' ');
      if (nameParts.length > 1) {
        return (nameParts[0].charAt(0) + nameParts[1].charAt(0)).toUpperCase();
      }
      return this.user.name.substring(0, 2).toUpperCase();
    }
    
    return 'U';
  }
  
onFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  this.fileError = '';
  
  if (input.files && input.files.length) {
    const file = input.files[0];
    
    // Validaciones existentes
    if (!file.type.startsWith('image/')) {
      this.fileError = 'El archivo debe ser una imagen.';
      input.value = '';
      this.clearPreview();
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.fileError = 'La imagen no debe superar los 5MB.';
      input.value = '';
      this.clearPreview();
      return;
    }
    
    // Guardar archivo y crear vista previa
    this.selectedFile = file;
    this.createPreview(file);
  } else {
    this.clearPreview();
  }
}
  
  setActiveTab(tabName: string): void {
    this.activeTab = tabName;
  }
  
  onSubmit() {
    this.submitted = true;
    this.updateError = '';
    this.updateSuccess = false;
    
    if (this.profileForm.invalid) {
      return;
    }
    
    this.updating = true;
    
    const formData = new FormData();
    const formValue = this.profileForm.value;
    
    // Agregar todos los campos del formulario al FormData
    Object.keys(formValue).forEach(key => {
      if (formValue[key] !== null && formValue[key] !== undefined) {
        formData.append(key, formValue[key]);
      }
    });
    
    // Agregar la foto de perfil si existe
    if (this.selectedFile) {
      formData.append('foto_perfil', this.selectedFile);
    }
    
    this.authService.updateProfile(formData).subscribe({
      next: (user) => {
        this.user = user;
        this.updateSuccess = true;
        this.updating = false;
        this.submitted = false;
        this.loadUserProfile(); // Recargar el perfil para mostrar los cambios
      },
      error: (error) => {
        this.updating = false;
        this.updateError = error.error?.message || 'Ha ocurrido un error al actualizar el perfil.';
        
        // Manejar errores específicos de campos
        if (error.error?.errors) {
          const errors = error.error.errors;
          Object.keys(errors).forEach(key => {
            const errorMessage = Array.isArray(errors[key]) ? errors[key][0] : errors[key];
            if (key === 'foto_perfil') {
              this.fileError = errorMessage;
            } else {
              const control = this.profileForm.get(key);
              if (control) {
                control.setErrors({ serverError: errorMessage });
              }
            }
          });
        }
      }
    });
  }
  
  formatDate(date: string | null): string {
    if (!date) return 'Nunca';
    return new Date(date).toLocaleString();
  }
  
  resetForm(): void {
    this.submitted = false;
    this.updateError = '';
    this.fileError = '';
    this.selectedFile = null;
    this.clearPreview();
    this.loadUserProfile();
  }
  
  isDarkMode(): boolean {
    return this.themeService.isDarkMode();
  }
  
  toggleDarkMode(): void {
    this.themeService.toggleDarkMode();
  }
  
  // Helper para garantizar el tipo en las plantillas
  getPermissions(role: any): string[] {
    if (!role || !role.permissions) return [];
  
    // Convertir a array de strings si es necesario
    if (Array.isArray(role.permissions)) {
      return role.permissions.map((p: string | { name: string }) =>
        typeof p === 'string' ? p : p.name
      );
    }
  
    return [];
  }
  
  
  // Helper para verificar si los roles existen
  hasRoles(): boolean {
    return !!this.user && !!this.user.roles && this.user.roles.length > 0;
  }
  
  // Helper para obtener la longitud de roles de manera segura
  getRolesLength(): number {
    return this.user?.roles?.length || 0;
  }
private createPreview(file: File): void {
  const reader = new FileReader();
  reader.onload = (e: any) => {
    this.previewUrl = e.target.result;
  };
  reader.readAsDataURL(file);
}

private clearPreview(): void {
  this.selectedFile = null;
  this.previewUrl = null;
}

cancelSelection(): void {
  this.clearPreview();
  this.fileError = '';
  // Limpiar el input file
  const fileInput = document.getElementById('foto_perfil') as HTMLInputElement;
  if (fileInput) {
    fileInput.value = '';
  }
}

saveProfilePhoto(): void {
  // Esta funcionalidad ya la tienes en tu método onSubmit()
  // Solo necesitas llamar a onSubmit() desde el botón "Guardar"
  this.onSubmit();
}
  
}