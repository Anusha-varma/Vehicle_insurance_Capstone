import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface PolicyDocument {
  id: number;
  fileName: string;
  fileType: string;
  filePath: string;
  uploadedAt: string;
}

@Injectable({ providedIn: 'root' })
export class PolicyDocumentService {

  private baseUrl = 'http://localhost:8080';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders | undefined {
    const token = this.authService.getToken();
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
  }

  getPolicyDocuments(subscriptionId: number): Observable<PolicyDocument[]> {
    return this.http.get<PolicyDocument[]>(
      `${this.baseUrl}/policy-subscription/${subscriptionId}/documents`,
      { headers: this.getHeaders() }
    );
  }
}