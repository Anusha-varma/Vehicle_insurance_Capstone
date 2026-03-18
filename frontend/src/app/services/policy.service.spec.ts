import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { of } from 'rxjs';
import { PolicyService, Policy } from './policy.service';
import { AuthService } from './auth.service';

// Mock PolicySubscription interface
interface PolicySubscription {
  id: number;
  customerName: string;
  policy: Policy;
  vehicleNumber: string;
  vehicleModel: string;
  riskScore: number;
  status: string;
}

describe('PolicyService', () => {
  let service: PolicyService;
  let httpMock: HttpTestingController;
  let authServiceSpy: any;
  const baseUrl = 'http://localhost:8080';

  beforeEach(() => {
    authServiceSpy = {
      getToken: vi.fn()
    };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        PolicyService,
        { provide: AuthService, useValue: authServiceSpy }
      ]
    });
    service = TestBed.inject(PolicyService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('loadPolicies', () => {
    it('should fetch all policies', () => {
      const dummyPolicies: Policy[] = [
        { id: 1, name: 'Basic Insurance', basePremium: 1000 },
        { id: 2, name: 'Premium Insurance', basePremium: 2000 }
      ];

      service.loadPolicies().subscribe(policies => {
        expect(policies.length).toBe(2);
        expect(policies).toEqual(dummyPolicies);
      });

      const req = httpMock.expectOne(`${baseUrl}/policy/all`);
      expect(req.request.method).toBe('GET');
      req.flush(dummyPolicies);
    });

    it('should handle empty policy list', () => {
      service.loadPolicies().subscribe(policies => {
        expect(policies.length).toBe(0);
      });

      const req = httpMock.expectOne(`${baseUrl}/policy/all`);
      req.flush([]);
    });
  });

  describe('getPendingPolicyRequests', () => {
    it('should fetch pending policy applications', () => {
      const dummyApplications = [
        { id: 1, status: 'PENDING', customerName: 'John Doe' },
        { id: 2, status: 'PENDING', customerName: 'Jane Smith' }
      ];

      service.getPendingPolicyRequests().subscribe(applications => {
        expect(applications.length).toBe(2);
        expect(applications).toEqual(dummyApplications);
      });

      const req = httpMock.expectOne(`${baseUrl}/underwriter/pending-applications`);
      expect(req.request.method).toBe('GET');
      req.flush(dummyApplications);
    });

    it('should handle HTTP error gracefully', () => {
      service.getPendingPolicyRequests().subscribe(applications => {
        expect(applications).toEqual([]);
      });

      const req = httpMock.expectOne(`${baseUrl}/underwriter/pending-applications`);
      req.error(new ErrorEvent('Network error'));
    });
  });

  describe('approvePolicyRequest', () => {
    it('should approve a policy application', () => {
      const requestId = 1;
      const approvedPolicy = { id: requestId, status: 'APPROVED' };

      service.approvePolicyRequest(requestId).subscribe(response => {
        expect(response).toEqual(approvedPolicy);
      });

      const req = httpMock.expectOne(`${baseUrl}/underwriter/policy-applications/${requestId}/approve`);
      expect(req.request.method).toBe('PUT');
      req.flush(approvedPolicy);
    });
  });

  describe('rejectPolicyRequest', () => {
    it('should reject a policy application', () => {
      const requestId = 1;
      const rejectedPolicy = { id: requestId, status: 'REJECTED' };

      service.rejectPolicyRequest(requestId).subscribe(response => {
        expect(response).toEqual(rejectedPolicy);
      });

      const req = httpMock.expectOne(`${baseUrl}/underwriter/policy-applications/${requestId}/reject`);
      expect(req.request.method).toBe('PUT');
      req.flush(rejectedPolicy);
    });
  });

  describe('createPolicy', () => {
    it('should create a new policy', () => {
      const newPolicy: Policy = {
        name: 'Test Policy',
        basePremium: 1500,
        coverageAmount: 50000,
        policyType: 'COMPREHENSIVE',
        vehicleType: 'CAR'
      };

      service.createPolicy(newPolicy).subscribe(policy => {
        expect(policy.name).toBe('Test Policy');
        expect(policy.basePremium).toBe(1500);
      });

      const req = httpMock.expectOne(`${baseUrl}/policy/create`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newPolicy);
      req.flush({ ...newPolicy, id: 3 });
    });
  });

  describe('getMyPolicies', () => {
    it('should fetch user policies', () => {
      const userPolicies: PolicySubscription[] = [
        { 
          id: 1, 
          customerName: 'John Doe', 
          policy: { id: 1, name: 'Basic Insurance', basePremium: 1000, vehicleType: 'CAR' },
          vehicleNumber: 'ABC123', 
          vehicleModel: 'Toyota Camry', 
          riskScore: 2.5, 
          status: 'APPROVED' 
        }
      ];

      service.getMyPolicies().subscribe(policies => {
        expect(policies.length).toBe(1);
        expect(policies[0].vehicleNumber).toBe('ABC123');
      });

      const req = httpMock.expectOne(`${baseUrl}/policy/my`);
      expect(req.request.method).toBe('GET');
      req.flush(userPolicies);
    });
  });

  describe('updatePolicy', () => {
    it('should update an existing policy', () => {
      const policyId = 1;
      const updatedPolicy = { name: 'Updated Policy', basePremium: 1800 };

      service.updatePolicy(policyId, updatedPolicy).subscribe(policy => {
        expect(policy.name).toBe('Updated Policy');
      });

      const req = httpMock.expectOne(`${baseUrl}/policy/${policyId}`);
      expect(req.request.method).toBe('PUT');
      req.flush({ ...updatedPolicy, id: policyId });
    });
  });

  describe('deletePolicy', () => {
    it('should delete a policy', () => {
      const policyId = 1;

      service.deletePolicy(policyId).subscribe({
        next: () => {
          expect(true).toBeTruthy(); // Successful deletion
        }
      });

      const req = httpMock.expectOne(`${baseUrl}/policy/${policyId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});
