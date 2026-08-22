package com.dayflow.auth.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    @GetMapping("/me")
    public ResponseEntity<List<?>> getMyNotifications() {
        // Return empty notifications list for frontend notification feeds
        return ResponseEntity.ok(Collections.emptyList());
    }
}
