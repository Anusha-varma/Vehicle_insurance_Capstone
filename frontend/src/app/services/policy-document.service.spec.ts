import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PolicyDocumentService } from './policy-document.service';
import { AuthService } from './auth.service';
import { vi } from 'vitest';

describe('PolicyDocumentService', () => {
  let service: PolicyDocumentService;
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
        PolicyDocumentService,
        { provide: AuthService, useValue: authServiceSpy }
      ]
    });
    service = TestBed.inject(PolicyDocumentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getPolicyDocuments', () => {
    it('should fetch policy documents with auth header', () => {
      const subscriptionId = 1;
      const token = 'test-token';
      const documents = [
        { id: 1, fileName: 'license.pdf', fileType: 'pdf', filePath: '/path/to/license.pdf', uploadedAt: '2023-01-01' },
        { id: 2, fileName: 'registration.pdf', fileType: 'pdf', filePath: '/path/to/registration.pdf', uploadedAt: '2023-01-02' }
      ];

      authServiceSpy.getToken.mockReturnValue(token);

      service.getPolicyDocuments(subscriptionId).subscribe(docs => {
        expect(docs.length).toBe(2);
        expect(docs[0].fileName).toBe('license.pdf');
      });

      const req = httpMock.expectOne(`${baseUrl}/policy-subscription/${subscriptionId}/documents`);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${token}`);
      req.flush(documents);
    });

    it('should fetch policy documents without auth header when no token', () => {
      const subscriptionId = 1;
      const documents = [
        { id: 1, fileName: 'license.pdf', fileType: 'pdf', filePath: '/path/to/license.pdf', uploadedAt: '2023-01-01' }
      ];

      authServiceSpy.getToken.mockReturnValue(null);

      service.getPolicyDocuments(subscriptionId).subscribe(docs => {
        expect(docs.length).toBe(1);
        expect(docs[0].fileName).toBe('license.pdf');
      });

      const req = httpMock.expectOne(`${baseUrl}/policy-subscription/${subscriptionId}/documents`);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Authorization')).toBeNull();
      req.flush(documents);
    });

    it('should handle empty documents list', () => {
      const subscriptionId = 1;

      authServiceSpy.getToken.mockReturnValue('test-token');

      service.getPolicyDocuments(subscriptionId).subscribe(docs => {
        expect(docs.length).toBe(0);
      });

      const req = httpMock.expectOne(`${baseUrl}/policy-subscription/${subscriptionId}/documents`);
      req.flush([]);
    });

    it('should handle HTTP error', () => {
      const subscriptionId = 1;

      authServiceSpy.getToken.mockReturnValue('test-token');

      service.getPolicyDocuments(subscriptionId).subscribe({
        next: () => expect.fail('Should have failed'),
        error: (error) => {
          expect(error).toBeTruthy();
        }
      });

      const req = httpMock.expectOne(`${baseUrl}/policy-subscription/${subscriptionId}/documents`);
      req.error(new ErrorEvent('Network error'));
    });
  });
});
