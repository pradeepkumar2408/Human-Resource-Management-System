package com.hrms.reports.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaveType {
    private Long id;
    private String name;
    private String description;
}
