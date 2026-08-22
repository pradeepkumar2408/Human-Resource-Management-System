package com.dayflow.payrollservice.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "PAYROLL", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"EMPLOYEE_ID", "PAY_PERIOD"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payroll {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "payroll_gen")
    @SequenceGenerator(name = "payroll_gen", sequenceName = "PAYROLL_SEQ", allocationSize = 1)
    private Long id;

    @Column(name = "EMPLOYEE_ID", length = 50, nullable = false)
    private String employeeId;

    @Column(name = "PAY_PERIOD", length = 20, nullable = false)
    private String payPeriod;

    @Column(name = "BASIC_SALARY", nullable = false)
    private Double basicSalary;

    @Column(name = "HRA", nullable = false)
    private Double hra;

    @Column(name = "ALLOWANCES", nullable = false)
    private Double allowances;

    @Column(name = "DEDUCTIONS", nullable = false)
    private Double deductions;

    @Column(name = "NET_PAY", nullable = false)
    private Double netPay;

    @Column(name = "PAYMENT_STATUS", length = 20, nullable = false)
    private String paymentStatus;

    @Column(name = "GENERATION_DATE", nullable = false)
    private LocalDate generationDate;

    @PrePersist
    @PreUpdate
    public void calculateNetPayAndSetDate() {
        double basic = this.basicSalary != null ? this.basicSalary : 0.0;
        double h = this.hra != null ? this.hra : 0.0;
        double allow = this.allowances != null ? this.allowances : 0.0;
        double deduct = this.deductions != null ? this.deductions : 0.0;
        this.netPay = basic + h + allow - deduct;
        
        if (this.generationDate == null) {
            this.generationDate = LocalDate.now();
        }
    }
}
