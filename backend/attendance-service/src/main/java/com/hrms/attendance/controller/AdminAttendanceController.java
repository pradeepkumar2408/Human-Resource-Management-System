package com.hrms.attendance.controller;

import com.hrms.attendance.dto.AttendanceCorrectionRequest;
import com.hrms.attendance.dto.AttendanceDto;
import com.hrms.attendance.dto.AttendanceReportDto;
import com.hrms.attendance.service.AttendanceService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/admin/attendance")
@CrossOrigin("*")
public class AdminAttendanceController {

    private final AttendanceService attendanceService;

    @Autowired
    public AdminAttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @GetMapping
    public ResponseEntity<Page<AttendanceDto>> getDailyAttendance(
            @RequestParam(value = "date", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(value = "departmentId", required = false) Long departmentId,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "employeeId", required = false) Long employeeId,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        
        Page<AttendanceDto> result = attendanceService.getDailyAttendance(date, departmentId, status, employeeId, page, size);
        return ResponseEntity.ok(result);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AttendanceDto> correctAttendance(
            @PathVariable("id") Long id,
            @Valid @RequestBody AttendanceCorrectionRequest request) {
        
        AttendanceDto updated = attendanceService.correctAttendance(id, request);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/report")
    public ResponseEntity<AttendanceReportDto> getReport(
            @RequestParam(value = "date", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        
        AttendanceReportDto report = attendanceService.getReport(date);
        return ResponseEntity.ok(report);
    }
}
