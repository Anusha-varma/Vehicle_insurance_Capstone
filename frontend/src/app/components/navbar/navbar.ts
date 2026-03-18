import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService, Notification } from '../../services/notification.service';
import { Subscription, interval } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  userRole: string | null = null;
  username: string | null = null;
  notifications: Notification[] = [];
  unreadCount = 0;
  showNotifications = false;
  private roleSub?: Subscription;
  private notificationSub?: Subscription;

  constructor(
    private authService: AuthService, 
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.checkAuthStatus();
    this.roleSub = this.authService.userRole$.subscribe(role => {
      this.userRole = role;
      this.isLoggedIn = !!this.authService.getToken();
      
      if (this.isLoggedIn) {
        this.username = this.authService.getUsername();
        this.startNotificationPolling();
      } else {
        this.username = null;
        this.stopNotificationPolling();
        this.notifications = [];
        this.unreadCount = 0;
      }
    });
  }

  ngOnDestroy() {
    this.roleSub?.unsubscribe();
    this.stopNotificationPolling();
  }

  startNotificationPolling() {
    this.stopNotificationPolling();
    // Use a slightly longer interval (10s) to be less invasive
    this.notificationSub = interval(10000) 
      .pipe(
        startWith(0),
        switchMap(() => this.notificationService.getNotifications())
      )
      .subscribe({
        next: (data) => {
          this.notifications = data;
          this.unreadCount = data.filter(n => !n.isRead).length;
        },
        error: (err) => console.error('Error fetching notifications', err)
      });
  }

  stopNotificationPolling() {
    this.notificationSub?.unsubscribe();
  }

  toggleNotifications(event: MouseEvent) {
    event.stopPropagation();
    this.showNotifications = !this.showNotifications;
  }

  markAsRead(notification: Notification) {
    if (notification.isRead) return;

    // Immediate UI feedback
    notification.isRead = true;
    this.unreadCount = Math.max(0, this.unreadCount - 1);

    this.notificationService.markAsRead(notification.id).subscribe({
      next: () => {
        // Success - state already updated locally
        console.log(`Notification ${notification.id} marked as read`);
      },
      error: (err) => {
        // Revert on error
        notification.isRead = false;
        this.unreadCount = this.notifications.filter(n => !n.isRead).length;
        console.error('Failed to mark notification as read', err);
      }
    });
  }

  checkAuthStatus() {
    this.isLoggedIn = !!this.authService.getToken();
    this.userRole = this.authService.getUserRole();
    if (this.isLoggedIn) {
      this.username = this.authService.getUsername();
    }
  }

  logout() {
    this.stopNotificationPolling();
    this.authService.logout();
    this.isLoggedIn = false;
    this.userRole = null;
    this.username = null;
    this.notifications = [];
    this.unreadCount = 0;
    this.showNotifications = false;
    this.router.navigate(['/login']);
  }
}
