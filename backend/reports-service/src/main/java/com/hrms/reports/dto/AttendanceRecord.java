package com.hrms.reports.dto;

import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceRecord {
    private Long attendanceId;
    private Long employeeId;
    private Long departmentId;
    private LocalDate workDate;
    private LocalDateTime checkIn;
    private LocalDateTime checkOut;
    private String statusCode;
    private String auditRemark;
}
