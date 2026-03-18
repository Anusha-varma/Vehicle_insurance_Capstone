import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PolicyService, PolicySubscription } from '../../services/policy.service';
import { ClaimService, ClaimResponse } from '../../services/claim.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './customer-dashboard.html'
})
export class CustomerDashboardComponent implements OnInit {
  policies: PolicySubscription[] = [];
  filteredPolicies: PolicySubscription[] = [];
  claims: ClaimResponse[] = [];
  loadingPolicies = true;
  loadingClaims = true;
  successMessage: string | null = null;
  selectedPolicyId: number | null = null;
showPaymentModal = false;
selectedPolicy: any = null;
isProcessingPayment = false;
transactionId: string | null = null;
  // Renew State
  renewingSubscriptionId: number | null = null;

  // Claim Modal State
  isClaimModalOpen = false;
  currentClaimSubscriptionId: number | null = null;

  searchTerm: string = '';
  filterType: string = 'ALL';

  constructor(
    private policyService: PolicyService,
    private claimService: ClaimService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {
    // Check for success message from navigation state
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { successMessage?: string };
    if (state?.successMessage) {
      this.successMessage = state.successMessage;
      // Auto-hide the message after 5 seconds
      setTimeout(() => {
        this.successMessage = null;
        this.cdr.detectChanges();
      }, 5000);
    }
  }

  ngOnInit(): void {
    this.loadMyPolicies();
    this.loadMyClaims();
  }

  loadMyPolicies(): void {
    this.policyService.getMyPolicies().subscribe({
      next: (data) => {
        console.log('My policies:', data);
        this.policies = data || [];
        this.filteredPolicies = [...this.policies];
        this.loadingPolicies = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load policies', err);
        this.policies = [];
        this.filteredPolicies = [];
        this.loadingPolicies = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadMyClaims(): void {
    this.claimService.getMyClaims().subscribe({
      next: (data) => {
        console.log('My claims:', data);
        // Extract riskScore from policySubscription
        this.claims = (data || []).map((claim: any) => {
          const sub = claim.policySubscription;
          return {
            ...claim,
            riskScore: sub?.riskScore ?? claim.riskScore,
            coverageAmount: sub?.coverageAmount || claim.coverageAmount,
            premium: sub?.totalPremium || claim.premium,
            policyName: sub?.policy?.name || claim.policyName
          };
        });
        this.loadingClaims = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load claims', err);
        this.claims = [];
        this.loadingClaims = false;
        this.cdr.detectChanges();
      }
    });
  }

  getStatusClass(status: string | undefined): string {
    const s = (status || '').toUpperCase();
    if (s === 'APPROVED' || s === 'ACTIVE') {
      return 'bg-[#C2185B] text-white';
    } else if (s === 'PENDING') {
      return 'border border-[#C2185B] text-[#C2185B]';
    } else if (s === 'REJECTED') {
      return 'bg-red-600 text-white';
    }
    return 'bg-gray-400 text-white';
  }

  getPolicyStatusClass(status: string | undefined): string {
    const s = (status || '').toUpperCase();
    if (s === 'APPROVED' || s === 'ACTIVE') {
      return 'bg-green-600 text-white';
    } else if (s === 'PENDING') {
      return 'bg-yellow-500 text-white';
    } else if (s === 'REJECTED' || s === 'EXPIRED') {
      return 'bg-red-600 text-white';
    }
    return 'bg-gray-400 text-white';
  }

  getClaimStatusClass(status: string | undefined): string {
    const s = (status || '').toUpperCase();
    if (s === 'APPROVED') {
      return 'bg-green-600 text-white'; // green
    } else if (s === 'PENDING') {
      return 'bg-yellow-500 text-white'; // yellow
    } else if (s === 'UNDER_REVIEW') {
      return 'bg-[#C2185B] text-white'; // pink
    } else if (s === 'REJECTED') {
      return 'bg-red-600 text-white'; // red
    }
    return 'bg-gray-400 text-white';
  }

  getRiskScoreClass(riskScore: number | undefined): string {
    if (!riskScore) return 'text-gray-500';
    if (riskScore < 1.5) return 'text-green-600'; // low risk - green
    if (riskScore < 2.5) return 'text-[#C2185B]'; // medium risk - pink
    return 'text-red-600'; // high risk - red
  }

  showClaims(policyId: number | undefined): void {
    if (!policyId) return;
    this.selectedPolicyId = policyId;
  }

  hideClaims(): void {
    this.selectedPolicyId = null;
  }

  openClaimModal(subscriptionId: number | undefined): void {
    if (!subscriptionId) return;
    this.currentClaimSubscriptionId = subscriptionId;
    this.isClaimModalOpen = true;
  }

  closeClaimModal(event?: any): void {
    this.isClaimModalOpen = false;
    this.currentClaimSubscriptionId = null;

    // If a claim was submitted successfully (or we just want to refresh), reload claims
    if (event && event.success) {
      this.successMessage = 'Your claim has been submitted successfully!';
      this.loadMyClaims();

      // Auto-hide the message after 5 seconds
      setTimeout(() => {
        this.successMessage = null;
        this.cdr.detectChanges();
      }, 5000);
    }
  }

  getClaimsForPolicy(subscriptionId: number | undefined): any[] {
    if (!subscriptionId) return [];
    return this.claims.filter(c =>
      c.subscriptionId === subscriptionId ||
      (c as any).policySubscription?.id === subscriptionId
    );
  }

  onSearch(): void {
    this.applyFilters();
  }

  setFilter(type: string): void {
    this.filterType = type;
    this.applyFilters();
  }

  private applyFilters(): void {
    let result = this.policies;

    // Apply text search
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      result = result.filter(sub => {
        const pName = sub.policy?.name?.toLowerCase() || sub.policyName?.toLowerCase() || '';
        const vModel = sub.vehicleModel?.toLowerCase() || '';
        const vNum = sub.vehicleNumber?.toLowerCase() || '';
        return pName.includes(term) || vModel.includes(term) || vNum.includes(term);
      });
    }

    // Apply category filter
    if (this.filterType !== 'ALL') {
      result = result.filter(sub => {
        const pType = sub.policy?.vehicleType?.toUpperCase() || 'COMPREHENSIVE';
        return pType === this.filterType.toUpperCase();
      });
    }

    this.filteredPolicies = result;
  }

  renewPolicy(subscriptionId: number | undefined): void {
    if (!subscriptionId) return;
    
    this.renewingSubscriptionId = subscriptionId;
    this.toastService.showInfo('Processing renewal...');
    
    this.policyService.renewPolicy(subscriptionId).subscribe({
        next: (res: any) => {
            this.renewingSubscriptionId = null;
            this.toastService.showSuccess('Policy renewed successfully!');
            // Reload the dashboard to show the new subscription
            this.loadingPolicies = true;
            this.loadMyPolicies();
        },
        error: (err: any) => {
            console.error('Renewal failed', err);
            this.renewingSubscriptionId = null;
            const msg = err.error?.message || err.error || 'Failed to renew policy.';
            this.toastService.showError(msg);
            this.cdr.detectChanges();
        }
    });
  }
openPaymentModal(subscription: any) {
  this.selectedPolicy = subscription;
  this.showPaymentModal = true;
}
closePaymentModal() {
  this.showPaymentModal = false;
  this.selectedPolicy = null;
}
payNow() {

  if (!this.selectedPolicy) return;

  this.isProcessingPayment = true;

  setTimeout(() => {

    this.transactionId = "TXN" + Math.floor(Math.random() * 100000000);

    this.policyService.payPremium(this.selectedPolicy.id, this.transactionId)
    .subscribe({
      next: () => {
        this.toastService.showSuccess(
          "Payment Successful! Transaction ID: " + this.transactionId
        );

        this.isProcessingPayment = false;
        this.showPaymentModal = false;
      },
   error: (err) => {

  console.error("Payment failed", err);

  let errorMessage = "Payment failed";

  if (err.error?.message) {
    errorMessage = err.error.message;
  } 
  else if (typeof err.error === 'string') {
    errorMessage = err.error;
  } 
  else if (err.message) {
    errorMessage = err.message;
  }

  this.toastService.showError(errorMessage);

  this.isProcessingPayment = false;
}
    });

  }, 2000);
}
createSubscription() {

  const policyId = this.selectedPolicy?.policyId || this.selectedPolicy?.id;

  this.policyService.subscribePolicy(policyId).subscribe({

    next: (res) => {
      console.log("Policy subscribed successfully", res);
    },

    error: (err) => {
      console.error("Subscription failed", err);
    }

  });

}
}
