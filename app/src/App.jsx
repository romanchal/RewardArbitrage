import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, NavLink, useLocation } from 'react-router-dom';
import Home from './pages/Home.jsx';
import StudentForm from './pages/StudentForm.jsx';
import CommitteeForm from './pages/CommitteeForm.jsx';
import Admin from './pages/Admin.jsx';
import { COLLEGE, DEPT, PARENT_TRUST, ACCREDITATIONS } from './shared.jsx';
import './App.css';

function useTheme() {
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'light';
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);
  return [theme, () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))];
}

function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === 'dark';
  return (
    <button onClick={onToggle} className="theme-toggle" aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}>
      {isDark ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}

function CollegeLogo() {
  return <img src="/logo.png" alt={`${COLLEGE} logo`} className="college-logo" />;
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [pathname]);
  return null;
}

function Layout({ children }) {
  const [theme, toggleTheme] = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e) => e.key === 'Escape' && setMenuOpen(false);
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const close = () => setMenuOpen(false);

  return (
    <div className="site">
      <header className="banner">
        <div className="banner-controls">
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
          <button
            className={`menu-btn ${menuOpen ? 'is-open' : ''}`}
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            <span /><span /><span />
          </button>
        </div>
        <Link to="/" className="banner-hero" onClick={close}>
          <CollegeLogo />
          <div className="banner-titles">
            <div className="banner-trust">{PARENT_TRUST}</div>
            <div className="banner-name">{COLLEGE}</div>
            <div className="banner-autonomous">An Autonomous Institution</div>
            <div className="banner-sub">
              {ACCREDITATIONS.map((a, i) => (
                <span key={a}>
                  {a}
                  {i < ACCREDITATIONS.length - 1 && <span className="dot">·</span>}
                </span>
              ))}
            </div>
          </div>
        </Link>
      </header>

      <div className={`menu-overlay ${menuOpen ? 'in' : ''}`} onClick={close} aria-hidden={!menuOpen} />
      <nav className={`menu-panel ${menuOpen ? 'in' : ''}`} aria-hidden={!menuOpen}>
        <div className="menu-label">Navigate</div>
        <NavLink to="/" end onClick={close}><span>H</span>Home</NavLink>
        <NavLink to="/register/student" onClick={close}><span>M</span>Member Registration <em className="soon">soon</em></NavLink>
        <NavLink to="/register/committee" onClick={close} className="menu-cta"><span>C</span>Committee Application</NavLink>
      </nav>

      <main>{children}</main>

      <footer className="foot">
        <div className="foot-inner">
          <div>© {new Date().getFullYear()} Coding Club · {DEPT}</div>
          <div className="muted">{COLLEGE}</div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register/student" element={<StudentForm />} />
          <Route path="/register/committee" element={<CommitteeForm />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
