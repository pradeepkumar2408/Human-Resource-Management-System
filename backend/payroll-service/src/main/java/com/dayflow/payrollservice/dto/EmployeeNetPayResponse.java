package com.dayflow.payrollservice.dto;

import lombok.*;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeNetPayResponse {
    private String employeeId;
    private Double netPay;
    private Double basicSalary;
    private Double hra;
    private Double allowances;
    private Double deductions;
    private String payPeriod;
    private String paymentStatus;
    private LocalDate generationDate;
    private String source; // "PAYROLL_SLIP" or "SALARY_STRUCTURE"
}
