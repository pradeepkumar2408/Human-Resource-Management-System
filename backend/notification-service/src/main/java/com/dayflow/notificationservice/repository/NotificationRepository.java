package com.dayflow.notificationservice.repository;

import com.dayflow.notificationservice.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByEmployeeIdOrEmployeeIdOrderByCreatedAtDesc(String employeeId, String allKeyword);
}
