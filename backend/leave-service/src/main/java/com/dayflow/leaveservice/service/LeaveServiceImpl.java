package com.dayflow.leaveservice.service;

import com.dayflow.leaveservice.dto.ApplyLeaveRequest;
import com.dayflow.leaveservice.dto.LeaveRequestResponse;
import com.dayflow.leaveservice.entity.LeaveRequest;
import com.dayflow.leaveservice.entity.LeaveStatus;
import com.dayflow.leaveservice.entity.LeaveType;
import com.dayflow.leaveservice.exception.ResourceNotFoundException;
import com.dayflow.leaveservice.repository.LeaveRequestRepository;
import com.dayflow.leaveservice.repository.LeaveStatusRepository;
import com.dayflow.leaveservice.repository.LeaveTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class LeaveServiceImpl implements LeaveService {

    private final LeaveRequestRepository leaveRequestRepository;
    private final LeaveTypeRepository leaveTypeRepository;
    private final LeaveStatusRepository leaveStatusRepository;

    @Autowired
    public LeaveServiceImpl(LeaveRequestRepository leaveRequestRepository,
                            LeaveTypeRepository leaveTypeRepository,
                            LeaveStatusRepository leaveStatusRepository) {
        this.leaveRequestRepository = leaveRequestRepository;
        this.leaveTypeRepository = leaveTypeRepository;
        this.leaveStatusRepository = leaveStatusRepository;
    }

    @Override
    public LeaveRequestResponse applyLeave(ApplyLeaveRequest request) {
        if (request.getStartDate().isAfter(request.getEndDate())) {
            throw new IllegalArgumentException("Start date cannot be after end date");
        }

        LeaveType leaveType = leaveTypeRepository.findByNameIgnoreCase(request.getLeaveTypeName())
                .orElseThrow(() -> new ResourceNotFoundException("Leave type '" + request.getLeaveTypeName() + "' not found"));

        LeaveStatus pendingStatus = leaveStatusRepository.findByNameIgnoreCase("PENDING")
                .orElseThrow(() -> new ResourceNotFoundException("Leave status 'PENDING' not configured in system"));

        LeaveRequest leaveRequest = LeaveRequest.builder()
                .employeeId(request.getEmployeeId())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .leaveType(leaveType)
                .leaveStatus(pendingStatus)
                .reason(request.getReason())
                .build();

        LeaveRequest savedRequest = leaveRequestRepository.save(leaveRequest);
        return LeaveRequestResponse.fromEntity(savedRequest);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LeaveRequestResponse> getLeavesByEmployeeId(Long employeeId) {
        return leaveRequestRepository.findByEmployeeIdOrderByCreatedAtDesc(employeeId)
                .stream()
                .map(LeaveRequestResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<LeaveRequestResponse> getAllLeaves(Long employeeId, String status, String type, LocalDate startDate, LocalDate endDate) {
        Specification<LeaveRequest> spec = Specification.where(null);

        if (employeeId != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("employeeId"), employeeId));
        }

        if (status != null && !status.trim().isEmpty()) {
            spec = spec.and((root, query, cb) -> cb.equal(cb.lower(root.join("leaveStatus").get("name")), status.trim().toLowerCase()));
        }

        if (type != null && !type.trim().isEmpty()) {
            spec = spec.and((root, query, cb) -> cb.equal(cb.lower(root.join("leaveType").get("name")), type.trim().toLowerCase()));
        }

        if (startDate != null) {
            spec = spec.and((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("startDate"), startDate));
        }

        if (endDate != null) {
            spec = spec.and((root, query, cb) -> cb.lessThanOrEqualTo(root.get("endDate"), endDate));
        }

        Sort sort = Sort.by(Sort.Direction.DESC, "createdAt");

        return leaveRequestRepository.findAll(spec, sort)
                .stream()
                .map(LeaveRequestResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public LeaveRequestResponse approveLeave(Long id, String comment) {
        LeaveRequest leaveRequest = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request with ID " + id + " not found"));

        LeaveStatus approvedStatus = leaveStatusRepository.findByNameIgnoreCase("APPROVED")
                .orElseThrow(() -> new ResourceNotFoundException("Leave status 'APPROVED' not configured in system"));

        leaveRequest.setLeaveStatus(approvedStatus);
        if (comment != null && !comment.trim().isEmpty()) {
            leaveRequest.setAdminComment(comment.trim());
        }

        LeaveRequest updatedRequest = leaveRequestRepository.save(leaveRequest);
        return LeaveRequestResponse.fromEntity(updatedRequest);
    }

    @Override
    public LeaveRequestResponse rejectLeave(Long id, String comment) {
        if (comment == null || comment.trim().isEmpty()) {
            throw new IllegalArgumentException("Rejection comment is mandatory");
        }

        LeaveRequest leaveRequest = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request with ID " + id + " not found"));

        LeaveStatus rejectedStatus = leaveStatusRepository.findByNameIgnoreCase("REJECTED")
                .orElseThrow(() -> new ResourceNotFoundException("Leave status 'REJECTED' not configured in system"));

        leaveRequest.setLeaveStatus(rejectedStatus);
        leaveRequest.setAdminComment(comment.trim());

        LeaveRequest updatedRequest = leaveRequestRepository.save(leaveRequest);
        return LeaveRequestResponse.fromEntity(updatedRequest);
    }
}
