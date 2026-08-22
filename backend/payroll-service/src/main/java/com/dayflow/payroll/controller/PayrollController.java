package com.dayflow.payroll.controller;

import com.dayflow.payroll.entity.Payroll;
import com.dayflow.payroll.entity.SalaryStructure;
import com.dayflow.payroll.service.PayrollService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payroll")
@CrossOrigin(origins = "*")
public class PayrollController {

    private final PayrollService payrollService;

    @Autowired
    public PayrollController(PayrollService payrollService) {
        this.payrollService = payrollService;
    }

    // 1. GET /api/payroll/me — view own salary structure (read-only)
    @GetMapping("/me")
    public ResponseEntity<SalaryStructure> getSalaryStructure(
            @RequestParam(name = "employeeId", defaultValue = "1") Long employeeId) {
        SalaryStructure structure = payrollService.getSalaryStructure(employeeId);
        return ResponseEntity.ok(structure);
    }

    // 2. GET /api/payroll/me/history — monthly payment history
    @GetMapping("/me/history")
    public ResponseEntity<List<Payroll>> getPaymentHistory(
            @RequestParam(name = "employeeId", defaultValue = "1") Long employeeId) {
        List<Payroll> history = payrollService.getPaymentHistory(employeeId);
        return ResponseEntity.ok(history);
    }

    // 3. GET /api/payroll/me/slip/{payrollId} — download salary slip PDF / details
    @GetMapping("/me/slip/{payrollId}")
    public ResponseEntity<Map<String, Object>> getSalarySlip(@PathVariable Long payrollId) {
        Map<String, Object> slipDetails = payrollService.getSalarySlip(payrollId);
        return ResponseEntity.ok(slipDetails);
    }
}
