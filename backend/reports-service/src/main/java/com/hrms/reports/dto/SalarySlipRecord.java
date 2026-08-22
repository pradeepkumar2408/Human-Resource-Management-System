package com.hrms.reports.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalarySlipRecord {
    private Long id;
    private String employeeId;
    private String payPeriod;
    private BigDecimal basicSalary;
    private BigDecimal hra;
    private BigDecimal allowances;
    private BigDecimal deductions;
    private BigDecimal netPay;
    private String paymentStatus;
    private LocalDate generationDate;
}
