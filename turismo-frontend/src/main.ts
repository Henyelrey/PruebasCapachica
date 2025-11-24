import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

// Early theme initialization to prevent flashing
const savedDarkMode = localStorage.getItem('darkMode');
if (savedDarkMode === 'true' || (savedDarkMode === null && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
  document.documentElement.classList.add('dark');
  console.log('Early initialization: Setting dark mode');
} else {
  document.documentElement.classList.remove('dark');
  console.log('Early initialization: Setting light mode');
}
bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
