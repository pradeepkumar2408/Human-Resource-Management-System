package com.dayflow.notificationservice.service;

import com.dayflow.notificationservice.dto.NotificationRequest;
import com.dayflow.notificationservice.dto.NotificationResponse;
import com.dayflow.notificationservice.entity.Notification;
import com.dayflow.notificationservice.exception.ResourceNotFoundException;
import com.dayflow.notificationservice.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;

    @Autowired
    public NotificationServiceImpl(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @Override
    public NotificationResponse createNotification(NotificationRequest request) {
        Notification notification = Notification.builder()
                .employeeId(request.getEmployeeId())
                .title(request.getTitle())
                .message(request.getMessage())
                .type(request.getType())
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();

        Notification savedNotification = notificationRepository.save(notification);
        return mapToResponse(savedNotification);
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> getNotificationsForEmployee(String employeeId) {
        List<Notification> notifications = notificationRepository.findByEmployeeIdOrderByCreatedAtDesc(employeeId);
        return notifications.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public NotificationResponse markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with ID: " + id));

        notification.setRead(true);
        Notification updatedNotification = notificationRepository.save(notification);
        return mapToResponse(updatedNotification);
    }

    private NotificationResponse mapToResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .employeeId(notification.getEmployeeId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .type(notification.getType())
                .isRead(notification.isRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
