package com.hrms.reports.service;

import com.hrms.reports.dto.*;
import java.util.List;

public interface ReportsService {
    List<AttendanceRecord> getAttendanceReport(String from, String to);
    LeaveStatsResponse getLeaveReport(String from, String to);
    List<SalarySlipRecord> getSalarySlipsReport(String month, String year);
    AnalyticsResponse getAnalyticsReport();
}
