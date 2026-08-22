package com.hrms.reports.controller;

import com.hrms.reports.dto.*;
import com.hrms.reports.service.ReportsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*")
public class ReportsController {

    private final ReportsService reportsService;

    @Autowired
    public ReportsController(ReportsService reportsService) {
        this.reportsService = reportsService;
    }

    @GetMapping("/attendance")
    public ResponseEntity<List<AttendanceRecord>> getAttendanceReport(
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to) {
        List<AttendanceRecord> report = reportsService.getAttendanceReport(from, to);
        return ResponseEntity.ok(report);
    }

    @GetMapping("/leave")
    public ResponseEntity<LeaveStatsResponse> getLeaveReport(
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to) {
        LeaveStatsResponse report = reportsService.getLeaveReport(from, to);
        return ResponseEntity.ok(report);
    }

    @GetMapping("/salary-slips")
    public ResponseEntity<List<SalarySlipRecord>> getSalarySlipsReport(
            @RequestParam(required = false) String month,
            @RequestParam(required = false) String year) {
        List<SalarySlipRecord> report = reportsService.getSalarySlipsReport(month, year);
        return ResponseEntity.ok(report);
    }

    @GetMapping("/analytics")
    public ResponseEntity<AnalyticsResponse> getAnalyticsReport() {
        AnalyticsResponse report = reportsService.getAnalyticsReport();
        return ResponseEntity.ok(report);
    }
}
