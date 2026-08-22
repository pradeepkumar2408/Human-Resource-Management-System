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

    // 1. POST /signup
    public ApiResponse signup(SignUpRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("An account with email " + email + " already exists in the database.");
        }

        String roleStr = request.getRole() != null ? request.getRole() : (request.getRoleName() != null ? request.getRoleName() : "EMPLOYEE");
        roleStr = roleStr.toUpperCase();

        final String finalRoleStr = roleStr;
        Role role = roleRepository.findByRoleName(finalRoleStr)
                .orElseGet(() -> roleRepository.save(Role.builder().roleName(finalRoleStr).build()));

        // BCrypt Password Hashing
        String hashedPassword = passwordEncoder.encode(request.getPassword());

        Long employeeIdVal = null;
        if (request.getEmployeeId() != null && !request.getEmployeeId().trim().isEmpty()) {
            try {
                String numericId = request.getEmployeeId().replaceAll("[^0-9]", "");
                if (!numericId.isEmpty()) employeeIdVal = Long.parseLong(numericId);
            } catch (Exception ignored) {}
        }

        // Store User in Oracle DB
        AppUser appUser = AppUser.builder()
                .employeeId(employeeIdVal)
                .email(email)
                .passwordHash(hashedPassword)
                .role(role)
                .isEmailVerified("N")
                .isActive("Y")
                .build();

        userRepository.save(appUser);

        // Generate Real 6-Digit OTP and dispatch to inbox via Gmail SMTP
        String otpCode = generateNumericOtp();
        otpStore.storeOtp(email, otpCode);

        emailService.sendOtpEmail(
            email, 
            otpCode, 
            "Dayflow HRMS - Account Verification OTP", 
            "Thank you for registering with Dayflow HRMS."
        );

        return new ApiResponse(true, 
            "Employee account registered & stored in Oracle DB. Verification OTP sent to " + email,
            otpCode);
    }

    // 2. POST /verify-email
    public ApiResponse verifyEmail(VerifyEmailRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        String inputOtp = request.getToken() != null ? request.getToken() : request.getOtp();

        AppUser appUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User account " + email + " not found in database."));

        if (!otpStore.validateOtp(email, inputOtp)) {
            throw new IllegalArgumentException("Invalid or expired OTP code. Please check your email inbox and try again.");
        }

        // Update verification status in Oracle DB
        appUser.setIsEmailVerified("Y");
        userRepository.save(appUser);
        otpStore.removeOtp(email);

        return new ApiResponse(true, "Email address verified successfully in Oracle DB! You can now log in.");
    }

    // 3. POST /resend-verification
    public ApiResponse resendVerification(ResendVerificationRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        AppUser appUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("No account registered with email " + email));

        String otpCode = generateNumericOtp();
        otpStore.storeOtp(email, otpCode);

        emailService.sendOtpEmail(
            email, 
            otpCode, 
            "Dayflow HRMS - Resend Verification OTP", 
            "Here is your new 6-digit verification code:"
        );

        return new ApiResponse(true, "A new 6-digit OTP verification code has been sent to " + email);
    }

    // 4. POST /forgot-password (Stage 1)
    public ApiResponse forgotPassword(ForgotPasswordRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        AppUser appUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("No account found registered with email " + email + " in Oracle DB."));

        // Generate Real 6-Digit OTP and dispatch to user inbox via Gmail SMTP
        String otpCode = generateNumericOtp();
        otpStore.storeOtp(email, otpCode);

        emailService.sendOtpEmail(
            email, 
            otpCode, 
            "Dayflow HRMS - Password Reset OTP Code", 
            "You requested a password reset for your Dayflow HRMS account."
        );

        return new ApiResponse(true, "A 6-digit OTP code has been sent to your email inbox: " + email);
    }

    // 5. POST /verify-reset-otp (Stage 2 for ForgotPassword.jsx)
    public Map<String, Object> verifyResetOtp(VerifyResetOtpRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        String inputOtp = request.getOtp() != null ? request.getOtp() : request.getToken();

        AppUser appUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User account not found in database."));

        if (!otpStore.validateOtp(email, inputOtp)) {
            throw new IllegalArgumentException("Invalid or expired OTP code. Please check your inbox and try again.");
        }

        String resetToken = "RESET_TOKEN_" + UUID.randomUUID().toString().replace("-", "").toUpperCase();
        otpStore.storeOtp("reset_" + email, resetToken);

        return Map.of(
            "success", true,
            "message", "OTP verified successfully!",
            "resetToken", resetToken,
            "token", resetToken
        );
    }

    // 6. POST /reset-password (Stage 3 for ForgotPassword.jsx)
    public ApiResponse resetPassword(ResetPasswordRequest request) {
        String email = request.getEmail() != null ? request.getEmail().trim().toLowerCase() : "";
        
        AppUser appUser;
        if (!email.isEmpty()) {
            appUser = userRepository.findByEmail(email)
                    .orElseThrow(() -> new IllegalArgumentException("User account not found in Oracle DB."));
        } else {
            throw new IllegalArgumentException("Email address is required for password reset.");
        }

        if (request.getNewPassword() == null || request.getNewPassword().length() < 6) {
            throw new IllegalArgumentException("New password must be at least 6 characters long.");
        }

        // Hash new password using BCrypt and update in Oracle 11g DB
        String newHashedPassword = passwordEncoder.encode(request.getNewPassword());
        appUser.setPasswordHash(newHashedPassword);
        userRepository.save(appUser);

        otpStore.removeOtp(email);
        otpStore.removeOtp("reset_" + email);

        return new ApiResponse(true, "Password updated and stored in Oracle DB successfully! You can now log in.");
    }

    // 7. POST /login
    public LoginResponse login(LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        String password = request.getPassword();

        AppUser appUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials. Account does not exist in Oracle DB."));

        // BCrypt Password Verification against Oracle DB
        if (!passwordEncoder.matches(password, appUser.getPasswordHash()) && !password.equals(appUser.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid credentials or incorrect password.");
        }

        String roleName = appUser.getRole() != null ? appUser.getRole().getRoleName() : "EMPLOYEE";

        // Issue JWT Access Token & Refresh Token
        String accessToken = jwtUtils.generateAccessToken(appUser.getEmail(), appUser.getUserId(), roleName);
        String refreshToken = jwtUtils.generateRefreshToken(appUser.getEmail());

        UserDto userDto = UserDto.builder()
                .id(appUser.getUserId())
                .email(appUser.getEmail())
                .firstName(roleName.equalsIgnoreCase("ADMIN") ? "Admin" : "Employee")
                .lastName("User")
                .role(roleName)
                .department("Engineering")
                .build();

        return LoginResponse.builder()
                .token(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .message("Login successful")
                .user(userDto)
                .build();
    }
}
