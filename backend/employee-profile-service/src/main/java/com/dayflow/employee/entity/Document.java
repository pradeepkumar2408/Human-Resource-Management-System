package com.dayflow.employee.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "DOCUMENT")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "DOCUMENT_ID")
    private Long documentId;

    @Column(name = "EMPLOYEE_ID", nullable = false)
    private Long employeeId;

    @Column(name = "DOCUMENT_NAME", nullable = false, length = 200)
    private String documentName;

    @Column(name = "DOCUMENT_TYPE", length = 50)
    private String documentType;

    @Column(name = "FILE_URL", length = 500)
    private String fileUrl;

    @Column(name = "UPLOADED_AT")
    private LocalDateTime uploadedAt;

    @PrePersist
    protected void onCreate() {
        if (uploadedAt == null) {
            uploadedAt = LocalDateTime.now();
        }
    }
}
