package com.dayflow.leave.repository;

import com.dayflow.leave.entity.LeaveType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LeaveTypeRepository extends JpaRepository<LeaveType, Long> {
    Optional<LeaveType> findByTypeNameIgnoreCase(String typeName);
}
