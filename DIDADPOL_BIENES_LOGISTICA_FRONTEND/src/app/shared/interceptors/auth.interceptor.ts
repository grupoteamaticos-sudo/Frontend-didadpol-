import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  // evitar SSR
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
};
