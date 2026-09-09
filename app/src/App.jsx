import React, { useState } from 'react';
import { collection, addDoc, getDocs, query, serverTimestamp, doc, updateDoc, where, deleteDoc } from "firebase/firestore";
import { db } from './firebase';
import './App.css';

const COLLEGE_NAME = "Priyadarshini Bhagwati College of Engineering, Nagpur (AUTONOMOUS)";
const COLLEGE_ADDRESS = "Umred Road, Harpur Nagar, Taj Bagh, Nagpur, Maharashtra, Bharat";

const TRACK_DIVISIONS = [
  {
    id: 'Technical Architecture',
    title: 'Technical Architecture Lead',
    icon: '⚡',
    desc: 'High-performance backend systems, distributed cloud architecture, microservices, and database optimization.',
    tags: ['Go', 'Rust', 'Docker', 'Kubernetes', 'gRPC', 'PostgreSQL']
  },
  {
    id: 'AI & Data Science',
    title: 'AI & Data Science Division',
    icon: '🤖',
    desc: 'Autonomous agent frameworks, deep learning models, computer vision, PyTorch pipelines, and RAG architectures.',
    tags: ['PyTorch', 'Python', 'LLMs', 'OpenCV', 'TensorFlow', 'LangChain']
  },
  {
    id: 'Cybersecurity',
    title: 'Cybersecurity & Offensive Security',
    icon: '🛡️',
    desc: 'Ethical hacking, binary exploitation, network cryptography, CTF competitions, and cloud DevSecOps.',
    tags: ['Kali Linux', 'Python', 'WireShark', 'Cryptography', 'Reverse Engineering']
  },
  {
    id: 'Open Source Development',
    title: 'Open Source & Full-Stack Lab',
    icon: '🌐',
    desc: 'Modern web & mobile applications, open-source library contributions, React/Next.js, and Web3/crypto tooling.',
    tags: ['TypeScript', 'React', 'Flutter', 'Node.js', 'GraphQL', 'Tailwind']
  },
  {
    id: 'Executive Operations',
    title: 'Executive Operations (VP / Lead)',
    icon: '💼',
    desc: 'Strategic club management, hackathon event architecture, corporate sponsorships, branding, and lead execution.',
    tags: ['Project Management', 'Public Speaking', 'Event Design', 'Outreach']
  }
];

const POPULAR_SKILLS = [
  'Python', 'TypeScript', 'C++', 'Rust', 'Go', 'React', 'PyTorch',
  'Docker', 'Kubernetes', 'Linux', 'Node.js', 'Firebase', 'Flutter',
  'PostgreSQL', 'Git', 'Figma', 'Solidity'
];

const App = () => {
  const [viewMode, setViewMode] = useState('student'); // 'student' | 'admin' | 'track'
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
      fullName: '',
      gender: 'Male',
      email: '',
      phone: '',
      studentId: '',
      year: '',
      branch: '',
      track: 'AI & Data Science',
      skills: ['Python', 'React'],
      experienceLevel: 'Intermediate',
      statement: '',
      linkedin: '',
      github: '',
      portfolio: '',
      bestProject: ''
    });

    const [customSkillInput, setCustomSkillInput] = useState('');
    const [errors, setErrors] = useState({});
    const [status, setStatus] = useState({ type: 'idle', message: '' });
    const [submissionReceipt, setSubmissionReceipt] = useState(null);
    const [copiedToken, setCopiedToken] = useState(false);

    // Tracker state
    const [trackerToken, setTrackerToken] = useState('');
    const [trackedApplication, setTrackedApplication] = useState(null);
    const [trackerError, setTrackerError] = useState('');
    const [trackerLoading, setTrackerLoading] = useState(false);

    // Admin state
    const [adminAuth, setAdminAuth] = useState(false);
    const [adminPasswordInput, setAdminPasswordInput] = useState('');
    const [adminAuthError, setAdminAuthError] = useState('');
    const [adminApplicants, setAdminApplicants] = useState([]);
    const [adminLoading, setAdminLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterDivision, setFilterDivision] = useState('All');
    const [filterGender, setFilterGender] = useState('All');
    const [filterStatus, setFilterStatus] = useState('All');

  // Save candidate evaluation details (Live Database update)
  const handleUpdateCandidate = async (e) => {
    e.preventDefault();
    if (!selectedCandidate) return;

    try {
      setStatus({ type: 'loading', message: 'Saving evaluation parameters...' });
      const docRef = doc(db, "applicants", selectedCandidate.id);
      
      const updates = {
        status: candidateStatusUpdate,
        adminRemarks: adminNotes
      };

      await updateDoc(docRef, updates);
      
      setAdminApplicants(prev => prev.map(a => a.id === selectedCandidate.id ? { ...a, ...updates } : a));
      setStatus({ type: 'idle', message: '' });
      alert("Candidate dossier updated successfully!");
    } catch (err) {
      console.error("Evaluation save error: ", err);
      setStatus({ type: 'error', message: 'Failed to save changes.' });
    }
  };

  // Field change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // URL auto-fixer on blur
  const handleUrlBlur = (e) => {
    const { name, value } = e.target;
    if (value && !value.startsWith('http://') && !value.startsWith('https://')) {
      const formatted = `https://${value}`;
      setFormData(prev => ({ ...prev, [name]: formatted }));
    }
  };

  // Skill matrix toggle
  const toggleSkill = (skill) => {
    setFormData(prev => {
      const exists = prev.skills.includes(skill);
      const updated = exists 
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill];
      return { ...prev, skills: updated };
    });
  };

  const handleAddCustomSkill = (e) => {
    e.preventDefault();
    const trimmed = customSkillInput.trim();
    if (trimmed && !formData.skills.includes(trimmed)) {
      setFormData(prev => ({ ...prev, skills: [...prev.skills, trimmed] }));
      setCustomSkillInput('');
    }
  };

  // Step Validation
  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.fullName.trim()) newErrors.fullName = 'Full legal name is required';
      if (!formData.gender) newErrors.gender = 'Please select your gender';

      if (!formData.email.trim()) {
        newErrors.email = 'University email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email format';
      }

      if (!formData.phone.trim()) {
        newErrors.phone = 'Contact number is required';
      }

      if (!formData.studentId.trim()) {
        newErrors.studentId = 'Student ID / Roll No. is required';
      }

      if (!formData.year) newErrors.year = 'Academic year selection is required';
      if (!formData.branch.trim()) newErrors.branch = 'Branch of study is required';
    }

    if (step === 2) {
      if (!formData.track) newErrors.track = 'Please select a target division';
      if (formData.skills.length === 0) newErrors.skills = 'Select at least one skill or technology';
      if (!formData.statement.trim() || formData.statement.trim().length < 20) {
        newErrors.statement = 'Please describe your interest in 20+ characters';
      }
    }

    if (step === 3) {
      if (!formData.linkedin.trim()) {
        newErrors.linkedin = 'LinkedIn protocol link is required';
      }
      if (!formData.github.trim()) {
        newErrors.github = 'GitHub protocol link is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Form Submit Handler with Duplicate Prevention
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(3)) return;

    setStatus({ type: 'loading', message: 'Checking for prior registrations & encrypting payload...' });

    try {
      // 1. Prevent duplicate submissions by Student ID or Email
      const emailQuery = query(collection(db, "applicants"), where("email", "==", formData.email.trim()));
      const studentIdQuery = query(collection(db, "applicants"), where("studentId", "==", formData.studentId.trim()));
      
      const [emailSnap, idSnap] = await Promise.all([getDocs(emailQuery), getDocs(studentIdQuery)]);
      
      if (!emailSnap.empty || !idSnap.empty) {
        setStatus({
          type: 'error',
          message: 'Registration Blocked: An application with this Student ID or Email already exists in our database. Use the Tracking Portal to view application status.'
        });
        return;
      }

      // 2. Generate reference code
      const randomHash = Math.random().toString(36).substring(2, 8).toUpperCase();
      const refCode = `CEC-2026-${randomHash}`;

      const applicantPayload = {
        ...formData,
        applicationId: refCode,
        college: COLLEGE_NAME,
        status: 'Under Review', // Initial review state
        adminRemarks: 'Awaiting initial profile and statement evaluation.',
        submittedAt: serverTimestamp(),
        submittedAtFormatted: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
      };

      await addDoc(collection(db, "applicants"), applicantPayload);

      setSubmissionReceipt(applicantPayload);
      setStatus({ type: 'success', message: 'Application secured successfully!' });
    } catch (error) {
      console.error("Submission Error: ", error);
      setStatus({ 
        type: 'error', 
        message: 'Connection to Firestore database failed. Please verify your internet connection or credentials.' 
      });
    }
  };

  // Copy reference token
  const handleCopyToken = () => {
    if (submissionReceipt?.applicationId) {
      navigator.clipboard.writeText(submissionReceipt.applicationId);
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2500);
    }
  };

  // Download printable JSON/text receipt
  const handleDownloadPass = (receiptToDownload = submissionReceipt) => {
    if (!receiptToDownload) return;
    const textData = `====================================================================
${COLLEGE_NAME}
CORE ENGINEERING CLUB — RECRUITMENT RECEIPT 2026
====================================================================
APPLICATION TOKEN: ${receiptToDownload.applicationId}
CANDIDATE NAME:    ${receiptToDownload.fullName}
GENDER:            ${receiptToDownload.gender}
UNIVERSITY EMAIL:  ${receiptToDownload.email}
CONTACT PHONE:     ${receiptToDownload.phone}
STUDENT ID / ROLL: ${receiptToDownload.studentId}
ACADEMIC YEAR:     Year ${receiptToDownload.year} (${receiptToDownload.branch})
TARGET DIVISION:   ${receiptToDownload.track}
EXPERIENCE TIER:   ${receiptToDownload.experienceLevel}
SKILL MATRIX:      ${receiptToDownload.skills.join(', ')}
GITHUB PROTOCOL:   ${receiptToDownload.github}
LINKEDIN PROTOCOL: ${receiptToDownload.linkedin}
STATUS:            ${receiptToDownload.status || 'PENDING REVIEW'}
ADMIN COMMENTS:    ${receiptToDownload.adminRemarks || 'None'}
ADDRESS:           ${COLLEGE_ADDRESS}
====================================================================
NOTICE: Keep this token safe for technical interview verification.
`;
    const blob = new Blob([textData], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${receiptToDownload.applicationId}_Receipt.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Get Initials for Avatar
  const getInitials = (name) => {
    if (!name.trim()) return 'CE';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  // Search Application Tracking System
  const handleTrackApplication = async (e) => {
    e.preventDefault();
    const token = trackerToken.trim().toUpperCase();
    if (!token) {
      setTrackerError('Please enter a valid Application Token.');
      return;
    }

    setTrackerLoading(true);
    setTrackerError('');
    setTrackedApplication(null);

    try {
      const q = query(collection(db, "applicants"), where("applicationId", "==", token));
      const snap = await getDocs(q);

      if (snap.empty) {
        setTrackerError('No application found matching this token. Please check the ID (e.g. CEC-2026-XXXXXX).');
      } else {
        const docData = snap.docs[0].data();
        setTrackedApplication(docData);
      }
    } catch (err) {
      console.error("Tracking fetch error: ", err);
      setTrackerError('Failed to establish database connection. Please try again.');
    } finally {
      setTrackerLoading(false);
    }
  };

  // Admin login handler
  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminPasswordInput === 'admin123' || adminPasswordInput === 'pbcoe2026') {
      setAdminAuth(true);
      setAdminAuthError('');
      fetchAdminData();
    } else {
      setAdminAuthError('Invalid Admin Access Key. Default: admin123');
    }
  };

  // Fetch all applicants for Admin
  const fetchAdminData = async () => {
    setAdminLoading(true);
    try {
      const q = query(collection(db, "applicants"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      }));
      setAdminApplicants(data);
    } catch (err) {
      console.error("Admin fetch error:", err);
    } finally {
      setAdminLoading(false);
    }
  };

  // Admin select candidate dossier details
  const handleOpenCandidateDetails = (candidate) => {
    setSelectedCandidate(candidate);
    setCandidateStatusUpdate(candidate.status || 'Under Review');
    setAdminNotes(candidate.adminRemarks || '');
  };

  // Save candidate evaluation details (Live Database update)
  // Delete Candidate (Admin Only)
  const handleDeleteCandidate = async (id) => {
    if (!window.confirm("CRITICAL ACTION: Are you sure you want to permanently delete this candidate's dossier from the secure database? This cannot be undone.")) return;

    try {
      setStatus({ type: 'loading', message: 'Purging record from database...' });
      await deleteDoc(doc(db, "applicants", id));
      
      setAdminApplicants(prev => prev.filter(a => a.id !== id));
      if (selectedCandidate?.id === id) setSelectedCandidate(null);
      
      setStatus({ type: 'idle', message: '' });
      alert("Record successfully purged.");
    } catch (err) {
      console.error("Delete error: ", err);
      setStatus({ type: 'error', message: 'Failed to delete record. Verify Firestore permissions.' });
    }
  };

  const handleContactCandidate = (candidate) => {
    const subject = encodeURIComponent(`CEC 2026 Recruitment: Update for ${candidate.fullName}`);
    const body = encodeURIComponent(`Dear ${candidate.fullName},\n\nThis is an update regarding your application for the Core Engineering Club (2026) at PBCOE.\n\nYour current status is: ${candidate.status}\n\nRemarks: ${candidate.adminRemarks}\n\nPlease check the tracking portal with your token: ${candidate.applicationId}\n\nBest regards,\nCEC Recruitment Team`);
    window.location.href = `mailto:${candidate.email}?subject=${subject}&body=${body}`;
  };

  const handleCallCandidate = (phone) => {
    window.location.href = `tel:${phone}`;
  };

  // Export to Excel / CSV
  const handleExportToCSV = () => {
    if (adminApplicants.length === 0) {
      alert("No applicant records available to export!");
      return;
    }

    const headers = [
      "Application Token", "Full Name", "Gender", "Email", "Phone", 
      "Roll No / Student ID", "Academic Year", "Branch", "Target Division", 
      "Experience Tier", "Skills", "GitHub", "LinkedIn", "Portfolio", "Status", "Admin Comments", "Submitted Date"
    ];

    const rows = adminApplicants.map(app => [
      `"${app.applicationId || ''}"`,
      `"${app.fullName || ''}"`,
      `"${app.gender || ''}"`,
      `"${app.email || ''}"`,
      `"${app.phone || ''}"`,
      `"${app.studentId || ''}"`,
      `"Year ${app.year || ''}"`,
      `"${app.branch || ''}"`,
      `"${app.track || ''}"`,
      `"${app.experienceLevel || ''}"`,
      `"${(app.skills || []).join('; ')}"`,
      `"${app.github || ''}"`,
      `"${app.linkedin || ''}"`,
      `"${app.portfolio || ''}"`,
      `"${app.status || 'Under Review'}"`,
      `"${(app.adminRemarks || '').replace(/"/g, '""')}"`,
      `"${app.submittedAtFormatted || new Date().toLocaleDateString()}"`
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `PBCOE_Club_Applicants_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered Admin List
  const filteredApplicants = adminApplicants.filter(app => {
    const matchesSearch = 
      (app.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.applicationId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.studentId || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDiv = filterDivision === 'All' || app.track === filterDivision;
    const matchesGender = filterGender === 'All' || app.gender === filterGender;
    const matchesStatus = filterStatus === 'All' || app.status === filterStatus;

    return matchesSearch && matchesDiv && matchesGender && matchesStatus;
  });

  return (
    <div className="app-wrapper">
      {/* Brand Top Header */}
      <header className="brand-header">
        <div className="top-bar">
          <div className="logo-block" style={{cursor: 'pointer'}} onClick={() => { setViewMode('student'); setCurrentStep(1); }}>
            <div className="logo-icon">⚡</div>
            <div>
              <div className="college-header-tag">{COLLEGE_NAME}</div>
              <div className="logo-title">Core Engineering Club</div>
              <div className="logo-subtitle">2026 Autonomous Systems & Labs</div>
            </div>
          </div>

          <div style={{display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap'}}>
            <button 
              onClick={() => setViewMode(prev => prev === 'track' ? 'student' : 'track')}
              className={`admin-toggle-btn ${viewMode === 'track' ? 'active-tab' : ''}`}
            >
              🔍 Track Application
            </button>

            <button 
              onClick={() => setViewMode(prev => prev === 'admin' ? 'student' : 'admin')}
              className={`admin-toggle-btn ${viewMode === 'admin' ? 'active-tab' : ''}`}
            >
              {viewMode === 'admin' ? '📋 Application Form' : '🔐 Admin Portal'}
            </button>

            <div className="status-badge">
              <span className="pulse-dot"></span>
              RECRUITMENT PROTOCOL ACTIVE
            </div>
          </div>
        </div>

        {viewMode === 'student' && (
          <div className="hero-banner">
            <h1>Engineers & Innovators, Apply Here</h1>
            <p>Join the premier technical leadership division at <strong>{COLLEGE_NAME}</strong>. Select your specialization track, register your technical dossier, and lock in your recruitment slot for 2026.</p>
            <div className="college-address-bar">📍 {COLLEGE_ADDRESS}</div>
          </div>
        )}
      </header>

      {/* 🔍 APPLICATION TRACKING VIEW */}
      {viewMode === 'track' && (
        <div className="tracker-container success-container">
          <div className="form-panel" style={{textAlign: 'center', padding: '3rem 2rem'}}>
            <div className="panel-title" style={{justifyContent: 'center', marginBottom: '0.5rem'}}>
              <span>🔍 Application Status Lookup System</span>
            </div>
            <p className="panel-desc">Enter your application protocol code to check screening results, comments, and schedule slots.</p>

            <form onSubmit={handleTrackApplication} className="tracker-form" style={{maxWidth: '480px', margin: '0 auto'}}>
              <div className="input-group" style={{marginBottom: '1rem'}}>
                <input 
                  type="text" 
                  placeholder="Enter Token (e.g. CEC-2026-XXXXXX)..."
                  value={trackerToken}
                  onChange={e => setTrackerToken(e.target.value)}
                  className="input-field"
                  style={{textAlign: 'center', textTransform: 'uppercase', fontSize: '1.1rem', letterSpacing: '0.05em'}}
                />
              </div>
              {trackerError && <div className="field-error" style={{marginBottom: '1rem'}}>{trackerError}</div>}
              <button type="submit" className="btn-primary" style={{width: '100%', justifyContent: 'center'}} disabled={trackerLoading}>
                {trackerLoading ? 'Interrogating database...' : 'Verify Token & Fetch Dossier Status'}
              </button>
            </form>

            {/* Display Tracked Application Result */}
            {trackedApplication && (
              <div className="tracker-result-card" style={{marginTop: '2.5rem', textAlign: 'left', animation: 'fadeUp 0.4s ease'}}>
                <div className="tracker-card-header" style={{display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem', marginBottom: '1.25rem'}}>
                  <div>
                    <h3 style={{fontFamily: 'var(--font-display)', fontSize: '1.25rem'}}>{trackedApplication.fullName}</h3>
                    <code style={{color: 'var(--accent-cyan)'}}>{trackedApplication.applicationId}</code>
                  </div>
                  <span className={`status-badge-custom ${trackedApplication.status ? trackedApplication.status.toLowerCase().replace(/\s+/g, '-') : 'under-review'}`}>
                    {trackedApplication.status || 'Under Review'}
                  </span>
                </div>

                <div className="tracker-timeline" style={{marginBottom: '2rem'}}>
                  <div className="timeline-title">Application Progress Pipeline</div>
                  <div className="timeline-steps" style={{gridTemplateColumns: 'repeat(4, 1fr)'}}>
                    <div className="timeline-item active-phase">
                      <div className="phase-num">✓ STAGE 1</div>
                      <div className="phase-name">Submitted</div>
                      <div className="phase-desc">Form registration completed</div>
                    </div>
                    <div className={`timeline-item ${trackedApplication.status !== 'Declined' ? 'active-phase' : ''}`}>
                      <div className="phase-num">{trackedApplication.status === 'Under Review' ? '⏳ STAGE 2' : '✓ STAGE 2'}</div>
                      <div className="phase-name">Profile Review</div>
                      <div className="phase-desc">Statement & link screening</div>
                    </div>
                    <div className={`timeline-item ${['Shortlisted for Phase 2', 'Interview Scheduled', 'Selected & Inducted'].includes(trackedApplication.status) ? 'active-phase' : ''}`}>
                      <div className="phase-num">
                        {trackedApplication.status === 'Shortlisted for Phase 2' ? '⏳ STAGE 3' : 
                         ['Interview Scheduled', 'Selected & Inducted'].includes(trackedApplication.status) ? '✓ STAGE 3' : 'STAGE 3'}
                      </div>
                      <div className="phase-name">Technical Task</div>
                      <div className="phase-desc">Hackathon / domain sprint</div>
                    </div>
                    <div className={`timeline-item ${['Interview Scheduled', 'Selected & Inducted'].includes(trackedApplication.status) ? 'active-phase' : ''}`}>
                      <div className="phase-num">
                        {trackedApplication.status === 'Interview Scheduled' ? '⏳ STAGE 4' :
                         trackedApplication.status === 'Selected & Inducted' ? '✓ STAGE 4' : 'STAGE 4'}
                      </div>
                      <div className="phase-name">Final Induction</div>
                      <div className="phase-desc">Interview & onboarding</div>
                    </div>
                  </div>
                </div>

                <div className="token-explanation-box">
                  <strong>💬 Officer Remarks / Feedback:</strong>
                  <p>{trackedApplication.adminRemarks || 'Your application profile is currently being screened by our technical leads. No special comments yet.'}</p>
                </div>

                <div className="success-actions" style={{justifyContent: 'flex-start'}}>
                  <button onClick={() => handleDownloadPass(trackedApplication)} className="btn-primary">
                    📥 Download Candidate Pass
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 🔐 ADMIN PORTAL VIEW */}
       {viewMode === 'admin' ? (
         <div className="admin-container">
        <div className="admin-container">
          {!adminAuth ? (
            <div className="admin-login-card">
              <h3>🔐 Admin Portal Authentication</h3>
              <p>Enter the administrator key to access student applications and export Excel records.</p>
              <form onSubmit={handleAdminLogin} className="admin-login-form">
                <input 
                  type="password" 
                  placeholder="Enter Admin Password (default: admin123)..."
                  value={adminPasswordInput}
                  onChange={e => setAdminPasswordInput(e.target.value)}
                  className="input-field"
                />
                {adminAuthError && <div className="field-error">{adminAuthError}</div>}
                <button type="submit" className="btn-primary" style={{marginTop: '0.5rem', justifyContent: 'center'}}>
                  Unlock Admin Dashboard →
                </button>
              </form>
            </div>
          ) : (
            <div className="admin-dashboard">
              <div className="admin-header-row">
                <div>
                  <h2>Student Applications Management Portal</h2>
                  <p>Real-time candidate records for Priyadarshini Bhagwati College of Engineering.</p>
                </div>
                <div style={{display: 'flex', gap: '0.75rem'}}>
                  <button onClick={fetchAdminData} className="btn-secondary">
                    🔄 Refresh Data
                  </button>
                  <button onClick={handleExportToCSV} className="btn-primary" style={{background: 'linear-gradient(135deg, var(--accent-emerald), #059669)'}}>
                    📊 Download Excel / CSV Sheet ({adminApplicants.length})
                  </button>
                </div>
              </div>

              {/* Admin Metrics Bar */}
              <div className="admin-metrics-row">
                <div className="metric-box">
                  <div className="metric-val">{adminApplicants.length}</div>
                  <div className="metric-lbl">Total Candidates</div>
                </div>
                <div className="metric-box">
                  <div className="metric-val">
                    {adminApplicants.filter(a => a.gender === 'Male').length} / {adminApplicants.filter(a => a.gender === 'Female').length}
                  </div>
                  <div className="metric-lbl">Male / Female Candidates</div>
                </div>
                <div className="metric-box">
                  <div className="metric-val">
                    {adminApplicants.filter(a => a.status === 'Selected & Inducted').length}
                  </div>
                  <div className="metric-lbl">Selected & Inducted</div>
                </div>
              </div>

              {/* Search & Filter Toolbar */}
              <div className="admin-filter-bar">
                <input 
                  type="text" 
                  placeholder="🔍 Search name, token, roll no..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="input-field"
                  style={{maxWidth: '300px'}}
                />

                <select 
                  value={filterDivision} 
                  onChange={e => setFilterDivision(e.target.value)}
                  className="input-field"
                  style={{maxWidth: '200px'}}
                >
                  <option value="All">All Divisions</option>
                  {TRACK_DIVISIONS.map(d => (
                    <option key={d.id} value={d.id}>{d.title}</option>
                  ))}
                </select>

                <select 
                  value={filterGender} 
                  onChange={e => setFilterGender(e.target.value)}
                  className="input-field"
                  style={{maxWidth: '150px'}}
                >
                  <option value="All">All Genders</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>

                <select 
                  value={filterStatus} 
                  onChange={e => setFilterStatus(e.target.value)}
                  className="input-field"
                  style={{maxWidth: '180px'}}
                >
                  <option value="All">All Statuses</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Shortlisted for Phase 2">Shortlisted (Stage 2)</option>
                  <option value="Interview Scheduled">Interview Scheduled</option>
                  <option value="Selected & Inducted">Selected & Inducted</option>
                  <option value="Declined">Declined</option>
                </select>
              </div>

              {/* Applications Data Table */}
              {adminLoading ? (
                <div className="loading-box">
                  <div className="cyber-spinner"></div>
                  <div>Loading candidate records from Firestore...</div>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Token</th>
                        <th>Candidate Name</th>
                        <th>Gender</th>
                        <th>Roll No.</th>
                        <th>Email & Phone</th>
                        <th>Status</th>
                        <th>Division</th>
                        <th>Skills</th>
                        <th>Dossier Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredApplicants.length > 0 ? (
                        filteredApplicants.map(app => (
                          <tr key={app.id}>
                            <td>
                              <span className="token-tag">{app.applicationId || app.id.slice(0, 8)}</span>
                            </td>
                            <td>
                              <strong>{app.fullName}</strong>
                            </td>
                            <td>
                              <span className={`gender-badge ${app.gender === 'Female' ? 'female' : 'male'}`}>
                                {app.gender || 'N/A'}
                              </span>
                            </td>
                            <td><code>{app.studentId}</code></td>
                            <td>
                              <div>{app.email}</div>
                              <div style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>{app.phone}</div>
                            </td>
                            <td>
                              <span className={`status-badge-custom ${app.status ? app.status.toLowerCase().replace(/\s+/g, '-') : 'under-review'}`}>
                                {app.status || 'Under Review'}
                              </span>
                            </td>
                            <td><strong style={{color: 'var(--accent-cyan)'}}>{app.track}</strong></td>
                            <td>
                              <div className="table-skills-wrap">
                                {(app.skills || []).slice(0, 3).map(s => (
                                  <span key={s} className="dossier-skill-tag">{s}</span>
                                ))}
                              </div>
                            </td>
                            <td>
                              <button 
                                onClick={() => handleOpenCandidateDetails(app)}
                                className="table-link-btn"
                                style={{background: 'rgba(0, 242, 254, 0.1)', borderColor: 'var(--accent-cyan)', color: 'var(--accent-cyan)', fontWeight: '600'}}
                              >
                                Review Dossier
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="9" style={{textAlign: 'center', padding: '2rem', color: 'var(--text-muted)'}}>
                            No applicant records found matching your filters.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* CANDIDATE EVALUATION DOSSIER MODAL */}
              {selectedCandidate && (
                <div className="admin-modal-overlay">
                  <div className="admin-modal-card">
                    <div className="modal-header">
                      <h3>Review Candidate Technical Dossier</h3>
                      <button onClick={() => setSelectedCandidate(null)} className="modal-close-btn">&times;</button>
                    </div>

                    <div className="modal-body-grid">
                      {/* Left: Complete student specs */}
                      <div className="student-profile-specs">
                        <div className="profile-spec-row">
                          <span>Name:</span> <strong>{selectedCandidate.fullName}</strong>
                        </div>
                        <div className="profile-spec-row">
                          <span>Gender:</span> <strong>{selectedCandidate.gender}</strong>
                        </div>
                        <div className="profile-spec-row">
                          <span>Student ID / Roll:</span> <code>{selectedCandidate.studentId}</code>
                        </div>
                        <div className="profile-spec-row">
                          <span>Academic Node:</span> <strong>Year {selectedCandidate.year} ({selectedCandidate.branch})</strong>
                        </div>
                        <div className="profile-spec-row">
                          <span>University Email:</span> <strong>{selectedCandidate.email}</strong>
                        </div>
                        <div className="profile-spec-row">
                          <span>Contact Phone:</span> <strong>{selectedCandidate.phone}</strong>
                        </div>
                        <div className="profile-spec-row">
                          <span>Target Division:</span> <strong style={{color: 'var(--accent-cyan)'}}>{selectedCandidate.track}</strong>
                        </div>
                        <div className="profile-spec-row">
                          <span>Experience Tier:</span> <strong style={{color: 'var(--accent-amber)'}}>{selectedCandidate.experienceLevel}</strong>
                        </div>

                        <div className="modal-section-title">Technical Skill Matrix</div>
                        <div className="skills-wrap" style={{margin: '0.5rem 0 1rem 0'}}>
                          {(selectedCandidate.skills || []).map(s => (
                            <span key={s} className="skill-chip selected">{s}</span>
                          ))}
                        </div>

                        <div className="modal-section-title">Statement of Purpose</div>
                        <blockquote className="sop-blockquote">{selectedCandidate.statement}</blockquote>

                        {selectedCandidate.bestProject && (
                          <>
                            <div className="modal-section-title">Project Highlight</div>
                            <blockquote className="sop-blockquote" style={{borderLeftColor: 'var(--accent-emerald)'}}>{selectedCandidate.bestProject}</blockquote>
                          </>
                        )}

                        <div className="modal-section-title">Proof of Work Links</div>
                        <div style={{display: 'flex', gap: '0.75rem', marginTop: '0.5rem'}}>
                          {selectedCandidate.github && (
                            <a href={selectedCandidate.github} target="_blank" rel="noreferrer" className="btn-secondary" style={{padding: '0.5rem 1rem', fontSize: '0.8rem'}}>
                              GitHub Profile 🔗
                            </a>
                          )}
                          {selectedCandidate.linkedin && (
                            <a href={selectedCandidate.linkedin} target="_blank" rel="noreferrer" className="btn-secondary" style={{padding: '0.5rem 1rem', fontSize: '0.8rem'}}>
                              LinkedIn Profile 🔗
                            </a>
                          )}
                          {selectedCandidate.portfolio && (
                            <a href={selectedCandidate.portfolio} target="_blank" rel="noreferrer" className="btn-secondary" style={{padding: '0.5rem 1rem', fontSize: '0.8rem'}}>
                              Portfolio 🔗
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Right: Evaluator Controls */}
                      <form onSubmit={handleUpdateCandidate} className="evaluator-control-panel">
                        <h4>Evaluation Panel</h4>
                        <p style={{fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1.25rem'}}>Set screening status and write custom candidate schedule remarks.</p>

                        <div className="input-group" style={{marginBottom: '1rem'}}>
                          <label className="input-label">Set Application Status</label>
                          <select 
                            value={candidateStatusUpdate}
                            onChange={e => setCandidateStatusUpdate(e.target.value)}
                            className="input-field"
                          >
                            <option value="Under Review">Under Review ⏳</option>
                            <option value="Shortlisted for Phase 2">Shortlisted for Phase 2 🚀</option>
                            <option value="Interview Scheduled">Interview Scheduled 📅</option>
                            <option value="Selected & Inducted">Selected & Inducted 🎉</option>
                            <option value="Declined">Declined ❌</option>
                          </select>
                        </div>

                        <div className="input-group" style={{marginBottom: '1.5rem'}}>
                          <label className="input-label">Admin Remarks / Schedule Details</label>
                          <textarea
                            value={adminNotes}
                            onChange={e => setAdminNotes(e.target.value)}
                            placeholder="Write schedule times, lab numbers, hackday links, or interview panel slots to display on the student tracking portal..."
                            className="input-field"
                            style={{minHeight: '120px', fontSize: '0.85rem'}}
                          ></textarea>
                        </div>

                        <button type="submit" className="btn-primary" style={{width: '100%', justifyContent: 'center'}}>
                          Save Dossier Evaluation
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              )}
            </div>
         </div>
       ) : (
         <div>
        <div>
          {viewMode === 'student' && (
            <>
              {/* SUCCESS RECEIPT VIEW */}
              {status.type === 'success' && submissionReceipt ? (
                <div className="success-container">
                  <div className="success-card">
                    <div className="success-icon-wrap">
                      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                      </svg>
                    </div>

                    <div className="success-header">
                      <h2>Application Secured & Registered</h2>
                      <p>Welcome to the Core Engineering Club 2026 queue, <strong style={{color: 'var(--text-main)'}}>{submissionReceipt.fullName}</strong>.</p>
                    </div>

                    {/* Clear Token Instructions */}
                    <div className="token-banner">
                      <div>
                        <div className="token-label">Protocol Access Token</div>
                        <div className="token-value">{submissionReceipt.applicationId}</div>
                      </div>
                      <button onClick={handleCopyToken} className="token-copy-btn">
                        {copiedToken ? '✓ Copied to Clipboard' : '📋 Copy Token'}
                      </button>
                    </div>

                    <div className="token-explanation-box">
                      <strong>📌 What to do with this Protocol Token?</strong>
                      <p>Save or copy this Protocol Token (`{submissionReceipt.applicationId}`)! Use it in our top header's <strong>"🔍 Track Application"</strong> lookup system to view your interview slots, technical tasks, screening status, and admin evaluation remarks in real-time.</p>
                    </div>

                    {/* Thank You & Contact Message */}
                    <div className="contact-notice-box">
                      <strong>✨ Thanks for your submission!</strong>
                      <p>Our selection panel will review your profile. If you are shortlisted, our team will contact you directly via your registered email (<span style={{color: 'var(--text-main)'}}>{submissionReceipt.email}</span>) or contact number (<span style={{color: 'var(--text-main)'}}>{submissionReceipt.phone}</span>).</p>
                    </div>

                    <div className="timeline-block">
                      <div className="timeline-title">Recruitment Pipeline Timeline</div>
                      <div className="timeline-steps">
                        <div className="timeline-item active-phase">
                          <div className="phase-num">PHASE 01</div>
                          <div className="phase-name">Application Review</div>
                          <div className="phase-desc">Automated & Panel Profile Audit</div>
                        </div>
                        <div className="timeline-item">
                          <div className="phase-num">PHASE 02</div>
                          <div className="phase-name">Technical Hackday</div>
                          <div className="phase-desc">Task / Domain Challenge</div>
                        </div>
                        <div className="timeline-item">
                          <div className="phase-num">PHASE 03</div>
                          <div className="phase-name">Live Interview</div>
                          <div className="phase-desc">1-on-1 Panel Discussion</div>
                        </div>
                        <div className="timeline-item">
                          <div className="phase-num">PHASE 04</div>
                          <div className="phase-name">Onboarding</div>
                          <div className="phase-desc">Official Team Induction</div>
                        </div>
                      </div>
                    </div>

                    <div className="success-actions">
                      <button onClick={() => handleDownloadPass(submissionReceipt)} className="btn-primary">
                        📥 Download Official Pass (.txt)
                      </button>
                      <button onClick={() => { setStatus({ type: 'idle', message: '' }); setCurrentStep(1); }} className="btn-secondary">
                        🔄 Submit Another Application
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* WIZARD FORM GRID */
                <div className="main-grid">
                  <div className="form-column">
                    
                    {/* Step Progress Bar */}
                    <div className="step-tracker">
                      <button 
                        className={`step-item ${currentStep === 1 ? 'active' : currentStep > 1 ? 'completed' : ''}`}
                        onClick={() => currentStep > 1 && setCurrentStep(1)}
                      >
                        <span className="step-number">{currentStep > 1 ? '✓' : '1'}</span>
                        <span>Identity</span>
                      </button>
                      <div className="step-divider"></div>

                      <button 
                        className={`step-item ${currentStep === 2 ? 'active' : currentStep > 2 ? 'completed' : ''}`}
                        onClick={() => currentStep > 2 && setCurrentStep(2)}
                      >
                        <span className="step-number">{currentStep > 2 ? '✓' : '2'}</span>
                        <span>Division & Skills</span>
                      </button>
                      <div className="step-divider"></div>

                      <button 
                        className={`step-item ${currentStep === 3 ? 'active' : ''}`}
                      >
                        <span className="step-number">3</span>
                        <span>Proof of Work</span>
                      </button>
                    </div>

                    {/* Form Wizard Box */}
                    <div className="form-panel">
                      {status.type === 'loading' ? (
                        <div className="loading-box">
                          <div className="cyber-spinner"></div>
                          <div className="loading-text">{status.message}</div>
                          <div className="loading-subtext">Establishing secure handshakes with Firebase Firestore cluster...</div>
                        </div>
                      ) : (
                        <form onSubmit={handleFormSubmit}>
                          {/* STEP 1: IDENTITY & ACADEMICS */}
                          {currentStep === 1 && (
                            <div className="step-content">
                              <div className="panel-title">
                                <span>01 / Personal Identity & Academic Node</span>
                              </div>
                              <p className="panel-desc">Provide your official student record for Priyadarshini Bhagwati College of Engineering.</p>

                              <div className="form-grid">
                                <div className="form-row-2">
                                  <div className="input-group">
                                    <label className="input-label">
                                      <span>Full Legal Name <span className="req-star">*</span></span>
                                    </label>
                                    <input
                                      type="text"
                                      name="fullName"
                                      value={formData.fullName}
                                      onChange={handleChange}
                                      className={`input-field ${errors.fullName ? 'has-error' : ''}`}
                                      placeholder="e.g. Alex Morgan"
                                    />
                                    {errors.fullName && <div className="field-error">{errors.fullName}</div>}
                                  </div>

                                  <div className="input-group">
                                    <label className="input-label">
                                      <span>Gender / Sex <span className="req-star">*</span></span>
                                    </label>
                                    <select
                                      name="gender"
                                      value={formData.gender}
                                      onChange={handleChange}
                                      className={`input-field ${errors.gender ? 'has-error' : ''}`}
                                    >
                                      <option value="Male">Male 👨</option>
                                      <option value="Female">Female 👩</option>
                                      <option value="Other">Other / Prefer not to say 👤</option>
                                    </select>
                                    {errors.gender && <div className="field-error">{errors.gender}</div>}
                                  </div>
                                </div>

                                <div className="form-row-2">
                                  <div className="input-group">
                                    <label className="input-label">
                                      <span>University Email <span className="req-star">*</span></span>
                                    </label>
                                    <input
                                      type="email"
                                      name="email"
                                      value={formData.email}
                                      onChange={handleChange}
                                      className={`input-field ${errors.email ? 'has-error' : ''}`}
                                      placeholder="alex@pbcoe.edu.in"
                                    />
                                    {errors.email && <div className="field-error">{errors.email}</div>}
                                  </div>

                                  <div className="input-group">
                                    <label className="input-label">
                                      <span>Contact Phone <span className="req-star">*</span></span>
                                    </label>
                                    <input
                                      type="tel"
                                      name="phone"
                                      value={formData.phone}
                                      onChange={handleChange}
                                      className={`input-field ${errors.phone ? 'has-error' : ''}`}
                                      placeholder="+91 98765 43210"
                                    />
                                    {errors.phone && <div className="field-error">{errors.phone}</div>}
                                  </div>
                                </div>

                                <div className="form-row-2">
                                  <div className="input-group">
                                    <label className="input-label">
                                      <span>Student ID / Roll No. <span className="req-star">*</span></span>
                                    </label>
                                    <input
                                      type="text"
                                      name="studentId"
                                      value={formData.studentId}
                                      onChange={handleChange}
                                      className={`input-field ${errors.studentId ? 'has-error' : ''}`}
                                      placeholder="e.g. 2026PBCOE108"
                                    />
                                    {errors.studentId && <div className="field-error">{errors.studentId}</div>}
                                  </div>

                                  <div className="input-group">
                                    <label className="input-label">
                                      <span>Academic Year <span className="req-star">*</span></span>
                                    </label>
                                    <select
                                      name="year"
                                      value={formData.year}
                                      onChange={handleChange}
                                      className={`input-field ${errors.year ? 'has-error' : ''}`}
                                    >
                                      <option value="" disabled>Select current year</option>
                                      <option value="1">1st Year (Freshman)</option>
                                      <option value="2">2nd Year (Sophomore)</option>
                                      <option value="3">3rd Year (Junior)</option>
                                      <option value="4">4th Year (Senior)</option>
                                    </select>
                                    {errors.year && <div className="field-error">{errors.year}</div>}
                                  </div>
                                </div>

                                <div className="input-group">
                                  <label className="input-label">
                                    <span>Branch / Major <span className="req-star">*</span></span>
                                  </label>
                                  <input
                                    type="text"
                                    name="branch"
                                    value={formData.branch}
                                    onChange={handleChange}
                                    className={`input-field ${errors.branch ? 'has-error' : ''}`}
                                    placeholder="e.g. Computer Science & Engineering"
                                  />
                                  {errors.branch && <div className="field-error">{errors.branch}</div>}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* STEP 2: DIVISION & SKILLSET */}
                          {currentStep === 2 && (
                            <div className="step-content">
                              <div className="panel-title">
                                <span>02 / Division & Technical Skill Matrix</span>
                              </div>
                              <p className="panel-desc">Select your target division and select key technologies you work with.</p>

                              <div className="form-grid">
                                <div className="input-group">
                                  <label className="input-label">
                                    <span>Target Division <span className="req-star">*</span></span>
                                  </label>
                                  <div className="tracks-grid">
                                    {TRACK_DIVISIONS.map(div => (
                                      <div 
                                        key={div.id}
                                        className={`track-card ${formData.track === div.id ? 'selected' : ''}`}
                                        onClick={() => setFormData(prev => ({ ...prev, track: div.id }))}
                                      >
                                        <div className="track-icon-box">{div.icon}</div>
                                        <div className="track-info">
                                          <h4>{div.title}</h4>
                                          <p>{div.desc}</p>
                                          <div className="track-tags">
                                            {div.tags.map(t => (
                                              <span key={t} className="track-tag-chip">{t}</span>
                                            ))}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                  {errors.track && <div className="field-error">{errors.track}</div>}
                                </div>

                                <div className="input-group" style={{marginTop: '1rem'}}>
                                  <label className="input-label">
                                    <span>Select Technical Skills & Tools <span className="req-star">*</span></span>
                                  </label>
                                  <div className="skills-wrap">
                                    {POPULAR_SKILLS.map(skill => (
                                      <span 
                                        key={skill}
                                        className={`skill-chip ${formData.skills.includes(skill) ? 'selected' : ''}`}
                                        onClick={() => toggleSkill(skill)}
                                      >
                                        {formData.skills.includes(skill) ? '✓ ' : '+ '}{skill}
                                      </span>
                                    ))}
                                  </div>

                                  <div className="add-skill-row">
                                    <input 
                                      type="text"
                                      value={customSkillInput}
                                      onChange={e => setCustomSkillInput(e.target.value)}
                                      placeholder="Add custom skill (e.g. CUDA, Zig)..."
                                      className="input-field"
                                      style={{fontSize: '0.85rem', padding: '0.5rem 0.85rem'}}
                                    />
                                    <button type="button" onClick={handleAddCustomSkill} className="add-skill-btn">
                                      Add
                                    </button>
                                  </div>
                                  {errors.skills && <div className="field-error">{errors.skills}</div>}
                                </div>

                                <div className="form-row-2">
                                  <div className="input-group">
                                    <label className="input-label">
                                      <span>Overall Technical Tier</span>
                                    </label>
                                    <select 
                                      name="experienceLevel" 
                                      value={formData.experienceLevel} 
                                      onChange={handleChange}
                                      className="input-field"
                                    >
                                      <option value="Beginner">Beginner / Exploring</option>
                                      <option value="Intermediate">Intermediate / Practitioner</option>
                                      <option value="Advanced">Advanced / Project Builder</option>
                                    </select>
                                  </div>
                                </div>

                                <div className="input-group">
                                  <label className="input-label">
                                    <span>Statement of Interest <span className="req-star">*</span></span>
                                  </label>
                                  <textarea
                                    name="statement"
                                    value={formData.statement}
                                    onChange={handleChange}
                                    className={`input-field ${errors.statement ? 'has-error' : ''}`}
                                    placeholder="Why do you want to join the Core Engineering Club? What projects or skills do you wish to contribute?"
                                  ></textarea>
                                  {errors.statement && <div className="field-error">{errors.statement}</div>}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* STEP 3: PROOF OF WORK & LINKS */}
                          {currentStep === 3 && (
                            <div className="step-content">
                              <div className="panel-title">
                                <span>03 / Proof of Work & Links</span>
                              </div>
                              <p className="panel-desc">Share your profiles and showcase project achievements.</p>

                              <div className="form-grid">
                                <div className="form-row-2">
                                  <div className="input-group">
                                    <label className="input-label">
                                      <span>GitHub Protocol <span className="req-star">*</span></span>
                                    </label>
                                    <input
                                      type="url"
                                      name="github"
                                      value={formData.github}
                                      onChange={handleChange}
                                      onBlur={handleUrlBlur}
                                      className={`input-field ${errors.github ? 'has-error' : ''}`}
                                      placeholder="https://github.com/username"
                                    />
                                    {errors.github && <div className="field-error">{errors.github}</div>}
                                  </div>

                                  <div className="input-group">
                                    <label className="input-label">
                                      <span>LinkedIn Protocol <span className="req-star">*</span></span>
                                    </label>
                                    <input
                                      type="url"
                                      name="linkedin"
                                      value={formData.linkedin}
                                      onChange={handleChange}
                                      onBlur={handleUrlBlur}
                                      className={`input-field ${errors.linkedin ? 'has-error' : ''}`}
                                      placeholder="https://linkedin.com/in/username"
                                    />
                                    {errors.linkedin && <div className="field-error">{errors.linkedin}</div>}
                                  </div>
                                </div>

                                <div className="input-group">
                                  <label className="input-label">
                                    <span>Portfolio / Live Demo URL (Optional)</span>
                                  </label>
                                  <input
                                    type="url"
                                    name="portfolio"
                                    value={formData.portfolio}
                                    onChange={handleChange}
                                    onBlur={handleUrlBlur}
                                    className="input-field"
                                    placeholder="https://myportfolio.dev"
                                  />
                                </div>

                                <div className="input-group">
                                  <label className="input-label">
                                    <span>Best Project / Engineering Highlight</span>
                                  </label>
                                  <textarea
                                    name="bestProject"
                                    value={formData.bestProject}
                                    onChange={handleChange}
                                    className="input-field"
                                    placeholder="Briefly describe your best engineering build or favorite tech accomplishment..."
                                  ></textarea>
                                </div>

                                {status.type === 'error' && (
                                  <div style={{
                                    color: 'var(--accent-rose)',
                                    background: 'rgba(244, 63, 94, 0.1)',
                                    border: '1px solid rgba(244, 63, 94, 0.3)',
                                    padding: '0.85rem',
                                    borderRadius: '8px',
                                    fontSize: '0.85rem'
                                  }}>
                                    ⚠️ {status.message}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Wizard Actions Footer */}
                          <div className="wizard-actions">
                            {currentStep > 1 ? (
                              <button type="button" onClick={handlePrevStep} className="btn-secondary">
                                ← Back
                              </button>
                            ) : <div></div>}

                            {currentStep < 3 ? (
                              <button type="button" onClick={handleNextStep} className="btn-primary">
                                Continue Step {currentStep + 1} →
                              </button>
                            ) : (
                              <button type="submit" className="btn-primary" style={{background: 'linear-gradient(135deg, var(--accent-emerald), #059669)'}}>
                                🚀 Initialize & Register Protocol
                              </button>
                            )}
                          </div>
                        </form>
                      )}
                    </div>
                  </div>

                  {/* Live Interactive Holographic Dossier Card */}
                  <div className="dossier-column">
                    <div className="dossier-card">
                      <div className="dossier-header">
                        <span className="dossier-title">Candidate ID Pass</span>
                        <span className="security-chip">PBCOE-2026</span>
                      </div>

                      <div className="dossier-avatar-row">
                        <div className="avatar-frame">
                          {getInitials(formData.fullName)}
                        </div>
                        <div>
                          <div className="dossier-user-name">
                            {formData.fullName.trim() || 'Candidate Name'}
                          </div>
                          <div className="dossier-user-sub">
                            {formData.studentId.trim() || 'ID: PBCOE-PENDING'}
                          </div>
                        </div>
                      </div>

                      <div className="dossier-details-grid">
                        <div className="dossier-row">
                          <span className="dossier-label">Gender:</span>
                          <span className="dossier-val" style={{color: 'var(--accent-cyan)'}}>
                            {formData.gender}
                          </span>
                        </div>

                        <div className="dossier-row">
                          <span className="dossier-label">Target Division:</span>
                          <span className="dossier-val" style={{color: 'var(--accent-cyan)'}}>
                            {formData.track}
                          </span>
                        </div>

                        <div className="dossier-row">
                          <span className="dossier-label">Academic Tier:</span>
                          <span className="dossier-val">
                            {formData.year ? `Year ${formData.year}` : 'Not Selected'}
                          </span>
                        </div>

                        <div className="dossier-row">
                          <span className="dossier-label">Branch Node:</span>
                          <span className="dossier-val">
                            {formData.branch.trim() || 'CSE / Engineering'}
                          </span>
                        </div>

                        <div className="dossier-row">
                          <span className="dossier-label">Skill Matrix ({formData.skills.length}):</span>
                        </div>

                        <div className="dossier-skills-list">
                          {formData.skills.length > 0 ? (
                            formData.skills.slice(0, 6).map(s => (
                              <span key={s} className="dossier-skill-tag">{s}</span>
                            ))
                          ) : (
                            <span className="dossier-skill-tag">No skills selected</span>
                          )}
                          {formData.skills.length > 6 && (
                            <span className="dossier-skill-tag">+{formData.skills.length - 6} more</span>
                          )}
                        </div>
                      </div>

                      <div className="barcode-strip">
                        <div className="barcode-lines"></div>
                        <div className="barcode-text">
                          * PBCOE-2026-AUTONOMOUS-LABS *
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default App;         </div>
       )
        /* STUDENT FORM VIEW */
        <div>
          {viewMode === 'student' && (
            <>
              {/* SUCCESS RECEIPT VIEW */}
              {status.type === 'success' && submissionReceipt ? (
                <div className="success-container">
                  <div className="success-card">
                    <div className="success-icon-wrap">
                      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                      </svg>
                    </div>

                    <div className="success-header">
                      <h2>Application Secured & Registered</h2>
                      <p>Welcome to the Core Engineering Club 2026 queue, <strong style={{color: 'var(--text-main)'}}>{submissionReceipt.fullName}</strong>.</p>
                    </div>

                    {/* Clear Token Instructions */}
                    <div className="token-banner">
                      <div>
                        <div className="token-label">Protocol Access Token</div>
                        <div className="token-value">{submissionReceipt.applicationId}</div>
                      </div>
                      <button onClick={handleCopyToken} className="token-copy-btn">
                        {copiedToken ? '✓ Copied to Clipboard' : '📋 Copy Token'}
                      </button>
                    </div>

                    <div className="token-explanation-box">
                      <strong>📌 What to do with this Protocol Token?</strong>
                      <p>Save or copy this Protocol Token (`{submissionReceipt.applicationId}`)! Use it in our top header's <strong>"🔍 Track Application"</strong> lookup system to view your interview slots, technical tasks, screening status, and admin evaluation remarks in real-time.</p>
                    </div>

                    {/* Thank You & Contact Message */}
                    <div className="contact-notice-box">
                      <strong>✨ Thanks for your submission!</strong>
                      <p>Our selection panel will review your profile. If you are shortlisted, our team will contact you directly via your registered email (<span style={{color: 'var(--text-main)'}}>{submissionReceipt.email}</span>) or contact number (<span style={{color: 'var(--text-main)'}}>{submissionReceipt.phone}</span>).</p>
                    </div>

                    <div className="timeline-block">
                      <div className="timeline-title">Recruitment Pipeline Timeline</div>
                      <div className="timeline-steps">
                        <div className="timeline-item active-phase">
                          <div className="phase-num">PHASE 01</div>
                          <div className="phase-name">Application Review</div>
                          <div className="phase-desc">Automated & Panel Profile Audit</div>
                        </div>
                        <div className="timeline-item">
                          <div className="phase-num">PHASE 02</div>
                          <div className="phase-name">Technical Hackday</div>
                          <div className="phase-desc">Task / Domain Challenge</div>
                        </div>
                        <div className="timeline-item">
                          <div className="phase-num">PHASE 03</div>
                          <div className="phase-name">Live Interview</div>
                          <div className="phase-desc">1-on-1 Panel Discussion</div>
                        </div>
                        <div className="timeline-item">
                          <div className="phase-num">PHASE 04</div>
                          <div className="phase-name">Onboarding</div>
                          <div className="phase-desc">Official Team Induction</div>
                        </div>
                      </div>
                    </div>

                    <div className="success-actions">
                      <button onClick={() => handleDownloadPass(submissionReceipt)} className="btn-primary">
                        📥 Download Official Pass (.txt)
                      </button>
                      <button onClick={() => { setStatus({ type: 'idle', message: '' }); setCurrentStep(1); }} className="btn-secondary">
                        🔄 Submit Another Application
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* WIZARD FORM GRID */
                <div className="main-grid">
                  <div className="form-column">
                    
                    {/* Step Progress Bar */}
                    <div className="step-tracker">
                      <button 
                        className={`step-item ${currentStep === 1 ? 'active' : currentStep > 1 ? 'completed' : ''}`}
                        onClick={() => currentStep > 1 && setCurrentStep(1)}
                      >
                        <span className="step-number">{currentStep > 1 ? '✓' : '1'}</span>
                        <span>Identity</span>
                      </button>
                      <div className="step-divider"></div>

                      <button 
                        className={`step-item ${currentStep === 2 ? 'active' : currentStep > 2 ? 'completed' : ''}`}
                        onClick={() => currentStep > 2 && setCurrentStep(2)}
                      >
                        <span className="step-number">{currentStep > 2 ? '✓' : '2'}</span>
                        <span>Division & Skills</span>
                      </button>
                      <div className="step-divider"></div>

                      <button 
                        className={`step-item ${currentStep === 3 ? 'active' : ''}`}
                      >
                        <span className="step-number">3</span>
                        <span>Proof of Work</span>
                      </button>
                    </div>

                    {/* Form Wizard Box */}
                    <div className="form-panel">
                      {status.type === 'loading' ? (
                        <div className="loading-box">
                          <div className="cyber-spinner"></div>
                          <div className="loading-text">{status.message}</div>
                          <div className="loading-subtext">Establishing secure handshakes with Firebase Firestore cluster...</div>
                        </div>
                      ) : (
                        <form onSubmit={handleFormSubmit}>
                          {/* STEP 1: IDENTITY & ACADEMICS */}
                          {currentStep === 1 && (
                            <div className="step-content">
                              <div className="panel-title">
                                <span>01 / Personal Identity & Academic Node</span>
                              </div>
                              <p className="panel-desc">Provide your official student record for Priyadarshini Bhagwati College of Engineering.</p>

                              <div className="form-grid">
                                <div className="form-row-2">
                                  <div className="input-group">
                                    <label className="input-label">
                                      <span>Full Legal Name <span className="req-star">*</span></span>
                                    </label>
                                    <input
                                      type="text"
                                      name="fullName"
                                      value={formData.fullName}
                                      onChange={handleChange}
                                      className={`input-field ${errors.fullName ? 'has-error' : ''}`}
                                      placeholder="e.g. Alex Morgan"
                                    />
                                    {errors.fullName && <div className="field-error">{errors.fullName}</div>}
                                  </div>

                                  <div className="input-group">
                                    <label className="input-label">
                                      <span>Gender / Sex <span className="req-star">*</span></span>
                                    </label>
                                    <select
                                      name="gender"
                                      value={formData.gender}
                                      onChange={handleChange}
                                      className={`input-field ${errors.gender ? 'has-error' : ''}`}
                                    >
                                      <option value="Male">Male 👨</option>
                                      <option value="Female">Female 👩</option>
                                      <option value="Other">Other / Prefer not to say 👤</option>
                                    </select>
                                    {errors.gender && <div className="field-error">{errors.gender}</div>}
                                  </div>
                                </div>

                                <div className="form-row-2">
                                  <div className="input-group">
                                    <label className="input-label">
                                      <span>University Email <span className="req-star">*</span></span>
                                    </label>
                                    <input
                                      type="email"
                                      name="email"
                                      value={formData.email}
                                      onChange={handleChange}
                                      className={`input-field ${errors.email ? 'has-error' : ''}`}
                                      placeholder="alex@pbcoe.edu.in"
                                    />
                                    {errors.email && <div className="field-error">{errors.email}</div>}
                                  </div>

                                  <div className="input-group">
                                    <label className="input-label">
                                      <span>Contact Phone <span className="req-star">*</span></span>
                                    </label>
                                    <input
                                      type="tel"
                                      name="phone"
                                      value={formData.phone}
                                      onChange={handleChange}
                                      className={`input-field ${errors.phone ? 'has-error' : ''}`}
                                      placeholder="+91 98765 43210"
                                    />
                                    {errors.phone && <div className="field-error">{errors.phone}</div>}
                                  </div>
                                </div>

                                <div className="form-row-2">
                                  <div className="input-group">
                                    <label className="input-label">
                                      <span>Student ID / Roll No. <span className="req-star">*</span></span>
                                    </label>
                                    <input
                                      type="text"
                                      name="studentId"
                                      value={formData.studentId}
                                      onChange={handleChange}
                                      className={`input-field ${errors.studentId ? 'has-error' : ''}`}
                                      placeholder="e.g. 2026PBCOE108"
                                    />
                                    {errors.studentId && <div className="field-error">{errors.studentId}</div>}
                                  </div>

                                  <div className="input-group">
                                    <label className="input-label">
                                      <span>Academic Year <span className="req-star">*</span></span>
                                    </label>
                                    <select
                                      name="year"
                                      value={formData.year}
                                      onChange={handleChange}
                                      className={`input-field ${errors.year ? 'has-error' : ''}`}
                                    >
                                      <option value="" disabled>Select current year</option>
                                      <option value="1">1st Year (Freshman)</option>
                                      <option value="2">2nd Year (Sophomore)</option>
                                      <option value="3">3rd Year (Junior)</option>
                                      <option value="4">4th Year (Senior)</option>
                                    </select>
                                    {errors.year && <div className="field-error">{errors.year}</div>}
                                  </div>
                                </div>

                                <div className="input-group">
                                  <label className="input-label">
                                    <span>Branch / Major <span className="req-star">*</span></span>
                                  </label>
                                  <input
                                    type="text"
                                    name="branch"
                                    value={formData.branch}
                                    onChange={handleChange}
                                    className={`input-field ${errors.branch ? 'has-error' : ''}`}
                                    placeholder="e.g. Computer Science & Engineering"
                                  />
                                  {errors.branch && <div className="field-error">{errors.branch}</div>}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* STEP 2: DIVISION & SKILLSET */}
                          {currentStep === 2 && (
                            <div className="step-content">
                              <div className="panel-title">
                                <span>02 / Division & Technical Skill Matrix</span>
                              </div>
                              <p className="panel-desc">Select your target division and select key technologies you work with.</p>

                              <div className="form-grid">
                                <div className="input-group">
                                  <label className="input-label">
                                    <span>Target Division <span className="req-star">*</span></span>
                                  </label>
                                  <div className="tracks-grid">
                                    {TRACK_DIVISIONS.map(div => (
                                      <div 
                                        key={div.id}
                                        className={`track-card ${formData.track === div.id ? 'selected' : ''}`}
                                        onClick={() => setFormData(prev => ({ ...prev, track: div.id }))}
                                      >
                                        <div className="track-icon-box">{div.icon}</div>
                                        <div className="track-info">
                                          <h4>{div.title}</h4>
                                          <p>{div.desc}</p>
                                          <div className="track-tags">
                                            {div.tags.map(t => (
                                              <span key={t} className="track-tag-chip">{t}</span>
                                            ))}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                  {errors.track && <div className="field-error">{errors.track}</div>}
                                </div>

                                <div className="input-group" style={{marginTop: '1rem'}}>
                                  <label className="input-label">
                                    <span>Select Technical Skills & Tools <span className="req-star">*</span></span>
                                  </label>
                                  <div className="skills-wrap">
                                    {POPULAR_SKILLS.map(skill => (
                                      <span 
                                        key={skill}
                                        className={`skill-chip ${formData.skills.includes(skill) ? 'selected' : ''}`}
                                        onClick={() => toggleSkill(skill)}
                                      >
                                        {formData.skills.includes(skill) ? '✓ ' : '+ '}{skill}
                                      </span>
                                    ))}
                                  </div>

                                  <div className="add-skill-row">
                                    <input 
                                      type="text"
                                      value={customSkillInput}
                                      onChange={e => setCustomSkillInput(e.target.value)}
                                      placeholder="Add custom skill (e.g. CUDA, Zig)..."
                                      className="input-field"
                                      style={{fontSize: '0.85rem', padding: '0.5rem 0.85rem'}}
                                    />
                                    <button type="button" onClick={handleAddCustomSkill} className="add-skill-btn">
                                      Add
                                    </button>
                                  </div>
                                  {errors.skills && <div className="field-error">{errors.skills}</div>}
                                </div>

                                <div className="form-row-2">
                                  <div className="input-group">
                                    <label className="input-label">
                                      <span>Overall Technical Tier</span>
                                    </label>
                                    <select 
                                      name="experienceLevel" 
                                      value={formData.experienceLevel} 
                                      onChange={handleChange}
                                      className="input-field"
                                    >
                                      <option value="Beginner">Beginner / Exploring</option>
                                      <option value="Intermediate">Intermediate / Practitioner</option>
                                      <option value="Advanced">Advanced / Project Builder</option>
                                    </select>
                                  </div>
                                </div>

                                <div className="input-group">
                                  <label className="input-label">
                                    <span>Statement of Interest <span className="req-star">*</span></span>
                                  </label>
                                  <textarea
                                    name="statement"
                                    value={formData.statement}
                                    onChange={handleChange}
                                    className={`input-field ${errors.statement ? 'has-error' : ''}`}
                                    placeholder="Why do you want to join the Core Engineering Club? What projects or skills do you wish to contribute?"
                                  ></textarea>
                                  {errors.statement && <div className="field-error">{errors.statement}</div>}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* STEP 3: PROOF OF WORK & LINKS */}
                          {currentStep === 3 && (
                            <div className="step-content">
                              <div className="panel-title">
                                <span>03 / Proof of Work & Links</span>
                              </div>
                              <p className="panel-desc">Share your profiles and showcase project achievements.</p>

                              <div className="form-grid">
                                <div className="form-row-2">
                                  <div className="input-group">
                                    <label className="input-label">
                                      <span>GitHub Protocol <span className="req-star">*</span></span>
                                    </label>
                                    <input
                                      type="url"
                                      name="github"
                                      value={formData.github}
                                      onChange={handleChange}
                                      onBlur={handleUrlBlur}
                                      className={`input-field ${errors.github ? 'has-error' : ''}`}
                                      placeholder="https://github.com/username"
                                    />
                                    {errors.github && <div className="field-error">{errors.github}</div>}
                                  </div>

                                  <div className="input-group">
                                    <label className="input-label">
                                      <span>LinkedIn Protocol <span className="req-star">*</span></span>
                                    </label>
                                    <input
                                      type="url"
                                      name="linkedin"
                                      value={formData.linkedin}
                                      onChange={handleChange}
                                      onBlur={handleUrlBlur}
                                      className={`input-field ${errors.linkedin ? 'has-error' : ''}`}
                                      placeholder="https://linkedin.com/in/username"
                                    />
                                    {errors.linkedin && <div className="field-error">{errors.linkedin}</div>}
                                  </div>
                                </div>

                                <div className="input-group">
                                  <label className="input-label">
                                    <span>Portfolio / Live Demo URL (Optional)</span>
                                  </label>
                                  <input
                                    type="url"
                                    name="portfolio"
                                    value={formData.portfolio}
                                    onChange={handleChange}
                                    onBlur={handleUrlBlur}
                                    className="input-field"
                                    placeholder="https://myportfolio.dev"
                                  />
                                </div>

                                <div className="input-group">
                                  <label className="input-label">
                                    <span>Best Project / Engineering Highlight</span>
                                  </label>
                                  <textarea
                                    name="bestProject"
                                    value={formData.bestProject}
                                    onChange={handleChange}
                                    className="input-field"
                                    placeholder="Briefly describe your best engineering build or favorite tech accomplishment..."
                                  ></textarea>
                                </div>

                                {status.type === 'error' && (
                                  <div style={{
                                    color: 'var(--accent-rose)',
                                    background: 'rgba(244, 63, 94, 0.1)',
                                    border: '1px solid rgba(244, 63, 94, 0.3)',
                                    padding: '0.85rem',
                                    borderRadius: '8px',
                                    fontSize: '0.85rem'
                                  }}>
                                    ⚠️ {status.message}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Wizard Actions Footer */}
                          <div className="wizard-actions">
                            {currentStep > 1 ? (
                              <button type="button" onClick={handlePrevStep} className="btn-secondary">
                                ← Back
                              </button>
                            ) : <div></div>}

                            {currentStep < 3 ? (
                              <button type="button" onClick={handleNextStep} className="btn-primary">
                                Continue Step {currentStep + 1} →
                              </button>
                            ) : (
                              <button type="submit" className="btn-primary" style={{background: 'linear-gradient(135deg, var(--accent-emerald), #059669)'}}>
                                🚀 Initialize & Register Protocol
                              </button>
                            )}
                          </div>
                        </form>
                      )}
                    </div>
                  </div>

                  {/* Live Interactive Holographic Dossier Card */}
                  <div className="dossier-column">
                    <div className="dossier-card">
                      <div className="dossier-header">
                        <span className="dossier-title">Candidate ID Pass</span>
                        <span className="security-chip">PBCOE-2026</span>
                      </div>

                      <div className="dossier-avatar-row">
                        <div className="avatar-frame">
                          {getInitials(formData.fullName)}
                        </div>
                        <div>
                          <div className="dossier-user-name">
                            {formData.fullName.trim() || 'Candidate Name'}
                          </div>
                          <div className="dossier-user-sub">
                            {formData.studentId.trim() || 'ID: PBCOE-PENDING'}
                          </div>
                        </div>
                      </div>

                      <div className="dossier-details-grid">
                        <div className="dossier-row">
                          <span className="dossier-label">Gender:</span>
                          <span className="dossier-val" style={{color: 'var(--accent-cyan)'}}>
                            {formData.gender}
                          </span>
                        </div>

                        <div className="dossier-row">
                          <span className="dossier-label">Target Division:</span>
                          <span className="dossier-val" style={{color: 'var(--accent-cyan)'}}>
                            {formData.track}
                          </span>
                        </div>

                        <div className="dossier-row">
                          <span className="dossier-label">Academic Tier:</span>
                          <span className="dossier-val">
                            {formData.year ? `Year ${formData.year}` : 'Not Selected'}
                          </span>
                        </div>

                        <div className="dossier-row">
                          <span className="dossier-label">Branch Node:</span>
                          <span className="dossier-val">
                            {formData.branch.trim() || 'CSE / Engineering'}
                          </span>
                        </div>

                        <div className="dossier-row">
                          <span className="dossier-label">Skill Matrix ({formData.skills.length}):</span>
                        </div>

                        <div className="dossier-skills-list">
                          {formData.skills.length > 0 ? (
                            formData.skills.slice(0, 6).map(s => (
                              <span key={s} className="dossier-skill-tag">{s}</span>
                            ))
                          ) : (
                            <span className="dossier-skill-tag">No skills selected</span>
                          )}
                          {formData.skills.length > 6 && (
                            <span className="dossier-skill-tag">+{formData.skills.length - 6} more</span>
                          )}
                        </div>
                      </div>

                      <div className="barcode-strip">
                        <div className="barcode-lines"></div>
                        <div className="barcode-text">
                          * PBCOE-2026-AUTONOMOUS-LABS *
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default App;