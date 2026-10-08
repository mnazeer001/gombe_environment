/* =====================================================================
   Gombe State Ministry of Environment & Forest Resources
   ADMIN CONSOLE — app.js
   Shell, router, dashboard, page/CMS manager, analytics, settings,
   global search, notifications and session handling.
   ===================================================================== */
(function (global) {
  'use strict';

  var S = global.AdminStore, UI = global.UI, C = global.Crud, V = global.AdminViews;
  var F = UI.F, icon = UI.icon;
  var PREFS = 'gmbeAdminPrefs.v1';

  /* =====================================================================
     PREFERENCES
     ===================================================================== */
  /* Preference storage falls back to memory when the browser blocks
     localStorage (opaque origin, e.g. opening the file directly in Chrome). */
  var PREF_STORE = (function () {
    try {
      var t = '__probe' + Math.random();
      localStorage.setItem(t, '1'); localStorage.removeItem(t);
      return localStorage;
    } catch (e) {
      var m = {};
      return {
        getItem: function (k) { return Object.prototype.hasOwnProperty.call(m, k) ? m[k] : null; },
        setItem: function (k, v) { m[k] = String(v); },
        removeItem: function (k) { delete m[k]; }
      };
    }
  })();
  var prefs = (function () {
    try { return JSON.parse(PREF_STORE.getItem(PREFS) || '{}'); } catch (e) { return {}; }
  })();
  function savePrefs() { try { PREF_STORE.setItem(PREFS, JSON.stringify(prefs)); } catch (e) { } }
  function applyPrefs() {
    document.documentElement.setAttribute('data-theme', prefs.theme === 'dark' ? 'dark' : 'light');
    document.body.classList.toggle('dense', !!prefs.dense);
    document.body.classList.toggle('side-collapsed', !!prefs.collapsed);
    var sb = document.querySelector('.sidebar');
    if (sb) sb.classList.toggle('collapsed', !!prefs.collapsed);
    if (prefs.accent) {
      document.documentElement.style.setProperty('--accent', prefs.accent);
      document.documentElement.style.setProperty('--green-700', prefs.accent);
    }
  }

  /* =====================================================================
     NAVIGATION
     ===================================================================== */
  var NAV = [
    {
      group: 'Overview', items: [
        { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', perm: 'dashboard' },
        { id: 'analytics', label: 'Analytics', icon: 'analytics', perm: 'analytics' },
        { id: 'tasks', label: 'Tasks & approvals', icon: 'clipboard', perm: 'dashboard', count: function () { return S.list('tasks').filter(function (t) { return !t.done; }).length; } }
      ]
    },
    {
      group: 'Content', items: [
        { id: 'news', label: 'Newsroom', icon: 'news', perm: 'content', count: function () { return S.list('news').filter(function (n) { return n.status === 'Draft' || n.status === 'In review'; }).length; } },
        { id: 'pages', label: 'Pages & SEO', icon: 'pages', perm: 'content' },
        { id: 'projects', label: 'Projects', icon: 'projects', perm: 'content' },
        { id: 'departments', label: 'Departments & people', icon: 'departments', perm: 'content' },
        { id: 'services', label: 'Services & fees', icon: 'services', perm: 'content' },
        { id: 'events', label: 'Events & calendar', icon: 'calendar', perm: 'content' }
      ]
    },
    {
      group: 'Media', items: [
        { id: 'media', label: 'Media library', icon: 'media', perm: 'media' },
        { id: 'gallery', label: 'Photo gallery', icon: 'gallery', perm: 'media' },
        { id: 'documents', label: 'Documents', icon: 'download', perm: 'media', count: function () { return S.list('documents').filter(function (d) { return !d.public; }).length; } }
      ]
    },
    {
      group: 'Operations', items: [
        { id: 'enquiries', label: 'Enquiries', icon: 'mail', perm: 'enquiries', count: function () { return S.list('messages').filter(function (m) { return !m.read; }).length; }, hot: true },
        { id: 'reports', label: 'Incident reports', icon: 'alert', perm: 'enquiries', count: function () { return S.list('reports').filter(function (r) { return r.severity === 'Critical' && r.status !== 'Resolved' && r.status !== 'Closed'; }).length; }, hot: true },
        { id: 'permits', label: 'Permits', icon: 'clipboard', perm: 'permits', count: function () { return S.list('permits').filter(function (p) { return ['New', 'Under review', 'Site verification'].indexOf(p.status) > -1; }).length; } }
      ]
    },
    {
      group: 'Audience', items: [
        { id: 'subscribers', label: 'Newsletter', icon: 'send', perm: 'content' }
      ]
    },
    {
      group: 'Administration', items: [
        { id: 'users', label: 'Users & roles', icon: 'shield', perm: 'users' },
        { id: 'audit', label: 'Audit log', icon: 'history', perm: 'audit' },
        { id: 'settings', label: 'Settings', icon: 'settings', perm: 'settings' }
      ]
    }
  ];

  var ROUTE_META = {};
  NAV.forEach(function (g) {
    g.items.forEach(function (i) { ROUTE_META[i.id] = { label: i.label, icon: i.icon, group: g.group, perm: i.perm }; });
  });

  function rolePerms() {
    var u = S.currentUser();
    if (!u) return {};
    var r = S.list('roles').filter(function (x) { return x.name === u.role; })[0];
    return (r && r.perms) || { dashboard: 1 };
  }
  function can(perm) { return !!rolePerms()[perm]; }

  /* =====================================================================
     SHELL
     ===================================================================== */
  function buildShell() {
    var u = S.currentUser() || { name: 'Administrator', role: 'Super Admin' };
    document.body.innerHTML =
      '<a class="skip-link" href="#main">Skip to content</a>' +
      '<div class="app">' +
      /* ---- sidebar ---- */
      '<aside class="sidebar" id="sidebar" aria-label="Console navigation">' +
      '<div class="side-head">' + UI.crest +
      '<div class="side-brand"><strong>' + F.esc(S.data.settings.siteShort || 'Gombe Environment') + '</strong><span>Admin console</span></div>' +
      '<button class="side-close" data-navclose aria-label="Close navigation">' + icon('x', 18) + '</button>' +
      '</div>' +
      '<div class="side-scroll"><nav class="side-nav" id="sideNav"></nav></div>' +
      '<div class="side-foot"><div class="side-card">' +
      '<div class="t">' + icon('db', 16) + ' Browser storage</div>' +
      '<p>Content is saved locally in this browser.</p>' +
      '<div class="meter"><i id="storeMeter" style="width:0"></i></div>' +
      '<div class="sm"><span id="storeUsed">—</span> of ~5 MB used</div>' +
      '<button class="btn" data-backup>' + icon('download', 14) + ' Export backup</button>' +
      '</div></div></aside>' +
      '<div class="scrim" id="scrim"></div>' +

      /* ---- main ---- */
      '<div class="main">' +
      '<header class="topbar">' +
      '<button class="icon-btn" data-navtoggle aria-label="Toggle navigation" aria-expanded="false">' + icon('menu', 20) + '</button>' +
      '<div class="tb-title"><div class="tb-crumb" id="crumb"></div><h1 id="pageTitle">Dashboard</h1></div>' +
      '<div class="tb-spacer"></div>' +
      '<div class="gsearch">' + icon('search', 16) + '<input type="search" id="gsearch" placeholder="Search everything…" autocomplete="off" aria-label="Search the console" role="combobox" aria-expanded="false" aria-controls="gsr"><kbd>Ctrl K</kbd>' +
      '<div class="gsearch-results" id="gsr" role="listbox"></div></div>' +
      '<button class="icon-btn hide-sm" data-quickadd aria-label="Quick create">' + icon('plus', 20) + '</button>' +
      '<a class="icon-btn hide-sm" href="../index.html" target="_blank" rel="noopener" aria-label="View public website" title="View public website">' + icon('external', 19) + '</a>' +
      '<button class="icon-btn" data-themebtn aria-label="Switch colour theme" title="Switch theme">' + icon(prefs.theme === 'dark' ? 'sun' : 'moon', 19) + '</button>' +
      '<div class="menu" id="notifMenu"><button class="icon-btn" data-menu aria-label="Notifications" aria-expanded="false">' + icon('bell', 19) + '<span class="notif-dot" id="notifCount">0</span></button>' +
      '<div class="menu-pop wide" role="dialog" aria-label="Notifications"><div class="menu-h"><strong>Notifications</strong><button class="link" data-notifread>Mark all read</button></div>' +
      '<div class="menu-list" id="notifList"></div><div class="menu-f"><a href="#/enquiries">Open the enquiries inbox</a></div></div></div>' +
      '<div class="menu" id="profMenu"><button class="prof" data-menu aria-expanded="false" aria-label="Account menu">' +
      UI.avatar(u.name, '', u.avatar) + '<span class="pb"><strong>' + F.esc(u.name) + '</strong><span>' + F.esc(u.role) + '</span></span>' + icon('chevronDown', 14, 'chev') + '</button>' +
      '<div class="menu-pop prof-pop" role="dialog" aria-label="Account">' +
      '<div class="prof-head">' + UI.avatar(u.name, 'avatar-lg', u.avatar) + '<div class="nm"><strong>' + F.esc(u.name) + '</strong><span>' + F.esc(u.email || '') + '</span></div></div>' +
      '<div class="prof-links">' +
      '<a href="#/dashboard">' + icon('dashboard', 16) + ' Dashboard</a>' +
      '<a href="#/settings">' + icon('settings', 16) + ' Console settings</a>' +
      '<button data-density>' + icon('list', 16) + ' Compact density <span class="badge b-outline" style="margin-left:auto" id="densState">' + (prefs.dense ? 'On' : 'Off') + '</span></button>' +
      '<button data-shortcuts>' + icon('key', 16) + ' Keyboard shortcuts</button>' +
      '<button data-help>' + icon('info', 16) + ' Help & about</button>' +
      '<div class="sep"></div>' +
      '<button class="danger" data-logout>' + icon('logout', 16) + ' Sign out</button>' +
      '</div></div></div>' +
      '</header>' +
      (S.data.settings.maintenance && S.data.settings.maintenance.enabled
        ? '<div class="note warn" style="border-radius:0;border-left:0;border-right:0;padding:.5rem 1rem">' + icon('alert', 16) + '<div><b>Maintenance mode is ON.</b> Visitors see: "' + F.esc(S.data.settings.maintenance.message) + '"</div></div>' : '') +
      '<main class="content" id="main" tabindex="-1"></main>' +
      '</div></div>';

    renderNav();
    updateStorageMeter();
  }

  function renderNav() {
    var nav = document.getElementById('sideNav');
    if (!nav) return;
    var html = '';
    NAV.forEach(function (g) {
      var items = g.items.filter(function (i) { return can(i.perm); });
      if (!items.length) return;
      html += '<div class="side-group"><div class="side-label">' + F.esc(g.group) + '</div>' +
        items.map(function (i) {
          var c = i.count ? i.count() : 0;
          return '<a href="#/' + i.id + '" data-route="' + i.id + '">' + icon(i.icon, 18) +
            '<span class="txt">' + F.esc(i.label) + '</span>' +
            (c ? '<span class="cnt' + (i.hot ? ' hot' : '') + '">' + c + '</span>' : '') + '</a>';
        }).join('') + '</div>';
    });
    nav.innerHTML = html;
  }

  function updateStorageMeter() {
    var m = document.getElementById('storeMeter'), u = document.getElementById('storeUsed');
    if (!m || !u) return;
    var bytes = S.size(), quota = 5 * 1024 * 1024;
    m.style.width = Math.min(100, (bytes / quota) * 100).toFixed(1) + '%';
    u.textContent = F.bytes(bytes);
  }

  /* =====================================================================
     ROUTER
     ===================================================================== */
  var currentRoute = '';
  function go(route, replace) {
    if (replace) location.replace('#/' + route);
    else location.hash = '#/' + route;
  }
  function route() {
    var r = (location.hash || '#/dashboard').replace(/^#\//, '').split('?')[0];
    if (!ROUTE_META[r]) r = 'dashboard';
    return r;
  }

  var viewCache = {};
  function render() {
    var r = route();
    if (!can(ROUTE_META[r].perm)) r = 'restricted:' + r;
    var main = document.getElementById('main');
    var meta = ROUTE_META[route()] || { label: 'Restricted', icon: 'lock', group: 'Overview' };

    document.getElementById('pageTitle').textContent = meta.label;
    document.getElementById('crumb').innerHTML = '<span>Admin</span>' + icon('chevronRight', 11) + '<span>' + F.esc(meta.group) + '</span>' + icon('chevronRight', 11) + '<b>' + F.esc(meta.label) + '</b>';
    document.title = meta.label + ' · Admin · ' + (S.data.settings.siteShort || 'Gombe Environment');

    document.querySelectorAll('#sideNav a').forEach(function (a) {
      a.classList.toggle('active', a.dataset.route === route());
      a.setAttribute('aria-current', a.dataset.route === route() ? 'page' : 'false');
    });

    main.innerHTML = '<div class="view active" data-view></div>';
    var host = main.querySelector('[data-view]');
    var helpers = { go: go, repaint: function () { renderNav(); render(); } };

    if (String(r).indexOf('restricted:') === 0) return renderRestricted(host, r.split(':')[1]);

    var fn = VIEWS[r];
    if (fn) fn(host, helpers);
    else host.innerHTML = '<div class="empty">' + icon('compass', 44) + '<div class="t1">Module not found</div></div>';

    renderNav();
    updateStorageMeter();
    renderNotifications();
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  function renderRestricted(host, id) {
    var meta = ROUTE_META[id] || { label: id };
    host.innerHTML = '<div class="card"><div class="empty">' + icon('lock', 44) +
      '<div class="t1">You do not have permission to open ' + F.esc(meta.label) + '</div>' +
      '<div class="t2">Your role (<b>' + F.esc((S.currentUser() || {}).role) + '</b>) does not include the "' + F.esc(meta.perm) + '" permission. Ask a Super Admin to grant it under Users &amp; roles → Roles &amp; permissions.</div>' +
      '<button class="btn btn-primary" data-home>' + icon('dashboard', 15) + 'Back to dashboard</button></div></div>';
    host.querySelector('[data-home]').addEventListener('click', function () { go('dashboard'); });
  }

  /* route → view function table */
  var VIEWS = {
    dashboard: dashboardView,
    analytics: analyticsView,
    tasks: tasksView,
    news: V.news,
    pages: pagesView,
    projects: V.projects,
    departments: V.departments,
    services: V.services,
    media: V.media,
    gallery: V.gallery,
    documents: V.documents,
    enquiries: V.enquiries,
    reports: V.reports,
    permits: V.permits,
    events: V.events,
    subscribers: V.subscribers,
    users: V.users,
    audit: V.audit,
    settings: settingsView
  };

  /* =====================================================================
     DASHBOARD
     ===================================================================== */
  function dashboardView(host, h) {
    var msgs = S.list('messages'), news = S.list('news'), permits = S.list('permits'),
      reports = S.list('reports'), projects = S.list('projects'), gallery = S.list('gallery'),
      subs = S.list('subscribers'), media = S.list('media'), docs = S.list('documents'), tasks = S.list('tasks');
    var u = S.currentUser() || { name: 'Administrator' };
    var hour = new Date().getHours();
    var greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    var traffic = S.data.analytics.traffic;
    var last7 = traffic.slice(-7).reduce(function (a, b) { return a + b.views; }, 0);
    var prev7 = traffic.slice(-14, -7).reduce(function (a, b) { return a + b.views; }, 0);
    var trafficTrend = prev7 ? ((last7 - prev7) / prev7) * 100 : 0;

    var kpis = [
      { label: 'Website visits (7d)', value: F.num(last7), icon: 'activity', tone: '', trend: trafficTrend, sub: 'vs previous 7 days', spark: traffic.slice(-14).map(function (t) { return t.views; }) },
      { label: 'Unread enquiries', value: msgs.filter(function (m) { return !m.read; }).length, icon: 'mail', tone: 'k-info', trend: null, sub: msgs.filter(function (m) { return m.status === 'New'; }).length + ' new · ' + msgs.filter(function (m) { return m.priority === 'Urgent'; }).length + ' urgent', spark: [3, 5, 4, 8, 6, 9, 7, 11, 8, 6, 9, 12] },
      { label: 'Permits awaiting decision', value: permits.filter(function (p) { return ['New', 'Under review', 'Site verification'].indexOf(p.status) > -1; }).length, icon: 'clipboard', tone: 'k-gold', trend: null, sub: F.nairaShort(permits.reduce(function (a, b) { return a + (b.paid ? b.fee : 0); }, 0)) + ' revenue collected', spark: [6, 8, 7, 9, 11, 10, 12, 9, 8, 10, 9, 8] },
      { label: 'Open incidents', value: reports.filter(function (r) { return r.status !== 'Resolved' && r.status !== 'Closed'; }).length, icon: 'alert', tone: 'k-danger', trend: null, sub: reports.filter(function (r) { return r.severity === 'Critical'; }).length + ' critical severity', spark: [2, 3, 5, 4, 6, 8, 7, 9, 6, 5, 7, 6] },
      { label: 'Published stories', value: news.filter(function (n) { return n.status === 'Published'; }).length, icon: 'news', tone: 'k-ok', trend: 12.5, sub: news.filter(function (n) { return n.status !== 'Published'; }).length + ' in the pipeline', spark: [4, 4, 5, 6, 6, 7, 7, 8, 9, 9, 10, 10] },
      { label: 'Active programmes', value: projects.filter(function (p) { return p.status === 'Active'; }).length, icon: 'projects', tone: 'k-purple', trend: null, sub: Math.round(projects.reduce(function (a, b) { return a + b.progress; }, 0) / (projects.length || 1)) + '% average progress', spark: [40, 44, 48, 52, 55, 58, 60, 62, 64, 66, 67, 68] },
      { label: 'Gallery photos', value: gallery.filter(function (g) { return g.published; }).length, icon: 'gallery', tone: 'k-teal', trend: null, sub: media.length + ' library assets', spark: [6, 6, 7, 7, 8, 8, 9, 9, 9, 10, 10, 10] },
      { label: 'Newsletter subscribers', value: F.num(subs.filter(function (s) { return s.status === 'Subscribed'; }).length), icon: 'send', tone: 'k-gold', trend: 4.2, sub: subs.length + ' total on the list', spark: [28, 30, 31, 33, 34, 36, 37, 38, 39, 40, 41, 42] }
    ];

    var attention = [];
    msgs.filter(function (m) { return m.priority === 'Urgent' && m.status !== 'Resolved' && m.status !== 'Closed'; }).forEach(function (m) {
      attention.push({ icon: 'mail', tone: 'danger', text: '<b>' + F.esc(m.name) + '</b> — ' + F.esc(m.subject), sub: m.ref + ' · ' + F.ago(m.date), route: 'enquiries' });
    });
    permits.filter(function (p) { return p.due && daysUntil(p.due) <= 5 && daysUntil(p.due) >= 0 && ['Approved', 'Rejected', 'Conditional approval'].indexOf(p.status) < 0; }).forEach(function (p) {
      attention.push({ icon: 'clipboard', tone: 'gold', text: '<b>' + F.esc(p.ref) + '</b> decision due in ' + daysUntil(p.due) + ' day(s)', sub: p.type + ' · ' + p.applicant, route: 'permits' });
    });
    reports.filter(function (r) { return r.severity === 'Critical' && r.status !== 'Resolved' && r.status !== 'Closed'; }).forEach(function (r) {
      attention.push({ icon: 'alert', tone: 'danger', text: '<b>' + F.esc(r.ref) + '</b> — ' + F.esc(r.type), sub: r.location + ' · ' + r.lga + ' LGA', route: 'reports' });
    });
    news.filter(function (n) { return n.status === 'Scheduled' && daysUntil(n.date) >= 0 && daysUntil(n.date) <= 7; }).forEach(function (n) {
      attention.push({ icon: 'news', tone: 'info', text: 'Scheduled story goes live in ' + daysUntil(n.date) + ' day(s)', sub: n.title, route: 'news' });
    });

    var upcoming = S.list('events').filter(function (e) { return new Date(e.date) >= new Date(new Date().toDateString()); })
      .sort(function (a, b) { return new Date(a.date) - new Date(b.date); }).slice(0, 5);

    var bySubject = {};
    msgs.forEach(function (m) { bySubject[m.subject] = (bySubject[m.subject] || 0) + 1; });
    var subjectItems = Object.keys(bySubject).map(function (k) { return { label: k, value: bySubject[k] }; })
      .sort(function (a, b) { return b.value - a.value; }).slice(0, 6);

    var permitByStatus = {};
    permits.forEach(function (p) { permitByStatus[p.status] = (permitByStatus[p.status] || 0) + 1; });
    var permitData = Object.keys(permitByStatus).map(function (k, i) {
      return { name: k, value: permitByStatus[k], color: UI.palette[i % UI.palette.length] };
    });

    var msgByStatus = {};
    msgs.forEach(function (m) { msgByStatus[m.status] = (msgByStatus[m.status] || 0) + 1; });

    host.innerHTML =
      /* welcome strip */
      '<div class="card card-pad mb-1" style="background:linear-gradient(120deg,var(--green-800),var(--green-600));border-color:transparent;color:#dff0e7">' +
      '<div class="flex gap wrap aic" style="justify-content:space-between">' +
      '<div><h2 style="color:#fff;font-size:clamp(1.15rem,2.6vw,1.5rem);margin-bottom:.2rem">' + greet + ', ' + F.esc(u.name.split(' ')[0]) + '</h2>' +
      '<p style="margin:0;color:#c6ddd2;font-size:.87rem;max-width:74ch">' + F.esc(S.data.settings.siteName) + ' — ' + F.date(new Date().toISOString(), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) +
      '. You have <b style="color:#fff">' + attention.length + '</b> item(s) needing attention and <b style="color:#fff">' + tasks.filter(function (t) { return !t.done; }).length + '</b> open task(s).</p></div>' +
      '<div class="btn-row">' +
      '<button class="btn btn-gold" data-qa="news">' + icon('plus', 15) + 'New story</button>' +
      '<a class="btn btn-light" href="../index.html" target="_blank" rel="noopener" style="background:rgba(255,255,255,.16);color:#fff;border-color:rgba(255,255,255,.45)">' + icon('external', 15) + 'View website</a>' +
      '</div></div></div>' +

      /* KPIs */
      '<div class="grid g-4 mb-1">' + kpis.map(function (k) {
        return '<div class="kpi ' + (k.tone || '') + '"><div class="kpi-top"><div>' +
          '<div class="kpi-label">' + F.esc(k.label) + '</div>' +
          '<div class="kpi-val" data-countup="' + F.esc(String(k.value)) + '">' + F.esc(String(k.value)) + '</div></div>' +
          '<span class="kpi-ico">' + icon(k.icon, 20) + '</span></div>' +
          (k.spark ? UI.charts.spark(k.spark, sparkColor(k.tone)) : '') +
          '<div class="kpi-foot">' + (k.trend != null ? trendHtml(k.trend) : '') + '<span>' + F.esc(k.sub || '') + '</span></div></div>';
      }).join('') + '</div>' +

      /* traffic + enquiries donut */
      '<div class="grid gk-32 mb-1">' +
      '<div class="card"><div class="card-h"><div class="ch-t"><span class="ico">' + icon('activity', 17) + '</span>' +
      '<div><h3>Website traffic</h3><div class="sub">Page views and unique visitors</div></div></div>' +
      '<div class="ch-a"><div class="seg" role="group" aria-label="Date range">' +
      '<button data-range="7">7d</button><button data-range="30" class="active">30d</button><button data-range="90">90d</button>' +
      '</div><button class="btn btn-outline btn-sm" data-goto="analytics">' + icon('analytics', 14) + 'Details</button></div></div>' +
      '<div class="card-pad" data-traffic></div></div>' +

      '<div class="card"><div class="card-h"><div class="ch-t"><span class="ico">' + icon('mail', 17) + '</span>' +
      '<div><h3>Enquiries by status</h3><div class="sub">' + msgs.length + ' submissions</div></div></div></div>' +
      '<div class="card-pad">' + UI.charts.donut({
        data: Object.keys(msgByStatus).map(function (k, i) { return { name: k, value: msgByStatus[k], color: UI.palette[i % UI.palette.length] }; }),
        center: { value: msgs.filter(function (m) { return !m.read; }).length, label: 'unread' }, size: 168
      }) +
      '<hr class="divider"><div class="grid g-2">' +
      '<div class="stat-mini"><span class="sm-ico">' + icon('alert', 16) + '</span><span><span class="v">' + msgs.filter(function (m) { return m.priority === 'Urgent' || m.priority === 'High'; }).length + '</span><span class="l">High / urgent</span></span></div>' +
      '<div class="stat-mini"><span class="sm-ico">' + icon('clock', 16) + '</span><span><span class="v">' + msgs.filter(function (m) { return !m.assigned; }).length + '</span><span class="l">Unassigned</span></span></div>' +
      '</div></div></div>' +
      '</div>' +

      /* submissions by subject + permit pipeline */
      '<div class="grid gk-32 mb-1">' +
      '<div class="card"><div class="card-h"><div class="ch-t"><span class="ico">' + icon('pie', 17) + '</span>' +
      '<div><h3>What citizens are asking about</h3><div class="sub">Top enquiry subjects</div></div></div></div>' +
      '<div class="card-pad">' + UI.charts.hbars(subjectItems) + '</div></div>' +

      '<div class="card"><div class="card-h"><div class="ch-t"><span class="ico">' + icon('clipboard', 17) + '</span>' +
      '<div><h3>Permit pipeline</h3><div class="sub">' + permits.length + ' applications</div></div></div>' +
      '<div class="ch-a"><button class="btn btn-outline btn-sm" data-goto="permits">Open register</button></div></div>' +
      '<div class="card-pad">' + UI.charts.donut({ data: permitData, center: { value: permits.length, label: 'total' }, size: 168, legendFmt: F.num }) + '</div></div>' +
      '</div>' +

      /* attention + tasks + events */
      '<div class="grid gk-3 mb-1">' +
      '<div class="card"><div class="card-h"><div class="ch-t"><span class="ico" style="background:var(--danger-bg);color:var(--danger)">' + icon('alert', 17) + '</span>' +
      '<div><h3>Needs your attention</h3><div class="sub">' + attention.length + ' item(s)</div></div></div></div>' +
      '<div class="card-pad scroll-y">' + (attention.length ? '<div class="feed">' + attention.slice(0, 8).map(function (a) {
        return '<div class="feed-item ' + a.tone + '" data-goto="' + a.route + '" style="cursor:pointer"><span class="fi-ico">' + icon(a.icon, 15) + '</span>' +
          '<div class="fi-b"><p>' + a.text + '</p><div class="fi-t">' + F.esc(a.sub) + '</div></div>' + icon('chevronRight', 14) + '</div>';
      }).join('') + '</div>' : '<div class="empty" style="padding:1.6rem">' + icon('checkCircle', 34) + '<div class="t1">All clear</div><div class="t2">No urgent enquiries, overdue permits or critical incidents.</div></div>') + '</div></div>' +

      '<div class="card"><div class="card-h"><div class="ch-t"><span class="ico">' + icon('clipboard', 17) + '</span>' +
      '<div><h3>Tasks & approvals</h3><div class="sub">' + tasks.filter(function (t) { return !t.done; }).length + ' open</div></div></div>' +
      '<div class="ch-a"><button class="btn btn-outline btn-sm" data-goto="tasks">All tasks</button></div></div>' +
      '<div class="card-pad scroll-y">' + tasks.filter(function (t) { return !t.done; }).slice(0, 7).map(function (t) {
        var dd = daysUntil(t.due);
        return '<div class="task" data-task="' + t.id + '"><input type="checkbox" id="tk-' + t.id + '" data-taskcheck="' + t.id + '" aria-label="Complete task">' +
          '<div class="tb"><label class="t1" for="tk-' + t.id + '" style="cursor:pointer">' + F.esc(t.title) + '</label>' +
          '<div class="t2">' + F.esc(t.owner) + ' · ' + F.esc(t.module) + '</div></div>' +
          '<span class="due ' + (dd < 0 ? 'over' : dd <= 2 ? 'soon' : '') + '">' + (dd < 0 ? Math.abs(dd) + 'd overdue' : dd === 0 ? 'Today' : dd + 'd') + '</span></div>';
      }).join('') + '</div></div>' +

      '<div class="card"><div class="card-h"><div class="ch-t"><span class="ico">' + icon('calendar', 17) + '</span>' +
      '<div><h3>Coming up</h3><div class="sub">Next scheduled events</div></div></div>' +
      '<div class="ch-a"><button class="btn btn-outline btn-sm" data-goto="events">Calendar</button></div></div>' +
      '<div class="card-pad scroll-y"><div class="feed">' + (upcoming.length ? upcoming.map(function (e) {
        return '<div class="feed-item ' + (e.color === 'gold' ? 'gold' : e.color === 'danger' ? 'danger' : e.color === 'info' ? 'info' : '') + '">' +
          '<span class="fi-ico">' + icon('calendar', 15) + '</span><div class="fi-b"><p><b>' + F.esc(e.title) + '</b></p>' +
          '<div class="fi-t">' + F.date(e.date) + ' · ' + F.esc(e.time) + ' · ' + F.esc(e.location) + '</div></div></div>';
      }).join('') : '<div class="text-sm text-muted">Nothing scheduled.</div>') + '</div></div></div>' +
      '</div>' +

      /* programme progress + quick actions */
      '<div class="grid gk-32 mb-1">' +
      '<div class="card"><div class="card-h"><div class="ch-t"><span class="ico">' + icon('projects', 17) + '</span>' +
      '<div><h3>Programme delivery</h3><div class="sub">Implementation progress across the portfolio</div></div></div>' +
      '<div class="ch-a"><button class="btn btn-outline btn-sm" data-goto="projects">Manage</button></div></div>' +
      '<div class="card-pad">' + UI.charts.hbars(projects.filter(function (p) { return p.status !== 'Completed'; }).slice(0, 6).map(function (p) {
        return { label: p.name.length > 46 ? p.name.slice(0, 46) + '…' : p.name, value: p.progress, tone: p.progress >= 70 ? '' : p.progress >= 45 ? 'gold' : 'danger' };
      }), { fmt: function (v) { return v + '%'; } }) + '</div></div>' +

      '<div class="stack">' +
      '<div class="card"><div class="card-h"><div class="ch-t"><span class="ico">' + icon('zap', 17) + '</span><div><h3>Quick actions</h3></div></div></div>' +
      '<div class="card-pad"><div class="quick-tiles">' +
      [['news', 'news', 'New story'], ['media', 'upload', 'Upload image'], ['permits', 'clipboard', 'Log application'],
      ['reports', 'alert', 'Raise incident'], ['events', 'calendar', 'Add event'], ['documents', 'download', 'Add document'],
      ['subscribers', 'send', 'Newsletter'], ['settings', 'settings', 'Site settings']].map(function (q) {
        return '<a class="qtile" href="#/' + q[0] + '"><span class="qi">' + icon(q[1], 18) + '</span><span>' + q[2] + '</span></a>';
      }).join('') + '</div></div></div>' +

      '<div class="card"><div class="card-h"><div class="ch-t"><span class="ico">' + icon('history', 17) + '</span>' +
      '<div><h3>Recent activity</h3><div class="sub">Latest console actions</div></div></div>' +
      '<div class="ch-a"><button class="btn btn-outline btn-sm" data-goto="audit">Full log</button></div></div>' +
      '<div class="card-pad scroll-y sm"><div class="feed">' + S.list('logs').slice(0, 7).map(function (l) {
        return '<div class="feed-item ' + (l.level === 'ok' ? '' : l.level === 'warn' ? 'gold' : l.level === 'danger' ? 'danger' : 'info') + '">' +
          '<span class="fi-ico">' + icon({ create: 'plus', update: 'edit', delete: 'trash', publish: 'send', approve: 'checkCircle', login: 'logout', settings: 'settings', backup: 'db', receive: 'inbox', upload: 'upload', reply: 'reply', send: 'send' }[l.action] || 'activity', 14) + '</span>' +
          '<div class="fi-b"><p><b>' + F.esc(l.user) + '</b> ' + F.esc(l.detail) + '</p><div class="fi-t">' + F.esc(l.module) + ' · ' + F.ago(l.at) + '</div></div></div>';
      }).join('') + '</div></div></div>' +
      '</div></div>' +

      /* content inventory */
      '<div class="card"><div class="card-h"><div class="ch-t"><span class="ico">' + icon('layers', 17) + '</span>' +
      '<div><h3>Website content inventory</h3><div class="sub">Everything the console manages for the public site</div></div></div>' +
      '<div class="ch-a"><button class="btn btn-outline btn-sm" data-print>' + icon('printer', 14) + 'Print summary</button></div></div>' +
      '<div class="card-pad"><div class="grid g-6">' +
      [['pages', S.list('pages').length, 'Pages', 'pages'], ['news', news.length, 'News stories', 'news'],
      ['projects', projects.length, 'Programmes', 'projects'], ['departments', S.list('departments').length, 'Directorates', 'departments'],
      ['staff', S.list('staff').length, 'People profiles', 'staff'], ['services', S.list('services').length, 'Services', 'services'],
      ['fees', S.list('fees').length, 'Fee lines', 'card'], ['media', media.length, 'Media assets', 'media'],
      ['gallery', gallery.length, 'Gallery photos', 'gallery'], ['documents', docs.length, 'Documents', 'download'],
      ['events', S.list('events').length, 'Events', 'calendar'], ['faqs', S.list('faqs').length, 'FAQs', 'info'],
      ['agencies', S.list('agencies').length, 'Agencies', 'layers'], ['subscribers', subs.length, 'Subscribers', 'send'],
      ['reports', reports.length, 'Incidents', 'alert'], ['permits', permits.length, 'Applications', 'clipboard'],
      ['users', S.list('users').length, 'Console users', 'shield'], ['milestones', S.list('milestones').length, 'Milestones', 'flag']].map(function (c) {
        return '<a class="qtile" href="#/' + c[3] + '"><span class="qi">' + icon(c[3] === 'fees' ? 'card' : c[0], 17) + '</span>' +
          '<span><b style="display:block;font-size:1.05rem;color:var(--ink)">' + c[1] + '</b>' + c[2] + '</span></a>';
      }).join('') + '</div></div></div>';

    drawTraffic(30);

    host.querySelectorAll('[data-range]').forEach(function (b) {
      b.addEventListener('click', function () {
        host.querySelectorAll('[data-range]').forEach(function (x) { x.classList.remove('active'); });
        b.classList.add('active');
        drawTraffic(parseInt(b.dataset.range, 10));
      });
    });
    host.querySelectorAll('[data-goto]').forEach(function (b) {
      b.addEventListener('click', function () { go(b.dataset.goto); });
    });
    host.querySelectorAll('[data-taskcheck]').forEach(function (c) {
      c.addEventListener('change', function () {
        S.update('tasks', c.dataset.taskcheck, { done: c.checked });
        UI.toast(c.checked ? 'Task marked complete.' : 'Task reopened.', 'Tasks', c.checked ? 'ok' : 'info');
        setTimeout(function () { renderNav(); render(); }, 450);
      });
    });
    host.querySelector('[data-print]').addEventListener('click', function () { window.print(); });
    host.querySelector('[data-qa="news"]').addEventListener('click', function () { go('news'); });
    UI.charts.animateBars(host);
    countUp(host);

    function drawTraffic(days) {
      var t = traffic.slice(-days);
      host.querySelector('[data-traffic]').innerHTML = UI.charts.line({
        labels: t.map(function (x) { return F.dateShort(x.date); }),
        series: [
          { name: 'Page views', values: t.map(function (x) { return x.views; }), color: 'var(--green-600)' },
          { name: 'Visitors', values: t.map(function (x) { return x.visitors; }), color: 'var(--gold-500)' }
        ],
        height: 236, xEvery: Math.max(1, Math.ceil(t.length / 8)), ariaLabel: 'Website traffic over the last ' + days + ' days'
      });
    }
  }

  function sparkColor(tone) {
    return { 'k-gold': 'var(--gold-500)', 'k-info': 'var(--info)', 'k-danger': 'var(--danger)', 'k-purple': 'var(--purple)', 'k-teal': 'var(--teal)', 'k-ok': 'var(--ok)' }[tone] || 'var(--green-600)';
  }
  function trendHtml(t) {
    var cls = t > 0 ? 'up' : t < 0 ? 'down' : 'flat';
    return '<span class="trend ' + cls + '">' + icon(t > 0 ? 'trendingUp' : t < 0 ? 'trendingDown' : 'minus', 13) +
      (t > 0 ? '+' : '') + t.toFixed(1) + '%</span>';
  }
  function daysUntil(iso) { return Math.round((new Date(iso) - new Date(new Date().toDateString())) / 86400000); }

  function countUp(root) {
    root.querySelectorAll('[data-countup]').forEach(function (el) {
      var raw = el.dataset.countup;
      if (!/^[\d.,]+$/.test(raw)) return;
      var target = parseFloat(raw.replace(/,/g, '')), t0 = performance.now();
      (function tick(now) {
        var p = Math.min((now - t0) / 900, 1), e = 1 - Math.pow(1 - p, 3);
        el.textContent = F.num(Math.round(target * e));
        if (p < 1) requestAnimationFrame(tick);
      })(t0);
    });
  }

  /* =====================================================================
     TASKS
     ===================================================================== */
  function tasksView(host, h) {
    var state = { filter: 'open' };
    function paint() {
      var tasks = S.list('tasks').slice();
      var shown = tasks.filter(function (t) {
        if (state.filter === 'open') return !t.done;
        if (state.filter === 'done') return t.done;
        if (state.filter === 'overdue') return !t.done && daysUntil(t.due) < 0;
        if (state.filter === 'mine') return t.owner === (S.currentUser() || {}).name;
        return true;
      }).sort(function (a, b) { return new Date(a.due) - new Date(b.due); });

      host.innerHTML =
        '<div class="page-head"><div class="ph-t"><h2>' + icon('clipboard', 20) + ' Tasks & Approvals</h2>' +
        '<p>Editorial sign-offs, field follow-ups and administrative to-dos raised across the console.</p></div>' +
        '<div class="ph-a"><button class="btn btn-primary" data-new>' + icon('plus', 15) + 'New task</button></div></div>' +
        '<div class="grid g-4 mb-1">' +
        mini('clipboard', tasks.filter(function (t) { return !t.done; }).length, 'Open tasks') +
        mini('alert', tasks.filter(function (t) { return !t.done && daysUntil(t.due) < 0; }).length, 'Overdue') +
        mini('clock', tasks.filter(function (t) { return !t.done && daysUntil(t.due) === 0; }).length, 'Due today') +
        mini('checkCircle', tasks.filter(function (t) { return t.done; }).length, 'Completed') +
        '</div>' +
        '<div class="card"><div class="toolbar"><div class="seg" role="tablist">' +
        [['open', 'Open'], ['overdue', 'Overdue'], ['mine', 'My tasks'], ['done', 'Completed'], ['all', 'All']].map(function (t) {
          return '<button role="tab" data-f="' + t[0] + '" class="' + (state.filter === t[0] ? 'active' : '') + '">' + t[1] + '</button>';
        }).join('') + '</div><div class="grow"></div>' +
        '<span class="text-xs text-muted">' + shown.length + ' task(s)</span></div>' +
        '<div class="card-pad">' +
        (shown.length ? '<div class="rows">' + shown.map(function (t) {
          var dd = daysUntil(t.due);
          return '<div class="row-item ' + (t.done ? '' : '') + '" data-tid="' + t.id + '">' +
            '<input type="checkbox" data-tc="' + t.id + '"' + (t.done ? ' checked' : '') + ' aria-label="Mark complete" style="width:18px;height:18px;accent-color:var(--accent);margin-top:.2rem">' +
            '<div class="b"><div class="t1" style="' + (t.done ? 'text-decoration:line-through;color:var(--faint)' : '') + '">' + F.esc(t.title) + '</div>' +
            '<div class="meta"><span>' + icon('user', 12) + F.esc(t.owner) + '</span><span>' + icon('folder', 12) + F.esc(t.module) + '</span>' +
            '<span>' + icon('calendar', 12) + F.date(t.due) + '</span></div></div>' +
            '<div class="r-acts">' + UI.priorityBadge(t.priority) +
            '<span class="due ' + (t.done ? '' : dd < 0 ? 'over' : dd <= 2 ? 'soon' : '') + '">' + (t.done ? 'Done' : dd < 0 ? Math.abs(dd) + 'd overdue' : dd === 0 ? 'Today' : dd + 'd left') + '</span>' +
            '<button class="btn btn-ghost btn-xs" data-ted="' + t.id + '" aria-label="Edit task">' + icon('edit', 14) + '</button>' +
            '<button class="btn btn-ghost btn-xs" data-tdel="' + t.id + '" aria-label="Delete task" style="color:var(--danger)">' + icon('trash', 14) + '</button></div></div>';
        }).join('') + '</div>'
          : '<div class="empty">' + icon('checkCircle', 44) + '<div class="t1">Nothing to do here</div><div class="t2">No tasks match this filter.</div></div>') +
        '</div></div>';
    }

    function editor(item) {
      C.editor({
        title: item ? 'Edit task' : 'New task', icon: 'clipboard', item: item || {}, size: 'sm',
        fields: [
          { id: 'title', name: 'title', label: 'Task', required: true, full: true, value: item && item.title },
          { id: 'owner', name: 'owner', type: 'select', label: 'Owner', value: (item && item.owner) || (S.currentUser() || {}).name, options: S.list('users').map(function (u) { return u.name; }) },
          { id: 'due', name: 'due', type: 'date', label: 'Due date', value: (item && item.due) || new Date().toISOString().slice(0, 10) },
          { id: 'priority', name: 'priority', type: 'select', label: 'Priority', value: (item && item.priority) || 'Normal', options: ['Low', 'Normal', 'Medium', 'High', 'Urgent'] },
          { id: 'module', name: 'module', type: 'select', label: 'Module', value: (item && item.module) || 'Newsroom', options: ['Newsroom', 'Enquiries', 'Permits', 'Reports', 'Media', 'Gallery', 'Documents', 'Events', 'Settings', 'Users'] },
          { id: 'done', name: 'done', type: 'switch', label: 'Completed', value: !!(item && item.done) }
        ],
        onSave: function (vals, it) {
          if (it.id) { S.update('tasks', it.id, vals); UI.toast('Task updated.', 'Saved', 'ok'); }
          else { vals.id = S.uid('tk'); S.add('tasks', vals); S.log('create', 'Tasks', 'Created task "' + vals.title + '"', 'ok'); UI.toast('Task created.', 'New', 'ok'); }
          paint(); renderNav();
        }
      });
    }

    host.addEventListener('click', function (e) {
      var f = e.target.closest('[data-f]'); if (f) { state.filter = f.dataset.f; return paint(); }
      if (e.target.closest('[data-new]')) return editor(null);
      var ed = e.target.closest('[data-ted]'); if (ed) return editor(S.find('tasks', ed.dataset.ted));
      var del = e.target.closest('[data-tdel]'); if (del) return C.del('tasks', del.dataset.tdel, 'this task', function () { paint(); renderNav(); });
    });
    host.addEventListener('change', function (e) {
      var tc = e.target.closest('[data-tc]');
      if (tc) {
        S.update('tasks', tc.dataset.tc, { done: tc.checked });
        S.log(tc.checked ? 'complete' : 'reopen', 'Tasks', 'Task ' + (tc.checked ? 'completed' : 'reopened'), tc.checked ? 'ok' : 'info');
        UI.toast(tc.checked ? 'Well done — task completed.' : 'Task reopened.', 'Tasks', tc.checked ? 'ok' : 'info');
        paint(); renderNav();
      }
    });
    paint();
  }

  function mini(ic, value, label) {
    return '<div class="stat-mini"><span class="sm-ico">' + icon(ic, 17) + '</span><span><span class="v">' + F.esc(value) + '</span><span class="l">' + F.esc(label) + '</span></span></div>';
  }

  /* =====================================================================
     PAGES & SEO  (site content manager)
     ===================================================================== */
  function pagesView(host, h) {
    var seg = 'pages';
    function paint() {
      host.innerHTML =
        '<div class="page-head"><div class="ph-t"><h2>' + icon('pages', 20) + ' Pages & SEO</h2>' +
        '<p>Edit the text blocks on every public page, manage search-engine metadata, the home page hero slider, milestones, quick links and animated counters.</p></div>' +
        '<div class="ph-a"><a class="btn btn-outline" href="../index.html" target="_blank" rel="noopener">' + icon('external', 15) + 'View website</a></div></div>' +
        '<div class="seg mb-1" role="tablist">' +
        [['pages', 'Pages & SEO'], ['hero', 'Hero slider'], ['milestones', 'Milestones'], ['quick', 'Quick links'], ['counters', 'Counters'], ['partners', 'Partners']].map(function (t) {
          return '<button role="tab" data-seg="' + t[0] + '" class="' + (seg === t[0] ? 'active' : '') + '">' + t[1] + '</button>';
        }).join('') + '</div><div data-slot></div>';

      host.querySelectorAll('[data-seg]').forEach(function (b) { b.addEventListener('click', function () { seg = b.dataset.seg; paint(); }); });
      var slot = host.querySelector('[data-slot]');

      if (seg === 'pages') return pagesTable(slot);
      if (seg === 'hero') return heroManager(slot);
      if (seg === 'milestones') return milestoneManager(slot);
      if (seg === 'quick') return quickManager(slot);
      if (seg === 'counters') return counterManager(slot);
      return partnerManager(slot);
    }

    function pagesTable(slot) {
      slot.innerHTML = '<div class="card"><div class="card-h"><div class="ch-t"><span class="ico">' + icon('pages', 17) + '</span>' +
        '<div><h3>Website pages</h3><div class="sub">' + S.list('pages').length + ' pages · content blocks and search metadata</div></div></div></div>' +
        '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Page</th><th>File</th><th>Content blocks</th><th>SEO title</th><th>Last updated</th><th>Status</th><th style="text-align:right">Actions</th></tr></thead><tbody>' +
        S.list('pages').map(function (p) {
          var seo = S.data.settings.seo.filter(function (s) { return s.file === p.file; })[0] || {};
          return '<tr data-pid="' + p.id + '" style="cursor:pointer"><td><div class="cell-main"><span class="avatar avatar-sm">' + icon('pages', 14) + '</span>' +
            '<div class="b"><div class="t1">' + F.esc(p.name) + '</div><div class="t2">edited by ' + F.esc(p.editor || '—') + '</div></div></div></td>' +
            '<td class="mono text-xs">' + F.esc(p.file) + '</td>' +
            '<td><span class="badge b-outline">' + (p.blocks || []).length + ' blocks</span></td>' +
            '<td class="text-xs truncate" style="max-width:280px">' + F.esc((seo.title || '').slice(0, 52)) + '…</td>' +
            '<td class="text-xs">' + F.date(p.updated) + '</td>' +
            '<td>' + UI.statusBadge(p.status) + '</td>' +
            '<td><div class="acts"><a class="btn btn-ghost btn-xs" href="../' + p.file + '" target="_blank" rel="noopener" aria-label="View page">' + icon('eye', 14) + '</a>' +
            '<button class="btn btn-ghost btn-xs" data-ped="' + p.id + '" aria-label="Edit page">' + icon('edit', 14) + '</button></div></td></tr>';
        }).join('') + '</tbody></table></div></div>' +
        '<div class="note mt-1">' + icon('info', 17) + '<div><b>How publishing works in this console.</b> Edits are stored in the browser data model so you can review, approve and export them as JSON. Connect the export to your deployment pipeline (or a headless CMS) to push changes to the live static pages.</div></div>';

      slot.querySelectorAll('[data-ped]').forEach(function (b) { b.addEventListener('click', function (e) { e.stopPropagation(); pageEditor(S.find('pages', b.dataset.ped)); }); });
      slot.querySelectorAll('tr[data-pid]').forEach(function (tr) { tr.addEventListener('click', function () { pageEditor(S.find('pages', tr.dataset.pid)); }); });
    }

    function pageEditor(p) {
      var seo = S.data.settings.seo.filter(function (s) { return s.file === p.file; })[0] || { title: '', desc: '', keywords: '' };
      var fields = [{ id: 'sec1', type: 'section', label: 'Content blocks' }];
      (p.blocks || []).forEach(function (b, i) {
        fields.push({
          id: 'blk-' + b.id, name: 'blk-' + b.id, label: b.label,
          type: b.type === 'textarea' ? 'textarea' : 'text',
          value: b.value, rows: 3, full: true
        });
      });
      if (!(p.blocks || []).length) fields.push({ id: 'noblocks', type: 'section', label: 'This page has no editable blocks yet' });
      fields = fields.concat([
        { id: 'sec2', type: 'section', label: 'Search engine optimisation' },
        { id: 'seoTitle', name: 'seoTitle', label: 'Page title (50–60 characters)', value: seo.title, full: true, required: true },
        { id: 'seoDesc', name: 'seoDesc', type: 'textarea', label: 'Meta description (140–160 characters)', value: seo.desc, rows: 3, full: true },
        { id: 'seoKw', name: 'seoKw', label: 'Meta keywords', value: seo.keywords, full: true },
        { id: 'status', name: 'status', type: 'select', label: 'Page status', value: p.status, options: ['Published', 'Draft', 'Under review'] }
      ]);

      /* render section headers as separators */
      var html = '';
      fields.forEach(function (f) {
        if (f.type === 'section') html += '<div class="form-sec">' + icon('layers', 14) + F.esc(f.label) + '</div>';
        else html += UI.field(f);
      });

      var m = UI.modal({
        title: 'Edit ' + F.esc(p.name), subtitle: p.file + ' · last updated ' + F.date(p.updated), icon: 'pages', size: 'lg',
        body: '<form data-form novalidate><div class="form-grid">' + html + '</div></form>',
        footer: '<span class="left">' + (p.blocks || []).length + ' editable block(s)</span>' +
          '<button class="btn" data-close>Cancel</button><button class="btn btn-primary" data-save>' + icon('save', 15) + 'Save page</button>',
        onOpen: function (api) {
          UI.wireFields(api.el);
          api.el.querySelector('[data-save]').addEventListener('click', function () {
            var formEl = api.el.querySelector('[data-form]');
            if (!UI.validate(formEl)) { UI.toast('The SEO title is required.', 'Check the form', 'err'); return; }
            var vals = UI.readForm(formEl);
            (p.blocks || []).forEach(function (b) {
              var k = 'blk-' + b.id;
              if (vals[k] != null) b.value = vals[k];
            });
            var idx = -1;
            S.data.settings.seo.forEach(function (s, i) { if (s.file === p.file) idx = i; });
            var seoObj = { page: p.name, file: p.file, title: vals.seoTitle, desc: vals.seoDesc, keywords: vals.seoKw };
            if (idx > -1) S.data.settings.seo[idx] = seoObj; else S.data.settings.seo.push(seoObj);
            S.update('pages', p.id, { status: vals.status, updated: new Date().toISOString().slice(0, 10), editor: (S.currentUser() || {}).name });
            S.save();
            S.log('update', 'Pages', 'Updated page content & SEO for "' + p.name + '"', 'ok');
            UI.toast(p.name + ' saved.', 'Page updated', 'ok');
            api.close(); paint();
          });
        }
      });
      return m;
    }

    function heroManager(slot) {
      C.manager(slot, {
        store: 'heroSlides', module: 'Pages', icon: 'media', singular: 'slide',
        title: 'Home page hero slider', subtitle: 'Full-width rotating banners at the top of the home page.',
        itemLabel: function (s) { return s.alt || s.image; },
        row: function (s) {
          return '<td style="width:96px">' + UI.thumb(s.image, 'thumb', s.alt) + '</td>' +
            '<td><b style="color:var(--ink)">' + F.esc(s.alt) + '</b><div class="text-xs text-muted mono">' + F.esc(s.src || s.image) + '</div></td>' +
            '<td>' + (s.active ? '<span class="badge b-ok">Enabled</span>' : '<span class="badge b-outline">Hidden</span>') + '</td>';
        },
        fields: function (item) {
          return [
            { id: 'image', name: 'image', type: 'image', label: 'Slide image', value: item.image || '', options: S.list('media').map(function (m) { return { src: m.src, name: m.name }; }), full: true },
            { id: 'alt', name: 'alt', label: 'Alt text / caption', value: item.alt, required: true, full: true },
            { id: 'active', name: 'active', type: 'switch', label: 'Show in the slider', value: item.active !== false }
          ];
        },
        onReady: function (root) {
          var tbl = root.querySelector('table.tbl');
          if (tbl && !tbl.querySelector('thead')) {
            var th = document.createElement('thead');
            th.innerHTML = '<tr><th>Image</th><th>Caption</th><th>Status</th><th style="text-align:right">Actions</th></tr>';
            tbl.insertBefore(th, tbl.firstChild);
            tbl.querySelectorAll('thead th').forEach(function (x) { x.style.cssText = 'font-size:.7rem;letter-spacing:.09em;text-transform:uppercase;color:var(--muted);padding:.6rem .8rem;border-bottom:1px solid var(--line);background:var(--surface-2)'; });
          }
        }
      });
    }

    function milestoneManager(slot) {
      C.manager(slot, {
        store: 'milestones', module: 'Pages', icon: 'flag', singular: 'milestone',
        title: 'About page milestones', subtitle: 'The "Our journey" timeline on the about page.',
        itemLabel: function (m) { return m.year + ' — ' + m.title; },
        row: function (m) {
          return '<td style="width:80px"><span class="badge b-gold">' + F.esc(m.year) + '</span></td>' +
            '<td><b style="color:var(--ink)">' + F.esc(m.title) + '</b><div class="text-xs text-muted">' + F.esc(m.text) + '</div></td>';
        },
        fields: function (item) {
          return [
            { id: 'year', name: 'year', label: 'Year', value: item.year, required: true, placeholder: '2019' },
            { id: 'title', name: 'title', label: 'Milestone title', value: item.title, required: true },
            { id: 'text', name: 'text', type: 'textarea', label: 'Description', value: item.text, rows: 3, full: true, required: true }
          ];
        },
        onReady: function (root) {
          var tbl = root.querySelector('table.tbl');
          if (tbl && !tbl.querySelector('thead')) {
            var th = document.createElement('thead');
            th.innerHTML = '<tr><th>Year</th><th>Milestone</th><th style="text-align:right">Actions</th></tr>';
            tbl.insertBefore(th, tbl.firstChild);
            tbl.querySelectorAll('thead th').forEach(function (x) { x.style.cssText = 'font-size:.7rem;letter-spacing:.09em;text-transform:uppercase;color:var(--muted);padding:.6rem .8rem;border-bottom:1px solid var(--line);background:var(--surface-2)'; });
          }
        }
      });
    }

    function quickManager(slot) {
      C.manager(slot, {
        store: 'quickLinks', module: 'Pages', icon: 'zap', singular: 'quick link',
        title: 'Home page quick-action strip', subtitle: 'The four shortcut cards under the hero on the home page.',
        itemLabel: function (q) { return q.title; },
        row: function (q) {
          return '<td><b style="color:var(--ink)">' + F.esc(q.title) + '</b><div class="text-xs text-muted">' + F.esc(q.text) + '</div></td>' +
            '<td class="mono text-xs">' + F.esc(q.target) + '</td>' +
            '<td>' + (q.enabled ? '<span class="badge b-ok">Shown</span>' : '<span class="badge b-outline">Hidden</span>') + '</td>';
        },
        fields: function (item) {
          return [
            { id: 'title', name: 'title', label: 'Title', value: item.title, required: true },
            { id: 'target', name: 'target', type: 'select', label: 'Links to', value: item.target || 'services.html', options: S.list('pages').map(function (p) { return p.file; }) },
            { id: 'text', name: 'text', type: 'textarea', label: 'Description', value: item.text, rows: 2, full: true, required: true },
            { id: 'enabled', name: 'enabled', type: 'switch', label: 'Show on the home page', value: item.enabled !== false }
          ];
        },
        onReady: function (root) {
          var tbl = root.querySelector('table.tbl');
          if (tbl && !tbl.querySelector('thead')) {
            var th = document.createElement('thead');
            th.innerHTML = '<tr><th>Shortcut</th><th>Target</th><th>Status</th><th style="text-align:right">Actions</th></tr>';
            tbl.insertBefore(th, tbl.firstChild);
            tbl.querySelectorAll('thead th').forEach(function (x) { x.style.cssText = 'font-size:.7rem;letter-spacing:.09em;text-transform:uppercase;color:var(--muted);padding:.6rem .8rem;border-bottom:1px solid var(--line);background:var(--surface-2)'; });
          }
        }
      });
    }

    function counterManager(slot) {
      C.manager(slot, {
        store: 'counters', module: 'Pages', icon: 'analytics', singular: 'counter',
        title: 'Animated statistics counters', subtitle: 'Figures that count up when scrolled into view on the home, about and projects pages.',
        itemLabel: function (c) { return c.label; },
        row: function (c) {
          return '<td><b style="color:var(--ink)">' + F.esc(c.label) + '</b></td>' +
            '<td class="num">' + F.num(c.value) + F.esc(c.suffix || '') + '</td>' +
            '<td><span class="badge b-outline">' + F.esc(c.show) + '</span></td>';
        },
        fields: function (item) {
          return [
            { id: 'label', name: 'label', label: 'Label', value: item.label, required: true, full: true },
            { id: 'value', name: 'value', type: 'number', label: 'Value', value: item.value || 0, required: true, min: 0 },
            { id: 'suffix', name: 'suffix', label: 'Suffix', value: item.suffix || '', placeholder: '+, km, %' },
            { id: 'show', name: 'show', label: 'Show on pages', value: item.show || 'home', full: true, hint: 'Comma-separated: home, about, projects' }
          ];
        },
        onReady: function (root) {
          var tbl = root.querySelector('table.tbl');
          if (tbl && !tbl.querySelector('thead')) {
            var th = document.createElement('thead');
            th.innerHTML = '<tr><th>Statistic</th><th style="text-align:right">Value</th><th>Pages</th><th style="text-align:right">Actions</th></tr>';
            tbl.insertBefore(th, tbl.firstChild);
            tbl.querySelectorAll('thead th').forEach(function (x) { x.style.cssText = 'font-size:.7rem;letter-spacing:.09em;text-transform:uppercase;color:var(--muted);padding:.6rem .8rem;border-bottom:1px solid var(--line);background:var(--surface-2)'; });
          }
        }
      });
      /* counters live under settings; keep them in sync */
    }

    function partnerManager(slot) {
      slot.innerHTML = '<div class="card"><div class="card-h"><div class="ch-t"><span class="ico">' + icon('handshake', 17) + '</span>' +
        '<div><h3>Partners & development organisations</h3><div class="sub">Shown in the partners strip on the projects page</div></div></div>' +
        '<div class="ch-a"><button class="btn btn-primary btn-sm" data-addp>' + icon('plus', 14) + 'Add partner</button></div></div>' +
        '<div class="card-pad"><div class="grid g-3">' + S.data.partners.map(function (p, i) {
          return '<div class="card card-pad flex gap aic" style="background:var(--surface-2);box-shadow:none"><span class="avatar avatar-sm g5">' + icon('handshake', 15) + '</span>' +
            '<b style="flex:1;color:var(--ink);font-size:.87rem">' + F.esc(p) + '</b>' +
            '<button class="btn btn-ghost btn-xs" data-rmp="' + i + '" aria-label="Remove ' + F.esc(p) + '" style="color:var(--danger)">' + icon('trash', 14) + '</button></div>';
        }).join('') + '</div></div></div>';
      slot.querySelector('[data-addp]').addEventListener('click', function () {
        var m = UI.modal({
          title: 'Add partner', icon: 'handshake', size: 'sm',
          body: UI.form([UI.field({ id: 'pn', name: 'pn', label: 'Organisation name', required: true, full: true })]),
          footer: '<button class="btn" data-close>Cancel</button><button class="btn btn-primary" data-go>' + icon('plus', 15) + 'Add</button>',
          onOpen: function (api) {
            api.el.querySelector('[data-go]').addEventListener('click', function () {
              var v = api.el.querySelector('[name=pn]').value.trim();
              if (!v) return;
              S.data.partners.push(v); S.save(); S.log('create', 'Pages', 'Added partner "' + v + '"', 'ok');
              UI.toast('Partner added.', 'Pages', 'ok'); api.close(); paint();
            });
          }
        });
      });
      slot.addEventListener('click', function (e) {
        var rm = e.target.closest('[data-rmp]');
        if (!rm) return;
        var name = S.data.partners[parseInt(rm.dataset.rmp, 10)];
        S.data.partners.splice(parseInt(rm.dataset.rmp, 10), 1); S.save();
        S.log('delete', 'Pages', 'Removed partner "' + name + '"', 'warn');
        UI.toast('Partner removed.', 'Pages', 'ok'); paint();
      });
    }

    paint();
  }

  /* =====================================================================
     ANALYTICS
     ===================================================================== */
  function analyticsView(host) {
    var range = 30;
    function paint() {
      var a = S.data.analytics;
      var t = a.traffic.slice(-range);
      var views = t.reduce(function (x, y) { return x + y.views; }, 0);
      var visitors = t.reduce(function (x, y) { return x + y.visitors; }, 0);
      var prev = a.traffic.slice(-range * 2, -range);
      var prevViews = prev.reduce(function (x, y) { return x + y.views; }, 0) || 1;
      var trend = ((views - prevViews) / prevViews) * 100;
      var top = a.pages.slice().sort(function (x, y) { return y.views - x.views; });
      var totalPageViews = top.reduce(function (x, y) { return x + y.views; }, 0);

      host.innerHTML =
        '<div class="page-head"><div class="ph-t"><h2>' + icon('analytics', 20) + ' Analytics & Engagement</h2>' +
        '<p>Traffic, engagement and audience insights for the public website across the eleven local government areas.</p></div>' +
        '<div class="ph-a"><div class="seg" role="group" aria-label="Date range">' +
        [7, 30, 90].map(function (r) { return '<button data-r="' + r + '" class="' + (range === r ? 'active' : '') + '">' + r + ' days</button>'; }).join('') + '</div>' +
        '<button class="btn btn-outline" data-export>' + icon('download', 15) + 'Export</button>' +
        '<button class="btn btn-outline" data-print>' + icon('printer', 15) + 'Print</button></div></div>' +

        '<div class="grid g-4 mb-1">' +
        kpiCard('Page views', F.num(views), 'activity', trend, 'Last ' + range + ' days') +
        kpiCard('Unique visitors', F.num(visitors), 'users2', null, 'Estimated from sessions') +
        kpiCard('Avg. time on site', '2m 41s', 'clock', 6.4, 'Across all pages') +
        kpiCard('Enquiries per 1k visits', (S.list('messages').length / (views / 1000)).toFixed(2), 'mail', null, 'Conversion indicator') +
        '</div>' +

        '<div class="grid gk-32 mb-1">' +
        '<div class="card"><div class="card-h"><div class="ch-t"><span class="ico">' + icon('chart2', 17) + '</span>' +
        '<div><h3>Traffic over time</h3><div class="sub">' + F.date(t[0].date) + ' – ' + F.date(t[t.length - 1].date) + '</div></div></div></div>' +
        '<div class="card-pad">' + UI.charts.line({
          labels: t.map(function (x) { return F.dateShort(x.date); }),
          series: [
            { name: 'Page views', values: t.map(function (x) { return x.views; }), color: 'var(--green-600)' },
            { name: 'Visitors', values: t.map(function (x) { return x.visitors; }), color: 'var(--gold-500)' }
          ], height: 260, xEvery: Math.max(1, Math.ceil(t.length / 10))
        }) + '</div></div>' +

        '<div class="card"><div class="card-h"><div class="ch-t"><span class="ico">' + icon('globe', 17) + '</span>' +
        '<div><h3>Traffic sources</h3><div class="sub">Where visitors come from</div></div></div></div>' +
        '<div class="card-pad">' + UI.charts.donut({ data: a.sources, center: { value: '100%', label: 'sessions' }, size: 172, legendFmt: function (v) { return v + '%'; } }) + '</div></div>' +
        '</div>' +

        '<div class="grid gk-32 mb-1">' +
        '<div class="card"><div class="card-h"><div class="ch-t"><span class="ico">' + icon('analytics', 17) + '</span>' +
        '<div><h3>Monthly page views</h3><div class="sub">Rolling six months</div></div></div></div>' +
        '<div class="card-pad">' + UI.charts.bar({
          labels: a.monthly.labels, values: a.monthly.values, height: 220,
          colors: a.monthly.labels.map(function (x, i) { return i === a.monthly.labels.length - 1 ? 'var(--gold-500)' : 'var(--green-700)'; })
        }) + '</div></div>' +

        '<div class="card"><div class="card-h"><div class="ch-t"><span class="ico">' + icon('smartphone', 17) + '</span>' +
        '<div><h3>Devices</h3><div class="sub">Screen type share</div></div></div></div>' +
        '<div class="card-pad">' + UI.charts.donut({
          data: a.devices.map(function (d, i) { return { name: d.name, value: d.value, color: UI.palette[i % UI.palette.length] }; }),
          center: { value: a.devices[0].value + '%', label: 'mobile' }, size: 160, legendFmt: function (v) { return v + '%'; }
        }) + '</div></div>' +
        '</div>' +

        '<div class="grid gk-23 mb-1">' +
        '<div class="card"><div class="card-h"><div class="ch-t"><span class="ico">' + icon('list', 17) + '</span>' +
        '<div><h3>Most visited pages</h3><div class="sub">' + F.num(totalPageViews) + ' page views in total</div></div></div></div>' +
        '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Page</th><th>File</th><th style="text-align:right">Views</th><th>Share</th><th style="text-align:right">Trend</th></tr></thead><tbody>' +
        top.map(function (p) {
          return '<tr><td><b style="color:var(--ink)">' + F.esc(p.title) + '</b></td><td class="mono text-xs">' + F.esc(p.page) + '</td>' +
            '<td class="num">' + F.num(p.views) + '</td>' +
            '<td style="min-width:130px"><div class="bar-track"><i data-w="' + Math.round(p.share * 3.4) + '"></i></div><span class="text-xs text-muted">' + p.share + '%</span></td>' +
            '<td class="num">' + trendHtml(p.trend) + '</td></tr>';
        }).join('') + '</tbody></table></div></div>' +

        '<div class="card"><div class="card-h"><div class="ch-t"><span class="ico">' + icon('pin', 17) + '</span>' +
        '<div><h3>Visitors by LGA</h3><div class="sub">Gombe State local government areas</div></div></div></div>' +
        '<div class="card-pad">' + UI.charts.hbars(a.lgaViews.map(function (l) { return { label: l.name, value: l.value }; }), { fmt: function (v) { return v + '%'; }, tone: 'gold' }) + '</div></div>' +
        '</div>' +

        '<div class="card"><div class="card-h"><div class="ch-t"><span class="ico">' + icon('target', 17) + '</span>' +
        '<div><h3>Content performance</h3><div class="sub">Engagement on the items you manage</div></div></div></div>' +
        '<div class="card-pad">' + UI.charts.hbars(
          S.list('news').filter(function (n) { return n.status === 'Published'; }).sort(function (a, b) { return b.views - a.views; }).slice(0, 6)
            .map(function (n) { return { label: n.title.length > 58 ? n.title.slice(0, 58) + '…' : n.title, value: n.views }; })
        ) + '</div></div>';

      UI.charts.animateBars(host);
      host.querySelectorAll('[data-r]').forEach(function (b) { b.addEventListener('click', function () { range = parseInt(b.dataset.r, 10); paint(); }); });
      host.querySelector('[data-print]').addEventListener('click', function () { window.print(); });
      host.querySelector('[data-export]').addEventListener('click', function () {
        UI.download('analytics-' + range + 'd.csv', UI.toCSV([
          { key: 'date', label: 'Date' }, { key: 'views', label: 'Page views' }, { key: 'visitors', label: 'Visitors' }
        ], t), 'text/csv');
        UI.toast('Analytics data exported.', 'CSV', 'ok');
      });
    }
    function kpiCard(label, value, ic, trend, sub) {
      return '<div class="kpi"><div class="kpi-top"><div><div class="kpi-label">' + F.esc(label) + '</div>' +
        '<div class="kpi-val">' + F.esc(value) + '</div></div><span class="kpi-ico">' + icon(ic, 20) + '</span></div>' +
        '<div class="kpi-foot">' + (trend != null ? trendHtml(trend) : '') + '<span>' + F.esc(sub || '') + '</span></div></div>';
    }
    paint();
  }

  /* =====================================================================
     SETTINGS
     ===================================================================== */
  function settingsView(host) {
    var tab = 'general';
    var st = S.data.settings;

    function paint() {
      var tabs = [['general', 'General'], ['contact', 'Contact & hours'], ['social', 'Social & notice'], ['features', 'Features'],
      ['appearance', 'Appearance'], ['data', 'Data & backup'], ['security', 'Security']];
      host.innerHTML =
        '<div class="page-head"><div class="ph-t"><h2>' + icon('settings', 20) + ' Settings</h2>' +
        '<p>Site-wide configuration for the public website and the admin console.</p></div>' +
        '<div class="ph-a"><a class="btn btn-outline" href="../index.html" target="_blank" rel="noopener">' + icon('external', 15) + 'View website</a></div></div>' +
        '<div class="seg mb-1" role="tablist" style="overflow-x:auto;max-width:100%">' + tabs.map(function (t) {
          return '<button role="tab" data-tab="' + t[0] + '" class="' + (tab === t[0] ? 'active' : '') + '">' + t[1] + '</button>';
        }).join('') + '</div><div data-slot></div>';
      host.querySelectorAll('[data-tab]').forEach(function (b) { b.addEventListener('click', function () { tab = b.dataset.tab; paint(); }); });
      var slot = host.querySelector('[data-slot]');
      ({ general: general, contact: contact, social: social, features: features, appearance: appearance, data: dataPanel, security: security })[tab](slot);
    }

    function wrap(title, subtitle, ic, inner, onSave, saveLabel) {
      return '<div class="card"><div class="card-h"><div class="ch-t"><span class="ico">' + icon(ic, 17) + '</span>' +
        '<div><h3>' + title + '</h3><div class="sub">' + subtitle + '</div></div></div></div>' +
        '<div class="card-pad"><form data-form novalidate>' + inner + '</form></div>' +
        (onSave === false ? '' : '<div class="card-f"><span>' + icon('info', 13) + ' Changes are saved to this browser only.</span>' +
          '<button class="btn btn-primary btn-sm" data-save>' + icon('save', 14) + (saveLabel || 'Save changes') + '</button></div>') + '</div>';
    }

    function bindSave(slot, fn) {
      slot.querySelectorAll('[data-save]').forEach(function (b) {
        b.addEventListener('click', function () {
          var card = b.closest('.card');
          var formEl = (card && card.querySelector('[data-form]')) || slot.querySelector('[data-form]');
          if (formEl && !UI.validate(formEl)) { UI.toast('Please complete the highlighted fields.', 'Check the form', 'err'); return; }
          fn(formEl ? UI.readForm(formEl) : {}, b);
        });
      });
    }

    function general(slot) {
      slot.innerHTML = wrap('Site identity', 'Name, branding and footer copy used across the public website', 'globe',
        '<div class="form-grid">' +
        UI.field({ id: 'siteName', name: 'siteName', label: 'Ministry name', value: st.siteName, required: true, full: true }) +
        UI.field({ id: 'siteShort', name: 'siteShort', label: 'Short name (console & mobile)', value: st.siteShort }) +
        UI.field({ id: 'government', name: 'government', label: 'Government', value: st.government }) +
        UI.field({ id: 'tagline', name: 'tagline', label: 'Tagline', value: st.tagline }) +
        UI.field({ id: 'footerBlurb', name: 'footerBlurb', type: 'textarea', label: 'Footer description', value: st.footerBlurb, rows: 3, full: true }) +
        '</div>');
      bindSave(slot, function (v) {
        ['siteName', 'siteShort', 'government', 'tagline', 'footerBlurb'].forEach(function (k) { st[k] = v[k]; });
        S.save(); S.log('settings', 'Settings', 'Updated site identity', 'warn');
        UI.toast('Site identity saved.', 'Settings', 'ok');
        var b = document.querySelector('.side-brand strong'); if (b) b.textContent = st.siteShort;
      });
    }

    function contact(slot) {
      slot.innerHTML =
        '<form data-form novalidate><div class="grid gk-2">' +
        '<div class="card"><div class="card-h"><div class="ch-t"><span class="ico">' + icon('phone', 17) + '</span>' +
        '<div><h3>Contact details</h3><div class="sub">Header top bar, footer and contact page</div></div></div></div>' +
        '<div class="card-pad"><div class="form-grid">' +
        UI.field({ id: 'address', name: 'address', type: 'textarea', label: 'Postal address', value: st.address, rows: 3, full: true, required: true }) +
        UI.field({ id: 'phone', name: 'phone', type: 'tel', label: 'Telephone', value: st.phone, required: true }) +
        UI.field({ id: 'hotline', name: 'hotline', label: 'Emergency hotline', value: st.hotline }) +
        UI.field({ id: 'email', name: 'email', type: 'email', label: 'General email', value: st.email, required: true }) +
        UI.field({ id: 'hours', name: 'hours', label: 'Opening hours (top bar)', value: st.hours }) +
        UI.field({ id: 'mapEmbed', name: 'mapEmbed', type: 'textarea', label: 'Map embed URL', value: st.mapEmbed, rows: 2, full: true }) +
        '</div></div></div>' +

        '<div class="card"><div class="card-h"><div class="ch-t"><span class="ico">' + icon('clock', 17) + '</span>' +
        '<div><h3>Opening hours & departmental desks</h3><div class="sub">Shown on the contact page</div></div></div></div>' +
        '<div class="card-pad">' +
        st.officeHours.map(function (oh, i) {
          return '<div style="display:grid;grid-template-columns:1fr auto auto auto;gap:.4rem;align-items:center;padding:.28rem 0;border-bottom:1px dashed var(--line)">' +
            '<b class="text-sm" style="color:var(--ink)">' + oh.day + '</b>' +
            '<input type="time" name="open-' + i + '" value="' + oh.open + '"' + (oh.closed ? ' disabled' : '') + ' aria-label="' + oh.day + ' opening time" style="padding:.3rem .4rem;font-size:.8rem">' +
            '<input type="time" name="close-' + i + '" value="' + oh.close + '"' + (oh.closed ? ' disabled' : '') + ' aria-label="' + oh.day + ' closing time" style="padding:.3rem .4rem;font-size:.8rem">' +
            '<label class="check mb-0" style="justify-self:end"><input type="checkbox" name="closed-' + i + '"' + (oh.closed ? ' checked' : '') + '><span class="text-xs">Closed</span></label>' +
            '</div>';
        }).join('') +
        '<hr class="divider"><h4 style="font-size:.86rem;margin-bottom:.5rem">Departmental desks</h4>' +
        st.departmentsDesks.map(function (dk, i) {
          return '<div style="padding:.5rem 0;border-bottom:1px dashed var(--line)">' +
            '<div class="form-grid" style="margin:0">' +
            UI.field({ id: 'dk-n-' + i, name: 'dk-n-' + i, label: 'Desk', value: dk.name }) +
            UI.field({ id: 'dk-p-' + i, name: 'dk-p-' + i, label: 'Phone', value: dk.phone }) +
            UI.field({ id: 'dk-e-' + i, name: 'dk-e-' + i, type: 'email', label: 'Email', value: dk.email, full: true }) +
            '</div></div>';
        }).join('') +
        '</div></div></div></form>' +
        '<div class="btn-row mt-1" style="justify-content:flex-end">' +
        '<span class="text-xs text-muted" style="margin-right:auto">' + icon('info', 13) + ' Saved to this browser only.</span>' +
        '<button class="btn btn-primary" data-save>' + icon('save', 15) + 'Save contact details</button></div>';

      bindSave(slot, function (v) {
        ['address', 'phone', 'hotline', 'email', 'hours', 'mapEmbed'].forEach(function (k) { st[k] = v[k]; });
        st.officeHours.forEach(function (oh, i) {
          oh.closed = !!v['closed-' + i];
          oh.open = oh.closed ? '' : (v['open-' + i] || '');
          oh.close = oh.closed ? '' : (v['close-' + i] || '');
        });
        st.departmentsDesks.forEach(function (dk, i) {
          dk.name = v['dk-n-' + i] || dk.name;
          dk.phone = v['dk-p-' + i] || dk.phone;
          dk.email = v['dk-e-' + i] || dk.email;
        });
        S.save(); S.log('settings', 'Settings', 'Updated contact details and opening hours', 'warn');
        UI.toast('Contact details saved.', 'Settings', 'ok');
      });

      /* ticking "Closed" disables that day's time inputs immediately */
      slot.addEventListener('change', function (e) {
        var cb = e.target.closest('input[name^="closed-"]');
        if (!cb) return;
        var i = cb.name.split('-')[1];
        ['open-', 'close-'].forEach(function (p) {
          var inp = slot.querySelector('[name="' + p + i + '"]');
          if (inp) inp.disabled = cb.checked;
        });
      });
    }

    function social(slot) {
      slot.innerHTML = '<div class="grid gk-2">' +
        wrap('Social media', 'Links shown in the top bar and footer', 'globe',
          '<div class="form-grid">' +
          UI.field({ id: 'facebook', name: 'facebook', type: 'url', label: 'Facebook', value: st.socials.facebook, placeholder: 'https://facebook.com/…' }) +
          UI.field({ id: 'twitter', name: 'twitter', type: 'url', label: 'X (Twitter)', value: st.socials.twitter }) +
          UI.field({ id: 'youtube', name: 'youtube', type: 'url', label: 'YouTube', value: st.socials.youtube }) +
          UI.field({ id: 'instagram', name: 'instagram', type: 'url', label: 'Instagram', value: st.socials.instagram }) +
          UI.field({ id: 'linkedin', name: 'linkedin', type: 'url', label: 'LinkedIn', value: st.socials.linkedin, full: true }) +
          '</div>') +
        wrap('Public notice band', 'The gold announcement strip at the top of a page', 'alert',
          '<div class="form-grid">' +
          UI.field({ id: 'nbEnabled', name: 'nbEnabled', type: 'switch', label: 'Show the notice band', value: st.noticeBand.enabled, full: true }) +
          UI.field({ id: 'nbLabel', name: 'nbLabel', label: 'Label', value: st.noticeBand.label }) +
          UI.field({ id: 'nbPage', name: 'nbPage', type: 'select', label: 'Show on page', value: st.noticeBand.page, options: S.list('pages').map(function (p) { return p.file.replace('.html', ''); }) }) +
          UI.field({ id: 'nbText', name: 'nbText', type: 'textarea', label: 'Notice text', value: st.noticeBand.text, rows: 3, full: true, required: true }) +
          '</div>') +
        '</div>' +
        '<div class="card mt-1"><div class="card-h"><div class="ch-t"><span class="ico">' + icon('monitor', 17) + '</span>' +
        '<div><h3>Maintenance mode</h3><div class="sub">Temporarily replace the public site with a notice</div></div></div></div>' +
        '<div class="card-pad"><form data-form novalidate><div class="form-grid">' +
        UI.field({ id: 'mtEnabled', name: 'mtEnabled', type: 'switch', label: 'Enable maintenance mode', value: st.maintenance.enabled, full: true, hint: 'Visitors see the message below instead of the website.' }) +
        UI.field({ id: 'mtMessage', name: 'mtMessage', type: 'textarea', label: 'Maintenance message', value: st.maintenance.message, rows: 2, full: true }) +
        '</div></form></div><div class="card-f"><span>' + icon('alert', 13) + ' Use sparingly — it hides the whole website.</span>' +
        '<button class="btn btn-primary btn-sm" data-save2>' + icon('save', 14) + 'Save maintenance setting</button></div></div>';

      bindSave(slot, function (v) {
        st.socials = { facebook: v.facebook, twitter: v.twitter, youtube: v.youtube, instagram: v.instagram, linkedin: v.linkedin };
        st.noticeBand = { enabled: !!v.nbEnabled, label: v.nbLabel, text: v.nbText, page: v.nbPage };
        S.save(); S.log('settings', 'Settings', 'Updated social links and public notice band', 'warn');
        UI.toast('Social links and notice band saved.', 'Settings', 'ok');
      });
      var b2 = slot.querySelector('[data-save2]');
      if (b2) b2.addEventListener('click', function () {
        var formEl = b2.closest('.card').querySelector('[data-form]');
        var v = UI.readForm(formEl);
        st.maintenance = { enabled: !!v.mtEnabled, message: v.mtMessage };
        S.save(); S.log('settings', 'Settings', 'Maintenance mode ' + (st.maintenance.enabled ? 'ENABLED' : 'disabled'), st.maintenance.enabled ? 'danger' : 'ok');
        UI.toast(st.maintenance.enabled ? 'Maintenance mode is ON.' : 'Maintenance mode is OFF.', 'Settings', st.maintenance.enabled ? 'warn' : 'ok');
        setTimeout(function () { location.reload(); }, 900);
      });
    }

    function features(slot) {
      var defs = [
        ['heroSlider', 'Home page hero slider', 'Rotating full-width banners with dots navigation'],
        ['onlineForms', 'Online forms', 'Contact, report-an-issue and newsletter forms'],
        ['seedlingRequests', 'Seedling requests', 'Accept tree seedling requests from the services page'],
        ['eiaApplications', 'EIA applications', 'Accept environmental impact assessment applications'],
        ['galleryLightbox', 'Gallery lightbox', 'Full-screen photo viewer with keyboard navigation'],
        ['newsletter', 'Newsletter sign-up', 'Footer subscription box'],
        ['comments', 'Story comments', 'Allow public comments on news stories (off by default)']
      ];
      slot.innerHTML = wrap('Feature switches', 'Turn public website features on or off without touching code', 'zap',
        '<div class="grid g-2">' + defs.map(function (d) {
          return '<div class="card card-pad" style="box-shadow:none;background:var(--surface-2)">' +
            UI.field({ id: d[0], name: d[0], type: 'switch', label: d[1], hint: d[2], value: !!st.features[d[0]] }) + '</div>';
        }).join('') + '</div>');
      bindSave(slot, function (v) {
        defs.forEach(function (d) { st.features[d[0]] = !!v[d[0]]; });
        S.save(); S.log('settings', 'Settings', 'Updated feature switches', 'warn');
        UI.toast('Feature switches saved.', 'Settings', 'ok');
      });
    }

    function appearance(slot) {
      var accents = [['#0b6b3a', 'Forest green'], ['#06391f', 'Deep green'], ['#128048', 'Emerald'], ['#0e8f8f', 'Teal'], ['#1c7ed6', 'Blue'], ['#7048b6', 'Purple'], ['#b8860b', 'Bronze'], ['#c0392b', 'Brick']];
      slot.innerHTML = '<div class="grid gk-2">' +
        '<div class="card"><div class="card-h"><div class="ch-t"><span class="ico">' + icon('sun', 17) + '</span>' +
        '<div><h3>Console appearance</h3><div class="sub">Applies to this admin console</div></div></div></div>' +
        '<div class="card-pad">' +
        '<div class="field"><span class="lbl">Theme</span><div class="btn-row mt-1">' +
        '<button class="btn ' + (prefs.theme !== 'dark' ? 'btn-primary' : 'btn-outline') + '" data-theme-set="light">' + icon('sun', 15) + 'Light</button>' +
        '<button class="btn ' + (prefs.theme === 'dark' ? 'btn-primary' : 'btn-outline') + '" data-theme-set="dark">' + icon('moon', 15) + 'Dark</button>' +
        '<button class="btn btn-outline" data-theme-set="auto">' + icon('monitor', 15) + 'Match system</button></div></div>' +
        '<div class="field"><span class="lbl">Density</span><div class="btn-row mt-1">' +
        '<button class="btn ' + (!prefs.dense ? 'btn-primary' : 'btn-outline') + '" data-dense="0">Comfortable</button>' +
        '<button class="btn ' + (prefs.dense ? 'btn-primary' : 'btn-outline') + '" data-dense="1">Compact</button></div></div>' +
        '<div class="field"><span class="lbl">Sidebar</span><div class="btn-row mt-1">' +
        '<button class="btn ' + (!prefs.collapsed ? 'btn-primary' : 'btn-outline') + '" data-collapse="0">Expanded</button>' +
        '<button class="btn ' + (prefs.collapsed ? 'btn-primary' : 'btn-outline') + '" data-collapse="1">Icon rail</button></div></div>' +
        '<div class="field"><span class="lbl">Accent colour</span><div class="color-row mt-1">' +
        accents.map(function (a) {
          return '<button class="color-sw' + ((st.accent || '#0b6b3a') === a[0] ? ' active' : '') + '" data-accent="' + a[0] + '" style="background:' + a[0] + '" title="' + a[1] + '" aria-label="' + a[1] + '"></button>';
        }).join('') + '</div></div>' +
        '</div></div>' +
        wrap('Website branding', 'Public site colours and crest', 'leaf',
          '<div class="form-grid">' +
          UI.field({ id: 'accent', name: 'accent', type: 'color', label: 'Primary brand colour', value: st.accent || '#0b6b3a' }) +
          UI.field({ id: 'crestVariant', name: 'crestVariant', type: 'select', label: 'Crest variant', value: st.crestVariant, options: ['green', 'gold', 'mono'] }) +
          UI.field({ id: 'themeColor', name: 'themeColor', label: 'Browser theme colour', value: '#0b6b3a', hint: 'Used in the meta theme-color tag.', full: true }) +
          '</div>' +
          '<div class="note mt-1">' + icon('info', 17) + '<div>The public site stylesheet uses CSS custom properties in <span class="mono">assets/css/style.css</span>. Export your settings and apply the values there to change the live website palette.</div></div>') +
        '</div>';

      slot.querySelectorAll('[data-theme-set]').forEach(function (b) {
        b.addEventListener('click', function () {
          var v = b.dataset.themeSet;
          prefs.theme = v === 'auto' ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : v;
          prefs.themePref = v;
          savePrefs(); applyPrefs(); paint(); syncThemeButton();
          UI.toast('Theme set to ' + v + '.', 'Appearance', 'ok');
        });
      });
      slot.querySelectorAll('[data-dense]').forEach(function (b) {
        b.addEventListener('click', function () {
          prefs.dense = b.dataset.dense === '1'; savePrefs(); applyPrefs(); paint();
          var d = document.getElementById('densState'); if (d) d.textContent = prefs.dense ? 'On' : 'Off';
        });
      });
      slot.querySelectorAll('[data-collapse]').forEach(function (b) {
        b.addEventListener('click', function () {
          prefs.collapsed = b.dataset.collapse === '1'; savePrefs(); applyPrefs(); paint();
        });
      });
      slot.querySelectorAll('[data-accent]').forEach(function (b) {
        b.addEventListener('click', function () {
          prefs.accent = b.dataset.accent; savePrefs(); applyPrefs();
          slot.querySelectorAll('[data-accent]').forEach(function (x) { x.classList.remove('active'); });
          b.classList.add('active');
        });
      });
      bindSave(slot, function (v) {
        st.accent = v.accent; st.crestVariant = v.crestVariant;
        prefs.accent = v.accent; savePrefs(); applyPrefs();
        S.save(); S.log('settings', 'Settings', 'Updated website branding', 'warn');
        UI.toast('Branding saved.', 'Settings', 'ok'); paint();
      });
    }

    function dataPanel(slot) {
      var bytes = S.size();
      slot.innerHTML =
        '<div class="grid gk-2">' +
        '<div class="card"><div class="card-h"><div class="ch-t"><span class="ico">' + icon('db', 17) + '</span>' +
        '<div><h3>Data & storage</h3><div class="sub">Everything the console holds about this website</div></div></div></div>' +
        '<div class="card-pad">' +
        '<div class="grid g-3 mb-1">' +
        mini('db', F.bytes(bytes), 'Data size') +
        mini('layers', Object.keys(S.data).length, 'Collections') +
        mini('history', F.num(S.list('logs').length), 'Log entries') +
        '</div>' +
        '<div class="meter mb-1" style="background:var(--surface-3)"><i style="width:' + Math.min(100, (bytes / (5 * 1024 * 1024)) * 100).toFixed(1) + '%;background:linear-gradient(90deg,var(--green-600),var(--gold-500))"></i></div>' +
        '<p class="text-xs text-muted">' + F.bytes(bytes) + ' of approximately 5 MB browser storage used. Export a backup before clearing your browser data.</p>' +
        '<hr class="divider">' +
        '<div class="btn-row">' +
        '<button class="btn btn-primary" data-backup2>' + icon('download', 15) + 'Export full backup (JSON)</button>' +
        '<button class="btn btn-outline" data-restore>' + icon('upload', 15) + 'Restore from backup</button>' +
        '<button class="btn btn-outline" data-csvall>' + icon('download', 15) + 'Export enquiries CSV</button>' +
        '</div><hr class="divider">' +
        '<div class="btn-row">' +
        '<button class="btn btn-outline" data-reseed>' + icon('refresh', 15) + 'Reload demo content</button>' +
        '<button class="btn btn-danger" data-wipe>' + icon('trash', 15) + 'Erase all console data</button>' +
        '</div></div></div>' +

        '<div class="stack">' +
        '<div class="card"><div class="card-h"><div class="ch-t"><span class="ico">' + icon('shield', 17) + '</span>' +
        '<div><h3>Session</h3><div class="sub">Signed-in account</div></div></div></div>' +
        '<div class="card-pad">' + C.kv([
          ['Signed in as', (S.currentUser() || {}).name], ['Role', (S.currentUser() || {}).role],
          ['Email', (S.currentUser() || {}).email], ['Session started', S.session.get() ? F.dateTime(S.session.get().at) : '—'],
          ['Storage', S.session.get() && S.session.get().remember ? 'Remembered on this device' : 'This browser tab only']
        ]) + '<div class="btn-row mt-1"><button class="btn btn-outline" data-switch>' + icon('users2', 15) + 'Switch account</button>' +
          '<button class="btn btn-danger" data-logout2>' + icon('logout', 15) + 'Sign out</button></div></div></div>' +
        '<div class="card"><div class="card-h"><div class="ch-t"><span class="ico">' + icon('info', 17) + '</span>' +
        '<div><h3>About this console</h3></div></div></div>' +
        '<div class="card-pad text-sm">' +
        '<p class="mb-1">A complete, responsive administration console for the <b>' + F.esc(st.siteName) + '</b> website, built with plain HTML, CSS and JavaScript — no frameworks, no build step and no server.</p>' +
        C.kv([['Version', '1.0.0'], ['Modules', Object.keys(VIEWS).length + ' views'], ['Records', F.num(countRecords())], ['Stack', 'HTML · CSS · vanilla JS'], ['Storage', 'Browser localStorage']]) +
        '</div></div></div></div>';

      slot.querySelector('[data-backup2]').addEventListener('click', doBackup);
      slot.querySelector('[data-csvall]').addEventListener('click', function () {
        UI.download('enquiries-' + new Date().toISOString().slice(0, 10) + '.csv', UI.toCSV([
          { key: 'ref', label: 'Reference' }, { key: 'date', label: 'Received', csv: function (r) { return F.dateTime(r.date); } },
          { key: 'name', label: 'Name' }, { key: 'email', label: 'Email' }, { key: 'phone', label: 'Phone' },
          { key: 'lga', label: 'LGA' }, { key: 'subject', label: 'Subject' }, { key: 'message', label: 'Message' },
          { key: 'status', label: 'Status' }, { key: 'priority', label: 'Priority' }, { key: 'assigned', label: 'Assigned' }, { key: 'reply', label: 'Reply' }
        ], S.list('messages')), 'text/csv');
        UI.toast('Enquiries exported.', 'CSV', 'ok');
      });
      slot.querySelector('[data-restore]').addEventListener('click', restoreDialog);
      slot.querySelector('[data-reseed]').addEventListener('click', function () {
        UI.confirm({ title: 'Reload demo content?', message: 'Your changes will be replaced with the original demonstration data.', okText: 'Reload content', tone: 'warn', icon: 'refresh' }).then(function (y) {
          if (!y) return;
          S.reset(); UI.toast('Demonstration content restored.', 'Data', 'ok');
          setTimeout(function () { location.reload(); }, 700);
        });
      });
      slot.querySelector('[data-wipe]').addEventListener('click', function () {
        UI.confirm({ title: 'Erase all console data?', message: 'Every record — content, enquiries, permits, media and settings — will be permanently deleted from this browser. Export a backup first if you need it.', okText: 'Erase everything' }).then(function (y) {
          if (!y) return;
          S.wipe();
          UI.toast('Console data erased.', 'Complete', 'warn');
          setTimeout(function () { location.href = 'login.html'; }, 800);
        });
      });
      slot.querySelector('[data-switch]').addEventListener('click', switchAccount);
      slot.querySelector('[data-logout2]').addEventListener('click', logout);
    }

    function security(slot) {
      slot.innerHTML = '<div class="grid gk-2">' +
        wrap('Password policy', 'Applies to console accounts', 'lock',
          '<div class="form-grid">' +
          UI.field({ id: 'minLen', name: 'minLen', type: 'number', label: 'Minimum length', value: 10, min: 6, max: 64 }) +
          UI.field({ id: 'expiry', name: 'expiry', type: 'number', label: 'Password expiry (days)', value: 90, min: 0 }) +
          UI.field({ id: 'requireMixed', name: 'requireMixed', type: 'switch', label: 'Require mixed case, numbers and symbols', value: true, full: true }) +
          UI.field({ id: 'twoFactor', name: 'twoFactor', type: 'switch', label: 'Require two-factor authentication for Super Admins', value: true, full: true }) +
          '</div>') +
        '<div class="card"><div class="card-h"><div class="ch-t"><span class="ico">' + icon('key', 17) + '</span>' +
        '<div><h3>Change your password</h3><div class="sub">' + F.esc((S.currentUser() || {}).email || '') + '</div></div></div></div>' +
        '<div class="card-pad"><form data-form2 novalidate><div class="form-grid">' +
        UI.field({ id: 'cur', name: 'cur', type: 'password', label: 'Current password', required: true, full: true }) +
        UI.field({ id: 'np', name: 'np', type: 'password', label: 'New password', required: true }) +
        UI.field({ id: 'np2', name: 'np2', type: 'password', label: 'Confirm new password', required: true }) +
        '</div></form><div class="note mt-1">' + icon('info', 17) + '<div>This demonstration console does not store passwords. In production, passwords must be verified and hashed server-side.</div></div></div>' +
        '<div class="card-f"><span></span><button class="btn btn-primary btn-sm" data-pw>' + icon('key', 14) + 'Update password</button></div></div>' +
        '</div>' +
        '<div class="card mt-1"><div class="card-h"><div class="ch-t"><span class="ico">' + icon('history', 17) + '</span>' +
        '<div><h3>Recent sign-ins</h3><div class="sub">Session events from the audit log</div></div></div></div>' +
        '<div class="card-pad">' +
        (S.list('logs').filter(function (l) { return l.action === 'login' || l.action === 'logout'; }).slice(0, 8).map(function (l) {
          return '<div class="log-row"><span class="lt">' + F.dateTime(l.at) + '</span><span class="lm"><b>' + F.esc(l.user) + '</b> ' + F.esc(l.detail) + '</span>' +
            '<span class="badge ' + (l.action === 'login' ? 'b-ok' : 'b-outline') + '">' + l.action + '</span></div>';
        }).join('') || '<p class="text-sm text-muted">No sign-in events recorded yet.</p>') +
        '</div></div>';

      bindSave(slot, function () {
        S.log('settings', 'Settings', 'Updated password policy', 'warn');
        UI.toast('Password policy saved.', 'Security', 'ok');
      });
      slot.querySelector('[data-pw]').addEventListener('click', function () {
        var f = slot.querySelector('[data-form2]');
        var v = UI.readForm(f);
        if (!v.cur || !v.np || !v.np2) { UI.toast('All three password fields are required.', 'Incomplete', 'err'); return; }
        if (v.np !== v.np2) { UI.toast('The new passwords do not match.', 'Mismatch', 'err'); return; }
        if (String(v.np).length < 8) { UI.toast('Use at least 8 characters.', 'Too short', 'err'); return; }
        S.log('settings', 'Security', 'Password changed for ' + ((S.currentUser() || {}).email || 'the signed-in account'), 'warn');
        UI.toast('Password updated successfully.', 'Security', 'ok');
        f.querySelectorAll('input').forEach(function (i) { i.value = ''; });
      });
    }

    function countRecords() {
      var n = 0;
      Object.keys(S.data).forEach(function (k) { if (Array.isArray(S.data[k])) n += S.data[k].length; });
      return n;
    }

    function doBackup() {
      UI.download('gombe-admin-backup-' + new Date().toISOString().slice(0, 10) + '.json', S.export(), 'application/json');
      S.log('backup', 'Settings', 'Exported a full JSON backup (' + F.bytes(S.size()) + ')', 'ok');
      UI.toast('Backup downloaded — keep it somewhere safe.', 'Export complete', 'ok');
    }

    function restoreDialog() {
      var m = UI.modal({
        title: 'Restore from backup', subtitle: 'Import a JSON export from this console', icon: 'upload', size: 'sm',
        body: '<div class="note warn mb-1">' + icon('alert', 17) + '<div>Importing replaces <b>all</b> current data. Export a backup first if you might want it back.</div></div>' +
          '<div class="field"><label class="lbl">Choose a .json backup file</label>' +
          '<input type="file" accept="application/json,.json" data-file></div>' +
          '<div class="field"><label class="lbl">…or paste the JSON</label><textarea rows="5" data-paste placeholder="{ &quot;meta&quot;: … }"></textarea></div>',
        footer: '<button class="btn" data-close>Cancel</button><button class="btn btn-primary" data-go>' + icon('upload', 15) + 'Restore</button>',
        onOpen: function (api) {
          api.el.querySelector('[data-go]').addEventListener('click', function () {
            var file = api.el.querySelector('[data-file]').files[0];
            var text = api.el.querySelector('[data-paste]').value.trim();
            function attempt(json) {
              try {
                S.import(json);
                S.log('restore', 'Settings', 'Restored console data from a backup', 'warn');
                UI.toast('Backup restored successfully.', 'Data', 'ok');
                api.close();
                setTimeout(function () { location.reload(); }, 800);
              } catch (err) {
                UI.toast('That file could not be read as a console backup.', 'Import failed', 'err', 6000);
              }
            }
            if (file) {
              var fr = new FileReader();
              fr.onload = function () { attempt(fr.result); };
              fr.readAsText(file);
            } else if (text) attempt(text);
            else UI.toast('Choose a file or paste JSON first.', 'Nothing to import', 'warn');
          });
        }
      });
      return m;
    }

    paint();
  }

  /* =====================================================================
     GLOBAL SEARCH
     ===================================================================== */
  function searchIndex(q) {
    q = q.toLowerCase().trim();
    if (!q) return [];
    var out = [];
    function push(group, route, title, sub, ic) { out.push({ group: group, route: route, title: title, sub: sub || '', icon: ic }); }

    S.list('news').forEach(function (n) { if ((n.title + ' ' + n.excerpt + ' ' + n.cat).toLowerCase().indexOf(q) > -1) push('Newsroom', 'news', n.title, n.cat + ' · ' + F.date(n.date), 'news'); });
    S.list('messages').forEach(function (m) { if ((m.name + ' ' + m.subject + ' ' + m.message + ' ' + m.ref).toLowerCase().indexOf(q) > -1) push('Enquiries', 'enquiries', m.name + ' — ' + m.subject, m.ref + ' · ' + F.ago(m.date), 'mail'); });
    S.list('permits').forEach(function (p) { if ((p.ref + ' ' + p.applicant + ' ' + p.type).toLowerCase().indexOf(q) > -1) push('Permits', 'permits', p.applicant + ' — ' + p.type, p.ref + ' · ' + p.status, 'clipboard'); });
    S.list('reports').forEach(function (r) { if ((r.ref + ' ' + r.type + ' ' + r.location).toLowerCase().indexOf(q) > -1) push('Incidents', 'reports', r.type + ' — ' + r.location, r.ref + ' · ' + r.severity, 'alert'); });
    S.list('projects').forEach(function (p) { if ((p.name + ' ' + p.partner + ' ' + p.theme).toLowerCase().indexOf(q) > -1) push('Projects', 'projects', p.name, p.theme + ' · ' + p.progress + '%', 'projects'); });
    S.list('departments').forEach(function (d) { if ((d.name + ' ' + d.head + ' ' + d.summary).toLowerCase().indexOf(q) > -1) push('Departments', 'departments', d.name, 'Head: ' + d.head, 'departments'); });
    S.list('staff').forEach(function (s) { if ((s.name + ' ' + s.role).toLowerCase().indexOf(q) > -1) push('People', 'departments', s.name, s.role, 'staff'); });
    S.list('services').forEach(function (s) { if ((s.title + ' ' + s.short).toLowerCase().indexOf(q) > -1) push('Services', 'services', s.title, s.dept, 'services'); });
    S.list('documents').forEach(function (d) { if ((d.title + ' ' + d.cat).toLowerCase().indexOf(q) > -1) push('Documents', 'documents', d.title, d.cat + ' · ' + F.num(d.downloads) + ' downloads', 'download'); });
    S.list('media').forEach(function (m) { if ((m.name + ' ' + m.alt).toLowerCase().indexOf(q) > -1) push('Media', 'media', m.name, m.folder + ' · ' + F.bytes(m.size), 'media'); });
    S.list('gallery').forEach(function (g) { if ((g.caption + ' ' + g.cat).toLowerCase().indexOf(q) > -1) push('Gallery', 'gallery', g.caption, g.cat, 'gallery'); });
    S.list('events').forEach(function (e) { if ((e.title + ' ' + e.location + ' ' + e.type).toLowerCase().indexOf(q) > -1) push('Events', 'events', e.title, F.date(e.date) + ' · ' + e.type, 'calendar'); });
    S.list('users').forEach(function (u) { if ((u.name + ' ' + u.email + ' ' + u.role).toLowerCase().indexOf(q) > -1) push('Users', 'users', u.name, u.role + ' · ' + u.email, 'shield'); });
    S.list('subscribers').forEach(function (s) { if ((s.email + ' ' + s.name).toLowerCase().indexOf(q) > -1) push('Subscribers', 'subscribers', s.email, s.name + ' · ' + s.status, 'send'); });
    S.list('pages').forEach(function (p) { if ((p.name + ' ' + p.file).toLowerCase().indexOf(q) > -1) push('Pages', 'pages', p.name, p.file, 'pages'); });
    Object.keys(ROUTE_META).forEach(function (k) {
      if (ROUTE_META[k].label.toLowerCase().indexOf(q) > -1) push('Navigate', k, ROUTE_META[k].label, ROUTE_META[k].group + ' module', ROUTE_META[k].icon);
    });
    return out.slice(0, 24);
  }

  function renderSearchResults(q) {
    var box = document.getElementById('gsr');
    var res = searchIndex(q);
    if (!q.trim()) { box.classList.remove('show'); box.innerHTML = ''; return; }
    if (!res.length) {
      box.innerHTML = '<div class="gsr-empty">' + icon('search', 22) + '<div style="margin-top:.4rem">No results for “' + F.esc(q) + '”</div></div>';
      box.classList.add('show'); return;
    }
    var groups = {};
    res.forEach(function (r) { (groups[r.group] = groups[r.group] || []).push(r); });
    box.innerHTML = Object.keys(groups).map(function (g) {
      return '<div class="gsr-group"><div class="gsr-h">' + F.esc(g) + '</div>' + groups[g].slice(0, 5).map(function (r) {
        return '<div class="gsr-item" data-route="' + r.route + '" role="option">' + icon(r.icon, 15) +
          '<span class="truncate" style="max-width:60%">' + F.esc(r.title) + '</span><span class="sub">' + F.esc(r.sub) + '</span></div>';
      }).join('') + '</div>';
    }).join('');
    box.classList.add('show');
    box.querySelectorAll('[data-route]').forEach(function (el) {
      el.addEventListener('click', function () {
        go(el.dataset.route);
        box.classList.remove('show');
        document.getElementById('gsearch').value = '';
        document.getElementById('gsearch').setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* =====================================================================
     NOTIFICATIONS
     ===================================================================== */
  function renderNotifications() {
    var list = S.list('notifications');
    var unread = list.filter(function (n) { return !n.read; }).length;
    var dot = document.getElementById('notifCount');
    if (dot) {
      dot.textContent = unread;
      dot.style.display = unread ? '' : 'none';
    }
    var host = document.getElementById('notifList');
    if (!host) return;
    var icons = { enquiry: 'mail', permit: 'clipboard', news: 'news', media: 'media', system: 'db' };
    host.innerHTML = list.length ? list.map(function (n) {
      return '<div class="menu-item' + (n.read ? '' : ' unread') + '" data-notif="' + n.id + '" data-route="' + F.esc(n.link || 'dashboard') + '">' +
        '<span class="ico">' + icon(icons[n.type] || 'info', 16) + '</span>' +
        '<span class="b"><span class="t1">' + F.esc(n.title) + '</span><span class="t2">' + F.esc(n.text) + '</span>' +
        '<span class="t3">' + F.ago(n.at) + '</span></span></div>';
    }).join('') : '<div class="gsr-empty">No notifications</div>';

    host.querySelectorAll('[data-notif]').forEach(function (el) {
      el.addEventListener('click', function () {
        S.update('notifications', el.dataset.notif, { read: true });
        renderNotifications();
        closeMenus();
        go(el.dataset.route);
      });
    });
  }

  /* =====================================================================
     MENUS / GLOBAL INTERACTIONS
     ===================================================================== */
  function closeMenus() {
    document.querySelectorAll('.menu.open').forEach(function (m) {
      m.classList.remove('open');
      var b = m.querySelector('[data-menu]'); if (b) b.setAttribute('aria-expanded', 'false');
    });
  }

  function syncThemeButton() {
    /* NB: never select this with [data-theme] — that attribute also lives on
       <html>, and writing to the <html> element would wipe the whole page. */
    var b = document.querySelector('[data-themebtn]');
    if (b) b.innerHTML = icon(prefs.theme === 'dark' ? 'sun' : 'moon', 19);
  }

  function quickAdd() {
    var items = [
      ['news', 'news', 'News story'], ['media', 'upload', 'Upload media'], ['permits', 'clipboard', 'Permit application'],
      ['reports', 'alert', 'Incident report'], ['enquiries', 'phone', 'Log a call-in'], ['events', 'calendar', 'Event'],
      ['documents', 'download', 'Document'], ['projects', 'projects', 'Programme'], ['subscribers', 'send', 'Newsletter campaign']
    ].filter(function (i) {
      return can(ROUTE_META[i[0]] ? ROUTE_META[i[0]].perm : 'content');
    });
    var m = UI.modal({
      title: 'Create new…', subtitle: 'Jump straight into a module', icon: 'plus', size: 'sm',
      body: '<div class="quick-tiles" style="grid-template-columns:repeat(auto-fit,minmax(120px,1fr))">' + items.map(function (i) {
        return '<button class="qtile" data-go="' + i[0] + '"><span class="qi">' + icon(i[1], 18) + '</span><span>' + i[2] + '</span></button>';
      }).join('') + '</div>',
      footer: null
    });
    m.el.querySelectorAll('[data-go]').forEach(function (b) {
      b.addEventListener('click', function () { m.close(); go(b.dataset.go); });
    });
  }

  function shortcutsDialog() {
    var rows = [
      ['Ctrl / ⌘ + K', 'Focus the global search'], ['Esc', 'Close a dialog, drawer or menu'],
      ['Ctrl / ⌘ + B', 'Collapse or expand the sidebar'], ['Alt + D', 'Go to the dashboard'],
      ['Alt + E', 'Go to enquiries'], ['Alt + N', 'Go to the newsroom'], ['Alt + P', 'Go to permits'],
      ['Alt + S', 'Go to settings'], ['?', 'Open this shortcut list']
    ];
    UI.modal({
      title: 'Keyboard shortcuts', icon: 'key', size: 'sm',
      body: '<div class="kv">' + rows.map(function (r) {
        return '<div class="kv-row"><span class="k"><kbd class="mono" style="background:var(--surface-3);border:1px solid var(--line);border-radius:5px;padding:.1rem .4rem">' + r[0] + '</kbd></span><span class="v" style="text-align:left;font-weight:500">' + r[1] + '</span></div>';
      }).join('') + '</div>',
      footer: '<button class="btn btn-primary" data-close>Got it</button>'
    });
  }

  function helpDialog() {
    var st = S.data.settings;
    UI.modal({
      title: 'About this console', subtitle: 'Admin dashboard for ' + F.esc(st.siteName), icon: 'info', size: 'md',
      body:
        '<p class="text-sm">A complete, responsive administration console for the Gombe State Ministry of Environment &amp; Forest Resources website. It is built entirely with <b>plain HTML, CSS and JavaScript</b> — no frameworks, no build tools and no server.</p>' +
        '<div class="grid g-2 mb-1">' +
        '<div class="card card-pad" style="background:var(--surface-2);box-shadow:none"><b style="color:var(--ink)">Content</b><ul class="text-sm text-muted mt-1" style="list-style:disc;padding-left:1.1rem">' +
        '<li>Newsroom with rich text editor, scheduling and tags</li><li>Page blocks and SEO metadata for all 8 pages</li>' +
        '<li>Hero slider, milestones, quick links and counters</li><li>Programmes, directorates, leadership and agencies</li>' +
        '<li>Services, fee schedule, FAQs and application steps</li></ul></div>' +
        '<div class="card card-pad" style="background:var(--surface-2);box-shadow:none"><b style="color:var(--ink)">Operations</b><ul class="text-sm text-muted mt-1" style="list-style:disc;padding-left:1.1rem">' +
        '<li>Enquiry inbox with assignment, status and replies</li><li>Environmental incident reports with severity workflow</li>' +
        '<li>Permit register and drag-and-drop workflow board</li><li>Events calendar and sanitation schedule</li>' +
        '<li>Media library with in-browser image compression</li></ul></div>' +
        '</div>' +
        '<div class="note">' + icon('db', 17) + '<div><b>Where is the data?</b> Everything is stored in this browser using <span class="mono">localStorage</span>. Use Settings → Data &amp; backup to export a JSON backup or restore one. Connect that export to your deployment pipeline to publish changes to the live static pages.</div></div>',
      footer: '<button class="btn" data-close>Close</button><a class="btn btn-primary" href="../index.html" target="_blank" rel="noopener">' + icon('external', 15) + 'Open the website</a>'
    });
  }

  function switchAccount() {
    var users = S.list('users').filter(function (u) { return u.status !== 'Suspended'; });
    var m = UI.modal({
      title: 'Switch account', subtitle: 'Preview the console with another role', icon: 'users2', size: 'sm',
      body: '<div class="rows">' + users.map(function (u) {
        return '<div class="row-item" data-acc="' + u.id + '" style="cursor:pointer">' + UI.avatar(u.name, 'avatar-sm') +
          '<div class="b"><div class="t1">' + F.esc(u.name) + '</div><div class="meta"><span>' + F.esc(u.role) + '</span><span>' + F.esc(u.dept) + '</span></div></div>' +
          (u.id === S.data.currentUser ? '<span class="badge b-gold">Current</span>' : icon('chevronRight', 15)) + '</div>';
      }).join('') + '</div>',
      footer: '<button class="btn" data-close>Cancel</button>'
    });
    m.el.querySelectorAll('[data-acc]').forEach(function (el) {
      el.addEventListener('click', function () {
        var u = S.find('users', el.dataset.acc);
        S.data.currentUser = u.id; S.save();
        S.log('login', 'Session', 'Switched to account ' + u.name + ' (' + u.role + ')', 'warn');
        UI.toast('Now signed in as ' + u.name + ' (' + u.role + ').', 'Account switched', 'ok');
        m.close();
        setTimeout(function () { location.reload(); }, 600);
      });
    });
  }

  function logout() {
    UI.confirm({
      title: 'Sign out of the console?', icon: 'logout', tone: 'warn', okText: 'Sign out',
      message: 'Your content stays saved in this browser. You will be returned to the sign-in page.'
    }).then(function (y) {
      if (!y) return;
      S.log('logout', 'Session', (S.currentUser() || {}).name + ' signed out', 'info');
      S.session.clear();
      location.href = 'login.html';
    });
  }

  /* =====================================================================
     BOOT
     ===================================================================== */
  function bindShell() {
    var sb = document.getElementById('sidebar'), scrim = document.getElementById('scrim');
    function navOpen(open) {
      sb.classList.toggle('open', open);
      scrim.classList.toggle('show', open);
      var t = document.querySelector('[data-navtoggle]');
      t.setAttribute('aria-expanded', String(open));
      if (open && window.innerWidth < 1024) document.body.style.overflow = 'hidden';
      else document.body.style.overflow = '';
    }
    document.querySelector('[data-navtoggle]').addEventListener('click', function () {
      if (window.innerWidth >= 1024) {
        prefs.collapsed = !prefs.collapsed; savePrefs(); applyPrefs();
      } else navOpen(!sb.classList.contains('open'));
    });
    document.querySelector('[data-navclose]').addEventListener('click', function () { navOpen(false); });
    scrim.addEventListener('click', function () { navOpen(false); });
    window.addEventListener('resize', function () { if (window.innerWidth >= 1024) navOpen(false); });

    document.querySelectorAll('#sideNav').forEach(function (n) {
      n.addEventListener('click', function (e) { if (e.target.closest('a') && window.innerWidth < 1024) navOpen(false); });
    });

    document.querySelector('[data-themebtn]').addEventListener('click', function (e) {
      e.stopPropagation();
      prefs.theme = prefs.theme === 'dark' ? 'light' : 'dark';
      prefs.themePref = prefs.theme;
      savePrefs(); applyPrefs(); syncThemeButton();
      UI.toast('Switched to the ' + prefs.theme + ' theme.', 'Appearance', 'info', 2200);
    });

    document.querySelector('[data-quickadd]').addEventListener('click', quickAdd);
    document.querySelector('[data-backup]').addEventListener('click', function () {
      UI.download('gombe-admin-backup-' + new Date().toISOString().slice(0, 10) + '.json', S.export(), 'application/json');
      S.log('backup', 'Settings', 'Exported a full JSON backup', 'ok');
      UI.toast('Backup downloaded.', 'Export complete', 'ok');
    });

    /* menus */
    document.querySelectorAll('[data-menu]').forEach(function (b) {
      b.addEventListener('click', function (e) {
        e.stopPropagation();
        var menu = b.closest('.menu');
        var wasOpen = menu.classList.contains('open');
        closeMenus();
        if (!wasOpen) { menu.classList.add('open'); b.setAttribute('aria-expanded', 'true'); }
      });
    });
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.menu')) closeMenus();
      var box = document.getElementById('gsr');
      if (box && !e.target.closest('.gsearch')) box.classList.remove('show');
    });

    var nr = document.querySelector('[data-notifread]');
    if (nr) nr.addEventListener('click', function () {
      S.list('notifications').forEach(function (n) { S.update('notifications', n.id, { read: true }); });
      renderNotifications(); UI.toast('All notifications marked as read.', 'Notifications', 'ok');
    });

    /* profile menu actions */
    var d = document.querySelector('[data-density]');
    if (d) d.addEventListener('click', function () {
      prefs.dense = !prefs.dense; savePrefs(); applyPrefs();
      var s = document.getElementById('densState'); if (s) s.textContent = prefs.dense ? 'On' : 'Off';
    });
    document.querySelector('[data-shortcuts]').addEventListener('click', function () { closeMenus(); shortcutsDialog(); });
    document.querySelector('[data-help]').addEventListener('click', function () { closeMenus(); helpDialog(); });
    document.querySelector('[data-logout]').addEventListener('click', function () { closeMenus(); logout(); });

    /* global search */
    var gs = document.getElementById('gsearch');
    gs.addEventListener('input', function () {
      renderSearchResults(gs.value);
      gs.setAttribute('aria-expanded', String(!!gs.value));
    });
    gs.addEventListener('focus', function () { if (gs.value) renderSearchResults(gs.value); });

    /* keyboard shortcuts */
    document.addEventListener('keydown', function (e) {
      var typing = /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.target.isContentEditable;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); gs.focus(); gs.select(); return; }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        if (window.innerWidth >= 1024) { prefs.collapsed = !prefs.collapsed; savePrefs(); applyPrefs(); }
        else navOpen(!sb.classList.contains('open'));
        return;
      }
      if (typing) return;
      if (e.altKey) {
        var map = { d: 'dashboard', e: 'enquiries', n: 'news', p: 'permits', s: 'settings', a: 'analytics', m: 'media' };
        var k = map[e.key.toLowerCase()];
        if (k) { e.preventDefault(); go(k); }
        return;
      }
      if (e.key === '?') { e.preventDefault(); shortcutsDialog(); }
    });

    window.addEventListener('hashchange', render);
  }

  function boot() {
    S.init();
    var sess = S.session.get();
    if (!sess || !sess.userId) { location.replace('login.html'); return; }
    S.data.currentUser = sess.userId;
    var u = S.currentUser();
    if (u) { u.lastLogin = u.lastLogin || new Date().toISOString(); }
    S.save();
    applyPrefs();
    buildShell();
    bindShell();
    if (!location.hash) location.hash = '#/dashboard';
    render();
    var d = document.getElementById('densState'); if (d) d.textContent = prefs.dense ? 'On' : 'Off';

    /* welcome toast */
    setTimeout(function () {
      var unread = S.list('messages').filter(function (m) { return !m.read; }).length;
      UI.toast(unread ? 'You have ' + unread + ' unread enquiry(ies) waiting.' : 'All enquiries have been read.', 'Welcome back, ' + (u ? u.name.split(' ')[0] : ''), unread ? 'info' : 'ok');
    }, 700);

    /* browser storage may be blocked on opaque (file://) origins */
    if (!S.persistent()) {
      setTimeout(function () {
        UI.toast('This browser is blocking local storage, so your changes will be lost when the tab closes. Serve the site over http:// (or open it in Firefox) to save work between sessions.', 'Storage unavailable', 'warn', 12000);
      }, 1600);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})(window);
