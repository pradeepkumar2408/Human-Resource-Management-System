package com.hrms.attendance.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "ATTENDANCE_STATUS")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceStatus {

    @Id
    @Column(name = "STATUS_CODE", length = 20)
    private String statusCode;

    @Column(name = "DESCRIPTION", nullable = false, length = 100)
    private String description;
}
