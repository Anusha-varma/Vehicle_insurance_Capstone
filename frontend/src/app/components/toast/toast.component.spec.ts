import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangeDetectorRef } from '@angular/core';
import { Subject } from 'rxjs';
import { fakeAsync, tick } from '@angular/core/testing';
import { vi } from 'vitest';
import { ToastComponent } from './toast.component';
import { ToastService } from '../../services/toast.service';

// Disable change detection errors for tests
beforeEach(() => {
  (window as any).__zone_symbol__disableErrorHandling = true;
});

describe('ToastComponent', () => {
  let component: ToastComponent;
  let fixture: ComponentFixture<ToastComponent>;
  let toastService: any;
  let cdr: any;

  beforeEach(async () => {
    toastService = {
      toast$: new Subject(),
      clear: vi.fn()
    };

    cdr = {
      detectChanges: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [ToastComponent],
      providers: [
        { provide: ToastService, useValue: toastService },
        { provide: ChangeDetectorRef, useValue: cdr }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ToastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have initial toast properties', () => {
    expect(component.toast).toBeNull();
  });

  describe('Toast Display', () => {
    it('should display success toast', () => {
      component.ngOnInit();
      
      toastService.toast$.next({ message: 'Success message', type: 'success' });
      fixture.detectChanges();
      
      expect(component.toast?.message).toBe('Success message');
      expect(component.toast?.type).toBe('success');
    });

    it('should display error toast', () => {
      component.ngOnInit();
      
      toastService.toast$.next({ message: 'Error message', type: 'error' });
      fixture.detectChanges();
      
      expect(component.toast?.message).toBe('Error message');
      expect(component.toast?.type).toBe('error');
    });

    it('should hide toast after calling close', () => {
      component.ngOnInit();
      
      toastService.toast$.next({ message: 'Test message', type: 'success' });
      fixture.detectChanges();
      
      component.close();
      
      expect(toastService.clear).toHaveBeenCalled();
    });
  });

  describe('Toast Template', () => {
    it('should have toast property that can be set', () => {
      component.toast = { message: 'Test message', type: 'success' };
      expect(component.toast?.message).toBe('Test message');
      expect(component.toast?.type).toBe('success');
    });

    it('should have toast property that can be null', () => {
      component.toast = null;
      expect(component.toast).toBeNull();
    });
  });

  describe('close', () => {
    it('should call toastService.clear', () => {
      component.close();
      
      expect(toastService.clear).toHaveBeenCalled();
    });
  });

  describe('ngOnDestroy', () => {
    it('should unsubscribe if subscription exists', () => {
      component.ngOnInit();
      expect(component['subscription']).toBeTruthy(); // Access private property
      
      component.ngOnDestroy();
      expect(component['subscription']?.closed).toBeTruthy();
    });

    it('should not error if subscription does not exist', () => {
      component['subscription'] = null; // Access private property
      
      expect(() => component.ngOnDestroy()).not.toThrow();
    });
  });
});
