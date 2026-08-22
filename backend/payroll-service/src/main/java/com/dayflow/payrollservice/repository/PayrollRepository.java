package com.dayflow.payrollservice.repository;

import com.dayflow.payrollservice.entity.Payroll;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PayrollRepository extends JpaRepository<Payroll, Long> {
    Optional<Payroll> findByEmployeeIdAndPayPeriod(String employeeId, String payPeriod);
    List<Payroll> findByEmployeeIdOrderByPayPeriodDesc(String employeeId);
    List<Payroll> findByPayPeriod(String payPeriod);
}
