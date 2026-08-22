package com.dayflow.adminemployeeservice.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "ADDRESS")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Address {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "addr_seq_gen")
    @SequenceGenerator(name = "addr_seq_gen", sequenceName = "ADDRESS_SEQ", allocationSize = 1)
    @Column(name = "ADDRESS_ID")
    private Long id;

    @Column(name = "LINE1", nullable = false, length = 150)
    private String line1;

    @Column(name = "LINE2", length = 150)
    private String line2;

    @Column(name = "CITY", nullable = false, length = 60)
    private String city;

    @Column(name = "STATE", nullable = false, length = 60)
    private String state;

    @Column(name = "PIN_CODE", nullable = false, length = 10)
    private String pinCode;

    @Column(name = "COUNTRY", nullable = false, length = 60)
    private String country;
}
