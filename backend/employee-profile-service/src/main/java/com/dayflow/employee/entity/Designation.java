package com.dayflow.employee.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "DESIGNATION")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Designation {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "DESIGNATION_ID")
    private Long designationId;

    @Column(name = "TITLE", nullable = false, length = 100)
    private String title;

    @Column(name = "JOB_GRADE", length = 20)
    private String jobGrade;
}
