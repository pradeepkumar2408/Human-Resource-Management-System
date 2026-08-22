package com.hrms.attendance.repository;

import com.hrms.attendance.model.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long>, JpaSpecificationExecutor<Attendance> {

    Optional<Attendance> findByEmployeeIdAndWorkDate(String employeeId, LocalDate workDate);

    List<Attendance> findByEmployeeIdOrderByWorkDateDesc(String employeeId);

    @Query("SELECT a.status.statusCode, COUNT(a) FROM Attendance a WHERE a.workDate = :workDate GROUP BY a.status.statusCode")
    List<Object[]> countStatusByWorkDate(@Param("workDate") LocalDate workDate);

    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.workDate = :workDate")
    long countTotalByWorkDate(@Param("workDate") LocalDate workDate);
}
