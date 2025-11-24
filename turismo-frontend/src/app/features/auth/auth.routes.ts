import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { VerifyEmailComponent } from './verify-email/verify-email.component';
import { GoogleCallbackComponent } from './google-callback/google-callback.component';
export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    title: 'Iniciar sesión'
  },
  {
    path: 'register',
    component: RegisterComponent,
    title: 'Registrarse'
  },
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent,
    title: 'Recuperar contraseña'
  },
  {
    path: 'reset-password',
    component: ResetPasswordComponent,
    title: 'Restablecer contraseña'
  },
  {
    path: 'verify-email',
    component: VerifyEmailComponent,
    title: 'Verificar correo electrónico'
  },
  {
    path: 'auth/google/callback',
    component: GoogleCallbackComponent,
    title: 'Autenticación con Google'
  }
];

// Para exportación fácil de los componentes
export * from './login/login.component';
export * from './register/register.component';
export * from './forgot-password/forgot-password.component';
export * from './reset-password/reset-password.component';
export * from './verify-email/verify-email.component';
export * from './google-callback/google-callback.component';
