
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';

export interface CreateUnderwriterRequest {
  username: string;
  password: string;
}

export interface CreateUnderwriterResponse {
  id?: number;
  username?: string;
  role?: string;
  message?: string;
}


export interface CreateClaimOfficerRequest {
  username: string;
  password: string;
}

export interface CreateClaimOfficerResponse {
  id?: number;
  username?: string;
  role?: string;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private baseUrl = 'http://localhost:8080';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders | undefined {
    const token = this.authService.getToken();
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
  }

  /**
   * Create a new claim officer
   * POST /admin/create-claim-officer
   */
  createClaimOfficer(data: CreateClaimOfficerRequest): Observable<CreateClaimOfficerResponse> {
    const url = `${this.baseUrl}/admin/create-claim-officer`;
    return this.http.post<CreateClaimOfficerResponse>(url, data, { headers: this.getHeaders() }).pipe(
      catchError((err) => {
        console.error('AdminService.createClaimOfficer failed', err);
        throw err;
      })
    );
  }

  /**
   * Create a new underwriter
   * POST /admin/create-underwriter
   */
  createUnderwriter(data: CreateUnderwriterRequest): Observable<CreateUnderwriterResponse> {
    const url = `${this.baseUrl}/admin/create-underwriter`;
    return this.http.post<CreateUnderwriterResponse>(url, data, { headers: this.getHeaders() }).pipe(
      catchError((err) => {
        console.error('AdminService.createUnderwriter failed', err);
        throw err;
      })
    );
  }
 getAllUsers(): Observable<any[]> {
  return this.http.get<any[]>(`${this.baseUrl}/admin/users`, {
    headers: this.getHeaders()
  });
}

getPendingApplications(): Observable<any[]> {
  return this.http.get<any[]>(`${this.baseUrl}/underwriter/pending-applications`, {
    headers: this.getHeaders()
  });
}
getTotalRevenue(): Observable<number> {
  return this.http.get<number>(`${this.baseUrl}/admin/revenue`, {
    headers: this.getHeaders()
  });
}

getUnderwriterCommission(): Observable<number> {
  return this.http.get<number>(`${this.baseUrl}/admin/underwriter-commission`, {
    headers: this.getHeaders()
  });
}

getClaimOfficerCommission(): Observable<number> {
  return this.http.get<number>(`${this.baseUrl}/admin/claimofficer-commission`, {
    headers: this.getHeaders()
  });
}

}
