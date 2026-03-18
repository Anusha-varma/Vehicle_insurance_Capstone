import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { PolicyService, Policy } from '../../services/policy.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-quote-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './quote-form.html'
})
export class QuoteFormComponent implements OnInit {
  form: FormGroup;
  policyId: number | null = null;
  policy: Policy | null = null;
  loading = true;
  submitting = false;

  rcFile: File | null = null;
  licenseFile: File | null = null;
  vehiclePhotoFile: File | null = null;
  idProofFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private policyService: PolicyService,
    private toastService: ToastService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      vehicleNumber: ['', Validators.required],
      vehicleModel: ['', Validators.required],
      vehicleYear: ['', [Validators.required, Validators.min(1900), Validators.max(2030)]],
      city: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      console.log('Route params:', params);
      const id = params['policyId'];
      if (id && !isNaN(+id)) {
        this.policyId = +id;
        this.loadPolicy();
      } else {
        console.error('Invalid policyId in route:', id);
        this.toastService.showError('Invalid policy ID');
        this.loading = false;
      }
    });
  }

  loadPolicy(): void {
    if (!this.policyId) return;

    console.log('Loading policy with ID:', this.policyId);
    
    // Load policy
    this.policyService.getPolicyById(this.policyId).subscribe({
      next: (policy) => {
        console.log('Policy loaded:', policy);
        this.policy = policy;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load policy', err);
        this.toastService.showError('Failed to load policy details.');
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onFileSelected(event: Event, type: string): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      switch (type) {
        case 'rc':
          this.rcFile = file;
          break;
        case 'license':
          this.licenseFile = file;
          break;
        case 'vehiclePhoto':
          this.vehiclePhotoFile = file;
          break;
        case 'idProof':
          this.idProofFile = file;
          break;
      }
    }
  }

  onSubmit(): void {
    if (this.form.invalid || !this.policyId) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;

    // Include vehicle details from the form
    const formValues = this.form.value;
    const payload = {
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(
        new Date().setFullYear(new Date().getFullYear() + 1)
      ).toISOString().split('T')[0],
      vehicleNumber: formValues.vehicleNumber,
      vehicleModel: formValues.vehicleModel,
      vehicleYear: formValues.vehicleYear,
      city: formValues.city
    };

    console.log('Submitting policy application with payload:', payload);

    // Build FormData with "data" as JSON Blob and files
    const formData = new FormData();
    formData.append(
      'data',
      new Blob([JSON.stringify(payload)], { type: 'application/json' })
    );

    if (this.rcFile) {
      formData.append('rcFile', this.rcFile);
    }
    if (this.licenseFile) {
      formData.append('licenseFile', this.licenseFile);
    }
    if (this.vehiclePhotoFile) {
      formData.append('vehiclePhoto', this.vehiclePhotoFile);
    }
    if (this.idProofFile) {
      formData.append('idProof', this.idProofFile);
    }

    this.policyService.applyPolicy(this.policyId, formData).subscribe({
      next: (res) => {
        console.log('Policy application submitted successfully', res);
        this.submitting = false;
        this.toastService.showSuccess('Policy application submitted successfully');
        this.cdr.detectChanges();
        setTimeout(() => this.router.navigate(['/customer']), 1500);
      },
      error: (err) => {
        console.error('Policy application failed', err);
        this.submitting = false;

        let errorMessage = 'Failed to submit application. Please try again.';
        if (err.status === 403) {
          errorMessage = err.error?.message || err.error || 'Access denied';
        } else if (err.status === 401) {
          errorMessage = 'Please login to apply for a policy.';
        } else if (err.error?.message) {
          errorMessage = err.error.message;
        } else if (typeof err.error === 'string') {
          errorMessage = err.error;
        } else if (err.message) {
          errorMessage = err.message;
        }
        
        this.toastService.showError(errorMessage);
        this.cdr.detectChanges();
      }
    });
  }
}
