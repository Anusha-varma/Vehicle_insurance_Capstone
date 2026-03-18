import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { PolicyService, Policy } from '../../services/policy.service';
import { ToastService } from '../../services/toast.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { tap } from 'rxjs/operators';
import { forkJoin } from 'rxjs';

export interface AddOn {
  id: number;
  name: string;
  price: number;
}

@Component({
  selector: 'app-apply-policy',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './apply-policy.html'
})
export class ApplyPolicyComponent implements OnInit, OnDestroy {
  form: FormGroup;
  policyId: number | null = null;
  policy: Policy | null = null;
  submitting = false;
  loading = true;

  estimatedPremium = 0;
  selectedAddOns: number[] = [];

  // File upload properties
  selectedFiles: {
    drivingLicense: File | null;
    vehicleRegistration: File | null;
    additional: File[];
  } = {
    drivingLicense: null,
    vehicleRegistration: null,
    additional: []
  };

  addOns: AddOn[] = [
    { id: 1, name: 'Roadside Assistance', price: 500 },
    { id: 2, name: 'Accident Forgiveness', price: 800 },
    { id: 3, name: 'Zero Depreciation', price: 1200 },
    { id: 4, name: 'Return To Invoice', price: 1500 }
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private policyService: PolicyService,
    private toastService: ToastService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      vehicleAge: ['', [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.policyId = params['policyId'];
      if (this.policyId) {
        this.loadPolicy();
      }
    });

    this.form.get('vehicleAge')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.calculatePremium());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadPolicy(): void {
    if (!this.policyId) return;

    this.policyService.getPolicyById(this.policyId).subscribe({
      next: (policy) => {
        this.policy = policy;
        this.loading = false;
        this.calculatePremium();
      },
      error: (err) => {
        console.error('Failed to load policy', err);
        this.toastService.showError('Failed to load policy details.');
        this.loading = false;
      }
    });
  }

  toggleAddOn(addOnId: number): void {
    const index = this.selectedAddOns.indexOf(addOnId);
    if (index > -1) {
      this.selectedAddOns.splice(index, 1);
    } else {
      this.selectedAddOns.push(addOnId);
    }
    this.calculatePremium();
  }

  isAddOnSelected(addOnId: number): boolean {
    return this.selectedAddOns.includes(addOnId);
  }

  calculatePremium(): void {
    if (!this.policy) return;

    const basePremium = Number(this.policy.basePremium) || 0;
    const selectedAddOnPrices = this.addOns
      .filter((addon) => this.selectedAddOns.includes(addon.id))
      .reduce((sum, addon) => sum + addon.price, 0);

    this.estimatedPremium = basePremium + selectedAddOnPrices;
  }

  onSubmit(): void {
    if (this.form.invalid || !this.policyId) {
      this.form.markAllAsTouched();
      return;
    }

    // Validate required documents
    if (!this.selectedFiles.drivingLicense || !this.selectedFiles.vehicleRegistration) {
      this.toastService.showError('Please upload all required documents (Driving License and Vehicle Registration)');
      return;
    }

    console.log('=== POLICY APPLICATION DEBUG ===');
    console.log('Policy ID (template):', this.policyId);
    console.log('Form data:', this.form.value);
    console.log('Selected files:', {
      drivingLicense: this.selectedFiles.drivingLicense?.name,
      vehicleRegistration: this.selectedFiles.vehicleRegistration?.name,
      additional: this.selectedFiles.additional.map(f => f.name)
    });

    this.submitting = true;
    const payload = this.form.value;

    // Step 1: Apply for policy first to get subscription ID
    console.log('Step 1: Applying for policy...');
    console.log('Calling API: POST /policy/' + this.policyId + '/apply');

    this.policyService.applyPolicy(this.policyId, payload).subscribe({
      next: (policyResponse) => {
        console.log('=== POLICY APPLICATION SUCCESS ===');
        console.log('Policy application response:', policyResponse);
        
        // Step 2: Upload documents to the created subscription
        const subscriptionId = policyResponse.id || policyResponse.subscriptionId || policyResponse.policySubscriptionId;
        console.log('Step 2: Uploading documents to subscription ID:', subscriptionId);
        
        if (!subscriptionId) {
          console.error('No subscription ID found in policy response');
          this.toastService.showError('Policy created but failed to upload documents');
          this.submitting = false;
          return;
        }

        this.uploadDocumentsToSubscription(subscriptionId);
      },
      error: (err) => {
        console.log('=== POLICY APPLICATION ERROR ===');
        console.log('Error:', err);
        console.log('Error status:', err.status);
        console.log('Error message:', err.message);
        const errorMessage = typeof err.error === 'string' ? err.error : err.error?.message || err.message || 'Failed to apply policy. Please try again.';
        this.toastService.showError(errorMessage);
        this.submitting = false;
        this.cdr.detectChanges();
      }
    });
  }

  private uploadDocumentsToSubscription(subscriptionId: number): void {
    console.log('=== UPLOADING DOCUMENTS TO SUBSCRIPTION ===');
    console.log('Subscription ID:', subscriptionId);

    const uploadPromises = [];

    // Upload driving license
    if (this.selectedFiles.drivingLicense) {
      console.log('Uploading driving license...');
      uploadPromises.push(
        this.policyService.uploadPolicyDocument(subscriptionId, this.selectedFiles.drivingLicense, 'DRIVING_LICENSE').pipe(
          tap(() => console.log('Driving license uploaded successfully'))
        )
      );
    }

    // Upload vehicle registration
    if (this.selectedFiles.vehicleRegistration) {
      console.log('Uploading vehicle registration...');
      uploadPromises.push(
        this.policyService.uploadPolicyDocument(subscriptionId, this.selectedFiles.vehicleRegistration, 'VEHICLE_REGISTRATION').pipe(
          tap(() => console.log('Vehicle registration uploaded successfully'))
        )
      );
    }

    // Upload additional documents
    this.selectedFiles.additional.forEach((file, index) => {
      console.log(`Uploading additional document ${index + 1}:`, file.name);
      uploadPromises.push(
        this.policyService.uploadPolicyDocument(subscriptionId, file, 'ADDITIONAL_DOCUMENT').pipe(
          tap(() => console.log(`Additional document ${index + 1} uploaded successfully`))
        )
      );
    });

    // Wait for all uploads to complete
    forkJoin(uploadPromises).subscribe({
      next: (results: any[]) => {
        console.log('=== ALL DOCUMENTS UPLOADED SUCCESSFULLY ===');
        console.log('Upload results:', results);
        this.submitting = false;
        this.toastService.showSuccess('Policy applied successfully with all documents — redirecting…');
        this.cdr.detectChanges();
        setTimeout(() => this.router.navigate(['/customer']), 1200);
      },
      error: (err: any) => {
        console.log('=== DOCUMENT UPLOAD ERROR ===');
        console.log('Error:', err);
        console.log('Error status:', err.status);
        this.toastService.showError('Policy applied but some documents failed to upload');
        this.submitting = false;
        this.cdr.detectChanges();
      }
    });
  }

  // File handling methods
  onFileSelect(event: Event, documentType: 'drivingLicense' | 'vehicleRegistration' | 'additional'): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    if (documentType === 'additional') {
      this.selectedFiles.additional = Array.from(input.files);
    } else {
      this.selectedFiles[documentType] = input.files[0];
    }
  }

  removeFile(documentType: 'drivingLicense' | 'vehicleRegistration'): void {
    this.selectedFiles[documentType] = null;
  }

  removeAdditionalFile(index: number): void {
    this.selectedFiles.additional.splice(index, 1);
  }
}
