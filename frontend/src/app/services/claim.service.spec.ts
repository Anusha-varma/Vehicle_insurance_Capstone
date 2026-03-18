import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ClaimService } from './claim.service';
import { AuthService } from './auth.service';

describe('ClaimService', () => {
  let service: ClaimService;
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
        ClaimService,
        { provide: AuthService, useValue: authServiceSpy }
      ]
    });
    service = TestBed.inject(ClaimService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getMyClaims', () => {
    it('should fetch user claims', () => {
      const dummyClaims = [
        { id: 1, claimAmount: 5000, status: 'PENDING' },
        { id: 2, claimAmount: 3000, status: 'APPROVED' }
      ];

      service.getMyClaims().subscribe(claims => {
        expect(claims.length).toBe(2);
        expect(claims[0].claimAmount).toBe(5000);
      });

      const req = httpMock.expectOne(`${baseUrl}/claims/my`);
      expect(req.request.method).toBe('GET');
      req.flush(dummyClaims);
    });

    it('should handle empty claims list', () => {
      service.getMyClaims().subscribe(claims => {
        expect(claims.length).toBe(0);
      });

      const req = httpMock.expectOne(`${baseUrl}/claims/my`);
      req.flush([]);
    });
  });

  describe('getPendingClaims', () => {
    it('should fetch pending claims for claim officer', () => {
      const pendingClaims = [
        { id: 1, claimAmount: 2000, status: 'PENDING', description: 'Accident damage' }
      ];

      service.getPendingClaims().subscribe(claims => {
        expect(claims.length).toBe(1);
        expect(claims[0].status).toBe('PENDING');
      });

      const req = httpMock.expectOne(`${baseUrl}/claims/pending`);
      expect(req.request.method).toBe('GET');
      req.flush(pendingClaims);
    });
  });

  describe('approveClaim', () => {
    it('should approve a claim', () => {
      const claimId = 1;
      const approvedClaim = { id: claimId, status: 'APPROVED' };

      service.approveClaim(claimId).subscribe(claim => {
        expect(claim.status).toBe('APPROVED');
      });

      const req = httpMock.expectOne(`${baseUrl}/claims/${claimId}/approve`);
      expect(req.request.method).toBe('PUT');
      req.flush(approvedClaim);
    });
  });

  describe('rejectClaim', () => {
    it('should reject a claim', () => {
      const claimId = 1;
      const rejectedClaim = { id: claimId, status: 'REJECTED' };

      service.rejectClaim(claimId).subscribe(claim => {
        expect(claim.status).toBe('REJECTED');
      });

      const req = httpMock.expectOne(`${baseUrl}/claims/${claimId}/reject`);
      expect(req.request.method).toBe('PUT');
      req.flush(rejectedClaim);
    });
  });

  describe('applyClaim', () => {
    it('should apply for a claim', () => {
      const subscriptionId = 1;
      const claimData = {
        claimAmount: 5000,
        reason: 'Vehicle accident',
        claimType: 'COLLISION'
      };

      service.applyClaim(subscriptionId, claimData).subscribe(claim => {
        expect(claim.claimAmount).toBe(5000);
        expect(claim.reason).toBe('Vehicle accident');
      });

      const req = httpMock.expectOne(`${baseUrl}/claims/${subscriptionId}/apply`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(claimData);
      req.flush({ ...claimData, id: 1, status: 'PENDING' });
    });
  });
});
