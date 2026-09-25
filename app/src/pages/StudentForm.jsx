// ponytail: filename kept for git diff sanity; semantic = Participant Registration.
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Field, Reveal, YEARS, INTERESTS, COLLEGE, DEPT, COLLEGE_SHORT, CLUB_NAME } from '../shared.jsx';

const empty = {
  fullName: '', email: '', phone: '', rollNo: '',
  year: '', branch: 'AI', interest: 'Machine Learning',
  experience: 'Beginner', hasLaptop: '', reason: ''
};

export default function ParticipantForm() {
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
    if (!form.hasLaptop) e.hasLaptop = 'Required';
    if (!form.reason.trim() || form.reason.trim().length < 10) e.reason = 'At least 10 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setStatus({ type: 'loading', message: 'Submitting...' });
    try {
      const dupQ = query(collection(db, 'participants'), where('rollNo', '==', form.rollNo.trim()));
      const dupSnap = await getDocs(dupQ);
      if (!dupSnap.empty) {
        setStatus({ type: 'error', message: 'This Roll No. is already registered.' });
        return;
      }
      const refCode = `${CLUB_NAME.toUpperCase()}-P-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
      const payload = {
        ...form,
        applicationId: refCode,
        college: COLLEGE,
        dept: DEPT,
        club: CLUB_NAME,
        type: 'participant',
        submittedAt: serverTimestamp()
      };
      await addDoc(collection(db, 'participants'), payload);
      setReceipt(payload);
      setStatus({ type: 'success', message: 'Registered.' });
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', message: 'Submission failed. Check connection or Firestore rules.' });
    }
  };

  const reset = () => {
    setForm(empty); setReceipt(null); setStatus({ type: 'idle', message: '' }); setErrors({});
  };

  return (
    <section className="section page-form">
      <div className="section-grid">
        <Reveal className="section-label">
          <span className="num">P</span>
          <span>Participant</span>
        </Reveal>
        <div className="section-body">
          <Reveal>
            <Link to="/" className="back-link">← Back to home</Link>
            <h2 className="section-title">Participant Registration.</h2>
          </Reveal>
          <Reveal delay={80}>
            <p className="prose muted">
              Open to all {COLLEGE_SHORT} students. We read every application.
            </p>
          </Reveal>

          {receipt ? (
            <Reveal className="receipt">
              <div className="receipt-tag">Application received</div>
              <h3 className="receipt-name">Welcome, {receipt.fullName}.</h3>
              <p className="prose muted">Keep the ID below — we reference it in correspondence.</p>
              <div className="receipt-id">{receipt.applicationId}</div>
              <div className="receipt-grid">
                <div><span>Roll No.</span><strong>{receipt.rollNo}</strong></div>
                <div><span>Year</span><strong>{receipt.year}</strong></div>
                <div><span>Branch</span><strong>{receipt.branch}</strong></div>
                <div><span>Interest</span><strong>{receipt.interest}</strong></div>
                <div><span>Laptop</span><strong>{receipt.hasLaptop}</strong></div>
                <div><span>Email</span><strong>{receipt.email}</strong></div>
              </div>
              <div className="receipt-actions">
                <button className="btn btn-ghost" onClick={reset}>Register another →</button>
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
                  <Field label="Interest" name="interest" value={form.interest} onChange={handleChange} as="select">
                    {INTERESTS.map((i) => <option key={i} value={i}>{i}</option>)}
                  </Field>
                  <Field label="Experience" name="experience" value={form.experience} onChange={handleChange} as="select">
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </Field>
                </div>
                <Field label="Do you have a laptop?" name="hasLaptop" value={form.hasLaptop} onChange={handleChange} error={errors.hasLaptop} as="select">
                  <option value="">Select…</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </Field>
                <Field label="Why do you want to join?" name="reason" value={form.reason} onChange={handleChange} error={errors.reason} as="textarea" placeholder="A sentence or two — no wrong answers." />

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
