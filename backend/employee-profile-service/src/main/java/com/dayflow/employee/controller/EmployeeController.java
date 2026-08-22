package com.dayflow.employee.controller;

import com.dayflow.employee.entity.Document;
import com.dayflow.employee.entity.Employee;
import com.dayflow.employee.service.EmployeeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/employees")
@CrossOrigin(origins = "*")
public class EmployeeController {

    private final EmployeeService employeeService;

    @Autowired
    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    // 1. GET /api/employees/{id} — fetch own profile
    @GetMapping("/{id}")
    public ResponseEntity<Employee> getEmployeeProfile(@PathVariable Long id) {
        Employee employee = employeeService.getEmployeeProfile(id);
        return ResponseEntity.ok(employee);
    }

    // 2. PUT /api/employees/{id} — update editable fields
    @PutMapping("/{id}")
    public ResponseEntity<Employee> updateEmployeeProfile(@PathVariable Long id, @RequestBody Map<String, Object> updateFields) {
        Employee updatedEmployee = employeeService.updateEmployeeProfile(id, updateFields);
        return ResponseEntity.ok(updatedEmployee);
    }

    // 3. GET /api/employees/{id}/documents — list uploaded documents
    @GetMapping("/{id}/documents")
    public ResponseEntity<List<Document>> getEmployeeDocuments(@PathVariable Long id) {
        List<Document> documents = employeeService.getEmployeeDocuments(id);
        return ResponseEntity.ok(documents);
    }

    // 4. POST /api/employees/{id}/documents — upload a document
    @PostMapping("/{id}/documents")
    public ResponseEntity<Document> uploadDocument(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String name = body.getOrDefault("documentName", "Document.pdf");
        String type = body.getOrDefault("documentType", "PDF");
        String url = body.getOrDefault("fileUrl", "http://localhost:8082/files/doc.pdf");

        Document uploadedDoc = employeeService.uploadDocument(id, name, type, url);
        return ResponseEntity.status(HttpStatus.CREATED).body(uploadedDoc);
    }
}
