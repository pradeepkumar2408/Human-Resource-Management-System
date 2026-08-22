package com.dayflow.adminemployeeservice.entity;

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
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "desig_seq_gen")
    @SequenceGenerator(name = "desig_seq_gen", sequenceName = "DESIGNATION_SEQ", allocationSize = 1)
    @Column(name = "DESIGNATION_ID")
    private Long id;

    @Column(name = "TITLE", unique = true, nullable = false, length = 100)
    private String title;
}
