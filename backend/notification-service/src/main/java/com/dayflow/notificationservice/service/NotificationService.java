package com.dayflow.notificationservice.service;

import com.dayflow.notificationservice.dto.NotificationRequest;
import com.dayflow.notificationservice.dto.NotificationResponse;

import java.util.List;

public interface NotificationService {

    NotificationResponse createNotification(NotificationRequest request);

    List<NotificationResponse> getNotificationsForEmployee(String employeeId);

    NotificationResponse markAsRead(Long id);
}
