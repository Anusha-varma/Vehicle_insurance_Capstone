import { TestBed } from '@angular/core/testing';
import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Toast Messages', () => {
    it('should show success message', () => {
      const message = 'Operation completed successfully';
      service.showSuccess(message);
      
      service.toast$.subscribe(toast => {
        expect(toast?.message).toBe(message);
        expect(toast?.type).toBe('success');
      });
    });

    it('should show error message', () => {
      const message = 'An error occurred';
      service.showError(message);
      
      service.toast$.subscribe(toast => {
        expect(toast?.message).toBe(message);
        expect(toast?.type).toBe('error');
      });
    });

    it('should show info message', () => {
      const message = 'Information message';
      service.showInfo(message);
      
      service.toast$.subscribe(toast => {
        expect(toast?.message).toBe(message);
        expect(toast?.type).toBe('info');
      });
    });
  });

  describe('Toast Visibility', () => {
    it('should clear toast message', () => {
      service.showSuccess('Test message');
      service.clear();
      
      service.toast$.subscribe(toast => {
        expect(toast).toBeNull();
      });
    });
  });
});
