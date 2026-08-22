package com.dayflow.adminemployeeservice.service;

import com.dayflow.adminemployeeservice.dto.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface EmployeeService {
    EmployeeResponse onboardEmployee(EmployeeOnboardRequest request);
    EmployeeResponse updateEmployee(String id, EmployeeUpdateRequest request);
    EmployeeResponse getEmployeeById(String id);
    Page<EmployeeResponse> getEmployees(String firstName, String lastName, Long departmentId, Long designationId, Boolean isActive, Pageable pageable);
    void updateEmployeeStatus(String id, boolean active);
    void setPassword(SetPasswordRequest request);
    void signup(SignUpRequest request);
}
