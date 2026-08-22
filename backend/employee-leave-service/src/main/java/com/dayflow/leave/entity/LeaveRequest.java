package com.dayflow.leave.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "LEAVE_REQUEST")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaveRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "LEAVE_ID")
    private Long leaveId;

    @Column(name = "EMPLOYEE_ID", nullable = false)
    private Long employeeId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "LEAVE_TYPE_ID", nullable = false)
    private LeaveType leaveType;

    @Column(name = "START_DATE", nullable = false)
    private LocalDate startDate;

    @Column(name = "END_DATE", nullable = false)
    private LocalDate endDate;

    @Column(name = "REMARKS", length = 500)
    private String remarks;

    @Column(name = "STATUS", length = 30)
    private String status; // PENDING, APPROVED, REJECTED, WITHDRAWN

    @Column(name = "APPLIED_AT")
    private LocalDateTime appliedAt;

    @PrePersist
    protected void onCreate() {
        if (appliedAt == null) {
            appliedAt = LocalDateTime.now();
        }
        if (status == null) {
            status = "PENDING";
        }
    }
}
