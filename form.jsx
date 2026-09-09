import React, { useState, useEffect, useRef } from 'react';
import './style.css';

const RecruitmentForm = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', year: '', branch: '', 
    track: '', linkedin: '', github: '', paymentReceipt: null
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [logs, setLogs] = useState([{ sender: 'bot', text: 'Awaiting incoming connection...' }]);
  const [cmdInput, setCmdInput] = useState('');
  const [showCli, setShowCli] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({ ...prev, [name]: files ? files[0] : value }));
  };

  const appendLog = (sender, text) => setLogs(prev => [...prev, { sender, text }]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    
    setTimeout(() => appendLog('bot', `Handshake accepted. Identity verified as [${formData.name}].`), 800);
    setTimeout(() => appendLog('bot', `Parsing protocol requirements for: ${formData.track}`), 2000);
    setTimeout(() => {
      appendLog('bot', 'Define your strategic advantage. Why should the club allocate this node to you?');
      setShowCli(true);
    }, 3500);
  };

  const handleCommandSubmit = (e) => {
    e.preventDefault();
    if (!cmdInput.trim()) return;

    appendLog('user', cmdInput);
    setCmdInput('');
    setShowCli(false);

    setTimeout(() => appendLog('bot', 'Running heuristic analysis on response...'), 1000);
    setTimeout(() => appendLog('bot', 'Heuristic analysis complete. Logic parameters: ACCEPTABLE.'), 2800);
    setTimeout(() => appendLog('bot', `Initializing Hackathon Environment for ${formData.track}. You have 48 hours to deploy a prototype. Check secure email for instructions. End of line.`), 4500);
  };

  return (
    <main className="container">
      <section className="glass-panel">
        <header className="header-section">
          <h2>Priyadarshini Bhagwati College of Engineering</h2>
          <p>Core Club Recruitment 2026</p>
        </header>
        
        <form onSubmit={handleFormSubmit}>
          <div className="input-group">
            <label>Full Name</label>
            <input type="text" name="name" required onChange={handleChange} disabled={isSubmitted} className="input-control" />
          </div>

          <div className="form-row">
            <div className="input-group half-width">
              <label>Email</label>
              <input type="email" name="email" required onChange={handleChange} disabled={isSubmitted} className="input-control" />
            </div>
            <div className="input-group half-width">
              <label>Phone</label>
              <input type="tel" name="phone" required onChange={handleChange} disabled={isSubmitted} className="input-control" />
            </div>
          </div>

          <div className="form-row">
            <div className="input-group half-width">
              <label>Academic Year</label>
              <select name="year" required onChange={handleChange} disabled={isSubmitted} className="input-control">
                <option value="">Select Year</option>
                <option value="1">First Year</option>
                <option value="2">Second Year</option>
                <option value="3">Third Year</option>
                <option value="4">Fourth Year</option>
              </select>
            </div>
            <div className="input-group half-width">
              <label>Branch</label>
              <input type="text" name="branch" required onChange={handleChange} disabled={isSubmitted} className="input-control" />
            </div>
          </div>

          <div className="input-group">
            <label>Recruitment Track</label>
            <select name="track" required onChange={handleChange} disabled={isSubmitted} className="input-control">
              <option value="">Select your target role...</option>
              <option value="Vice President / Operations">Vice President / Operations Lead</option>
              <option value="Technical Lead">Technical Lead</option>
              <option value="AI/ML & Data">AI/ML & Data Team</option>
              <option value="Cybersecurity">Cybersecurity Team</option>
              <option value="Competitive Programming">Competitive Programming Team</option>
              <option value="Open Source & GitHub">Open Source & GitHub Team</option>
            </select>
          </div>

          <div className="input-group">
            <label>LinkedIn / GitHub URLs</label>
            <div className="form-row">
              <input type="url" name="linkedin" placeholder="LinkedIn URL" required onChange={handleChange} disabled={isSubmitted} className="input-control half-width" />
              <input type="url" name="github" placeholder="GitHub URL" required onChange={handleChange} disabled={isSubmitted} className="input-control half-width" />
            </div>
          </div>

          <div className="input-group">
            <label>Upload Payment Receipt</label>
            <input type="file" name="paymentReceipt" accept="image/*,application/pdf" required onChange={handleChange} disabled={isSubmitted} className="input-control" />
          </div>

          <button type="submit" className="btn" disabled={isSubmitted}>
            {isSubmitted ? 'Handshake Executed' : 'Initialize Application'}
          </button>
        </form>
      </section>

      <section className={`terminal-ui ${isSubmitted ? 'active' : ''}`}>
        <header className="terminal-header">
          <div className="window-controls">
            <div className="control-dot dot-close"></div>
            <div className="control-dot dot-min"></div>
            <div className="control-dot dot-max"></div>
          </div>
          <div className="status-badge" style={{ color: isSubmitted ? '#059669' : '#475569' }}>
            {isSubmitted ? 'Status: Authenticated' : 'Status: Disconnected'}
          </div>
        </header>
        
        <div className="terminal-body">
          {logs.map((log, i) => (
            <div key={i} className={`log-entry ${log.sender}`}>
              <span>{log.text}</span>
            </div>
          ))}
          {showCli && <span className="cursor"></span>}
          <div ref={chatEndRef} />
        </div>

        {showCli && (
          <form className="terminal-input-wrapper" onSubmit={handleCommandSubmit}>
            <input type="text" value={cmdInput} onChange={(e) => setCmdInput(e.target.value)} className="cmd-input" placeholder="Enter parameters..." autoFocus />
            <button type="submit" className="btn" style={{ width: 'auto' }}>Run</button>
          </form>
        )}
      </section>
    </main>
  );
};

export default RecruitmentForm;