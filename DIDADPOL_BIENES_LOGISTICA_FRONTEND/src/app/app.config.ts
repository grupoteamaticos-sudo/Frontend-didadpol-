import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { authInterceptor } from './shared/interceptors/auth.interceptor';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),

    provideHttpClient(
      withFetch(), // puedes dejarlo

      withInterceptors([
        (req, next) => {

          // 🔥 CLAVE: evitar SSR
          if (typeof window === 'undefined') {
            return next(req);
          }

          const raw = localStorage.getItem('didadpol_session');

          if (!raw) return next(req);

          try {
            const parsed = JSON.parse(raw);
            const token = parsed?.accessToken;

            if (!token) return next(req);

            const cloned = req.clone({
              setHeaders: {
                Authorization: `Bearer ${token}`
              }
            });

            return next(cloned);

          } catch {
            return next(req);
          }
        }
      ])
    )
  ]
};
