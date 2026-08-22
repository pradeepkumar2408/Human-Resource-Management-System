package com.dayflow.employee.entity;

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
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "DEPARTMENT_ID")
    private Long departmentId;

    @Column(name = "DEPARTMENT_NAME", nullable = false, length = 100)
    private String departmentName;

    @Column(name = "LOCATION", length = 100)
    private String location;
}
