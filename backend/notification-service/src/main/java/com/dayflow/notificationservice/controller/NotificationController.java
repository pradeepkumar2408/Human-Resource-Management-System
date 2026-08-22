package com.dayflow.notificationservice.controller;

import com.dayflow.notificationservice.dto.NotificationRequest;
import com.dayflow.notificationservice.dto.NotificationResponse;
import com.dayflow.notificationservice.service.NotificationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin("*")
public class NotificationController {

    private final NotificationService notificationService;

    @Autowired
    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @PostMapping
    public ResponseEntity<NotificationResponse> createNotification(@Valid @RequestBody NotificationRequest request) {
        NotificationResponse response = notificationService.createNotification(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/me")
    public ResponseEntity<List<NotificationResponse>> getMyNotifications(
            @RequestHeader(value = "X-Employee-Id", required = false) String headerEmployeeId,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @RequestParam(value = "employeeId", required = false) String paramEmployeeId) {

        String employeeId = headerEmployeeId;
        if (employeeId == null || employeeId.isBlank()) {
            employeeId = headerUserId;
        }
        if (employeeId == null || employeeId.isBlank()) {
            employeeId = paramEmployeeId;
        }

        if (employeeId == null || employeeId.isBlank()) {
            throw new IllegalArgumentException("Employee identity could not be resolved from headers (X-Employee-Id or X-User-Id) or request parameters.");
        }

        List<NotificationResponse> responses = notificationService.getNotificationsForEmployee(employeeId);
        return ResponseEntity.ok(responses);
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<NotificationResponse> markAsRead(@PathVariable Long id) {
        NotificationResponse response = notificationService.markAsRead(id);
        return ResponseEntity.ok(response);
    }
}
