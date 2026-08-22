package com.dayflow.leave.controller;

import com.dayflow.leave.entity.LeaveRequest;
import com.dayflow.leave.entity.LeaveType;
import com.dayflow.leave.service.LeaveService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/leaves")
@CrossOrigin(origins = "*")
public class LeaveController {

    private final LeaveService leaveService;

    @Autowired
    public LeaveController(LeaveService leaveService) {
        this.leaveService = leaveService;
    }

    // 1. POST /api/leaves — apply for leave
    @PostMapping
    public ResponseEntity<LeaveRequest> applyLeave(@RequestBody Map<String, Object> body) {
        Long employeeId = body.containsKey("employeeId") ? Long.parseLong(body.get("employeeId").toString()) : 1L;
        String typeName = body.containsKey("leaveType") ? body.get("leaveType").toString() : "CASUAL_LEAVE";
        String remarks = body.containsKey("remarks") ? body.get("remarks").toString() : "Personal work";
        
        LocalDate startDate = body.containsKey("startDate") ? LocalDate.parse(body.get("startDate").toString()) : LocalDate.now().plusDays(1);
        LocalDate endDate = body.containsKey("endDate") ? LocalDate.parse(body.get("endDate").toString()) : LocalDate.now().plusDays(2);

        LeaveRequest leaveRequest = leaveService.applyLeave(employeeId, typeName, startDate, endDate, remarks);
        return ResponseEntity.status(HttpStatus.CREATED).body(leaveRequest);
    }

    // 2. GET /api/leaves/me — list own leave requests + status
    @GetMapping("/me")
    public ResponseEntity<List<LeaveRequest>> getOwnLeaveRequests(
            @RequestParam(name = "employeeId", defaultValue = "1") Long employeeId) {
        List<LeaveRequest> requests = leaveService.getOwnLeaveRequests(employeeId);
        return ResponseEntity.ok(requests);
    }

    // 3. GET /api/leaves/types — fetch leave type master list
    @GetMapping("/types")
    public ResponseEntity<List<LeaveType>> getLeaveTypes() {
        List<LeaveType> types = leaveService.getLeaveTypes();
        return ResponseEntity.ok(types);
    }

    // 4. DELETE /api/leaves/{id} — withdraw a pending request
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> withdrawLeaveRequest(@PathVariable Long id) {
        Map<String, Object> result = leaveService.withdrawLeaveRequest(id);
        return ResponseEntity.ok(result);
    }
}
