import React, { useState } from 'react';
import EmployeeDetails from './EmployeeDetails';

const API_BASE_URL = 'http://localhost:8111/api';

export default function EmployeeList({ employees, setEmployees, darkMode, colors }) {
  // Directory state
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All'); // All, Active, Inactive

  // Onboarding modal/drawer state
  const [isAdding, setIsAdding] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    employeeId: '',
    email: '',
    role: 'Employee'
  });

  // Drill-down selected state
  const [selectedEmp, setSelectedEmp] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const isMobile = window.innerWidth < 768;

  // Colors mapping and theme configuration
  const styles = {
    card: {
      backgroundColor: colors.cardBg,
      border: `1px solid ${colors.border}`,
      borderRadius: '12px',
      padding: isMobile ? '20px' : '28px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
      transition: 'all 0.3s ease',
    },
    title: {
      fontSize: '20px',
      fontWeight: '700',
      color: colors.text,
      margin: 0,
    },
    headerRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px',
      flexWrap: 'wrap',
      gap: '16px',
    },
    filterRow: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '12px',
      marginBottom: '24px',
      alignItems: 'center',
    },
    searchInputWrapper: {
      position: 'relative',
      flex: 1,
      minWidth: '220px',
    },
    searchIcon: {
      position: 'absolute',
      left: '14px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: colors.textMuted,
      fontSize: '15px',
    },
    searchInput: {
      width: '100%',
      padding: '10px 16px 10px 42px',
      borderRadius: '8px',
      border: `1px solid ${colors.border}`,
      fontSize: '14px',
      outline: 'none',
      boxSizing: 'border-box',
      backgroundColor: colors.cardBg,
      color: colors.text,
      transition: 'all 0.3s ease',
    },
    select: {
      padding: '10px 14px',
      borderRadius: '8px',
      border: `1px solid ${colors.border}`,
      backgroundColor: colors.cardBg,
      color: colors.text,
      fontSize: '14px',
      outline: 'none',
      cursor: 'pointer',
      minWidth: '150px',
      transition: 'all 0.3s ease',
    },
    deelTable: {
      width: '100%',
      borderCollapse: 'collapse',
      textAlign: 'left',
      fontSize: '14px',
      minWidth: '700px',
    },
    tableHeadCell: {
      padding: '12px 16px',
      fontWeight: '600',
      color: colors.textMuted,
      fontSize: '12px',
      textTransform: 'uppercase',
      letterSpacing: '0.3px',
      borderBottom: `1px solid ${colors.tableBorder}`,
    },
    tableBodyRow: {
      borderBottom: `1px solid ${colors.tableBorder}`,
      transition: 'background-color 0.2s',
      cursor: 'pointer',
    },
    tableBodyCell: {
      padding: '16px',
      verticalAlign: 'middle',
      color: colors.text,
    },
    badge: (isActive) => ({
      display: 'inline-flex',
      alignItems: 'center',
      padding: '4px 10px',
      borderRadius: '16px',
      fontSize: '12px',
      fontWeight: '600',
      backgroundColor: isActive ? '#ECFDF3' : '#FEF3F2',
      color: isActive ? '#027A48' : '#B42318',
    }),
    btnAction: {
      padding: '6px 10px',
      borderRadius: '6px',
      fontSize: '12px',
      fontWeight: '600',
      cursor: 'pointer',
      backgroundColor: 'transparent',
      border: `1px solid ${colors.border}`,
      color: colors.text,
      transition: 'all 0.2s',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
    },
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    },
    modalContent: {
      backgroundColor: colors.cardBg,
      border: `1px solid ${colors.border}`,
      borderRadius: '12px',
      padding: '28px',
      width: '90%',
      maxWidth: '600px',
      boxShadow: '0 20px 24px -4px rgba(16, 24, 40, 0.08)',
      maxHeight: '90vh',
      overflowY: 'auto',
    },
    paginationRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: '20px',
      paddingTop: '20px',
      borderTop: `1px solid ${colors.border}`,
    },
  };

  // Unique departments filter keys
  const departments = ['All', ...new Set(employees.map(e => e.departmentName || e.deptName).filter(Boolean))];

  // Filtering Logic
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = 
      `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(employeeSearch.toLowerCase()) ||
      (emp.email && emp.email.toLowerCase().includes(employeeSearch.toLowerCase())) ||
      (emp.employeeId && emp.employeeId.toString().includes(employeeSearch));
      
    const matchesDept = deptFilter === 'All' || emp.departmentName === deptFilter || emp.deptName === deptFilter;
    
    const empStatus = emp.active !== undefined ? emp.active : (emp.isActive === 'Y');
    const matchesStatus = 
      statusFilter === 'All' || 
      (statusFilter === 'Active' && empStatus) || 
      (statusFilter === 'Inactive' && !empStatus);

    return matchesSearch && matchesDept && matchesStatus;
  });

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredEmployees.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);

  // Add Employee Form Handlers
  const handleAddEmployeeSubmit = async (e) => {
    e.preventDefault();
    if (!newEmployee.employeeId || !newEmployee.email) {
      alert('Employee ID and Corporate Email are mandatory fields.');
      return;
    }

    const payload = {
      employeeId: newEmployee.employeeId.trim(),
      email: newEmployee.email.trim(),
      role: newEmployee.role === 'HR' ? 'ADMIN' : 'EMPLOYEE'
    };

    try {
      const res = await fetch(`${API_BASE_URL}/admin/employees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const savedEmp = await res.json();
        setEmployees(prev => [savedEmp, ...prev]);
        setIsAdding(false);
        setNewEmployee({
          employeeId: '',
          email: '',
          role: 'Employee'
        });
        alert('Employee onboarded successfully! Invitation activation email sent.');
      } else {
        const errData = await res.json().catch(() => null);
        alert(errData?.message || 'Failed to onboard employee.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error connecting to API gateway.');
    }
  };

  // Toggle Activation from Row Actions
  const handleToggleActivation = async (id, currentStatus) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/employees/${id}/status?active=${!currentStatus}`, {
        method: 'PUT'
      });

      if (res.ok) {
        setEmployees(prev => prev.map(emp => {
          if ((emp.employeeId || emp.id) === id) {
            return {
              ...emp,
              active: !currentStatus,
              isActive: !currentStatus ? 'Y' : 'N'
            };
          }
          return emp;
        }));
        alert(`Account status updated successfully to ${!currentStatus ? 'Active' : 'Suspended'}.`);
      } else {
        alert('Failed to update account status in backend.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error.');
    }
  };

  // Save changes from details view context
  const handleSaveDetails = async (updatedEmp) => {
    const deptMap = {
      'Engineering': 1,
      'HR & Talent': 2,
      'Human Resources': 2,
      'Finance': 3,
      'Marketing': 4,
      'Operations': 3
    };

    const title = (updatedEmp.designationTitle || updatedEmp.title || '').toLowerCase();
    let designationId = 1;
    if (title.includes('hr') || title.includes('talent')) designationId = 2;
    else if (title.includes('finance') || title.includes('analyst')) designationId = 3;
    else if (title.includes('marketing') || title.includes('specialist')) designationId = 4;

    const payload = {
      firstName: updatedEmp.firstName || 'First',
      lastName: updatedEmp.lastName || 'Last',
      phone: updatedEmp.phone || '',
      joiningDate: updatedEmp.joiningDate || new Date().toISOString().split('T')[0],
      roleId: updatedEmp.role === 'HR' ? 2 : 1,
      departmentId: deptMap[updatedEmp.departmentName] || 1,
      designationId: designationId
    };

    try {
      const empId = updatedEmp.employeeId || updatedEmp.id;
      const res = await fetch(`${API_BASE_URL}/admin/employees/${empId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const saved = await res.json();
        setEmployees(prev => prev.map(emp => {
          if ((emp.employeeId || emp.id) === empId) {
            return saved;
          }
          return emp;
        }));
        setSelectedEmp(saved);
        alert('Employee profile updated successfully.');
      } else {
        const errData = await res.json().catch(() => null);
        alert(errData?.message || 'Failed to update employee profile.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error.');
    }
  };

  // If detailed profile is opened, render EmployeeDetails sub-view
  if (selectedEmp) {
    return (
      <EmployeeDetails 
        employee={selectedEmp}
        onSave={handleSaveDetails}
        onBack={() => setSelectedEmp(null)}
        darkMode={darkMode}
        colors={colors}
      />
    );
  }

  return (
    <div style={styles.card}>
      {/* Header Info */}
      <div style={styles.headerRow}>
        <div>
          <h3 style={styles.title}>Employee Database Directory</h3>
          <span style={{ fontSize: '13px', color: colors.textMuted }}>
            Showing {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredEmployees.length)} of {filteredEmployees.length} profiles
          </span>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          style={{
            backgroundColor: '#000000',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '24px',
            padding: '10px 20px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(16,24,40,0.05)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <i className="bi bi-person-plus-fill"></i> Add Employee
        </button>
      </div>

      {/* Filter Row */}
      <div style={styles.filterRow}>
        <div style={styles.searchInputWrapper}>
          <i className="bi bi-search" style={styles.searchIcon}></i>
          <input
            type="text"
            placeholder="Search directory by name, ID or email..."
            style={styles.searchInput}
            value={employeeSearch}
            onChange={(e) => { setEmployeeSearch(e.target.value); setCurrentPage(1); }}
          />
        </div>

        <select
          style={styles.select}
          value={deptFilter}
          onChange={(e) => { setDeptFilter(e.target.value); setCurrentPage(1); }}
        >
          {departments.map((dept, index) => (
            <option key={index} value={dept}>{dept === 'All' ? 'All Departments' : dept}</option>
          ))}
        </select>

        <select
          style={styles.select}
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
        >
          <option value="All">All Statuses</option>
          <option value="Active">Active Accounts</option>
          <option value="Inactive">Suspended Accounts</option>
        </select>
      </div>

      {/* Directory Table */}
      <div style={{ width: '100%', overflowX: 'auto' }}>
        <table style={styles.deelTable}>
          <thead>
            <tr>
              <th style={styles.tableHeadCell}>Name</th>
              <th style={styles.tableHeadCell}>Employee ID</th>
              <th style={styles.tableHeadCell}>Department</th>
              <th style={styles.tableHeadCell}>Designation</th>
              <th style={styles.tableHeadCell}>Privilege</th>
              <th style={styles.tableHeadCell}>Status</th>
              <th style={{ ...styles.tableHeadCell, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ ...styles.tableBodyCell, textAlign: 'center', padding: '40px', color: colors.textMuted }}>
                  No employee profiles match the selected filters.
                </td>
              </tr>
            ) : (
              currentItems.map(emp => {
                const isActive = emp.active !== undefined ? emp.active : (emp.isActive === 'Y');
                return (
                  <tr key={emp.employeeId || emp.id} style={styles.tableBodyRow} onClick={() => setSelectedEmp(emp)}>
                    <td style={styles.tableBodyCell}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          backgroundColor: darkMode ? '#374151' : '#F2F4F7',
                          color: colors.text,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '700',
                          fontSize: '12px'
                        }}>
                          {emp.firstName?.[0]}{emp.lastName?.[0]}
                        </div>
                        <div>
                          <strong>{emp.firstName} {emp.lastName}</strong>
                          <div style={{ fontSize: '12px', color: colors.textMuted }}>{emp.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={styles.tableBodyCell}>{emp.employeeId || emp.id}</td>
                    <td style={styles.tableBodyCell}>{emp.departmentName || emp.deptName || 'N/A'}</td>
                    <td style={styles.tableBodyCell}>{emp.designationTitle || emp.title || 'N/A'}</td>
                    <td style={styles.tableBodyCell}>{emp.role === 'HR' ? 'HR / Admin' : 'Employee'}</td>
                    <td style={styles.tableBodyCell}>
                      <span style={styles.badge(isActive)}>
                        {isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td style={{ ...styles.tableBodyCell, textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button 
                          style={styles.btnAction} 
                          onClick={() => setSelectedEmp(emp)}
                          title="View Details"
                        >
                          <i className="bi bi-eye"></i> View
                        </button>
                        <button
                          style={{
                            ...styles.btnAction,
                            backgroundColor: isActive ? '#FEF3F2' : '#ECFDF3',
                            color: isActive ? '#B42318' : '#027A48',
                            borderColor: isActive ? '#FEE4E2' : '#D1FADF'
                          }}
                          onClick={() => handleToggleActivation(emp.employeeId || emp.id, isActive)}
                        >
                          <i className={`bi ${isActive ? 'bi-shield-x' : 'bi-shield-check'}`}></i>
                          {isActive ? 'Suspend' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Row */}
      {totalPages > 1 && (
        <div style={styles.paginationRow}>
          <button
            disabled={currentPage === 1}
            style={{
              ...styles.btnAction,
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              opacity: currentPage === 1 ? 0.5 : 1
            }}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          >
            Previous
          </button>
          <span style={{ fontSize: '13px', color: colors.textMuted, fontWeight: '600' }}>
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            style={{
              ...styles.btnAction,
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              opacity: currentPage === totalPages ? 0.5 : 1
            }}
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          >
            Next
          </button>
        </div>
      )}

      {/* ONBOARDING MODAL */}
      {isAdding && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h4 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: colors.text }}>Onboard New Employee</h4>
              <button 
                onClick={() => setIsAdding(false)}
                style={{ backgroundColor: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer', color: colors.textMuted }}
              >
                <i className="bi bi-x"></i>
              </button>
            </div>
            
            <form onSubmit={handleAddEmployeeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', fontWeight: '600', color: colors.textMuted }}>Employee ID *</label>
                <input
                  type="text"
                  required
                  style={styles.searchInput}
                  placeholder="e.g. EMP-1002"
                  value={newEmployee.employeeId}
                  onChange={(e) => setNewEmployee({ ...newEmployee, employeeId: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', fontWeight: '600', color: colors.textMuted }}>Corporate Email *</label>
                <input
                  type="email"
                  required
                  style={styles.searchInput}
                  placeholder="john.doe@company.com"
                  value={newEmployee.email}
                  onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', fontWeight: '600', color: colors.textMuted }}>Privilege Role *</label>
                <select
                  style={styles.select}
                  value={newEmployee.role}
                  onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value })}
                >
                  <option value="Employee">Employee (Standard View)</option>
                  <option value="HR">HR / Administrator (Full Access)</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button
                  type="button"
                  style={{
                    backgroundColor: 'transparent',
                    border: `1px solid ${colors.border}`,
                    color: colors.text,
                    padding: '8px 16px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                  onClick={() => setIsAdding(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    backgroundColor: '#000000',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                >
                  Save & Onboard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}