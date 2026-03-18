import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';

export interface ClaimRequest {
  claimAmount: number;
  reason: string;
  claimType?: string;
  thirdPartyName?: string;
  thirdPartyVehicleNumber?: string;
  injuryType?: string;
  garageEstimate?: number;
  damageDescription?: string;
}

export interface ClaimResponse {
  id?: number;
  claimId?: number;
  subscriptionId?: number;
  claimAmount?: number;
  reason?: string;
  description?: string;
  claimDate?: string;
  status?: string;
  riskScore?: number;
  customerName?: string;
  policyName?: string;
  coverageAmount?: number;
  premium?: number;
  claimType?: string;
}

export interface DocumentUpload {
  id?: number;
  documentType?: string;
  fileName?: string;
  uploadDate?: string;
}

@Injectable({ providedIn: 'root' })
export class ClaimService {
  private baseUrl = 'http://localhost:8080';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders | undefined {
    const token = this.authService.getToken();
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
  }

  /**
   * Submit a claim for a policy subscription
   * POST /claims/{subscriptionId}/apply
   */
  applyClaim(subscriptionId: number, data: ClaimRequest): Observable<ClaimResponse> {
    const url = `${this.baseUrl}/claims/${subscriptionId}/apply`;
    return this.http.post<ClaimResponse>(url, data, { headers: this.getHeaders() }).pipe(
      catchError((err) => {
        console.error('ClaimService.applyClaim failed', err);
        throw err;
      })
    );
  }

  /**
   * Submit a claim with documents (multipart form data)
   * POST /claims/{subscriptionId}/apply
   */
  applyClaimWithDocuments(
    subscriptionId: number,
    claimData: any,
    documents: File[]
  ): Observable<ClaimResponse> {
    const url = `${this.baseUrl}/claims/${subscriptionId}/apply`;
    
    const formData = new FormData();
    
    // Add claim data as JSON blob
    formData.append('data', new Blob([JSON.stringify(claimData)], { type: 'application/json' }));
    
    // Add documents
    documents.forEach((file, index) => {
      formData.append('documents', file, file.name);
    });
    
    const token = this.authService.getToken();
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
    
    return this.http.post<ClaimResponse>(url, formData, { headers }).pipe(
      catchError((err) => {
        console.error('ClaimService.applyClaimWithDocuments failed', err);
        throw err;
      })
    );
  }

  /**
   * Upload document for a claim
   * POST /claims/{claimId}/upload-document
   */
  uploadDocument(claimId: number, file: File, documentType: string): Observable<DocumentUpload> {
    const url = `${this.baseUrl}/claims/${claimId}/upload-document`;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);
    
    const token = this.authService.getToken();
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
    
    return this.http.post<DocumentUpload>(url, formData, { headers }).pipe(
      catchError((err) => {
        console.error('ClaimService.uploadDocument failed', err);
        throw err;
      })
    );
  }

  /**
   * Get customer's claims
   * GET /claims/my
   */
  getMyClaims(): Observable<ClaimResponse[]> {
    const url = `${this.baseUrl}/claims/my`;
    return this.http.get<ClaimResponse[]>(url, { headers: this.getHeaders() }).pipe(
      catchError((err) => {
        console.error('ClaimService.getMyClaims failed', err);
        return of([]);
      })
    );
  }

  /**
   * Get pending claims (for claim officers)
   * GET /claims/pending
   */
  getPendingClaims(): Observable<ClaimResponse[]> {
    const url = `${this.baseUrl}/claims/pending`;
    return this.http.get<ClaimResponse[]>(url, { headers: this.getHeaders() }).pipe(
      catchError((err) => {
        console.error('ClaimService.getPendingClaims failed', err);
        return of([]);
      })
    );
  }
  getAllClaims(): Observable<ClaimResponse[]> {
  const url = `${this.baseUrl}/claims/all`;
  return this.http.get<ClaimResponse[]>(url, { headers: this.getHeaders() }).pipe(
    catchError((err) => {
      console.error('ClaimService.getAllClaims failed', err);
      return of([]);
    })
  );
}
getClaimOfficerCommission(): Observable<number> {
  const url = `${this.baseUrl}/claims/commission`;
  return this.http.get<number>(url, { headers: this.getHeaders() });
}
  /**
   * Review a claim
   * PUT /claims/{id}/review
   */
  reviewClaim(claimId: number): Observable<ClaimResponse> {
    const url = `${this.baseUrl}/claims/${claimId}/review`;
    return this.http.put<ClaimResponse>(url, {}, { headers: this.getHeaders() }).pipe(
      catchError((err) => {
        console.error('ClaimService.reviewClaim failed', err);
        throw err;
      })
    );
  }

  /**
   * Approve a claim
   * PUT /claims/{id}/approve
   */
  approveClaim(claimId: number): Observable<ClaimResponse> {
    const url = `${this.baseUrl}/claims/${claimId}/approve`;
    return this.http.put<ClaimResponse>(url, {}, { headers: this.getHeaders() }).pipe(
      catchError((err) => {
        console.error('ClaimService.approveClaim failed', err);
        throw err;
      })
    );
  }

  /**
   * Reject a claim
   * PUT /claims/{id}/reject
   */
  rejectClaim(claimId: number): Observable<ClaimResponse> {
    const url = `${this.baseUrl}/claims/${claimId}/reject`;
    return this.http.put<ClaimResponse>(url, {}, { headers: this.getHeaders() }).pipe(
      catchError((err) => {
        console.error('ClaimService.rejectClaim failed', err);
        throw err;
      })
    );
  }

  /**
   * Get all policy subscriptions (for claim officers/admins)
   * GET /policy/subscriptions/all
   */
  getAllSubscriptions(): Observable<any[]> {
    const url = `${this.baseUrl}/policy/subscriptions/all`;
    return this.http.get<any[]>(url, { headers: this.getHeaders() }).pipe(
      catchError((err) => {
        console.error('ClaimService.getAllSubscriptions failed', err);
        return of([]);
      })
    );
  }

  /**
   * Get documents for a specific claim (for claim officers to view)
   * GET /claims/{claimId}/documents
   */
  getClaimDocuments(claimId: number): Observable<DocumentUpload[]> {
    const url = `${this.baseUrl}/claims/${claimId}/documents`;
    return this.http.get<DocumentUpload[]>(url, { headers: this.getHeaders() }).pipe(
      catchError((err) => {
        console.error('ClaimService.getClaimDocuments failed', err);
        return of([]);
      })
    );
  }

  /**
   * Get document download URL
   */
  getDocumentUrl(claimId: number, documentId: number): string {
    return `${this.baseUrl}/claims/${claimId}/documents/${documentId}`;
  }
}

