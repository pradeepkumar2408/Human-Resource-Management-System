package com.dayflow.payrollservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BulkGenerateRequest {

    @NotBlank(message = "Pay period is required")
    @Pattern(regexp = "^\\d{4}-\\d{2}$", message = "Pay period must be in YYYY-MM format")
    private String payPeriod;
}
