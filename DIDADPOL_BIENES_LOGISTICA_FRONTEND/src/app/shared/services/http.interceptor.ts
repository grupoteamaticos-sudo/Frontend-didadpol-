import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class HttpTokenInterceptor implements HttpInterceptor {

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    const raw = localStorage.getItem('didadpol_session');

    if (!raw) {
      return next.handle(req);
    }

    let token = '';

    try {
      const parsed = JSON.parse(raw);
      token = parsed?.accessToken || '';
    } catch (e) {
      console.error('Error parsing session', e);
    }

    // ❗ SI NO HAY TOKEN → NO LO ENVÍES
    if (!token) {
      return next.handle(req);
    }

    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    return next.handle(cloned);
  }
}
