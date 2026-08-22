package com.dayflow.adminemployeeservice.repository;

import com.dayflow.adminemployeeservice.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findByEmployeeId(String employeeId);
}
