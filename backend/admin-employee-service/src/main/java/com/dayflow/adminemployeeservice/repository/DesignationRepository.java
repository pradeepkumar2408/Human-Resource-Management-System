package com.dayflow.adminemployeeservice.repository;

import com.dayflow.adminemployeeservice.entity.Designation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface DesignationRepository extends JpaRepository<Designation, Long> {
    Optional<Designation> findByTitle(String title);
}
