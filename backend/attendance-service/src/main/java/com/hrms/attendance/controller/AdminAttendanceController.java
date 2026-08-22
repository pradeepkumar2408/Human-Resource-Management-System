package com.hrms.attendance.controller;

import com.hrms.attendance.dto.AttendanceCorrectionRequest;
import com.hrms.attendance.dto.AttendanceDto;
import com.hrms.attendance.dto.AttendanceReportDto;
import com.hrms.attendance.service.AttendanceService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

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
    public ResponseEntity<List<AttendanceDto>> getDailyAttendance(
            @RequestParam(value = "date", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(value = "departmentId", required = false) Long departmentId,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "employeeId", required = false) String employeeId) {
        
        List<AttendanceDto> result = attendanceService.getDailyAttendance(date, departmentId, status, employeeId);
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
