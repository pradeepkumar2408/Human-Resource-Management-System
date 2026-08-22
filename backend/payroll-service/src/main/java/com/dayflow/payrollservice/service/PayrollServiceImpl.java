package com.dayflow.payrollservice.service;

import com.dayflow.payrollservice.dto.*;
import com.dayflow.payrollservice.entity.Payroll;
import com.dayflow.payrollservice.entity.SalaryStructure;
import com.dayflow.payrollservice.exception.ResourceNotFoundException;
import com.dayflow.payrollservice.repository.PayrollRepository;
import com.dayflow.payrollservice.repository.SalaryStructureRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class PayrollServiceImpl implements PayrollService {

    private final SalaryStructureRepository salaryStructureRepository;
    private final PayrollRepository payrollRepository;

    @Autowired
    public PayrollServiceImpl(SalaryStructureRepository salaryStructureRepository, PayrollRepository payrollRepository) {
        this.salaryStructureRepository = salaryStructureRepository;
        this.payrollRepository = payrollRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<EmployeeNetPayResponse> getAllEmployeesNetPay(String payPeriod) {
        List<SalaryStructure> structures = salaryStructureRepository.findAll();
        List<EmployeeNetPayResponse> responseList = new ArrayList<>();

        for (SalaryStructure structure : structures) {
            String empId = structure.getEmployeeId();
            Optional<Payroll> payrollOpt = Optional.empty();

            if (payPeriod != null && !payPeriod.trim().isEmpty()) {
                payrollOpt = payrollRepository.findByEmployeeIdAndPayPeriod(empId, payPeriod);
            } else {
                // Find latest payroll slip
                List<Payroll> payrolls = payrollRepository.findByEmployeeIdOrderByPayPeriodDesc(empId);
                if (!payrolls.isEmpty()) {
                    payrollOpt = Optional.of(payrolls.get(0));
                }
            }

            if (payrollOpt.isPresent()) {
                Payroll payroll = payrollOpt.get();
                responseList.add(EmployeeNetPayResponse.builder()
                        .employeeId(payroll.getEmployeeId())
                        .netPay(payroll.getNetPay())
                        .basicSalary(payroll.getBasicSalary())
                        .hra(payroll.getHra())
                        .allowances(payroll.getAllowances())
                        .deductions(payroll.getDeductions())
                        .payPeriod(payroll.getPayPeriod())
                        .paymentStatus(payroll.getPaymentStatus())
                        .generationDate(payroll.getGenerationDate())
                        .source("PAYROLL_SLIP")
                        .build());
            } else {
                responseList.add(EmployeeNetPayResponse.builder()
                        .employeeId(structure.getEmployeeId())
                        .netPay(structure.getNetSalary())
                        .basicSalary(structure.getBasicSalary())
                        .hra(structure.getHra())
                        .allowances(structure.getAllowances())
                        .deductions(structure.getDeductions())
                        .payPeriod(payPeriod != null ? payPeriod : "N/A")
                        .paymentStatus("NOT_GENERATED")
                        .generationDate(null)
                        .source("SALARY_STRUCTURE")
                        .build());
            }
        }
        return responseList;
    }

    @Override
    @Transactional
    public SalaryStructure setOrUpdateSalaryStructure(String employeeId, SalaryStructureRequest request) {
        Optional<SalaryStructure> existingOpt = salaryStructureRepository.findByEmployeeId(employeeId);
        SalaryStructure structure;

        if (existingOpt.isPresent()) {
            structure = existingOpt.get();
            structure.setBasicSalary(request.getBasicSalary());
            structure.setHra(request.getHra());
            structure.setAllowances(request.getAllowances());
            structure.setDeductions(request.getDeductions());
        } else {
            structure = SalaryStructure.builder()
                    .employeeId(employeeId)
                    .basicSalary(request.getBasicSalary())
                    .hra(request.getHra())
                    .allowances(request.getAllowances())
                    .deductions(request.getDeductions())
                    .build();
        }

        return salaryStructureRepository.save(structure);
    }

    @Override
    @Transactional
    public BulkGenerateResponse generatePayroll(String payPeriod) {
        List<SalaryStructure> structures = salaryStructureRepository.findAll();
        int processedCount = 0;
        int createdCount = 0;
        int skippedCount = 0;

        for (SalaryStructure structure : structures) {
            processedCount++;
            String empId = structure.getEmployeeId();
            Optional<Payroll> existingOpt = payrollRepository.findByEmployeeIdAndPayPeriod(empId, payPeriod);

            if (existingOpt.isPresent()) {
                skippedCount++;
            } else {
                Payroll payroll = Payroll.builder()
                        .employeeId(empId)
                        .payPeriod(payPeriod)
                        .basicSalary(structure.getBasicSalary())
                        .hra(structure.getHra())
                        .allowances(structure.getAllowances())
                        .deductions(structure.getDeductions())
                        .paymentStatus("PENDING")
                        .generationDate(LocalDate.now())
                        .build();
                payrollRepository.save(payroll);
                createdCount++;
            }
        }

        String message = String.format("Payroll generation completed. Created: %d, Skipped (already existed): %d, Total processed: %d.",
                createdCount, skippedCount, processedCount);

        return BulkGenerateResponse.builder()
                .payPeriod(payPeriod)
                .processedCount(processedCount)
                .createdCount(createdCount)
                .skippedCount(skippedCount)
                .message(message)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Payroll> getPayrollByEmployeeId(String employeeId, String payPeriod) {
        if (payPeriod != null && !payPeriod.trim().isEmpty()) {
            Optional<Payroll> payrollOpt = payrollRepository.findByEmployeeIdAndPayPeriod(employeeId, payPeriod);
            if (payrollOpt.isEmpty()) {
                throw new ResourceNotFoundException("No payroll record found for employee " + employeeId + " in period " + payPeriod);
            }
            return List.of(payrollOpt.get());
        } else {
            List<Payroll> payrolls = payrollRepository.findByEmployeeIdOrderByPayPeriodDesc(employeeId);
            if (payrolls.isEmpty()) {
                boolean exists = salaryStructureRepository.findByEmployeeId(employeeId).isPresent();
                if (!exists) {
                    throw new ResourceNotFoundException("No salary structure or payroll records found for employee ID: " + employeeId);
                }
            }
            return payrolls;
        }
    }
}
