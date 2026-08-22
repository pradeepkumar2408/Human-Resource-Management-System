package com.dayflow.leaveservice.controller;

import com.dayflow.leaveservice.dto.ApplyLeaveRequest;
import com.dayflow.leaveservice.dto.LeaveRequestResponse;
import com.dayflow.leaveservice.service.LeaveService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/leaves")
@CrossOrigin("*")
public class EmployeeLeaveController {

    private final LeaveService leaveService;

    @Autowired
    public EmployeeLeaveController(LeaveService leaveService) {
        this.leaveService = leaveService;
    }

    @PostMapping
    public ResponseEntity<LeaveRequestResponse> applyLeave(@Valid @RequestBody ApplyLeaveRequest request) {
        LeaveRequestResponse response = leaveService.applyLeave(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/me")
    public ResponseEntity<List<LeaveRequestResponse>> getMyLeaves(
            @RequestHeader(value = "X-Employee-Id", required = false) Long headerEmployeeId,
            @RequestParam(value = "employeeId", required = false) Long paramEmployeeId) {
        
        Long employeeId = (headerEmployeeId != null) ? headerEmployeeId : paramEmployeeId;
        if (employeeId == null) {
            throw new IllegalArgumentException("Employee ID must be provided in 'X-Employee-Id' header or 'employeeId' query parameter");
        }
        
        List<LeaveRequestResponse> leaves = leaveService.getLeavesByEmployeeId(employeeId);
        return ResponseEntity.ok(leaves);
    }
}
