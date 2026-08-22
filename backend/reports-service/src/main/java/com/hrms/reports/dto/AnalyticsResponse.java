package com.hrms.reports.dto;

import lombok.*;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnalyticsResponse {
    private Map<String, Long> departmentHeadcounts;
    private Map<String, Long> leaveDistributions;
}
