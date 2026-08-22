package com.dayflow.auth.config;

import com.dayflow.auth.entity.AppUser;
import com.dayflow.auth.entity.Role;
import com.dayflow.auth.repository.RoleRepository;
import com.dayflow.auth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public DataInitializer(UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        try {
            Role employeeRole = roleRepository.findByRoleName("EMPLOYEE")
                    .orElseGet(() -> {
                        try {
                            return roleRepository.save(Role.builder().roleName("EMPLOYEE").build());
                        } catch (Exception e) {
                            return roleRepository.findByRoleName("EMPLOYEE").orElse(null);
                        }
                    });

            Role adminRole = roleRepository.findByRoleName("ADMIN")
                    .orElseGet(() -> {
                        try {
                            return roleRepository.save(Role.builder().roleName("ADMIN").build());
                        } catch (Exception e) {
                            return roleRepository.findByRoleName("ADMIN").orElse(null);
                        }
                    });

            if (employeeRole != null) {
                seedUser("717824p146@kce.ac.in", "password123", employeeRole, 717824L);
                seedUser("alonewarrior123456@gmail.com", "password123", employeeRole, 9001L);
                seedUser("employee@dayflow.com", "password123", employeeRole, 9002L);
            }

            if (adminRole != null) {
                seedUser("admin@dayflow.com", "admin123", adminRole, 9003L);
            }

            System.out.println(">>> DataInitializer: Account seeding completed.");
        } catch (Exception e) {
            System.err.println(">>> DataInitializer notice: " + e.getMessage());
        }
    }

    private void seedUser(String email, String rawPassword, Role role, Long empId) {
        String lowerEmail = email.toLowerCase().trim();
        try {
            if (!userRepository.existsByEmail(lowerEmail)) {
                AppUser user = AppUser.builder()
                        .email(lowerEmail)
                        .passwordHash(passwordEncoder.encode(rawPassword))
                        .role(role)
                        .employeeId(empId)
                        .isEmailVerified("Y")
                        .isActive("Y")
                        .build();
                userRepository.save(user);
                System.out.println(">>> Seeded Oracle DB user: " + lowerEmail);
            }
        } catch (Exception e) {
            System.out.println(">>> User " + lowerEmail + " already exists in Oracle DB.");
        }
    }
}
