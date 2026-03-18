
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const underwriterGuard: CanActivateFn = (route, state): boolean | UrlTree => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const userRole = authService.getUserRole();
  if (userRole === 'UNDERWRITER') {
    return true;
  }
  if (userRole === 'ADMIN') return router.parseUrl('/admin');
  if (userRole === 'CUSTOMER') return router.parseUrl('/customer');
  if (userRole === 'CLAIM_OFFICER' || userRole === 'CLAIM-OFFICER' || userRole === 'CLAIM') return router.parseUrl('/claim-officer');
  return router.parseUrl('/login');
};


export const adminGuard: CanActivateFn = (route, state): boolean | UrlTree => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const userRole = authService.getUserRole();
  if (userRole === 'ADMIN') {
    return true;
  }
  if (userRole === 'CUSTOMER') return router.parseUrl('/customer');
  if (userRole === 'CLAIM_OFFICER' || userRole === 'CLAIM-OFFICER' || userRole === 'CLAIM') return router.parseUrl('/claim-officer');
  return router.parseUrl('/login');
};


export const customerGuard: CanActivateFn = (route, state): boolean | UrlTree => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const userRole = authService.getUserRole();
  if (userRole === 'CUSTOMER') {
    return true;
  }
  if (userRole === 'ADMIN') return router.parseUrl('/admin');
  if (userRole === 'CLAIM_OFFICER' || userRole === 'CLAIM-OFFICER' || userRole === 'CLAIM') return router.parseUrl('/claim-officer');
  return router.parseUrl('/login');
};


export const claimOfficerGuard: CanActivateFn = (route, state): boolean | UrlTree => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const userRole = authService.getUserRole();
  if (userRole === 'CLAIM_OFFICER' || userRole === 'CLAIM-OFFICER' || userRole === 'CLAIM') {
    return true;
  }
  if (userRole === 'ADMIN') return router.parseUrl('/admin');
  if (userRole === 'CUSTOMER') return router.parseUrl('/customer');
  return router.parseUrl('/login');
};
