package com.dayflow.adminemployeeservice.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.type.YesNoConverter;
import java.time.LocalDateTime;

@Entity
@Table(name = "APP_USER")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppUser {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "user_seq_gen")
    @SequenceGenerator(name = "user_seq_gen", sequenceName = "APP_USER_SEQ", allocationSize = 1)
    @Column(name = "USER_ID")
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "EMPLOYEE_ID", unique = true, nullable = false)
    private Employee employee;

    @Column(name = "EMAIL", unique = true, nullable = false, length = 150)
    private String email;

    @Column(name = "PASSWORD_HASH", nullable = false, length = 255)
    private String passwordHash;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "ROLE_ID", nullable = false)
    private Role role;

    @Column(name = "IS_EMAIL_VERIFIED", nullable = false, length = 1)
    @Convert(converter = YesNoConverter.class)
    @Builder.Default
    private boolean isEmailVerified = false;

    @Column(name = "IS_ACTIVE", nullable = false, length = 1)
    @Convert(converter = YesNoConverter.class)
    @Builder.Default
    private boolean isActive = true;

    @Column(name = "INVITE_TOKEN", length = 100)
    private String inviteToken;

    @Column(name = "TOKEN_EXPIRY")
    private LocalDateTime tokenExpiry;

    @Column(name = "CREATED_AT", nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
