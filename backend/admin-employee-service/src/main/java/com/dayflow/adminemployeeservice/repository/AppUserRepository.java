package com.dayflow.adminemployeeservice.repository;

import com.dayflow.adminemployeeservice.entity.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface AppUserRepository extends JpaRepository<AppUser, Long> {
    Optional<AppUser> findByEmail(String email);
    Optional<AppUser> findByEmployeeId(String employeeId);
    Optional<AppUser> findByInviteToken(String inviteToken);
}
