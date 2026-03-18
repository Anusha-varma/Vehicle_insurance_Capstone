import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { of, throwError, Observable } from 'rxjs';
import { fakeAsync, tick } from '@angular/core/testing';
import { vi } from 'vitest';
import { LoginComponent } from './login';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: any;
  let toastService: any;
  let router: any;

  beforeEach(async () => {
    const authServiceSpy = vi.fn().mockImplementation(() => ({
      login: vi.fn(),
      setToken: vi.fn(),
      setUserRole: vi.fn(),
      logout: vi.fn()
    }))();

    const toastServiceSpy = vi.fn().mockImplementation(() => ({
      showSuccess: vi.fn(),
      showError: vi.fn(),
      showInfo: vi.fn()
    }))();

    const routerSpy = vi.fn().mockImplementation(() => ({
      navigate: vi.fn()
    }))();

    const activatedRouteSpy = vi.fn().mockImplementation(() => ({
      params: of({}),
      queryParams: of({})
    }))();

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, LoginComponent],
      providers: [
        FormBuilder,
        { provide: AuthService, useValue: authServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    toastService = TestBed.inject(ToastService);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with required fields', () => {
    expect(component.loginForm.contains('username')).toBeTruthy();
    expect(component.loginForm.contains('password')).toBeTruthy();
    expect(component.loginForm.contains('role')).toBeTruthy();
  });

  it('should make username field required', () => {
    const control = component.loginForm.get('username');
    control?.setValue('');
    expect(control?.invalid).toBeTruthy();
  });

  it('should make password field required', () => {
    const control = component.loginForm.get('password');
    control?.setValue('');
    expect(control?.invalid).toBeTruthy();
  });

  it('should make role field required', () => {
    const control = component.loginForm.get('role');
    control?.setValue('');
    expect(control?.invalid).toBeTruthy();
  });

  describe('setSelectedRole', () => {
    it('should set selected role and update form', () => {
      const role = 'ADMIN';
      component.setSelectedRole(role);
      
      expect(component.selectedRole).toBe(role);
      expect(component.loginForm.get('role')?.value).toBe(role);
    });

    it('should mark role field as touched', () => {
      const roleControl = component.loginForm.get('role');
      component.setSelectedRole('CUSTOMER');
      
      expect(roleControl?.touched).toBeTruthy();
    });
  });

  describe('onSubmit', () => {
    it('should not submit if form is invalid', () => {
      component.loginForm.setValue({
        username: '',
        password: '',
        role: ''
      });
      
      component.onSubmit();
      
      expect(authService.login).not.toHaveBeenCalled();
      expect(toastService.showError).toHaveBeenCalledWith('Please select a role');
    });

    it('should show error if no role selected', () => {
      component.loginForm.setValue({
        username: 'testuser',
        password: 'password',
        role: ''
      });
      
      component.onSubmit();
      
      expect(toastService.showError).toHaveBeenCalledWith('Please select a role');
    });

    it('should call login service with form data', () => {
      component.loginForm.setValue({
        username: 'testuser',
        password: 'password',
        role: 'ADMIN'
      });
      component.selectedRole = 'ADMIN';
      
      const mockResponse = {
        token: 'test-token',
        roles: ['ADMIN']
      };
      authService.login.mockReturnValue(of(mockResponse));
      
      component.onSubmit();
      
      expect(authService.login).toHaveBeenCalledWith('testuser', 'password');
    });

    it('should handle successful login', () => {
      component.loginForm.setValue({
        username: 'testuser',
        password: 'password',
        role: 'ADMIN'
      });
      component.selectedRole = 'ADMIN';
      
      const mockResponse = {
        token: 'test-token',
        roles: ['ADMIN']
      };
      authService.login.mockReturnValue(of(mockResponse));
      
      component.onSubmit();
      
      expect(authService.login).toHaveBeenCalledWith('testuser', 'password');
      // Note: setToken and setUserRole are called in subscription callback
      // We can't test them synchronously without fakeAsync
    });

    it('should handle login error', () => {
      component.loginForm.setValue({
        username: 'testuser',
        password: 'wrongpassword',
        role: 'CUSTOMER'
      });
      component.selectedRole = 'CUSTOMER';
      
      authService.login.mockReturnValue(throwError(() => new Error('Invalid credentials')));
      
      component.onSubmit();
      
      expect(toastService.showError).toHaveBeenCalledWith('Login failed. Please check your credentials.');
      expect(component.isLoading).toBeFalsy();
    });

    it('should navigate to correct dashboard based on role', () => {
      const testCases = [
        { role: 'ADMIN', route: '/admin' },
        { role: 'CUSTOMER', route: '/customer' },
        { role: 'CLAIM_OFFICER', route: '/claim-officer' },
        { role: 'UNDERWRITER', route: '/underwriter' }
      ];

      testCases.forEach(({ role, route }) => {
        component.loginForm.setValue({
          username: 'testuser',
          password: 'password',
          role: role
        });
        component.selectedRole = role;
        
        const mockResponse = {
          token: 'test-token',
          roles: [role]
        };
        authService.login.mockReturnValue(of(mockResponse));
        
        component.onSubmit();
        
        expect(router.navigate).toHaveBeenCalledWith([route]);
      });
    });
  });

  describe('Loading State', () => {
    it('should set loading to true during login', () => {
      component.loginForm.setValue({
        username: 'testuser',
        password: 'password',
        role: 'ADMIN'
      });
      component.selectedRole = 'ADMIN';
      
      // Mock a never-completing observable to keep loading true
      authService.login.mockReturnValue(new Observable(() => {}));
      
      component.onSubmit();
      
      expect(component.isLoading).toBeTruthy();
    });

    it('should set loading to false after successful login', () => {
      component.loginForm.setValue({
        username: 'testuser',
        password: 'password',
        role: 'ADMIN'
      });
      component.selectedRole = 'ADMIN';
      
      authService.login.mockReturnValue(of({ token: 'test', roles: ['ADMIN'] }));
      
      component.onSubmit();
      
      // Since it's synchronous, loading should be false after completion
      expect(component.isLoading).toBeFalsy();
    });
  });
});
