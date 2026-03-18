import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subscription, Observable } from 'rxjs';
import { PolicyService, Policy } from '../../services/policy.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-policies',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './policies.html'
})
export class PoliciesComponent implements OnInit, OnDestroy {
  policies: Policy[] = [];
  filteredPolicies: Policy[] = [];
  loading = true;
  userRole$: Observable<string | null>;
  searchTerm: string = '';
  filterType: 'CAR' | 'BIKE' | 'ALL' = 'ALL';

  private subs = new Subscription();

  constructor(
    private policyService: PolicyService, 
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {
    this.userRole$ = this.authService.userRole$;
  }

  ngOnInit(): void {
    // Redirect to login if not authenticated
    if (!this.authService.getToken()) {
      this.router.navigate(['/login']);
      return;
    }

    // Load policies and subscribe to result directly
    this.subs.add(
      this.policyService.loadPolicies().subscribe({
        next: (policies) => {
          this.policies = policies || [];
          this.applyFilters();
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.policies = [];
          this.filteredPolicies = [];
          this.loading = false;
          this.cdr.detectChanges();
        }
      })
    );
  }

  setFilter(type: 'CAR' | 'BIKE' | 'ALL') {
    this.filterType = type;
    this.applyFilters();
  }

  onSearch() {
    this.applyFilters();
  }

  applyFilters() {
    let filtered = this.policies;
    if (this.filterType !== 'ALL') {
      filtered = filtered.filter(p => (p.vehicleType || '').toUpperCase() === this.filterType);
    }
    if (this.searchTerm && this.searchTerm.trim() !== '') {
      const term = this.searchTerm.trim().toLowerCase();
      filtered = filtered.filter(p =>
        (p.name && p.name.toLowerCase().includes(term)) ||
        (p.description && p.description.toLowerCase().includes(term))
      );
    }
    this.filteredPolicies = filtered;
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
