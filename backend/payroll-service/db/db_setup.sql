-- ==========================================
-- SECTION 1: DATABASE USER CREATION
-- RUN THIS PORTION AS SYS OR SYSTEM USER IN ORACLE 11g (e.g., xe SID)
-- ==========================================

-- CREATE USER df_payroll IDENTIFIED BY PayrollPass123;
-- GRANT CONNECT, RESOURCE, CREATE VIEW TO df_payroll;
-- ALTER USER df_payroll QUOTA UNLIMITED ON USERS;

-- ==========================================
-- SECTION 2: DDL SCHEMA CREATION (FOR ORACLE 11g)
-- CONNECT AS df_payroll AND RUN THE FOLLOWING:
-- ==========================================

-- Drop tables and sequences if they exist to allow a clean run
BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE PAYROLL';
EXCEPTION WHEN OTHERS THEN NULL;
END;
/
BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE SALARY_STRUCTURE';
EXCEPTION WHEN OTHERS THEN NULL;
END;
/

BEGIN
   EXECUTE IMMEDIATE 'DROP SEQUENCE SALARY_STRUCTURE_SEQ';
EXCEPTION WHEN OTHERS THEN NULL;
END;
/
BEGIN
   EXECUTE IMMEDIATE 'DROP SEQUENCE PAYROLL_SEQ';
EXCEPTION WHEN OTHERS THEN NULL;
END;
/

-- 1. Create Sequences for Auto-Incrementing IDs
CREATE SEQUENCE SALARY_STRUCTURE_SEQ START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE PAYROLL_SEQ START WITH 1 INCREMENT BY 1 NOCACHE;

-- 2. Create Salary Structure table
CREATE TABLE SALARY_STRUCTURE (
    id NUMBER PRIMARY KEY,
    employee_id VARCHAR2(50) UNIQUE NOT NULL,
    basic_salary NUMBER(12, 2) NOT NULL,
    hra NUMBER(12, 2) NOT NULL,
    allowances NUMBER(12, 2) NOT NULL,
    deductions NUMBER(12, 2) NOT NULL,
    net_salary NUMBER(12, 2) NOT NULL
);

-- 3. Create Payroll table
CREATE TABLE PAYROLL (
    id NUMBER PRIMARY KEY,
    employee_id VARCHAR2(50) NOT NULL,
    pay_period VARCHAR2(20) NOT NULL,
    basic_salary NUMBER(12, 2) NOT NULL,
    hra NUMBER(12, 2) NOT NULL,
    allowances NUMBER(12, 2) NOT NULL,
    deductions NUMBER(12, 2) NOT NULL,
    net_pay NUMBER(12, 2) NOT NULL,
    payment_status VARCHAR2(20) NOT NULL,
    generation_date DATE DEFAULT SYSDATE NOT NULL,
    CONSTRAINT uq_payroll_emp_period UNIQUE (employee_id, pay_period)
);

COMMIT;
