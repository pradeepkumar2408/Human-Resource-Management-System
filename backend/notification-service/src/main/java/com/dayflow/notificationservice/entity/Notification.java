package com.dayflow.notificationservice.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.type.YesNoConverter;
import java.time.LocalDateTime;

@Entity
@Table(name = "NOTIFICATION")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "notif_seq_gen")
    @SequenceGenerator(name = "notif_seq_gen", sequenceName = "NOTIFICATION_SEQ", allocationSize = 1)
    @Column(name = "NOTIFICATION_ID")
    private Long id;

    @Column(name = "EMPLOYEE_ID", nullable = false, length = 50)
    private String employeeId;

    @Column(name = "TITLE", nullable = false, length = 100)
    private String title;

    @Column(name = "MESSAGE", nullable = false, length = 100)
    private String message;

    @Column(name = "TYPE", nullable = false, length = 50)
    private String type; // e.g., INFO, LEAVE, ATTENDANCE, ONBOARDING

    @Column(name = "IS_READ", nullable = false, length = 1)
    @Convert(converter = YesNoConverter.class)
    @Builder.Default
    private boolean isRead = false;

    @Column(name = "CREATED_AT", nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
