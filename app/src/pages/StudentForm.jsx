import React from 'react';
import { Link } from 'react-router-dom';
import { Reveal, COLLEGE_SHORT } from '../shared.jsx';

export default function StudentForm() {
  return (
    <section className="section page-form">
      <div className="section-grid">
        <Reveal className="section-label">
          <span className="num">M</span>
          <span>Member</span>
        </Reveal>
        <div className="section-body">
          <Reveal>
            <Link to="/" className="back-link">← Back to home</Link>
            <h2 className="section-title">Member Registration.</h2>
          </Reveal>

          <Reveal delay={80}>
            <div className="coming-soon">
              <div className="coming-tag">Opening soon</div>
              <h3 className="coming-title">Not open yet.</h3>
              <p className="prose">
                Member registration for the {COLLEGE_SHORT} Coding Club opens
                in a few days. Check back shortly — or apply for the committee
                below if you want to help run it.
              </p>
              <div className="coming-actions">
                <Link to="/register/committee" className="btn btn-primary">
                  Apply for Committee →
                </Link>
                <Link to="/" className="btn btn-ghost">Back to home</Link>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
