package com.dayflow.adminemployeeservice.service;

import com.dayflow.adminemployeeservice.dto.*;
import com.dayflow.adminemployeeservice.entity.*;
import com.dayflow.adminemployeeservice.exception.*;
import com.dayflow.adminemployeeservice.repository.*;
import com.dayflow.adminemployeeservice.util.PasswordUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final AddressRepository addressRepository;
    private final AppUserRepository appUserRepository;
    private final DepartmentRepository departmentRepository;
    private final DesignationRepository designationRepository;
    private final RoleRepository roleRepository;
    private final JavaMailSender mailSender;

    @Autowired
    public EmployeeServiceImpl(
            EmployeeRepository employeeRepository,
            AddressRepository addressRepository,
            AppUserRepository appUserRepository,
            DepartmentRepository departmentRepository,
            DesignationRepository designationRepository,
            RoleRepository roleRepository,
            JavaMailSender mailSender) {
        this.employeeRepository = employeeRepository;
        this.addressRepository = addressRepository;
        this.appUserRepository = appUserRepository;
        this.departmentRepository = departmentRepository;
        this.designationRepository = designationRepository;
        this.roleRepository = roleRepository;
        this.mailSender = mailSender;
    }

    @Override
    @Transactional
    public EmployeeResponse onboardEmployee(EmployeeOnboardRequest request) {
        // 1. Check if email already exists
        if (appUserRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new EmailAlreadyExistsException("Email '" + request.getEmail() + "' is already in use");
        }

        // 2. Fetch Department, Designation, Role, and Manager if specified
        Department department = null;
        if (request.getDepartmentId() != null) {
            department = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + request.getDepartmentId()));
        }

        Designation designation = null;
        if (request.getDesignationId() != null) {
            designation = designationRepository.findById(request.getDesignationId())
                    .orElseThrow(() -> new ResourceNotFoundException("Designation not found with ID: " + request.getDesignationId()));
        }

        Role role = roleRepository.findById(request.getRoleId())
                .orElseThrow(() -> new ResourceNotFoundException("Role not found with ID: " + request.getRoleId()));

        Employee manager = null;
        if (request.getManagerId() != null) {
            manager = employeeRepository.findById(request.getManagerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Manager not found with ID: " + request.getManagerId()));
        }

        // 3. Create and Save Address
        Address address = Address.builder()
                .line1(request.getLine1())
                .line2(request.getLine2())
                .city(request.getCity())
                .state(request.getState())
                .pinCode(request.getPinCode())
                .country(request.getCountry())
                .build();
        address = addressRepository.save(address);

        // 4. Create and Save Employee
        Employee employee = Employee.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .dob(request.getDob())
                .gender(request.getGender())
                .phone(request.getPhone())
                .address(address)
                .department(department)
                .designation(designation)
                .manager(manager)
                .joiningDate(request.getJoiningDate())
                .build();
        employee = employeeRepository.save(employee);

        // 5. Create and Save AppUser
        String token = UUID.randomUUID().toString();
        LocalDateTime expiry = LocalDateTime.now().plusHours(24);

        AppUser appUser = AppUser.builder()
                .employee(employee)
                .email(request.getEmail())
                .passwordHash(PasswordUtils.hashPassword(UUID.randomUUID().toString())) // Secure placeholder hash
                .role(role)
                .isEmailVerified(false)
                .isActive(false) // Account is inactive until password is set
                .inviteToken(token)
                .tokenExpiry(expiry)
                .build();
        appUser = appUserRepository.save(appUser);

        // 6. Send Invitation Email
        try {
            SimpleMailMessage mailMessage = new SimpleMailMessage();
            mailMessage.setFrom("alonewarrior123456@gmail.com");
            mailMessage.setTo(appUser.getEmail());
            mailMessage.setSubject("Invitation to Join Dayflow HRMS");
            mailMessage.setText("Hello " + employee.getFirstName() + ",\n\n"
                    + "You have been onboarded to Dayflow HRMS by Admin Karthi.\n"
                    + "Please click the following link to set your password and activate your account:\n\n"
                    + "http://localhost:8086/api/admin/employees/set-password?token=" + token + "\n\n"
                    + "This invitation link will expire in 24 hours.\n\n"
                    + "Best regards,\nDayflow Admin Team");
            mailSender.send(mailMessage);
            System.out.println("Email sent successfully to: " + appUser.getEmail());
        } catch (Exception e) {
            System.err.println("Failed to send invite email to " + appUser.getEmail() + ": " + e.getMessage());
            // Print the token to console so testing is still possible in case of local network/SMTP blocking
            System.out.println("====== [TEST BYPASS] GENERATED INVITE TOKEN FOR " + appUser.getEmail() + ": " + token + " ======");
        }

        return convertToResponse(employee, appUser);
    }

    @Override
    @Transactional
    public EmployeeResponse updateEmployee(Long id, EmployeeUpdateRequest request) {
        // 1. Fetch Employee
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with ID: " + id));

        // 2. Fetch Department, Designation, Role, and Manager if specified
        Department department = null;
        if (request.getDepartmentId() != null) {
            department = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + request.getDepartmentId()));
        }

        Designation designation = null;
        if (request.getDesignationId() != null) {
            designation = designationRepository.findById(request.getDesignationId())
                    .orElseThrow(() -> new ResourceNotFoundException("Designation not found with ID: " + request.getDesignationId()));
        }

        Role role = roleRepository.findById(request.getRoleId())
                .orElseThrow(() -> new ResourceNotFoundException("Role not found with ID: " + request.getRoleId()));

        Employee manager = null;
        if (request.getManagerId() != null) {
            if (request.getManagerId().equals(id)) {
                throw new IllegalArgumentException("Employee cannot be their own manager");
            }
            manager = employeeRepository.findById(request.getManagerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Manager not found with ID: " + request.getManagerId()));
        }

        // 3. Update Address
        Address address = employee.getAddress();
        if (address == null) {
            address = new Address();
        }
        address.setLine1(request.getLine1());
        address.setLine2(request.getLine2());
        address.setCity(request.getCity());
        address.setState(request.getState());
        address.setPinCode(request.getPinCode());
        address.setCountry(request.getCountry());
        address = addressRepository.save(address);

        // 4. Update Employee
        employee.setFirstName(request.getFirstName());
        employee.setLastName(request.getLastName());
        employee.setDob(request.getDob());
        employee.setGender(request.getGender());
        employee.setPhone(request.getPhone());
        employee.setAddress(address);
        employee.setDepartment(department);
        employee.setDesignation(designation);
        employee.setManager(manager);
        employee.setJoiningDate(request.getJoiningDate());
        employee = employeeRepository.save(employee);

        // 5. Update AppUser Role
        AppUser appUser = appUserRepository.findByEmployeeId(id)
                .orElseThrow(() -> new ResourceNotFoundException("AppUser credentials not found for Employee ID: " + id));
        appUser.setRole(role);
        appUser = appUserRepository.save(appUser);

        return convertToResponse(employee, appUser);
    }

    @Override
    @Transactional(readOnly = true)
    public EmployeeResponse getEmployeeById(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with ID: " + id));
        return convertToResponse(employee);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<EmployeeResponse> getEmployees(String firstName, String lastName, Long departmentId, Long designationId, Boolean isActive, Pageable pageable) {
        Page<Employee> employees = employeeRepository.findAllWithFilters(firstName, lastName, departmentId, designationId, isActive, pageable);
        return employees.map(this::convertToResponse);
    }

    @Override
    @Transactional
    public void updateEmployeeStatus(Long id, boolean active) {
        AppUser appUser = appUserRepository.findByEmployeeId(id)
                .orElseThrow(() -> new ResourceNotFoundException("AppUser credentials not found for Employee ID: " + id));
        appUser.setActive(active);
        appUserRepository.save(appUser);
    }

    private EmployeeResponse convertToResponse(Employee employee) {
        AppUser appUser = appUserRepository.findByEmployeeId(employee.getId()).orElse(null);
        return convertToResponse(employee, appUser);
    }

    private EmployeeResponse convertToResponse(Employee employee, AppUser appUser) {
        EmployeeResponse.EmployeeResponseBuilder builder = EmployeeResponse.builder()
                .employeeId(employee.getId())
                .firstName(employee.getFirstName())
                .lastName(employee.getLastName())
                .dob(employee.getDob())
                .gender(employee.getGender())
                .phone(employee.getPhone())
                .joiningDate(employee.getJoiningDate());

        if (appUser != null) {
            builder.email(appUser.getEmail())
                    .active(appUser.isActive())
                    .emailVerified(appUser.isEmailVerified());
            
            if (appUser.getRole() != null) {
                builder.role(EmployeeResponse.RoleDto.builder()
                        .id(appUser.getRole().getId())
                        .name(appUser.getRole().getRoleName())
                        .build());
            }
        }

        if (employee.getAddress() != null) {
            builder.address(EmployeeResponse.AddressDto.builder()
                    .addressId(employee.getAddress().getId())
                    .line1(employee.getAddress().getLine1())
                    .line2(employee.getAddress().getLine2())
                    .city(employee.getAddress().getCity())
                    .state(employee.getAddress().getState())
                    .pinCode(employee.getAddress().getPinCode())
                    .country(employee.getAddress().getCountry())
                    .build());
        }

        if (employee.getDepartment() != null) {
            builder.department(EmployeeResponse.DepartmentDto.builder()
                    .id(employee.getDepartment().getId())
                    .name(employee.getDepartment().getDeptName())
                    .build());
        }

        if (employee.getDesignation() != null) {
            builder.designation(EmployeeResponse.DesignationDto.builder()
                    .id(employee.getDesignation().getId())
                    .title(employee.getDesignation().getTitle())
                    .build());
        }

        if (employee.getManager() != null) {
            builder.manager(EmployeeResponse.ManagerDto.builder()
                    .id(employee.getManager().getId())
                    .name(employee.getManager().getFirstName() + " " + employee.getManager().getLastName())
                    .build());
        }

        return builder.build();
    }

    @Override
    @Transactional
    public void setPassword(SetPasswordRequest request) {
        AppUser appUser = appUserRepository.findByInviteToken(request.getToken())
                .orElseThrow(() -> new ResourceNotFoundException("Invalid or expired invite token"));

        if (appUser.getTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Invite token has expired");
        }

        appUser.setPasswordHash(PasswordUtils.hashPassword(request.getPassword()));
        appUser.setInviteToken(null);
        appUser.setTokenExpiry(null);
        appUser.setEmailVerified(true);
        appUser.setActive(true);
        appUserRepository.save(appUser);
    }
}
