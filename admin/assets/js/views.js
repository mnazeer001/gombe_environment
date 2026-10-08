/* =====================================================================
   Gombe State Ministry of Environment & Forest Resources
   ADMIN CONSOLE — views.js
   Content & operations modules: newsroom, projects, departments,
   services, media, gallery, enquiries, incident reports, permits,
   events, documents, newsletter, users & roles, audit log.
   ===================================================================== */
(function (global) {
  'use strict';

  var S = global.AdminStore, UI = global.UI, C = global.Crud;
  var F = UI.F, icon = UI.icon, V = {};

  /* ---------- shared helpers ---------- */
  function mediaOptions() {
    return S.list('media').map(function (m) { return { src: m.src, name: m.name }; });
  }
  function staffNames() {
    return S.list('staff').map(function (s) { return s.name.replace(/^(Hon\.|Mrs\.|Mr\.|Dr\.)\s*/, ''); });
  }
  function userNames() { return S.list('users').map(function (u) { return u.name; }); }
  function roleNames() { return S.list('roles').map(function (r) { return r.name; }); }
  function deptNames() { return S.list('departments').map(function (d) { return d.name; }); }
  function uniq(arr) { return arr.filter(function (v, i) { return arr.indexOf(v) === i; }); }
  function today() { return new Date().toISOString().slice(0, 10); }
  function daysBetween(iso) { return Math.round((new Date(iso) - new Date()) / 86400000); }

  function nextRef(prefix, store, pad) {
    var yr = new Date().getFullYear();
    var nums = S.list(store).map(function (r) {
      var m = String(r.ref || '').match(/(\d+)$/); return m ? parseInt(m[1], 10) : 0;
    });
    var n = (nums.length ? Math.max.apply(null, nums) : (pad || 300)) + 1;
    return prefix + '-' + yr + '-' + n;
  }

  /* =====================================================================
     NEWSROOM
     ===================================================================== */
  V.news = C.entity({
    store: 'news', icon: 'news', title: 'Newsroom',
    subtitle: 'Press releases, public notices, project updates, events and procurement notices published on the news page.',
    createLabel: 'New story', csvName: 'newsroom',
    searchPlaceholder: 'Search stories, tags, authors…',
    headActions: '<a class="btn btn-outline" href="../news.html" target="_blank" rel="noopener">' + icon('external', 15) + 'View news page</a>',
    kpis: function () {
      var n = S.list('news');
      return [
        { label: 'Published', value: n.filter(function (x) { return x.status === 'Published'; }).length, icon: 'checkCircle', tone: 'ok' },
        { label: 'Drafts & reviews', value: n.filter(function (x) { return x.status === 'Draft' || x.status === 'In review'; }).length, icon: 'edit' },
        { label: 'Scheduled', value: n.filter(function (x) { return x.status === 'Scheduled'; }).length, icon: 'clock' },
        { label: 'Total views', value: F.compact(n.reduce(function (a, b) { return a + (b.views || 0); }, 0)), icon: 'eye' }
      ];
    },
    search: function (r) { return [r.title, r.cat, r.author, r.status, (r.tags || []).join(' '), r.excerpt].join(' '); },
    filters: [
      { key: 'status', label: 'Status', options: ['Published', 'Draft', 'In review', 'Scheduled'] },
      { key: 'cat', label: 'Category', options: S.list('newsCategories') }
    ],
    cols: [
      {
        key: 'title', label: 'Story', render: function (r) {
          return '<div class="cell-main">' + UI.thumb(r.image, 'thumb', r.title) +
            '<div class="b"><div class="t1">' + (r.pinned ? icon('star', 12) + ' ' : '') + F.esc(r.title) + '</div>' +
            '<div class="t2">' + F.esc(r.excerpt || '').slice(0, 86) + '…</div></div></div>';
        }
      },
      { key: 'cat', label: 'Category', render: function (r) { return '<span class="badge b-green">' + F.esc(r.cat) + '</span>'; } },
      { key: 'date', label: 'Date', render: function (r) { return F.date(r.date); }, sortValue: function (r) { return r.date; } },
      { key: 'author', label: 'Author', render: function (r) { return '<div class="cell-main">' + UI.avatar(r.author, 'avatar-xs g1') + '<span>' + F.esc(r.author) + '</span></div>'; } },
      { key: 'status', label: 'Status', render: function (r) { return UI.statusBadge(r.status); } },
      { key: 'views', label: 'Views', align: 'right', render: function (r) { return F.num(r.views || 0); } }
    ],
    actions: function (r) {
      return UI.act('toggle', r.id, r.status === 'Published' ? 'eye' : 'send', r.status === 'Published' ? 'Unpublish' : 'Publish') +
        UI.act('edit', r.id, 'edit', 'Edit story') +
        UI.act('dup', r.id, 'copy', 'Duplicate') +
        UI.act('del', r.id, 'trash', 'Delete');
    },
    bulk: [
      { id: 'publish', label: 'Publish', icon: 'send', cls: 'btn-outline' },
      { id: 'draft', label: 'Move to draft', icon: 'edit' },
      { id: 'feature', label: 'Toggle featured', icon: 'star' },
      { id: 'delete', label: 'Delete', icon: 'trash', cls: 'btn-danger' }
    ],
    onBulk: function (act, ids, done) {
      ids.forEach(function (id) {
        if (act === 'publish') S.update('news', id, { status: 'Published', date: S.find('news', id).date || today() });
        if (act === 'draft') S.update('news', id, { status: 'Draft' });
        if (act === 'feature') { var n = S.find('news', id); S.update('news', id, { featured: !n.featured }); }
      });
      S.log('bulk', 'Newsroom', act + ' applied to ' + ids.length + ' stories', 'info');
      UI.toast(ids.length + ' stories updated.', 'Bulk action complete', 'ok');
      done();
    },
    fields: function (item) {
      return [
        { id: 'title', name: 'title', label: 'Headline', value: item.title, required: true, full: true, placeholder: 'e.g. Ministry opens seedling distribution to schools' },
        { id: 'cat', name: 'cat', type: 'select', label: 'Category', value: item.cat || 'Press release', options: S.list('newsCategories'), required: true },
        { id: 'status', name: 'status', type: 'select', label: 'Status', value: item.status || 'Draft', options: ['Draft', 'In review', 'Scheduled', 'Published'], required: true },
        { id: 'date', name: 'date', type: 'date', label: 'Publish date', value: (item.date || today()) },
        { id: 'author', name: 'author', type: 'select', label: 'Author', value: item.author || (S.currentUser() || {}).name, options: uniq(userNames().concat(staffNames())) },
        { id: 'image', name: 'image', type: 'image', label: 'Featured image', value: item.image || '', options: mediaOptions(), full: true, hint: 'Pick from the media library (1600×1067 recommended).' },
        { id: 'tags', name: 'tags', type: 'tags', label: 'Tags', value: item.tags || [], full: true, placeholder: 'Add a tag and press Enter' },
        { id: 'excerpt', name: 'excerpt', type: 'textarea', label: 'Summary / standfirst', value: item.excerpt, rows: 3, full: true, required: true, hint: 'Shown on the news listing cards — keep it under 180 characters.' },
        { id: 'body', name: 'body', type: 'editor', label: 'Story body', value: item.body || '', full: true },
        { id: 'featured', name: 'featured', type: 'switch', label: 'Feature on the home page', hint: 'Featured stories appear in the home page carousel strip.', value: !!item.featured },
        { id: 'pinned', name: 'pinned', type: 'switch', label: 'Pin to the top of the newsroom', hint: 'Pinned stories stay first in the list.', value: !!item.pinned },
        { id: 'views', name: 'views', type: 'number', label: 'View count', value: item.views || 0, min: 0 }
      ];
    },
    onSave: function (vals, item) {
      vals.views = Number(vals.views) || 0;
      if (item.id) {
        S.update('news', item.id, vals);
        S.log(vals.status === 'Published' ? 'publish' : 'update', 'Newsroom', (vals.status === 'Published' ? 'Published' : 'Updated') + ' "' + vals.title + '"', 'ok');
        UI.toast('"' + vals.title.slice(0, 48) + '" saved.', 'Story updated', 'ok');
      } else {
        vals.id = S.uid('n'); vals.views = 0;
        S.add('news', vals);
        S.log('create', 'Newsroom', 'Created story "' + vals.title + '" (' + vals.status + ')', 'ok');
        UI.toast('Story created as ' + vals.status + '.', 'New story', 'ok');
      }
    },
    onAction: function (act, id, h, paint) {
      var n = S.find('news', id);
      if (act === 'edit') return openNewsEditor(n, paint);
      if (act === 'toggle') {
        var to = n.status === 'Published' ? 'Draft' : 'Published';
        S.update('news', id, { status: to, date: to === 'Published' ? (n.date || today()) : n.date });
        S.log(to === 'Published' ? 'publish' : 'unpublish', 'Newsroom', '"' + n.title + '" → ' + to, to === 'Published' ? 'ok' : 'warn');
        UI.toast(to === 'Published' ? 'Story is now live on the news page.' : 'Story moved back to draft.', to === 'Published' ? 'Published' : 'Unpublished', to === 'Published' ? 'ok' : 'warn');
        paint();
      }
      if (act === 'dup') {
        var copy = JSON.parse(JSON.stringify(n));
        copy.id = S.uid('n'); copy.title = n.title + ' (copy)'; copy.status = 'Draft'; copy.views = 0; copy.date = today();
        S.add('news', copy); S.log('create', 'Newsroom', 'Duplicated "' + n.title + '"', 'info');
        UI.toast('Duplicate created as a draft.', 'Duplicated', 'ok'); paint();
      }
      if (act === 'del') C.del('news', id, F.esc(n.title), paint);
    },
    onRow: function (id, h, paint) { openNewsReader(id, paint); }
  });

  function openNewsEditor(item, paint) {
    C.editor({
      title: item.id ? 'Edit story' : 'New story',
      subtitle: item.id ? 'Last saved ' + F.ago(item.date) : 'Draft a new newsroom item',
      icon: 'news', size: 'lg', item: item,
      fields: V.news.fields ? V.news.fields(item) : [],
      onSave: function (vals, it) {
        vals.views = Number(vals.views) || 0;
        if (it.id) { S.update('news', it.id, vals); S.log('update', 'Newsroom', 'Updated "' + vals.title + '"', 'info'); UI.toast('Story saved.', 'Updated', 'ok'); }
        else { vals.id = S.uid('n'); vals.views = 0; S.add('news', vals); S.log('create', 'Newsroom', 'Created "' + vals.title + '"', 'ok'); UI.toast('Story created.', 'New story', 'ok'); }
        paint && paint();
      }
    });
  }

  function openNewsReader(id, paint) {
    var n = S.find('news', id);
    if (!n) return;
    S.update('news', id, { views: n.views });
    var body =
      '<div class="grid g-3 mb-1">' +
      [['Published', n.status], ['Views', F.num(n.views || 0)], ['Category', n.cat]].map(function (p) {
        return '<div class="stat-mini"><span><span class="v">' + F.esc(p[1]) + '</span><span class="l">' + p[0] + '</span></span></div>';
      }).join('') + '</div>' +
      (n.image ? '<img src="' + F.esc(n.image) + '" alt="" style="width:100%;border-radius:12px;margin-bottom:.9rem">' : '') +
      '<h3 style="font-size:1.15rem;margin-bottom:.35rem">' + F.esc(n.title) + '</h3>' +
      '<div class="text-xs text-muted mb-1">' + icon('calendar', 12) + ' ' + F.date(n.date) + ' · ' + icon('user', 12) + ' ' + F.esc(n.author) +
      ' · ' + (n.tags || []).map(function (t) { return '<span class="badge b-outline" style="margin-left:.3rem">#' + F.esc(t) + '</span>'; }).join('') + '</div>' +
      '<p class="text-sm" style="font-weight:600;color:var(--ink)">' + F.esc(n.excerpt) + '</p>' +
      '<hr class="divider">' +
      '<div class="text-sm" style="line-height:1.75">' + (n.body || '<em class="text-muted">No body content yet.</em>') + '</div>' +
      '<hr class="divider">' +
      C.kv([['Story ID', n.id], ['Featured', n.featured ? 'Yes — home page' : 'No'], ['Pinned', n.pinned ? 'Yes' : 'No'], ['Reading time', Math.max(1, Math.round(F.strip(n.body).split(/\s+/).length / 200)) + ' min']]);

    C.detail({
      title: 'Story preview', subtitle: F.esc(n.cat) + ' · ' + F.date(n.date), icon: 'news', body: body,
      footer: '<button class="btn" data-close>Close</button>' +
        '<button class="btn btn-outline" data-act="toggle">' + icon(n.status === 'Published' ? 'eye' : 'send', 15) + (n.status === 'Published' ? 'Unpublish' : 'Publish') + '</button>' +
        '<button class="btn btn-primary" data-act="edit">' + icon('edit', 15) + 'Edit story</button>',
      onOpen: function (api) {
        api.el.querySelector('[data-act="edit"]').addEventListener('click', function () { api.close(); openNewsEditor(n, paint); });
        api.el.querySelector('[data-act="toggle"]').addEventListener('click', function () {
          var to = n.status === 'Published' ? 'Draft' : 'Published';
          S.update('news', id, { status: to });
          S.log(to === 'Published' ? 'publish' : 'unpublish', 'Newsroom', '"' + n.title + '" → ' + to, 'info');
          UI.toast('Status changed to ' + to + '.', 'Newsroom', 'ok');
          api.close(); paint && paint();
        });
      }
    });
  }

  /* =====================================================================
     PROJECTS & PROGRAMMES
     ===================================================================== */
  V.projects = C.entity({
    store: 'projects', icon: 'projects', title: 'Programmes & Projects',
    subtitle: 'Flagship initiatives, partners, budgets and implementation progress shown on the projects page.',
    createLabel: 'New programme', csvName: 'projects',
    headActions: '<a class="btn btn-outline" href="../projects.html" target="_blank" rel="noopener">' + icon('external', 15) + 'View projects page</a>',
    kpis: function () {
      var p = S.list('projects');
      var budget = p.reduce(function (a, b) { return a + (b.budget || 0); }, 0);
      var spent = p.reduce(function (a, b) { return a + (b.spent || 0); }, 0);
      return [
        { label: 'Programmes', value: p.length, icon: 'projects' },
        { label: 'Active', value: p.filter(function (x) { return x.status === 'Active'; }).length, icon: 'activity' },
        { label: 'Approved budget', value: F.nairaShort(budget), icon: 'card' },
        { label: 'Utilisation', value: F.pct(budget ? (spent / budget) * 100 : 0), icon: 'percent' }
      ];
    },
    search: function (r) { return [r.name, r.theme, r.partner, r.lga, r.manager, r.status, (r.tags || []).join(' ')].join(' '); },
    filters: [
      { key: 'theme', label: 'Theme', options: uniq(S.list('projects').map(function (p) { return p.theme; })) },
      { key: 'status', label: 'Status', options: ['Active', 'Planning', 'Completed', 'On hold'] }
    ],
    cols: [
      {
        key: 'name', label: 'Programme', render: function (r) {
          return '<div class="cell-main">' + UI.thumb(r.image, 'thumb', r.name) +
            '<div class="b"><div class="t1">' + F.esc(r.name) + '</div><div class="t2">' + F.esc(r.partner) + ' · ' + F.esc(r.lga) + '</div></div></div>';
        }
      },
      { key: 'theme', label: 'Theme', render: function (r) { return '<span class="badge b-teal">' + F.esc(r.theme) + '</span>'; } },
      { key: 'period', label: 'Period' },
      {
        key: 'progress', label: 'Progress', render: function (r) {
          var tone = r.progress >= 80 ? '' : r.progress >= 50 ? 'gold' : 'danger';
          return '<div style="min-width:110px"><div class="bar-track ' + tone + '"><i data-w="' + r.progress + '"></i></div>' +
            '<div class="text-xs text-muted" style="margin-top:.2rem">' + r.progress + '% complete</div></div>';
        }, sortValue: function (r) { return r.progress; }
      },
      { key: 'budget', label: 'Budget', align: 'right', render: function (r) { return F.nairaShort(r.budget); } },
      { key: 'status', label: 'Status', render: function (r) { return UI.statusBadge(r.status); } }
    ],
    actions: function (r) {
      return UI.act('edit', r.id, 'edit', 'Edit programme') + UI.act('del', r.id, 'trash', 'Delete');
    },
    bulk: [{ id: 'activate', label: 'Mark active', icon: 'activity' }, { id: 'complete', label: 'Mark completed', icon: 'checkCircle' }, { id: 'delete', label: 'Delete', icon: 'trash', cls: 'btn-danger' }],
    onBulk: function (act, ids, done) {
      ids.forEach(function (id) {
        if (act === 'activate') S.update('projects', id, { status: 'Active' });
        if (act === 'complete') S.update('projects', id, { status: 'Completed', progress: 100 });
      });
      S.log('bulk', 'Projects', act + ' applied to ' + ids.length + ' programmes', 'info');
      UI.toast(ids.length + ' programme(s) updated.', 'Bulk action', 'ok'); done();
    },
    fields: function (item) {
      return [
        { id: 'name', name: 'name', label: 'Programme name', value: item.name, required: true, full: true },
        { id: 'theme', name: 'theme', type: 'select', label: 'Theme', value: item.theme || 'Forestry', options: ['Forestry', 'Land restoration', 'Erosion', 'Waste', 'Climate', 'Biodiversity', 'Water'] },
        { id: 'status', name: 'status', type: 'select', label: 'Status', value: item.status || 'Active', options: ['Planning', 'Active', 'On hold', 'Completed'] },
        { id: 'period', name: 'period', label: 'Period', value: item.period, placeholder: '2022 – date' },
        { id: 'partner', name: 'partner', label: 'Partner / funder', value: item.partner },
        { id: 'lga', name: 'lga', label: 'Locations (LGAs)', value: item.lga, placeholder: 'Gombe, Akko, Dukku' },
        { id: 'manager', name: 'manager', type: 'select', label: 'Project manager', value: item.manager, options: uniq(staffNames().concat(userNames())), placeholder: 'Select officer' },
        { id: 'progress', name: 'progress', type: 'range', label: 'Implementation progress', value: item.progress || 0, min: 0, max: 100, unit: '%' },
        { id: 'budget', name: 'budget', type: 'number', label: 'Approved budget', value: item.budget || 0, prefix: '₦', min: 0, step: 100000 },
        { id: 'spent', name: 'spent', type: 'number', label: 'Spent to date', value: item.spent || 0, prefix: '₦', min: 0, step: 100000 },
        { id: 'image', name: 'image', type: 'image', label: 'Cover image', value: item.image || '', options: mediaOptions(), full: true },
        { id: 'tags', name: 'tags', type: 'tags', label: 'Tags / badges', value: item.tags || [], full: true },
        { id: 'desc', name: 'desc', type: 'textarea', label: 'Description', value: item.desc, rows: 4, full: true, required: true },
        { id: 'metricLabel', name: 'metricLabel', label: 'Progress label', value: item.metricLabel, placeholder: 'Annual target progress' },
        { id: 'metric', name: 'metric', label: 'Highlight metric', value: item.metric, placeholder: 'Over five million trees planted to date' }
      ];
    },
    onSave: function (vals, item) {
      ['progress', 'budget', 'spent'].forEach(function (k) { vals[k] = Number(vals[k]) || 0; });
      if (item.id) { S.update('projects', item.id, vals); S.log('update', 'Projects', 'Updated programme "' + vals.name + '"', 'info'); UI.toast('Programme updated.', 'Saved', 'ok'); }
      else { vals.id = S.uid('pr'); S.add('projects', vals); S.log('create', 'Projects', 'Created programme "' + vals.name + '"', 'ok'); UI.toast('Programme added to the portfolio.', 'Created', 'ok'); }
    },
    onAction: function (act, id, h, paint) {
      var p = S.find('projects', id);
      if (act === 'edit') return C.editor({ title: 'Edit programme', subtitle: F.esc(p.name), icon: 'projects', size: 'lg', item: p, fields: V.projects.fields(p), onSave: function (v, it) { ['progress', 'budget', 'spent'].forEach(function (k) { v[k] = Number(v[k]) || 0; }); S.update('projects', it.id, v); S.log('update', 'Projects', 'Updated "' + v.name + '"', 'info'); UI.toast('Programme updated.', 'Saved', 'ok'); paint(); } });
      if (act === 'del') C.del('projects', id, F.esc(p.name), paint);
    },
    onRow: function (id, h, paint) {
      var p = S.find('projects', id);
      var util = p.budget ? Math.round((p.spent / p.budget) * 100) : 0;
      C.detail({
        title: F.esc(p.name), subtitle: F.esc(p.theme) + ' · ' + F.esc(p.period), icon: 'projects',
        body:
          (p.image ? '<img src="' + F.esc(p.image) + '" alt="" style="width:100%;border-radius:12px;margin-bottom:.9rem">' : '') +
          '<p class="text-sm">' + F.esc(p.desc) + '</p>' +
          '<div class="grid g-2 mb-1">' +
          '<div>' + UI.charts.ring(p.progress, { label: p.progress + '%', sub: 'progress', size: 108 }) + '</div>' +
          '<div>' + UI.charts.ring(util, { label: util + '%', sub: 'budget used', size: 108, color: 'var(--gold-500)' }) + '</div>' +
          '</div>' +
          C.kv([
            ['Partner / funder', p.partner], ['Locations', p.lga], ['Project manager', p.manager], ['Status', p.status, 'raw'],
            ['Approved budget', F.naira(p.budget)], ['Spent to date', F.naira(p.spent)], ['Balance', F.naira((p.budget || 0) - (p.spent || 0))],
            ['Highlight', p.metric], ['Tags', (p.tags || []).map(function (t) { return '<span class="badge b-outline">' + F.esc(t) + '</span>'; }).join(' '), 'raw']
          ]),
        footer: '<button class="btn" data-close>Close</button><button class="btn btn-primary" data-ed>' + icon('edit', 15) + 'Edit programme</button>',
        onOpen: function (api) {
          api.el.querySelector('[data-ed]').addEventListener('click', function () {
            api.close();
            C.editor({ title: 'Edit programme', subtitle: F.esc(p.name), icon: 'projects', size: 'lg', item: p, fields: V.projects.fields(p), onSave: function (v, it) { ['progress', 'budget', 'spent'].forEach(function (k) { v[k] = Number(v[k]) || 0; }); S.update('projects', it.id, v); UI.toast('Programme updated.', 'Saved', 'ok'); paint(); } });
          });
        }
      });
    }
  });

  /* =====================================================================
     DEPARTMENTS  (segmented: directorates / leadership / agencies)
     ===================================================================== */
  V.departments = C.entity({
    store: 'departments', icon: 'departments', title: 'Departments, People & Agencies',
    subtitle: 'Directorates, the management team and the agencies, parastatals and project units published on the site.',
    segmented: [{ id: 'departments', label: 'Directorates' }, { id: 'staff', label: 'Leadership team' }, { id: 'agencies', label: 'Agencies & units' }],
    headActions: '<a class="btn btn-outline" href="../departments.html" target="_blank" rel="noopener">' + icon('external', 15) + 'View page</a><a class="btn btn-outline" href="../about.html" target="_blank" rel="noopener">' + icon('external', 15) + 'About page</a>',
    renderSegment: function (slot, seg, h, paint) {
      if (seg === 'departments') return depTable(slot, paint);
      if (seg === 'staff') return staffTable(slot, paint);
      return C.manager(slot, {
        store: 'agencies', module: 'Departments', icon: 'layers', singular: 'agency',
        title: 'Agencies, parastatals & project units', subtitle: 'Bodies that deliver the Ministry mandate alongside the directorates.',
        itemLabel: function (a) { return a.name; },
        row: function (a) {
          return '<td><div class="cell-main"><span class="avatar avatar-sm g5">' + F.esc(F.initials(a.name)) + '</span>' +
            '<div class="b"><div class="t1">' + F.esc(a.name) + '</div><div class="t2">' + F.esc(a.desc || '') + '</div></div></div></td>' +
            '<td><span class="badge b-purple">' + F.esc(a.type) + '</span></td>' +
            '<td>' + F.esc(a.head) + '</td>' +
            '<td class="mono text-xs">' + F.esc(a.contact) + '</td>';
        },
        fields: function (item) {
          return [
            { id: 'name', name: 'name', label: 'Name', value: item.name, required: true, full: true },
            { id: 'type', name: 'type', type: 'select', label: 'Type', value: item.type || 'Agency', options: ['Agency', 'Parastatal', 'Project unit', 'Secretariat', 'Desk', 'Committee'] },
            { id: 'head', name: 'head', label: 'Head / Coordinator', value: item.head },
            { id: 'contact', name: 'contact', type: 'email', label: 'Contact email', value: item.contact },
            { id: 'desc', name: 'desc', type: 'textarea', label: 'Description', value: item.desc, rows: 3, full: true }
          ];
        },
        onReady: function (root) {
          var thead = '<tr><th>Organisation</th><th>Type</th><th>Head</th><th>Contact</th><th style="text-align:right">Actions</th></tr>';
          var tbl = root.querySelector('table.tbl');
          if (tbl && !tbl.querySelector('thead')) {
            var th = document.createElement('thead');
            th.innerHTML = thead;
            tbl.insertBefore(th, tbl.firstChild);
            tbl.querySelectorAll('thead th').forEach(function (x) { x.style.fontSize = '.7rem'; x.style.letterSpacing = '.09em'; x.style.textTransform = 'uppercase'; x.style.color = 'var(--muted)'; x.style.padding = '.6rem .8rem'; x.style.borderBottom = '1px solid var(--line)'; x.style.background = 'var(--surface-2)'; });
          }
        }
      });
    },
    cols: [{ key: 'name', label: 'Directorate' }]
  });

  function depTable(slot, paint) {
    var rows = S.list('departments').slice().sort(function (a, b) { return a.order - b.order; });
    var t = UI.dataTable({
      rows: rows, pageSize: 10, pageSizeOptions: [8, 10, 20],
      searchPlaceholder: 'Search directorates, heads, duties…',
      search: function (r) { return [r.name, r.head, r.summary, r.email, (r.duties || []).join(' ')].join(' '); },
      selectable: false,
      createLabel: 'New directorate',
      onCreate: function () { depEditor(null, paint); },
      onCsv: function (rs) {
        UI.download('directorates.csv', UI.toCSV([
          { key: 'name', label: 'Directorate' }, { key: 'head', label: 'Head' }, { key: 'staff', label: 'Staff' },
          { key: 'email', label: 'Email' }, { key: 'phone', label: 'Phone' },
          { key: 'duties', label: 'Duties', csv: function (r) { return (r.duties || []).join('; '); } }
        ], rs), 'text/csv'); UI.toast('Directorates exported.', 'CSV', 'ok');
      },
      cols: [
        { key: 'order', label: '#', width: '46px', render: function (r) { return '<span class="mono">' + r.order + '</span>'; } },
        {
          key: 'name', label: 'Directorate', render: function (r) {
            return '<div class="cell-main"><span class="avatar avatar-sm">' + F.esc(F.initials(r.name.replace('Directorate of ', ''))) + '</span>' +
              '<div class="b"><div class="t1">' + F.esc(r.name) + '</div><div class="t2">' + F.esc(r.summary) + '</div></div></div>';
          }
        },
        { key: 'head', label: 'Head', render: function (r) { return F.esc(r.head) || '—'; } },
        { key: 'staff', label: 'Staff', align: 'right', render: function (r) { return F.num(r.staff || 0); } },
        { key: 'email', label: 'Contact', render: function (r) { return '<span class="text-xs">' + F.esc(r.email) + '<br>' + F.esc(r.phone) + '</span>'; } },
        {
          key: 'enabled', label: 'On site', render: function (r) {
            return '<label class="switch"><input type="checkbox" data-toggle="' + r.id + '"' + (r.enabled ? ' checked' : '') + '><span class="track"></span></label>';
          }
        }
      ],
      actions: function (r) {
        return '<span class="order-btns"><button class="btn btn-ghost btn-xs" data-mv="-1" data-id="' + r.id + '" aria-label="Move up">' + icon('chevronUp', 13) + '</button>' +
          '<button class="btn btn-ghost btn-xs" data-mv="1" data-id="' + r.id + '" aria-label="Move down">' + icon('chevronDown', 13) + '</button></span>' +
          UI.act('edit', r.id, 'edit', 'Edit directorate') + UI.act('del', r.id, 'trash', 'Delete');
      },
      onAction: function (act, id) {
        if (act === 'edit') depEditor(S.find('departments', id), paint);
        if (act === 'del') C.del('departments', id, F.esc(S.find('departments', id).name), paint);
      },
      onRow: function (id) {
        var dp = S.find('departments', id);
        C.detail({
          title: F.esc(dp.name), subtitle: 'Headed by ' + F.esc(dp.head), icon: 'departments',
          body: '<p class="text-sm">' + F.esc(dp.summary) + '</p>' +
            '<h4 class="mb-1" style="font-size:.86rem">Schedule of duties</h4>' +
            '<ul class="mb-1">' + (dp.duties || []).map(function (x) { return '<li class="check" style="padding:.25rem 0"><span style="color:var(--accent)">' + icon('check', 14) + '</span><span>' + F.esc(x) + '</span></li>'; }).join('') + '</ul>' +
            C.kv([['Establishment', F.num(dp.staff) + ' staff'], ['Email', dp.email], ['Phone', dp.phone], ['Visible on website', dp.enabled ? 'Yes' : 'No', 'raw'], ['Display order', dp.order]]),
          footer: '<button class="btn" data-close>Close</button><button class="btn btn-primary" data-ed>' + icon('edit', 15) + 'Edit</button>',
          onOpen: function (api) { api.el.querySelector('[data-ed]').addEventListener('click', function () { api.close(); depEditor(dp, paint); }); }
        });
      }
    });
    slot.appendChild(t.el);
    slot.addEventListener('change', function (e) {
      var tg = e.target.closest('[data-toggle]');
      if (!tg) return;
      S.update('departments', tg.dataset.toggle, { enabled: tg.checked });
      UI.toast(tg.checked ? 'Directorate is now published.' : 'Directorate hidden from the site.', 'Visibility', tg.checked ? 'ok' : 'warn');
    });
    slot.addEventListener('click', function (e) {
      var mv = e.target.closest('[data-mv]');
      if (!mv) return;
      S.move('departments', mv.dataset.id, parseInt(mv.dataset.mv, 10));
      paint();
    });
  }

  function depEditor(item, paint) {
    C.editor({
      title: item ? 'Edit directorate' : 'New directorate', icon: 'departments', size: 'md', item: item || {},
      fields: [
        { id: 'name', name: 'name', label: 'Directorate name', value: item.name, required: true, full: true },
        { id: 'head', name: 'head', type: 'select', label: 'Head of directorate', value: item.head, options: staffNames(), placeholder: 'Select director' },
        { id: 'staff', name: 'staff', type: 'number', label: 'Establishment (staff)', value: item.staff || 0, min: 0 },
        { id: 'email', name: 'email', type: 'email', label: 'Departmental email', value: item.email },
        { id: 'phone', name: 'phone', type: 'tel', label: 'Departmental phone', value: item.phone },
        { id: 'summary', name: 'summary', type: 'textarea', label: 'Summary', value: item.summary, rows: 2, full: true, required: true },
        { id: 'duties', name: 'duties', type: 'textarea', label: 'Schedule of duties', value: (item.duties || []).join('\n'), rows: 6, full: true, hint: 'One duty per line — rendered as a checklist on the departments page.' },
        { id: 'enabled', name: 'enabled', type: 'switch', label: 'Publish on the website', value: item.enabled !== false }
      ],
      onSave: function (vals, it) {
        vals.staff = Number(vals.staff) || 0;
        vals.duties = String(vals.duties || '').split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
        if (it.id) { S.update('departments', it.id, vals); S.log('update', 'Departments', 'Updated "' + vals.name + '"', 'info'); UI.toast('Directorate updated.', 'Saved', 'ok'); }
        else { vals.id = S.uid('dp'); vals.order = S.list('departments').length + 1; S.add('departments', vals); S.log('create', 'Departments', 'Created "' + vals.name + '"', 'ok'); UI.toast('Directorate created.', 'New', 'ok'); }
        paint();
      }
    });
  }

  function staffTable(slot, paint) {
    var t = UI.dataTable({
      rows: S.list('staff').slice().sort(function (a, b) { return a.order - b.order; }),
      pageSize: 10, pageSizeOptions: [8, 10, 20], selectable: false,
      searchPlaceholder: 'Search people, roles, departments…',
      search: function (r) { return [r.name, r.role, r.dept, r.email, r.phone].join(' '); },
      createLabel: 'Add person',
      onCreate: function () { staffEditor(null, paint); },
      onCsv: function (rs) {
        UI.download('leadership-team.csv', UI.toCSV([
          { key: 'name', label: 'Name' }, { key: 'role', label: 'Role' }, { key: 'dept', label: 'Department' },
          { key: 'email', label: 'Email' }, { key: 'phone', label: 'Phone' }, { key: 'featured', label: 'Featured' }
        ], rs), 'text/csv'); UI.toast('Leadership team exported.', 'CSV', 'ok');
      },
      cols: [
        {
          key: 'name', label: 'Name', render: function (r) {
            return '<div class="cell-main">' + UI.avatar(r.name, r.featured ? 'avatar-sm' : 'avatar-sm g2', r.photo) +
              '<div class="b"><div class="t1">' + F.esc(r.name) + (r.featured ? ' <span class="badge b-gold" style="margin-left:.3rem">Featured</span>' : '') + '</div>' +
              '<div class="t2">' + F.esc(r.dept) + '</div></div></div>';
          }
        },
        { key: 'role', label: 'Role', render: function (r) { return '<b style="color:var(--ink)">' + F.esc(r.role) + '</b>'; } },
        { key: 'email', label: 'Email', render: function (r) { return '<span class="text-xs">' + F.esc(r.email) + '</span>'; } },
        { key: 'phone', label: 'Phone', render: function (r) { return '<span class="text-xs">' + F.esc(r.phone) + '</span>'; } },
        {
          key: 'active', label: 'Active', render: function (r) {
            return '<label class="switch"><input type="checkbox" data-stoggle="' + r.id + '"' + (r.active !== false ? ' checked' : '') + '><span class="track"></span></label>';
          }
        }
      ],
      actions: function (r) {
        return '<span class="order-btns"><button class="btn btn-ghost btn-xs" data-mv="-1" data-id="' + r.id + '" aria-label="Move up">' + icon('chevronUp', 13) + '</button>' +
          '<button class="btn btn-ghost btn-xs" data-mv="1" data-id="' + r.id + '" aria-label="Move down">' + icon('chevronDown', 13) + '</button></span>' +
          UI.act('edit', r.id, 'edit', 'Edit person') + UI.act('feature', r.id, 'star', 'Toggle featured') + UI.act('del', r.id, 'trash', 'Remove');
      },
      onAction: function (act, id) {
        var p = S.find('staff', id);
        if (act === 'edit') staffEditor(p, paint);
        if (act === 'feature') { S.update('staff', id, { featured: !p.featured }); UI.toast(p.featured ? 'Removed from featured profile.' : 'Now shown in the featured commissioner card.', 'Leadership', 'ok'); paint(); }
        if (act === 'del') C.del('staff', id, F.esc(p.name), paint);
      }
    });
    slot.appendChild(t.el);
    slot.addEventListener('change', function (e) {
      var tg = e.target.closest('[data-stoggle]');
      if (tg) { S.update('staff', tg.dataset.stoggle, { active: tg.checked }); UI.toast('Profile updated.', 'Saved', 'ok'); }
    });
    slot.addEventListener('click', function (e) {
      var mv = e.target.closest('[data-mv]');
      if (mv) { S.move('staff', mv.dataset.id, parseInt(mv.dataset.mv, 10)); paint(); }
    });
  }

  function staffEditor(item, paint) {
    C.editor({
      title: item ? 'Edit profile' : 'Add person', icon: 'staff', item: item || {},
      fields: [
        { id: 'name', name: 'name', label: 'Full name', value: item.name, required: true },
        { id: 'role', name: 'role', label: 'Role / post', value: item.role, required: true, placeholder: 'e.g. Director, Forestry' },
        { id: 'dept', name: 'dept', type: 'select', label: 'Directorate / office', value: item.dept, options: uniq(deptNames().concat(['Office of the Commissioner', 'Office of the Permanent Secretary'])), placeholder: 'Select' },
        { id: 'photo', name: 'photo', type: 'image', label: 'Photograph', value: item.photo || '', options: mediaOptions() },
        { id: 'email', name: 'email', type: 'email', label: 'Email', value: item.email },
        { id: 'phone', name: 'phone', type: 'tel', label: 'Phone', value: item.phone },
        { id: 'bio', name: 'bio', type: 'textarea', label: 'Short biography', value: item.bio, rows: 3, full: true },
        { id: 'featured', name: 'featured', type: 'switch', label: 'Feature on the home page', hint: 'Used for the Commissioner / Permanent Secretary spotlight cards.', value: !!item.featured },
        { id: 'active', name: 'active', type: 'switch', label: 'Currently in post', value: item.active !== false }
      ],
      onSave: function (vals, it) {
        if (it.id) { S.update('staff', it.id, vals); S.log('update', 'Departments', 'Updated profile "' + vals.name + '"', 'info'); UI.toast('Profile saved.', 'Updated', 'ok'); }
        else { vals.id = S.uid('st'); vals.order = S.list('staff').length + 1; S.add('staff', vals); S.log('create', 'Departments', 'Added "' + vals.name + '" to the leadership team', 'ok'); UI.toast('Person added.', 'Created', 'ok'); }
        paint();
      }
    });
  }

  /* =====================================================================
     SERVICES  (services / fee schedule / FAQs / application steps)
     ===================================================================== */
  V.services = C.entity({
    store: 'services', icon: 'services', title: 'Services & Citizen Charter',
    subtitle: 'Public services, the fee and processing-time schedule, frequently asked questions and the application steps.',
    segmented: [{ id: 'services', label: 'Services' }, { id: 'fees', label: 'Fees & timelines' }, { id: 'faqs', label: 'FAQs' }, { id: 'steps', label: 'Application steps' }],
    headActions: '<a class="btn btn-outline" href="../services.html" target="_blank" rel="noopener">' + icon('external', 15) + 'View services page</a>',
    renderSegment: function (slot, seg, h, paint) {
      if (seg === 'fees') return feeManager(slot);
      if (seg === 'faqs') return faqManager(slot);
      if (seg === 'steps') return stepManager(slot);
      return serviceTable(slot, paint);
    },
    cols: [{ key: 'title', label: 'Service' }]
  });

  function serviceTable(slot, paint) {
    var t = UI.dataTable({
      rows: S.list('services').slice().sort(function (a, b) { return a.order - b.order; }),
      pageSize: 12, pageSizeOptions: [9, 12, 25], selectable: false,
      searchPlaceholder: 'Search services…',
      search: function (r) { return [r.title, r.short, r.dept, r.cta].join(' '); },
      createLabel: 'New service',
      onCreate: function () { svcEditor(null, paint); },
      onCsv: function (rs) {
        UI.download('services.csv', UI.toCSV([
          { key: 'title', label: 'Service' }, { key: 'short', label: 'Description' },
          { key: 'dept', label: 'Directorate' }, { key: 'cta', label: 'Call to action' }, { key: 'href', label: 'Link' }
        ], rs), 'text/csv'); UI.toast('Services exported.', 'CSV', 'ok');
      },
      cols: [
        {
          key: 'title', label: 'Service', render: function (r) {
            return '<div class="cell-main"><span class="avatar avatar-sm">' + icon(r.icon || 'services', 15) + '</span>' +
              '<div class="b"><div class="t1">' + F.esc(r.title) + '</div><div class="t2">' + F.esc(r.short) + '</div></div></div>';
          }
        },
        { key: 'dept', label: 'Directorate', render: function (r) { return '<span class="badge b-green">' + F.esc(r.dept) + '</span>'; } },
        { key: 'cta', label: 'Call to action' },
        {
          key: 'enabled', label: 'Live', render: function (r) {
            return '<label class="switch"><input type="checkbox" data-svtoggle="' + r.id + '"' + (r.enabled ? ' checked' : '') + '><span class="track"></span></label>';
          }
        }
      ],
      actions: function (r) {
        return '<span class="order-btns"><button class="btn btn-ghost btn-xs" data-mv="-1" data-id="' + r.id + '" aria-label="Move up">' + icon('chevronUp', 13) + '</button>' +
          '<button class="btn btn-ghost btn-xs" data-mv="1" data-id="' + r.id + '" aria-label="Move down">' + icon('chevronDown', 13) + '</button></span>' +
          UI.act('edit', r.id, 'edit', 'Edit service') + UI.act('del', r.id, 'trash', 'Delete');
      },
      onAction: function (act, id) {
        if (act === 'edit') svcEditor(S.find('services', id), paint);
        if (act === 'del') C.del('services', id, F.esc(S.find('services', id).title), paint);
      }
    });
    slot.appendChild(t.el);
    slot.addEventListener('change', function (e) {
      var tg = e.target.closest('[data-svtoggle]');
      if (tg) { S.update('services', tg.dataset.svtoggle, { enabled: tg.checked }); UI.toast(tg.checked ? 'Service published.' : 'Service hidden.', 'Services', tg.checked ? 'ok' : 'warn'); }
    });
    slot.addEventListener('click', function (e) {
      var mv = e.target.closest('[data-mv]');
      if (mv) { S.move('services', mv.dataset.id, parseInt(mv.dataset.mv, 10)); paint(); }
    });
  }

  function svcEditor(item, paint) {
    C.editor({
      title: item ? 'Edit service' : 'New service', icon: 'services', item: item || {},
      fields: [
        { id: 'title', name: 'title', label: 'Service title', value: item.title, required: true, full: true },
        { id: 'dept', name: 'dept', type: 'select', label: 'Delivering directorate', value: item.dept, options: uniq(S.list('departments').map(function (d) { return d.name.replace('Directorate of ', ''); })), placeholder: 'Select' },
        { id: 'icon', name: 'icon', type: 'select', label: 'Icon', value: item.icon || 'services', options: ['doc', 'badge', 'tree', 'bin', 'alert', 'book', 'wave', 'chart2', 'handshake', 'leaf', 'droplet', 'globe', 'services'] },
        { id: 'cta', name: 'cta', label: 'Call to action', value: item.cta, placeholder: 'Apply now' },
        { id: 'href', name: 'href', label: 'Link target', value: item.href || 'services.html', placeholder: 'services.html#permits' },
        { id: 'short', name: 'short', type: 'textarea', label: 'Short description', value: item.short, rows: 3, full: true, required: true },
        { id: 'enabled', name: 'enabled', type: 'switch', label: 'Publish on the website', value: item.enabled !== false }
      ],
      onSave: function (vals, it) {
        if (it.id) { S.update('services', it.id, vals); S.log('update', 'Services', 'Updated service "' + vals.title + '"', 'info'); UI.toast('Service saved.', 'Updated', 'ok'); }
        else { vals.id = S.uid('sv'); vals.order = S.list('services').length + 1; S.add('services', vals); S.log('create', 'Services', 'Created service "' + vals.title + '"', 'ok'); UI.toast('Service created.', 'New', 'ok'); }
        paint();
      }
    });
  }

  function addManagerHead(root, cols) {
    var tbl = root.querySelector('table.tbl');
    if (!tbl || tbl.querySelector('thead')) return;
    var th = document.createElement('thead');
    th.innerHTML = '<tr>' + cols.map(function (c) { return '<th' + (c === 'Actions' ? ' style="text-align:right"' : '') + '>' + c + '</th>'; }).join('') + '</tr>';
    tbl.insertBefore(th, tbl.firstChild);
    tbl.querySelectorAll('thead th').forEach(function (x) {
      x.style.cssText = 'font-size:.7rem;letter-spacing:.09em;text-transform:uppercase;color:var(--muted);padding:.6rem .8rem;border-bottom:1px solid var(--line);background:var(--surface-2);text-align:' + (x.textContent === 'Actions' ? 'right' : 'left') + ';white-space:nowrap';
    });
  }

  function feeManager(slot) {
    C.manager(slot, {
      store: 'fees', module: 'Services', icon: 'card', singular: 'fee line',
      title: 'Fee & processing-time schedule', subtitle: 'Published in the "Indicative processing times" table on the services page.',
      itemLabel: function (f) { return f.service; },
      row: function (f) {
        return '<td><b style="color:var(--ink)">' + F.esc(f.service) + '</b><div class="text-xs text-muted">' + F.esc(f.docs) + '</div></td>' +
          '<td>' + F.esc(f.time) + '</td><td><span class="badge b-green">' + F.esc(f.where) + '</span></td>' +
          '<td class="num">' + (f.amount ? F.naira(f.amount) : '<span class="badge b-ok">Free</span>') + '</td>';
      },
      fields: function (item) {
        return [
          { id: 'service', name: 'service', label: 'Service', value: item.service, required: true, full: true },
          { id: 'docs', name: 'docs', label: 'Documents required', value: item.docs, required: true, full: true },
          { id: 'time', name: 'time', label: 'Processing time', value: item.time, placeholder: '5 – 10 working days', required: true },
          { id: 'where', name: 'where', label: 'Where to apply', value: item.where, placeholder: 'Forestry Dept.' },
          { id: 'amount', name: 'amount', type: 'number', label: 'Statutory fee', value: item.amount || 0, prefix: '₦', min: 0, step: 500, hint: 'Enter 0 for a free service.' }
        ];
      },
      onReady: function (root) { addManagerHead(root, ['Service', 'Processing time', 'Where to apply', 'Fee', 'Actions']); }
    });
  }

  function faqManager(slot) {
    C.manager(slot, {
      store: 'faqs', module: 'Services', icon: 'info', singular: 'FAQ',
      title: 'Frequently asked questions', subtitle: 'Accordion items at the bottom of the services page.',
      itemLabel: function (f) { return f.q; },
      row: function (f) { return '<td><b style="color:var(--ink)">' + F.esc(f.q) + '</b><div class="text-xs text-muted clamp-2">' + F.esc(f.a) + '</div></td>'; },
      fields: function (item) {
        return [
          { id: 'q', name: 'q', label: 'Question', value: item.q, required: true, full: true },
          { id: 'a', name: 'a', type: 'textarea', label: 'Answer', value: item.a, rows: 4, full: true, required: true },
          { id: 'open', name: 'open', type: 'switch', label: 'Open by default', value: !!item.open }
        ];
      },
      onReady: function (root) { addManagerHead(root, ['Question', 'Actions']); }
    });
  }

  function stepManager(slot) {
    C.manager(slot, {
      store: 'applySteps', module: 'Services', icon: 'list', singular: 'step',
      title: 'How to apply — five simple steps', subtitle: 'The numbered process strip on the services page.',
      itemLabel: function (s) { return s.step; },
      row: function (s) { return '<td><b style="color:var(--ink)">' + F.esc(s.step) + '</b><div class="text-xs text-muted">' + F.esc(s.text) + '</div></td>'; },
      fields: function (item) {
        return [
          { id: 'step', name: 'step', label: 'Step title', value: item.step, required: true, placeholder: '1. Enquire' },
          { id: 'text', name: 'text', type: 'textarea', label: 'Description', value: item.text, rows: 3, full: true, required: true }
        ];
      },
      onReady: function (root) { addManagerHead(root, ['Step', 'Actions']); }
    });
  }

  /* =====================================================================
     MEDIA LIBRARY
     ===================================================================== */
  V.media = function (host, helpers) {
    var state = { folder: 'all', q: '', sel: {}, view: 'grid' };

    function paint() {
      var all = S.list('media');
      var totalBytes = all.reduce(function (a, b) { return a + (b.size || 0); }, 0);
      var quota = 5 * 1024 * 1024;
      var used = S.size();

      host.innerHTML =
        '<div class="page-head"><div class="ph-t"><h2>' + icon('media', 20) + ' Media Library</h2>' +
        '<p>Every image used across the website — hero slides, news features, project covers, gallery photos and leadership portraits.</p></div>' +
        '<div class="ph-a"><button class="btn btn-outline" data-exportlib>' + icon('download', 15) + 'Export list</button>' +
        '<button class="btn btn-primary" data-upload>' + icon('upload', 15) + 'Upload images</button></div></div>' +

        '<div class="grid g-4 mb-1">' +
        statMini('media', all.length, 'Assets') +
        statMini('folder', uniq(all.map(function (m) { return m.folder; })).length, 'Folders') +
        statMini('db', F.bytes(totalBytes), 'Library size') +
        statMini('activity', F.pct(Math.min(100, (used / quota) * 100)), 'Browser storage used') +
        '</div>' +

        '<div class="card mb-1"><div class="toolbar">' +
        '<div class="search">' + icon('search', 15) + '<input type="search" data-mq placeholder="Search by name or alt text…" value="' + F.esc(state.q) + '" aria-label="Search media"></div>' +
        '<select data-mfolder aria-label="Filter by folder"><option value="all">All folders</option>' +
        S.data.mediaFolders.map(function (f) { return '<option value="' + F.esc(f) + '"' + (state.folder === f ? ' selected' : '') + '>' + F.esc(f) + '</option>'; }).join('') + '</select>' +
        '<div class="grow"></div>' +
        '<div class="seg" role="group" aria-label="View mode"><button data-mview="grid" class="' + (state.view === 'grid' ? 'active' : '') + '" aria-label="Grid view">' + icon('grid2', 15) + '</button>' +
        '<button data-mview="list" class="' + (state.view === 'list' ? 'active' : '') + '" aria-label="List view">' + icon('list', 15) + '</button></div>' +
        '</div><div class="bulk-bar" data-bulkbar><span class="n" data-bulkn>0 selected</span>' +
        '<button class="btn btn-sm btn-outline" data-bulk="move">' + icon('folder', 14) + 'Move to folder</button>' +
        '<button class="btn btn-sm btn-danger" data-bulk="delete">' + icon('trash', 14) + 'Delete</button>' +
        '<div style="flex:1"></div><button class="btn btn-sm btn-ghost" data-bulk="clear">Clear</button></div>' +
        '<div data-mgrid class="card-pad"></div></div>';

      var grid = host.querySelector('[data-mgrid]');
      var list = all.filter(function (m) {
        if (state.folder !== 'all' && m.folder !== state.folder) return false;
        if (state.q && (m.name + ' ' + m.alt + ' ' + m.folder).toLowerCase().indexOf(state.q.toLowerCase()) < 0) return false;
        return true;
      });

      if (!list.length) {
        grid.innerHTML = '<div class="empty">' + icon('media', 44) + '<div class="t1">No assets found</div><div class="t2">Try another folder or search term, or upload a new image.</div>' +
          '<button class="btn btn-primary" data-upload>' + icon('upload', 15) + 'Upload images</button></div>';
      } else if (state.view === 'grid') {
        grid.innerHTML = '<div class="media-grid">' + list.map(function (m) {
          return '<div class="media-tile' + (state.sel[m.id] ? ' sel' : '') + '" data-mid="' + m.id + '" tabindex="0" role="button" aria-label="' + F.esc(m.name) + '">' +
            '<div class="mt-img" style="background-image:url(\'' + F.esc(m.src) + '\')">' +
            '<span class="mt-check">' + icon('check', 13) + '</span>' +
            (m.src.indexOf('data:') === 0 ? '<span class="mt-badge badge b-purple">Upload</span>' : '') +
            '</div><div class="mt-b"><div class="t1">' + F.esc(m.name) + '</div>' +
            '<div class="t2">' + F.esc(m.folder) + ' · ' + F.bytes(m.size) + '</div></div></div>';
        }).join('') + '</div>';
      } else {
        grid.innerHTML = '<div class="rows">' + list.map(function (m) {
          return '<div class="row-item' + (state.sel[m.id] ? ' unread' : '') + '" data-mid="' + m.id + '" tabindex="0" role="button">' +
            UI.thumb(m.src, 'thumb', m.name) +
            '<div class="b"><div class="t1">' + F.esc(m.name) + '</div><div class="t2">' + F.esc(m.alt) + '</div>' +
            '<div class="meta"><span>' + icon('folder', 12) + F.esc(m.folder) + '</span><span>' + icon('db', 12) + F.bytes(m.size) + '</span>' +
            '<span>' + icon('user', 12) + F.esc(m.by) + '</span><span>' + icon('clock', 12) + F.ago(m.uploaded) + '</span></div></div>' +
            '<div class="r-acts"><button class="btn btn-ghost btn-xs" data-med="' + m.id + '" aria-label="Edit">' + icon('edit', 14) + '</button>' +
            '<button class="btn btn-ghost btn-xs" data-mdel="' + m.id + '" aria-label="Delete" style="color:var(--danger)">' + icon('trash', 14) + '</button></div></div>';
        }).join('') + '</div>';
      }
      updateBulk();
    }

    function updateBulk() {
      var n = Object.keys(state.sel).filter(function (k) { return state.sel[k]; }).length;
      var bar = host.querySelector('[data-bulkbar]');
      bar.classList.toggle('show', n > 0);
      host.querySelector('[data-bulkn]').textContent = n + ' selected';
    }

    function selectToggle(id, e) {
      if (e && (e.ctrlKey || e.metaKey || e.shiftKey)) { state.sel[id] = !state.sel[id]; paint(); return true; }
      return false;
    }

    host.addEventListener('click', function (e) {
      var tile = e.target.closest('[data-mid]');
      if (tile && selectToggle(tile.dataset.mid, e)) return;
      if (tile && !e.target.closest('button')) return mediaDetail(tile.dataset.mid);
      if (e.target.closest('[data-upload]')) return uploadDialog();
      if (e.target.closest('[data-exportlib]')) {
        UI.download('media-library.csv', UI.toCSV([
          { key: 'name', label: 'File' }, { key: 'folder', label: 'Folder' }, { key: 'alt', label: 'Alt text' },
          { key: 'size', label: 'Bytes' }, { key: 'by', label: 'Uploaded by' }, { key: 'uploaded', label: 'Uploaded' }, { key: 'src', label: 'Path' }
        ], S.list('media')), 'text/csv');
        UI.toast('Media list exported.', 'CSV', 'ok');
      }
      var mv = e.target.closest('[data-mview]');
      if (mv) { state.view = mv.dataset.mview; paint(); }
      var med = e.target.closest('[data-med]'); if (med) return mediaEditor(S.find('media', med.dataset.med));
      var mdel = e.target.closest('[data-mdel]'); if (mdel) return C.del('media', mdel.dataset.mdel, F.esc(S.find('media', mdel.dataset.mdel).name), paint);
      var bulk = e.target.closest('[data-bulk]');
      if (bulk) {
        var ids = Object.keys(state.sel).filter(function (k) { return state.sel[k]; });
        var act = bulk.dataset.bulk;
        if (act === 'clear') { state.sel = {}; paint(); }
        else if (act === 'delete') C.del('media', ids, ids.length + ' asset(s)', function () { state.sel = {}; paint(); });
        else if (act === 'move') moveDialog(ids);
      }
    });
    host.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      var tile = e.target.closest('[data-mid]');
      if (tile) { e.preventDefault(); mediaDetail(tile.dataset.mid); }
    });
    host.addEventListener('input', function (e) {
      var q = e.target.closest('[data-mq]'); if (q) { state.q = q.value; paint(); var nq = host.querySelector('[data-mq]'); nq.focus(); nq.setSelectionRange(nq.value.length, nq.value.length); }
    });
    host.addEventListener('change', function (e) {
      var f = e.target.closest('[data-mfolder]'); if (f) { state.folder = f.value; paint(); }
    });

    function moveDialog(ids) {
      var m = UI.modal({
        title: 'Move ' + ids.length + ' asset(s)', icon: 'folder', size: 'sm',
        body: UI.form([UI.field({ id: 'folder', name: 'folder', type: 'select', label: 'Destination folder', value: S.data.mediaFolders[0], options: S.data.mediaFolders, required: true })]),
        footer: '<button class="btn" data-close>Cancel</button><button class="btn btn-primary" data-go>' + icon('folder', 15) + 'Move</button>',
        onOpen: function (api) {
          api.el.querySelector('[data-go]').addEventListener('click', function () {
            var to = api.el.querySelector('[name=folder]').value;
            ids.forEach(function (id) { S.update('media', id, { folder: to }); });
            S.log('update', 'Media', 'Moved ' + ids.length + ' assets to "' + to + '"', 'info');
            UI.toast(ids.length + ' assets moved to ' + to + '.', 'Moved', 'ok');
            state.sel = {}; api.close(); paint();
          });
        }
      });
      return m;
    }

    function mediaDetail(id) {
      var m = S.find('media', id);
      if (!m) return;
      C.detail({
        title: F.esc(m.name), subtitle: F.esc(m.folder) + ' · ' + F.bytes(m.size), icon: 'media',
        body: '<img src="' + F.esc(m.src) + '" alt="' + F.esc(m.alt) + '" style="width:100%;border-radius:12px;margin-bottom:.9rem;background:var(--surface-3)">' +
          C.kv([['Alt text', m.alt], ['Folder', m.folder], ['Dimensions', (m.w || '—') + ' × ' + (m.h || '—')], ['Type', m.type], ['File size', F.bytes(m.size)],
          ['Uploaded by', m.by], ['Uploaded', F.date(m.uploaded)], ['Used on', (m.usedIn || []).join(', ') || '—'], ['Path', m.src.indexOf('data:') === 0 ? '(stored in browser)' : m.src]]) +
          '<hr class="divider"><div class="note">' + icon('info', 17) + '<div>Alt text is read aloud by screen readers and shown when an image cannot load. Keep it short and descriptive.</div></div>',
        footer: '<button class="btn" data-close>Close</button>' +
          '<button class="btn btn-outline" data-copy>' + icon('copy', 15) + 'Copy path</button>' +
          '<button class="btn btn-primary" data-ed>' + icon('edit', 15) + 'Edit details</button>',
        onOpen: function (api) {
          api.el.querySelector('[data-ed]').addEventListener('click', function () { api.close(); mediaEditor(m); });
          api.el.querySelector('[data-copy]').addEventListener('click', function () {
            var path = m.src.indexOf('data:') === 0 ? '(uploaded asset — stored in the browser)' : m.src.replace('../', '');
            if (navigator.clipboard) navigator.clipboard.writeText(path).then(function () { UI.toast('Path copied: ' + path, 'Copied', 'ok'); }, function () { UI.toast(path, 'Asset path', 'info'); });
            else UI.toast(path, 'Asset path', 'info');
          });
        }
      });
    }

    function mediaEditor(m) {
      C.editor({
        title: 'Edit asset', subtitle: F.esc(m.name), icon: 'media', item: m,
        fields: [
          { id: 'name', name: 'name', label: 'File name', value: m.name, required: true },
          { id: 'folder', name: 'folder', type: 'select', label: 'Folder', value: m.folder, options: S.data.mediaFolders },
          { id: 'alt', name: 'alt', label: 'Alt text', value: m.alt, required: true, full: true, hint: 'Describe the image for screen readers and search engines.' },
          { id: 'usedIn', name: 'usedIn', type: 'tags', label: 'Used on pages', value: m.usedIn || [], full: true, placeholder: 'home, news, gallery…' }
        ],
        onSave: function (vals, it) { S.update('media', it.id, vals); S.log('update', 'Media', 'Updated details for "' + vals.name + '"', 'info'); UI.toast('Asset details saved.', 'Updated', 'ok'); paint(); }
      });
    }

    function uploadDialog() {
      var m = UI.modal({
        title: 'Upload images', subtitle: 'Files are resized in your browser and stored locally by the console', icon: 'upload', size: 'md',
        body: '<div class="note mb-1">' + icon('info', 17) + '<div>This demonstration console has no server. Uploads are converted to compressed images and saved in your browser storage (about 5 MB available). Use the <b>Export backup</b> option in Settings to keep a copy.</div></div>' +
          UI.form([
            UI.field({ id: 'folder', name: 'folder', type: 'select', label: 'Save to folder', value: 'Uploads', options: S.data.mediaFolders }),
            UI.field({ id: 'alt', name: 'alt', label: 'Default alt text', placeholder: 'Applied to every file in this batch' }),
            UI.field({ id: 'files', name: 'files', type: 'file', label: 'Choose images', accept: 'image/*', full: true, hint: 'JPG, PNG, WebP or SVG — up to 12 at a time' })
          ]),
        footer: '<span class="left" data-status></span><button class="btn" data-close>Cancel</button><button class="btn btn-primary" data-go>' + icon('upload', 15) + 'Upload</button>',
        onOpen: function (api) {
          UI.wireFields(api.el);
          api.el.querySelector('[data-go]').addEventListener('click', function () {
            var inp = api.el.querySelector('input[name=files]');
            var files = Array.prototype.slice.call(inp.files || []);
            var folder = api.el.querySelector('[name=folder]').value;
            var alt = api.el.querySelector('[name=alt]').value;
            var status = api.el.querySelector('[data-status]');
            if (!files.length) { UI.toast('Choose at least one image first.', 'Nothing selected', 'warn'); return; }
            status.textContent = 'Processing ' + files.length + ' file(s)…';
            Promise.all(files.slice(0, 12).map(function (f) { return compressImage(f); })).then(function (results) {
              var added = 0;
              results.forEach(function (r, i) {
                if (!r) return;
                S.add('media', {
                  id: S.uid('md'), name: r.name, src: r.src, type: r.type, size: r.size,
                  folder: folder, alt: alt || r.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
                  uploaded: new Date().toISOString(), by: (S.currentUser() || {}).name || 'Admin', usedIn: [], w: r.w, h: r.h
                });
                added++;
              });
              var res = S.save();
              if (!res.ok) {
                UI.toast('Browser storage is full — remove unused assets and try again.', 'Storage limit reached', 'err', 6000);
                S.log('error', 'Media', 'Upload failed: storage quota exceeded', 'danger');
              } else {
                S.log('upload', 'Media', 'Uploaded ' + added + ' image(s) to "' + folder + '"', 'ok');
                UI.toast(added + ' image(s) added to the library.', 'Upload complete', 'ok');
              }
              api.close(); paint();
            }).catch(function () {
              status.textContent = '';
              UI.toast('One or more files could not be processed.', 'Upload failed', 'err');
            });
          });
        }
      });
      return m;
    }

    function compressImage(file) {
      return new Promise(function (resolve) {
        if (file.type.indexOf('image/') !== 0) { resolve(null); return; }
        var fr = new FileReader();
        fr.onload = function () {
          if (file.type === 'image/svg+xml' || file.size < 120 * 1024) {
            resolve({ name: file.name, src: fr.result, type: file.type, size: file.size, w: 0, h: 0 });
            return;
          }
          var img = new Image();
          img.onload = function () {
            var maxW = 1280, scale = Math.min(1, maxW / img.width);
            var cv = document.createElement('canvas');
            cv.width = Math.round(img.width * scale); cv.height = Math.round(img.height * scale);
            cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
            var out = cv.toDataURL('image/jpeg', 0.72);
            resolve({ name: file.name.replace(/\.[^.]+$/, '') + '.jpg', src: out, type: 'image/jpeg', size: Math.round(out.length * 0.75), w: cv.width, h: cv.height });
          };
          img.onerror = function () { resolve(null); };
          img.src = fr.result;
        };
        fr.onerror = function () { resolve(null); };
        fr.readAsDataURL(file);
      });
    }

    paint();
  };

  function statMini(ic, value, label) {
    return '<div class="stat-mini"><span class="sm-ico">' + icon(ic, 17) + '</span><span><span class="v">' + F.esc(value) + '</span><span class="l">' + F.esc(label) + '</span></span></div>';
  }

  /* =====================================================================
     PUBLIC GALLERY
     ===================================================================== */
  V.gallery = function (host, helpers) {
    var state = { cat: 'all', q: '' };
    function paint() {
      var all = S.list('gallery').slice().sort(function (a, b) { return a.order - b.order; });
      var list = all.filter(function (g) {
        if (state.cat !== 'all' && g.cat !== state.cat) return false;
        if (state.q && (g.caption + ' ' + g.cat).toLowerCase().indexOf(state.q.toLowerCase()) < 0) return false;
        return true;
      });
      host.innerHTML =
        '<div class="page-head"><div class="ph-t"><h2>' + icon('gallery', 20) + ' Photo Gallery</h2>' +
        '<p>Curate the public gallery — photographs from afforestation drives, erosion works, sanitation programmes and community engagements.</p></div>' +
        '<div class="ph-a"><a class="btn btn-outline" href="../gallery.html" target="_blank" rel="noopener">' + icon('external', 15) + 'View gallery</a>' +
        '<button class="btn btn-primary" data-new>' + icon('plus', 15) + 'Add photo</button></div></div>' +

        '<div class="grid g-4 mb-1">' +
        statMini('gallery', all.length, 'Photos') +
        statMini('checkCircle', all.filter(function (g) { return g.published; }).length, 'Published') +
        statMini('eye', all.filter(function (g) { return !g.published; }).length, 'Hidden') +
        statMini('tag', S.data.galleryCats.length, 'Categories') +
        '</div>' +

        '<div class="card mb-1"><div class="toolbar">' +
        '<div class="search">' + icon('search', 15) + '<input type="search" data-gq placeholder="Search captions…" value="' + F.esc(state.q) + '" aria-label="Search gallery"></div>' +
        '<select data-gcat aria-label="Filter by category"><option value="all">All categories</option>' +
        S.data.galleryCats.map(function (c) { return '<option value="' + F.esc(c) + '"' + (state.cat === c ? ' selected' : '') + '>' + F.esc(c) + '</option>'; }).join('') + '</select>' +
        '<div class="grow"></div><span class="text-xs text-muted hide-sm">' + list.length + ' of ' + all.length + ' shown</span>' +
        '<button class="btn btn-outline btn-sm" data-cats>' + icon('tag', 14) + 'Categories</button>' +
        '</div><div class="card-pad">' +
        (list.length ? '<div class="gal-grid">' + list.map(function (g, i) {
          return '<div class="gal-tile" data-gid="' + g.id + '">' +
            '<div class="gi" style="background-image:url(\'' + F.esc(g.src) + '\')">' +
            (g.published ? '' : '<span class="mt-badge badge b-warn" style="position:absolute;top:.4rem;left:.4rem">Hidden</span>') +
            '</div><div class="gb"><div class="t1">' + F.esc(g.caption) + '</div><div class="t2">' + F.esc(g.cat) + ' · #' + (i + 1) + '</div></div>' +
            '<div class="gf"><span class="order-btns" style="margin-right:auto">' +
            '<button class="btn btn-ghost btn-xs" data-mv="-1" data-id="' + g.id + '" aria-label="Move earlier"' + (i === 0 ? ' disabled' : '') + '>' + icon('chevronLeft', 13) + '</button>' +
            '<button class="btn btn-ghost btn-xs" data-mv="1" data-id="' + g.id + '" aria-label="Move later"' + (i === list.length - 1 ? ' disabled' : '') + '>' + icon('chevronRight', 13) + '</button></span>' +
            '<button class="btn btn-ghost btn-xs" data-vis="' + g.id + '" title="' + (g.published ? 'Hide' : 'Publish') + '" aria-label="' + (g.published ? 'Hide' : 'Publish') + '">' + icon(g.published ? 'eye' : 'send', 14) + '</button>' +
            '<button class="btn btn-ghost btn-xs" data-ed="' + g.id + '" title="Edit" aria-label="Edit">' + icon('edit', 14) + '</button>' +
            '<button class="btn btn-ghost btn-xs" data-del="' + g.id + '" title="Delete" aria-label="Delete" style="color:var(--danger)">' + icon('trash', 14) + '</button></div></div>';
        }).join('') + '</div>'
          : '<div class="empty">' + icon('gallery', 44) + '<div class="t1">No photographs here</div><div class="t2">Add the first photograph to publish it in the public gallery.</div><button class="btn btn-primary" data-new>' + icon('plus', 15) + 'Add photo</button></div>') +
        '</div></div>';
    }

    function editor(item) {
      C.editor({
        title: item ? 'Edit photograph' : 'Add photograph', icon: 'gallery', item: item || {}, size: 'md',
        fields: [
          { id: 'caption', name: 'caption', label: 'Caption', value: item.caption, required: true, full: true },
          { id: 'cat', name: 'cat', type: 'select', label: 'Category', value: item.cat || S.data.galleryCats[0], options: S.data.galleryCats, required: true },
          { id: 'src', name: 'src', type: 'image', label: 'Photograph', value: item.src || '', options: mediaOptions(), full: true },
          { id: 'alt', name: 'alt', label: 'Alt text', value: item.alt, full: true },
          { id: 'published', name: 'published', type: 'switch', label: 'Publish in the gallery', value: item.published !== false }
        ],
        onSave: function (vals, it) {
          if (it.id) { S.update('gallery', it.id, vals); S.log('update', 'Gallery', 'Updated photo "' + vals.caption + '"', 'info'); UI.toast('Photograph updated.', 'Saved', 'ok'); }
          else { vals.id = S.uid('g'); vals.order = S.list('gallery').length + 1; vals.added = today(); S.add('gallery', vals); S.log('create', 'Gallery', 'Added photo "' + vals.caption + '"', 'ok'); UI.toast('Photograph added to the gallery.', 'Created', 'ok'); }
          paint();
        }
      });
    }

    host.addEventListener('click', function (e) {
      if (e.target.closest('[data-new]')) return editor(null);
      if (e.target.closest('[data-cats]')) return catDialog();
      var mv = e.target.closest('[data-mv]'); if (mv) { S.move('gallery', mv.dataset.id, parseInt(mv.dataset.mv, 10)); return paint(); }
      var vis = e.target.closest('[data-vis]');
      if (vis) { var g = S.find('gallery', vis.dataset.vis); S.update('gallery', g.id, { published: !g.published }); UI.toast(g.published ? 'Photograph hidden.' : 'Photograph published.', 'Gallery', g.published ? 'warn' : 'ok'); return paint(); }
      var ed = e.target.closest('[data-ed]'); if (ed) return editor(S.find('gallery', ed.dataset.ed));
      var del = e.target.closest('[data-del]'); if (del) return C.del('gallery', del.dataset.del, F.esc(S.find('gallery', del.dataset.del).caption), paint);
      var tile = e.target.closest('[data-gid]'); if (tile && !e.target.closest('button')) return editor(S.find('gallery', tile.dataset.gid));
    });
    host.addEventListener('input', function (e) {
      var q = e.target.closest('[data-gq]'); if (q) { state.q = q.value; paint(); var n = host.querySelector('[data-gq]'); n.focus(); n.setSelectionRange(n.value.length, n.value.length); }
    });
    host.addEventListener('change', function (e) {
      var c = e.target.closest('[data-gcat]'); if (c) { state.cat = c.value; paint(); }
    });

    function catDialog() {
      var m = UI.modal({
        title: 'Gallery categories', subtitle: 'Filter buttons shown above the public gallery', icon: 'tag', size: 'sm',
        body: '<div class="rows">' + S.data.galleryCats.map(function (c, i) {
          return '<div class="row-item" style="cursor:default"><div class="b"><div class="t1">' + F.esc(c) + '</div>' +
            '<div class="meta"><span>' + S.list('gallery').filter(function (g) { return g.cat === c; }).length + ' photos</span></div></div>' +
            '<div class="r-acts"><button class="btn btn-ghost btn-xs" data-rmcat="' + i + '" aria-label="Remove ' + F.esc(c) + '" style="color:var(--danger)">' + icon('trash', 14) + '</button></div></div>';
        }).join('') + '</div>' +
          '<hr class="divider">' + UI.form([UI.field({ id: 'nc', name: 'nc', label: 'Add a category', placeholder: 'e.g. Water & sanitation' })]),
        footer: '<button class="btn" data-close>Done</button><button class="btn btn-primary" data-addcat>' + icon('plus', 15) + 'Add category</button>',
        onOpen: function (api) {
          api.el.querySelector('[data-addcat]').addEventListener('click', function () {
            var v = api.el.querySelector('[name=nc]').value.trim();
            if (!v) return;
            if (S.data.galleryCats.indexOf(v) > -1) { UI.toast('That category already exists.', 'Duplicate', 'warn'); return; }
            S.data.galleryCats.push(v); S.save(); S.log('create', 'Gallery', 'Added gallery category "' + v + '"', 'ok');
            UI.toast('Category added.', 'Gallery', 'ok'); api.close();
          });
          api.el.addEventListener('click', function (ev) {
            var rm = ev.target.closest('[data-rmcat]');
            if (!rm) return;
            var name = S.data.galleryCats[parseInt(rm.dataset.rmcat, 10)];
            S.data.galleryCats.splice(parseInt(rm.dataset.rmcat, 10), 1); S.save();
            S.log('delete', 'Gallery', 'Removed gallery category "' + name + '"', 'warn');
            api.close(); UI.toast('Category removed.', 'Gallery', 'ok');
          });
        }
      });
      return m;
    }
    paint();
  };

  /* =====================================================================
     ENQUIRIES  (contact form inbox)
     ===================================================================== */
  V.enquiries = function (host, helpers) {
    var state = { tab: 'all', q: '', status: 'all', sort: 'date' };

    function stats() {
      var m = S.list('messages');
      return [
        { label: 'Unread', value: m.filter(function (x) { return !x.read; }).length, icon: 'mail' },
        { label: 'Open', value: m.filter(function (x) { return x.status === 'New' || x.status === 'Open'; }).length, icon: 'inbox' },
        { label: 'In progress', value: m.filter(function (x) { return x.status === 'In progress'; }).length, icon: 'activity' },
        { label: 'Urgent', value: m.filter(function (x) { return x.priority === 'Urgent' || x.priority === 'High'; }).length, icon: 'alert' }
      ];
    }

    function filtered() {
      var m = S.list('messages').slice();
      if (state.tab === 'unread') m = m.filter(function (x) { return !x.read; });
      if (state.tab === 'starred') m = m.filter(function (x) { return x.starred; });
      if (state.tab === 'mine') { var me = (S.currentUser() || {}).name; m = m.filter(function (x) { return x.assigned === me; }); }
      if (state.tab === 'resolved') m = m.filter(function (x) { return x.status === 'Resolved' || x.status === 'Closed'; });
      if (state.status !== 'all') m = m.filter(function (x) { return x.status === state.status; });
      if (state.q) m = m.filter(function (x) { return [x.name, x.email, x.subject, x.message, x.ref, x.lga, x.location].join(' ').toLowerCase().indexOf(state.q.toLowerCase()) > -1; });
      m.sort(function (a, b) { return state.sort === 'priority' ? rank(b.priority) - rank(a.priority) : new Date(b.date) - new Date(a.date); });
      return m;
    }
    function rank(p) { return { Urgent: 4, High: 3, Normal: 2, Low: 1, Medium: 2 }[p] || 0; }

    function paint() {
      var list = filtered();
      var tabs = [['all', 'All'], ['unread', 'Unread'], ['starred', 'Starred'], ['mine', 'Assigned to me'], ['resolved', 'Resolved']];
      host.innerHTML =
        '<div class="page-head"><div class="ph-t"><h2>' + icon('mail', 20) + ' Enquiries & Messages</h2>' +
        '<p>Every submission from the website contact form and the "Report an Issue" button — with assignment, status and reply tracking.</p></div>' +
        '<div class="ph-a"><button class="btn btn-outline" data-sim>' + icon('plus', 15) + 'Log a call-in</button>' +
        '<button class="btn btn-outline" data-export>' + icon('download', 15) + 'Export CSV</button></div></div>' +

        '<div class="grid g-4 mb-1">' + stats().map(function (k) { return statMini(k.icon, k.value, k.label); }).join('') + '</div>' +

        '<div class="card"><div class="toolbar">' +
        '<div class="seg" role="tablist">' + tabs.map(function (t) {
          return '<button role="tab" data-tab="' + t[0] + '" class="' + (state.tab === t[0] ? 'active' : '') + '">' + t[1] + '</button>';
        }).join('') + '</div>' +
        '<div class="search">' + icon('search', 15) + '<input type="search" data-q placeholder="Search name, subject, reference…" value="' + F.esc(state.q) + '" aria-label="Search messages"></div>' +
        '<select data-status aria-label="Filter by status"><option value="all">Any status</option>' +
        ['New', 'Open', 'In progress', 'Resolved', 'Closed'].map(function (s) { return '<option' + (state.status === s ? ' selected' : '') + '>' + s + '</option>'; }).join('') + '</select>' +
        '<select data-sort aria-label="Sort"><option value="date"' + (state.sort === 'date' ? ' selected' : '') + '>Newest first</option>' +
        '<option value="priority"' + (state.sort === 'priority' ? ' selected' : '') + '>Priority</option></select>' +
        '</div>' +
        '<div class="card-pad">' +
        (list.length ? '<div class="rows">' + list.map(function (m) {
          return '<div class="row-item' + (m.read ? '' : ' unread') + '" data-id="' + m.id + '" tabindex="0" role="button" aria-label="Open message from ' + F.esc(m.name) + '">' +
            UI.avatar(m.name, m.read ? 'avatar-sm' : 'avatar-sm g4') +
            '<div class="b"><div class="t1">' + F.esc(m.name) + (m.starred ? ' <span style="color:var(--gold-500)">' + icon('star', 12) + '</span>' : '') +
            ' <span class="badge b-outline">' + F.esc(m.ref) + '</span> ' + UI.statusBadge(m.status) + ' ' + UI.priorityBadge(m.priority) + '</div>' +
            '<div class="t2"><b>' + F.esc(m.subject) + '</b> — ' + F.esc(m.message) + '</div>' +
            '<div class="meta"><span>' + icon('clock', 12) + F.ago(m.date) + '</span><span>' + icon('pin', 12) + F.esc(m.lga || '—') + '</span>' +
            '<span>' + icon('mail', 12) + F.esc(m.email) + '</span>' + (m.assigned ? '<span>' + icon('user', 12) + F.esc(m.assigned) + '</span>' : '<span style="color:var(--warn)">' + icon('alert', 12) + 'Unassigned</span>') + '</div></div>' +
            '<div class="r-acts"><button class="btn btn-ghost btn-xs" data-star="' + m.id + '" title="Star" aria-label="Star message" style="' + (m.starred ? 'color:var(--gold-500)' : '') + '">' + icon('star', 14) + '</button>' +
            '<button class="btn btn-ghost btn-xs" data-read="' + m.id + '" title="Toggle read" aria-label="Toggle read">' + icon(m.read ? 'mail' : 'inbox', 14) + '</button></div></div>';
        }).join('') + '</div>'
          : '<div class="empty">' + icon('inbox', 44) + '<div class="t1">No messages in this view</div><div class="t2">Try another tab, clear the search, or log a call-in enquiry manually.</div></div>') +
        '</div></div>';
    }

    function openMsg(id) {
      var m = S.find('messages', id);
      if (!m) return;
      if (!m.read) S.update('messages', id, { read: true });
      var d = C.detail({
        title: F.esc(m.subject), subtitle: F.esc(m.name) + ' · ' + F.esc(m.ref), icon: 'mail',
        body:
          '<div class="flex gap aic wrap mb-1">' + UI.avatar(m.name, 'avatar-lg g4') +
          '<div style="flex:1;min-width:140px"><b style="color:var(--ink);font-size:1rem">' + F.esc(m.name) + '</b>' +
          '<div class="text-sm text-muted">' + F.esc(m.email) + '<br>' + F.esc(m.phone) + (m.lga ? ' · ' + F.esc(m.lga) + ' LGA' : '') + '</div></div>' +
          '<div style="text-align:right"><div class="text-xs text-faint">' + F.dateTime(m.date) + '</div>' +
          '<div style="margin-top:.3rem">' + UI.statusBadge(m.status) + ' ' + UI.priorityBadge(m.priority) + '</div></div></div>' +
          (m.location ? '<div class="note mb-1">' + icon('pin', 17) + '<div><b>Incident location:</b> ' + F.esc(m.location) + '</div></div>' : '') +
          '<div class="card card-pad mb-1" style="background:var(--surface-2)"><p class="text-sm mb-0" style="white-space:pre-line">' + F.esc(m.message) + '</p></div>' +
          (m.reply ? '<div class="note ok mb-1">' + icon('reply', 17) + '<div><b>Reply sent</b><div class="text-sm" style="margin-top:.2rem;white-space:pre-line">' + F.esc(m.reply) + '</div></div></div>' : '') +
          '<hr class="divider">' +
          '<div class="form-grid">' +
          UI.field({ id: 'status', name: 'status', type: 'select', label: 'Status', value: m.status, options: ['New', 'Open', 'In progress', 'Resolved', 'Closed'] }) +
          UI.field({ id: 'priority', name: 'priority', type: 'select', label: 'Priority', value: m.priority, options: ['Low', 'Normal', 'High', 'Urgent'] }) +
          UI.field({ id: 'assigned', name: 'assigned', type: 'select', label: 'Assign to', value: m.assigned, options: staffNames().concat(userNames()), placeholder: 'Unassigned', full: true }) +
          UI.field({ id: 'reply', name: 'reply', type: 'textarea', label: 'Reply to ' + F.esc(m.name), value: m.reply, rows: 4, full: true, placeholder: 'Write the response that will be sent to ' + m.email }) +
          '</div>',
        footer: '<button class="btn btn-outline" data-act="del" style="color:var(--danger)">' + icon('trash', 15) + 'Delete</button>' +
          '<span style="flex:1"></span>' +
          '<button class="btn" data-act="save">' + icon('save', 15) + 'Save details</button>' +
          '<button class="btn btn-primary" data-act="reply">' + icon('send', 15) + 'Send reply</button>',
        onOpen: function (api) {
          UI.wireFields(api.el);
          api.el.querySelector('[data-act="save"]').addEventListener('click', function () {
            var v = UI.readForm(api.el.querySelector('[data-form]') || api.el);
            S.update('messages', id, { status: v.status, priority: v.priority, assigned: v.assigned });
            S.log('update', 'Enquiries', 'Updated ' + m.ref + ' → ' + v.status + (v.assigned ? ', assigned to ' + v.assigned : ''), 'info');
            UI.toast('Enquiry updated.', 'Saved', 'ok'); api.close(); paint();
          });
          api.el.querySelector('[data-act="reply"]').addEventListener('click', function () {
            var v = UI.readForm(api.el.querySelector('[data-form]') || api.el);
            if (!v.reply || !v.reply.trim()) { UI.toast('Write a reply before sending.', 'Empty reply', 'warn'); return; }
            S.update('messages', id, { reply: v.reply, status: v.status === 'New' ? 'Open' : v.status, priority: v.priority, assigned: v.assigned || (S.currentUser() || {}).name });
            S.log('reply', 'Enquiries', 'Replied to ' + m.ref + ' (' + m.name + ')', 'ok');
            UI.toast('Reply sent to ' + m.email + '.', 'Message sent', 'ok');
            api.close(); paint();
          });
          api.el.querySelector('[data-act="del"]').addEventListener('click', function () {
            api.close(); C.del('messages', id, F.esc(m.ref), paint);
          });
        }
      });
      paint();
      return d;
    }

    host.addEventListener('click', function (e) {
      var tab = e.target.closest('[data-tab]'); if (tab) { state.tab = tab.dataset.tab; return paint(); }
      var st = e.target.closest('[data-star]');
      if (st) { e.stopPropagation(); var mm = S.find('messages', st.dataset.star); S.update('messages', mm.id, { starred: !mm.starred }); return paint(); }
      var rd = e.target.closest('[data-read]');
      if (rd) { e.stopPropagation(); var mr = S.find('messages', rd.dataset.read); S.update('messages', mr.id, { read: !mr.read }); return paint(); }
      if (e.target.closest('[data-export]')) {
        UI.download('enquiries.csv', UI.toCSV([
          { key: 'ref', label: 'Reference' }, { key: 'date', label: 'Received' }, { key: 'name', label: 'Name' },
          { key: 'email', label: 'Email' }, { key: 'phone', label: 'Phone' }, { key: 'lga', label: 'LGA' },
          { key: 'subject', label: 'Subject' }, { key: 'location', label: 'Location' }, { key: 'message', label: 'Message' },
          { key: 'status', label: 'Status' }, { key: 'priority', label: 'Priority' }, { key: 'assigned', label: 'Assigned to' },
          { key: 'reply', label: 'Reply' }
        ], filtered()), 'text/csv');
        UI.toast(filtered().length + ' enquiries exported.', 'CSV', 'ok');
        return;
      }
      if (e.target.closest('[data-sim]')) return logCallIn();
      var item = e.target.closest('[data-id]'); if (item && !e.target.closest('button')) openMsg(item.dataset.id);
    });
    host.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter') return;
      var item = e.target.closest('[data-id]'); if (item && !e.target.closest('button')) openMsg(item.dataset.id);
    });
    host.addEventListener('input', function (e) {
      var q = e.target.closest('[data-q]');
      if (q) { state.q = q.value; paint(); var n = host.querySelector('[data-q]'); n.focus(); n.setSelectionRange(n.value.length, n.value.length); }
    });
    host.addEventListener('change', function (e) {
      var s = e.target.closest('[data-status]'); if (s) { state.status = s.value; return paint(); }
      var so = e.target.closest('[data-sort]'); if (so) { state.sort = so.value; return paint(); }
    });

    function logCallIn() {
      C.editor({
        title: 'Log a call-in or walk-in enquiry', subtitle: 'Record enquiries received by phone, hotline or at the Service Desk', icon: 'phone', size: 'md',
        fields: [
          { id: 'name', name: 'name', label: 'Name', required: true },
          { id: 'phone', name: 'phone', type: 'tel', label: 'Phone', required: true },
          { id: 'email', name: 'email', type: 'email', label: 'Email' },
          { id: 'lga', name: 'lga', type: 'select', label: 'LGA', options: S.data.lgas, placeholder: 'Select LGA' },
          { id: 'subject', name: 'subject', type: 'select', label: 'Subject', options: S.data.messageSubjects, required: true },
          { id: 'priority', name: 'priority', type: 'select', label: 'Priority', value: 'Normal', options: ['Low', 'Normal', 'High', 'Urgent'] },
          { id: 'location', name: 'location', label: 'Incident location', full: true },
          { id: 'message', name: 'message', type: 'textarea', label: 'Details', rows: 4, required: true, full: true },
          { id: 'assigned', name: 'assigned', type: 'select', label: 'Assign to', options: staffNames().concat(userNames()), placeholder: 'Unassigned', full: true }
        ],
        onSave: function (vals) {
          vals.id = S.uid('ms'); vals.ref = nextRef('GM', 'messages', 481900); vals.date = new Date().toISOString();
          vals.status = 'New'; vals.read = false; vals.starred = false; vals.reply = '';
          S.add('messages', vals);
          S.log('create', 'Enquiries', 'Logged call-in enquiry ' + vals.ref + ' from ' + vals.name, 'ok');
          UI.toast('Enquiry ' + vals.ref + ' logged.', 'Created', 'ok');
          paint();
        }
      });
    }
    paint();
  };

  /* =====================================================================
     INCIDENT REPORTS
     ===================================================================== */
  V.reports = C.entity({
    store: 'reports', icon: 'alert', title: 'Environmental Incident Reports',
    subtitle: 'Pollution, illegal logging, erosion, dumping and other hazards raised through the hotline, forms and field patrols.',
    createLabel: 'Raise report', csvName: 'incident-reports',
    searchPlaceholder: 'Search reference, type, location…',
    kpis: function () {
      var r = S.list('reports');
      return [
        { label: 'Open incidents', value: r.filter(function (x) { return ['Verified', 'Under investigation', 'Site visit scheduled', 'Sampling done', 'Monitoring'].indexOf(x.status) > -1; }).length, icon: 'alert' },
        { label: 'Critical', value: r.filter(function (x) { return x.severity === 'Critical'; }).length, icon: 'zap' },
        { label: 'Resolved (30d)', value: r.filter(function (x) { return x.status === 'Resolved' || x.status === 'Closed'; }).length, icon: 'checkCircle' },
        { label: 'Total logged', value: r.length, icon: 'clipboard' }
      ];
    },
    search: function (r) { return [r.ref, r.type, r.lga, r.location, r.officer, r.status, r.note].join(' '); },
    filters: [
      { key: 'severity', label: 'Severity', options: ['Critical', 'High', 'Medium', 'Low'] },
      { key: 'status', label: 'Status', options: ['New', 'Verified', 'Under investigation', 'Site visit scheduled', 'Sampling done', 'Monitoring', 'Resolved', 'Closed'] },
      { key: 'lga', label: 'LGA', options: S.data.lgas }
    ],
    cols: [
      {
        key: 'ref', label: 'Incident', render: function (r) {
          return '<div class="cell-main"><span class="avatar avatar-sm ' + (r.severity === 'Critical' ? 'g4' : r.severity === 'High' ? 'g2' : 'g1') + '">' + icon('alert', 14) + '</span>' +
            '<div class="b"><div class="t1">' + F.esc(r.type) + '</div><div class="t2">' + F.esc(r.location) + ' · ' + F.esc(r.lga) + ' LGA</div></div></div>';
        }
      },
      { key: 'ref2', label: 'Reference', sortable: false, render: function (r) { return '<span class="mono text-xs">' + F.esc(r.ref) + '</span>'; } },
      { key: 'severity', label: 'Severity', render: function (r) { return UI.priorityBadge(r.severity); } },
      { key: 'status', label: 'Status', render: function (r) { return UI.statusBadge(r.status); } },
      { key: 'officer', label: 'Officer', render: function (r) { return r.officer ? '<div class="cell-main">' + UI.avatar(r.officer, 'avatar-xs g5') + '<span class="text-xs">' + F.esc(r.officer) + '</span></div>' : '<span class="badge b-warn">Unassigned</span>'; } },
      { key: 'raised', label: 'Raised', render: function (r) { return '<span class="text-xs">' + F.ago(r.raised) + '</span>'; }, sortValue: function (r) { return r.raised; } }
    ],
    actions: function (r) { return UI.act('edit', r.id, 'edit', 'Edit report') + UI.act('del', r.id, 'trash', 'Delete'); },
    bulk: [
      { id: 'verify', label: 'Mark verified', icon: 'checkCircle' },
      { id: 'resolve', label: 'Mark resolved', icon: 'check' },
      { id: 'delete', label: 'Delete', icon: 'trash', cls: 'btn-danger' }
    ],
    onBulk: function (act, ids, done) {
      ids.forEach(function (id) {
        if (act === 'verify') S.update('reports', id, { status: 'Verified', updated: new Date().toISOString() });
        if (act === 'resolve') S.update('reports', id, { status: 'Resolved', updated: new Date().toISOString() });
      });
      S.log('bulk', 'Reports', act + ' applied to ' + ids.length + ' incident(s)', 'info');
      UI.toast(ids.length + ' incident(s) updated.', 'Bulk action', 'ok'); done();
    },
    fields: function (item) {
      return [
        { id: 'type', name: 'type', type: 'select', label: 'Incident type', value: item.type, options: S.data.reportTypes, required: true },
        { id: 'severity', name: 'severity', type: 'select', label: 'Severity', value: item.severity || 'Medium', options: ['Low', 'Medium', 'High', 'Critical'] },
        { id: 'status', name: 'status', type: 'select', label: 'Status', value: item.status || 'New', options: ['New', 'Verified', 'Under investigation', 'Site visit scheduled', 'Sampling done', 'Monitoring', 'Resolved', 'Closed'] },
        { id: 'lga', name: 'lga', type: 'select', label: 'LGA', value: item.lga, options: S.data.lgas, required: true },
        { id: 'location', name: 'location', label: 'Location description', value: item.location, required: true, full: true },
        { id: 'lat', name: 'lat', type: 'number', label: 'Latitude', value: item.lat, step: '0.0001' },
        { id: 'lng', name: 'lng', type: 'number', label: 'Longitude', value: item.lng, step: '0.0001' },
        { id: 'source', name: 'source', type: 'select', label: 'Reported via', value: item.source || 'Contact form', options: ['Contact form', 'Hotline', 'Field patrol', 'GOSEPA referral', 'Community report', 'Media', 'Email'] },
        { id: 'officer', name: 'officer', type: 'select', label: 'Assigned officer', value: item.officer, options: staffNames().concat(userNames()), placeholder: 'Unassigned' },
        { id: 'note', name: 'note', type: 'textarea', label: 'Investigation notes', value: item.note, rows: 4, full: true }
      ];
    },
    onSave: function (vals, item) {
      vals.lat = parseFloat(vals.lat) || 0; vals.lng = parseFloat(vals.lng) || 0;
      vals.updated = new Date().toISOString();
      if (item.id) { S.update('reports', item.id, vals); S.log('update', 'Reports', 'Updated incident ' + vals.ref, 'info'); UI.toast('Incident report updated.', 'Saved', 'ok'); }
      else {
        vals.id = S.uid('rp'); vals.ref = nextRef('ENV', 'reports', 140); vals.raised = new Date().toISOString();
        S.add('reports', vals);
        S.log('create', 'Reports', 'Raised incident ' + vals.ref + ' — ' + vals.type + ' (' + vals.lga + ')', 'warn');
        UI.toast('Incident ' + vals.ref + ' raised.', 'New report', 'ok');
      }
    },
    onAction: function (act, id, h, paint) {
      var r = S.find('reports', id);
      if (act === 'edit') return C.editor({ title: 'Edit incident report', subtitle: F.esc(r.ref), icon: 'alert', size: 'md', item: r, fields: V.reports.fields(r), onSave: function (v, it) { v.lat = parseFloat(v.lat) || 0; v.lng = parseFloat(v.lng) || 0; v.updated = new Date().toISOString(); S.update('reports', it.id, v); S.log('update', 'Reports', 'Updated ' + it.ref, 'info'); UI.toast('Report updated.', 'Saved', 'ok'); paint(); } });
      if (act === 'del') C.del('reports', id, F.esc(r.ref), paint);
    },
    onRow: function (id, h, paint) {
      var r = S.find('reports', id);
      var flow = ['New', 'Verified', 'Under investigation', 'Resolved'];
      var cur = flow.indexOf(r.status) > -1 ? flow.indexOf(r.status) : 1;
      C.detail({
        title: F.esc(r.type), subtitle: F.esc(r.ref) + ' · ' + F.esc(r.lga) + ' LGA', icon: 'alert',
        body:
          '<div class="status-flow mb-1">' + flow.map(function (s, i) {
            return '<span class="sf ' + (i <= cur ? 'on' : '') + '">' + icon(i <= cur ? 'checkCircle' : 'clock', 13) + F.esc(s) + '</span>' + (i < flow.length - 1 ? '<span class="sf-line"></span>' : '');
          }).join('') + '</div>' +
          /* Location card. Deliberately NOT an external map link: this console is pure
             front-end HTML/CSS/JS and must not request or reference any third-party
             service, so coordinates are shown (and copyable) locally instead. */
          (r.lat && r.lng ? '<div class="card card-pad mb-1 flex gap aic">' +
            '<span class="sm-ico" style="width:34px;height:34px;border-radius:8px;display:grid;place-items:center;background:var(--accent-soft);color:var(--accent)">' + icon('pin', 17) + '</span>' +
            '<span style="flex:1"><b style="color:var(--ink)">' + F.esc(r.location) + '</b>' +
            '<div class="text-xs text-muted">Coordinates ' + r.lat.toFixed(4) + ', ' + r.lng.toFixed(4) + '</div></span>' +
            '<button class="btn btn-outline btn-sm" type="button" data-copycoords="' + r.lat.toFixed(6) + ', ' + r.lng.toFixed(6) + '">' + icon('copy', 14) + 'Copy</button>' +
            '</div>' : '<div class="note mb-1">' + icon('pin', 17) + '<div>' + F.esc(r.location) + '</div></div>') +
          C.kv([['Severity', r.severity, 'raw'], ['Current status', r.status, 'raw'], ['Reported via', r.source], ['Assigned officer', r.officer || 'Unassigned'], ['Raised', F.dateTime(r.raised)], ['Last update', F.dateTime(r.updated)]]) +
          '<hr class="divider"><h4 style="font-size:.86rem;margin-bottom:.4rem">Investigation notes</h4>' +
          '<p class="text-sm" style="white-space:pre-line">' + F.esc(r.note || 'No notes recorded yet.') + '</p>',
        footer: '<button class="btn" data-close>Close</button>' +
          '<button class="btn btn-outline" data-adv>' + icon('arrowRight', 15) + 'Advance status</button>' +
          '<button class="btn btn-primary" data-ed>' + icon('edit', 15) + 'Edit report</button>',
        onOpen: function (api) {
          var cp = api.el.querySelector('[data-copycoords]');
          if (cp) cp.addEventListener('click', function () {
            UI.copyText(cp.getAttribute('data-copycoords'), 'Coordinates copied.');
          });
          api.el.querySelector('[data-ed]').addEventListener('click', function () {
            api.close();
            C.editor({ title: 'Edit incident report', subtitle: F.esc(r.ref), icon: 'alert', size: 'md', item: r, fields: V.reports.fields(r), onSave: function (v, it) { v.lat = parseFloat(v.lat) || 0; v.lng = parseFloat(v.lng) || 0; v.updated = new Date().toISOString(); S.update('reports', it.id, v); UI.toast('Report updated.', 'Saved', 'ok'); paint(); } });
          });
          api.el.querySelector('[data-adv]').addEventListener('click', function () {
            var order = ['New', 'Verified', 'Under investigation', 'Sampling done', 'Monitoring', 'Resolved', 'Closed'];
            var i = order.indexOf(r.status);
            var next = order[Math.min(order.length - 1, i + 1)];
            S.update('reports', r.id, { status: next, updated: new Date().toISOString() });
            S.log('update', 'Reports', r.ref + ' status → ' + next, 'info');
            UI.toast('Status advanced to ' + next + '.', 'Incident ' + r.ref, 'ok');
            api.close(); paint();
          });
        }
      });
    }
  });

  /* =====================================================================
     PERMITS & APPLICATIONS
     ===================================================================== */
  V.permits = function (host, helpers) {
    var state = { view: 'table', q: '', status: 'all', dept: 'all' };

    function stats() {
      var p = S.list('permits');
      var rev = p.reduce(function (a, b) { return a + (b.paid ? (b.fee || 0) : 0); }, 0);
      var due = p.filter(function (x) { return x.due && daysBetween(x.due) >= 0 && daysBetween(x.due) <= 7 && ['Approved', 'Rejected', 'Conditional approval'].indexOf(x.status) < 0; }).length;
      return [
        { label: 'Applications', value: p.length, icon: 'clipboard' },
        { label: 'Awaiting decision', value: p.filter(function (x) { return ['New', 'Under review', 'Site verification'].indexOf(x.status) > -1; }).length, icon: 'clock' },
        { label: 'Due within 7 days', value: due, icon: 'alert' },
        { label: 'Revenue collected', value: F.nairaShort(rev), icon: 'card' }
      ];
    }

    function filtered() {
      var p = S.list('permits').slice();
      if (state.status !== 'all') p = p.filter(function (x) { return x.status === state.status; });
      if (state.dept !== 'all') p = p.filter(function (x) { return x.dept === state.dept; });
      if (state.q) p = p.filter(function (x) { return [x.ref, x.type, x.applicant, x.officer, x.lga, x.notes].join(' ').toLowerCase().indexOf(state.q.toLowerCase()) > -1; });
      return p.sort(function (a, b) { return new Date(b.submitted) - new Date(a.submitted); });
    }

    function paint() {
      host.innerHTML =
        '<div class="page-head"><div class="ph-t"><h2>' + icon('clipboard', 20) + ' Permits & Applications</h2>' +
        '<p>EIA approvals, tree-felling and fuelwood permits, waste operator licences, effluent discharge permits and site assessments — from submission to decision.</p></div>' +
        '<div class="ph-a"><button class="btn btn-outline" data-export>' + icon('download', 15) + 'Export CSV</button>' +
        '<button class="btn btn-primary" data-new>' + icon('plus', 15) + 'New application</button></div></div>' +
        '<div class="grid g-4 mb-1">' + stats().map(function (k) { return statMini(k.icon, k.value, k.label); }).join('') + '</div>' +
        '<div class="seg mb-1" role="tablist"><button role="tab" data-v="table" class="' + (state.view === 'table' ? 'active' : '') + '">' + icon('list', 14) + ' Register</button>' +
        '<button role="tab" data-v="kanban" class="' + (state.view === 'kanban' ? 'active' : '') + '">' + icon('columns', 14) + ' Workflow board</button></div>' +
        '<div data-body></div>';
      if (state.view === 'table') table(); else kanban();
    }

    function toolbarHtml() {
      return '<div class="toolbar">' +
        '<div class="search">' + icon('search', 15) + '<input type="search" data-q placeholder="Search reference, applicant, type…" value="' + F.esc(state.q) + '" aria-label="Search applications"></div>' +
        '<select data-status aria-label="Filter by status"><option value="all">Any status</option>' +
        S.data.permitFlow.map(function (s) { return '<option' + (state.status === s ? ' selected' : '') + '>' + s + '</option>'; }).join('') + '</select>' +
        '<select data-dept aria-label="Filter by directorate"><option value="all">All directorates</option>' +
        uniq(S.list('permits').map(function (p) { return p.dept; })).map(function (s) { return '<option' + (state.dept === s ? ' selected' : '') + '>' + F.esc(s) + '</option>'; }).join('') + '</select>' +
        '<div class="grow"></div><span class="text-xs text-muted">' + filtered().length + ' applications</span></div>';
    }

    function table() {
      var slot = host.querySelector('[data-body]');
      slot.innerHTML = '<div class="card">' + toolbarHtml() + '<div class="tbl-wrap"><table class="tbl"><thead><tr>' +
        '<th>Application</th><th>Applicant</th><th>Directorate</th><th>Fee</th><th>Due</th><th>Status</th><th style="text-align:right">Actions</th>' +
        '</tr></thead><tbody>' +
        (filtered().length ? filtered().map(function (p) {
          var dd = daysBetween(p.due);
          var dueBadge = ['Approved', 'Rejected', 'Conditional approval'].indexOf(p.status) > -1
            ? '<span class="text-xs text-muted">' + F.dateShort(p.due) + '</span>'
            : (dd < 0 ? '<span class="badge b-danger">Overdue ' + Math.abs(dd) + 'd</span>' : dd <= 5 ? '<span class="badge b-warn">' + dd + ' days left</span>' : '<span class="text-xs text-muted">' + F.dateShort(p.due) + '</span>');
          return '<tr data-id="' + p.id + '" style="cursor:pointer">' +
            '<td><div class="cell-main"><div class="b"><div class="t1">' + F.esc(p.type) + '</div><div class="t2 mono">' + F.esc(p.ref) + '</div></div></div></td>' +
            '<td><div class="cell-main">' + UI.avatar(p.applicant, 'avatar-xs g1') + '<div class="b"><div class="t1" style="font-size:.82rem">' + F.esc(p.applicant) + '</div><div class="t2">' + F.esc(p.lga) + ' LGA</div></div></div></td>' +
            '<td><span class="badge b-green">' + F.esc(p.dept.replace('Directorate of ', '')) + '</span></td>' +
            '<td class="num">' + (p.fee ? F.naira(p.fee) + (p.paid ? ' <span class="badge b-ok" style="margin-left:.2rem">Paid</span>' : ' <span class="badge b-warn" style="margin-left:.2rem">Unpaid</span>') : '<span class="badge b-ok">Free</span>') + '</td>' +
            '<td>' + dueBadge + '</td><td>' + UI.statusBadge(p.status) + '</td>' +
            '<td><div class="acts"><button class="btn btn-ghost btn-xs" data-act="edit" data-id="' + p.id + '" aria-label="Edit">' + icon('edit', 14) + '</button>' +
            '<button class="btn btn-ghost btn-xs" data-act="del" data-id="' + p.id + '" aria-label="Delete" style="color:var(--danger)">' + icon('trash', 14) + '</button></div></td></tr>';
        }).join('') : '<tr><td colspan="7"><div class="empty">' + icon('clipboard', 44) + '<div class="t1">No applications match</div><div class="t2">Adjust the filters or register a new application.</div></div></td></tr>') +
        '</tbody></table></div></div>';
      wireCommon();
      slot.addEventListener('click', function (e) {
        var act = e.target.closest('[data-act]');
        if (act) {
          e.stopPropagation();
          if (act.dataset.act === 'edit') return editor(S.find('permits', act.dataset.id));
          if (act.dataset.act === 'del') return C.del('permits', act.dataset.id, F.esc(S.find('permits', act.dataset.id).ref), paint);
        }
        var tr = e.target.closest('tr[data-id]'); if (tr) openPermit(tr.dataset.id);
      });
    }

    function kanban() {
      var slot = host.querySelector('[data-body]');
      var cols = S.data.permitFlow;
      var colors = { 'New': 'var(--info)', 'Under review': 'var(--warn)', 'Site verification': 'var(--purple)', 'Approved': 'var(--ok)', 'Conditional approval': 'var(--teal)', 'Rejected': 'var(--danger)' };
      slot.innerHTML = '<div class="card mb-1" style="padding:0">' + toolbarHtml() + '</div>' +
        '<div class="kanban">' + cols.map(function (c) {
          var items = filtered().filter(function (p) { return p.status === c; });
          return '<div class="kcol"><div class="kcol-h"><span class="kd" style="background:' + colors[c] + '"></span><strong>' + F.esc(c) + '</strong><span class="n">' + items.length + '</span></div>' +
            '<div class="kcol-b" data-col="' + F.esc(c) + '">' +
            (items.length ? items.map(function (p) {
              var dd = daysBetween(p.due);
              return '<div class="kcard" data-id="' + p.id + '" draggable="true"><div class="t1">' + F.esc(p.applicant) + '</div>' +
                '<div class="t2">' + F.esc(p.type) + '</div>' +
                '<div class="kf"><span class="ref">' + F.esc(p.ref) + '</span>' +
                (dd < 0 && ['Approved', 'Rejected', 'Conditional approval'].indexOf(p.status) < 0 ? '<span class="badge b-danger">Overdue</span>' : dd <= 5 ? '<span class="badge b-warn">' + dd + 'd</span>' : '<span class="badge b-outline">' + F.dateShort(p.due) + '</span>') + '</div></div>';
            }).join('') : '<div class="text-xs text-faint center" style="padding:1rem .4rem">Drop an application here</div>') +
            '</div></div>';
        }).join('') + '</div>';
      wireCommon();
      var dragId = null;
      slot.querySelectorAll('.kcard').forEach(function (c) {
        c.addEventListener('dragstart', function () { dragId = c.dataset.id; c.style.opacity = '.5'; });
        c.addEventListener('dragend', function () { c.style.opacity = ''; });
        c.addEventListener('click', function () { openPermit(c.dataset.id); });
      });
      slot.querySelectorAll('.kcol-b').forEach(function (col) {
        col.addEventListener('dragover', function (e) { e.preventDefault(); col.style.background = 'var(--accent-soft)'; });
        col.addEventListener('dragleave', function () { col.style.background = ''; });
        col.addEventListener('drop', function (e) {
          e.preventDefault(); col.style.background = '';
          if (!dragId) return;
          var p = S.find('permits', dragId);
          var to = col.dataset.col;
          if (p.status === to) return;
          S.update('permits', p.id, { status: to, decided: ['Approved', 'Rejected', 'Conditional approval'].indexOf(to) > -1 ? new Date().toISOString() : p.decided });
          S.log('update', 'Permits', p.ref + ' moved to ' + to, to === 'Approved' ? 'ok' : 'info');
          UI.toast(p.ref + ' moved to "' + to + '".', 'Workflow updated', 'ok');
          paint();
        });
      });
    }

    function wireCommon() {
      host.querySelectorAll('[data-v]').forEach(function (b) { b.addEventListener('click', function () { state.view = b.dataset.v; paint(); }); });
      var q = host.querySelector('[data-q]');
      if (q) q.addEventListener('input', function () { state.q = q.value; var pos = q.selectionStart; paint(); var nq = host.querySelector('[data-q]'); nq.focus(); nq.setSelectionRange(pos, pos); });
      var st = host.querySelector('[data-status]'); if (st) st.addEventListener('change', function () { state.status = st.value; paint(); });
      var dp = host.querySelector('[data-dept]'); if (dp) dp.addEventListener('change', function () { state.dept = dp.value; paint(); });
    }

    function editor(item) {
      C.editor({
        title: item ? 'Edit application' : 'Register application', subtitle: item ? F.esc(item.ref) : 'A reference number is generated automatically',
        icon: 'clipboard', size: 'lg', item: item || {},
        fields: [
          { id: 'type', name: 'type', type: 'select', label: 'Application type', value: item.type, options: S.data.permitTypes, required: true },
          { id: 'applicant', name: 'applicant', label: 'Applicant / organisation', value: item.applicant, required: true },
          { id: 'contact', name: 'contact', type: 'email', label: 'Contact email', value: item.contact },
          { id: 'phone', name: 'phone', type: 'tel', label: 'Phone', value: item.phone },
          { id: 'lga', name: 'lga', type: 'select', label: 'LGA', value: item.lga, options: S.data.lgas, placeholder: 'Select LGA' },
          { id: 'dept', name: 'dept', type: 'select', label: 'Handling directorate', value: item.dept, options: deptNames().map(function (d) { return d; }), required: true },
          { id: 'officer', name: 'officer', type: 'select', label: 'Desk officer', value: item.officer, options: staffNames().concat(userNames()), placeholder: 'Unassigned' },
          { id: 'status', name: 'status', type: 'select', label: 'Status', value: item.status || 'New', options: S.data.permitFlow },
          { id: 'fee', name: 'fee', type: 'number', label: 'Statutory fee', value: item.fee || 0, prefix: '₦', min: 0, step: 1000 },
          { id: 'paid', name: 'paid', type: 'switch', label: 'Fee paid', hint: 'Confirm an official government receipt before ticking.', value: !!item.paid },
          { id: 'submitted', name: 'submitted', type: 'date', label: 'Date submitted', value: (item.submitted || new Date().toISOString()).slice(0, 10) },
          { id: 'due', name: 'due', type: 'date', label: 'Decision due', value: (item.due || '').slice(0, 10) },
          { id: 'notes', name: 'notes', type: 'textarea', label: 'Officer notes', value: item.notes, rows: 4, full: true }
        ],
        onSave: function (vals, it) {
          vals.fee = Number(vals.fee) || 0;
          if (it.id) { S.update('permits', it.id, vals); S.log('update', 'Permits', 'Updated application ' + (it.ref || ''), 'info'); UI.toast('Application updated.', 'Saved', 'ok'); }
          else {
            vals.id = S.uid('pm'); vals.ref = nextRef('PER', 'permits', 300); vals.decided = '';
            S.add('permits', vals);
            S.log('create', 'Permits', 'Registered application ' + vals.ref + ' — ' + vals.type, 'ok');
            UI.toast('Application ' + vals.ref + ' registered.', 'Created', 'ok');
          }
          paint();
        }
      });
    }

    function openPermit(id) {
      var p = S.find('permits', id);
      if (!p) return;
      var flow = ['New', 'Under review', 'Site verification', 'Approved'];
      var cur = flow.indexOf(p.status) > -1 ? flow.indexOf(p.status) : (p.status === 'Rejected' ? 4 : 3);
      C.detail({
        title: F.esc(p.type), subtitle: F.esc(p.ref) + ' · submitted ' + F.date(p.submitted), icon: 'clipboard',
        body:
          '<div class="status-flow mb-1">' + flow.map(function (s, i) {
            return '<span class="sf ' + (i <= cur ? 'on' : '') + '">' + icon(i <= cur ? 'checkCircle' : 'clock', 13) + F.esc(s) + '</span>' + (i < flow.length - 1 ? '<span class="sf-line"></span>' : '');
          }).join('') + '</div>' +
          (p.status === 'Rejected' ? '<div class="note danger mb-1">' + icon('xCircle', 17) + '<div><b>Rejected.</b> ' + F.esc(p.notes || '') + '</div></div>' : '') +
          '<div class="grid g-2 mb-1">' +
          '<div>' + UI.charts.ring(p.paid ? 100 : 35, { label: p.paid ? 'Paid' : 'Unpaid', sub: 'fee status', size: 96, color: p.paid ? 'var(--ok)' : 'var(--danger)' }) + '</div>' +
          '<div class="stack" style="align-content:center">' +
          '<div class="stat-mini"><span class="sm-ico">' + icon('card', 17) + '</span><span><span class="v">' + (p.fee ? F.naira(p.fee) : 'Free') + '</span><span class="l">Statutory fee</span></span></div>' +
          '<div class="stat-mini"><span class="sm-ico">' + icon('clock', 17) + '</span><span><span class="v">' + F.date(p.due) + '</span><span class="l">Decision due</span></span></div>' +
          '</div></div>' +
          C.kv([
            ['Applicant', p.applicant], ['Contact', (p.contact || '—') + (p.phone ? ' · ' + p.phone : '')], ['LGA', p.lga],
            ['Handling directorate', p.dept], ['Desk officer', p.officer || 'Unassigned'], ['Status', p.status, 'raw'],
            ['Submitted', F.dateTime(p.submitted)], ['Decided', p.decided ? F.dateTime(p.decided) : 'Pending']
          ]) +
          '<hr class="divider"><h4 style="font-size:.86rem;margin-bottom:.4rem">Officer notes</h4>' +
          '<p class="text-sm" style="white-space:pre-line">' + F.esc(p.notes || 'No notes recorded.') + '</p>',
        footer: '<button class="btn btn-outline" data-act="del" style="color:var(--danger)">' + icon('trash', 15) + '</button>' +
          '<span style="flex:1"></span>' +
          '<button class="btn btn-outline" data-act="reject">' + icon('xCircle', 15) + 'Reject</button>' +
          '<button class="btn btn-gold" data-act="cond">' + icon('alert', 15) + 'Conditional</button>' +
          '<button class="btn btn-primary" data-act="approve">' + icon('checkCircle', 15) + 'Approve</button>',
        onOpen: function (api) {
          function set(status, tone) {
            S.update('permits', id, { status: status, decided: new Date().toISOString() });
            S.log(status === 'Approved' ? 'approve' : status === 'Rejected' ? 'reject' : 'update', 'Permits', p.ref + ' → ' + status, tone);
            UI.toast(p.ref + ' marked as ' + status + '.', 'Decision recorded', tone === 'ok' ? 'ok' : tone === 'danger' ? 'err' : 'warn');
            api.close(); paint();
          }
          api.el.querySelector('[data-act="approve"]').addEventListener('click', function () {
            UI.confirm({ title: 'Approve ' + p.ref + '?', message: 'The applicant will be notified that <b>' + F.esc(p.type) + '</b> has been approved. Ensure the statutory fee has been paid and an official receipt issued.', tone: 'ok', icon: 'checkCircle', okText: 'Approve application' }).then(function (y) { if (y) set('Approved', 'ok'); });
          });
          api.el.querySelector('[data-act="cond"]').addEventListener('click', function () { set('Conditional approval', 'warn'); });
          api.el.querySelector('[data-act="reject"]').addEventListener('click', function () {
            UI.confirm({ title: 'Reject ' + p.ref + '?', message: 'Record the reason for refusal in the officer notes before rejecting.', okText: 'Reject application' }).then(function (y) { if (y) set('Rejected', 'danger'); });
          });
          api.el.querySelector('[data-act="del"]').addEventListener('click', function () { api.close(); C.del('permits', id, F.esc(p.ref), paint); });
        }
      });
    }

    host.addEventListener('click', function (e) {
      if (e.target.closest('[data-new]')) return editor(null);
      if (e.target.closest('[data-export]')) {
        UI.download('permits-register.csv', UI.toCSV([
          { key: 'ref', label: 'Reference' }, { key: 'type', label: 'Type' }, { key: 'applicant', label: 'Applicant' },
          { key: 'contact', label: 'Email' }, { key: 'phone', label: 'Phone' }, { key: 'lga', label: 'LGA' },
          { key: 'dept', label: 'Directorate' }, { key: 'officer', label: 'Officer' }, { key: 'fee', label: 'Fee' },
          { key: 'paid', label: 'Paid' }, { key: 'status', label: 'Status' },
          { key: 'submitted', label: 'Submitted', csv: function (r) { return F.date(r.submitted); } },
          { key: 'due', label: 'Due', csv: function (r) { return F.date(r.due); } },
          { key: 'decided', label: 'Decided', csv: function (r) { return F.date(r.decided); } }
        ], filtered()), 'text/csv');
        UI.toast('Permit register exported.', 'CSV', 'ok');
      }
    });
    paint();
  };

  /* =====================================================================
     EVENTS & CALENDAR
     ===================================================================== */
  V.events = function (host) {
    var cur = new Date();
    cur.setDate(1);

    function monthEvents() { return S.list('events'); }

    function paint() {
      var y = cur.getFullYear(), m = cur.getMonth();
      var first = new Date(y, m, 1), startDay = first.getDay();
      var daysIn = new Date(y, m + 1, 0).getDate();
      var prevDays = new Date(y, m, 0).getDate();
      var evs = monthEvents();
      var cells = [], i;
      for (i = startDay - 1; i >= 0; i--) cells.push({ d: prevDays - i, out: true, date: new Date(y, m - 1, prevDays - i) });
      for (i = 1; i <= daysIn; i++) cells.push({ d: i, out: false, date: new Date(y, m, i) });
      while (cells.length % 7 !== 0 || cells.length < 42) { i = cells.length - daysIn - startDay + 1; cells.push({ d: i, out: true, date: new Date(y, m + 1, i) }); if (cells.length >= 42) break; }

      var todayStr = new Date().toDateString();
      var upcoming = evs.filter(function (e) { return new Date(e.date) >= new Date(new Date().toDateString()); })
        .sort(function (a, b) { return new Date(a.date) - new Date(b.date); }).slice(0, 7);

      host.innerHTML =
        '<div class="page-head"><div class="ph-t"><h2>' + icon('calendar', 20) + ' Events & Sanitation Calendar</h2>' +
        '<p>Monthly sanitation exercises, planting drives, stakeholder meetings, tender openings and field visits.</p></div>' +
        '<div class="ph-a"><button class="btn btn-outline" data-today>' + icon('refresh', 15) + 'Today</button>' +
        '<button class="btn btn-primary" data-new>' + icon('plus', 15) + 'New event</button></div></div>' +
        '<div class="grid gk-32">' +
        '<div class="card"><div class="card-h"><div class="ch-t"><span class="ico">' + icon('calendar', 17) + '</span>' +
        '<div><h3>' + cur.toLocaleString('en', { month: 'long' }) + ' ' + y + '</h3><div class="sub">' + evs.filter(function (e) { var d = new Date(e.date); return d.getMonth() === m && d.getFullYear() === y; }).length + ' events this month</div></div></div>' +
        '<div class="ch-a"><button class="icon-btn" data-prev aria-label="Previous month">' + icon('chevronLeft', 18) + '</button>' +
        '<button class="icon-btn" data-next aria-label="Next month">' + icon('chevronRight', 18) + '</button></div></div>' +
        '<div class="card-pad"><div class="cal"><div class="cal-h">' + ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(function (d) { return '<div>' + d + '</div>'; }).join('') + '</div>' +
        '<div class="cal-grid">' + cells.map(function (c) {
          var iso = c.date.toISOString().slice(0, 10);
          var dayEvs = evs.filter(function (e) { return e.date === iso; });
          return '<div class="cal-day' + (c.out ? ' out' : '') + (c.date.toDateString() === todayStr ? ' today' : '') + '" data-day="' + iso + '">' +
            '<span class="d">' + c.d + '</span>' +
            dayEvs.slice(0, 3).map(function (e) { return '<span class="cal-ev ' + (e.color || '') + '" data-ev="' + e.id + '" title="' + F.esc(e.title) + '">' + F.esc(e.title) + '</span>'; }).join('') +
            (dayEvs.length > 3 ? '<span class="cal-ev more">+' + (dayEvs.length - 3) + ' more</span>' : '') +
            '</div>';
        }).join('') + '</div></div></div></div>' +
        '<div class="stack">' +
        '<div class="card"><div class="card-h"><div class="ch-t"><span class="ico">' + icon('clock', 17) + '</span><div><h3>Coming up</h3><div class="sub">Next 7 scheduled events</div></div></div></div>' +
        '<div class="card-pad"><div class="feed">' + (upcoming.length ? upcoming.map(function (e) {
          return '<div class="feed-item ' + (e.color === 'danger' ? 'danger' : e.color === 'info' ? 'info' : e.color === 'gold' ? 'gold' : '') + '">' +
            '<span class="fi-ico">' + icon('calendar', 15) + '</span><div class="fi-b">' +
            '<p><b>' + F.esc(e.title) + '</b></p><div class="fi-t">' + F.date(e.date) + ' · ' + F.esc(e.time) + '–' + F.esc(e.end) + ' · ' + F.esc(e.location) + '</div></div>' +
            '<button class="btn btn-ghost btn-xs" data-ev="' + e.id + '" aria-label="Open event">' + icon('chevronRight', 14) + '</button></div>';
        }).join('') : '<div class="text-sm text-muted center" style="padding:1rem">Nothing scheduled.</div>') + '</div></div></div>' +
        '<div class="card"><div class="card-h"><div class="ch-t"><span class="ico">' + icon('list', 17) + '</span><div><h3>All events</h3><div class="sub">' + evs.length + ' records</div></div></div></div>' +
        '<div class="card-pad scroll-y sm"><div class="rows">' + evs.slice().sort(function (a, b) { return new Date(b.date) - new Date(a.date); }).map(function (e) {
          return '<div class="row-item" data-ev="' + e.id + '"><div class="b"><div class="t1">' + F.esc(e.title) + '</div>' +
            '<div class="meta"><span>' + icon('calendar', 12) + F.date(e.date) + '</span><span>' + icon('clock', 12) + F.esc(e.time) + '</span>' +
            '<span>' + icon('pin', 12) + F.esc(e.location) + '</span></div></div>' +
            '<span class="badge b-outline">' + F.esc(e.type) + '</span></div>';
        }).join('') + '</div></div></div>' +
        '</div></div>';
    }

    function editor(item) {
      C.editor({
        title: item ? 'Edit event' : 'New event', icon: 'calendar', item: item || {},
        fields: [
          { id: 'title', name: 'title', label: 'Event title', value: item.title, required: true, full: true },
          { id: 'date', name: 'date', type: 'date', label: 'Date', value: item.date || today(), required: true },
          { id: 'type', name: 'type', type: 'select', label: 'Type', value: item.type || 'Meeting', options: S.data.eventTypes },
          { id: 'time', name: 'time', type: 'time', label: 'Start time', value: item.time || '09:00' },
          { id: 'end', name: 'end', type: 'time', label: 'End time', value: item.end || '12:00' },
          { id: 'location', name: 'location', label: 'Location', value: item.location, full: true },
          { id: 'owner', name: 'owner', type: 'select', label: 'Responsible officer', value: item.owner, options: uniq(staffNames().concat(userNames(), ['GOSEPA', 'Office of the Commissioner'])), placeholder: 'Select' },
          { id: 'color', name: 'color', type: 'select', label: 'Calendar colour', value: item.color || '', options: [{ value: '', label: 'Green (default)' }, { value: 'gold', label: 'Gold' }, { value: 'info', label: 'Blue' }, { value: 'purple', label: 'Purple' }, { value: 'danger', label: 'Red' }] },
          { id: 'public', name: 'public', type: 'switch', label: 'Publish in the public events list', value: item.public !== false },
          { id: 'note', name: 'note', type: 'textarea', label: 'Notes', value: item.note, rows: 3, full: true }
        ],
        onSave: function (vals, it) {
          if (it.id) { S.update('events', it.id, vals); S.log('update', 'Events', 'Updated event "' + vals.title + '"', 'info'); UI.toast('Event updated.', 'Saved', 'ok'); }
          else { vals.id = S.uid('ev'); S.add('events', vals); S.log('create', 'Events', 'Scheduled "' + vals.title + '" on ' + vals.date, 'ok'); UI.toast('Event scheduled.', 'Created', 'ok'); }
          paint();
        }
      });
    }

    function openEvent(id) {
      var e = S.find('events', id);
      if (!e) return;
      C.detail({
        title: F.esc(e.title), subtitle: F.date(e.date) + ' · ' + F.esc(e.time) + '–' + F.esc(e.end), icon: 'calendar',
        body: C.kv([['Type', e.type], ['Location', e.location], ['Responsible', e.owner], ['Public listing', e.public ? 'Yes' : 'Internal only', 'raw'], ['Notes', e.note || '—']]),
        footer: '<button class="btn btn-outline" data-act="del" style="color:var(--danger)">' + icon('trash', 15) + 'Delete</button>' +
          '<span style="flex:1"></span><button class="btn" data-close>Close</button>' +
          '<button class="btn btn-primary" data-act="ed">' + icon('edit', 15) + 'Edit</button>',
        onOpen: function (api) {
          api.el.querySelector('[data-act="ed"]').addEventListener('click', function () { api.close(); editor(e); });
          api.el.querySelector('[data-act="del"]').addEventListener('click', function () { api.close(); C.del('events', id, F.esc(e.title), paint); });
        }
      });
    }

    host.addEventListener('click', function (e) {
      if (e.target.closest('[data-new]')) return editor(null);
      if (e.target.closest('[data-today]')) { cur = new Date(); cur.setDate(1); return paint(); }
      if (e.target.closest('[data-prev]')) { cur.setMonth(cur.getMonth() - 1); return paint(); }
      if (e.target.closest('[data-next]')) { cur.setMonth(cur.getMonth() + 1); return paint(); }
      var ev = e.target.closest('[data-ev]'); if (ev) return openEvent(ev.dataset.ev);
      var day = e.target.closest('[data-day]');
      if (day) { editor({ date: day.dataset.day, title: '', time: '09:00', end: '12:00' }); }
    });
    paint();
  };

  /* =====================================================================
     DOCUMENTS & DOWNLOADS
     ===================================================================== */
  V.documents = C.entity({
    store: 'documents', icon: 'download', title: 'Documents & Downloads',
    subtitle: 'Reports, policies, notices, forms and datasets published in the downloads widgets across the site.',
    createLabel: 'Add document', csvName: 'documents',
    kpis: function () {
      var d = S.list('documents');
      return [
        { label: 'Documents', value: d.length, icon: 'doc' },
        { label: 'Total downloads', value: F.compact(d.reduce(function (a, b) { return a + (b.downloads || 0); }, 0)), icon: 'download' },
        { label: 'Public', value: d.filter(function (x) { return x.public; }).length, icon: 'globe' },
        { label: 'Internal only', value: d.filter(function (x) { return !x.public; }).length, icon: 'lock' }
      ];
    },
    search: function (r) { return [r.title, r.cat, r.file, r.owner].join(' '); },
    filters: [{ key: 'cat', label: 'Category', options: S.data.docCats }],
    cols: [
      {
        key: 'title', label: 'Document', render: function (r) {
          return '<div class="cell-main"><span class="avatar avatar-sm g4">' + icon('doc', 15) + '</span>' +
            '<div class="b"><div class="t1">' + F.esc(r.title) + '</div><div class="t2 mono">' + F.esc(r.file) + ' · ' + F.bytes(r.size * 1024) + '</div></div></div>';
        }
      },
      { key: 'cat', label: 'Category', render: function (r) { return '<span class="badge b-purple">' + F.esc(r.cat) + '</span>'; } },
      { key: 'owner', label: 'Owning directorate' },
      { key: 'updated', label: 'Updated', render: function (r) { return F.date(r.updated); } },
      { key: 'downloads', label: 'Downloads', align: 'right', render: function (r) { return F.num(r.downloads || 0); } },
      {
        key: 'public', label: 'Public', render: function (r) {
          return '<label class="switch"><input type="checkbox" data-dtoggle="' + r.id + '"' + (r.public ? ' checked' : '') + ' aria-label="Publish document"><span class="track"></span></label>';
        }
      }
    ],
    actions: function (r) {
      return UI.act('count', r.id, 'download', 'Simulate a download') + UI.act('edit', r.id, 'edit', 'Edit') + UI.act('del', r.id, 'trash', 'Delete');
    },
    bulk: [{ id: 'publish', label: 'Make public', icon: 'globe' }, { id: 'unpublish', label: 'Make internal', icon: 'lock' }, { id: 'delete', label: 'Delete', icon: 'trash', cls: 'btn-danger' }],
    onBulk: function (act, ids, done) {
      ids.forEach(function (id) {
        if (act === 'publish') S.update('documents', id, { public: true });
        if (act === 'unpublish') S.update('documents', id, { public: false });
      });
      S.log('bulk', 'Documents', act + ' applied to ' + ids.length + ' documents', 'info');
      UI.toast(ids.length + ' document(s) updated.', 'Bulk action', 'ok'); done();
    },
    fields: function (item) {
      return [
        { id: 'title', name: 'title', label: 'Document title', value: item.title, required: true, full: true },
        { id: 'cat', name: 'cat', type: 'select', label: 'Category', value: item.cat || 'Reports', options: S.data.docCats },
        { id: 'owner', name: 'owner', type: 'select', label: 'Owning directorate', value: item.owner, options: uniq(S.list('departments').map(function (d) { return d.name.replace('Directorate of ', ''); }).concat(['ACReSAL PIU', 'Admin & Finance'])), placeholder: 'Select' },
        { id: 'file', name: 'file', label: 'File name', value: item.file, required: true, placeholder: 'report-2026.pdf' },
        { id: 'size', name: 'size', type: 'number', label: 'File size (KB)', value: item.size || 0, min: 0 },
        { id: 'format', name: 'format', type: 'select', label: 'Format', value: item.format || 'PDF', options: ['PDF', 'DOCX', 'XLSX', 'ZIP', 'CSV'] },
        { id: 'updated', name: 'updated', type: 'date', label: 'Published / updated', value: item.updated || today() },
        { id: 'downloads', name: 'downloads', type: 'number', label: 'Download count', value: item.downloads || 0, min: 0 },
        { id: 'public', name: 'public', type: 'switch', label: 'List publicly on the website', value: item.public !== false },
        { id: 'upload', name: 'upload', type: 'file', label: 'Attach file (demo)', accept: '.pdf,.doc,.docx,.xls,.xlsx,.zip,.csv', full: true, hint: 'The console records the file name and size; the binary stays on your machine.' }
      ];
    },
    onSave: function (vals, item) {
      vals.size = Number(vals.size) || 0; vals.downloads = Number(vals.downloads) || 0;
      delete vals.upload; delete vals.upload_data;
      if (item.id) { S.update('documents', item.id, vals); S.log('update', 'Documents', 'Updated document "' + vals.title + '"', 'info'); UI.toast('Document updated.', 'Saved', 'ok'); }
      else { vals.id = S.uid('dc'); S.add('documents', vals); S.log('create', 'Documents', 'Added document "' + vals.title + '"', 'ok'); UI.toast('Document added.', 'Created', 'ok'); }
    },
    onAction: function (act, id, h, paint) {
      var doc = S.find('documents', id);
      if (act === 'count') { S.update('documents', id, { downloads: (doc.downloads || 0) + 1 }); UI.toast('Download counter incremented for "' + doc.title + '".', 'Documents', 'info'); return paint(); }
      if (act === 'edit') return C.editor({ title: 'Edit document', subtitle: F.esc(doc.title), icon: 'download', item: doc, fields: V.documents.fields(doc), onSave: function (v, it) { v.size = Number(v.size) || 0; v.downloads = Number(v.downloads) || 0; delete v.upload; S.update('documents', it.id, v); S.log('update', 'Documents', 'Updated "' + v.title + '"', 'info'); UI.toast('Document updated.', 'Saved', 'ok'); paint(); } });
      if (act === 'del') C.del('documents', id, F.esc(doc.title), paint);
    }
  });

  /* =====================================================================
     NEWSLETTER — subscribers & campaigns
     ===================================================================== */
  V.subscribers = C.entity({
    store: 'subscribers', icon: 'send', title: 'Newsletter & Subscribers',
    subtitle: 'Website newsletter sign-ups, interests and campaign performance.',
    segmented: [{ id: 'subs', label: 'Subscribers' }, { id: 'campaigns', label: 'Campaigns' }],
    renderSegment: function (slot, seg, h, paint) {
      if (seg === 'campaigns') return campaigns(slot, paint);
      return subsTable(slot, paint);
    },
    cols: [{ key: 'email', label: 'Email' }]
  });

  function subsTable(slot, paint) {
    var t = UI.dataTable({
      rows: S.list('subscribers'), pageSize: 12, pageSizeOptions: [12, 25, 50],
      searchPlaceholder: 'Search email, name, LGA…',
      search: function (r) { return [r.email, r.name, r.lga, r.interest, r.status, r.source].join(' '); },
      filters: [
        { key: 'status', label: 'Status', options: ['Subscribed', 'Unsubscribed'] },
        { key: 'lga', label: 'LGA', options: S.data.lgas },
        { key: 'interest', label: 'Interest', options: uniq(S.list('subscribers').map(function (s) { return s.interest; })) }
      ],
      createLabel: 'Add subscriber',
      onCreate: function () { subEditor(null, paint); },
      bulk: [
        { id: 'resub', label: 'Re-subscribe', icon: 'check' },
        { id: 'unsub', label: 'Unsubscribe', icon: 'x' },
        { id: 'delete', label: 'Delete', icon: 'trash', cls: 'btn-danger' }
      ],
      onBulk: function (act, ids, done) {
        ids.forEach(function (id) {
          if (act === 'resub') S.update('subscribers', id, { status: 'Subscribed' });
          if (act === 'unsub') S.update('subscribers', id, { status: 'Unsubscribed' });
        });
        S.log('bulk', 'Newsletter', act + ' applied to ' + ids.length + ' subscribers', 'info');
        UI.toast(ids.length + ' subscriber(s) updated.', 'Bulk action', 'ok'); done();
      },
      onCsv: function (rs) {
        UI.download('newsletter-subscribers.csv', UI.toCSV([
          { key: 'email', label: 'Email' }, { key: 'name', label: 'Name' }, { key: 'lga', label: 'LGA' },
          { key: 'interest', label: 'Interest' }, { key: 'status', label: 'Status' }, { key: 'opens', label: 'Opens' },
          { key: 'source', label: 'Source' }, { key: 'joined', label: 'Joined', csv: function (r) { return F.date(r.joined); } }
        ], rs), 'text/csv');
        UI.toast(rs.length + ' subscribers exported.', 'CSV', 'ok');
      },
      cols: [
        {
          key: 'email', label: 'Subscriber', render: function (r) {
            return '<div class="cell-main">' + UI.avatar(r.name, 'avatar-sm g3') +
              '<div class="b"><div class="t1">' + F.esc(r.email) + '</div><div class="t2">' + F.esc(r.name) + ' · ' + F.esc(r.lga) + '</div></div></div>';
          }
        },
        { key: 'interest', label: 'Interest', render: function (r) { return '<span class="badge b-teal">' + F.esc(r.interest) + '</span>'; } },
        { key: 'source', label: 'Source' },
        { key: 'opens', label: 'Opens', align: 'right', render: function (r) { return F.num(r.opens || 0); } },
        { key: 'joined', label: 'Joined', render: function (r) { return F.date(r.joined); } },
        { key: 'status', label: 'Status', render: function (r) { return UI.statusBadge(r.status); } }
      ],
      actions: function (r) { return UI.act('edit', r.id, 'edit', 'Edit') + UI.act('del', r.id, 'trash', 'Delete'); },
      onAction: function (act, id) {
        if (act === 'edit') subEditor(S.find('subscribers', id), paint);
        if (act === 'del') C.del('subscribers', id, F.esc(S.find('subscribers', id).email), paint);
      }
    });
    slot.appendChild(t.el);
    var head = slot.querySelector('.ph-a') || slot;
  }

  function subEditor(item, paint) {
    C.editor({
      title: item ? 'Edit subscriber' : 'Add subscriber', icon: 'send', item: item || {},
      fields: [
        { id: 'email', name: 'email', type: 'email', label: 'Email address', value: item.email, required: true, full: true },
        { id: 'name', name: 'name', label: 'Name', value: item.name },
        { id: 'phone', name: 'phone', type: 'tel', label: 'Phone', value: item.phone },
        { id: 'lga', name: 'lga', type: 'select', label: 'LGA', value: item.lga, options: S.data.lgas, placeholder: 'Select' },
        { id: 'interest', name: 'interest', type: 'select', label: 'Interest', value: item.interest || 'General updates', options: ['General updates', 'Forestry & planting', 'Policy & notices', 'Procurement', 'Research & data'] },
        { id: 'source', name: 'source', type: 'select', label: 'Source', value: item.source || 'Website form', options: ['Website form', 'Import', 'Event sign-up', 'Manual entry'] },
        { id: 'status', name: 'status', type: 'select', label: 'Status', value: item.status || 'Subscribed', options: ['Subscribed', 'Unsubscribed'] }
      ],
      onSave: function (vals, it) {
        if (it.id) { S.update('subscribers', it.id, vals); UI.toast('Subscriber updated.', 'Saved', 'ok'); }
        else { vals.id = S.uid('sb'); vals.joined = today(); vals.opens = 0; S.add('subscribers', vals); S.log('create', 'Newsletter', 'Added subscriber ' + vals.email, 'ok'); UI.toast('Subscriber added.', 'Created', 'ok'); }
        paint();
      }
    });
  }

  function campaigns(slot, paint) {
    var list = S.list('campaigns');
    var totalSent = list.reduce(function (a, b) { return a + (b.recipients || 0); }, 0);
    var totalOpens = list.reduce(function (a, b) { return a + (b.opens || 0); }, 0);
    var totalClicks = list.reduce(function (a, b) { return a + (b.clicks || 0); }, 0);
    slot.innerHTML =
      '<div class="grid g-4 mb-1">' +
      statMini('send', list.length, 'Campaigns') +
      statMini('mail', F.num(totalSent), 'Emails sent') +
      statMini('eye', totalSent ? F.pct((totalOpens / totalSent) * 100) : '0%', 'Average open rate') +
      statMini('activity', totalSent ? F.pct((totalClicks / totalSent) * 100) : '0%', 'Average click rate') +
      '</div>' +
      '<div class="card"><div class="card-h"><div class="ch-t"><span class="ico">' + icon('send', 17) + '</span>' +
      '<div><h3>Campaign history</h3><div class="sub">Broadcasts sent from the console</div></div></div>' +
      '<div class="ch-a"><button class="btn btn-primary btn-sm" data-compose>' + icon('plus', 14) + 'Compose campaign</button></div></div>' +
      '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Campaign</th><th>Audience</th><th>Sent</th><th class="right" style="text-align:right">Recipients</th>' +
      '<th style="text-align:right">Opens</th><th style="text-align:right">Clicks</th><th>Status</th><th style="text-align:right">Actions</th></tr></thead><tbody>' +
      list.map(function (c) {
        var or = c.recipients ? Math.round((c.opens / c.recipients) * 100) : 0;
        return '<tr><td><div class="cell-main"><div class="b"><div class="t1">' + F.esc(c.subject) + '</div><div class="t2">by ' + F.esc(c.by) + '</div></div></div></td>' +
          '<td><span class="badge b-outline">' + F.esc(c.audience) + '</span></td>' +
          '<td class="text-xs">' + (c.sent ? F.date(c.sent) : '—') + '</td>' +
          '<td class="num">' + F.num(c.recipients) + '</td>' +
          '<td class="num">' + F.num(c.opens) + ' <span class="badge b-ok">' + or + '%</span></td>' +
          '<td class="num">' + F.num(c.clicks) + '</td>' +
          '<td>' + UI.statusBadge(c.status) + '</td>' +
          '<td><div class="acts">' + (c.status === 'Draft' ? '<button class="btn btn-ghost btn-xs" data-send="' + c.id + '" title="Send now" aria-label="Send now">' + icon('send', 14) + '</button>' : '') +
          '<button class="btn btn-ghost btn-xs" data-cdel="' + c.id + '" title="Delete" aria-label="Delete" style="color:var(--danger)">' + icon('trash', 14) + '</button></div></td></tr>';
      }).join('') + '</tbody></table></div></div>';

    slot.querySelector('[data-compose]').addEventListener('click', function () { compose(null); });
    slot.querySelectorAll('[data-cdel]').forEach(function (b) {
      b.addEventListener('click', function () { C.del('campaigns', b.dataset.cdel, 'this campaign', paint); });
    });
    slot.querySelectorAll('[data-send]').forEach(function (b) {
      b.addEventListener('click', function () {
        var c = S.find('campaigns', b.dataset.send);
        var subs = S.list('subscribers').filter(function (s) { return s.status === 'Subscribed'; });
        S.update('campaigns', c.id, { status: 'Sent', sent: today(), recipients: subs.length, opens: Math.round(subs.length * 0.62), clicks: Math.round(subs.length * 0.31), bounces: Math.round(subs.length * 0.01) });
        S.log('send', 'Newsletter', 'Sent campaign "' + c.subject + '" to ' + subs.length + ' subscribers', 'ok');
        UI.toast('Campaign sent to ' + subs.length + ' subscribers.', 'Broadcast complete', 'ok');
        paint();
      });
    });

    function compose() {
      var audiences = ['All subscribers', 'General updates', 'Forestry & planting', 'Policy & notices', 'Procurement', 'Research & data'];
      C.editor({
        title: 'Compose campaign', subtitle: 'Draft a broadcast to the newsletter list', icon: 'send', size: 'md',
        fields: [
          { id: 'subject', name: 'subject', label: 'Subject line', required: true, full: true, placeholder: 'Monthly sanitation reminder' },
          { id: 'audience', name: 'audience', type: 'select', label: 'Audience', value: 'All subscribers', options: audiences },
          { id: 'preheader', name: 'preheader', label: 'Preheader text', full: true, placeholder: 'Shown after the subject in most inboxes' },
          { id: 'body', name: 'body', type: 'editor', label: 'Message', full: true },
          { id: 'sendNow', name: 'sendNow', type: 'switch', label: 'Send immediately', hint: 'Leave off to save as a draft.', value: false }
        ],
        saveLabel: 'Save campaign',
        onSave: function (vals) {
          var subs = S.list('subscribers').filter(function (s) { return s.status === 'Subscribed'; });
          var send = vals.sendNow;
          var rec = {
            id: S.uid('cp'), subject: vals.subject, audience: vals.audience,
            sent: send ? today() : '', status: send ? 'Sent' : 'Draft',
            recipients: send ? subs.length : 0, opens: send ? Math.round(subs.length * 0.6) : 0,
            clicks: send ? Math.round(subs.length * 0.29) : 0, bounces: send ? Math.round(subs.length * 0.012) : 0,
            by: (S.currentUser() || {}).name, body: vals.body
          };
          S.add('campaigns', rec);
          S.log(send ? 'send' : 'create', 'Newsletter', (send ? 'Sent' : 'Drafted') + ' campaign "' + rec.subject + '"', send ? 'ok' : 'info');
          UI.toast(send ? 'Campaign sent to ' + rec.recipients + ' subscribers.' : 'Campaign saved as a draft.', send ? 'Broadcast complete' : 'Draft saved', 'ok');
          paint();
        }
      });
    }
  }

  /* =====================================================================
     USERS & ROLES
     ===================================================================== */
  V.users = C.entity({
    store: 'users', icon: 'shield', title: 'Users, Roles & Permissions',
    subtitle: 'Console accounts, role definitions and what each role is allowed to do.',
    segmented: [{ id: 'users', label: 'Accounts' }, { id: 'roles', label: 'Roles & permissions' }],
    createLabel: 'Invite user',
    renderSegment: function (slot, seg, h, paint) {
      if (seg === 'roles') return rolesPanel(slot, paint);
      return usersTable(slot, paint);
    },
    cols: [{ key: 'name', label: 'User' }]
  });

  function usersTable(slot, paint) {
    var t = UI.dataTable({
      rows: S.list('users'), pageSize: 10, selectable: false,
      searchPlaceholder: 'Search users…',
      search: function (r) { return [r.name, r.email, r.role, r.dept, r.status].join(' '); },
      filters: [
        { key: 'role', label: 'Role', options: roleNames() },
        { key: 'status', label: 'Status', options: ['Active', 'Invited', 'Suspended'] }
      ],
      createLabel: 'Invite user',
      onCreate: function () { userEditor(null, paint); },
      onCsv: function (rs) {
        UI.download('console-users.csv', UI.toCSV([
          { key: 'name', label: 'Name' }, { key: 'email', label: 'Email' }, { key: 'role', label: 'Role' },
          { key: 'dept', label: 'Directorate' }, { key: 'phone', label: 'Phone' }, { key: 'status', label: 'Status' },
          { key: 'lastLogin', label: 'Last login', csv: function (r) { return r.lastLogin ? F.dateTime(r.lastLogin) : 'Never'; } }
        ], rs), 'text/csv'); UI.toast('User list exported.', 'CSV', 'ok');
      },
      cols: [
        {
          key: 'name', label: 'User', render: function (r) {
            return '<div class="cell-main">' + UI.avatar(r.name, 'avatar-sm ' + (r.role === 'Super Admin' ? 'g2' : r.role === 'Editor' ? 'g1' : r.role === 'Partner' ? 'g5' : 'g3')) +
              '<div class="b"><div class="t1">' + F.esc(r.name) + (r.id === S.data.currentUser ? ' <span class="badge b-gold" style="margin-left:.3rem">You</span>' : '') + '</div>' +
              '<div class="t2">' + F.esc(r.email) + '</div></div></div>';
          }
        },
        { key: 'role', label: 'Role', render: function (r) { return '<span class="badge ' + (r.role === 'Super Admin' ? 'b-gold' : r.role === 'Editor' ? 'b-green' : 'b-info') + '">' + F.esc(r.role) + '</span>'; } },
        { key: 'dept', label: 'Directorate' },
        { key: 'lastLogin', label: 'Last login', render: function (r) { return '<span class="text-xs">' + (r.lastLogin ? F.ago(r.lastLogin) : 'Never') + '</span>'; }, sortValue: function (r) { return r.lastLogin || ''; } },
        { key: 'status', label: 'Status', render: function (r) { return UI.statusBadge(r.status); } }
      ],
      actions: function (r) {
        return UI.act('edit', r.id, 'edit', 'Edit user') +
          UI.act('suspend', r.id, r.status === 'Suspended' ? 'checkCircle' : 'lock', r.status === 'Suspended' ? 'Reinstate' : 'Suspend') +
          (r.id === S.data.currentUser ? '' : UI.act('del', r.id, 'trash', 'Remove'));
      },
      onAction: function (act, id) {
        var u = S.find('users', id);
        if (act === 'edit') userEditor(u, paint);
        if (act === 'suspend') {
          var to = u.status === 'Suspended' ? 'Active' : 'Suspended';
          S.update('users', id, { status: to });
          S.log(to === 'Suspended' ? 'suspend' : 'reinstate', 'Users', u.name + ' → ' + to, to === 'Suspended' ? 'warn' : 'ok');
          UI.toast(u.name + ' is now ' + to.toLowerCase() + '.', 'Account updated', to === 'Suspended' ? 'warn' : 'ok');
          paint();
        }
        if (act === 'del') C.del('users', id, F.esc(u.name), paint);
      }
    });
    slot.appendChild(t.el);
  }

  function userEditor(item, paint) {
    C.editor({
      title: item ? 'Edit account' : 'Invite a user', icon: 'shield', item: item || {},
      note: item ? '' : 'An invitation email would be sent in a production deployment. This console records the account immediately.',
      fields: [
        { id: 'name', name: 'name', label: 'Full name', value: item.name, required: true },
        { id: 'email', name: 'email', type: 'email', label: 'Official email', value: item.email, required: true },
        { id: 'role', name: 'role', type: 'select', label: 'Role', value: item.role || 'Officer', options: roleNames(), required: true },
        { id: 'dept', name: 'dept', type: 'select', label: 'Directorate', value: item.dept, options: uniq(deptNames().concat(['Office of the Commissioner', 'Office of the Permanent Secretary', 'ACReSAL PIU', 'Admin & Finance'])), placeholder: 'Select' },
        { id: 'phone', name: 'phone', type: 'tel', label: 'Phone', value: item.phone },
        { id: 'status', name: 'status', type: 'select', label: 'Status', value: item.status || 'Active', options: ['Active', 'Invited', 'Suspended'] }
      ],
      saveLabel: item ? 'Save account' : 'Send invitation',
      onSave: function (vals, it) {
        if (it.id) { S.update('users', it.id, vals); S.log('update', 'Users', 'Updated account ' + vals.email, 'info'); UI.toast('Account updated.', 'Saved', 'ok'); }
        else { vals.id = S.uid('u'); vals.lastLogin = ''; vals.created = today(); vals.avatar = ''; S.add('users', vals); S.log('invite', 'Users', 'Invited ' + vals.email + ' as ' + vals.role, 'ok'); UI.toast('Invitation recorded for ' + vals.email + '.', 'User invited', 'ok'); }
        paint();
      }
    });
  }

  function rolesPanel(slot, paint) {
    var permDefs = [
      ['dashboard', 'Dashboard', 'View KPIs, charts and the activity feed'],
      ['content', 'Content editing', 'Create and edit news, pages, projects and services'],
      ['publish', 'Publish', 'Push content live on the public website'],
      ['enquiries', 'Enquiries', 'Read and respond to public submissions'],
      ['permits', 'Permits', 'Process applications and record decisions'],
      ['media', 'Media', 'Upload, edit and delete library assets'],
      ['analytics', 'Analytics', 'View traffic and engagement reports'],
      ['users', 'User management', 'Invite accounts and change roles'],
      ['settings', 'Settings', 'Change site configuration and branding'],
      ['audit', 'Audit log', 'Read the full activity log']
    ];
    slot.innerHTML =
      '<div class="note mb-1">' + icon('shield', 17) + '<div><b>Role-based access control.</b> Permissions apply the moment a role is changed — the navigation and action buttons adapt for anyone signed in with that role.</div></div>' +
      '<div class="card"><div class="card-h"><div class="ch-t"><span class="ico">' + icon('key', 17) + '</span>' +
      '<div><h3>Roles & permissions</h3><div class="sub">' + S.list('roles').length + ' roles · ' + S.list('users').length + ' accounts</div></div></div>' +
      '<div class="ch-a"><button class="btn btn-primary btn-sm" data-newrole>' + icon('plus', 14) + 'New role</button></div></div>' +
      '<div class="tbl-wrap"><table class="tbl" style="min-width:820px"><thead><tr><th>Permission</th>' +
      S.list('roles').map(function (r) { return '<th style="text-align:center">' + F.esc(r.name) + '</th>'; }).join('') +
      '</tr></thead><tbody>' +
      permDefs.map(function (pd) {
        return '<tr><td><b style="color:var(--ink)">' + pd[1] + '</b><div class="text-xs text-muted">' + pd[2] + '</div></td>' +
          S.list('roles').map(function (r) {
            return '<td style="text-align:center"><label class="switch" style="justify-content:center"><input type="checkbox" data-perm="' + pd[0] + '" data-role="' + r.id + '"' + (r.perms[pd[0]] ? ' checked' : '') + ' aria-label="' + pd[1] + ' for ' + F.esc(r.name) + '"><span class="track"></span></label></td>';
          }).join('') + '</tr>';
      }).join('') + '</tbody></table></div>' +
      '<div class="card-f"><span class="text-xs">' + S.list('roles').map(function (r) {
        var n = S.list('users').filter(function (u) { return u.role === r.name; }).length;
        return '<b>' + F.esc(r.name) + '</b>: ' + n + ' account' + (n === 1 ? '' : 's');
      }).join(' · ') + '</span></div></div>' +
      '<div class="grid g-2 mt-1">' + S.list('roles').map(function (r) {
        return '<div class="card card-pad"><div class="flex gap aic mb-1">' +
          '<span class="avatar avatar-sm ' + (r.level === 1 ? 'g2' : r.level === 2 ? 'g1' : 'g3') + '">' + icon('shield', 15) + '</span>' +
          '<div style="flex:1"><b style="color:var(--ink)">' + F.esc(r.name) + '</b><div class="text-xs text-muted">Level ' + r.level + ' · ' + S.list('users').filter(function (u) { return u.role === r.name; }).length + ' account(s)</div></div>' +
          '<button class="btn btn-ghost btn-xs" data-editrole="' + r.id + '" aria-label="Edit ' + F.esc(r.name) + '">' + icon('edit', 14) + '</button></div>' +
          '<p class="text-sm text-muted mb-0">' + F.esc(r.desc) + '</p></div>';
      }).join('') + '</div>';

    slot.addEventListener('change', function (e) {
      var p = e.target.closest('[data-perm]');
      if (!p) return;
      var role = S.find('roles', p.dataset.role);
      role.perms[p.dataset.perm] = p.checked;
      S.save();
      S.log('settings', 'Users', (p.checked ? 'Granted' : 'Revoked') + ' "' + p.dataset.perm + '" for role ' + role.name, 'warn');
      UI.toast(role.name + ' can ' + (p.checked ? 'now' : 'no longer') + ' use ' + p.dataset.perm + '.', 'Permission updated', p.checked ? 'ok' : 'warn');
    });
    slot.querySelectorAll('[data-redit]').forEach(function (b) { b.addEventListener('click', function () { editRole(S.list('roles')[0], paint); }); });
    slot.querySelectorAll('[data-editrole]').forEach(function (b) { b.addEventListener('click', function () { editRole(S.find('roles', b.dataset.editrole), paint); }); });
    var nr = slot.querySelector('[data-newrole]');
    if (nr) nr.addEventListener('click', function () { editRole(null, paint); });
  }

  function editRole(role, paint) {
    C.editor({
      title: role ? 'Edit role' : 'New role', icon: 'key', item: role || {}, size: 'sm',
      fields: [
        { id: 'name', name: 'name', label: 'Role name', value: role && role.name, required: true, full: true },
        { id: 'level', name: 'level', type: 'number', label: 'Seniority level', value: (role && role.level) || S.list('roles').length + 1, min: 1, max: 20 },
        { id: 'desc', name: 'desc', type: 'textarea', label: 'Description', value: role && role.desc, rows: 3, full: true }
      ],
      onSave: function (vals, it) {
        vals.level = Number(vals.level) || 1;
        if (it.id) {
          var oldName = it.name;
          S.update('roles', it.id, vals);
          if (oldName !== vals.name) {
            S.list('users').forEach(function (u) { if (u.role === oldName) S.update('users', u.id, { role: vals.name }); });
          }
          S.log('update', 'Users', 'Updated role "' + vals.name + '"', 'warn');
          UI.toast('Role updated.', 'Saved', 'ok');
        } else {
          vals.id = S.uid('r'); vals.users = 0;
          vals.perms = { dashboard: 1, content: 0, publish: 0, enquiries: 0, permits: 0, media: 0, users: 0, settings: 0, analytics: 0, audit: 0 };
          S.add('roles', vals);
          S.log('create', 'Users', 'Created role "' + vals.name + '"', 'ok');
          UI.toast('Role created — set its permissions in the matrix.', 'New role', 'ok');
        }
        paint();
      }
    });
  }

  /* =====================================================================
     AUDIT LOG
     ===================================================================== */
  V.audit = function (host) {
    var state = { q: '', module: 'all', level: 'all' };
    function paint() {
      var logs = S.list('logs').slice();
      if (state.module !== 'all') logs = logs.filter(function (l) { return l.module === state.module; });
      if (state.level !== 'all') logs = logs.filter(function (l) { return l.level === state.level; });
      if (state.q) logs = logs.filter(function (l) { return [l.user, l.action, l.module, l.detail].join(' ').toLowerCase().indexOf(state.q.toLowerCase()) > -1; });
      var modules = uniq(S.list('logs').map(function (l) { return l.module; })).sort();

      host.innerHTML =
        '<div class="page-head"><div class="ph-t"><h2>' + icon('history', 20) + ' Audit Log & Activity</h2>' +
        '<p>A tamper-evident record of everything done in the console — who changed what, when, and the outcome.</p></div>' +
        '<div class="ph-a"><button class="btn btn-outline" data-export>' + icon('download', 15) + 'Export log</button>' +
        '<button class="btn btn-outline" data-print>' + icon('printer', 15) + 'Print</button>' +
        '<button class="btn btn-danger" data-clear>' + icon('trash', 15) + 'Clear log</button></div></div>' +
        '<div class="grid g-4 mb-1">' +
        statMini('history', F.num(S.list('logs').length), 'Entries') +
        statMini('users2', uniq(S.list('logs').map(function (l) { return l.user; })).length, 'Actors') +
        statMini('checkCircle', S.list('logs').filter(function (l) { return l.level === 'ok'; }).length, 'Successes') +
        statMini('alert', S.list('logs').filter(function (l) { return l.level === 'danger' || l.level === 'warn'; }).length, 'Warnings & errors') +
        '</div>' +
        '<div class="card"><div class="toolbar">' +
        '<div class="search">' + icon('search', 15) + '<input type="search" data-q placeholder="Search the log…" value="' + F.esc(state.q) + '" aria-label="Search audit log"></div>' +
        '<select data-mod aria-label="Filter by module"><option value="all">All modules</option>' + modules.map(function (m) { return '<option' + (state.module === m ? ' selected' : '') + '>' + F.esc(m) + '</option>'; }).join('') + '</select>' +
        '<select data-lvl aria-label="Filter by level"><option value="all">All levels</option>' +
        ['info', 'ok', 'warn', 'danger'].map(function (l) { return '<option value="' + l + '"' + (state.level === l ? ' selected' : '') + '>' + l + '</option>'; }).join('') + '</select>' +
        '<div class="grow"></div><span class="text-xs text-muted">' + logs.length + ' entries</span></div>' +
        '<div class="card-pad scroll-y" style="max-height:none">' +
        (logs.length ? logs.map(function (l) {
          var ic = { info: 'info', ok: 'checkCircle', warn: 'alert', danger: 'xCircle' }[l.level] || 'info';
          var tone = { info: '', ok: '', warn: 'gold', danger: 'danger' }[l.level] || '';
          return '<div class="feed-item ' + tone + '"><span class="fi-ico">' + icon(ic, 15) + '</span>' +
            '<div class="fi-b"><p><b>' + F.esc(l.user) + '</b> <span class="badge b-outline">' + F.esc(l.action) + '</span> ' + F.esc(l.detail) + '</p>' +
            '<div class="fi-t">' + icon('clock', 12) + ' ' + F.dateTime(l.at) + ' (' + F.ago(l.at) + ') · ' + icon('folder', 12) + ' ' + F.esc(l.module) + '</div></div></div>';
        }).join('') : '<div class="empty">' + icon('history', 44) + '<div class="t1">No log entries match</div><div class="t2">Adjust the filters above.</div></div>') +
        '</div></div>';
    }

    host.addEventListener('click', function (e) {
      if (e.target.closest('[data-export]')) {
        UI.download('audit-log-' + today() + '.csv', UI.toCSV([
          { key: 'at', label: 'Timestamp', csv: function (r) { return F.dateTime(r.at); } },
          { key: 'user', label: 'User' }, { key: 'action', label: 'Action' }, { key: 'module', label: 'Module' },
          { key: 'level', label: 'Level' }, { key: 'detail', label: 'Detail' }
        ], S.list('logs')), 'text/csv');
        UI.toast('Audit log exported.', 'CSV', 'ok');
      }
      if (e.target.closest('[data-print]')) window.print();
      if (e.target.closest('[data-clear]')) {
        UI.confirm({ title: 'Clear the audit log?', message: 'All <b>' + S.list('logs').length + '</b> entries will be permanently removed. Exports already downloaded are unaffected.', okText: 'Clear log' }).then(function (y) {
          if (!y) return;
          S.data.logs = []; S.save();
          S.log('delete', 'Audit', 'Audit log cleared by ' + (S.currentUser() || {}).name, 'danger');
          UI.toast('Audit log cleared.', 'Security', 'warn'); paint();
        });
      }
    });
    host.addEventListener('input', function (e) {
      var q = e.target.closest('[data-q]');
      if (q) { state.q = q.value; paint(); var n = host.querySelector('[data-q]'); n.focus(); n.setSelectionRange(n.value.length, n.value.length); }
    });
    host.addEventListener('change', function (e) {
      var m = e.target.closest('[data-mod]'); if (m) { state.module = m.value; return paint(); }
      var l = e.target.closest('[data-lvl]'); if (l) { state.level = l.value; return paint(); }
    });
    paint();
  };

  global.AdminViews = V;
})(window);
