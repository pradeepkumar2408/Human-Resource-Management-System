package com.dayflow.employee.service;

import com.dayflow.employee.entity.Address;
import com.dayflow.employee.entity.Document;
import com.dayflow.employee.entity.Employee;
import com.dayflow.employee.repository.DocumentRepository;
import com.dayflow.employee.repository.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final DocumentRepository documentRepository;

    @Autowired
    public EmployeeService(EmployeeRepository employeeRepository, DocumentRepository documentRepository) {
        this.employeeRepository = employeeRepository;
        this.documentRepository = documentRepository;
    }

    public Employee getEmployeeProfile(Long id) {
        return employeeRepository.findById(id)
                .orElseGet(() -> Employee.builder()
                        .employeeId(id)
                        .firstName("Employee")
                        .lastName("User")
                        .email("employee" + id + "@dayflow.com")
                        .phoneNumber("+1 555-0199")
                        .profilePhotoUrl("https://ui-avatars.com/api/?name=Employee+User")
                        .basicSalary(75000.0)
                        .address(Address.builder().city("New York").country("USA").build())
                        .build());
    }

    public Employee updateEmployeeProfile(Long id, Map<String, Object> updateFields) {
        Employee employee = getEmployeeProfile(id);

        if (updateFields.containsKey("phoneNumber")) {
            employee.setPhoneNumber((String) updateFields.get("phoneNumber"));
        }
        if (updateFields.containsKey("profilePhotoUrl")) {
            employee.setProfilePhotoUrl((String) updateFields.get("profilePhotoUrl"));
        }
        if (updateFields.containsKey("city") || updateFields.containsKey("street")) {
            if (employee.getAddress() == null) {
                employee.setAddress(new Address());
            }
            if (updateFields.containsKey("city")) employee.getAddress().setCity((String) updateFields.get("city"));
            if (updateFields.containsKey("street")) employee.getAddress().setStreet((String) updateFields.get("street"));
        }

        return employeeRepository.save(employee);
    }

    public List<Document> getEmployeeDocuments(Long employeeId) {
        return documentRepository.findByEmployeeId(employeeId);
    }

    public Document uploadDocument(Long employeeId, String documentName, String documentType, String fileUrl) {
        Document document = Document.builder()
                .employeeId(employeeId)
                .documentName(documentName != null ? documentName : "Document.pdf")
                .documentType(documentType != null ? documentType : "PDF")
                .fileUrl(fileUrl != null ? fileUrl : "http://localhost:8082/files/doc.pdf")
                .build();

        return documentRepository.save(document);
    }
}
