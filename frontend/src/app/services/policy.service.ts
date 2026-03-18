  // Removed duplicate underwriter-specific methods. Use getPendingPolicyRequests, approvePolicyRequest, and rejectPolicyRequest for underwriter logic.
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
export interface Policy {
  id?: number;
  policyId?: number;
  name?: string;
  description?: string;
  policyType?: string;
  vehicleType?: string;
  basePremium?: number | string;
  premium?: number | string;
  coverageAmount?: number | string;
}

export interface PolicyDocument {
  id?: number;
  fileName?: string;
  fileType?: string;
  documentType?: string;
  filePath?: string;
  uploadedAt?: string;
}

// Policy subscription with nested policy object
export interface PolicySubscription {
  id?: number;
  subscriptionId?: number;
  policyId?: number;
  policyName?: string;
  name?: string;
  coverageAmount?: number | string;
  startDate?: string;
  endDate?: string;
  status?: string;
  vehicleNumber?: string;
  vehicleModel?: string;
  totalPremium?: number;
  riskScore?: number;
  policy?: Policy;
}

export interface Claim {
  id?: number;
  claimId?: number;
  policySubscriptionId?: number;
  amount?: number | string;
  claimAmount?: number | string;
  description?: string;
  status?: string;
  createdAt?: string;
  claimDate?: string;
  claimType?: string;
  thirdPartyName?: string;
  thirdPartyVehicleNumber?: string;
  injuryType?: string;
  garageEstimate?: number;
  damageDescription?: string;
}

@Injectable({ providedIn: 'root' })
export class PolicyService {

  private baseUrl = 'http://localhost:8080';

  private policiesSubject = new BehaviorSubject<Policy[]>([]);
  public policies$ = this.policiesSubject.asObservable();

  constructor(private http: HttpClient, private authService: AuthService) {}


/** Get all pending policy applications for admin */
getPendingPolicyRequests(): Observable<any[]> {
  const url = `${this.baseUrl}/underwriter/pending-applications`;
  const token = this.authService.getToken();
  const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;

  return this.http.get<any[]>(url, { headers }).pipe(
    catchError((err) => {
      console.error('PolicyService.getPendingPolicyRequests failed', err);
      return of([]);
    })
  );
}

/** Approve a pending policy application */
approvePolicyRequest(requestId: number): Observable<any> {
  const url = `${this.baseUrl}/underwriter/policy-applications/${requestId}/approve`;
  const token = this.authService.getToken();
  const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;

  return this.http.put<any>(url, {}, { headers }).pipe(
    catchError((err) => {
      console.error('PolicyService.approvePolicyRequest failed', err);
      throw err;
    })
  );
}

/** Reject a pending policy application */
rejectPolicyRequest(requestId: number): Observable<any> {
  const url = `${this.baseUrl}/underwriter/policy-applications/${requestId}/reject`;
  const token = this.authService.getToken();
  const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;

  return this.http.put<any>(url, {}, { headers }).pipe(
    catchError((err) => {
      console.error('PolicyService.rejectPolicyRequest failed', err);
      throw err;
    })
  );
}
  loadPolicies(): Observable<Policy[]> {
    const url = `${this.baseUrl}/policy/all`;
    const token = this.authService.getToken();
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;

    return this.http.get<Policy[]>(url, { headers }).pipe(
      tap((policies) => this.policiesSubject.next(policies || [])),
      catchError((err) => {
        console.error('PolicyService.loadPolicies failed', err);
        this.policiesSubject.next([]);
        return of([] as Policy[]);
      })
    );
  }

  /** Create a new policy on the backend */
/** Create a new policy on the backend */
createPolicy(policy: any): Observable<Policy> {
  const url = `${this.baseUrl}/policy/create`;
console.log("Calling API:", url);
  return this.http.post<Policy>(url, policy).pipe(
    tap((p) => {
      const current = this.policiesSubject.getValue() || [];
      this.policiesSubject.next([...(current || []), p]);
    }),
    catchError((err) => {
      console.error('PolicyService.createPolicy failed', err);
      throw err;
    })
  );
}

  /** Get a single policy by ID */
  getPolicyById(policyId: number): Observable<Policy> {
    const url = `${this.baseUrl}/policy/${policyId}`;
    const token = this.authService.getToken();
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;

    return this.http.get<Policy>(url, { headers }).pipe(
      catchError((err) => {
        console.error('PolicyService.getPolicyById failed', err);
        throw err;
      })
    );
  }

getAllPolicyApplications(): Observable<any[]> {
  const url = `${this.baseUrl}/underwriter/all-applications`;
  const token = this.authService.getToken();
  const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;

  return this.http.get<any[]>(url, { headers });
}

  /** Apply a policy for a customer */
  applyPolicy(policyId: number, data: any): Observable<any> {
    const url = `${this.baseUrl}/policy/${policyId}/apply`;
    const token = this.authService.getToken();
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;

    return this.http.post<any>(url, data, { headers }).pipe(
      catchError((err) => {
        console.error('PolicyService.applyPolicy failed', err);
        throw err;
      })
    );
  }
  subscribePolicy(policyId: number) {
  return this.http.post(`${this.baseUrl}/customer/subscribe/${policyId}`, {});
}

  /**
   * Get documents for a specific policy (for underwriters to view)
   * GET /underwriter/policies/{policyId}/documents - For approved policies
   * GET /underwriter/policy-applications/{subscriptionId}/documents - For pending applications
   */
  getUnderwriterPolicyDocuments(policyId: number): Observable<PolicyDocument[]> {
    const url = `${this.baseUrl}/underwriter/policies/${policyId}/documents`;
    const token = this.authService.getToken();
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;

    return this.http.get<PolicyDocument[]>(url, { headers }).pipe(
      catchError((err) => {
        console.error('PolicyService.getUnderwriterPolicyDocuments failed', err);
        return of([]);
      })
    );
  }

  /**
   * Get documents for a pending policy application (for underwriters to view)
   * GET /policy-subscription/{subscriptionId}/documents
   */
  getUnderwriterApplicationDocuments(subscriptionId: number): Observable<PolicyDocument[]> {
    const url = `${this.baseUrl}/policy-subscription/${subscriptionId}/documents`;
    const token = this.authService.getToken();
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;

    return this.http.get<PolicyDocument[]>(url, { headers }).pipe(
      catchError((err) => {
        console.error('PolicyService.getUnderwriterApplicationDocuments failed', err);
        return of([]);
      })
    );
  }

  /**
   * Get document download URL for underwriter
   * GET /underwriter/policies/{policyId}/documents/{documentId}
   */
  getUnderwriterDocumentDownloadUrl(policyId: number, documentId: number): string {
    return `${this.baseUrl}/underwriter/policies/${policyId}/documents/${documentId}`;
  }

  /**
   * Upload document for a policy subscription
   * POST /policy-subscription/{subscriptionId}/upload-document
   */
  uploadPolicyDocument(subscriptionId: number, file: File, documentType: string): Observable<PolicyDocument> {
    const url = `${this.baseUrl}/policy-subscription/${subscriptionId}/upload-document`;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);
    
    const token = this.authService.getToken();
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
    
    return this.http.post<PolicyDocument>(url, formData, { headers }).pipe(
      catchError((err) => {
        console.error('PolicyService.uploadPolicyDocument failed', err);
        throw err;
      })
    );
  }

  getMyPolicies(): Observable<PolicySubscription[]> {
    const url = `${this.baseUrl}/policy/my`;
    const token = this.authService.getToken();
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;

    return this.http.get<PolicySubscription[]>(url, { headers }).pipe(
      catchError((err) => {
        console.error('PolicyService.getMyPolicies failed', err);
        return of([]);
      })
    );
  }

  /** Get customer's claims */
 getMyClaims(): Observable<Claim[]> {
  const url = `${this.baseUrl}/claims/my`;
  const token = this.authService.getToken();
  const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;

  return this.http.get<Claim[]>(url, { headers }).pipe(
    catchError((err) => {
      console.error('PolicyService.getMyClaims failed', err);
      return of([]);
    })
  );
}

  /** Update an existing policy */
  updatePolicy(policyId: number, policyData: any): Observable<Policy> {
    const url = `${this.baseUrl}/policy/${policyId}`;
    const token = this.authService.getToken();
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;

    return this.http.put<Policy>(url, policyData, { headers }).pipe(
      tap((updated) => {
        // Optimistically update the local BehaviorSubject array
        const current = this.policiesSubject.getValue() || [];
        const index = current.findIndex(p => p.id === policyId || p.policyId === policyId);
        if (index !== -1) {
          const newPolicies = [...current];
          newPolicies[index] = { ...newPolicies[index], ...updated };
          this.policiesSubject.next(newPolicies);
        }
      }),
      catchError((err) => {
        console.error('PolicyService.updatePolicy failed', err);
        throw err;
      })
    );
  }

  /** Delete a policy */
  deletePolicy(policyId: number): Observable<void> {
    const url = `${this.baseUrl}/policy/${policyId}`;
    const token = this.authService.getToken();
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;

    return this.http.delete<void>(url, { headers }).pipe(
      tap(() => {
        // Optimistically remove from local BehaviorSubject array
        const current = this.policiesSubject.getValue() || [];
        const filtered = current.filter(p => p.id !== policyId && p.policyId !== policyId);
        this.policiesSubject.next(filtered);
      }),
      catchError((err) => {
        console.error('PolicyService.deletePolicy failed', err);
        throw err;
      })
    );
  }
    /** Renew a policy subscription */
  renewPolicy(subscriptionId: number): Observable<any> {
    const url = `${this.baseUrl}/policy/${subscriptionId}/renew`;
    const token = this.authService.getToken();
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;

    return this.http.post<any>(url, {}, { headers }).pipe(
      catchError((err) => {
        console.error('PolicyService.renewPolicy failed', err);
        throw err;
      })
    );
  }
payPremium(subscriptionId: number, transactionId: string): Observable<any> {
  const url = `${this.baseUrl}/payments/${subscriptionId}?transactionId=${transactionId}`;
  const token = this.authService.getToken();
  const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;

  return this.http.post<any>(url, {}, { headers }).pipe(
    catchError((err) => {
      console.error('PolicyService.payPremium failed', err);
      throw err;
    })
  );
}
getPremiumBreakdown(subscriptionId:number){
  return this.http.get<any>(
    `${this.baseUrl}/underwriter/policy-applications/${subscriptionId}/premium-breakdown`
  );
}
getUnderwriterCommission(): Observable<number> {
  const url = `${this.baseUrl}/underwriter/commission`;
  const token = this.authService.getToken();
  const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;

  return this.http.get<number>(url, { headers }).pipe(
    catchError((err) => {
      console.error('PolicyService.getUnderwriterCommission failed', err);
      return of(0);
    })
  );
}
getClaimOfficerCommission(): Observable<number> {
  const url = `http://localhost:8080/claims/commission`;
  const token = this.authService.getToken();
  const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;

  return this.http.get<number>(url, { headers }).pipe(
    catchError((err) => {
      console.error('ClaimService.getClaimOfficerCommission failed', err);
      return of(0);
    })
  );
}
}