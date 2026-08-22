package com.dayflow.adminemployeeservice.controller;

import com.dayflow.adminemployeeservice.dto.SignUpRequest;
import com.dayflow.adminemployeeservice.service.EmployeeService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*") // Allow frontend to call this API without CORS errors
public class AuthController {

    private final EmployeeService employeeService;

    @Autowired
    public AuthController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    @PostMapping("/signup")
    public ResponseEntity<Map<String, Object>> signup(@Valid @RequestBody SignUpRequest request) {
        employeeService.signup(request);
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Account activated successfully! Your password has been configured."
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<com.dayflow.adminemployeeservice.dto.LoginResponse> login(@Valid @RequestBody com.dayflow.adminemployeeservice.dto.LoginRequest request) {
        com.dayflow.adminemployeeservice.dto.LoginResponse response = employeeService.login(request);
        return ResponseEntity.ok(response);
    }
}
