package com.dayflow.adminemployeeservice.controller;

import com.dayflow.adminemployeeservice.dto.EmployeeResponse;
import com.dayflow.adminemployeeservice.service.EmployeeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

/**
 * EmployeeController - Endpoints used by the Employee (self-service) frontend.
 * Routes: /api/employees/**
 */
@RestController
@RequestMapping("/api/employees")
@CrossOrigin(origins = "*")
public class EmployeeController {

    private final EmployeeService employeeService;

    @Autowired
    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    /**
     * GET /api/employees/{id}
     * Employee fetches their own profile by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<EmployeeResponse> getMyProfile(@PathVariable String id) {
        EmployeeResponse response = employeeService.getEmployeeById(id);
        return ResponseEntity.ok(response);
    }

    /**
     * PUT /api/employees/{id}
     * Employee updates their own profile (firstName, lastName, dob, gender, phone, address).
     */
    @PutMapping("/{id}")
    public ResponseEntity<EmployeeResponse> updateMyProfile(
            @PathVariable String id,
            @RequestBody Map<String, Object> request) {
        EmployeeResponse response = employeeService.updateSelfProfile(id, request);
        return ResponseEntity.ok(response);
    }
}
