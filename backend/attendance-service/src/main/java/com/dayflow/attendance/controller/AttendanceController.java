package com.dayflow.attendance.controller;

import com.dayflow.attendance.entity.Attendance;
import com.dayflow.attendance.service.AttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin(origins = "*")
public class AttendanceController {

    private final AttendanceService attendanceService;

    @Autowired
    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    // 1. POST /api/attendance/check-in
    @PostMapping("/check-in")
    public ResponseEntity<Attendance> checkIn(@RequestBody Map<String, Long> payload) {
        Long employeeId = payload.getOrDefault("employeeId", 1L);
        Attendance attendance = attendanceService.checkIn(employeeId);
        return ResponseEntity.ok(attendance);
    }

    // 2. POST /api/attendance/check-out
    @PostMapping("/check-out")
    public ResponseEntity<Attendance> checkOut(@RequestBody Map<String, Long> payload) {
        Long employeeId = payload.getOrDefault("employeeId", 1L);
        Attendance attendance = attendanceService.checkOut(employeeId);
        return ResponseEntity.ok(attendance);
    }

    // 3. GET /api/attendance/me?range=daily|weekly
    @GetMapping("/me")
    public ResponseEntity<List<Attendance>> getOwnAttendance(
            @RequestParam(name = "employeeId", defaultValue = "1") Long employeeId,
            @RequestParam(name = "range", defaultValue = "weekly") String range) {
        List<Attendance> attendances = attendanceService.getOwnAttendance(employeeId, range);
        return ResponseEntity.ok(attendances);
    }

    // 4. GET /api/attendance/me/summary
    @GetMapping("/me/summary")
    public ResponseEntity<Map<String, Object>> getAttendanceSummary(
            @RequestParam(name = "employeeId", defaultValue = "1") Long employeeId) {
        Map<String, Object> summary = attendanceService.getAttendanceSummary(employeeId);
        return ResponseEntity.ok(summary);
    }
}
