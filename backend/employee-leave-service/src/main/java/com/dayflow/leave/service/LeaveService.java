package com.dayflow.leave.service;

import com.dayflow.leave.entity.LeaveRequest;
import com.dayflow.leave.entity.LeaveType;
import com.dayflow.leave.repository.LeaveRequestRepository;
import com.dayflow.leave.repository.LeaveTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Service
public class LeaveService {

    private final LeaveRequestRepository leaveRequestRepository;
    private final LeaveTypeRepository leaveTypeRepository;

    @Autowired
    public LeaveService(LeaveRequestRepository leaveRequestRepository, LeaveTypeRepository leaveTypeRepository) {
        this.leaveRequestRepository = leaveRequestRepository;
        this.leaveTypeRepository = leaveTypeRepository;
    }

    public LeaveRequest applyLeave(Long employeeId, String typeName, LocalDate startDate, LocalDate endDate, String remarks) {
        String targetType = typeName != null ? typeName.toUpperCase() : "CASUAL_LEAVE";
        LeaveType leaveType = leaveTypeRepository.findByTypeNameIgnoreCase(targetType)
                .orElseGet(() -> leaveTypeRepository.save(LeaveType.builder().typeName(targetType).maxDays(12).build()));

        LeaveRequest request = LeaveRequest.builder()
                .employeeId(employeeId)
                .leaveType(leaveType)
                .startDate(startDate != null ? startDate : LocalDate.now().plusDays(1))
                .endDate(endDate != null ? endDate : LocalDate.now().plusDays(2))
                .remarks(remarks != null ? remarks : "Leave Application")
                .status("PENDING")
                .build();

        return leaveRequestRepository.save(request);
    }

    public List<LeaveRequest> getOwnLeaveRequests(Long employeeId) {
        return leaveRequestRepository.findByEmployeeIdOrderByAppliedAtDesc(employeeId);
    }

    public List<LeaveType> getLeaveTypes() {
        List<LeaveType> types = leaveTypeRepository.findAll();
        if (types.isEmpty()) {
            types = List.of(
                leaveTypeRepository.save(LeaveType.builder().typeName("CASUAL_LEAVE").maxDays(12).build()),
                leaveTypeRepository.save(LeaveType.builder().typeName("SICK_LEAVE").maxDays(10).build()),
                leaveTypeRepository.save(LeaveType.builder().typeName("ANNUAL_LEAVE").maxDays(15).build())
            );
        }
        return types;
    }

    public Map<String, Object> withdrawLeaveRequest(Long leaveId) {
        LeaveRequest request = leaveRequestRepository.findById(leaveId)
                .orElseThrow(() -> new IllegalArgumentException("Leave request #" + leaveId + " not found."));

        if ("APPROVED".equalsIgnoreCase(request.getStatus())) {
            throw new IllegalStateException("Approved leave request cannot be withdrawn.");
        }

        request.setStatus("WITHDRAWN");
        leaveRequestRepository.save(request);

        return Map.of("success", true, "message", "Leave request #" + leaveId + " withdrawn successfully.");
    }
}
