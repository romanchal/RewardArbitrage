import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { collection, getDocs, orderBy, query, deleteDoc, doc } from 'firebase/firestore';
import * as XLSX from 'xlsx';
import { db } from '../firebase';
import { Reveal } from '../shared.jsx';

// Simple client-side gate. Change this to any string you want.
// For real security, use Firebase Auth + Firestore rules.
const ADMIN_KEY = 'pbcoe-ai-2026';

function formatDate(ts) {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
}

function flatten(rows) {
  return rows.map((r) => {
    const out = {};
    for (const [k, v] of Object.entries(r)) {
      if (k === 'submittedAt') out[k] = formatDate(v);
      else if (Array.isArray(v)) out[k] = v.join('; ');
      else out[k] = v ?? '';
    }
    return out;
  });
}

export default function Admin() {
  const [params] = useSearchParams();
  const [authed, setAuthed] = useState(false);
  const [keyInput, setKeyInput] = useState('');
  const [members, setMembers] = useState([]);
  const [committee, setCommittee] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('committee');
  const [error, setError] = useState('');

  useEffect(() => {
    if (params.get('key') === ADMIN_KEY) setAuthed(true);
  }, [params]);

  const fetchAll = async () => {
    setLoading(true);
    setError('');
    try {
      const [m, c] = await Promise.all([
        getDocs(query(collection(db, 'members'), orderBy('submittedAt', 'desc'))),
        getDocs(query(collection(db, 'committee'), orderBy('submittedAt', 'desc'))),
      ]);
      setMembers(m.docs.map((d) => ({ id: d.id, ...d.data() })));
      setCommittee(c.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
      setError('Failed to load. Check Firestore rules — reads must be allowed for the admin.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authed) fetchAll();
  }, [authed]);

  const handleGate = (e) => {
    e.preventDefault();
    if (keyInput.trim() === ADMIN_KEY) setAuthed(true);
    else setError('Invalid admin key.');
  };

  const downloadXLSX = () => {
    const wb = XLSX.utils.book_new();
    if (committee.length) {
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(flatten(committee)), 'Committee');
    }
    if (members.length) {
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(flatten(members)), 'Members');
    }
    if (!committee.length && !members.length) {
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['No records']]), 'Empty');
    }
    const stamp = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `pbcoe-coding-club-${stamp}.xlsx`);
  };

  const downloadCSV = (rows, name) => {
    if (!rows.length) return;
    const ws = XLSX.utils.json_to_sheet(flatten(rows));
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = async (col, id) => {
    if (!window.confirm(`Delete this ${col} record permanently?`)) return;
    try {
      await deleteDoc(doc(db, col, id));
      fetchAll();
    } catch (e) {
      console.error(e);
      alert('Delete failed. Check Firestore rules.');
    }
  };

  if (!authed) {
    return (
      <section className="section page-form">
        <div className="section-grid">
          <div className="section-label"><span className="num">A</span><span>Admin</span></div>
          <div className="section-body" style={{ maxWidth: 420 }}>
            <Link to="/" className="back-link">← Back to home</Link>
            <h2 className="section-title">Admin Access.</h2>
            <p className="prose muted">Enter the admin key to view submissions.</p>
            <form onSubmit={handleGate} className="form">
              <label className="field">
                <span className="field-label">Admin Key</span>
                <input type="password" value={keyInput} onChange={(e) => setKeyInput(e.target.value)} placeholder="••••••••" />
              </label>
              {error && <div className="alert">{error}</div>}
              <button type="submit" className="btn btn-primary btn-wide">Unlock →</button>
            </form>
          </div>
        </div>
      </section>
    );
  }

  const active = tab === 'committee' ? committee : members;
  const total = committee.length + members.length;

  return (
    <section className="section page-form">
      <div className="section-grid">
        <div className="section-label"><span className="num">A</span><span>Admin</span></div>
        <div className="section-body">
          <Link to="/" className="back-link">← Back to home</Link>
          <h2 className="section-title">Submissions.</h2>
          <p className="prose muted">
            {total} total · {committee.length} committee · {members.length} member
          </p>

          <div className="admin-toolbar">
            <div className="admin-tabs">
              <button className={`admin-tab ${tab === 'committee' ? 'active' : ''}`} onClick={() => setTab('committee')}>
                Committee ({committee.length})
              </button>
              <button className={`admin-tab ${tab === 'members' ? 'active' : ''}`} onClick={() => setTab('members')}>
                Members ({members.length})
              </button>
            </div>
            <div className="admin-actions">
              <button className="btn btn-ghost" onClick={fetchAll} disabled={loading}>
                {loading ? 'Loading…' : 'Refresh'}
              </button>
              <button className="btn btn-ghost" onClick={() => downloadCSV(active, tab)}>
                Export .csv
              </button>
              <button className="btn btn-primary" onClick={downloadXLSX}>
                Export .xlsx (all)
              </button>
            </div>
          </div>

          {error && <div className="alert">{error}</div>}

          {loading ? (
            <p className="prose muted">Loading…</p>
          ) : active.length === 0 ? (
            <p className="prose muted">No {tab} submissions yet.</p>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Roll No.</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Year</th>
                    {tab === 'committee' ? <th>Role</th> : <th>Interest</th>}
                    <th>Submitted</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {active.map((r) => (
                    <tr key={r.id}>
                      <td className="mono">{r.applicationId}</td>
                      <td>{r.fullName}</td>
                      <td>{r.rollNo}</td>
                      <td>{r.email}</td>
                      <td>{r.phone}</td>
                      <td>{r.year}</td>
                      <td>{tab === 'committee' ? r.role : r.interest}</td>
                      <td>{formatDate(r.submittedAt)}</td>
                      <td>
                        <button className="del-btn" onClick={() => handleDelete(tab, r.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
