package com.dayflow.adminemployeeservice.service;

import com.dayflow.adminemployeeservice.dto.*;
import com.dayflow.adminemployeeservice.entity.*;
import com.dayflow.adminemployeeservice.exception.*;
import com.dayflow.adminemployeeservice.repository.*;
import com.dayflow.adminemployeeservice.util.PasswordUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
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

    @Value("${app.frontend.url}")
    private String frontendUrl;

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

        // 2. Check if employee ID already exists
        if (employeeRepository.findById(request.getEmployeeId()).isPresent()) {
            throw new IllegalArgumentException("Employee ID '" + request.getEmployeeId() + "' is already in use");
        }

        // 3. Fetch Role by role name (e.g. "EMPLOYEE" or "ADMIN")
        Role role = roleRepository.findByRoleName(request.getRole().toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Role not found with name: " + request.getRole()));

        // 4. Save Employee skeleton (ID explicitly provided by Admin, names/joining nullable)
        Employee employee = Employee.builder()
                .id(request.getEmployeeId())
                .build();
        employee = employeeRepository.save(employee);

        // 5. Create AppUser with random token and inactive status
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

        // 6. Send Invitation Email pointing to the React signup page
        try {
            SimpleMailMessage mailMessage = new SimpleMailMessage();
            mailMessage.setFrom("alonewarrior123456@gmail.com");
            mailMessage.setTo(appUser.getEmail());
            mailMessage.setSubject("Invitation to Join Dayflow HRMS");
            
            // Build direct link: http://localhost:5173/signup?empid=123&email=abc@example.com&token=XYZ
            String activationLink = frontendUrl 
                    + "?empid=" + employee.getId() 
                    + "&email=" + appUser.getEmail() 
                    + "&token=" + token;

            mailMessage.setText("Hello,\n\n"
                    + "You have been onboarded to Dayflow HRMS by Admin Karthi.\n"
                    + "Please click the following link to set your password and activate your account:\n\n"
                    + activationLink + "\n\n"
                    + "This invitation link will expire in 24 hours.\n\n"
                    + "Best regards,\nDayflow Admin Team");
            mailSender.send(mailMessage);
            System.out.println("Email sent successfully to: " + appUser.getEmail());
        } catch (Exception e) {
            System.err.println("Failed to send invite email to " + appUser.getEmail() + ": " + e.getMessage());
            // Print the token and parameters to console so testing is still possible in case of local network/SMTP blocking
            System.out.println("====== [TEST BYPASS] GENERATED INVITE TOKEN FOR " + appUser.getEmail() + ": " + token + " ======");
        }

        return convertToResponse(employee, appUser);
    }

    @Override
    @Transactional
    public EmployeeResponse updateEmployee(String id, EmployeeUpdateRequest request) {
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

        Role role = null;
        if (request.getRoleId() != null) {
            role = roleRepository.findById(request.getRoleId())
                    .orElseThrow(() -> new ResourceNotFoundException("Role not found with ID: " + request.getRoleId()));
        }

        Employee manager = null;
        if (request.getManagerId() != null && !request.getManagerId().trim().isEmpty()) {
            if (request.getManagerId().equals(id)) {
                throw new IllegalArgumentException("Employee cannot be their own manager");
            }
            manager = employeeRepository.findById(request.getManagerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Manager not found with ID: " + request.getManagerId()));
        }

        // 3. Update Address if details provided
        Address address = employee.getAddress();
        if (request.getLine1() != null || request.getCity() != null || request.getState() != null) {
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
            employee.setAddress(address);
        }

        // 4. Update Employee
        employee.setFirstName(request.getFirstName());
        employee.setLastName(request.getLastName());
        employee.setDob(request.getDob());
        employee.setGender(request.getGender());
        employee.setPhone(request.getPhone());
        if (department != null) employee.setDepartment(department);
        if (designation != null) employee.setDesignation(designation);
        if (manager != null) employee.setManager(manager);
        if (request.getJoiningDate() != null) employee.setJoiningDate(request.getJoiningDate());
        employee = employeeRepository.save(employee);

        // 5. Update AppUser Role if role provided
        AppUser appUser = appUserRepository.findByEmployeeId(id)
                .orElseThrow(() -> new ResourceNotFoundException("AppUser credentials not found for Employee ID: " + id));
        if (role != null) {
            appUser.setRole(role);
            appUser = appUserRepository.save(appUser);
        }

        return convertToResponse(employee, appUser);
    }

    @Override
    @Transactional(readOnly = true)
    public EmployeeResponse getEmployeeById(String id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with ID: " + id));
        return convertToResponse(employee);
    }

    @Override
    @Transactional(readOnly = true)
    public java.util.List<EmployeeResponse> getEmployees(String firstName, String lastName, Long departmentId, Long designationId, Boolean isActive) {
        Page<Employee> employees = employeeRepository.findAllWithFilters(firstName, lastName, departmentId, designationId, isActive, org.springframework.data.domain.Pageable.unpaged());
        return employees.getContent().stream()
                .map(this::convertToResponse)
                .collect(java.util.stream.Collectors.toList());
    }

    @Override
    @Transactional
    public void updateEmployeeStatus(String id, boolean active) {
        AppUser appUser = appUserRepository.findByEmployeeId(id)
                .orElseThrow(() -> new ResourceNotFoundException("AppUser credentials not found for Employee ID: " + id));
        appUser.setActive(active);
        appUserRepository.save(appUser);
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

    @Override
    @Transactional
    public void signup(SignUpRequest request) {
        // Find employee
        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee details not found or not pre-registered by Admin/HR."));

        // Find associated user credentials
        AppUser appUser = appUserRepository.findByEmployeeId(employee.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Pre-registered account credentials not found."));

        // Verify email matching (case-insensitive)
        if (!appUser.getEmail().equalsIgnoreCase(request.getEmail().trim())) {
            throw new IllegalArgumentException("Entered email address does not match our pre-registered records.");
        }

        // Verify role matching (case-insensitive)
        if (!appUser.getRole().getRoleName().equalsIgnoreCase(request.getRole().trim())) {
            throw new IllegalArgumentException("Entered role assignment does not match our pre-registered records.");
        }

        // Check if already active
        if (appUser.isActive() && appUser.isEmailVerified()) {
            throw new IllegalArgumentException("Account is already active. Please sign in.");
        }

        // Save password and activate account
        appUser.setPasswordHash(PasswordUtils.hashPassword(request.getPassword()));
        appUser.setInviteToken(null);
        appUser.setTokenExpiry(null);
        appUser.setEmailVerified(true);
        appUser.setActive(true);
        appUserRepository.save(appUser);
    }

    @Override
    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        AppUser appUser = appUserRepository.findByEmail(request.getEmail().trim())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        String hashedInput = PasswordUtils.hashPassword(request.getPassword());
        if (!appUser.getPasswordHash().equals(hashedInput)) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        if (!appUser.isActive()) {
            throw new IllegalArgumentException("Account is currently suspended. Please contact HR.");
        }

        return LoginResponse.builder()
                .token("JWT-DEMO-TOKEN-" + UUID.randomUUID().toString())
                .user(LoginResponse.UserDto.builder()
                        .employeeId(appUser.getEmployee().getId())
                        .email(appUser.getEmail())
                        .role(appUser.getRole().getRoleName())
                        .build())
                .build();
    }

    @Override
    @Transactional
    public EmployeeResponse updateSelfProfile(String id, java.util.Map<String, Object> request) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with ID: " + id));

        if (request.containsKey("firstName") && request.get("firstName") != null) {
            employee.setFirstName(request.get("firstName").toString().trim());
        }
        if (request.containsKey("lastName") && request.get("lastName") != null) {
            employee.setLastName(request.get("lastName").toString().trim());
        }
        if (request.containsKey("gender") && request.get("gender") != null) {
            String g = request.get("gender").toString().trim();
            if (!g.isEmpty()) {
                employee.setGender(g.substring(0, 1).toUpperCase());
            }
        }
        if (request.containsKey("phone") && request.get("phone") != null) {
            employee.setPhone(request.get("phone").toString().trim());
        }
        if (request.containsKey("dob") && request.get("dob") != null) {
            String dobStr = request.get("dob").toString().trim();
            if (!dobStr.isEmpty()) {
                try {
                    employee.setDob(LocalDate.parse(dobStr));
                } catch (Exception ignored) {}
            }
        }

        if (request.containsKey("address") && request.get("address") != null) {
            String addrStr = request.get("address").toString().trim();
            if (!addrStr.isEmpty()) {
                Address address = employee.getAddress();
                if (address == null) {
                    address = new Address();
                }
                address.setLine1(addrStr.length() > 150 ? addrStr.substring(0, 150) : addrStr);
                if (address.getCity() == null) address.setCity("N/A");
                if (address.getState() == null) address.setState("N/A");
                if (address.getPinCode() == null) address.setPinCode("000000");
                if (address.getCountry() == null) address.setCountry("India");
                address = addressRepository.save(address);
                employee.setAddress(address);
            }
        }

        employee = employeeRepository.save(employee);
        return convertToResponse(employee);
    }

    private EmployeeResponse convertToResponse(Employee employee) {
        AppUser appUser = appUserRepository.findByEmployeeId(employee.getId()).orElse(null);
        return convertToResponse(employee, appUser);
    }

    private EmployeeResponse convertToResponse(Employee employee, AppUser appUser) {
        String firstName = employee.getFirstName();
        String lastName = employee.getLastName();
        if ((firstName == null || firstName.trim().isEmpty()) && (lastName == null || lastName.trim().isEmpty())) {
            if (appUser != null && appUser.getEmail() != null) {
                String email = appUser.getEmail();
                if (email.contains("@")) {
                    firstName = email.split("@")[0];
                } else {
                    firstName = email;
                }
                lastName = "";
            }
        }

        EmployeeResponse.EmployeeResponseBuilder builder = EmployeeResponse.builder()
                .employeeId(employee.getId())
                .firstName(firstName)
                .lastName(lastName)
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
}
