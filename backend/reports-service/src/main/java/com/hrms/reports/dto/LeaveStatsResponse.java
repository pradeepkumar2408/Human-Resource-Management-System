package com.hrms.reports.dto;

import lombok.*;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaveStatsResponse {
    private int totalLeaves;
    private int approvedCount;
    private int pendingCount;
    private int rejectedCount;
    private Map<String, Long> leaveTypeCounts;
    private List<LeaveRecord> leaveDetails;
}
