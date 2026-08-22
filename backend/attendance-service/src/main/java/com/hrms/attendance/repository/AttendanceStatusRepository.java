package com.hrms.attendance.repository;

import com.hrms.attendance.model.AttendanceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AttendanceStatusRepository extends JpaRepository<AttendanceStatus, String> {
}
