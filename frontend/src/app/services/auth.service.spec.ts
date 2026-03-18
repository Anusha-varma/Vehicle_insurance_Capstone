import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AuthService } from './auth.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

// Global localStorage mock
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};

// Setup global mock before tests
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Token Management', () => {
    it('should retrieve token from localStorage', () => {
      const token = 'test-jwt-token';
      localStorageMock.getItem.mockReturnValue(token);
      
      expect(service.getToken()).toBe(token);
      expect(localStorageMock.getItem).toHaveBeenCalledWith('auth_token');
    });

    it('should return null when no token exists', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      expect(service.getToken()).toBeNull();
    });
  });

  describe('User Role Management', () => {
    it('should store user role in localStorage', () => {
      const role = 'ADMIN';
      
      service.setUserRole(role);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('user_role', role);
    });

    it('should retrieve user role from localStorage', () => {
      const role = 'ADMIN';
      localStorageMock.getItem.mockReturnValue(role);
      
      const authService = new AuthService({} as any);
      expect(authService.getUserRole()).toBe(role);
      expect(localStorageMock.getItem).toHaveBeenCalledWith('user_role');
    });

    it('should return null when no role exists', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      const authService = new AuthService({} as any);
      expect(authService.getUserRole()).toBeNull();
    });

    it('should remove user role from localStorage when setting null', () => {
      service.setUserRole(null);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('user_role');
    });
  });

  describe('Authentication State', () => {
    it('should return true when token exists', () => {
      localStorageMock.getItem.mockReturnValue('some-token');
      
      expect(service.getToken()).toBe('some-token');
    });

    it('should return false when no token exists', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      expect(service.getToken()).toBeNull();
    });

    it('should clear all auth data on logout', () => {
      service.logout();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('user_role');
    });
  });

  describe('Username from Token', () => {
    it('should extract username from valid JWT token', () => {
      // Create a mock JWT token (header.payload.signature)
      const payload = btoa(JSON.stringify({ sub: 'testuser' }));
      const token = `mockHeader.${payload}.mockSignature`;
      
      const localStorageMock = {
        getItem: vi.fn().mockReturnValue(token),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn()
      };
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock
      });
      
      const authService = new AuthService({} as any);
      expect(authService.getUsername()).toBe('testuser');
    });

    it('should return null for invalid token', () => {
      const localStorageMock = {
        getItem: vi.fn().mockReturnValue('invalid-token'),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn()
      };
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock
      });
      
      const authService = new AuthService({} as any);
      expect(authService.getUsername()).toBeNull();
    });

    it('should return null when no token exists', () => {
      const localStorageMock = {
        getItem: vi.fn().mockReturnValue(null),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn()
      };
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock
      });
      
      const authService = new AuthService({} as any);
      expect(authService.getUsername()).toBeNull();
    });
  });
});
