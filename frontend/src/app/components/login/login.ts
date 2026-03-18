import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {

  loginForm: FormGroup;
  selectedRole = '';
  isLoading = false;

  constructor(
    private fb: FormBuilder, 
    private authService: AuthService, 
    private toastService: ToastService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      role: ['', Validators.required]
    });
  }


  setSelectedRole(role: string) {
    this.selectedRole = role;
    this.loginForm.get('role')?.setValue(role);
    this.loginForm.get('role')?.markAsTouched();
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      if (!this.selectedRole) {
        this.toastService.showError('Please select a role');
      }
      return;
    }
    // Clear any existing token before logging in
    this.authService.logout();
    this.isLoading = true;
    const { username, password } = this.loginForm.value;
    this.authService.login(username, password).subscribe({
      next: (body: any) => {
        this.isLoading = false;
        this.toastService.showSuccess('Login successful');
        // backend may return role information in different shapes
        const roleStr =
          body?.role ||
          (Array.isArray(body?.roles) && (body.roles[0]?.authority || body.roles[0])) ||
          (Array.isArray(body?.authorities) && (body.authorities[0]?.authority || body.authorities[0])) ||
          null;

        const role = (roleStr || this.selectedRole || '').toString().toUpperCase();

        // Store the role in AuthService
        this.authService.setUserRole(role);

        if (role.includes('CUSTOMER')) {
          this.router.navigate(['/customer']);
        } else if (role.includes('ADMIN')) {
          this.router.navigate(['/admin']);
        } else if (role.includes('CLAIM') || role.includes('CLAIM_OFFICER') || role.includes('CLAIM-OFFICER')) {
          this.router.navigate(['/claim-officer']);
        } else if (role.includes('UNDERWRITER')) {
          this.router.navigate(['/underwriter']);
        } else {
          // fallback
          this.router.navigate(['/']);
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Login error', err);
        let errorMessage = 'Login failed. Please check your credentials.';
        if (err.status === 403 || err.status === 401) {
          errorMessage = 'Invalid username or password.';
        } else if (err.error?.message) {
          errorMessage = err.error.message;
        } else if (typeof err.error === 'string') {
          errorMessage = err.error;
        }
        
        this.toastService.showError(errorMessage);
      }
    });
  }
}
