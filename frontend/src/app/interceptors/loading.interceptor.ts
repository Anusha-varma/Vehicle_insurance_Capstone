import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { finalize } from 'rxjs';
import { LoadingService } from '../services/loading.service';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);
  
  // Skip loading specifically for background notification polling
  if (req.url.includes('/api/notifications')) {
    return next(req);
  }

  loadingService.setLoading(true);
  return next(req).pipe(
    finalize(() => loadingService.setLoading(false))
  );
};
