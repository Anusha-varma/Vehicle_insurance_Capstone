import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AdminService } from './admin.service';
import { AuthService } from './auth.service';

describe('AdminService', () => {
  let service: AdminService;
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
        AdminService,
        { provide: AuthService, useValue: authServiceSpy }
      ]
    });
    service = TestBed.inject(AdminService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('createClaimOfficer', () => {
    it('should create a new claim officer', () => {
      const officerData = {
        username: 'officer1',
        password: 'password123'
      };

      authServiceSpy.getToken.mockReturnValue('test-token');

      service.createClaimOfficer(officerData).subscribe(response => {
        expect(response.username).toBe('officer1');
      });

      const req = httpMock.expectOne(`${baseUrl}/admin/create-claim-officer`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(officerData);
      expect(req.request.headers.get('Authorization')).toBe('Bearer test-token');
      req.flush({ ...officerData, id: 1, role: 'CLAIM_OFFICER' });
    });

    it('should handle error when creating claim officer', () => {
      const officerData = {
        username: 'officer1',
        password: 'password123'
      };

      authServiceSpy.getToken.mockReturnValue('test-token');

      service.createClaimOfficer(officerData).subscribe({
        next: () => expect.fail('Should have failed'),
        error: (error) => {
          expect(error).toBeTruthy();
        }
      });

      const req = httpMock.expectOne(`${baseUrl}/admin/create-claim-officer`);
      req.error(new ErrorEvent('Network error'));
    });
  });

  describe('createUnderwriter', () => {
    it('should create a new underwriter', () => {
      const underwriterData = {
        username: 'underwriter1',
        password: 'password123'
      };

      authServiceSpy.getToken.mockReturnValue('test-token');

      service.createUnderwriter(underwriterData).subscribe(response => {
        expect(response.username).toBe('underwriter1');
      });

      const req = httpMock.expectOne(`${baseUrl}/admin/create-underwriter`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(underwriterData);
      expect(req.request.headers.get('Authorization')).toBe('Bearer test-token');
      req.flush({ ...underwriterData, id: 2, role: 'UNDERWRITER' });
    });

    it('should handle error when creating underwriter', () => {
      const underwriterData = {
        username: 'underwriter1',
        password: 'password123'
      };

      authServiceSpy.getToken.mockReturnValue('test-token');

      service.createUnderwriter(underwriterData).subscribe({
        next: () => expect.fail('Should have failed'),
        error: (error) => {
          expect(error).toBeTruthy();
        }
      });

      const req = httpMock.expectOne(`${baseUrl}/admin/create-underwriter`);
      req.error(new ErrorEvent('Network error'));
    });
  });

  describe('Authentication Headers', () => {
    it('should include auth header when token exists', () => {
      const officerData = { username: 'test', password: 'test' };
      authServiceSpy.getToken.mockReturnValue('auth-token');

      service.createClaimOfficer(officerData).subscribe();

      const req = httpMock.expectOne(`${baseUrl}/admin/create-claim-officer`);
      expect(req.request.headers.get('Authorization')).toBe('Bearer auth-token');
      req.flush({});
    });

    it('should not include auth header when no token', () => {
      const officerData = { username: 'test', password: 'test' };
      authServiceSpy.getToken.mockReturnValue(null);

      service.createClaimOfficer(officerData).subscribe();

      const req = httpMock.expectOne(`${baseUrl}/admin/create-claim-officer`);
      expect(req.request.headers.get('Authorization')).toBeNull();
      req.flush({});
    });
  });
});
