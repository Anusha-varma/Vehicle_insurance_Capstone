import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './interceptors/auth.interceptor';
import { loadingInterceptor } from './interceptors/loading.interceptor';
import { routes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([
      loadingInterceptor,
      authInterceptor
    ])),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideAnimations(),
  ]
};
