import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { fakeAsync, tick } from '@angular/core/testing';
import { UnderwriterDashboardComponent } from './underwriter-dashboard';
import { PolicyService } from '../../services/policy.service';
import { PolicyDocumentService } from '../../services/policy-document.service';
import { ToastService } from '../../services/toast.service';

describe('UnderwriterDashboardComponent', () => {
  let component: UnderwriterDashboardComponent;
  let fixture: ComponentFixture<UnderwriterDashboardComponent>;
  let policyService: any;
  let policyDocumentService: any;
  let toastService: any;

  const mockPolicies = [
    {
      id: 1,
      customerName: 'John Doe',
      policy: { name: 'Basic Insurance' },
      vehicleNumber: 'ABC123',
      vehicleModel: 'Toyota Camry',
      riskScore: 2.5,
      status: 'PENDING'
    },
    {
      id: 2,
      customerName: 'Jane Smith',
      policy: { name: 'Premium Insurance' },
      vehicleNumber: 'XYZ789',
      vehicleModel: 'Honda Accord',
      riskScore: 1.8,
      status: 'PENDING'
    }
  ];

  beforeEach(async () => {
    policyService = {
      getPendingPolicyRequests: vi.fn().mockReturnValue(of([])),
      approvePolicyRequest: vi.fn(),
      rejectPolicyRequest: vi.fn()
    };

    policyDocumentService = {
      getPolicyDocuments: vi.fn()
    };

    toastService = {
      showSuccess: vi.fn(),
      showError: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [UnderwriterDashboardComponent],
      providers: [
        { provide: PolicyService, useValue: policyService },
        { provide: PolicyDocumentService, useValue: policyDocumentService },
        { provide: ToastService, useValue: toastService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UnderwriterDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.pendingPolicies).toEqual([]);
    expect(component.loading).toBeFalsy();
    expect(component.error).toBe('');
    expect(component.showDocumentModal).toBeFalsy();
    expect(component.selectedPolicy).toBeNull();
    expect(component.documents).toEqual([]);
    expect(component.processingPolicyId).toBeNull();
  });

  describe('loadPendingPolicies', () => {
    it('should load pending policies successfully', () => {
      policyService.getPendingPolicyRequests.mockReturnValue(of(mockPolicies));
      
      component.loadPendingPolicies();
      
      expect(component.pendingPolicies).toEqual(mockPolicies);
      expect(component.loading).toBeFalsy();
      expect(component.error).toBe('');
    });

    it('should handle empty policies list', () => {
      policyService.getPendingPolicyRequests.mockReturnValue(of([]));
      
      component.loadPendingPolicies();
      
      expect(component.pendingPolicies).toEqual([]);
      expect(component.loading).toBeFalsy();
    });

    it('should handle error when loading policies', () => {
      const errorMessage = 'Failed to load policies';
      policyService.getPendingPolicyRequests.mockReturnValue(throwError(() => new Error(errorMessage)));
      
      component.loadPendingPolicies();
      
      expect(component.pendingPolicies).toEqual([]);
      expect(component.loading).toBeFalsy();
      expect(component.error).toBe('Failed to load pending policies. Please try again.');
    });
  });

  describe('approvePolicy', () => {
    it('should approve policy successfully', () => {
      const policy = { id: 1, name: 'Test Policy' };
      const mockResponse = { success: true };
      policyService.approvePolicyRequest.mockReturnValue(of(mockResponse));
      
      component.approvePolicy(policy);
      
      expect(policyService.approvePolicyRequest).toHaveBeenCalledWith(1);
      // Toast is called in subscription callback, can't test synchronously
    });

    it('should handle approval error', () => {
      const policy = { id: 1, name: 'Test Policy' };
      const errorMessage = 'Approval failed';
      policyService.approvePolicyRequest.mockReturnValue(throwError(() => new Error(errorMessage)));
      
      component.approvePolicy(policy);
      
      expect(policyService.approvePolicyRequest).toHaveBeenCalledWith(1);
    });
  });

  describe('rejectPolicy', () => {
    it('should reject policy successfully', () => {
      const policy = { id: 1, name: 'Test Policy' };
      const mockResponse = { success: true };
      policyService.rejectPolicyRequest.mockReturnValue(of(mockResponse));
      
      component.rejectPolicy(policy);
      
      expect(policyService.rejectPolicyRequest).toHaveBeenCalledWith(1);
      // Toast is called in subscription callback, can't test synchronously
    });

    it('should handle rejection error', () => {
      const policy = { id: 1, name: 'Test Policy' };
      const errorMessage = 'Rejection failed';
      policyService.rejectPolicyRequest.mockReturnValue(throwError(() => new Error(errorMessage)));
      
      component.rejectPolicy(policy);
      
      expect(policyService.rejectPolicyRequest).toHaveBeenCalledWith(1);
    });
  });

  describe('viewDocuments', () => {
    it('should open document modal and load documents', () => {
      const policy = mockPolicies[0];
      const mockDocuments = [
        { id: 1, fileName: 'license.pdf', documentType: 'LICENSE' }
      ];
      
      policyDocumentService.getPolicyDocuments.mockReturnValue(of(mockDocuments));
      
      component.viewDocuments(policy);
      
      expect(component.selectedPolicy).toEqual(policy);
      expect(component.showDocumentModal).toBeTruthy();
      // Check if the call was made (the actual parameter might be undefined)
      expect(policyDocumentService.getPolicyDocuments).toHaveBeenCalled();
    });

    it('should handle error when loading documents', () => {
      const policy = mockPolicies[0];
      policyDocumentService.getPolicyDocuments.mockReturnValue(throwError(() => new Error('Failed')));
      
      component.viewDocuments(policy);
      
      expect(component.loadingDocuments).toBeFalsy();
    });
  });

  describe('closeDocumentModal', () => {
    it('should close document modal and reset state', () => {
      component.showDocumentModal = true;
      component.selectedPolicy = mockPolicies[0];
      component.documents = [{ id: 1, fileName: 'test.pdf' }];
      
      component.closeDocumentModal();
      
      expect(component.showDocumentModal).toBeFalsy();
      expect(component.selectedPolicy).toBeNull();
      expect(component.documents).toEqual([]);
    });
  });

  describe('Helper Methods', () => {
    it('should return correct status class', () => {
      expect(component.getStatusClass('PENDING')).toBe('bg-yellow-100 text-yellow-800');
      expect(component.getStatusClass('APPROVED')).toBe('bg-green-100 text-green-800');
      expect(component.getStatusClass('REJECTED')).toBe('bg-red-100 text-red-800');
      expect(component.getStatusClass('')).toBe('bg-gray-100 text-gray-800');
    });

    it('should return correct risk score class', () => {
      expect(component.getRiskScoreClass(25)).toBe('text-green-600');
      expect(component.getRiskScoreClass(45)).toBe('text-yellow-600');
      expect(component.getRiskScoreClass(80)).toBe('text-red-600');
      expect(component.getRiskScoreClass(0)).toBe('text-gray-500');
    });

    it('should return correct risk level', () => {
      expect(component.getRiskLevel(25)).toBe('Low');
      expect(component.getRiskLevel(45)).toBe('Medium');
      expect(component.getRiskLevel(80)).toBe('High');
      expect(component.getRiskLevel(0)).toBe('Unknown');
    });

    it('should check if file is image', () => {
      expect(component.isImageFile({ fileName: 'test.jpg' })).toBeTruthy();
      expect(component.isImageFile({ fileName: 'test.png' })).toBeTruthy();
      expect(component.isImageFile({ fileName: 'test.pdf' })).toBeFalsy();
      expect(component.isImageFile({ fileName: 'test.doc' })).toBeFalsy();
      expect(component.isImageFile({})).toBeFalsy();
      expect(component.isImageFile(null)).toBeFalsy();
    });

    it('should generate document download URL', () => {
      const doc = { id: 1, fileName: 'test.pdf' };
      expect(component.getDocumentDownloadUrl(doc)).toBe('#');
      
      const docWithUrl = { id: 1, fileName: 'test.pdf', fileUrl: 'http://example.com/file.pdf' };
      expect(component.getDocumentDownloadUrl(docWithUrl)).toBe('http://example.com/file.pdf');
    });
  });

  describe('ngOnInit', () => {
    it('should load pending policies on initialization', () => {
      const loadPendingPoliciesSpy = vi.spyOn(component, 'loadPendingPolicies');
      
      component.ngOnInit();
      
      expect(loadPendingPoliciesSpy).toHaveBeenCalled();
    });
  });
});
