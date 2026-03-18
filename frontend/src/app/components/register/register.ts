import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent {
  registerForm: FormGroup;
  selectedRole = '';
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]]
    });
  }

  setSelectedRole(role: string) {
    this.selectedRole = role;
  }

  register() {
    if (this.registerForm.invalid || !this.selectedRole) {
      this.registerForm.markAllAsTouched();
      if (!this.selectedRole) {
        this.toastService.showError('Please select a role');
      }
      return;
    }

    this.isLoading = true;
    this.authService.register({
      username: this.registerForm.value.username,
      password: this.registerForm.value.password,
      email: this.registerForm.value.email,
      phone: this.registerForm.value.phone,
      role: this.selectedRole
    }).subscribe({
      next: () => {
        this.toastService.showSuccess('Registration successful!');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.toastService.showError(err?.error?.message || 'Registration failed');
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}
