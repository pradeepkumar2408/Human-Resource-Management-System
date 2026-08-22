package com.dayflow.payroll.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "PAYROLL")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payroll {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "PAYROLL_ID")
    private Long payrollId;

    @Column(name = "EMPLOYEE_ID", nullable = false)
    private Long employeeId;

    @Column(name = "PAY_PERIOD_MONTH")
    private Integer payPeriodMonth;

    @Column(name = "PAY_PERIOD_YEAR")
    private Integer payPeriodYear;

    @Column(name = "BASIC_SALARY")
    private Double basicSalary;

    @Column(name = "ALLOWANCES")
    private Double allowances;

    @Column(name = "DEDUCTIONS")
    private Double deductions;

    @Column(name = "NET_PAY")
    private Double netPay;

    @Column(name = "PAYMENT_DATE")
    private LocalDate paymentDate;

    @Column(name = "STATUS", length = 20)
    private String status; // PAID, PROCESSING, PENDING
}
