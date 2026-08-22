package com.hrms.attendance.service;

import com.hrms.attendance.dto.*;
import com.hrms.attendance.model.Attendance;
import com.hrms.attendance.model.AttendanceStatus;
import com.hrms.attendance.repository.AttendanceRepository;
import com.hrms.attendance.repository.AttendanceStatusRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final AttendanceStatusRepository attendanceStatusRepository;

    @Autowired
    public AttendanceService(AttendanceRepository attendanceRepository,
                             AttendanceStatusRepository attendanceStatusRepository) {
        this.attendanceRepository = attendanceRepository;
        this.attendanceStatusRepository = attendanceStatusRepository;
    }

    @Transactional
    public AttendanceDto checkIn(CheckInRequest request) {
        LocalDate today = LocalDate.now();
        
        // Check if already checked in today
        if (attendanceRepository.findByEmployeeIdAndWorkDate(request.getEmployeeId(), today).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Employee has already checked in for today.");
        }

        LocalDateTime now = LocalDateTime.now();
        String statusCode = "PRESENT";
        
        // Late check-in definition: after 09:15 AM
        if (now.toLocalTime().isAfter(LocalTime.of(9, 15))) {
            statusCode = "LATE";
        }

        AttendanceStatus status = attendanceStatusRepository.findById(statusCode)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Default status code not configured."));

        Attendance attendance = Attendance.builder()
                .employeeId(request.getEmployeeId())
                .departmentId(request.getDepartmentId())
                .workDate(today)
                .checkIn(now)
                .status(status)
                .build();

        Attendance saved = attendanceRepository.save(attendance);
        return mapToDto(saved);
    }

    @Transactional
    public AttendanceDto checkOut(CheckOutRequest request) {
        LocalDate today = LocalDate.now();
        
        Attendance attendance = attendanceRepository.findByEmployeeIdAndWorkDate(request.getEmployeeId(), today)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No check-in record found for today. Please check-in first."));

        if (attendance.getCheckOut() != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Employee has already checked out for today.");
        }

        LocalDateTime now = LocalDateTime.now();
        attendance.setCheckOut(now);

        // Half day calculation: if total hours worked is less than 4 hours
        if (attendance.getCheckIn() != null) {
            long minutesWorked = Duration.between(attendance.getCheckIn(), now).toMinutes();
            if (minutesWorked < 240) { // 4 hours = 240 minutes
                AttendanceStatus halfDayStatus = attendanceStatusRepository.findById("HALFDAY")
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Half-day status code not configured."));
                attendance.setStatus(halfDayStatus);
            }
        }

        Attendance saved = attendanceRepository.save(attendance);
        return mapToDto(saved);
    }

    @Transactional(readOnly = true)
    public List<AttendanceDto> getEmployeeHistory(String employeeId) {
        return attendanceRepository.findByEmployeeIdOrderByWorkDateDesc(employeeId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AttendanceDto> getDailyAttendance(LocalDate date, Long departmentId, String statusCode, String employeeId) {
        Specification<Attendance> spec = Specification.where(null);

        if (date != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("workDate"), date));
        }
        if (departmentId != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("departmentId"), departmentId));
        }
        if (statusCode != null && !statusCode.trim().isEmpty()) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("status").get("statusCode"), statusCode));
        }
        if (employeeId != null && !employeeId.trim().isEmpty()) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("employeeId"), employeeId));
        }

        return attendanceRepository.findAll(spec).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public AttendanceDto correctAttendance(Long id, AttendanceCorrectionRequest request) {
        Attendance attendance = attendanceRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Attendance record not found with ID: " + id));

        attendance.setCheckIn(request.getCheckIn());
        attendance.setCheckOut(request.getCheckOut());
        attendance.setAuditRemark(request.getAuditRemark());

        if (request.getStatusCode() != null && !request.getStatusCode().trim().isEmpty()) {
            AttendanceStatus status = attendanceStatusRepository.findById(request.getStatusCode())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid status code: " + request.getStatusCode()));
            attendance.setStatus(status);
        } else {
            // Auto-recalculate status if not explicitly overridden by admin
            if (request.getCheckIn() != null && request.getCheckOut() != null) {
                long minutesWorked = Duration.between(request.getCheckIn(), request.getCheckOut()).toMinutes();
                String statusCode = "PRESENT";
                if (minutesWorked < 240) {
                    statusCode = "HALFDAY";
                } else if (request.getCheckIn().toLocalTime().isAfter(LocalTime.of(9, 15))) {
                    statusCode = "LATE";
                }
                AttendanceStatus status = attendanceStatusRepository.findById(statusCode)
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Status code not found in configuration."));
                attendance.setStatus(status);
            }
        }

        Attendance saved = attendanceRepository.save(attendance);
        return mapToDto(saved);
    }

    @Transactional(readOnly = true)
    public AttendanceReportDto getReport(LocalDate date) {
        LocalDate targetDate = (date != null) ? date : LocalDate.now();

        List<Object[]> statusCounts = attendanceRepository.countStatusByWorkDate(targetDate);
        long total = attendanceRepository.countTotalByWorkDate(targetDate);

        long present = 0;
        long late = 0;
        long halfDay = 0;
        long absent = 0;

        for (Object[] row : statusCounts) {
            String status = (String) row[0];
            long count = (Long) row[1];

            switch (status) {
                case "PRESENT":
                    present = count;
                    break;
                case "LATE":
                    late = count;
                    break;
                case "HALFDAY":
                    halfDay = count;
                    break;
                case "ABSENT":
                    absent = count;
                    break;
            }
        }

        double percentage = 0.0;
        if (total > 0) {
            percentage = ((double) (present + late + halfDay) / total) * 100.0;
        }

        return AttendanceReportDto.builder()
                .reportDate(targetDate)
                .totalRecords(total)
                .presentCount(present)
                .lateCount(late)
                .halfDayCount(halfDay)
                .absentCount(absent)
                .attendancePercentage(Math.round(percentage * 100.0) / 100.0)
                .build();
    }

    private AttendanceDto mapToDto(Attendance attendance) {
        return AttendanceDto.builder()
                .id(attendance.getId())
                .employeeId(attendance.getEmployeeId())
                .departmentId(attendance.getDepartmentId())
                .workDate(attendance.getWorkDate())
                .checkIn(attendance.getCheckIn())
                .checkOut(attendance.getCheckOut())
                .statusCode(attendance.getStatus().getStatusCode())
                .statusDescription(attendance.getStatus().getDescription())
                .auditRemark(attendance.getAuditRemark())
                .createdAt(attendance.getCreatedAt())
                .updatedAt(attendance.getUpdatedAt())
                .build();
    }
}
