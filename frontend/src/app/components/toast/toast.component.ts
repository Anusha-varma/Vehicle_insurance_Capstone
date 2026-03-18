import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, ToastMessage } from '../../services/toast.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (toast) {
      <div 
        class="fixed top-24 right-6 z-50 flex items-center w-full max-w-sm p-4 space-x-3 text-gray-800 bg-white rounded-lg shadow-xl shadow-black/10 transition-all duration-300 transform translate-y-0"
        [ngClass]="{
          'border-l-4 border-red-500': toast.type === 'error',
          'border-l-4 border-green-500': toast.type === 'success',
          'border-l-4 border-blue-500': toast.type === 'info'
        }"
        role="alert">
        
        <!-- Icon -->
        <div class="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg"
          [ngClass]="{
            'text-red-500 bg-red-100': toast.type === 'error',
            'text-green-500 bg-green-100': toast.type === 'success',
            'text-blue-500 bg-blue-100': toast.type === 'info'
          }">
          @if (toast.type === 'error') {
            <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 11.793a1 1 0 1 1-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 0 1-1.414-1.414L8.586 10 6.293 7.707a1 1 0 0 1 1.414-1.414L10 8.586l2.293-2.293a1 1 0 0 1 1.414 1.414L11.414 10l2.293 2.293Z"/>
            </svg>
          } @else if (toast.type === 'success') {
            <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z"/>
            </svg>
          } @else {
            <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
            </svg>
          }
        </div>

        <div class="ml-3 text-sm font-semibold flex-1 leading-tight">{{ toast.message }}</div>

        <button type="button" (click)="close()" class="ml-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8 transition-colors" aria-label="Close">
            <span class="sr-only">Close</span>
            <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
            </svg>
        </button>

      </div>
    }
  `
})
export class ToastComponent implements OnInit, OnDestroy {
  toast: ToastMessage | null = null;
  private subscription: Subscription | null = null;

  constructor(private toastService: ToastService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.subscription = this.toastService.toast$.subscribe(message => {
      this.toast = message;
      this.cdr.detectChanges();
    });
  }

  close() {
    this.toastService.clear();
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
