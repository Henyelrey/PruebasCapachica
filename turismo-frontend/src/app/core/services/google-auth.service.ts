import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environments';
import { AuthService } from './auth.service';

// Declare the Google global types
declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: (callback?: (notification: any) => void) => void;
          renderButton: (element: HTMLElement, options: any) => void;
          disableAutoSelect: () => void;
        };
        oauth2: {
          initTokenClient: (config: any) => {
            requestAccessToken: (overrideConfig?: any) => void;
          };
        };
      };
    };
  }
}

@Injectable({
  providedIn: 'root'
})
export class GoogleAuthService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  
  private readonly API_URL = environment.apiUrl;
  private readonly CLIENT_ID = environment.googleClientId;
  
  /**
   * Initialize Google One Tap configuration
   */
  initGoogleOneTap(autoPrompt = false): void {
    // Make sure Google's script is loaded
    if (!window.google?.accounts?.id) {
      console.error('Google Accounts script not loaded');
      return;
    }
    
    window.google.accounts.id.initialize({
      client_id: this.CLIENT_ID,
      callback: this.handleCredentialResponse.bind(this),
      auto_select: false,
      cancel_on_tap_outside: true
    });
    
    // Disable auto-selection if needed
    if (!autoPrompt) {
      window.google.accounts.id.disableAutoSelect();
    }
  }
  
  /**
   * Render Google Sign-In button
   */
  renderGoogleButton(buttonId: string): void {
    const buttonElement = document.getElementById(buttonId);
    
    if (!buttonElement) {
      console.error(`Button element with id "${buttonId}" not found`);
      return;
    }
    
    if (!window.google?.accounts?.id) {
      console.error('Google Accounts script not loaded');
      return;
    }
    
    window.google.accounts.id.renderButton(buttonElement, {
      theme: 'outline',
      size: 'large',
      type: 'standard',
      text: 'signin_with',
      shape: 'rectangular',
      logo_alignment: 'left',
      width: buttonElement.offsetWidth
    });
  }
  
  /**
   * Show the Google One Tap prompt
   */
  promptGoogleOneTap(): void {
    if (!window.google?.accounts?.id) {
      console.error('Google Accounts script not loaded');
      return;
    }
    
    window.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        // The user has previously declined or dismissed the One Tap
        console.log('One Tap not displayed:', notification.getNotDisplayedReason());
      }
    });
  }
  
  /**
   * Handle the credential response from Google
   */
  private handleCredentialResponse(response: any): void {
    console.log('Google credential response:', response);
    
    // Send the ID token to the backend for verification
    this.verifyGoogleToken(response.credential)
      .subscribe({
        next: (authResponse) => {
          console.log('Google auth successful:', authResponse);
          // Navigate to dashboard or home page
          window.location.href = '/dashboard';
        },
        error: (error) => {
          console.error('Error authenticating with Google:', error);
        }
      });
  }
  
  /**
   * Verify Google ID token with our backend
   */
  verifyGoogleToken(idToken: string): Observable<any> {
    return this.http.post(`${this.API_URL}/auth/google/verify-token`, { token: idToken })
      .pipe(
        map((response: any) => {
          if (response.success && response.data) {
            // Store token in localStorage
            if (response.data.access_token) {
              localStorage.setItem('auth_token', response.data.access_token);
            }
            return response.data;
          }
          throw new Error('Invalid response from server');
        }),
        catchError((error) => {
          console.error('Error verifying Google token:', error);
          return throwError(() => error);
        })
      );
  }
  
  /**
   * Sign out from Google
   */
  signOutFromGoogle(): void {
    // Google doesn't provide a direct sign-out method for One Tap,
    // but we can clear our local auth state
    this.authService.logout();
  }
}