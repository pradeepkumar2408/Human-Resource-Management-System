package com.hrms.reports.service;

import com.hrms.reports.dto.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class ReportsServiceImpl implements ReportsService {

    private static final Logger log = LoggerFactory.getLogger(ReportsServiceImpl.class);

    private final RestTemplate restTemplate;

    @Value("${services.employee.url}")
    private String employeeServiceUrl;

    @Value("${services.attendance.url}")
    private String attendanceServiceUrl;

    @Value("${services.leave.url}")
    private String leaveServiceUrl;

    @Value("${services.payroll.url}")
    private String payrollServiceUrl;

    @Autowired
    public ReportsServiceImpl(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @Override
    public List<AttendanceRecord> getAttendanceReport(String from, String to) {
        String url = UriComponentsBuilder.fromHttpUrl(attendanceServiceUrl)
                .path("/api/attendance")
                .queryParam("from", from)
                .queryParam("to", to)
                .toUriString();

        log.info("Fetching attendance report from: {}", url);
        try {
            ResponseEntity<List<AttendanceRecord>> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<List<AttendanceRecord>>() {}
            );
            return response.getBody() != null ? response.getBody() : Collections.emptyList();
        } catch (Exception e) {
            log.error("Error calling attendance-service: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    @Override
    public LeaveStatsResponse getLeaveReport(String from, String to) {
        String url = UriComponentsBuilder.fromHttpUrl(leaveServiceUrl)
                .path("/api/leaves")
                .queryParam("from", from)
                .queryParam("to", to)
                .toUriString();

        log.info("Fetching leave report from: {}", url);
        try {
            ResponseEntity<List<LeaveRecord>> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<List<LeaveRecord>>() {}
            );
            List<LeaveRecord> leaves = response.getBody() != null ? response.getBody() : Collections.emptyList();
            return aggregateLeaveStats(leaves);
        } catch (Exception e) {
            log.error("Error calling leave-service: {}", e.getMessage());
            return LeaveStatsResponse.builder()
                    .totalLeaves(0)
                    .approvedCount(0)
                    .pendingCount(0)
                    .rejectedCount(0)
                    .leaveTypeCounts(Collections.emptyMap())
                    .leaveDetails(Collections.emptyList())
                    .build();
        }
    }

    @Override
    public List<SalarySlipRecord> getSalarySlipsReport(String month, String year) {
        // Construct the URL to call payroll-service. Supporting both payroll and payroll/salary-slips formats
        String url = UriComponentsBuilder.fromHttpUrl(payrollServiceUrl)
                .path("/api/payroll/salary-slips")
                .queryParam("month", month)
                .queryParam("year", year)
                .toUriString();

        log.info("Fetching salary slips report from: {}", url);
        try {
            ResponseEntity<List<SalarySlipRecord>> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<List<SalarySlipRecord>>() {}
            );
            return response.getBody() != null ? response.getBody() : Collections.emptyList();
        } catch (Exception e) {
            log.error("Error calling payroll-service: {}", e.getMessage());
            // Attempt fallback path /api/payroll
            try {
                String fallbackUrl = UriComponentsBuilder.fromHttpUrl(payrollServiceUrl)
                        .path("/api/payroll")
                        .queryParam("month", month)
                        .queryParam("year", year)
                        .toUriString();
                log.info("Attempting fallback payroll URL: {}", fallbackUrl);
                ResponseEntity<List<SalarySlipRecord>> response = restTemplate.exchange(
                        fallbackUrl,
                        HttpMethod.GET,
                        null,
                        new ParameterizedTypeReference<List<SalarySlipRecord>>() {}
                );
                return response.getBody() != null ? response.getBody() : Collections.emptyList();
            } catch (Exception ex) {
                log.error("Error calling fallback payroll endpoint: {}", ex.getMessage());
                return Collections.emptyList();
            }
        }
    }

    @Override
    public AnalyticsResponse getAnalyticsReport() {
        log.info("Aggregating analytics report");

        // 1. Fetch department headcounts from employee-service (port 8099)
        Map<String, Long> departmentHeadcounts = new HashMap<>();
        try {
            // employee-service returns paged response on /api/admin/employees
            String url = UriComponentsBuilder.fromHttpUrl(employeeServiceUrl)
                    .path("/api/admin/employees")
                    .queryParam("size", 1000) // Large page size to fetch all employees
                    .toUriString();

            log.info("Fetching employees from employee-service: {}", url);
            ResponseEntity<EmployeePageResponse> response = restTemplate.getForEntity(url, EmployeePageResponse.class);
            EmployeePageResponse pageResponse = response.getBody();
            List<EmployeeDto> employees = pageResponse != null && pageResponse.getContent() != null 
                    ? pageResponse.getContent() : Collections.emptyList();

            // Fallback check if it was not paged or is a list instead
            if (employees.isEmpty()) {
                try {
                    String fallbackUrl = UriComponentsBuilder.fromHttpUrl(employeeServiceUrl)
                            .path("/api/employees")
                            .toUriString();
                    log.info("Attempting list fallback for employees: {}", fallbackUrl);
                    ResponseEntity<List<EmployeeDto>> listResponse = restTemplate.exchange(
                            fallbackUrl,
                            HttpMethod.GET,
                            null,
                            new ParameterizedTypeReference<List<EmployeeDto>>() {}
                    );
                    employees = listResponse.getBody() != null ? listResponse.getBody() : Collections.emptyList();
                } catch (Exception ex) {
                    log.error("Employee list fallback failed: {}", ex.getMessage());
                }
            }

            // Group by department name for active employees
            departmentHeadcounts = employees.stream()
                    .filter(Objects::nonNull)
                    .filter(EmployeeDto::isActive)
                    .map(EmployeeDto::getDepartment)
                    .filter(Objects::nonNull)
                    .map(EmployeeDto.DepartmentDto::getName)
                    .filter(Objects::nonNull)
                    .collect(Collectors.groupingBy(Function.identity(), Collectors.counting()));

        } catch (Exception e) {
            log.error("Error aggregating employee headcounts: {}", e.getMessage());
        }

        // 2. Fetch leave distributions from leave-service (port 8084)
        Map<String, Long> leaveDistributions = new HashMap<>();
        try {
            String url = UriComponentsBuilder.fromHttpUrl(leaveServiceUrl)
                    .path("/api/leaves")
                    .toUriString();

            log.info("Fetching leaves for analytics from leave-service: {}", url);
            ResponseEntity<List<LeaveRecord>> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<List<LeaveRecord>>() {}
            );
            List<LeaveRecord> leaves = response.getBody() != null ? response.getBody() : Collections.emptyList();

            // Group by leave type name
            leaveDistributions = leaves.stream()
                    .filter(Objects::nonNull)
                    .map(LeaveRecord::getLeaveType)
                    .filter(Objects::nonNull)
                    .map(LeaveType::getName)
                    .filter(Objects::nonNull)
                    .collect(Collectors.groupingBy(Function.identity(), Collectors.counting()));

        } catch (Exception e) {
            log.error("Error aggregating leave distributions: {}", e.getMessage());
        }

        return AnalyticsResponse.builder()
                .departmentHeadcounts(departmentHeadcounts)
                .leaveDistributions(leaveDistributions)
                .build();
    }

    private LeaveStatsResponse aggregateLeaveStats(List<LeaveRecord> leaves) {
        int totalLeaves = leaves.size();
        int approvedCount = 0;
        int pendingCount = 0;
        int rejectedCount = 0;
        Map<String, Long> leaveTypeCounts = new HashMap<>();

        for (LeaveRecord leave : leaves) {
            if (leave == null) continue;

            // Status aggregation
            if (leave.getLeaveStatus() != null && leave.getLeaveStatus().getName() != null) {
                String statusName = leave.getLeaveStatus().getName().toUpperCase();
                if (statusName.contains("APPROVED")) {
                    approvedCount++;
                } else if (statusName.contains("PENDING")) {
                    pendingCount++;
                } else if (statusName.contains("REJECTED")) {
                    rejectedCount++;
                }
            }

            // Type aggregation
            if (leave.getLeaveType() != null && leave.getLeaveType().getName() != null) {
                String typeName = leave.getLeaveType().getName().toUpperCase();
                leaveTypeCounts.put(typeName, leaveTypeCounts.getOrDefault(typeName, 0L) + 1);
            }
        }

        return LeaveStatsResponse.builder()
                .totalLeaves(totalLeaves)
                .approvedCount(approvedCount)
                .pendingCount(pendingCount)
                .rejectedCount(rejectedCount)
                .leaveTypeCounts(leaveTypeCounts)
                .leaveDetails(leaves)
                .build();
    }
}
