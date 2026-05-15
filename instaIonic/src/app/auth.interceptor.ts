import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');

  if (token) {
    const cloned = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
    return next(cloned).pipe(
      catchError(err => {
        if (err.status === 401 && !req.url.includes('/login') && !req.url.includes('/register')) {
          localStorage.removeItem('token');
          router.navigateByUrl('/login');
        }
        return throwError(() => err);
      })
    );
  }

  return next(req);
};
