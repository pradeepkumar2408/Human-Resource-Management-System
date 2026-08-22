package com.dayflow.payroll.repository;

import com.dayflow.payroll.entity.SalaryStructure;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SalaryStructureRepository extends JpaRepository<SalaryStructure, Long> {
    Optional<SalaryStructure> findByEmployeeId(Long employeeId);
}
