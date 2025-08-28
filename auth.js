/* Shared Supabase auth for all pages (static-site friendly)
   - Automatically switches "Sign in" to "Sign out" after login
   - Fills [data-auth="user-name"] with user name/email
   - Exposes:
       window.authInit({ requireAuth?: boolean })
       window.authSignOut()
       window.authClients = { spLocal, spSession }
*/

(function () {
  const SUPABASE_URL = 'https://rgzdgeczrncuxufkyuxf.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJnemRnZWN6cm5jdXh1Zmt5dXhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxOTI3MTAsImV4cCI6MjA3MTc2ODcxMH0.dYt-MxnGZZqQ-pUilyMzcqSJjvlCNSvUCYpVJ6TT7dU';

  if (!window.supabase?.createClient) {
    console.error('Supabase JS not loaded. Include @supabase/supabase-js v2 before auth.js');
    return;
  }

  // Two clients so "Remember me" can use localStorage vs sessionStorage
  const spLocal = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storage: localStorage }
  });
  const spSession = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storage: sessionStorage }
  });

  async function getSession() {
    const [{ data: l }, { data: s }] = await Promise.all([
      spLocal.auth.getSession(),
      spSession.auth.getSession()
    ]);
    return l?.session || s?.session || null;
  }

  async function getUser() {
    const session = await getSession();
    return session?.user || null;
  }

  async function signOut() {
    // Sign out of both storages (best effort)
    await Promise.allSettled([spLocal.auth.signOut(), spSession.auth.signOut()]);
    try { updateUI(null); } catch {}
    // Redirect home after sign-out
    window.location.href = 'index.html';
  }

  function updateUI(user) {
    // Toggle Sign in / Sign out buttons
    document.querySelectorAll('[data-auth="signin"]').forEach(el => {
      el.hidden = !!user; // hide "Sign in" when logged in
      if (!user) {
        el.onclick = null; // restore default navigation
        el.setAttribute('aria-current', el.getAttribute('aria-current') || 'false');
      }
    });
    document.querySelectorAll('[data-auth="signout"]').forEach(el => {
      el.hidden = !user; // show "Sign out" when logged in
      if (user) {
        el.setAttribute('href', '#');
        el.onclick = (e) => { e.preventDefault(); signOut(); };
      } else {
        el.onclick = null;
      }
    });

    // Fill user name (from metadata) or email
    const name = user?.user_metadata?.name || user?.email || '';
    document.querySelectorAll('[data-auth="user-name"]').forEach(el => {
      if (name) {
        el.textContent = name;
        el.hidden = false;
      } else {
        el.textContent = '';
        el.hidden = true;
      }
    });

    // Body marker classes if you want to hook styles
    document.body.classList.toggle('is-auth', !!user);
    document.body.classList.toggle('is-guest', !user);
  }

  function currentPathWithQueryAndHash() {
    const { pathname, search, hash } = window.location;
    return `${pathname}${search}${hash}`;
  }

  // Initialize auth on each page
  async function authInit(options = {}) {
    const { requireAuth = false } = options;

    // Update UI in real-time on auth changes (e.g., email confirmation redirect)
    spLocal.auth.onAuthStateChange((_evt, session) => updateUI(session?.user || null));
    spSession.auth.onAuthStateChange((_evt, session) => updateUI(session?.user || null));

    const user = await getUser();
    updateUI(user);

    if (requireAuth && !user) {
      const next = encodeURIComponent(currentPathWithQueryAndHash());
      window.location.replace(`signin.html?next=${next}`);
      return { user: null };
    }
    return { user };
  }

  // Expose globals
  window.authInit = authInit;
  window.getCurrentUser = getUser;
  window.authSignOut = signOut;
  window.authClients = { spLocal, spSession };
})();