// ...existing imports...
// ...existing class definition...
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { PolicyService, Policy } from '../../services/policy.service';
import { AdminService, CreateClaimOfficerRequest, CreateUnderwriterRequest } from '../../services/admin.service';
@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  policies: Policy[] = [];
  filteredPolicies: Policy[] = [];
  searchTerm: string = '';
  totalRevenue = 0;
underwriterCommission = 0;
claimOfficerCommission = 0;
  // Pagination State
  currentPage: number = 1;
  itemsPerPage: number = 3;

  // Mock stats for demonstration
totalUsers = 0;
pendingApprovals = 0;

  // Edit Modal State
  isEditModalOpen: boolean = false;
  editingPolicy: any = null;

  // Create Policy Modal State
  isCreatePolicyModalOpen: boolean = false;
  createPolicyForm: FormGroup;
  creatingPolicy: boolean = false;

  // Create Officer Modal State
  isCreateOfficerModalOpen: boolean = false;
  createOfficerForm: FormGroup;
  creatingOfficer: boolean = false;
  officerCreatedUsername: string | null = null;
  officerError: string | null = null;

  // Create Underwriter Modal State
  isCreateUnderwriterModalOpen: boolean = false;
  createUnderwriterForm: FormGroup;
  creatingUnderwriter: boolean = false;
  underwriterCreatedUsername: string | null = null;
  underwriterError: string | null = null;

  private subs = new Subscription();

  constructor(
    private policyService: PolicyService,
    private adminService: AdminService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder
  ) {
    this.createPolicyForm = this.fb.group({
      name: ['', Validators.required],
      policyType: ['', Validators.required],
      vehicleType: ['', Validators.required],
      basePremium: ['', [Validators.required]],
      coverageAmount: ['', [Validators.required]],
      description: ['']
    });

    this.createOfficerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.createUnderwriterForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

ngOnInit(): void {

  // Load policies
  this.subs.add(
    this.policyService.loadPolicies().subscribe({
      next: (data) => {
        this.policies = data || [];
        this.applyFilters();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load policies', err);
      }
    })
  );

  // Load total users
  this.subs.add(
    this.adminService.getAllUsers().subscribe({
      next: (users) => {
        this.totalUsers = users?.length || 0;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Failed to load users', err)
    })
  );
this.subs.add(
  this.adminService.getTotalRevenue().subscribe({
    next: (data) => {
      this.totalRevenue = data || 0;
      this.cdr.detectChanges();
    }
  })
);

this.subs.add(
  this.adminService.getUnderwriterCommission().subscribe({
    next: (data) => {
      this.underwriterCommission = data || 0;
      this.cdr.detectChanges();
    }
  })
);

this.subs.add(
  this.adminService.getClaimOfficerCommission().subscribe({
    next: (data) => {
      this.claimOfficerCommission = data || 0;
      this.cdr.detectChanges();
    }
  })
);
  // Load pending policy approvals
  this.subs.add(
    this.adminService.getPendingApplications().subscribe({
      next: (apps) => {
        this.pendingApprovals = apps?.length || 0;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Failed to load pending approvals', err)
    })
  );

}

  get totalPolicies(): number {
    return this.policies.length;
  }

  applyFilters(): void {
    if (!this.searchTerm.trim()) {
      this.filteredPolicies = [...this.policies];
    } else {
      const term = this.searchTerm.toLowerCase().trim();
      this.filteredPolicies = this.policies.filter(p => 
        p.name?.toLowerCase().includes(term) || 
        p.vehicleType?.toLowerCase().includes(term)
      );
    }
    this.currentPage = 1;
  }

  get totalPages(): number {
    return Math.ceil(this.filteredPolicies.length / this.itemsPerPage) || 1;
  }

  get paginatedPolicies(): Policy[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredPolicies.slice(start, start + this.itemsPerPage);
  }

  get currentShowingStart(): number {
    if (this.filteredPolicies.length === 0) return 0;
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  get currentShowingEnd(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.filteredPolicies.length);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  editPolicy(policyId: number | undefined): void {
    if (!policyId) return;
    
    // Find the policy to edit and clone it to avoid two-way binding affecting the list behind the modal
    const policyToEdit = this.policies.find(p => p.id === policyId || p.policyId === policyId);
    if (policyToEdit) {
      this.editingPolicy = { ...policyToEdit };
      this.isEditModalOpen = true;
    }
  }

  closeEditModal(): void {
    this.isEditModalOpen = false;
    this.editingPolicy = null;
  }

  saveEditedPolicy(): void {
    if (!this.editingPolicy) return;
    
    const idToUpdate = this.editingPolicy.id || this.editingPolicy.policyId;
    
    this.subs.add(
      this.policyService.updatePolicy(idToUpdate, this.editingPolicy).subscribe({
        next: (updatedObj) => {
          // Update local state manually
          const index = this.policies.findIndex(p => p.id === idToUpdate || p.policyId === idToUpdate);
          if (index !== -1) {
            this.policies[index] = { ...this.policies[index], ...updatedObj };
            
            // To be totally safe, just use the form values in case API response differs slightly structurally
            this.policies[index].name = this.editingPolicy.name;
            this.policies[index].vehicleType = this.editingPolicy.vehicleType;
            this.policies[index].coverageAmount = this.editingPolicy.coverageAmount;
            this.policies[index].basePremium = this.editingPolicy.basePremium;
            this.policies[index].premium = this.editingPolicy.premium;
            this.policies[index].description = this.editingPolicy.description;
          }
          
          this.applyFilters();
          this.closeEditModal();
          this.cdr.detectChanges(); // Trigger DOM update
        },
        error: (err) => {
          console.error('Failed to update policy', err);
          alert('Failed to update policy. Check console for details.');
        }
      })
    );
  }

  deletePolicy(policyId: number | undefined): void {
    if (!policyId) return;
    if (confirm('Are you sure you want to delete this policy? This action cannot be undone.')) {
      this.subs.add(
        this.policyService.deletePolicy(policyId).subscribe({
          next: () => {
             this.policies = this.policies.filter(p => p.id !== policyId && p.policyId !== policyId);
             this.applyFilters();
             this.cdr.detectChanges(); // This ensures the list visually removes the item instantly!
          },
          error: (err) => alert('Failed to delete policy')
        })
      );
    }
  }

  // --- Create Policy Logic ---
  openCreatePolicyModal(): void {
    this.createPolicyForm.reset();
    this.isCreatePolicyModalOpen = true;
  }

  closeCreatePolicyModal(): void {
    this.isCreatePolicyModalOpen = false;
  }

  submitCreatePolicy(): void {
    if (this.createPolicyForm.invalid) {
      this.createPolicyForm.markAllAsTouched();
      return;
    }

    this.creatingPolicy = true;
    const payload = this.createPolicyForm.value;

    this.subs.add(
      this.policyService.createPolicy(payload).subscribe({
        next: (newPolicy: Policy) => {
          this.creatingPolicy = false;
          // Prepend the new policy so it appears immediately
          this.policies.unshift(newPolicy);
          this.applyFilters();
          this.closeCreatePolicyModal();
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Create policy failed', err);
          this.creatingPolicy = false;
          alert('Failed to create policy.');
          this.cdr.detectChanges();
        }
      })
    );
  }

  // --- Create Claim Officer Logic ---
  openCreateOfficerModal(): void {
    this.createOfficerForm.reset();
    this.officerCreatedUsername = null;
    this.officerError = null;
    this.isCreateOfficerModalOpen = true;
  }

  closeCreateOfficerModal(): void {
    this.isCreateOfficerModalOpen = false;
  }

  submitCreateOfficer(): void {
    if (this.createOfficerForm.invalid) {
      this.createOfficerForm.markAllAsTouched();
      return;
    }

    this.creatingOfficer = true;
    this.officerError = null;
    this.officerCreatedUsername = null;

    const data: CreateClaimOfficerRequest = {
      username: this.createOfficerForm.value.username,
      password: this.createOfficerForm.value.password
    };

    this.subs.add(
      this.adminService.createClaimOfficer(data).subscribe({
        next: (response) => {
          this.creatingOfficer = false;
          this.officerCreatedUsername = data.username;
          this.createOfficerForm.reset();
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Failed to create claim officer', err);
          this.officerError = err.error?.message || 'Failed to create claim officer. Please try again.';
          this.creatingOfficer = false;
          this.cdr.detectChanges();
        }
      })
    );
  }

  // --- Create Underwriter Logic ---
  openCreateUnderwriterModal(): void {
    this.createUnderwriterForm.reset();
    this.underwriterCreatedUsername = null;
    this.underwriterError = null;
    this.isCreateUnderwriterModalOpen = true;
  }

  closeCreateUnderwriterModal(): void {
    this.isCreateUnderwriterModalOpen = false;
  }

  submitCreateUnderwriter(): void {
    if (this.createUnderwriterForm.invalid) {
      this.createUnderwriterForm.markAllAsTouched();
      return;
    }

    this.creatingUnderwriter = true;
    this.underwriterError = null;
    this.underwriterCreatedUsername = null;

    const data: CreateUnderwriterRequest = {
      username: this.createUnderwriterForm.value.username,
      password: this.createUnderwriterForm.value.password
    };

    this.subs.add(
      this.adminService.createUnderwriter(data).subscribe({
        next: (response) => {
          this.creatingUnderwriter = false;
          this.underwriterCreatedUsername = data.username;
          this.createUnderwriterForm.reset();
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Failed to create underwriter', err);
          this.underwriterError = err.error?.message || 'Failed to create underwriter. Please try again.';
          this.creatingUnderwriter = false;
          this.cdr.detectChanges();
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
