
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PolicyService } from '../../services/policy.service';
import { ToastService } from '../../services/toast.service';
import { PolicyDocumentService } from '../../services/policy-document.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-underwriter-dashboard',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './underwriter-dashboard.html',
  styleUrls: ['./underwriter-dashboard.css']
})
export class UnderwriterDashboardComponent implements OnInit {
  pendingPolicies: any[] = [];
  filteredPolicies: any[] = [];
  totalApplications = 0;
  showPremiumModal=false
premiumDetails:any=null
loadingPremium=false
pendingCount = 0;
approvedCount = 0;
rejectedCount = 0;
commissionEarned = 0;
activeTab: 'pending' | 'history' = 'pending';
statusFilter: 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED' = 'ALL';
  loading = false;
  error = '';
  
  searchText = '';
  // Modal state
  showDocumentModal = false;
  selectedPolicy: any = null;
  documents: any[] = [];
  loadingDocuments = false;
  processingPolicyId: number | null = null;

approvalRate = 0;
averageRiskScore = 0;

  constructor(
    private policyService: PolicyService,
    private toastService: ToastService,
    private policyDocumentService: PolicyDocumentService
  ) {}

  ngOnInit() {
    this.loadPendingPolicies();
    this.policyService.getUnderwriterCommission().subscribe(res => {
  this.commissionEarned = res || 0;
});
  }

  loadPendingPolicies() {
    this.loading = true;
    this.error = '';
    
    this.policyService.getAllPolicyApplications().subscribe({
      next: (policies: any[]) => {
  this.pendingPolicies = policies || [];
 

  this.totalApplications = this.pendingPolicies.length;

  this.pendingCount = this.pendingPolicies.filter(
    p => p.status?.toUpperCase() === 'PENDING'
  ).length;

  this.approvedCount = this.pendingPolicies.filter(
    p => p.status?.toUpperCase() === 'APPROVED'
  ).length;

  this.rejectedCount = this.pendingPolicies.filter(
    p => p.status?.toUpperCase() === 'REJECTED'
  ).length;
this.applyFilters();
  // Approval rate
  if (this.totalApplications > 0) {
    this.approvalRate = Math.round(
      (this.approvedCount / this.totalApplications) * 100
    );
  }

  // Average risk score
  const riskScores = this.pendingPolicies
    .map(p => p.riskScore)
    .filter(r => r != null);

  if (riskScores.length > 0) {
    const total = riskScores.reduce((sum, r) => sum + r, 0);
    this.averageRiskScore = Number((total / riskScores.length).toFixed(2));
  }

  this.loading = false;
},
      error: (err) => {
        console.error('Failed to load pending policies', err);
        this.error = 'Failed to load pending policies. Please try again.';
        this.loading = false;
      }
    });
  }

  approvePolicy(policy: any) {
    this.processingPolicyId = policy.id;
    
    this.policyService.approvePolicyRequest(policy.id).subscribe({
      next: () => {
        this.loadPendingPolicies();
        this.processingPolicyId = null;
      },
      error: (err) => {
        console.error('Failed to approve policy', err);
        this.error = 'Failed to approve policy. Please try again.';
        this.processingPolicyId = null;
      }
    });
  }
viewPremiumDetails(policy:any){

this.showPremiumModal=true
this.loadingPremium=true

this.policyService.getPremiumBreakdown(policy.id).subscribe({

next:(res)=>{

this.premiumDetails=res
this.loadingPremium=false

},

error:()=>{
this.loadingPremium=false
}

})

}
  rejectPolicy(policy: any) {
    this.processingPolicyId = policy.id;
    
    this.policyService.rejectPolicyRequest(policy.id).subscribe({
      next: () => {
        this.loadPendingPolicies();
        this.processingPolicyId = null;
      },
      error: (err) => {
        console.error('Failed to reject policy', err);
        this.error = 'Failed to reject policy. Please try again.';
        this.processingPolicyId = null;
      }
    });
  }

  viewDocuments(policy: any) {
    console.log('=== UNDERWRITER DOCUMENT VIEW DEBUG ===');
    console.log('Policy object:', policy);
    console.log('Policy keys:', Object.keys(policy));
    
    this.selectedPolicy = policy;
    this.showDocumentModal = true;
    this.loadingDocuments = true;
    this.documents = [];

    // For pending applications, use subscription ID with the correct endpoint
    const subscriptionId = policy.id || policy.subscriptionId || policy.policySubscriptionId;
    const policyId = policy.policyId;

    console.log('Policy object details:', {
      id: policy.id,
      policyId: policy.policyId,
      subscriptionId: policy.subscriptionId,
      policySubscriptionId: policy.policySubscriptionId,
      status: policy.status
    });

    console.log('Using subscription ID for pending application:', subscriptionId);
    console.log('Policy ID (for approved policies):', policyId);

    if (!subscriptionId) {
      console.error('No valid subscription ID found in policy:', policy);
      this.documents = [];
      this.loadingDocuments = false;
      return;
    }

    // Use the correct endpoint for pending applications
    console.log('Calling API: GET /policy-subscription/' + subscriptionId + '/documents');

    this.policyService.getUnderwriterApplicationDocuments(subscriptionId).subscribe({
      next: (docs) => {
        console.log('=== DOCUMENT RETRIEVAL SUCCESS ===');
        console.log('Documents received:', docs);
        console.log('Documents count:', docs?.length || 0);
        this.documents = docs || [];
        this.loadingDocuments = false;
      },
      error: (err) => {
        console.log('=== DOCUMENT RETRIEVAL ERROR ===');
        console.log('Error:', err);
        console.log('Error status:', err.status);
        console.log('Error message:', err.message);
        this.documents = [];
        this.loadingDocuments = false;
        this.toastService.showError('Failed to load documents');
      }
    });
  }

  closeDocumentModal() {
    this.showDocumentModal = false;
    this.selectedPolicy = null;
    this.documents = [];
    this.loadingDocuments = false;
  }

  // Helper methods for styling
  getStatusClass(status: string): string {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    const statusUpper = status.toUpperCase();
    switch (statusUpper) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'UNDER_REVIEW':
        return 'bg-blue-100 text-blue-800';
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getRiskScoreClass(riskScore: number): string {
    if (!riskScore) return 'text-gray-500';
    
    if (riskScore <= 30) return 'text-green-600';
    if (riskScore <= 60) return 'text-yellow-600';
    return 'text-red-600';
  }

  getRiskLevel(riskScore: number): string {
    if (!riskScore) return 'Unknown';
    
    if (riskScore <= 30) return 'Low';
    if (riskScore <= 60) return 'Medium';
    return 'High';
  }

  isImageFile(doc: any): boolean {
    if (!doc || !doc.fileName) return false;
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
    const extension = doc.fileName.split('.').pop()?.toLowerCase();
    return imageExtensions.includes(extension || '');
  }

  getDocumentDownloadUrl(doc: any): string {
    // Use the new underwriter-specific download endpoint
    const policyId = this.selectedPolicy?.id || this.selectedPolicy?.policyId;
    if (policyId && doc?.id) {
      return this.policyService.getUnderwriterDocumentDownloadUrl(policyId, doc.id);
    }
    
    // Fallback to other URL patterns
    if (doc.filePath) {
      return `http://localhost:8080${doc.filePath}`;
    }
    if (doc.fileUrl) {
      return doc.fileUrl;
    }
    if (doc.downloadUrl) {
      return doc.downloadUrl;
    }
    return '#';
  }
applyFilters() {
  let policies = [...this.pendingPolicies];

  // TAB FILTER
  if (this.activeTab === 'pending') {
    policies = policies.filter(
      p => p.status?.toUpperCase() === 'PENDING'
    );
  }

  if (this.activeTab === 'history') {
    policies = policies.filter(
      p =>
        p.status?.toUpperCase() === 'APPROVED' ||
        p.status?.toUpperCase() === 'REJECTED'
    );

    // STATUS FILTER only for history tab
    if (this.statusFilter !== 'ALL') {
      policies = policies.filter(
        p => p.status?.toUpperCase() === this.statusFilter
      );
    }
  }

  // SEARCH
  if (this.searchText) {
    const search = this.searchText.toLowerCase();

    policies = policies.filter(
      p =>
        p.vehicleNumber?.toLowerCase().includes(search) ||
        p.policy?.name?.toLowerCase().includes(search) ||
        p.customerName?.toLowerCase().includes(search)
    );
  }

  this.filteredPolicies = policies;
}
setTab(tab: 'pending' | 'history') {
  this.activeTab = tab;
  this.statusFilter = 'ALL';
  this.applyFilters();
}
}
