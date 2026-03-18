import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl = 'http://localhost:8080';
  private readonly tokenKey = 'auth_token';
  private readonly roleKey = 'user_role';

  private userRoleSubject = new BehaviorSubject<string | null>(this.getRoleFromStorage());
  public userRole$ = this.userRoleSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Login with username and password. Stores JWT in localStorage when returned.
   * POST /login
   */login(username: string, password: string): Observable<any> {
  const url = `${this.baseUrl}/user/login`;

  return this.http.post<any>(url, { username, password }).pipe(
    map((resp: any) => {
      if (resp && resp.token) {
        let token = resp.token;

        // Remove Bearer prefix if backend sends it
        if (token.startsWith('Bearer ')) {
          token = token.substring(7);
        }

        localStorage.setItem(this.tokenKey, token);
      }
      return resp;
    })
  );
}
  /**
   * Register a new user. Stores JWT in localStorage if returned by backend.
   * POST /register
   */
  register(user: any): Observable<any> {
    const url = `${this.baseUrl}/user/register`;
    return this.http.post<any>(url, user, { observe: 'response' }).pipe(
      map((resp: HttpResponse<any>) => {
        const body = resp.body || {};
        let token: any = body.token || body.jwt || body.accessToken || resp.headers.get('Authorization');
        if (token && typeof token === 'string') {
          if (token.startsWith('Bearer ')) {
            token = token.substring(7);
          }
          localStorage.setItem(this.tokenKey, token);
        }
        return resp.body;
      })
    );
  }

  /** Store user role in localStorage and BehaviorSubject */
  setUserRole(role: string | null): void {
    if (role) {
      localStorage.setItem(this.roleKey, role);
    } else {
      localStorage.removeItem(this.roleKey);
    }
    this.userRoleSubject.next(role || null);
  }

  /** Get user role from storage (used on init) */
  private getRoleFromStorage(): string | null {
    return localStorage.getItem(this.roleKey);
  }

  /** Get current user role (synchronous) */
  getUserRole(): string | null {
    return this.userRoleSubject.getValue();
  }

  /** Return stored JWT token or null if missing. */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /** Decode JWT payload without a heavy library */
  private decodeToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch(e) {
      return null;
    }
  }

  /** Get current username from token */
  getUsername(): string | null {
    const token = this.getToken();
    if (!token) return null;
    
    const decoded = this.decodeToken(token);
    return decoded ? decoded.sub : null;
  }

  /** Clear token and role on logout */
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.roleKey);
    this.userRoleSubject.next(null);
  }
}
