import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { AdminDashboardComponent } from './admin-dashboard';
import { PolicyService, Policy } from '../../services/policy.service';
import { AdminService } from '../../services/admin.service';
import { Router } from '@angular/router';

describe('AdminDashboardComponent', () => {
  let component: AdminDashboardComponent;
  let fixture: ComponentFixture<AdminDashboardComponent>;
  let policyService: any;
  let adminService: any;
  let router: any;

  const mockPolicies: Policy[] = [
    { id: 1, name: 'Basic Insurance', basePremium: 1000, vehicleType: 'CAR' },
    { id: 2, name: 'Premium Insurance', basePremium: 2000, vehicleType: 'MOTORCYCLE' }
  ];

  beforeEach(async () => {
    const policyServiceSpy = vi.fn().mockImplementation(() => ({
      loadPolicies: vi.fn().mockReturnValue(of([])),
      createPolicy: vi.fn(),
      updatePolicy: vi.fn(),
      deletePolicy: vi.fn()
    }))();

    const adminServiceSpy = vi.fn().mockImplementation(() => ({
      createClaimOfficer: vi.fn(),
      createUnderwriter: vi.fn()
    }))();

    const routerSpy = vi.fn().mockImplementation(() => ({
      navigate: vi.fn()
    }))();

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, AdminDashboardComponent],
      providers: [
        FormBuilder,
        { provide: PolicyService, useValue: policyServiceSpy },
        { provide: AdminService, useValue: adminServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminDashboardComponent);
    component = fixture.componentInstance;
    policyService = TestBed.inject(PolicyService);
    adminService = TestBed.inject(AdminService);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.policies).toEqual([]);
    expect(component.filteredPolicies).toEqual([]);
    expect(component.searchTerm).toBe('');
    expect(component.currentPage).toBe(1);
    expect(component.itemsPerPage).toBe(3);
  });

  it('should initialize forms correctly', () => {
    expect(component.createPolicyForm).toBeDefined();
    expect(component.createOfficerForm).toBeDefined();
    expect(component.createUnderwriterForm).toBeDefined();
  });

  describe('ngOnInit', () => {
    it('should load policies on initialization', () => {
      policyService.loadPolicies.mockReturnValue(of(mockPolicies));
      
      component.ngOnInit();
      
      expect(policyService.loadPolicies).toHaveBeenCalled();
      expect(component.policies).toEqual(mockPolicies);
      expect(component.filteredPolicies).toEqual(mockPolicies);
    });

    it('should handle error when loading policies', () => {
      policyService.loadPolicies.mockReturnValue(throwError(() => new Error('Failed to load')));
      
      component.ngOnInit();
      
      expect(component.policies).toEqual([]);
      expect(component.filteredPolicies).toEqual([]);
    });
  });

  describe('applyFilters', () => {
    beforeEach(() => {
      component.policies = mockPolicies;
      component.applyFilters();
    });

    it('should show all policies when search term is empty', () => {
      component.searchTerm = '';
      component.applyFilters();
      
      expect(component.filteredPolicies.length).toBe(2);
    });

    it('should filter policies by name', () => {
      component.searchTerm = 'basic';
      component.applyFilters();
      
      expect(component.filteredPolicies.length).toBe(1);
      expect(component.filteredPolicies[0].name).toBe('Basic Insurance');
    });

    it('should filter policies by vehicle type', () => {
      component.searchTerm = 'car';
      component.applyFilters();
      
      expect(component.filteredPolicies.length).toBe(1);
      expect(component.filteredPolicies[0].vehicleType).toBe('CAR');
    });

    it('should reset to page 1 when filtering', () => {
      component.currentPage = 2;
      component.applyFilters();
      
      expect(component.currentPage).toBe(1);
    });
  });

  describe('Pagination', () => {
    beforeEach(() => {
      component.policies = [
        ...mockPolicies,
        { id: 3, name: 'Third Policy', basePremium: 1500, vehicleType: 'TRUCK' },
        { id: 4, name: 'Fourth Policy', basePremium: 1800, vehicleType: 'BUS' }
      ];
      component.applyFilters();
    });

    it('should calculate total pages correctly', () => {
      expect(component.totalPages).toBe(2);
    });

    it('should get paginated policies correctly', () => {
      const paginated = component.paginatedPolicies;
      expect(paginated.length).toBe(3);
      expect(paginated[0].name).toBe('Basic Insurance');
    });

    it('should navigate to next page', () => {
      component.nextPage();
      expect(component.currentPage).toBe(2);
    });

    it('should not go beyond last page', () => {
      component.currentPage = 2;
      component.nextPage();
      expect(component.currentPage).toBe(2);
    });

    it('should navigate to previous page', () => {
      component.currentPage = 2;
      component.prevPage();
      expect(component.currentPage).toBe(1);
    });

    it('should not go before first page', () => {
      component.prevPage();
      expect(component.currentPage).toBe(1);
    });
  });

  describe('editPolicy', () => {
    it('should open edit modal with policy data', () => {
      // First load some policies
      component.policies = mockPolicies;
      const policyId = 1;
      
      component.editPolicy(policyId);
      
      expect(component.editingPolicy).toEqual(mockPolicies[0]);
      expect(component.isEditModalOpen).toBeTruthy();
    });

    it('should not open modal if policy id is undefined', () => {
      component.editPolicy(undefined);
      
      expect(component.editingPolicy).toBeNull();
      expect(component.isEditModalOpen).toBeFalsy();
    });
  });

  describe('closeEditModal', () => {
    it('should close edit modal and reset editing policy', () => {
      component.isEditModalOpen = true;
      component.editingPolicy = mockPolicies[0];
      
      component.closeEditModal();
      
      expect(component.isEditModalOpen).toBeFalsy();
      expect(component.editingPolicy).toBeNull();
    });
  });

  describe('saveEditedPolicy', () => {
    it('should save policy successfully', () => {
      component.editingPolicy = { ...mockPolicies[0], name: 'Updated Policy' };
      policyService.updatePolicy.mockReturnValue(of({ ...mockPolicies[0], name: 'Updated Policy' }));
      
      component.saveEditedPolicy();
      
      expect(policyService.updatePolicy).toHaveBeenCalled();
      expect(component.isEditModalOpen).toBeFalsy();
    });

    it('should handle error when updating policy', () => {
      component.editingPolicy = mockPolicies[0];
      policyService.updatePolicy.mockReturnValue(throwError(() => new Error('Update failed')));
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      
      component.saveEditedPolicy();
      
      expect(alertSpy).toHaveBeenCalledWith('Failed to update policy. Check console for details.');
      
      alertSpy.mockRestore();
    });
  });

  describe('deletePolicy', () => {
    it('should delete policy after confirmation', () => {
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
      
      policyService.deletePolicy.mockReturnValue(of(undefined));
      
      component.deletePolicy(1);
      
      expect(confirmSpy).toHaveBeenCalledWith('Are you sure you want to delete this policy? This action cannot be undone.');
      expect(policyService.deletePolicy).toHaveBeenCalledWith(1);
      
      alertSpy.mockRestore();
      confirmSpy.mockRestore();
    });

    it('should not delete policy if not confirmed', () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
      
      component.deletePolicy(1);
      
      expect(policyService.deletePolicy).not.toHaveBeenCalled();
      
      confirmSpy.mockRestore();
    });

    it('should handle error when deleting policy', () => {
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
      
      policyService.deletePolicy.mockReturnValue(throwError(() => new Error('Delete failed')));
      
      component.deletePolicy(1);
      
      expect(alertSpy).toHaveBeenCalledWith('Failed to delete policy');
      
      alertSpy.mockRestore();
      confirmSpy.mockRestore();
    });
  });

  describe('createPolicy', () => {
    it('should create policy successfully', () => {
      component.createPolicyForm.setValue({
        name: 'New Policy',
        policyType: 'COMPREHENSIVE',
        vehicleType: 'CAR',
        basePremium: 1200,
        coverageAmount: 50000,
        description: 'Test policy'
      });
      
      const newPolicy = { ...component.createPolicyForm.value, id: 3 };
      policyService.createPolicy.mockReturnValue(of(newPolicy));
      
      component.submitCreatePolicy();
      
      expect(policyService.createPolicy).toHaveBeenCalledWith(component.createPolicyForm.value);
      expect(component.policies[0]).toEqual(newPolicy);
      expect(component.isCreatePolicyModalOpen).toBeFalsy();
    });

    it('should not create policy if form is invalid', () => {
      component.createPolicyForm.setValue({
        name: '',
        policyType: '',
        vehicleType: '',
        basePremium: '',
        coverageAmount: '',
        description: ''
      });
      
      component.submitCreatePolicy();
      
      expect(policyService.createPolicy).not.toHaveBeenCalled();
    });

    it('should handle error when creating policy', () => {
      component.createPolicyForm.setValue({
        name: 'New Policy',
        policyType: 'COMPREHENSIVE',
        vehicleType: 'CAR',
        basePremium: 1200,
        coverageAmount: 50000,
        description: 'Test policy'
      });
      
      policyService.createPolicy.mockReturnValue(throwError(() => new Error('Create failed')));
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      
      component.submitCreatePolicy();
      
      expect(alertSpy).toHaveBeenCalledWith('Failed to create policy.');
      
      alertSpy.mockRestore();
    });
  });

  describe('createClaimOfficer', () => {
    it('should create claim officer successfully', () => {
      component.createOfficerForm.setValue({
        username: 'officer1',
        password: 'password123'
      });
      
      adminService.createClaimOfficer.mockReturnValue(of({ username: 'officer1' }));
      
      component.submitCreateOfficer();
      
      expect(adminService.createClaimOfficer).toHaveBeenCalledWith({
        username: 'officer1',
        password: 'password123'
      });
      expect(component.officerCreatedUsername).toBe('officer1');
    });

    it('should not create officer if form is invalid', () => {
      component.createOfficerForm.setValue({
        username: '',
        password: ''
      });
      
      component.submitCreateOfficer();
      
      expect(adminService.createClaimOfficer).not.toHaveBeenCalled();
    });
  });

  describe('createUnderwriter', () => {
    it('should create underwriter successfully', () => {
      component.createUnderwriterForm.setValue({
        username: 'underwriter1',
        password: 'password123'
      });
      
      adminService.createUnderwriter.mockReturnValue(of({ username: 'underwriter1' }));
      
      component.submitCreateUnderwriter();
      
      expect(adminService.createUnderwriter).toHaveBeenCalledWith({
        username: 'underwriter1',
        password: 'password123'
      });
      expect(component.underwriterCreatedUsername).toBe('underwriter1');
    });
  });
});
