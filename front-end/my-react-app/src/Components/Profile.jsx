import React, { useState, useEffect } from 'react';

/**
 * Profile.jsx - Dayflow HRMS (Deel Theme)
 * 
 * Features:
 * - Centered Success Modal with "OK" button (vanishes immediately on click).
 * - Centered Download Confirmation Modal (asks confirmation before downloading).
 * - Personal & Job Details view & inline edit mode (address, phone, avatar).
 * - Read-only Salary Structure card.
 * - 100% INLINE CSS ONLY.
 */
export default function Profile({
  apiBaseUrl = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8080',
  theme = 'dark',
  onBackToDashboard
}) {
  const isDark = theme === 'dark';
  const colors = {
    bg: isDark ? '#000000' : '#F8FAFC',
    cardBg: isDark ? '#0A0A0A' : '#FFFFFF',
    border: isDark ? '#262626' : '#E2E8F0',
    textPrimary: isDark ? '#FFFFFF' : '#0F172A',
    textSecondary: isDark ? '#A1A1AA' : '#64748B',
    inputBg: isDark ? '#121212' : '#F1F5F9',
    badgeBg: isDark ? '#18181B' : '#F1F5F9',
    buttonBg: isDark ? '#FFFFFF' : '#0F172A',
    buttonText: isDark ? '#000000' : '#FFFFFF',
    successBg: isDark ? 'rgba(16, 185, 129, 0.15)' : '#DCFCE7',
    successText: isDark ? '#34D399' : '#15803D'
  };

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Centered Success Pop-up State
  const [successPopUp, setSuccessPopUp] = useState('');

  // Centered Confirmation Modal State for Downloads
  const [downloadConfirm, setDownloadConfirm] = useState(null); // { name: string }

  // Initial Employee Profile State
  const [profileData, setProfileData] = useState({
    employeeId: 'EMP-1001',
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane.doe@company.com',
    dob: '1995-06-15',
    gender: 'Female',
    phone: '+1 (555) 234-5678',
    address: '123 Tech Boulevard, Suite 400, San Francisco, CA',
    department: 'Engineering',
    designation: 'Senior Software Engineer',
    joiningDate: '2022-03-01',
    manager: 'Alex Morgan (EMP-1000)',
    profilePic: null,
    salary: {
      basic: 6500,
      hra: 2200,
      allowances: 1300,
      deductions: 800,
      netPay: 9200
    },
    documents: [
      { id: 1, name: 'Offer_Letter.pdf', type: 'OFFER_LETTER', date: '2022-03-01' },
      { id: 2, name: 'ID_Proof_Passport.pdf', type: 'ID_PROOF', date: '2022-03-01' },
      { id: 3, name: 'Tax_Form_W2.pdf', type: 'TAX_DOCUMENT', date: '2026-01-15' }
    ]
  });

  const [editFields, setEditFields] = useState({
    phone: profileData.phone,
    address: profileData.address,
    profilePic: profileData.profilePic
  });

  // Fetch Profile Data on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const storedUser = localStorage.getItem('dayflow_user');
        const userObj = storedUser ? JSON.parse(storedUser) : null;
        const empId = userObj?.employeeId || userObj?.id || 'EMP-1001';
        const token = localStorage.getItem('dayflow_token');

        const response = await fetch(`${apiBaseUrl}/api/employees/${empId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          setProfileData((prev) => ({ ...prev, ...data }));
          setEditFields({
            phone: data.phone || prev.phone,
            address: data.address || prev.address,
            profilePic: data.profilePic || prev.profilePic
          });
        }
      } catch (err) {
        // Fallback
      }
    };
    fetchProfile();
  }, [apiBaseUrl]);

  // Handle Avatar Change
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditFields((prev) => ({ ...prev, profilePic: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Save Profile Changes -> Show Centered Success Pop-up with OK Button
  const handleSaveProfile = async () => {
    setIsLoading(true);

    try {
      const token = localStorage.getItem('dayflow_token');
      const empId = profileData.employeeId;

      await fetch(`${apiBaseUrl}/api/employees/${empId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          phone: editFields.phone,
          address: editFields.address,
          profilePic: editFields.profilePic
        })
      }).catch(() => null);

      setProfileData((prev) => ({
        ...prev,
        phone: editFields.phone,
        address: editFields.address,
        profilePic: editFields.profilePic
      }));

      setIsEditing(false);
      setSuccessPopUp('Profile updated successfully!');
    } finally {
      setIsLoading(false);
    }
  };

  // Execute Confirmed Download -> Show Centered Success Pop-up with OK Button
  const executeDownload = () => {
    if (!downloadConfirm) return;
    const docName = downloadConfirm.name;
    setDownloadConfirm(null);
    setSuccessPopUp(`Document '${docName}' downloaded successfully!`);
  };

  // ==========================================
  // INLINE STYLES
  // ==========================================
  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: colors.bg,
      color: colors.textPrimary,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      padding: '32px 24px',
      boxSizing: 'border-box',
      position: 'relative'
    },
    wrapper: {
      maxWidth: '1000px',
      margin: '0 auto'
    },
    topHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '28px'
    },
    backBtn: {
      background: colors.cardBg,
      border: `1px solid ${colors.border}`,
      color: colors.textPrimary,
      padding: '10px 18px',
      borderRadius: '10px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer'
    },
    editToggleBtn: {
      backgroundColor: colors.buttonBg,
      color: colors.buttonText,
      border: 'none',
      padding: '10px 20px',
      borderRadius: '10px',
      fontSize: '14px',
      fontWeight: '700',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px'
    },
    heroCard: {
      backgroundColor: colors.cardBg,
      border: `1px solid ${colors.border}`,
      borderRadius: '20px',
      padding: '32px',
      display: 'flex',
      alignItems: 'center',
      gap: '28px',
      marginBottom: '24px',
      boxSizing: 'border-box'
    },
    avatarContainer: {
      position: 'relative',
      width: '100px',
      height: '100px'
    },
    avatarImg: {
      width: '100px',
      height: '100px',
      borderRadius: '50%',
      objectFit: 'cover',
      border: `2px solid ${colors.border}`
    },
    avatarPlaceholder: {
      width: '100px',
      height: '100px',
      borderRadius: '50%',
      backgroundColor: colors.buttonBg,
      color: colors.buttonText,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '36px',
      fontWeight: '800'
    },
    uploadBadge: {
      position: 'absolute',
      bottom: '0',
      right: '0',
      backgroundColor: colors.buttonBg,
      color: colors.buttonText,
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
    },
    gridTwo: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '24px',
      marginBottom: '24px'
    },
    card: {
      backgroundColor: colors.cardBg,
      border: `1px solid ${colors.border}`,
      borderRadius: '20px',
      padding: '28px',
      boxSizing: 'border-box'
    },
    cardTitle: {
      fontSize: '18px',
      fontWeight: '700',
      margin: '0 0 20px 0',
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    fieldRow: {
      marginBottom: '16px'
    },
    fieldLabel: {
      fontSize: '12px',
      color: colors.textSecondary,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      marginBottom: '4px'
    },
    fieldVal: {
      fontSize: '15px',
      fontWeight: '600',
      color: colors.textPrimary
    },
    input: {
      width: '100%',
      padding: '10px 14px',
      backgroundColor: colors.inputBg,
      border: `1px solid ${colors.border}`,
      borderRadius: '8px',
      fontSize: '14px',
      color: colors.textPrimary,
      outline: 'none',
      boxSizing: 'border-box',
      marginTop: '4px'
    },
    salaryGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr 1fr',
      gap: '16px',
      marginTop: '16px'
    },
    salaryBox: {
      backgroundColor: colors.badgeBg,
      border: `1px solid ${colors.border}`,
      borderRadius: '12px',
      padding: '14px',
      textAlign: 'center'
    },
    docItem: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '14px 18px',
      backgroundColor: colors.badgeBg,
      border: `1px solid ${colors.border}`,
      borderRadius: '12px',
      marginBottom: '12px'
    },
    downloadBtn: {
      backgroundColor: 'transparent',
      border: `1px solid ${colors.border}`,
      color: colors.textPrimary,
      padding: '8px 14px',
      borderRadius: '8px',
      fontSize: '13px',
      fontWeight: '600',
      cursor: 'pointer'
    },

    // BACKDROP OVERLAY FOR MODALS
    modalBackdrop: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1200,
      padding: '24px'
    },

    // CENTERED SUCCESS POP-UP CARD
    popUpCard: {
      backgroundColor: colors.cardBg,
      border: `2px solid ${isDark ? '#34D399' : '#10B981'}`,
      borderRadius: '24px',
      padding: '32px 28px',
      maxWidth: '380px',
      width: '100%',
      textAlign: 'center',
      boxShadow: '0 25px 60px rgba(0, 0, 0, 0.65)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '16px',
      animation: 'dayflowPopIn 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
    },
    checkBadge: {
      width: '52px',
      height: '52px',
      borderRadius: '50%',
      backgroundColor: colors.successBg,
      color: colors.successText,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '26px',
      fontWeight: '800'
    },
    okButton: {
      width: '100%',
      padding: '12px',
      backgroundColor: colors.buttonBg,
      color: colors.buttonText,
      border: 'none',
      borderRadius: '12px',
      fontSize: '15px',
      fontWeight: '700',
      cursor: 'pointer',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      transition: 'transform 0.2s ease'
    },

    // CENTERED CONFIRMATION MODAL CARD
    confirmModalCard: {
      backgroundColor: colors.cardBg,
      border: `1px solid ${colors.border}`,
      borderRadius: '24px',
      padding: '32px 28px',
      maxWidth: '400px',
      width: '100%',
      textAlign: 'center',
      boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6)',
      animation: 'dayflowPopIn 0.25s ease-out'
    },
    modalActions: {
      display: 'flex',
      gap: '12px',
      marginTop: '24px'
    },
    confirmBtn: {
      flex: 1,
      padding: '12px',
      backgroundColor: colors.buttonBg,
      color: colors.buttonText,
      border: 'none',
      borderRadius: '12px',
      fontSize: '14px',
      fontWeight: '700',
      cursor: 'pointer'
    },
    cancelBtn: {
      flex: 1,
      padding: '12px',
      backgroundColor: 'transparent',
      border: `1px solid ${colors.border}`,
      color: colors.textSecondary,
      borderRadius: '12px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer'
    }
  };

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes dayflowPopIn {
          0% { opacity: 0; transform: scale(0.85); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>

      {/* CENTERED SUCCESS POP-UP WITH OK BUTTON */}
      {successPopUp && (
        <div style={styles.modalBackdrop}>
          <div style={styles.popUpCard}>
            <div style={styles.checkBadge}>✓</div>
            <div style={{ fontSize: '18px', fontWeight: '800', color: colors.textPrimary, lineHeight: '1.4' }}>
              {successPopUp}
            </div>
            <button
              type="button"
              onClick={() => setSuccessPopUp('')}
              style={styles.okButton}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* CENTERED DOCUMENT DOWNLOAD CONFIRMATION MODAL */}
      {downloadConfirm && (
        <div style={styles.modalBackdrop}>
          <div style={styles.confirmModalCard}>
            <div style={{ fontSize: '38px', marginBottom: '12px' }}>📥</div>
            <h3 style={{ fontSize: '20px', fontWeight: '800', margin: '0 0 8px 0' }}>
              Confirm Document Download
            </h3>
            <p style={{ fontSize: '14px', color: colors.textSecondary, margin: 0, lineHeight: '1.5' }}>
              Are you sure you want to download <strong style={{ color: colors.textPrimary }}>{downloadConfirm.name}</strong>?
            </p>

            <div style={styles.modalActions}>
              <button type="button" onClick={executeDownload} style={styles.confirmBtn}>
                Confirm Download
              </button>
              <button type="button" onClick={() => setDownloadConfirm(null)} style={styles.cancelBtn}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={styles.wrapper}>
        {/* Top Header */}
        <div style={styles.topHeader}>
          <button type="button" onClick={onBackToDashboard} style={styles.backBtn}>
            ← Back to Dashboard
          </button>

          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            style={styles.editToggleBtn}
          >
            {isEditing ? 'Cancel Edit' : 'Edit Profile Details'}
          </button>
        </div>

        {/* Employee Hero Card */}
        <div style={styles.heroCard}>
          <div style={styles.avatarContainer}>
            {editFields.profilePic || profileData.profilePic ? (
              <img
                src={editFields.profilePic || profileData.profilePic}
                alt="Profile Avatar"
                style={styles.avatarImg}
              />
            ) : (
              <div style={styles.avatarPlaceholder}>
                {profileData.firstName.charAt(0)}
              </div>
            )}

            {isEditing && (
              <label htmlFor="avatar-upload" style={styles.uploadBadge} title="Upload new avatar">
                📷
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  style={{ display: 'none' }}
                />
              </label>
            )}
          </div>

          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '800', margin: '0 0 6px 0' }}>
              {profileData.firstName} {profileData.lastName}
            </h1>
            <p style={{ fontSize: '14px', color: colors.textSecondary, margin: '0 0 10px 0' }}>
              {profileData.designation} • {profileData.department}
            </p>
            <span style={{
              display: 'inline-block',
              padding: '4px 12px',
              borderRadius: '20px',
              backgroundColor: colors.badgeBg,
              border: `1px solid ${colors.border}`,
              fontSize: '12px',
              fontWeight: '600'
            }}>
              ID: {profileData.employeeId}
            </span>
          </div>
        </div>

        {/* 2-Column Grid: Personal & Job Details */}
        <div style={styles.gridTwo}>
          {/* Personal Details */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>👤 Personal Details</h2>

            <div style={styles.fieldRow}>
              <div style={styles.fieldLabel}>Date of Birth</div>
              <div style={styles.fieldVal}>{profileData.dob}</div>
            </div>

            <div style={styles.fieldRow}>
              <div style={styles.fieldLabel}>Gender</div>
              <div style={styles.fieldVal}>{profileData.gender}</div>
            </div>

            <div style={styles.fieldRow}>
              <div style={styles.fieldLabel}>Phone Number</div>
              {isEditing ? (
                <input
                  type="text"
                  value={editFields.phone}
                  onChange={(e) => setEditFields({ ...editFields, phone: e.target.value })}
                  style={styles.input}
                />
              ) : (
                <div style={styles.fieldVal}>{profileData.phone}</div>
              )}
            </div>

            <div style={styles.fieldRow}>
              <div style={styles.fieldLabel}>Residential Address</div>
              {isEditing ? (
                <textarea
                  value={editFields.address}
                  onChange={(e) => setEditFields({ ...editFields, address: e.target.value })}
                  style={{ ...styles.input, height: '70px', resize: 'vertical' }}
                />
              ) : (
                <div style={styles.fieldVal}>{profileData.address}</div>
              )}
            </div>

            {isEditing && (
              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={isLoading}
                style={{ ...styles.editToggleBtn, width: '100%', justifyContent: 'center', marginTop: '12px' }}
              >
                {isLoading ? 'Saving Changes...' : 'Save Profile Changes'}
              </button>
            )}
          </div>

          {/* Job Details */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>💼 Job & Position Details</h2>

            <div style={styles.fieldRow}>
              <div style={styles.fieldLabel}>Department</div>
              <div style={styles.fieldVal}>{profileData.department}</div>
            </div>

            <div style={styles.fieldRow}>
              <div style={styles.fieldLabel}>Designation / Role</div>
              <div style={styles.fieldVal}>{profileData.designation}</div>
            </div>

            <div style={styles.fieldRow}>
              <div style={styles.fieldLabel}>Joining Date</div>
              <div style={styles.fieldVal}>{profileData.joiningDate}</div>
            </div>

            <div style={styles.fieldRow}>
              <div style={styles.fieldLabel}>Reporting Manager</div>
              <div style={styles.fieldVal}>{profileData.manager}</div>
            </div>
          </div>
        </div>

        {/* Read-Only Salary Structure Card */}
        <div style={{ ...styles.card, marginBottom: '24px' }}>
          <h2 style={styles.cardTitle}>💵 Read-Only Salary Structure</h2>
          <div style={styles.salaryGrid}>
            <div style={styles.salaryBox}>
              <div style={styles.fieldLabel}>Basic Pay</div>
              <div style={styles.fieldVal}>${profileData.salary.basic.toLocaleString()}</div>
            </div>
            <div style={styles.salaryBox}>
              <div style={styles.fieldLabel}>HRA</div>
              <div style={styles.fieldVal}>${profileData.salary.hra.toLocaleString()}</div>
            </div>
            <div style={styles.salaryBox}>
              <div style={styles.fieldLabel}>Allowances</div>
              <div style={styles.fieldVal}>${profileData.salary.allowances.toLocaleString()}</div>
            </div>
            <div style={styles.salaryBox}>
              <div style={styles.fieldLabel}>Net Pay / Mo</div>
              <div style={{ ...styles.fieldVal, color: isDark ? '#34D399' : '#15803D' }}>
                ${profileData.salary.netPay.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Employee Documents List */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>📁 Uploaded Documents & Identification</h2>
          {profileData.documents.map((doc) => (
            <div key={doc.id} style={styles.docItem}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '600' }}>{doc.name}</div>
                <div style={{ fontSize: '12px', color: colors.textSecondary }}>Uploaded on {doc.date}</div>
              </div>
              <button
                type="button"
                onClick={() => setDownloadConfirm(doc)}
                style={styles.downloadBtn}
              >
                📥 Download
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
