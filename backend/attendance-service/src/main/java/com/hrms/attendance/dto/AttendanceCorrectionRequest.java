package com.hrms.attendance.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceCorrectionRequest {

    @NotNull(message = "Check-in time is required")
    private LocalDateTime checkIn;

    private LocalDateTime checkOut;

    @NotBlank(message = "Audit remark is mandatory for manual correction")
    @Size(max = 500, message = "Audit remark must be under 500 characters")
    private String auditRemark;

    private String statusCode; // Optional: can be updated manually by admin as well
}
