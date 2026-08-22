package com.hrms.attendance.controller;

import com.hrms.attendance.dto.AttendanceDto;
import com.hrms.attendance.dto.CheckInRequest;
import com.hrms.attendance.dto.CheckOutRequest;
import com.hrms.attendance.service.AttendanceService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin("*")
public class EmployeeAttendanceController {

    private final AttendanceService attendanceService;

    @Autowired
    public EmployeeAttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @PostMapping("/check-in")
    public ResponseEntity<AttendanceDto> checkIn(@Valid @RequestBody CheckInRequest request) {
        AttendanceDto dto = attendanceService.checkIn(request);
        return ResponseEntity.ok(dto);
    }

    @PostMapping("/check-out")
    public ResponseEntity<AttendanceDto> checkOut(@Valid @RequestBody CheckOutRequest request) {
        AttendanceDto dto = attendanceService.checkOut(request);
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/me")
    public ResponseEntity<List<AttendanceDto>> getMyAttendance(@RequestParam("employeeId") String employeeId) {
        List<AttendanceDto> history = attendanceService.getEmployeeHistory(employeeId);
        return ResponseEntity.ok(history);
    }
}
