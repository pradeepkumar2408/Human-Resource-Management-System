package com.hrms.reports.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeDto {
    private String employeeId;
    private String firstName;
    private String lastName;
    private String email;
    private boolean active;
    private DepartmentDto department;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DepartmentDto {
        private Long id;
        private String name;
    }
}
