import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LoadingService } from './loading.service';

describe('LoadingService', () => {
  let service: LoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoadingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Loading State Management', () => {
    it('should show loading state', () => {
      service.setLoading(true);
      
      service.loading$.subscribe(loading => {
        expect(loading).toBeTruthy();
      });
    });

    it('should hide loading state', () => {
      service.setLoading(true);
      service.setLoading(false);
      
      service.loading$.subscribe(loading => {
        expect(loading).toBeFalsy();
      });
    });

    it('should start with loading state as false', () => {
      service.loading$.subscribe(loading => {
        expect(loading).toBeFalsy();
      });
    });
  });

  describe('Multiple Loading Calls', () => {
    it('should handle multiple show calls', () => {
      service.setLoading(true);
      service.setLoading(true);
      service.setLoading(true);
      
      service.loading$.subscribe(loading => {
        expect(loading).toBeTruthy();
      });
    });

    it('should handle multiple hide calls', () => {
      service.setLoading(true);
      service.setLoading(false);
      service.setLoading(false);
      
      service.loading$.subscribe(loading => {
        expect(loading).toBeFalsy();
      });
    });
  });
});
