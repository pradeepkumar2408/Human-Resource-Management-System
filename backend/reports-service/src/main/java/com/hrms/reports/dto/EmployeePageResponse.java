package com.hrms.reports.dto;

import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeePageResponse {
    private List<EmployeeDto> content;
    private int number;
    private int size;
    private long totalElements;
    private int totalPages;
}
