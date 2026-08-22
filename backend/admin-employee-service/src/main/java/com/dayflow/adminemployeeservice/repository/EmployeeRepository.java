package com.dayflow.adminemployeeservice.repository;

import com.dayflow.adminemployeeservice.entity.Employee;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface EmployeeRepository extends JpaRepository<Employee, String> {

    @Query("SELECT e FROM Employee e " +
           "LEFT JOIN AppUser u ON u.employee = e " +
           "WHERE (:firstName IS NULL OR LOWER(e.firstName) LIKE LOWER(CONCAT('%', :firstName, '%'))) " +
           "AND (:lastName IS NULL OR LOWER(e.lastName) LIKE LOWER(CONCAT('%', :lastName, '%'))) " +
           "AND (:departmentId IS NULL OR e.department.id = :departmentId) " +
           "AND (:designationId IS NULL OR e.designation.id = :designationId) " +
           "AND (:isActive IS NULL OR u.isActive = :isActive)")
    Page<Employee> findAllWithFilters(
            @Param("firstName") String firstName,
            @Param("lastName") String lastName,
            @Param("departmentId") Long departmentId,
            @Param("designationId") Long designationId,
            @Param("isActive") Boolean isActive,
            Pageable pageable);
}
