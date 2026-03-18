import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ToastMessage {
  message: string;
  type: 'success' | 'error' | 'info';
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastSubject = new BehaviorSubject<ToastMessage | null>(null);
  public toast$ = this.toastSubject.asObservable();

  showError(message: string) {
    this.show(message, 'error');
  }

  showSuccess(message: string) {
    this.show(message, 'success');
  }

  showInfo(message: string) {
    this.show(message, 'info');
  }

  private show(message: string, type: 'success' | 'error' | 'info') {
    this.toastSubject.next({ message, type });
    // Auto-clear after 5 seconds
    setTimeout(() => {
      this.clear();
    }, 5000);
  }

  clear() {
    this.toastSubject.next(null);
  }
}
