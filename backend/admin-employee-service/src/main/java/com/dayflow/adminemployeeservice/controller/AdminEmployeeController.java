package com.dayflow.adminemployeeservice.controller;

import com.dayflow.adminemployeeservice.dto.*;
import com.dayflow.adminemployeeservice.service.EmployeeService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/employees")
public class AdminEmployeeController {

    private final EmployeeService employeeService;

    @Autowired
    public AdminEmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    @PostMapping
    public ResponseEntity<EmployeeResponse> onboardEmployee(@Valid @RequestBody EmployeeOnboardRequest request) {
        EmployeeResponse response = employeeService.onboardEmployee(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<EmployeeResponse> updateEmployee(
            @PathVariable Long id,
            @Valid @RequestBody EmployeeUpdateRequest request) {
        EmployeeResponse response = employeeService.updateEmployee(id, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmployeeResponse> getEmployeeById(@PathVariable Long id) {
        EmployeeResponse response = employeeService.getEmployeeById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<Page<EmployeeResponse>> getEmployees(
            @RequestParam(required = false) String firstName,
            @RequestParam(required = false) String lastName,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) Long designationId,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "employeeId") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        PageRequest pageRequest = PageRequest.of(page, size, sort);
        
        Page<EmployeeResponse> response = employeeService.getEmployees(
                firstName, lastName, departmentId, designationId, isActive, pageRequest);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Map<String, String>> updateEmployeeStatus(
            @PathVariable Long id,
            @RequestParam boolean active) {
        employeeService.updateEmployeeStatus(id, active);
        String message = active ? "Employee account activated successfully" : "Employee account deactivated successfully";
        return ResponseEntity.ok(Map.of("message", message));
    }

    @PostMapping("/set-password")
    public ResponseEntity<Map<String, String>> setPassword(@Valid @RequestBody SetPasswordRequest request) {
        employeeService.setPassword(request);
        return ResponseEntity.ok(Map.of("message", "Password set successfully, employee account is now active"));
    }
}
