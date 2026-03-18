package org.hartford.vehicle_insurance.service;

import org.hartford.vehicle_insurance.Repository.NotificationRepo;
import org.hartford.vehicle_insurance.model.Notification;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class NotificationService {
    private final NotificationRepo notificationRepo;

    public NotificationService(NotificationRepo notificationRepo) {
        this.notificationRepo = notificationRepo;
    }

    public void createNotification(String message, String role, Long userId) {
        Notification notification = new Notification(message, role, userId);
        notificationRepo.save(notification);
    }

    public List<Notification> getNotificationsByRole(String role) {
        return notificationRepo.findByRoleOrderByCreatedAtDesc(role);
    }

    public List<Notification> getNotificationsByUser(Long userId) {
        return notificationRepo.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<Notification> getNotificationsForUser(String role, Long userId) {
        if ("ADMIN".equals(role)) {
            return notificationRepo.findAllByOrderByCreatedAtDesc();
        }
        return notificationRepo.findByRoleOrUserIdOrderByCreatedAtDesc(role, userId);
    }

    public void markNotificationAsRead(Long id) {
        notificationRepo.findById(id).ifPresent(n -> {
            n.setRead(true);
            notificationRepo.save(n);
        });
    }
}
