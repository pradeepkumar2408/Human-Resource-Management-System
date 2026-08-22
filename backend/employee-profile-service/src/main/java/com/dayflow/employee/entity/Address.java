package com.dayflow.employee.entity;

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
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "ADDRESS_ID")
    private Long addressId;

    @Column(name = "STREET", length = 200)
    private String street;

    @Column(name = "CITY", length = 100)
    private String city;

    @Column(name = "STATE", length = 100)
    private String state;

    @Column(name = "COUNTRY", length = 100)
    private String country;

    @Column(name = "POSTAL_CODE", length = 20)
    private String postalCode;
}
