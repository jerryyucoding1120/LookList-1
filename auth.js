/* Shared Supabase auth for all pages (static-site friendly) */
(function () {
  // 1) Your Supabase project config
  const SUPABASE_URL = 'https://rgzdgeczrncuxufkyuxf.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJnemRnZWN6cm5jdXh1Zmt5dXhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxOTI3MTAsImV4cCI6MjA3MTc2ODcxMH0.dYt-MxnGZZqQ-pUilyMzcqSJjvlCNSvUCYpVJ6TT7dU';

  if (!window.supabase?.createClient) {
    console.error('Supabase JS not loaded. Include @supabase/supabase-js v2 before auth.js');
    return;
  }

  // 2) Two clients so sessions work whether the user picked "Remember me" or not
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
    await Promise.allSettled([spLocal.auth.signOut(), spSession.auth.signOut()]);
    try { updateUI(null); } catch {}
    window.location.href = 'index.html';
  }

  function updateUI(user) {
    // Toggle Sign in / Sign out links
    document.querySelectorAll('[data-auth="signin"]').forEach(el => {
      el.hidden = !!user;
      if (!user) el.onclick = null;
    });
    document.querySelectorAll('[data-auth="signout"]').forEach(el => {
      el.hidden = !user;
      if (user) {
        el.onclick = (e) => { e.preventDefault(); signOut(); };
      } else {
        el.onclick = null;
      }
    });

    // Display user name (or email)
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

    document.body.classList.toggle('is-auth', !!user);
    document.body.classList.toggle('is-guest', !user);
  }

  function currentPathWithQueryAndHash() {
    const { pathname, search, hash } = window.location;
    return `${pathname}${search}${hash}`;
  }

  // Initialize per page
  async function authInit(options = {}) {
    const { requireAuth = false } = options;

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

  // Expose a small API globally
  window.authInit = authInit;
  window.getCurrentUser = getUser;
  window.authSignOut = signOut;
  window.authClients = { spLocal, spSession };
})();