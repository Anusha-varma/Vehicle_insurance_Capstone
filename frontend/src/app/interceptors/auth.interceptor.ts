import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const token = localStorage.getItem('auth_token');

  console.log('Interceptor adding token', token ? 'Token present' : 'No token', req.url);

  if (token) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
     const payload = token.split('.')[1];
  if (payload) {
    const decoded = JSON.parse(atob(payload));
    console.log('Decoded JWT payload:', decoded);
    // Check for role
    console.log('Role in token:', decoded.role);
  }
    return next(cloned);
  }

  return next(req);
};