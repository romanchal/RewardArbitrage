import React, { useEffect, useRef, useState } from 'react';

export const DEPT = 'Department of Artificial Intelligence';
export const COLLEGE = 'Priyadarshini Bhagwati College of Engineering';
export const COLLEGE_SHORT = 'PBCOE';
export const PARENT_TRUST = "Lokmanya Tilak Jankalyan Shikshan Sanstha's";
export const ACCREDITATIONS = [
  'Autonomous',
  'NAAC "A" Grade',
  'Approved by AICTE',
  'Affiliated to RTMNU',
  'DTE Code: EN 4177',
  'Since 2007'
];

export const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
export const INTERESTS = ['Machine Learning', 'Deep Learning', 'Web Development', 'Competitive Programming', 'Data Science', 'Computer Vision', 'NLP', 'Robotics'];
export const COMMITTEE_ROLES = [
  'President',
  'Vice President',
  'Technical Lead',
  'Design Lead',
  'Content Lead',
  'Outreach & PR',
  'Event Coordinator',
  'Treasurer'
];

export function Reveal({ children, delay = 0, as: Tag = 'div', className = '' }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <Tag
      ref={ref}
      className={`reveal ${visible ? 'in' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}

export function Field({ label, name, value, onChange, error, placeholder, type = 'text', as, children }) {
  const cls = `field ${error ? 'has-error' : ''}`;
  return (
    <label className={cls}>
      <span className="field-label">{label}</span>
      {as === 'select' ? (
        <select name={name} value={value} onChange={onChange}>{children}</select>
      ) : as === 'textarea' ? (
        <textarea name={name} value={value} onChange={onChange} placeholder={placeholder} rows="3" />
      ) : (
        <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} />
      )}
      {error && <span className="field-error">{error}</span>}
    </label>
  );
}
