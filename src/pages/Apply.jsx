import { useEffect, useRef, useState } from 'react';
import SiteFooter from '../components/SiteFooter';
import ResponsiveImage from '../components/ResponsiveImage';
import { APPLY_ART_PICTURES } from '../data/applyArt';
import './Apply.css';

// The crab is most of what this page is, so it keeps the delayed loading label the frames
// had. Only admit to loading if it is actually slow — a fast load should never flash text.
// No reset once loaded: the label is rendered behind !hasLoaded, so the flag going stale
// at true is invisible.
function CrabPicture() {
  const [hasLoaded, setHasLoaded] = useState(false);
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    if (hasLoaded) return undefined;
    const timeoutId = window.setTimeout(() => {
      setShowLoading(true);
    }, 500);
    return () => window.clearTimeout(timeoutId);
  }, [hasLoaded]);

  return (
    <div className={`apply-page__logo-wrap ${hasLoaded ? 'is-loaded' : 'is-loading'}`}>
      {!hasLoaded && showLoading && <span className="apply-page__logo-loading">Crab Loading...</span>}
      {/* The crab is the page's largest contentful paint, so it keeps high priority — the
          saving here is in what gets fetched, not when. Drawn at min(420px, 84vw, 44vh). */}
      <ResponsiveImage
        sources={APPLY_ART_PICTURES.CrabOnBeach}
        sizes="(max-width: 500px) 84vw, 420px"
        alt="The CUPI crab on a beach"
        className="apply-page__logo"
        draggable={false}
        onLoad={() => setHasLoaded(true)}
        onError={() => setHasLoaded(true)}
        fetchPriority="high"
        decoding="async"
      />
    </div>
  );
}

// Submissions go to the wiki's backend: same Postgres and email the team
// already runs, nothing third-party. Locally, `npm run dev` in the wiki repo
// serves the same API on 4870.
const INTEREST_API = import.meta.env.DEV
  ? 'http://127.0.0.1:4870'
  : 'https://wiki.cornellphysicalintelligence.com';

const CONTACT_EMAIL = 'cuphysint@cornell.edu';
const SUBTEAMS = ['Not sure yet', 'Mechanical', 'Electrical', 'Software', 'Business & Marketing'];
const FILE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'application/pdf'];
const MAX_FILE_BYTES = 2.5 * 1024 * 1024;

// The site rule is no native pickers on styled surfaces, so the subteam
// control is a listbox with roving focus: arrows move, Enter picks, Esc
// returns to the button, and a click anywhere else closes it.
function SubteamSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const buttonRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDocDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', onDocDown);
    return () => document.removeEventListener('pointerdown', onDocDown);
  }, [open]);

  useEffect(() => {
    if (open) listRef.current?.querySelector('[aria-selected="true"]')?.focus();
  }, [open]);

  const pick = (option) => {
    onChange(option);
    setOpen(false);
    buttonRef.current?.focus();
  };

  const onListKeyDown = (event) => {
    const items = [...(listRef.current?.querySelectorAll('[role="option"]') ?? [])];
    const at = items.indexOf(document.activeElement);
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      items[Math.min(at + 1, items.length - 1)]?.focus();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      items[Math.max(at - 1, 0)]?.focus();
    } else if (event.key === 'Home') {
      event.preventDefault();
      items[0]?.focus();
    } else if (event.key === 'End') {
      event.preventDefault();
      items[items.length - 1]?.focus();
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      pick(document.activeElement?.dataset.value ?? value);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
      buttonRef.current?.focus();
    } else if (event.key === 'Tab') {
      setOpen(false);
    }
  };

  return (
    <div className="ifz-dd" ref={rootRef}>
      <button
        type="button"
        className="ifz-dd__button"
        ref={buttonRef}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            setOpen(true);
          }
        }}
      >
        <span>{value}</span>
        <svg className="ifz-dd__chevron" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <ul className="ifz-dd__list" role="listbox" aria-label="Subteam of interest" ref={listRef} onKeyDown={onListKeyDown}>
          {SUBTEAMS.map((option) => (
            <li
              key={option}
              role="option"
              tabIndex={-1}
              data-value={option}
              aria-selected={option === value}
              onClick={() => pick(option)}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// One box answers the project question: type in it, drag a file onto it, or
// tap the attach line to browse. Every file is checked here before a byte is
// uploaded.
function ProjectBox({ project, onProject, file, onFile, onProblem }) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const accept = (candidate) => {
    if (!candidate) return;
    if (!FILE_TYPES.includes(candidate.type)) {
      onProblem('Images or PDF only for the file.');
      return;
    }
    if (candidate.size > MAX_FILE_BYTES) {
      onProblem('Files are capped at 2.5 MB.');
      return;
    }
    onProblem('');
    onFile(candidate);
  };

  return (
    <div
      className={`ifz-projectbox ${dragOver ? 'is-over' : ''}`}
      onDragOver={(event) => {
        event.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setDragOver(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        setDragOver(false);
        accept(event.dataTransfer?.files?.[0]);
      }}
    >
      <textarea
        id="interest-project"
        className="ifz-projectbox__text"
        value={project}
        onChange={(event) => onProject(event.target.value)}
        maxLength={1000}
        placeholder="Tell us about it, or drop a photo or PDF right here..."
      />
      {file ? (
        <div className="ifz-file">
          <span className="ifz-file__name">{file.name}</span>
          <span className="ifz-file__size">{Math.max(1, Math.round(file.size / 1024))} KB</span>
          <button type="button" className="ifz-file__remove" aria-label={`Remove ${file.name}`} onClick={() => onFile(null)}>
            ×
          </button>
        </div>
      ) : (
        <button type="button" className="ifz-attach" onClick={() => inputRef.current?.click()}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="m16 6-8.4 8.6a2 2 0 0 0 2.8 2.8L18.8 9a4 4 0 1 0-5.6-5.7l-8.4 8.6a6 6 0 1 0 8.5 8.5l8.4-8.6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
          Attach a photo or PDF
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        hidden
        accept={FILE_TYPES.join(',')}
        onChange={(event) => {
          accept(event.target.files?.[0]);
          event.target.value = '';
        }}
      />
    </div>
  );
}

const readAsBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1] || '');
    reader.onerror = () => reject(new Error('The file could not be read.'));
    reader.readAsDataURL(file);
  });

function InterestForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subteam, setSubteam] = useState(SUBTEAMS[0]);
  const [project, setProject] = useState('');
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const honeypotRef = useRef(null);

  const submit = async (event) => {
    event.preventDefault();
    if (status === 'sending') return;
    const cleanName = name.trim();
    const cleanEmail = email.trim();
    if (!cleanName) {
      setError('Tell us your name.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(cleanEmail)) {
      setError('That email does not look right.');
      return;
    }
    setError('');
    setStatus('sending');
    try {
      const payload = {
        name: cleanName,
        email: cleanEmail,
        subteam: subteam === SUBTEAMS[0] ? '' : subteam,
        project: project.trim(),
        file: file ? { name: file.name, type: file.type, data: await readAsBase64(file) } : null,
        website: honeypotRef.current?.value || '',
      };
      const res = await fetch(`${INTEREST_API}/api/interest`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const out = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(out.error || 'Something went wrong.');
      setStatus('done');
    } catch (problem) {
      setStatus('idle');
      setError(`${problem.message || 'Something went wrong.'} You can also email ${CONTACT_EMAIL}.`);
    }
  };

  if (status === 'done') {
    return (
      <div className="ifz ifz--done" role="status">
        <p className="ifz-done__title">You&apos;re on the list.</p>
        <p className="ifz-done__note">We read every one of these. Keep an eye on your inbox when recruiting opens.</p>
      </div>
    );
  }

  return (
    <form className="ifz" onSubmit={submit} noValidate>
      <div className="ifz-field">
        <label className="ifz-label" htmlFor="interest-name">
          Name
        </label>
        <input
          id="interest-name"
          className="ifz-input"
          value={name}
          onChange={(event) => setName(event.target.value)}
          autoComplete="name"
          maxLength={100}
          required
        />
      </div>
      <div className="ifz-field">
        <label className="ifz-label" htmlFor="interest-email">
          Email
        </label>
        <input
          id="interest-email"
          className="ifz-input"
          type="email"
          inputMode="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          placeholder="netid@cornell.edu"
          maxLength={200}
          required
        />
      </div>
      <div className="ifz-field">
        <span className="ifz-label" id="interest-subteam-label">
          Subteam of interest
        </span>
        <SubteamSelect value={subteam} onChange={setSubteam} />
      </div>
      <div className="ifz-field">
        <label className="ifz-label" htmlFor="interest-project">
          What&apos;s the coolest project you&apos;ve done?
        </label>
        <ProjectBox project={project} onProject={setProject} file={file} onFile={setFile} onProblem={setError} />
      </div>
      {/* Honeypot: humans never see it, autofill and bots do. */}
      <input
        ref={honeypotRef}
        className="ifz-honeypot"
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />
      <p className={`ifz-error ${error ? 'is-visible' : ''}`} role="alert" aria-live="polite">
        {error}
      </p>
      <button className="ifz-submit" type="submit" disabled={status === 'sending'}>
        {status === 'sending' ? 'Sending...' : 'Join the interest list'}
      </button>
      <p className="ifz-fine">We only use this to contact you about CUPI recruiting.</p>
    </form>
  );
}

export default function Apply() {
  return (
    <main className="alt-page alt-page--apply">
      <h1 className="visually-hidden">Cornell Physical Intelligence Applications</h1>
      <section className="alt-section alt-section--apply">
        <div className="apply-page">
          <CrabPicture />
          <p className="apply-page__intro">Fill in the information below to display interest in applying to CUPI.</p>
          <InterestForm />
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
