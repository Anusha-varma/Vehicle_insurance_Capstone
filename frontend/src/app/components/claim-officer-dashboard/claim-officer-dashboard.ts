import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ClaimService, DocumentUpload } from '../../services/claim.service';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-claim-officer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule,FormsModule],
  templateUrl: './claim-officer-dashboard.html',
  styleUrls: ['./claim-officer-dashboard.css']
})
export class ClaimOfficerDashboardComponent implements OnInit {
  claims: any[] = [];
  loading = true;
  error: string | null = null;
  processingClaimId: number | null = null;
  commissionEarned = 0;
filteredClaims: any[] = [];
showDetailsModal = false;
selectedClaimDetails: any = null;
totalClaims = 0;
pendingCount = 0;
approvedCount = 0;
rejectedCount = 0;

activeTab: 'pending' | 'history' = 'pending';
statusFilter: 'ALL' | 'APPROVED' | 'REJECTED' = 'ALL';

searchText = '';


  // Document viewing
  selectedClaim: any = null;
  documents: DocumentUpload[] = [];
  loadingDocuments = false;
  showDocumentModal = false;

  constructor(
    private claimService: ClaimService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

ngOnInit(): void {
  this.loadPendingClaims();

  this.claimService.getClaimOfficerCommission().subscribe({
    next: (res) => {
      this.commissionEarned = res || 0;
      this.cdr.detectChanges();
    },
    error: (err) => {
      console.error("Failed to load commission", err);
    }
  });
}

  loadPendingClaims(): void {
    this.loading = true;
    this.claimService.getAllClaims().subscribe({
      next: (claims) => {
        console.log('Pending claims:', claims);
        console.log('First claim riskScore:', claims?.[0]?.riskScore);
        console.log('First claim full object:', JSON.stringify(claims?.[0], null, 2));
        
        // Extract nested policySubscription data
        this.claims = (claims || []).map((claim: any) => {
          const sub = claim.policySubscription;
          const policy = sub?.policy;
          const user = sub?.user || sub?.myUser;
          
          // Get vehicle year from subscription or claim
          const vehicleYear = claim.vehicleYear || sub?.vehicleYear;
          
          // Use riskScore from policySubscription (this is the correct value)
          const backendRiskScore = sub?.riskScore ?? claim.riskScore;
          
          return {
            ...claim,
            // Extract from claim directly first, then fallback to nested policySubscription
            customerName: claim.customerName || user?.username || user?.name || 'N/A',
            policyName: claim.policyName || policy?.name || sub?.policyName || 'N/A',
            riskScore: backendRiskScore,  // Use policySubscription.riskScore directly
            vehicleYear: vehicleYear,
            coverageAmount: claim.coverageAmount || sub?.coverageAmount || policy?.coverageAmount,
            premium: claim.premium || sub?.totalPremium || policy?.basePremium,
            vehicleNumber: claim.vehicleNumber || sub?.vehicleNumber,
            vehicleModel: claim.vehicleModel || sub?.vehicleModel
          };
        });



this.totalClaims = this.claims.length;

this.pendingCount = this.claims.filter(
  c => c.status?.toUpperCase() === 'PENDING'
).length;

this.approvedCount = this.claims.filter(
  c => c.status?.toUpperCase() === 'APPROVED'
).length;

this.rejectedCount = this.claims.filter(
  c => c.status?.toUpperCase() === 'REJECTED'
).length;

this.applyFilters();
        
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load pending claims', err);
        this.error = 'Failed to load claims';
        this.claims = [];
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  reviewClaim(claimId: number): void {
    this.processingClaimId = claimId;
    this.claimService.reviewClaim(claimId).subscribe({
      next: (updatedClaim) => {
        this.updateClaimInList(claimId, updatedClaim);
        this.processingClaimId = null;
      },
      error: (err) => {
        console.error('Failed to review claim', err);
        this.processingClaimId = null;
      }
    });
  }

  approveClaim(claimId: number): void {
    this.processingClaimId = claimId;
    this.claimService.approveClaim(claimId).subscribe({
      next: (updatedClaim) => {
        this.updateClaimInList(claimId, updatedClaim);
        this.processingClaimId = null;
        this.claimService.getClaimOfficerCommission().subscribe(res => {
  this.commissionEarned = res || 0;
});
      },
      error: (err) => {
        console.error('Failed to approve claim', err);
        this.processingClaimId = null;
      }
    });
  }

  rejectClaim(claimId: number): void {
    this.processingClaimId = claimId;
    this.claimService.rejectClaim(claimId).subscribe({
      next: (updatedClaim) => {
        this.updateClaimInList(claimId, updatedClaim);
        this.processingClaimId = null;
      },
      error: (err) => {
        console.error('Failed to reject claim', err);
        this.processingClaimId = null;
      }
    });
  }

private updateClaimInList(claimId: number, updatedClaim: any): void {

  const index = this.claims.findIndex(c => (c.id || c.claimId) === claimId);

  if (index !== -1) {
    this.claims[index] = { ...this.claims[index], ...updatedClaim };
  }

  // Recalculate dashboard counts
  this.totalClaims = this.claims.length;

  this.pendingCount = this.claims.filter(
    c => c.status?.toUpperCase() === 'PENDING'
  ).length;

  this.approvedCount = this.claims.filter(
    c => c.status?.toUpperCase() === 'APPROVED'
  ).length;

  this.rejectedCount = this.claims.filter(
    c => c.status?.toUpperCase() === 'REJECTED'
  ).length;

  // Reapply filters so table updates
  this.applyFilters();

  this.cdr.detectChanges();
}

  getStatusClass(status: string | undefined): string {
    const s = (status || '').toUpperCase();
    if (s === 'APPROVED') {
      return 'bg-green-600 text-white';
    } else if (s === 'PENDING') {
      return 'bg-yellow-500 text-white';
    } else if (s === 'UNDER_REVIEW') {
      return 'bg-[#C2185B] text-white';
    } else if (s === 'REJECTED') {
      return 'bg-red-600 text-white';
    }
    return 'bg-gray-400 text-white';
  }

  /**
   * Calculate risk score based on vehicle year
   * Newer vehicles = lower risk, older vehicles = higher risk
   * 
   * Risk calculation:
   * - 0-2 years old: 1.0 (Low Risk)
   * - 3-5 years old: 1.5 (Low-Medium Risk)
   * - 6-8 years old: 2.0 (Medium Risk)
   * - 9-12 years old: 2.5 (Medium-High Risk)
   * - 13+ years old: 3.0+ (High Risk)
   */
  calculateRiskFromVehicleYear(vehicleYear: number | null | undefined): number | null {
    if (!vehicleYear) {
      return null; // No vehicle year available
    }
    
    const currentYear = new Date().getFullYear();
    const vehicleAge = currentYear - vehicleYear;
    
    // Base risk calculation
    let riskScore: number;
    
    if (vehicleAge <= 2) {
      // Brand new or nearly new vehicle - lowest risk
      riskScore = 1.0;
    } else if (vehicleAge <= 5) {
      // Relatively new vehicle - low risk
      riskScore = 1.0 + (vehicleAge - 2) * 0.17; // 1.0 to 1.5
    } else if (vehicleAge <= 8) {
      // Moderately old vehicle - medium risk
      riskScore = 1.5 + (vehicleAge - 5) * 0.17; // 1.5 to 2.0
    } else if (vehicleAge <= 12) {
      // Older vehicle - medium-high risk
      riskScore = 2.0 + (vehicleAge - 8) * 0.125; // 2.0 to 2.5
    } else {
      // Very old vehicle - high risk (capped at 3.5)
      riskScore = Math.min(2.5 + (vehicleAge - 12) * 0.1, 3.5);
    }
    
    // Round to 1 decimal place
    return Math.round(riskScore * 10) / 10;
  }

  getRiskScoreClass(riskScore: number | undefined): string {
    if (!riskScore) return 'text-gray-500';
    if (riskScore < 1.5) return 'text-green-600';
    if (riskScore < 2.5) return 'text-[#C2185B]';
    return 'text-red-600';
  }

  getRiskLevel(riskScore: number | undefined): string {
    if (!riskScore) return 'Unknown';
    if (riskScore < 1.5) return 'Low Risk';
    if (riskScore < 2.5) return 'Medium Risk';
    return 'High Risk';
  }

  // Document viewing methods
  viewDocuments(claim: any): void {
    this.selectedClaim = claim;
    this.showDocumentModal = true;
    this.loadingDocuments = true;
    this.documents = [];
    
    const claimId = claim.id || claim.claimId;
    this.claimService.getClaimDocuments(claimId).subscribe({
      next: (docs) => {
        console.log('Documents loaded:', docs);
        this.documents = docs || [];
        this.loadingDocuments = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load documents', err);
        this.documents = [];
        this.loadingDocuments = false;
        this.cdr.detectChanges();
      }
    });
  }

  closeDocumentModal(): void {
    this.showDocumentModal = false;
    this.selectedClaim = null;
    this.documents = [];
  }

  getDocumentDownloadUrl(doc: DocumentUpload): string {
    const claimId = this.selectedClaim?.id || this.selectedClaim?.claimId;
    const docId = doc.id;
    if (!claimId || !docId) return '#';
    
    // Include auth token in URL for download
    const token = this.authService.getToken();
    return `http://localhost:8080/claims/${claimId}/documents/${docId}?token=${token}`;
  }

  isImageFile(doc: DocumentUpload): boolean {
    const fileName = doc.fileName || '';
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName);
  }
applyFilters() {
  let claims = [...this.claims];

  // TAB FILTER
  if (this.activeTab === 'pending') {
    claims = claims.filter(c => c.status?.toUpperCase() === 'PENDING');
  }

  if (this.activeTab === 'history') {
    claims = claims.filter(
      c =>
        c.status?.toUpperCase() === 'APPROVED' ||
        c.status?.toUpperCase() === 'REJECTED'
    );
  }

  // STATUS FILTER
  if (this.statusFilter !== 'ALL') {
    claims = claims.filter(
      c => c.status?.toUpperCase() === this.statusFilter
    );
  }

  // SEARCH
  if (this.searchText) {
    const search = this.searchText.toLowerCase();

    claims = claims.filter(
      c =>
        c.customerName?.toLowerCase().includes(search) ||
        c.policyName?.toLowerCase().includes(search) ||
        c.vehicleNumber?.toLowerCase().includes(search)
    );
  }

  this.filteredClaims = claims;
}

setTab(tab: 'pending' | 'history') {
  this.activeTab = tab;
  this.statusFilter = 'ALL';
  this.applyFilters();
}
openClaimDetails(claim: any) {
  this.selectedClaimDetails = claim;
  this.showDetailsModal = true;
}

closeClaimDetails() {
  this.showDetailsModal = false;
  this.selectedClaimDetails = null;
}
}
