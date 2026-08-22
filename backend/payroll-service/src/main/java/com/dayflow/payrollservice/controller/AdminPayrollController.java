package com.dayflow.payrollservice.controller;

import com.dayflow.payrollservice.dto.*;
import com.dayflow.payrollservice.entity.SalaryStructure;
import com.dayflow.payrollservice.service.PayrollService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/payroll")
@CrossOrigin("*")
public class AdminPayrollController {

    private final PayrollService payrollService;

    @Autowired
    public AdminPayrollController(PayrollService payrollService) {
        this.payrollService = payrollService;
    }

    @GetMapping
    public ResponseEntity<List<EmployeeNetPayResponse>> getAllEmployeesNetPay(
            @RequestParam(required = false) String payPeriod) {
        List<EmployeeNetPayResponse> response = payrollService.getAllEmployeesNetPay(payPeriod);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/salary-structure/{employeeId}")
    public ResponseEntity<SalaryStructure> setOrUpdateSalaryStructure(
            @PathVariable String employeeId,
            @Valid @RequestBody SalaryStructureRequest request) {
        SalaryStructure response = payrollService.setOrUpdateSalaryStructure(employeeId, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/generate")
    public ResponseEntity<BulkGenerateResponse> generatePayroll(
            @Valid @RequestBody BulkGenerateRequest request) {
        BulkGenerateResponse response = payrollService.generatePayroll(request.getPayPeriod());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
}
