/* =====================================================================
   Gombe State Ministry of Environment & Forest Resources
   ADMIN CONSOLE — crud.js
   Generic record editor, entity list view and inline collection manager.
   ===================================================================== */
(function (global) {
  'use strict';

  var S = global.AdminStore;
  var UI = global.UI;
  var F = UI.F;
  var icon = UI.icon;

  /* ---------------------------------------------------------------------
     Record editor modal
     cfg: { title, subtitle, icon, size, item, fields:[fieldCfg]|fn(item),
            onSave(values,item), saveLabel, note }
  --------------------------------------------------------------------- */
  function openEditor(cfg) {
    var item = cfg.item || {};
    var fields = typeof cfg.fields === 'function' ? cfg.fields(item) : cfg.fields;
    var body = (cfg.note ? '<div class="note mb-1">' + icon('info', 17) + '<div>' + cfg.note + '</div></div>' : '') +
      UI.form(fields.map(UI.field), { cols: cfg.cols });

    var m = UI.modal({
      title: cfg.title || (item.id ? 'Edit record' : 'New record'),
      subtitle: cfg.subtitle || '',
      icon: cfg.icon || 'edit',
      size: cfg.size || 'md',
      body: body,
      footer: '<span class="left">' + (cfg.footerNote || '') + '</span>' +
        '<button class="btn" data-close>Cancel</button>' +
        '<button class="btn btn-primary" data-save>' + icon('save', 15) + F.esc(cfg.saveLabel || 'Save changes') + '</button>',
      onOpen: function (api) {
        UI.wireFields(api.el);
        /* live file preview for image inputs */
        api.el.querySelectorAll('[data-drop]').forEach(function (dz) {
          var inp = dz.querySelector('input[type=file]');
          inp.addEventListener('change', function () {
            var f = inp.files && inp.files[0];
            if (!f) return;
            if (f.size > 4 * 1024 * 1024) {
              UI.toast('Files above 4 MB are resized before they are stored in the browser.', 'Large file', 'warn');
            }
            var fr = new FileReader();
            fr.onload = function () {
              var img = document.createElement('img');
              img.src = fr.result;
              img.alt = '';
              img.style.cssText = 'max-height:110px;margin:.6rem auto 0;border-radius:8px;display:block';
              var old = dz.querySelector('img');
              if (old) old.remove();
              dz.appendChild(img);
              dz.dataset.value = fr.result;
            };
            fr.readAsDataURL(f);
          });
        });
        api.el.querySelector('[data-save]').addEventListener('click', function () {
          var formEl = api.el.querySelector('[data-form]');
          if (!UI.validate(formEl)) { UI.toast('Please complete the highlighted fields.', 'Check the form', 'err'); return; }
          var vals = UI.readForm(formEl);
          /* attach uploaded file data if present */
          formEl.querySelectorAll('[data-drop]').forEach(function (dz) {
            if (dz.dataset.value) {
              var inp = dz.querySelector('input[type=file]');
              if (inp && inp.name) vals[inp.name + '_data'] = dz.dataset.value;
            }
          });
          var done = cfg.onSave(vals, item, api);
          if (done !== false) api.close();
        });
      }
    });
    return m;
  }

  /* ---------------------------------------------------------------------
     Confirm + delete helper
  --------------------------------------------------------------------- */
  function confirmDelete(store, ids, label, after) {
    var names = Array.isArray(ids) ? ids : [ids];
    return UI.confirm({
      title: 'Delete ' + (names.length > 1 ? names.length + ' records' : 'record') + '?',
      message: 'You are about to permanently remove <b>' + (label || names.length + ' item(s)') +
        '</b> from the console. This cannot be undone.',
      okText: 'Delete permanently',
      icon: 'trash'
    }).then(function (yes) {
      if (!yes) return false;
      S.remove(store, names);
      S.log('delete', store, 'Deleted ' + names.length + ' record(s): ' + names.join(', '), 'danger');
      UI.toast(names.length + ' record(s) deleted.', 'Deleted', 'ok');
      if (after) after();
      return true;
    });
  }

  /* ---------------------------------------------------------------------
     Entity view: page head + data table + editor + detail drawer
     cfg: {
       store, title, subtitle, icon, createLabel,
       cols:[], filters:[], bulk:[], pageSize,
       fields(item), onSave(vals,item,close), onRow(id, helpers),
       actions(id) -> html, onAction(act,id,helpers),
       kpis: [{label,value,icon,tone,sub}], segmented:[{id,label}],
       search(row)->str, csvName, extra(node)
     }
  --------------------------------------------------------------------- */
  function entityView(cfg) {
    /* expose the config on the returned view so other code can reuse
       cfg.fields(item) when opening an editor from a drawer or action. */
    var autoCreate = null;
    if (!cfg.onCreate && cfg.fields) {
      autoCreate = function (helpers, paint) {
        openEditor({
          title: cfg.createTitle || cfg.createLabel || ('New ' + (cfg.singular || 'record')),
          subtitle: cfg.createSubtitle || '',
          icon: cfg.icon, size: cfg.editorSize || (cfg.size || 'md'), item: {},
          fields: typeof cfg.fields === 'function' ? cfg.fields({}) : cfg.fields,
          onSave: function (vals, it, api) {
            var r = cfg.onSave(vals, it, api);
            paint();
            return r;
          }
        });
      };
    }
    var view = function (host, helpers) {
      var rows = function () { return S.list(cfg.store).slice().sort(byOrder(cfg.store)); };
      var segment = cfg.defaultSegment || (cfg.segmented && cfg.segmented[0].id);

      function byOrder() {
        return function (a, b) {
          if (a.order != null && b.order != null) return a.order - b.order;
          return 0;
        };
      }

      function paint() {
        var kpis = cfg.kpis ? '<div class="grid g-4 mb-1">' + cfg.kpis().map(function (k) {
          return '<div class="stat-mini"><span class="sm-ico">' + icon(k.icon, 17) + '</span>' +
            '<span><span class="v">' + k.value + '</span><span class="l">' + F.esc(k.label) + '</span></span></div>';
        }).join('') + '</div>' : '';

        var seg = cfg.segmented ? '<div class="seg mb-1" role="tablist">' + cfg.segmented.map(function (s) {
          return '<button role="tab" data-seg="' + s.id + '" class="' + (s.id === segment ? 'active' : '') + '">' + F.esc(s.label) + '</button>';
        }).join('') + '</div>' : '';

        host.innerHTML =
          '<div class="page-head"><div class="ph-t"><h2>' + icon(cfg.icon, 20) + ' ' + F.esc(cfg.title) + '</h2>' +
          '<p>' + F.esc(cfg.subtitle || '') + '</p></div>' +
          '<div class="ph-a">' + (cfg.headActions || '') + '</div></div>' +
          kpis + seg + '<div data-host></div>';

        host.querySelectorAll('[data-seg]').forEach(function (b) {
          b.addEventListener('click', function () { segment = b.dataset.seg; paint(); });
        });
        (cfg.headActionHandler || function () { })(host);

        var slot = host.querySelector('[data-host]');
        if (cfg.segmented && cfg.renderSegment) {
          cfg.renderSegment(slot, segment, helpers, paint);
        } else {
          var t = UI.dataTable({
            rows: rows(),
            cols: cfg.cols,
            idKey: 'id',
            pageSize: cfg.pageSize || 8,
            pageSizeOptions: [8, 15, 30, 60],
            searchPlaceholder: cfg.searchPlaceholder || 'Search…',
            search: cfg.search,
            filters: cfg.filters,
            selectable: cfg.selectable !== false,
            bulkActions: cfg.bulk || [],
            createLabel: cfg.createLabel || 'New',
            onCreate: cfg.onCreate ? function () { cfg.onCreate(helpers, paint); } : (autoCreate ? function () { autoCreate(helpers, paint); } : null),
            onRow: cfg.onRow ? function (id) { cfg.onRow(id, helpers, paint); } : null,
            actions: cfg.actions ? function (row) { return cfg.actions(row, helpers, paint); } : null,
            onAction: cfg.onAction ? function (act, id) { cfg.onAction(act, id, helpers, paint); } : null,
            onBulk: function (act, ids, done) {
              if (act === 'delete') {
                confirmDelete(cfg.store, ids, ids.length + ' record(s)', function () { done(); paint(); });
              } else if (cfg.onBulk) {
                cfg.onBulk(act, ids, done, paint);
              } else done();
            },
            onCsv: function (rs) {
              UI.download((cfg.csvName || cfg.store) + '-' + new Date().toISOString().slice(0, 10) + '.csv',
                UI.toCSV(cfg.cols.filter(function (c) { return c.key; }), rs), 'text/csv;charset=utf-8');
              UI.toast(rs.length + ' rows exported to CSV.', 'Export ready', 'ok');
            },
            emptyTitle: cfg.emptyTitle, emptyText: cfg.emptyText, emptyIcon: cfg.emptyIcon,
            toolbarExtra: cfg.toolbarExtra
          });
          slot.appendChild(t.el);
          UI.charts.animateBars(host);
        }
      }
      paint();
    };
    /* expose cfg.fields so drawers/actions can reopen the same editor */
    view.fields = typeof cfg.fields === 'function' ? cfg.fields : function () { return cfg.fields || []; };
    view.cfg = cfg;
    return view;
  }

  /* ---------------------------------------------------------------------
     Inline collection manager (used for hero slides, milestones, quick
     links, counters, FAQs, fee rows, application steps, agencies…)
     cfg: { store, title, subtitle, icon, fields(item), row(item), itemLabel(item) }
  --------------------------------------------------------------------- */
  function manager(host, cfg) {
    var list = function () { return S.list(cfg.store).slice().sort(function (a, b) { return (a.order || 0) - (b.order || 0); }); };

    function paint() {
      var items = list();
      host.innerHTML =
        '<div class="card">' +
        '<div class="card-h"><div class="ch-t"><span class="ico">' + icon(cfg.icon, 17) + '</span>' +
        '<div><h3>' + F.esc(cfg.title) + '</h3><div class="sub">' + F.esc(cfg.subtitle || '') + '</div></div></div>' +
        '<div class="ch-a"><button class="btn btn-primary btn-sm" data-add>' + icon('plus', 14) + 'Add</button></div></div>' +
        (items.length ? '<div class="tbl-wrap"><table class="tbl"><tbody>' + items.map(function (it, i) {
          return '<tr data-id="' + F.esc(it.id) + '">' + cfg.row(it) +
            '<td><div class="acts">' +
            '<span class="order-btns">' +
            '<button class="btn btn-ghost btn-xs" data-mv="-1" data-id="' + it.id + '" title="Move up" aria-label="Move up"' + (i === 0 ? ' disabled' : '') + '>' + icon('chevronUp', 13) + '</button>' +
            '<button class="btn btn-ghost btn-xs" data-mv="1" data-id="' + it.id + '" title="Move down" aria-label="Move down"' + (i === items.length - 1 ? ' disabled' : '') + '>' + icon('chevronDown', 13) + '</button></span>' +
            '<button class="btn btn-ghost btn-xs" data-ed="' + it.id + '" title="Edit" aria-label="Edit">' + icon('edit', 14) + '</button>' +
            '<button class="btn btn-ghost btn-xs" data-del="' + it.id + '" title="Delete" aria-label="Delete" style="color:var(--danger)">' + icon('trash', 14) + '</button>' +
            '</div></td></tr>';
        }).join('') + '</tbody></table></div>'
          : '<div class="empty">' + icon('layers', 44) + '<div class="t1">No entries yet</div><div class="t2">' + F.esc(cfg.emptyText || 'Add the first entry to publish it on the website.') + '</div><button class="btn btn-primary" data-add>' + icon('plus', 15) + 'Add entry</button></div>') +
        '</div>';

      host.querySelectorAll('[data-add]').forEach(function (b) { b.addEventListener('click', function () { edit(null); }); });
      host.querySelectorAll('[data-ed]').forEach(function (b) { b.addEventListener('click', function () { edit(S.find(cfg.store, b.dataset.ed)); }); });
      host.querySelectorAll('[data-del]').forEach(function (b) {
        b.addEventListener('click', function () {
          var it = S.find(cfg.store, b.dataset.del);
          confirmDelete(cfg.store, b.dataset.del, F.esc(cfg.itemLabel ? cfg.itemLabel(it) : 'this entry'), paint);
        });
      });
      host.querySelectorAll('[data-mv]').forEach(function (b) {
        b.addEventListener('click', function () { S.move(cfg.store, b.dataset.id, parseInt(b.dataset.mv, 10)); paint(); });
      });
      if (cfg.onReady) cfg.onReady(host, paint);
    }

    function edit(item) {
      openEditor({
        title: item ? 'Edit ' + (cfg.singular || 'entry') : 'New ' + (cfg.singular || 'entry'),
        subtitle: cfg.editorSubtitle || '',
        icon: cfg.icon,
        size: cfg.size || 'md',
        item: item,
        fields: typeof cfg.fields === 'function' ? cfg.fields(item) : cfg.fields,
        onSave: function (vals, it) {
          var order = S.list(cfg.store).length + 1;
          if (it && it.id) {
            S.update(cfg.store, it.id, vals);
            S.log('update', cfg.module || cfg.store, 'Updated "' + (cfg.itemLabel ? cfg.itemLabel(vals) : vals.title || vals.name || it.id) + '"', 'info');
            UI.toast('Changes saved.', 'Updated', 'ok');
          } else {
            vals.order = order;
            S.add(cfg.store, vals);
            S.log('create', cfg.module || cfg.store, 'Added "' + (cfg.itemLabel ? cfg.itemLabel(vals) : vals.title || vals.name) + '"', 'ok');
            UI.toast('Entry added.', 'Created', 'ok');
          }
          paint();
        }
      });
    }
    paint();
    return { repaint: paint };
  }

  /* ---------------------------------------------------------------------
     Detail drawer — generic record viewer
     cfg: { title, subtitle, icon, body, footer }
  --------------------------------------------------------------------- */
  function detail(cfg) {
    return UI.drawer({
      title: cfg.title, subtitle: cfg.subtitle, icon: cfg.icon,
      body: cfg.body, footer: cfg.footer, onOpen: cfg.onOpen, onClose: cfg.onClose
    });
  }

  /* key/value list renderer */
  function kv(pairs) {
    return '<div class="kv">' + pairs.filter(Boolean).map(function (p) {
      return '<div class="kv-row"><span class="k">' + F.esc(p[0]) + '</span><span class="v">' + (p[2] === 'raw' ? p[1] : F.esc(p[1] == null || p[1] === '' ? '—' : p[1])) + '</span></div>';
    }).join('') + '</div>';
  }

  global.Crud = { editor: openEditor, entity: entityView, manager: manager, detail: detail, del: confirmDelete, kv: kv };
})(window);
