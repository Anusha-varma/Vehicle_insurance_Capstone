import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

/**
 * Role-based guard for Angular standalone routing.
 * Usage: canActivate: [roleGuard(['admin'])]
 */
export function roleGuard(allowedRoles: string[]): CanActivateFn {
  return (route, state): boolean | UrlTree => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const userRole = authService.getUserRole();
    if (userRole && allowedRoles.includes(userRole)) {
      return true;
    }
    // Redirect to login if not logged in, or to home if role is not allowed
    return authService.getToken()
      ? router.parseUrl('/')
      : router.parseUrl('/login');
  };
}
