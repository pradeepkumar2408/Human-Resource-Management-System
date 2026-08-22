package com.hrms.attendance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceReportDto {
    private LocalDate reportDate;
    private long totalRecords;
    private long presentCount;
    private long lateCount;
    private long halfDayCount;
    private long absentCount;
    private double attendancePercentage;
}
