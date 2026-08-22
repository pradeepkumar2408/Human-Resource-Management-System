package com.dayflow.adminemployeeservice.dto;

import lombok.*;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeResponse {

    private String employeeId;
    private String firstName;
    private String lastName;
    private String email;
    private LocalDate dob;
    private String gender;
    private String phone;
    private LocalDate joiningDate;
    private boolean active;
    private boolean emailVerified;

    private AddressDto address;
    private DepartmentDto department;
    private DesignationDto designation;
    private ManagerDto manager;
    private RoleDto role;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AddressDto {
        private Long addressId;
        private String line1;
        private String line2;
        private String city;
        private String state;
        private String pinCode;
        private String country;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DepartmentDto {
        private Long id;
        private String name;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DesignationDto {
        private Long id;
        private String title;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ManagerDto {
        private String id;
        private String name;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RoleDto {
        private Long id;
        private String name;
    }
}
