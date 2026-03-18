import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { ClaimService, ClaimRequest, ClaimResponse, DocumentUpload } from '../../services/claim.service';
import { PolicyService, PolicySubscription } from '../../services/policy.service';
import { ToastService } from '../../services/toast.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface UploadedDocument {
  name: string;
  type: string;
  status: 'uploading' | 'uploaded' | 'error';
}

@Component({
  selector: 'app-claim-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
  templateUrl: './claim-form.html'
})
export class ClaimFormComponent implements OnInit, OnDestroy {
  form: FormGroup;
  subscriptionId: number | null = null;
  subscription: PolicySubscription | null = null;
  submitting = false;
  success = false;
  loading = true;

  // Claim submission result
  submittedClaimId: number | null = null;
  showDocumentUpload = false;

  // Document upload - files to submit with claim
  damagePhotos: File[] = [];
  documentTypes = ['Damage Photo', 'Garage Estimate', 'FIR Report', 'RC Copy'];
  selectedDocumentType = 'Damage Photo';
  uploading = false;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private claimService: ClaimService,
    private policyService: PolicyService,
    private toastService: ToastService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      claimType: ['SELF', Validators.required],
      claimAmount: ['', [Validators.required, Validators.min(1)]],
      reason: ['', [Validators.required, Validators.minLength(10)]],
      thirdPartyName: [''],
      thirdPartyVehicleNumber: [''],
      injuryType: [''],
      garageEstimate: [''],
      damageDescription: ['']
    });

    // Subscribe to claim type changes for conditional validation
    this.form.get('claimType')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(type => {
      this.updateConditionalValidations();
    });

    this.form.get('injuryType')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(type => {
      this.updateConditionalValidations();
    });
  }

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.subscriptionId = +params['subscriptionId'];
      if (this.subscriptionId) {
        this.loadSubscription();
      }
    });
  }

  updateConditionalValidations(): void {
    const claimType = this.form.get('claimType')?.value;
    const injuryType = this.form.get('injuryType')?.value;

    const tpNameCtrl = this.form.get('thirdPartyName');
    const tpVehicleCtrl = this.form.get('thirdPartyVehicleNumber');
    const tpEstimateCtrl = this.form.get('garageEstimate');

    if (claimType === 'THIRD_PARTY') {
      tpNameCtrl?.setValidators([Validators.required]);
      tpVehicleCtrl?.setValidators([Validators.required]);

      if (injuryType === 'VEHICLE_DAMAGE') {
        tpEstimateCtrl?.setValidators([Validators.required, Validators.min(1)]);
        tpEstimateCtrl?.enable();
      } else {
        tpEstimateCtrl?.clearValidators();
        tpEstimateCtrl?.disable();
        tpEstimateCtrl?.setValue('');
      }
    } else {
      tpNameCtrl?.clearValidators();
      tpVehicleCtrl?.clearValidators();
      tpEstimateCtrl?.clearValidators();
      tpEstimateCtrl?.disable();
      tpEstimateCtrl?.setValue('');
    }

    tpNameCtrl?.updateValueAndValidity();
    tpVehicleCtrl?.updateValueAndValidity();
    tpEstimateCtrl?.updateValueAndValidity();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadSubscription(): void {
    console.log('Loading subscription for ID:', this.subscriptionId);
    this.policyService.getMyPolicies().subscribe({
      next: (policies) => {
        console.log('Policies received:', policies);
        this.subscription = policies.find(
          (p) => {
            const pId = p.id || p.subscriptionId;
            console.log('Checking policy:', pId, 'against:', this.subscriptionId);
            return pId === this.subscriptionId;
          }
        ) || null;
        console.log('Found subscription:', this.subscription);
        this.loading = false;

        if (!this.subscription) {
          this.toastService.showError('Policy subscription not found.');
        } else if (this.subscription.status?.toUpperCase() !== 'APPROVED') {
          this.toastService.showError('Claims can only be filed for approved policies.');
        } else {
          // If policy is THIRD_PARTY, default to THIRD_PARTY claim type
          if (this.subscription.policy?.policyType === 'THIRD_PARTY') {
            this.form.get('claimType')?.setValue('THIRD_PARTY');
          }
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load subscription', err);
        this.toastService.showError('Failed to load policy details.');
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid || !this.subscriptionId) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;

    // Build the payload: extract third-party fields only if type is THIRD_PARTY
    const formVal = this.form.value;
    const payload: any = {
      claimType: formVal.claimType,
      claimAmount: formVal.claimAmount,
      reason: formVal.reason
    };

    if (formVal.claimType === 'THIRD_PARTY') {
      payload.thirdPartyName = formVal.thirdPartyName;
      payload.thirdPartyVehicleNumber = formVal.thirdPartyVehicleNumber;
      payload.injuryType = formVal.injuryType;
      payload.garageEstimate = formVal.garageEstimate;
      payload.damageDescription = formVal.damageDescription;
    }

    console.log('--- DEBUG FRONTEND SUBMISSION ---');
    console.log('Sending payload:', JSON.stringify(payload, null, 2));
    console.log('Damage photos attached:', this.damagePhotos.length);
    console.log('---------------------------------');

    // Adding dynamic endpoint routing (JSON vs multipart) to prevent the backend 
    // from discarding Third-Party metadata when using the multipart form data endpoint.
    let submitRequest$;
    if (this.damagePhotos.length > 0) {
      submitRequest$ = this.claimService.applyClaimWithDocuments(
        this.subscriptionId,
        payload,
        this.damagePhotos
      );
    } else {
      submitRequest$ = this.claimService.applyClaim(
        this.subscriptionId,
        payload
      );
    }

    submitRequest$.subscribe({
      next: (response: ClaimResponse) => {
        console.log('Claim submitted successfully:', response);
        this.submitting = false;
        // Redirect immediately to dashboard with success message
        this.router.navigate(['/customer'], {
          state: { successMessage: 'Your claim has been submitted successfully!' }
        });
      },
      error: (err) => {
        console.error('Claim submission failed', err);
        let errorMessage = 'Failed to submit claim. Please try again.';
        if (err.status === 403) {
          errorMessage = err.error?.message || err.error || 'Access denied';
        } else if (err.error?.message) {
          errorMessage = err.error.message;
        } else if (typeof err.error === 'string') {
          errorMessage = err.error;
        } else if (err.message) {
          errorMessage = err.message;
        }
        
        this.toastService.showError(errorMessage);
        this.submitting = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Handle file selection for damage photos
  onDamagePhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || !input.files.length) return;

    // Add all selected files
    for (let i = 0; i < input.files.length; i++) {
      const file = input.files[i];
      // Only accept images
      if (file.type.startsWith('image/') || file.type === 'application/pdf') {
        this.damagePhotos.push(file);
      }
    }
    input.value = ''; // Reset input for re-selection
  }

  removePhoto(index: number): void {
    this.damagePhotos.splice(index, 1);
  }

  finishAndRedirect(): void {
    this.router.navigate(['/customer'], {
      state: { successMessage: 'Your claim has been submitted successfully!' }
    });
  }
}
