package com.dayflow.payrollservice.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BulkGenerateResponse {
    private String payPeriod;
    private int processedCount;
    private int createdCount;
    private int skippedCount;
    private String message;
}
