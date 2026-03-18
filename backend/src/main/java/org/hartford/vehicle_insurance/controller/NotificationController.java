package org.hartford.vehicle_insurance.controller;

import org.hartford.vehicle_insurance.model.MyUser;
import org.hartford.vehicle_insurance.model.Notification;
import org.hartford.vehicle_insurance.service.MyUserService;
import org.hartford.vehicle_insurance.service.NotificationService;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final MyUserService myUserService;

    public NotificationController(NotificationService notificationService, MyUserService myUserService) {
        this.notificationService = notificationService;
        this.myUserService = myUserService;
    }

    @GetMapping
    public List<Notification> getMyNotifications() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        MyUser user = myUserService.findByUsername(username);
        
        // Return based on role and userId
        return notificationService.getNotificationsForUser(user.getRoles(), user.getId());
    }

    @PutMapping("/{id}/read")
    public void markAsRead(@PathVariable Long id) {
        notificationService.markNotificationAsRead(id);
    }
}
