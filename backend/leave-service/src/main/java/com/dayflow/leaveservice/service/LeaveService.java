package com.dayflow.leaveservice.service;

import com.dayflow.leaveservice.dto.ApplyLeaveRequest;
import com.dayflow.leaveservice.dto.LeaveRequestResponse;
import java.time.LocalDate;
import java.util.List;

public interface LeaveService {
    LeaveRequestResponse applyLeave(ApplyLeaveRequest request);
    List<LeaveRequestResponse> getLeavesByEmployeeId(Long employeeId);
    List<LeaveRequestResponse> getAllLeaves(Long employeeId, String status, String type, LocalDate startDate, LocalDate endDate);
    LeaveRequestResponse approveLeave(Long id, String comment);
    LeaveRequestResponse rejectLeave(Long id, String comment);
}
