package com.dayflow.payrollservice.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalaryStructureRequest {

    @NotNull(message = "Basic salary is required")
    @Min(value = 0, message = "Basic salary must be greater than or equal to 0")
    private Double basicSalary;

    @NotNull(message = "HRA is required")
    @Min(value = 0, message = "HRA must be greater than or equal to 0")
    private Double hra;

    @NotNull(message = "Allowances is required")
    @Min(value = 0, message = "Allowances must be greater than or equal to 0")
    private Double allowances;

    @NotNull(message = "Deductions is required")
    @Min(value = 0, message = "Deductions must be greater than or equal to 0")
    private Double deductions;
}
