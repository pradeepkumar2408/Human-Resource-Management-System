package com.dayflow.leaveservice.repository;

import com.dayflow.leaveservice.entity.LeaveStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface LeaveStatusRepository extends JpaRepository<LeaveStatus, Long> {
    Optional<LeaveStatus> findByNameIgnoreCase(String name);
}
