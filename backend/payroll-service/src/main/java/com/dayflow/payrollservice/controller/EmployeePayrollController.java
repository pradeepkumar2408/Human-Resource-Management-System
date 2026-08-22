package com.dayflow.payrollservice.controller;

import com.dayflow.payrollservice.entity.Payroll;
import com.dayflow.payrollservice.service.PayrollService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payroll")
@CrossOrigin("*")
public class EmployeePayrollController {

    private final PayrollService payrollService;

    @Autowired
    public EmployeePayrollController(PayrollService payrollService) {
        this.payrollService = payrollService;
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMyPayrollSlips(
            @RequestHeader(value = "X-Employee-Id", required = false) String headerEmployeeId,
            @RequestParam(value = "employeeId", required = false) String paramEmployeeId,
            @RequestParam(required = false) String payPeriod) {
        
        String employeeId = headerEmployeeId != null ? headerEmployeeId : paramEmployeeId;
        
        if (employeeId == null || employeeId.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Bad Request",
                    "message", "Employee ID must be provided in X-Employee-Id header or as an employeeId parameter"
            ));
        }

        List<Payroll> slips = payrollService.getPayrollByEmployeeId(employeeId, payPeriod);
        return ResponseEntity.ok(slips);
    }
}
