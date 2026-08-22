package com.dayflow.adminemployeeservice.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "EMPLOYEE")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "emp_seq_gen")
    @SequenceGenerator(name = "emp_seq_gen", sequenceName = "EMPLOYEE_SEQ", allocationSize = 1)
    @Column(name = "EMPLOYEE_ID")
    private Long id;

    @Column(name = "FIRST_NAME", nullable = false, length = 60)
    private String firstName;

    @Column(name = "LAST_NAME", nullable = false, length = 60)
    private String lastName;

    @Column(name = "DOB")
    private LocalDate dob;

    @Column(name = "GENDER", length = 1)
    private String gender; // 'M', 'F', 'O'

    @Column(name = "PHONE", length = 15)
    private String phone;

    @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @JoinColumn(name = "ADDRESS_ID")
    private Address address;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "DEPARTMENT_ID")
    private Department department;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "DESIGNATION_ID")
    private Designation designation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MANAGER_ID")
    private Employee manager;

    @Column(name = "JOINING_DATE", nullable = false)
    private LocalDate joiningDate;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PROFILE_PIC_FILE_ID")
    private Document profilePic;
}
