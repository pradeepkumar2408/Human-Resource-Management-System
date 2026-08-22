package com.dayflow.payrollservice.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "SALARY_STRUCTURE")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalaryStructure {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "salary_structure_gen")
    @SequenceGenerator(name = "salary_structure_gen", sequenceName = "SALARY_STRUCTURE_SEQ", allocationSize = 1)
    private Long id;

    @Column(name = "EMPLOYEE_ID", length = 50, unique = true, nullable = false)
    private String employeeId;

    @Column(name = "BASIC_SALARY", nullable = false)
    private Double basicSalary;

    @Column(name = "HRA", nullable = false)
    private Double hra;

    @Column(name = "ALLOWANCES", nullable = false)
    private Double allowances;

    @Column(name = "DEDUCTIONS", nullable = false)
    private Double deductions;

    @Column(name = "NET_SALARY", nullable = false)
    private Double netSalary;

    @PrePersist
    @PreUpdate
    public void calculateNetSalary() {
        double basic = this.basicSalary != null ? this.basicSalary : 0.0;
        double h = this.hra != null ? this.hra : 0.0;
        double allow = this.allowances != null ? this.allowances : 0.0;
        double deduct = this.deductions != null ? this.deductions : 0.0;
        this.netSalary = basic + h + allow - deduct;
    }
}
