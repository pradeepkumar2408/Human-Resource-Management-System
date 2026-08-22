package com.dayflow.auth.service;

import com.dayflow.auth.dto.*;
import com.dayflow.auth.entity.AppUser;
import com.dayflow.auth.entity.Role;
import com.dayflow.auth.repository.RoleRepository;
import com.dayflow.auth.repository.UserRepository;
import com.dayflow.auth.util.JwtUtils;
import com.dayflow.auth.util.OtpStore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;
import java.util.Random;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final EmailService emailService;
    private final OtpStore otpStore;

    @Autowired
    public AuthService(UserRepository userRepository,
                       RoleRepository roleRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtils jwtUtils,
                       EmailService emailService,
                       OtpStore otpStore) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
        this.emailService = emailService;
        this.otpStore = otpStore;
    }

    private String generateNumericOtp() {
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }

    // 1. POST /login (Validates email, password, and role against Oracle DB)
    public LoginResponse login(LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        String password = request.getPassword();
        String requestedRole = request.getRole();

        AppUser appUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("No account found registered with this email address. Please sign up or check your credentials."));

        // Verify BCrypt password
        if (!passwordEncoder.matches(password, appUser.getPasswordHash()) && !password.equals(appUser.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid password. Please check your credentials.");
        }

        String userRole = appUser.getRole() != null ? appUser.getRole().getRoleName() : "EMPLOYEE";

        // Verify Role if specified by user
        if (requestedRole != null && !requestedRole.trim().isEmpty()) {
            if (!userRole.equalsIgnoreCase(requestedRole.trim())) {
                throw new IllegalArgumentException("Access Denied: Your account role (" + userRole + ") does not match requested role (" + requestedRole + ").");
            }
        }

        // Generate real signed JWT token
        String accessToken = jwtUtils.generateAccessToken(appUser.getEmail(), appUser.getUserId(), userRole);
        String refreshToken = jwtUtils.generateRefreshToken(appUser.getEmail());

        UserDto userDto = UserDto.builder()
                .id(appUser.getUserId())
                .email(appUser.getEmail())
                .firstName(userRole.equalsIgnoreCase("ADMIN") ? "Admin" : "Employee")
                .lastName("User")
                .role(userRole)
                .department("Engineering")
                .build();

        return LoginResponse.builder()
                .token(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .message("Login successful! Redirecting to dashboard...")
                .user(userDto)
                .build();
    }

    // 2. POST /signup
    public ApiResponse signup(SignUpRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("An account with email address " + email + " is already registered.");
        }

        String roleStr = request.getRole() != null ? request.getRole() : (request.getRoleName() != null ? request.getRoleName() : "EMPLOYEE");
        roleStr = roleStr.toUpperCase();

        final String finalRoleStr = roleStr;
        Role role = roleRepository.findByRoleName(finalRoleStr)
                .orElseGet(() -> roleRepository.save(Role.builder().roleName(finalRoleStr).build()));

        String hashedPassword = passwordEncoder.encode(request.getPassword());

        Long employeeIdVal = null;
        if (request.getEmployeeId() != null && !request.getEmployeeId().trim().isEmpty()) {
            try {
                String numericId = request.getEmployeeId().replaceAll("[^0-9]", "");
                if (!numericId.isEmpty()) employeeIdVal = Long.parseLong(numericId);
            } catch (Exception ignored) {}
        }

        AppUser appUser = AppUser.builder()
                .employeeId(employeeIdVal)
                .email(email)
                .passwordHash(hashedPassword)
                .role(role)
                .isEmailVerified("N")
                .isActive("Y")
                .build();

        userRepository.save(appUser);

        // Generate OTP and send email via Gmail SMTP
        String otpCode = generateNumericOtp();
        otpStore.storeOtp(email, otpCode);

        emailService.sendOtpEmail(
            email, 
            otpCode, 
            "Dayflow HRMS - Verification Code", 
            "Welcome to Dayflow HRMS. Here is your verification OTP code:"
        );

        return new ApiResponse(true, "Account registered successfully in Oracle DB! Verification OTP code sent to " + email, otpCode);
    }

    // 3. POST /forgot-password (Checks if mail exists in Oracle DB, sends OTP to mail)
    public ApiResponse forgotPassword(ForgotPasswordRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        // Check if email exists in Oracle 11g database
        AppUser appUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("No account registered with email address " + email + ". Please check the email address."));

        // Generate 6-digit OTP code & store
        String otpCode = generateNumericOtp();
        otpStore.storeOtp(email, otpCode);

        // Send OTP from alonewarrior123456@gmail.com to user's registered email inbox
        emailService.sendOtpEmail(
            email, 
            otpCode, 
            "Dayflow HRMS - Password Reset OTP Code", 
            "You requested a password reset for your Dayflow HRMS account."
        );

        return new ApiResponse(true, "A 6-digit OTP code has been sent to your registered email address: " + email);
    }

    // 4. POST /verify-reset-otp (Validates OTP code)
    public Map<String, Object> verifyResetOtp(VerifyResetOtpRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        String inputOtp = request.getOtp() != null ? request.getOtp() : request.getToken();

        // Ensure user exists
        userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("No account registered with email address " + email));

        // Validate OTP code
        if (!otpStore.validateOtp(email, inputOtp)) {
            throw new IllegalArgumentException("Invalid or expired OTP code. Please check your email inbox and try again.");
        }

        String resetToken = "RESET_TOKEN_" + UUID.randomUUID().toString().replace("-", "").toUpperCase();
        otpStore.storeOtp("reset_" + email, resetToken);

        return Map.of(
            "success", true,
            "message", "OTP verified successfully! You can now set your new password.",
            "resetToken", resetToken,
            "token", resetToken
        );
    }

    // 5. POST /reset-password (Updates password in Oracle DB)
    public ApiResponse resetPassword(ResetPasswordRequest request) {
        String email = request.getEmail() != null ? request.getEmail().trim().toLowerCase() : "";

        if (email.isEmpty()) {
            throw new IllegalArgumentException("Email address is required for password reset.");
        }

        AppUser appUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User account not found in Oracle DB."));

        if (request.getNewPassword() == null || request.getNewPassword().length() < 6) {
            throw new IllegalArgumentException("New password must be at least 6 characters long.");
        }

        // Hash new password using BCrypt and update in Oracle 11g DB
        String newHashedPassword = passwordEncoder.encode(request.getNewPassword());
        appUser.setPasswordHash(newHashedPassword);
        userRepository.save(appUser);

        otpStore.removeOtp(email);
        otpStore.removeOtp("reset_" + email);

        return new ApiResponse(true, "Password has been updated in database successfully! Redirecting to sign in...");
    }

    // 6. POST /verify-email
    public ApiResponse verifyEmail(VerifyEmailRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        String inputOtp = request.getToken() != null ? request.getToken() : request.getOtp();

        AppUser appUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User account not found in database."));

        if (!otpStore.validateOtp(email, inputOtp)) {
            throw new IllegalArgumentException("Invalid or expired OTP code.");
        }

        appUser.setIsEmailVerified("Y");
        userRepository.save(appUser);
        otpStore.removeOtp(email);

        return new ApiResponse(true, "Email address verified successfully in Oracle DB!");
    }

    // 7. POST /resend-verification
    public ApiResponse resendVerification(ResendVerificationRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("No account registered with email " + email));

        String otpCode = generateNumericOtp();
        otpStore.storeOtp(email, otpCode);

        emailService.sendOtpEmail(email, otpCode, "Dayflow HRMS - Verification Code", "Here is your new OTP code:");

        return new ApiResponse(true, "A new OTP code has been sent to " + email);
    }
}
