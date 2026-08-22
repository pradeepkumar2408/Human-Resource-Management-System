package com.dayflow.adminemployeeservice.service;

import com.dayflow.adminemployeeservice.dto.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface EmployeeService {
    EmployeeResponse onboardEmployee(EmployeeOnboardRequest request);
    EmployeeResponse updateEmployee(Long id, EmployeeUpdateRequest request);
    EmployeeResponse getEmployeeById(Long id);
    Page<EmployeeResponse> getEmployees(String firstName, String lastName, Long departmentId, Long designationId, Boolean isActive, Pageable pageable);
    void updateEmployeeStatus(Long id, boolean active);
    void setPassword(SetPasswordRequest request);
}
