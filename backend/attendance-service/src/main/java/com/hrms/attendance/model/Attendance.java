package com.hrms.attendance.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "ATTENDANCE")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "attendance_seq_gen")
    @SequenceGenerator(name = "attendance_seq_gen", sequenceName = "ATTENDANCE_SEQ", allocationSize = 1)
    @Column(name = "ATTENDANCE_ID")
    private Long id;

    @Column(name = "EMPLOYEE_ID", nullable = false)
    private String employeeId;

    @Column(name = "DEPARTMENT_ID")
    private Long departmentId;

    @Column(name = "WORK_DATE", nullable = false)
    private LocalDate workDate;

    @Column(name = "CHECK_IN")
    private LocalDateTime checkIn;

    @Column(name = "CHECK_OUT")
    private LocalDateTime checkOut;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "STATUS_CODE", nullable = false)
    private AttendanceStatus status;

    @Column(name = "AUDIT_REMARK", length = 500)
    private String auditRemark;

    @CreationTimestamp
    @Column(name = "CREATED_AT", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "UPDATED_AT", nullable = false)
    private LocalDateTime updatedAt;
}
