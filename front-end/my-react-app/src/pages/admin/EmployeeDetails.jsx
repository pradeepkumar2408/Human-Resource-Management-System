import React, { useState } from 'react';

export default function EmployeeDetails({ employee, onSave, onBack, darkMode, colors }) {
  // Local state initialized with employee props
  const [formData, setFormData] = useState({
    firstName: employee.firstName || '',
    lastName: employee.lastName || '',
    email: employee.email || '',
    phone: employee.phone || '',
    departmentName: employee.departmentName || employee.deptName || 'Engineering',
    designationTitle: employee.designationTitle || employee.title || 'Software Engineer',
    joiningDate: employee.joiningDate || '',
    managerName: employee.managerName || '',
    role: employee.role || 'Employee',
    isActive: employee.isActive || 'Y',
    active: employee.active !== undefined ? employee.active : true,
    salary: employee.salary || { basic: 50000, hra: 20000, allowances: 10000, deductions: 5000 },
    documents: employee.documents || { aadhar: 'Pending', pan: 'Pending', offerLetter: 'Pending' }
  });

  const [activeSubTab, setActiveSubTab] = useState('Personal'); // Personal, Job, Documents
  const [isEditing, setIsEditing] = useState(false);

  const isMobile = window.innerWidth < 768;

  // Local style configuration inheriting global themes
  const styles = {
    card: {
      backgroundColor: colors.cardBg,
      border: `1px solid ${colors.border}`,
      borderRadius: '12px',
      padding: isMobile ? '20px' : '28px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
      transition: 'all 0.3s ease',
    },
    headerRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: `1px solid ${colors.border}`,
      paddingBottom: '20px',
      marginBottom: '24px',
      flexWrap: 'wrap',
      gap: '16px',
    },
    title: {
      fontSize: '20px',
      fontWeight: '700',
      color: colors.text,
      margin: 0,
    },
    subTitle: {
      fontSize: '13px',
      color: colors.textMuted,
      marginTop: '4px',
    },
    subTabContainer: {
      display: 'flex',
      gap: '16px',
      borderBottom: `1px solid ${colors.border}`,
      marginBottom: '28px',
    },
    subTab: (isActive) => ({
      padding: '8px 16px 12px 16px',
      fontSize: '14px',
      fontWeight: '600',
      color: isActive ? '#2563EB' : colors.textMuted,
      cursor: 'pointer',
      borderBottom: isActive ? '2px solid #2563EB' : '2px solid transparent',
      transition: 'all 0.2s ease',
    }),
    formGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
      gap: '20px',
      marginBottom: '28px',
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
    },
    label: {
      fontSize: '12px',
      fontWeight: '600',
      color: colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
    input: {
      padding: '10px 14px',
      borderRadius: '8px',
      border: `1px solid ${colors.border}`,
      backgroundColor: isEditing ? colors.inputBg : (darkMode ? '#111827' : '#F2F4F7'),
      color: colors.text,
      fontSize: '14px',
      outline: 'none',
      cursor: isEditing ? 'text' : 'not-allowed',
      transition: 'all 0.3s ease',
    },
    select: {
      padding: '10px 14px',
      borderRadius: '8px',
      border: `1px solid ${colors.border}`,
      backgroundColor: isEditing ? colors.inputBg : (darkMode ? '#111827' : '#F2F4F7'),
      color: colors.text,
      fontSize: '14px',
      outline: 'none',
      cursor: isEditing ? 'pointer' : 'not-allowed',
      transition: 'all 0.3s ease',
    },
    btnContainer: {
      display: 'flex',
      gap: '12px',
      justifyContent: 'flex-end',
      marginTop: '20px',
      flexWrap: 'wrap',
    },
    toggleSwitchContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px',
      borderRadius: '8px',
      backgroundColor: darkMode ? '#111827' : '#F9FAFB',
      border: `1px solid ${colors.border}`,
      marginBottom: '24px',
    },
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDocVerify = (docName, status) => {
    setFormData(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [docName]: status
      }
    }));
  };

  const handleToggleActive = () => {
    const nextActive = !formData.active;
    setFormData(prev => ({
      ...prev,
      active: nextActive,
      isActive: nextActive ? 'Y' : 'N'
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...employee,
      ...formData
    });
    setIsEditing(false);
  };

  return (
    <div style={styles.card}>
      {/* Header Row */}
      <div style={styles.headerRow}>
        <div>
          <button 
            onClick={onBack}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: '#2563EB',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '14px',
              padding: 0,
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <i className="bi bi-arrow-left"></i> Back to Directory
          </button>
          <h3 style={styles.title}>
            {formData.firstName} {formData.lastName}
          </h3>
          <span style={styles.subTitle}>ID: {employee.employeeId || employee.id}</span>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              style={{
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 18px',
                fontWeight: '600',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            >
              <i className="bi bi-pencil-fill" style={{ marginRight: '6px' }}></i> Edit Profile
            </button>
          ) : (
            <>
              <button
                onClick={() => {
                  setFormData({ ...employee });
                  setIsEditing(false);
                }}
                style={{
                  backgroundColor: colors.cardBg,
                  color: colors.text,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '8px',
                  padding: '10px 18px',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                style={{
                  backgroundColor: '#027A48',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 18px',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
              >
                Save Changes
              </button>
            </>
          )}
        </div>
      </div>

      {/* Account Deactivation Toggler */}
      <div style={styles.toggleSwitchContainer}>
        <div>
          <span style={{ fontWeight: '700', fontSize: '15px', color: colors.text }}>
            Account Operations Status
          </span>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: colors.textMuted }}>
            {formData.active 
              ? 'This account is active. The employee can access Dayflow portals.' 
              : 'Suspended. The employee is temporarily blocked from all payroll and check-in services.'}
          </p>
        </div>
        <button
          onClick={handleToggleActive}
          style={{
            backgroundColor: formData.active ? '#ECFDF3' : '#FEF3F2',
            color: formData.active ? '#027A48' : '#B42318',
            border: `1px solid ${formData.active ? '#D1FADF' : '#FEE4E2'}`,
            borderRadius: '20px',
            padding: '8px 16px',
            fontSize: '13px',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          <i className={`bi ${formData.active ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}`} style={{ marginRight: '6px' }}></i>
          {formData.active ? 'Active' : 'Deactivated'}
        </button>
      </div>

      {/* Sub Tabs */}
      <div style={styles.subTabContainer}>
        {['Personal', 'Job & Role', 'Documents'].map(tab => (
          <div 
            key={tab}
            style={styles.subTab(activeSubTab === tab)}
            onClick={() => setActiveSubTab(tab)}
          >
            {tab}
          </div>
        ))}
      </div>

      {/* TAB 1: PERSONAL DETAILS */}
      {activeSubTab === 'Personal' && (
        <div style={styles.formGrid}>
          <div style={styles.formGroup}>
            <label style={styles.label}>First Name</label>
            <input
              type="text"
              readOnly={!isEditing}
              style={styles.input}
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Last Name</label>
            <input
              type="text"
              readOnly={!isEditing}
              style={styles.input}
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Corporate Email</label>
            <input
              type="email"
              readOnly={!isEditing}
              style={styles.input}
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Phone Number</label>
            <input
              type="text"
              readOnly={!isEditing}
              style={styles.input}
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
            />
          </div>
        </div>
      )}

      {/* TAB 2: JOB & ROLE EDITOR */}
      {activeSubTab === 'Job & Role' && (
        <div style={styles.formGrid}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Department</label>
            {isEditing ? (
              <select
                style={styles.select}
                value={formData.departmentName}
                onChange={(e) => handleInputChange('departmentName', e.target.value)}
              >
                <option value="Engineering">Engineering</option>
                <option value="Marketing">Marketing</option>
                <option value="Operations">Operations</option>
                <option value="HR & Talent">HR & Talent</option>
              </select>
            ) : (
              <input type="text" readOnly style={styles.input} value={formData.departmentName} />
            )}
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Designation Title</label>
            <input
              type="text"
              readOnly={!isEditing}
              style={styles.input}
              value={formData.designationTitle}
              onChange={(e) => handleInputChange('designationTitle', e.target.value)}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Manager</label>
            <input
              type="text"
              readOnly={!isEditing}
              style={styles.input}
              value={formData.managerName}
              onChange={(e) => handleInputChange('managerName', e.target.value)}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>System Privilege / Role</label>
            {isEditing ? (
              <select
                style={styles.select}
                value={formData.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
              >
                <option value="Employee">Employee (Standard View)</option>
                <option value="HR">HR / Administrator (Full Access)</option>
              </select>
            ) : (
              <input type="text" readOnly style={styles.input} value={formData.role === 'HR' ? 'HR / Administrator' : 'Employee'} />
            )}
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Date of Joining</label>
            <input
              type="date"
              readOnly={!isEditing}
              style={styles.input}
              value={formData.joiningDate}
              onChange={(e) => handleInputChange('joiningDate', e.target.value)}
            />
          </div>
        </div>
      )}

      {/* TAB 3: DOCUMENTS AUDITING */}
      {activeSubTab === 'Documents' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[
            { key: 'aadhar', name: 'Aadhar Card ID Proof' },
            { key: 'pan', name: 'PAN Card Proof' },
            { key: 'offerLetter', name: 'Signed Offer Letter Document' }
          ].map(doc => {
            const status = formData.documents[doc.key] || 'Pending';
            return (
              <div 
                key={doc.key}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px',
                  borderRadius: '8px',
                  border: `1px solid ${colors.border}`,
                  backgroundColor: darkMode ? '#111827' : '#FCFCFD',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
              >
                <div>
                  <strong style={{ display: 'block', fontSize: '14px', color: colors.text }}>{doc.name}</strong>
                  <span style={{ fontSize: '12px', color: colors.textMuted }}>
                    Status: <strong style={{ color: status === 'Verified' ? '#027A48' : status === 'Uploaded' ? '#2563EB' : '#B42318' }}>{status}</strong>
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleDocVerify(doc.key, 'Verified')}
                    style={{
                      backgroundColor: status === 'Verified' ? '#ECFDF3' : 'transparent',
                      color: '#027A48',
                      border: `1px solid ${status === 'Verified' ? '#D1FADF' : colors.border}`,
                      borderRadius: '6px',
                      padding: '6px 12px',
                      fontSize: '12px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <i className="bi bi-check-lg" style={{ marginRight: '4px' }}></i> Verify
                  </button>
                  <button
                    onClick={() => handleDocVerify(doc.key, 'Rejected')}
                    style={{
                      backgroundColor: status === 'Rejected' ? '#FEF3F2' : 'transparent',
                      color: '#B42318',
                      border: `1px solid ${status === 'Rejected' ? '#FEE4E2' : colors.border}`,
                      borderRadius: '6px',
                      padding: '6px 12px',
                      fontSize: '12px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <i className="bi bi-x-lg" style={{ marginRight: '4px' }}></i> Reject
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
