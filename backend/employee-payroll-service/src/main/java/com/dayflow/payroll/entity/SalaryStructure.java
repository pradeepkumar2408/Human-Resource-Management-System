package com.dayflow.payroll.entity;

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
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "STRUCTURE_ID")
    private Long structureId;

    @Column(name = "EMPLOYEE_ID", nullable = false, unique = true)
    private Long employeeId;

    @Column(name = "BASE_PAY")
    private Double basePay;

    @Column(name = "HRA")
    private Double hra;

    @Column(name = "SPECIAL_ALLOWANCE")
    private Double specialAllowance;

    @Column(name = "PF_DEDUCTION")
    private Double pfDeduction;

    @Column(name = "TAX_DEDUCTION")
    private Double taxDeduction;
}
