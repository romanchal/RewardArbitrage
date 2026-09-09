import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Field, Reveal, YEARS, COMMITTEE_ROLES, COLLEGE, DEPT, COLLEGE_SHORT } from '../shared.jsx';

const empty = {
  fullName: '', email: '', phone: '', rollNo: '',
  year: '', branch: 'AI',
  role: 'President', altRole: '',
  hoursPerWeek: '6',
  pastLeadership: '',
  vision: '',
  linkedin: '', github: ''
};

export default function CommitteeForm() {
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ type: 'idle', message: '' });
  const [receipt, setReceipt] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: null }));
  };

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = 'Required';
    if (!form.email.trim()) e.email = 'Required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email';
    if (!form.phone.trim()) e.phone = 'Required';
    else if (!/^\+?[0-9\s-]{7,15}$/.test(form.phone)) e.phone = 'Invalid phone';
    if (!form.rollNo.trim()) e.rollNo = 'Required';
    if (!form.year) e.year = 'Required';
    if (!form.branch.trim()) e.branch = 'Required';
    if (!form.role) e.role = 'Required';
    if (!form.hoursPerWeek || Number(form.hoursPerWeek) < 1) e.hoursPerWeek = 'At least 1 hour';
    if (!form.vision.trim() || form.vision.trim().length < 30) e.vision = 'At least 30 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setStatus({ type: 'loading', message: 'Submitting...' });
    try {
      const dupQ = query(collection(db, 'committee'), where('rollNo', '==', form.rollNo.trim()));
      const dupSnap = await getDocs(dupQ);
      if (!dupSnap.empty) {
        setStatus({ type: 'error', message: 'This Roll No. has already applied for committee.' });
        return;
      }
      const refCode = `AICC-C-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
      const payload = {
        ...form,
        applicationId: refCode,
        college: COLLEGE,
        dept: DEPT,
        type: 'committee',
        submittedAt: serverTimestamp()
      };
      await addDoc(collection(db, 'committee'), payload);
      setReceipt(payload);
      setStatus({ type: 'success', message: 'Applied.' });
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', message: 'Submission failed. Check connection or Firestore rules.' });
    }
  };

  const reset = () => {
    setForm(empty); setReceipt(null); setStatus({ type: 'idle', message: '' }); setErrors({});
  };

  return (
    <section className="section page-form alt">
      <div className="section-grid">
        <Reveal className="section-label">
          <span className="num">C</span>
          <span>Committee</span>
        </Reveal>
        <div className="section-body">
          <Reveal>
            <Link to="/" className="back-link">← Back to home</Link>
            <h2 className="section-title">Committee Application.</h2>
          </Reveal>
          <Reveal delay={80}>
            <p className="prose muted">
              For {COLLEGE_SHORT} students who want to run the club. Expect real
              work, real ownership.
            </p>
          </Reveal>

          {receipt ? (
            <Reveal className="receipt">
              <div className="receipt-tag">Application received</div>
              <h3 className="receipt-name">Thanks, {receipt.fullName}.</h3>
              <p className="prose muted">
                We'll review and reach out within two weeks. Keep the ID for reference.
              </p>
              <div className="receipt-id">{receipt.applicationId}</div>
              <div className="receipt-grid">
                <div><span>Preferred Role</span><strong>{receipt.role}</strong></div>
                <div><span>Alt. Role</span><strong>{receipt.altRole || '—'}</strong></div>
                <div><span>Hours / week</span><strong>{receipt.hoursPerWeek}</strong></div>
                <div><span>Year</span><strong>{receipt.year}</strong></div>
                <div><span>Email</span><strong>{receipt.email}</strong></div>
                <div><span>Phone</span><strong>{receipt.phone}</strong></div>
              </div>
              <div className="receipt-actions">
                <button className="btn btn-ghost" onClick={reset}>Submit another →</button>
                <Link to="/" className="btn btn-ghost">Back to home</Link>
              </div>
            </Reveal>
          ) : (
            <Reveal>
              <form className="form" onSubmit={handleSubmit} noValidate>
                <div className="row-2">
                  <Field label="Full Name" name="fullName" value={form.fullName} onChange={handleChange} error={errors.fullName} placeholder="Alex Morgan" />
                  <Field label="Roll No." name="rollNo" value={form.rollNo} onChange={handleChange} error={errors.rollNo} placeholder="2026AI108" />
                </div>
                <div className="row-2">
                  <Field label="Email" type="email" name="email" value={form.email} onChange={handleChange} error={errors.email} placeholder="you@pbcoe.edu.in" />
                  <Field label="Phone" type="tel" name="phone" value={form.phone} onChange={handleChange} error={errors.phone} placeholder="+91 98765 43210" />
                </div>
                <div className="row-2">
                  <Field label="Year" name="year" value={form.year} onChange={handleChange} error={errors.year} as="select">
                    <option value="">Select year</option>
                    {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                  </Field>
                  <Field label="Branch" name="branch" value={form.branch} onChange={handleChange} error={errors.branch} placeholder="AI / CSE" />
                </div>
                <div className="row-2">
                  <Field label="Preferred Role" name="role" value={form.role} onChange={handleChange} error={errors.role} as="select">
                    {COMMITTEE_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </Field>
                  <Field label="Alternate Role" name="altRole" value={form.altRole} onChange={handleChange} as="select">
                    <option value="">— None —</option>
                    {COMMITTEE_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </Field>
                </div>
                <div className="row-2">
                  <Field label="Hours per week" type="number" name="hoursPerWeek" value={form.hoursPerWeek} onChange={handleChange} error={errors.hoursPerWeek} placeholder="6" />
                  <Field label="LinkedIn (optional)" name="linkedin" value={form.linkedin} onChange={handleChange} placeholder="linkedin.com/in/…" />
                </div>
                <Field label="GitHub / Portfolio (optional)" name="github" value={form.github} onChange={handleChange} placeholder="github.com/…" />
                <Field label="Past leadership or event experience" name="pastLeadership" value={form.pastLeadership} onChange={handleChange} as="textarea" placeholder="Clubs, events, teams, projects you led — brief bullets are fine." />
                <Field label="Your vision for the club" name="vision" value={form.vision} onChange={handleChange} error={errors.vision} as="textarea" placeholder="What you would build, change, or protect. Minimum 30 characters." />

                {status.type === 'error' && <div className="alert">{status.message}</div>}

                <button type="submit" className="btn btn-primary btn-wide" disabled={status.type === 'loading'}>
                  {status.type === 'loading' ? 'Sending…' : 'Submit application →'}
                </button>
              </form>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}
