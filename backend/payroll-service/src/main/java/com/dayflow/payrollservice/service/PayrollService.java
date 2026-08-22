package com.dayflow.payrollservice.service;

import com.dayflow.payrollservice.dto.*;
import com.dayflow.payrollservice.entity.Payroll;
import com.dayflow.payrollservice.entity.SalaryStructure;
import java.util.List;

public interface PayrollService {
    List<EmployeeNetPayResponse> getAllEmployeesNetPay(String payPeriod);
    SalaryStructure setOrUpdateSalaryStructure(String employeeId, SalaryStructureRequest request);
    BulkGenerateResponse generatePayroll(String payPeriod);
    List<Payroll> getPayrollByEmployeeId(String employeeId, String payPeriod);
}
