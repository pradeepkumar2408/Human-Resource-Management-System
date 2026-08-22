package com.dayflow.adminemployeeservice.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeUpdateRequest {

    @NotBlank(message = "First name is required")
    @Size(max = 60)
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(max = 60)
    private String lastName;

    private LocalDate dob;

    @Pattern(regexp = "^[MFO]$", message = "Gender must be M, F, or O")
    private String gender;

    @Size(max = 15)
    private String phone;

    @Size(max = 150)
    private String line1;

    @Size(max = 150)
    private String line2;

    @Size(max = 60)
    private String city;

    @Size(max = 60)
    private String state;

    @Size(max = 10)
    private String pinCode;

    @Size(max = 60)
    private String country;

    private Long departmentId;

    private Long designationId;

    private String managerId;

    private LocalDate joiningDate;

    private Long roleId;
}
