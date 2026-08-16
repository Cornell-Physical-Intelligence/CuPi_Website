// Routing, kept apart from App so that main.jsx can read the current route and start
// fetching its page before React exists.

export const VALID_PAGES = ['home', 'work', 'members', 'sponsors', 'apply'];

// Real paths rather than #fragments. The build writes an index.html into a folder per
// route, so /work is a genuine document that Pages can serve and the router reads back
// from the pathname.
export const getPageFromPath = () => {
  const seg = window.location.pathname.replace(/^\/+|\/+$/g, '');
  return VALID_PAGES.includes(seg) ? seg : 'home';
};

export const writePath = (page) => {
  window.history.pushState({}, '', page === 'home' ? '/' : `/${page}/`);
};

// Anything still linking to the old #work style URLs is rewritten in place, once, before
// the first render, so those links keep working and no stray fragment is left in the bar.
export const normalizeLegacyHash = () => {
  const legacy = window.location.hash.replace('#', '');
  if (VALID_PAGES.includes(legacy)) {
    window.history.replaceState({}, '', legacy === 'home' ? '/' : `/${legacy}/`);
  } else if (window.location.hash) {
    window.history.replaceState({}, '', window.location.pathname);
  }
};

// Home is absent on purpose: it ships inside the entry chunk, because it is where most
// visits begin and it is the one page that cannot afford to wait for a second module.
export const PAGE_LOADERS = {
  work: () => import('./pages/Work'),
  members: () => import('./pages/Members'),
  sponsors: () => import('./pages/Sponsors'),
  apply: () => import('./pages/Apply'),
};
