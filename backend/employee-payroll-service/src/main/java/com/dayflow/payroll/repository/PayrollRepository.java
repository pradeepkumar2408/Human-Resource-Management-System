package com.dayflow.payroll.repository;

import com.dayflow.payroll.entity.Payroll;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PayrollRepository extends JpaRepository<Payroll, Long> {
    List<Payroll> findByEmployeeIdOrderByPayPeriodYearDescPayPeriodMonthDesc(Long employeeId);
}
