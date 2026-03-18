package org.hartford.vehicle_insurance.Repository;

import org.hartford.vehicle_insurance.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepo extends JpaRepository<Notification, Long> {
    List<Notification> findByRoleOrderByCreatedAtDesc(String role);
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Notification> findByRoleOrUserIdOrderByCreatedAtDesc(String role, Long userId);
    List<Notification> findAllByOrderByCreatedAtDesc();
}
