package com.dayflow.leaveservice.dto;

import com.dayflow.leaveservice.entity.LeaveRequest;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaveRequestResponse {

    private Long id;
    private Long employeeId;
    private LocalDate startDate;
    private LocalDate endDate;
    private String leaveTypeName;
    private String leaveStatusName;
    private String reason;
    private String adminComment;
    private LocalDateTime createdAt;

    public static LeaveRequestResponse fromEntity(LeaveRequest request) {
        if (request == null) {
            return null;
        }
        return LeaveRequestResponse.builder()
                .id(request.getId())
                .employeeId(request.getEmployeeId())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .leaveTypeName(request.getLeaveType() != null ? request.getLeaveType().getName() : null)
                .leaveStatusName(request.getLeaveStatus() != null ? request.getLeaveStatus().getName() : null)
                .reason(request.getReason())
                .adminComment(request.getAdminComment())
                .createdAt(request.getCreatedAt())
                .build();
    }
}
