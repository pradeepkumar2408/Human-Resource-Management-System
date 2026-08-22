package com.dayflow.leaveservice.controller;

import com.dayflow.leaveservice.dto.ApproveLeaveRequest;
import com.dayflow.leaveservice.dto.LeaveRequestResponse;
import com.dayflow.leaveservice.service.LeaveService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/admin/leaves")
@CrossOrigin("*")
public class AdminLeaveController {

    private final LeaveService leaveService;

    @Autowired
    public AdminLeaveController(LeaveService leaveService) {
        this.leaveService = leaveService;
    }

    @GetMapping
    public ResponseEntity<List<LeaveRequestResponse>> getAllLeaves(
            @RequestParam(required = false) Long employeeId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        List<LeaveRequestResponse> leaves = leaveService.getAllLeaves(employeeId, status, type, startDate, endDate);
        return ResponseEntity.ok(leaves);
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<LeaveRequestResponse> approveLeave(
            @PathVariable Long id,
            @RequestBody(required = false) ApproveLeaveRequest request) {
        
        String comment = (request != null) ? request.getComment() : null;
        LeaveRequestResponse response = leaveService.approveLeave(id, comment);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<LeaveRequestResponse> rejectLeave(
            @PathVariable Long id,
            @RequestBody ApproveLeaveRequest request) {
        
        String comment = (request != null) ? request.getComment() : null;
        LeaveRequestResponse response = leaveService.rejectLeave(id, comment);
        return ResponseEntity.ok(response);
    }
}
