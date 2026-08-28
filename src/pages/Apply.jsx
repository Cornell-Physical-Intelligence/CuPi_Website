// ============================================================================
// RECRUITING TOGGLE — the one line to change.
//
//   true  → ApplyOpen:   the interest form (recruiting season)
//   false → ApplyClosed: the crab and "applications are closed" note
//
// Both variants are finished and reviewed; flip the flag, never rewrite them.
// When flipping, also consider the `apply` description and lastModified in
// src/seo.js (and re-sync public/sitemap.xml). Details: README, "Apply page:
// open vs closed", and AGENTS.md.
// ============================================================================
import ApplyOpen from './ApplyOpen';
import ApplyClosed from './ApplyClosed';

const APPLY_ACTIVE = true;

export default APPLY_ACTIVE ? ApplyOpen : ApplyClosed;
