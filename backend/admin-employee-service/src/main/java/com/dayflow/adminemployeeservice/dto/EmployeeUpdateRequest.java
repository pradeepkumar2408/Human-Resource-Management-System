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

    @NotBlank(message = "Address Line 1 is required")
    @Size(max = 150)
    private String line1;

    @Size(max = 150)
    private String line2;

    @NotBlank(message = "City is required")
    @Size(max = 60)
    private String city;

    @NotBlank(message = "State is required")
    @Size(max = 60)
    private String state;

    @NotBlank(message = "Pin code is required")
    @Size(max = 10)
    private String pinCode;

    @NotBlank(message = "Country is required")
    @Size(max = 60)
    private String country;

    private Long departmentId;

    private Long designationId;

    private Long managerId;

    @NotNull(message = "Joining date is required")
    private LocalDate joiningDate;

    @NotNull(message = "Role ID is required")
    private Long roleId;
}
