package com.dayflow.payroll.service;

import com.dayflow.payroll.entity.Payroll;
import com.dayflow.payroll.entity.SalaryStructure;
import com.dayflow.payroll.repository.PayrollRepository;
import com.dayflow.payroll.repository.SalaryStructureRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Service
public class PayrollService {

    private final SalaryStructureRepository salaryStructureRepository;
    private final PayrollRepository payrollRepository;

    @Autowired
    public PayrollService(SalaryStructureRepository salaryStructureRepository, PayrollRepository payrollRepository) {
        this.salaryStructureRepository = salaryStructureRepository;
        this.payrollRepository = payrollRepository;
    }

    public SalaryStructure getSalaryStructure(Long employeeId) {
        return salaryStructureRepository.findByEmployeeId(employeeId)
                .orElseGet(() -> SalaryStructure.builder()
                        .employeeId(employeeId)
                        .basePay(50000.0)
                        .hra(15000.0)
                        .specialAllowance(10000.0)
                        .pfDeduction(3000.0)
                        .taxDeduction(5000.0)
                        .build());
    }

    public List<Payroll> getPaymentHistory(Long employeeId) {
        List<Payroll> history = payrollRepository.findByEmployeeIdOrderByPayPeriodYearDescPayPeriodMonthDesc(employeeId);
        if (history.isEmpty()) {
            history = List.of(
                Payroll.builder()
                        .payrollId(101L)
                        .employeeId(employeeId)
                        .payPeriodMonth(7)
                        .payPeriodYear(2026)
                        .basicSalary(50000.0)
                        .allowances(25000.0)
                        .deductions(8000.0)
                        .netPay(67000.0)
                        .paymentDate(LocalDate.of(2026, 7, 31))
                        .status("PAID")
                        .build(),
                Payroll.builder()
                        .payrollId(100L)
                        .employeeId(employeeId)
                        .payPeriodMonth(6)
                        .payPeriodYear(2026)
                        .basicSalary(50000.0)
                        .allowances(25000.0)
                        .deductions(8000.0)
                        .netPay(67000.0)
                        .paymentDate(LocalDate.of(2026, 6, 30))
                        .status("PAID")
                        .build()
            );
        }
        return history;
    }

    public Map<String, Object> getSalarySlip(Long payrollId) {
        Payroll payroll = payrollRepository.findById(payrollId)
                .orElseGet(() -> Payroll.builder()
                        .payrollId(payrollId)
                        .employeeId(1L)
                        .payPeriodMonth(7)
                        .payPeriodYear(2026)
                        .basicSalary(50000.0)
                        .allowances(25000.0)
                        .deductions(8000.0)
                        .netPay(67000.0)
                        .paymentDate(LocalDate.of(2026, 7, 31))
                        .status("PAID")
                        .build());

        return Map.of(
            "payrollId", payroll.getPayrollId(),
            "employeeId", payroll.getEmployeeId(),
            "monthYear", payroll.getPayPeriodMonth() + "/" + payroll.getPayPeriodYear(),
            "basicSalary", payroll.getBasicSalary(),
            "allowances", payroll.getAllowances(),
            "deductions", payroll.getDeductions(),
            "netPay", payroll.getNetPay(),
            "downloadUrl", "http://localhost:8085/api/payroll/me/slip/" + payrollId + "/pdf"
        );
    }
}
