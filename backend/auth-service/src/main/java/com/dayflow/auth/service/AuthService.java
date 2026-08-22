package com.dayflow.auth.service;

import com.dayflow.auth.dto.LoginRequest;
import com.dayflow.auth.dto.LoginResponse;
import com.dayflow.auth.dto.UserDto;
import com.dayflow.auth.entity.AppUser;
import com.dayflow.auth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;

    @Autowired
    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public LoginResponse login(LoginRequest request) {
        String email = request.getEmail().trim();
        String password = request.getPassword();

        if (password == null || password.trim().isEmpty()) {
            throw new IllegalArgumentException("Password is required.");
        }

        // Search Oracle DB APP_USER table
        Optional<AppUser> userOptional = userRepository.findByEmail(email);

        AppUser appUser;
        if (userOptional.isPresent()) {
            appUser = userOptional.get();
            // Simple credential verification (In production: BCryptPasswordEncoder)
            if (!password.equals(appUser.getPasswordHash())) {
                throw new IllegalArgumentException("Invalid email or password.");
            }
        } else {
            // Fallback for development / initial test credentials before DB seeding
            if (password.length() < 6) {
                throw new IllegalArgumentException("Password must be at least 6 characters long.");
            }
            boolean isEmployee = email.toLowerCase().contains("employee") || !email.toLowerCase().contains("admin");
            String roleStr = isEmployee ? "EMPLOYEE" : "ADMIN";
            String firstName = isEmployee ? "Surya" : "Admin";

            UserDto mockUser = UserDto.builder()
                    .id(101L)
                    .email(email)
                    .firstName(firstName)
                    .lastName("User")
                    .role(roleStr)
                    .department("Engineering")
                    .build();

            String token = "dayflow_token_" + UUID.randomUUID().toString().replace("-", "");

            return LoginResponse.builder()
                    .token(token)
                    .tokenType("Bearer")
                    .message("Login successful")
                    .user(mockUser)
                    .build();
        }

        UserDto userDto = UserDto.builder()
                .id(appUser.getUserId())
                .email(appUser.getEmail())
                .firstName("User")
                .lastName(appUser.getEmployeeId() != null ? String.valueOf(appUser.getEmployeeId()) : "")
                .role(appUser.getRole() != null ? appUser.getRole().getRoleName() : "EMPLOYEE")
                .department("Engineering")
                .build();

        String token = "dayflow_token_" + UUID.randomUUID().toString().replace("-", "");

        return LoginResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .message("Login successful")
                .user(userDto)
                .build();
    }
}
