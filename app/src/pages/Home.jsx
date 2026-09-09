import React from 'react';
import { Link } from 'react-router-dom';
import { Reveal, DEPT, COLLEGE_SHORT } from '../shared.jsx';
import TechCloud from '../TechCloud.jsx';

const OBJECTIVES = [
  'Foster a peer-driven culture of building and shipping in the AI department.',
  'Bridge coursework and industry through weekly workshops and code sprints.',
  'Prepare members for hackathons, research internships, and open source.'
];

const LEARN = [
  { n: '01', t: 'Python & Foundations', d: 'Data structures, algorithms, and the mathematics that underpin machine intelligence.' },
  { n: '02', t: 'Applied Machine Learning', d: 'Hands-on with scikit-learn, PyTorch, and modern MLOps tooling.' },
  { n: '03', t: 'LLMs & Agents', d: 'Prompting, RAG systems, fine-tuning, and building agentic workflows.' },
  { n: '04', t: 'Software Craft', d: 'Version control, testing, code review, and shipping to production.' },
  { n: '05', t: 'Research Literacy', d: 'Reading papers, reproducing results, and writing your own findings.' },
  { n: '06', t: 'Communication', d: 'Presenting work, writing docs, and collaborating across disciplines.' }
];

const BENEFITS = [
  { t: 'Mentorship', d: 'Weekly office hours with seniors and faculty mentors.' },
  { t: 'Project Portfolio', d: 'Ship real projects that live on your GitHub and résumé.' },
  { t: 'Network', d: 'A cohort of peers, alumni, and industry practitioners.' },
  { t: 'Opportunities', d: 'Priority access to hackathons, internships, and research roles.' }
];

export default function Home() {
  return (
    <>
      <section className="hero">
        <TechCloud />
        <Reveal as="div" className="hero-inner">
          <div className="eyebrow">{DEPT} · {COLLEGE_SHORT}</div>
          <h1 className="hero-title">
            The <em>Coding Club</em>.
            <br />A quiet room for people who build.
          </h1>
          <p className="hero-lede">
            A student-run studio inside the AI department. We meet weekly, work in
            small groups, and ship things that matter.
          </p>
          <div className="hero-actions">
            <Link to="/register/committee" className="btn btn-primary">
              Apply for Committee →
            </Link>
            <Link to="/register/student" className="btn btn-ghost">
              Member Signup · Coming soon
            </Link>
          </div>
        </Reveal>
        <div className="hero-rule" />
      </section>

      <section id="about" className="section">
        <div className="section-grid">
          <Reveal className="section-label">
            <span className="num">01</span>
            <span>About</span>
          </Reveal>
          <div className="section-body">
            <Reveal><h2 className="section-title">Not a society. A workshop.</h2></Reveal>
            <Reveal delay={80}>
              <p className="prose">
                The Coding Club at the {DEPT}, {COLLEGE_SHORT}, exists so that
                curious students can meet other curious students. We are small on
                purpose — enough to know each other's names, few enough to review
                each other's code.
              </p>
            </Reveal>
            <Reveal delay={140}>
              <p className="prose">
                No hierarchy. No performance. Bring an unfinished notebook, a
                stubborn bug, or a half-written paper. We'll look at it together.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <section id="objectives" className="section alt">
        <div className="section-grid">
          <Reveal className="section-label">
            <span className="num">02</span>
            <span>Objectives</span>
          </Reveal>
          <div className="section-body">
            <Reveal><h2 className="section-title">What we're trying to do.</h2></Reveal>
            <ol className="obj-list">
              {OBJECTIVES.map((o, i) => (
                <Reveal as="li" key={o} delay={i * 100}>
                  <span className="obj-index">{String(i + 1).padStart(2, '0')}</span>
                  <span className="obj-text">{o}</span>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section id="learn" className="section">
        <div className="section-grid">
          <Reveal className="section-label">
            <span className="num">03</span>
            <span>What you'll learn</span>
          </Reveal>
          <div className="section-body">
            <Reveal><h2 className="section-title">Six threads, one year.</h2></Reveal>
            <Reveal delay={80}>
              <p className="prose muted">Sessions are cumulative. Miss one, catch up in the archive.</p>
            </Reveal>
            <div className="learn-grid">
              {LEARN.map((l, i) => (
                <Reveal as="article" key={l.t} className="learn-card" delay={i * 70}>
                  <div className="learn-num">{l.n}</div>
                  <h3 className="learn-title">{l.t}</h3>
                  <p className="learn-desc">{l.d}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="benefits" className="section alt">
        <div className="section-grid">
          <Reveal className="section-label">
            <span className="num">04</span>
            <span>Benefits</span>
          </Reveal>
          <div className="section-body">
            <Reveal><h2 className="section-title">What you take with you.</h2></Reveal>
            <div className="benefit-list">
              {BENEFITS.map((b, i) => (
                <Reveal as="div" key={b.t} className="benefit-row" delay={i * 80}>
                  <div className="benefit-title">{b.t}</div>
                  <div className="benefit-desc">{b.d}</div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="register" className="section cta-section">
        <div className="cta-grid">
          <Reveal className="cta-card">
            <div className="cta-label">For Students · Coming Soon</div>
            <h3 className="cta-title">Join as a Member.</h3>
            <p className="cta-desc">
              Open to every {COLLEGE_SHORT} student. Attend sessions, build with
              the cohort, borrow a mentor. Registration opens in a few days.
            </p>
            <Link to="/register/student" className="btn btn-ghost">
              Notify me when it opens →
            </Link>
          </Reveal>
          <Reveal className="cta-card" delay={100}>
            <div className="cta-label">For Leaders</div>
            <h3 className="cta-title">Apply for Committee.</h3>
            <p className="cta-desc">
              Run the club. Design curriculum, organize hackdays, mentor juniors.
              Best for 2nd–4th year students with time to give.
            </p>
            <Link to="/register/committee" className="btn btn-primary">
              Committee Application →
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
