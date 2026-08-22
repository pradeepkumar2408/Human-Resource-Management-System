package com.dayflow.adminemployeeservice.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "DEPARTMENT")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Department {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "dept_seq_gen")
    @SequenceGenerator(name = "dept_seq_gen", sequenceName = "DEPARTMENT_SEQ", allocationSize = 1)
    @Column(name = "DEPARTMENT_ID")
    private Long id;

    @Column(name = "DEPT_NAME", unique = true, nullable = false, length = 100)
    private String deptName;
}
