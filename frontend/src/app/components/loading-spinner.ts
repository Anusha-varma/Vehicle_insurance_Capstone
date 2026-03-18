import { Component } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { LoadingService } from '../services/loading.service';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [AsyncPipe],
  template: `
    @if (loadingService.loading$ | async) {
      <div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
        <div class="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#C2185B]"></div>
      </div>
    }
  `,
  styles: [`
    .animate-spin {
      border-radius: 9999px;
      border-width: 4px;
      border-top-color: #C2185B;
      border-bottom-color: #C2185B;
      border-left-color: transparent;
      border-right-color: transparent;
      width: 4rem;
      height: 4rem;
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class LoadingSpinnerComponent {
  constructor(public loadingService: LoadingService) {}
}