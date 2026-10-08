/* =====================================================================
   Gombe State Ministry of Environment & Forest Resources
   ADMIN CONSOLE — ui.js
   Icons, formatters, toasts, modals, drawers, data tables and
   dependency-free SVG charts.
   ===================================================================== */
(function (global) {
  'use strict';

  /* =====================================================================
     1. ICONS  (24x24 stroke set)
     ===================================================================== */
  var P = {
    dashboard: '<rect x="3" y="3" width="7.5" height="7.5" rx="1.5"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5"/>',
    news: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',
    pages: '<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>',
    projects: '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
    departments: '<path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 10h.01M9 14h.01M9 18h.01M15 10h.01M15 14h.01M15 18h.01"/>',
    staff: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    services: '<line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>',
    media: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>',
    gallery: '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>',
    mail: '<path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/><polyline points="22 6 12 13 2 6"/>',
    inbox: '<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
    alert: '<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
    clipboard: '<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
    analytics: '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',
    pie: '<path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/>',
    lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',
    search: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
    bell: '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>',
    plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
    minus: '<line x1="5" y1="12" x2="19" y2="12"/>',
    edit: '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z"/>',
    trash: '<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/>',
    eye: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
    filter: '<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>',
    chevronLeft: '<polyline points="15 18 9 12 15 6"/>',
    chevronRight: '<polyline points="9 18 15 12 9 6"/>',
    chevronDown: '<polyline points="6 9 12 15 18 9"/>',
    chevronUp: '<polyline points="18 15 12 9 6 15"/>',
    x: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
    check: '<polyline points="20 6 9 17 4 12"/>',
    menu: '<line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>',
    sun: '<circle cx="12" cy="12" r="4.5"/><line x1="12" y1="1" x2="12" y2="3.5"/><line x1="12" y1="20.5" x2="12" y2="23"/><line x1="4.2" y1="4.2" x2="6" y2="6"/><line x1="18" y1="18" x2="19.8" y2="19.8"/><line x1="1" y1="12" x2="3.5" y2="12"/><line x1="20.5" y1="12" x2="23" y2="12"/><line x1="4.2" y1="19.8" x2="6" y2="18"/><line x1="18" y1="6" x2="19.8" y2="4.2"/>',
    moon: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>',
    printer: '<polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
    refresh: '<polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>',
    star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
    clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    pin: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
    phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
    external: '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>',
    save: '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>',
    copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    arrowUp: '<line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>',
    arrowDown: '<line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>',
    arrowLeft: '<line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>',
    arrowRight: '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>',
    more: '<circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/><circle cx="5" cy="12" r="1.6"/>',
    db: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>',
    leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>',
    tree: '<path d="M12 22v-6"/><path d="M12 16c-4 0-6.5-2.4-6.5-5.6 0-3.7 3-6.4 6.5-8.4 3.5 2 6.5 4.7 6.5 8.4C18.5 13.6 16 16 12 16z"/><path d="M8 22h8"/>',
    droplet: '<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>',
    globe: '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
    layers: '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>',
    tag: '<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>',
    folder: '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>',
    activity: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
    trendingUp: '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>',
    trendingDown: '<polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/>',
    info: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
    checkCircle: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
    xCircle: '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>',
    home: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
    award: '<circle cx="12" cy="8" r="6"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>',
    card: '<rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>',
    send: '<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>',
    reply: '<polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/>',
    archive: '<polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/>',
    monitor: '<rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>',
    smartphone: '<rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>',
    expand: '<path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>',
    sidebar: '<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/>',
    percent: '<line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>',
    hash: '<line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/>',
    list: '<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>',
    columns: '<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="3" x2="12" y2="21"/>',
    flag: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>',
    compass: '<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>',
    thermometer: '<path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/>',
    wind: '<path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/>',
    rain: '<path d="M16 13v5M8 13v5M12 15v5"/><path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
    bold: '<path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>',
    italic: '<line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/>',
    underline: '<path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"/><line x1="4" y1="21" x2="20" y2="21"/>',
    ulist: '<line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="5" cy="6" r="1"/><circle cx="5" cy="12" r="1"/><circle cx="5" cy="18" r="1"/>',
    olist: '<line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1v4M4 10h2M6 16.5c0-.8-.7-1.5-1.5-1.5S3 15.7 3 16.5 3.7 18 4.5 18H6v-3"/>',
    quote: '<path d="M3 21c3 0 7-1 7-8V5H3v7h4c0 4-2 5-4 5z"/><path d="M14 21c3 0 7-1 7-8V5h-7v7h4c0 4-2 5-4 5z"/>',
    filePlus: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/>',
    zap: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
    key: '<path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3"/>',
    scale: '<path d="M12 3v18"/><path d="M7 21h10"/><path d="M3 8l4-2 4 2-4 6z"/><path d="M13 8l4-2 4 2-4 6z"/>',
    target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
    users2: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/>',
    bin: '<path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M6 6l1 14h10l1-14"/><path d="M10 11v5M14 11v5"/>',
    handshake: '<path d="M11 17l2 2a1 1 0 0 0 1.4 0l3.6-3.6"/><path d="M2 12l4-4 4 3 2-2 4 3 4-4"/><path d="M6 8v8l4 4"/>',
    book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
    doc: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>',
    badge: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M15 8h3M15 12h3M6 16h12"/>',
    wave: '<path d="M2 12c2-3 4-3 6 0s4 3 6 0 4-3 6 0"/><path d="M2 18c2-3 4-3 6 0s4 3 6 0 4-3 6 0"/><path d="M2 6c2-3 4-3 6 0s4 3 6 0 4-3 6 0"/>',
    chart2: '<path d="M3 3v18h18"/><path d="M7 15l4-5 3 3 5-7"/>',
    grid2: '<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/>',
    package: '<line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>',
    history: '<path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8"/><polyline points="12 7 12 12 15.5 14"/>',
    sliders: '<line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>'
  };

  function icon(name, size, cls) {
    var path = P[name] || P.info;
    var filled = ['star', 'zap', 'flag'].indexOf(name) > -1;
    return '<svg viewBox="0 0 24 24" width="' + (size || 18) + '" height="' + (size || 18) + '"' +
      (cls ? ' class="' + cls + '"' : '') + ' fill="' + (filled ? 'currentColor' : 'none') +
      '" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + path + '</svg>';
  }

  /* crest used by the public site, reused in the console */
  var CREST = '<svg class="crest" viewBox="0 0 64 64" role="img" aria-label="Gombe State coat of arms">' +
    '<defs><linearGradient id="acg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1e9d5c"/><stop offset="1" stop-color="#06391f"/></linearGradient></defs>' +
    '<path d="M32 2 60 11v22c0 15-11.7 25-28 29C15.7 58 4 48 4 33V11z" fill="url(#acg)" stroke="#d9a520" stroke-width="2.5"/>' +
    '<path d="M32 50V27" stroke="#f0c14b" stroke-width="3.4" stroke-linecap="round"/>' +
    '<path d="M32 33c-8 0-13.5-5.4-13.5-11.7 4.5 1.8 9.9 2.3 13.5 5 3.6-2.7 9-3.2 13.5-5C45.5 27.6 40 33 32 33z" fill="#e7f4ec"/>' +
    '<circle cx="32" cy="16" r="3.4" fill="#f0c14b"/></svg>';

  /* =====================================================================
     2. FORMATTERS
     ===================================================================== */
  var F = {
    esc: function (s) {
      return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
      });
    },
    num: function (n, dec) {
      n = Number(n) || 0;
      return n.toLocaleString('en-NG', { minimumFractionDigits: dec || 0, maximumFractionDigits: dec || 0 });
    },
    compact: function (n) {
      n = Number(n) || 0;
      var a = Math.abs(n);
      if (a >= 1e9) return (n / 1e9).toFixed(a >= 1e10 ? 0 : 1) + 'B';
      if (a >= 1e6) return (n / 1e6).toFixed(a >= 1e7 ? 0 : 1) + 'M';
      if (a >= 1e3) return (n / 1e3).toFixed(a >= 1e4 ? 0 : 1) + 'K';
      return String(Math.round(n));
    },
    naira: function (n) {
      n = Number(n) || 0;
      return '₦' + F.num(n);
    },
    nairaShort: function (n) {
      n = Number(n) || 0;
      if (n >= 1e9) return '₦' + (n / 1e9).toFixed(2) + 'B';
      if (n >= 1e6) return '₦' + (n / 1e6).toFixed(1) + 'M';
      if (n >= 1e3) return '₦' + (n / 1e3).toFixed(0) + 'K';
      return '₦' + n;
    },
    bytes: function (b) {
      b = Number(b) || 0;
      if (b >= 1048576) return (b / 1048576).toFixed(1) + ' MB';
      if (b >= 1024) return (b / 1024).toFixed(0) + ' KB';
      return b + ' B';
    },
    date: function (iso, opt) {
      if (!iso) return '—';
      var dt = new Date(iso);
      if (isNaN(dt)) return '—';
      return dt.toLocaleDateString('en-GB', opt || { day: 'numeric', month: 'short', year: 'numeric' });
    },
    dateShort: function (iso) {
      if (!iso) return '—';
      var dt = new Date(iso); if (isNaN(dt)) return '—';
      return dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    },
    time: function (iso) {
      if (!iso) return '';
      var dt = new Date(iso); if (isNaN(dt)) return '';
      return dt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    },
    dateTime: function (iso) { return F.date(iso) + ', ' + F.time(iso); },
    ago: function (iso) {
      if (!iso) return 'never';
      var t = new Date(iso).getTime();
      if (isNaN(t)) return '—';
      var s = (Date.now() - t) / 1000;
      if (s < 0) return 'in ' + F.ago(new Date(Date.now() + s * 2000).toISOString()).replace('in ', '');
      if (s < 60) return 'just now';
      if (s < 3600) return Math.floor(s / 60) + 'm ago';
      if (s < 86400) return Math.floor(s / 3600) + 'h ago';
      if (s < 604800) return Math.floor(s / 86400) + 'd ago';
      if (s < 2592000) return Math.floor(s / 604800) + 'w ago';
      return F.date(iso);
    },
    initials: function (name) {
      if (!name) return '?';
      var parts = String(name).replace(/(Hon\.|Mrs\.|Mr\.|Dr\.|Alh\.|Mall\.)/gi, '').trim().split(/\s+/);
      if (!parts.length || !parts[0]) return '?';
      return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
    },
    pct: function (n) { return (Math.round(Number(n) || 0)) + '%'; },
    slug: function (s) {
      return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    },
    strip: function (html) {
      var d = document.createElement('div'); d.innerHTML = html || '';
      return (d.textContent || '').trim();
    }
  };

  /* =====================================================================
     3. TOASTS
     ===================================================================== */
  var toastHost = null;
  function toast(msg, title, type, ms) {
    if (!toastHost) {
      toastHost = document.createElement('div');
      toastHost.className = 'toasts';
      toastHost.setAttribute('aria-live', 'polite');
      toastHost.setAttribute('aria-atomic', 'false');
      document.body.appendChild(toastHost);
    }
    var icons = { ok: 'checkCircle', err: 'xCircle', warn: 'alert', info: 'info' };
    var el = document.createElement('div');
    el.className = 'toast ' + (type || 'ok');
    el.innerHTML = '<span class="ti">' + icon(icons[type || 'ok'], 14) + '</span>' +
      '<span class="tb">' + (title ? '<strong>' + F.esc(title) + '</strong>' : '') + '<span>' + F.esc(msg) + '</span></span>' +
      '<button class="tx" aria-label="Dismiss">' + icon('x', 15) + '</button>';
    toastHost.appendChild(el);
    var kill = function () {
      if (!el.parentNode) return;
      el.classList.add('out');
      setTimeout(function () { el.remove(); }, 260);
    };
    el.querySelector('.tx').addEventListener('click', kill);
    setTimeout(kill, ms || 4200);
    return el;
  }

  /* =====================================================================
     4. MODALS / DRAWERS / CONFIRM
     ===================================================================== */
  var openLayers = [];
  var lastFocus = null;

  function closeTop() {
    var l = openLayers.pop();
    if (l) l.close();
  }

  function trapFocus(root, e) {
    if (e.key !== 'Tab') return;
    var f = root.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"]),[contenteditable="true"]');
    var list = Array.prototype.filter.call(f, function (el) { return el.offsetParent !== null; });
    if (!list.length) return;
    var i = list.indexOf(document.activeElement);
    e.preventDefault();
    var n = e.shiftKey ? (i - 1 + list.length) % list.length : (i + 1) % list.length;
    list[n].focus();
  }

  function modal(opts) {
    opts = opts || {};
    lastFocus = document.activeElement;
    var root = document.createElement('div');
    root.className = 'modal-root show';
    root.innerHTML =
      '<div class="modal-scrim" data-close></div>' +
      '<div class="modal ' + (opts.size === 'lg' ? 'wrap-lg' : opts.size === 'md' ? 'wrap-md' : opts.size === 'sm' ? 'wrap-sm' : '') + '" role="dialog" aria-modal="true" aria-label="' + F.esc(opts.title || 'Dialog') + '">' +
      '<div class="modal-h' + (opts.tone === 'danger' ? ' danger' : '') + '">' +
      (opts.icon ? '<span class="mh-ico">' + icon(opts.icon, 19) + '</span>' : '') +
      '<span class="mh-t"><h3>' + (opts.title || '') + '</h3>' + (opts.subtitle ? '<p>' + opts.subtitle + '</p>' : '') + '</span>' +
      '<button class="icon-btn" data-close aria-label="Close dialog">' + icon('x', 18) + '</button>' +
      '</div>' +
      (opts.tabs ? '<div class="tabs" role="tablist">' + opts.tabs.map(function (t, i) {
        return '<button role="tab" data-tab="' + t.id + '" class="' + (i === 0 ? 'active' : '') + '">' + t.label + '</button>';
      }).join('') + '</div>' : '') +
      '<div class="modal-b">' + (opts.body || '') + '</div>' +
      (opts.footer === null ? '' : '<div class="modal-f">' + (opts.footer || '<button class="btn" data-close>Close</button>') + '</div>') +
      '</div>';
    document.body.appendChild(root);
    document.body.style.overflow = 'hidden';

    var api = {
      root: root,
      el: root.querySelector('.modal'),
      close: function () {
        root.remove();
        document.body.style.overflow = '';
        var i = openLayers.indexOf(api); if (i > -1) openLayers.splice(i, 1);
        if (lastFocus && lastFocus.focus) try { lastFocus.focus(); } catch (e) { }
        if (opts.onClose) opts.onClose();
      }
    };
    openLayers.push(api);

    root.addEventListener('click', function (e) { if (e.target.closest('[data-close]')) api.close(); });
    root.addEventListener('keydown', function (e) { trapFocus(api.el, e); });
    root.querySelectorAll('.tabs button').forEach(function (b) {
      b.addEventListener('click', function () {
        root.querySelectorAll('.tabs button').forEach(function (x) { x.classList.remove('active'); });
        b.classList.add('active');
        root.querySelectorAll('.tabpane').forEach(function (p) {
          p.classList.toggle('active', p.dataset.pane === b.dataset.tab);
        });
      });
    });
    setTimeout(function () {
      var f = api.el.querySelector('[autofocus],input:not([type=hidden]),textarea,select,button.btn-primary');
      if (f) f.focus();
    }, 60);
    if (opts.onOpen) opts.onOpen(api);
    return api;
  }

  function confirmDialog(opts) {
    opts = opts || {};
    return new Promise(function (resolve) {
      var m = modal({
        title: opts.title || 'Are you sure?',
        subtitle: opts.subtitle || '',
        icon: opts.icon || 'alert',
        tone: opts.tone || 'danger',
        size: 'sm',
        body: '<p style="margin:0">' + (opts.message || 'This action cannot be undone.') + '</p>',
        footer: '<button class="btn" data-close>' + F.esc(opts.cancelText || 'Cancel') + '</button>' +
          '<button class="btn ' + (opts.tone === 'danger' ? 'btn-danger' : 'btn-primary') + '" data-yes>' + F.esc(opts.okText || 'Confirm') + '</button>',
        onClose: function () { resolve(false); }
      });
      m.el.querySelector('[data-yes]').addEventListener('click', function () {
        m.root.querySelector('[data-close]');
        resolve(true);
        m.root.remove();
        document.body.style.overflow = '';
        var i = openLayers.indexOf(m); if (i > -1) openLayers.splice(i, 1);
      });
    });
  }

  function drawer(opts) {
    opts = opts || {};
    lastFocus = document.activeElement;
    var root = document.createElement('div');
    root.className = 'drawer-root show';
    root.innerHTML =
      '<div class="modal-scrim" data-close></div>' +
      '<div class="drawer" role="dialog" aria-modal="true" aria-label="' + F.esc(opts.title || 'Panel') + '">' +
      '<div class="modal-h"><span class="mh-ico">' + icon(opts.icon || 'eye', 19) + '</span>' +
      '<span class="mh-t"><h3>' + (opts.title || '') + '</h3>' + (opts.subtitle ? '<p>' + opts.subtitle + '</p>' : '') + '</span>' +
      '<button class="icon-btn" data-close aria-label="Close panel">' + icon('x', 18) + '</button></div>' +
      '<div class="modal-b">' + (opts.body || '') + '</div>' +
      (opts.footer === null ? '' : '<div class="modal-f">' + (opts.footer || '<button class="btn" data-close>Close</button>') + '</div>') +
      '</div>';
    document.body.appendChild(root);
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(function () { root.querySelector('.drawer'); });

    var api = {
      root: root,
      el: root.querySelector('.drawer'),
      close: function () {
        root.remove();
        document.body.style.overflow = '';
        var i = openLayers.indexOf(api); if (i > -1) openLayers.splice(i, 1);
        if (opts.onClose) opts.onClose();
      }
    };
    openLayers.push(api);
    root.addEventListener('click', function (e) { if (e.target.closest('[data-close]')) api.close(); });
    root.addEventListener('keydown', function (e) { trapFocus(api.el, e); });
    if (opts.onOpen) opts.onOpen(api);
    return api;
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && openLayers.length) { e.preventDefault(); closeTop(); }
  });

  /* =====================================================================
     5. FORM BUILDERS
     ===================================================================== */
  function field(cfg) {
    var id = cfg.id || ('f-' + Math.random().toString(36).slice(2, 8));
    var lbl = cfg.label ? '<label for="' + id + '">' + F.esc(cfg.label) + (cfg.required ? ' <span class="req">*</span>' : '') + '</label>' : '';
    var hint = cfg.hint ? '<span class="hint">' + cfg.hint + '</span>' : '';
    var err = '<span class="err">' + F.esc(cfg.error || 'This field is required.') + '</span>';
    var input = '';
    var v = cfg.value == null ? '' : cfg.value;
    /* leading space is required: '<select' + attrs must not become '<selectid=' */
    var attrs = ' id="' + id + '" name="' + (cfg.name || id) + '"' + (cfg.required ? ' required' : '') + (cfg.disabled ? ' disabled' : '') + (cfg.placeholder ? ' placeholder="' + F.esc(cfg.placeholder) + '"' : '') + (cfg.attrs || '');

    if (cfg.type === 'textarea') {
      input = '<textarea rows="' + (cfg.rows || 4) + '"' + attrs + '>' + F.esc(v) + '</textarea>';
    } else if (cfg.type === 'select') {
      input = '<select' + attrs + '>' + (cfg.placeholder ? '<option value="">' + F.esc(cfg.placeholder) + '</option>' : '') +
        (cfg.options || []).map(function (o) {
          var val = typeof o === 'object' ? o.value : o, lab = typeof o === 'object' ? o.label : o;
          return '<option value="' + F.esc(val) + '"' + (String(val) === String(v) ? ' selected' : '') + '>' + F.esc(lab) + '</option>';
        }).join('') + '</select>';
    } else if (cfg.type === 'checkbox' || cfg.type === 'radio') {
      return '<div class="field"><label class="check"><input type="' + cfg.type + '" name="' + (cfg.name || id) + '"' + (v ? ' checked' : '') + (cfg.required ? ' required' : '') + '><span>' + cfg.label + (cfg.hint ? ' <span class="hint">' + cfg.hint + '</span>' : '') + '</span></label>' + err + '</div>';
    } else if (cfg.type === 'switch') {
      return '<div class="field"><label class="switch"><input type="checkbox" name="' + (cfg.name || id) + '"' + (v ? ' checked' : '') + '><span class="track"></span>' +
        '<span class="sw-t">' + F.esc(cfg.label || '') + (cfg.hint ? '<small>' + F.esc(cfg.hint) + '</small>' : '') + '</span></label></div>';
    } else if (cfg.type === 'tags') {
      var arr = Array.isArray(v) ? v : String(v || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean);
      input = '<div class="tags-input" data-tags>' +
        arr.map(function (t) { return '<span class="tag-pill">' + F.esc(t) + '<button type="button" data-rm aria-label="Remove ' + F.esc(t) + '">' + icon('x', 13) + '</button></span>'; }).join('') +
        '<input type="text" name="' + (cfg.name || id) + '" placeholder="' + F.esc(cfg.placeholder || 'Type and press Enter') + '" data-taginput></div>';
      return '<div class="field">' + lbl + input + hint + err + '</div>';
    } else if (cfg.type === 'editor') {
      input = '<div class="editor" data-editor><div class="editor-bar">' +
        [['bold', 'bold', 'Bold'], ['italic', 'italic', 'Italic'], ['underline', 'underline', 'Underline'],
        ['ulist', 'insertUnorderedList', 'Bullet list'], ['olist', 'insertOrderedList', 'Numbered list'],
        ['quote', 'formatBlock|blockquote', 'Quote'], ['link', 'createlink', 'Insert link']]
          .map(function (b, i) {
            return (i === 3 || i === 5 || i === 6 ? '<span class="sep"></span>' : '') +
              '<button type="button" data-cmd="' + b[1] + '" title="' + b[2] + '" aria-label="' + b[2] + '">' + icon(b[0], 15) + '</button>';
          }).join('') +
        '</div><div class="editor-body" contenteditable="true" data-body role="textbox" aria-multiline="true" data-placeholder="' + F.esc(cfg.placeholder || 'Write the story…') + '">' + (v || '') + '</div>' +
        '<div class="editor-foot"><span data-count>0 words</span><span>' + F.esc(cfg.hint || 'Rich text — links open in a new tab on the public site.') + '</span></div>' +
        '<textarea name="' + (cfg.name || id) + '" hidden>' + F.esc(v || '') + '</textarea></div>';
      return '<div class="field">' + lbl + input + err + '</div>';
    } else if (cfg.type === 'file') {
      input = '<div class="dropzone" data-drop><input type="file" name="' + (cfg.name || id) + '" hidden ' + (cfg.accept ? 'accept="' + cfg.accept + '"' : '') + '>' +
        icon('upload', 30) + '<div class="t1">' + F.esc(cfg.label || 'Upload') + '</div>' +
        '<div class="t2">' + F.esc(cfg.hint || 'Click to browse or drop a file here') + '</div>' +
        (v ? '<div class="mt-1"><img src="' + F.esc(v) + '" alt="" style="max-height:110px;margin:0 auto;border-radius:8px"></div>' : '') + '</div>';
      return '<div class="field">' + input + err + '</div>';
    } else if (cfg.type === 'image') {
      input = '<div class="thumb-pick" data-pick>' + (cfg.options || []).map(function (o) {
        return '<button type="button" data-src="' + F.esc(o.src) + '" class="' + (o.src === v ? 'active' : '') + '" style="background-image:url(\'' + F.esc(o.src) + '\')" title="' + F.esc(o.name || o.src) + '" aria-label="' + F.esc(o.name || o.src) + '"></button>';
      }).join('') + '</div><input type="hidden" name="' + (cfg.name || id) + '" value="' + F.esc(v) + '">';
      return '<div class="field">' + lbl + input + hint + '</div>';
    } else if (cfg.type === 'number') {
      input = cfg.prefix || cfg.suffix
        ? '<div class="input-group">' + (cfg.prefix ? '<span class="ig-addon">' + F.esc(cfg.prefix) + '</span>' : '') +
        '<input type="number"' + attrs + ' value="' + F.esc(v) + '"' + (cfg.min != null ? ' min="' + cfg.min + '"' : '') + (cfg.max != null ? ' max="' + cfg.max + '"' : '') + (cfg.step ? ' step="' + cfg.step + '"' : '') + '>' +
        (cfg.suffix ? '<span class="ig-addon" style="border-left:1px;border-right:0;border-radius:0 8px 8px 0">' + F.esc(cfg.suffix) + '</span>' : '') + '</div>'
        : '<input type="number"' + attrs + ' value="' + F.esc(v) + '"' + (cfg.min != null ? ' min="' + cfg.min + '"' : '') + (cfg.max != null ? ' max="' + cfg.max + '"' : '') + (cfg.step ? ' step="' + cfg.step + '"' : '') + '>';
    } else if (cfg.type === 'range') {
      input = '<div class="flex gap-s aic"><input type="range" min="' + (cfg.min || 0) + '" max="' + (cfg.max || 100) + '" step="' + (cfg.step || 1) + '" value="' + (v || 0) + '"' + attrs + ' style="flex:1;accent-color:var(--accent)"><b class="mono" data-rangeout>' + (v || 0) + (cfg.unit || '%') + '</b></div>';
    } else {
      input = '<input type="' + (cfg.type || 'text') + '"' + attrs + ' value="' + F.esc(v) + '"' + (cfg.min ? ' min="' + cfg.min + '"' : '') + (cfg.max ? ' max="' + cfg.max + '"' : '') + '>';
    }
    return '<div class="field' + (cfg.full ? ' full' : '') + '">' + lbl + input + hint + err + '</div>';
  }

  function form(fieldsHtml, opts) {
    return '<form data-form novalidate>' +
      '<div class="form-grid' + ((opts && opts.cols) ? ' cols-' + opts.cols : '') + '">' + fieldsHtml.join('') + '</div>' +
      '</form>';
  }

  /* wire up interactive field behaviours inside a container */
  function wireFields(root) {
    root.querySelectorAll('[data-taginput]').forEach(function (inp) {
      inp.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ',') {
          e.preventDefault();
          var v = inp.value.trim().replace(/,$/, '');
          if (!v) return;
          var pill = document.createElement('span');
          pill.className = 'tag-pill';
          pill.innerHTML = F.esc(v) + '<button type="button" data-rm aria-label="Remove">' + icon('x', 13) + '</button>';
          inp.parentNode.insertBefore(pill, inp);
          inp.value = '';
        } else if (e.key === 'Backspace' && !inp.value) {
          var pills = inp.parentNode.querySelectorAll('.tag-pill');
          if (pills.length) pills[pills.length - 1].remove();
        }
      });
    });
    root.addEventListener('click', function (e) {
      var rm = e.target.closest('[data-rm]');
      if (rm) { e.preventDefault(); rm.closest('.tag-pill').remove(); }
      var pick = e.target.closest('[data-pick] button');
      if (pick) {
        pick.parentNode.querySelectorAll('button').forEach(function (b) { b.classList.remove('active'); });
        pick.classList.add('active');
        var hid = pick.parentNode.nextElementSibling;
        if (hid && hid.type === 'hidden') hid.value = pick.dataset.src;
      }
      var cmd = e.target.closest('[data-cmd]');
      if (cmd) {
        e.preventDefault();
        var ed = cmd.closest('[data-editor]');
        var body = ed.querySelector('[data-body]');
        body.focus();
        var c = cmd.dataset.cmd;
        if (c === 'createlink') {
          var url = prompt('Link URL', 'https://');
          if (url) document.execCommand('createLink', false, url);
        } else if (c.indexOf('|') > -1) {
          document.execCommand('formatBlock', false, c.split('|')[1]);
        } else {
          document.execCommand(c, false, null);
        }
        syncEditor(ed);
      }
    });
    root.querySelectorAll('[data-editor]').forEach(function (ed) {
      var body = ed.querySelector('[data-body]');
      body.addEventListener('input', function () { syncEditor(ed); });
      body.addEventListener('blur', function () { syncEditor(ed); });
      syncEditor(ed);
    });
    root.querySelectorAll('[data-rangeout]').forEach(function (out) {
      var r = out.parentNode.querySelector('input[type=range]');
      r.addEventListener('input', function () { out.textContent = r.value + (out.textContent.replace(/[0-9.]/g, '') || '%'); });
    });
    root.querySelectorAll('[data-drop]').forEach(function (dz) {
      var inp = dz.querySelector('input[type=file]');
      dz.addEventListener('click', function () { inp.click(); });
      ['dragenter', 'dragover'].forEach(function (ev) {
        dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.add('over'); });
      });
      ['dragleave', 'drop'].forEach(function (ev) {
        dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.remove('over'); });
      });
      dz.addEventListener('drop', function (e) {
        if (e.dataTransfer.files && e.dataTransfer.files[0]) { inp.files = e.dataTransfer.files; inp.dispatchEvent(new Event('change')); }
      });
    });
  }

  function syncEditor(ed) {
    var body = ed.querySelector('[data-body]');
    var ta = ed.querySelector('textarea');
    if (ta) ta.value = body.innerHTML;
    var cnt = ed.querySelector('[data-count]');
    if (cnt) {
      var words = (body.textContent || '').trim().split(/\s+/).filter(Boolean).length;
      cnt.textContent = words + ' word' + (words === 1 ? '' : 's') + ' · ' + (body.textContent || '').length + ' chars';
    }
  }

  function readForm(root) {
    var out = {};
    root.querySelectorAll('input,select,textarea').forEach(function (el) {
      if (!el.name) return;
      if (el.type === 'checkbox') out[el.name] = el.checked;
      else if (el.type === 'file') { /* handled separately */ }
      else out[el.name] = el.value;
    });
    root.querySelectorAll('[data-tags]').forEach(function (box) {
      var name = box.querySelector('input') && box.querySelector('input').name;
      if (!name) return;
      out[name] = Array.prototype.map.call(box.querySelectorAll('.tag-pill'), function (p) {
        return p.textContent.replace(/\s*$/, '').trim();
      }).filter(Boolean);
    });
    root.querySelectorAll('[data-editor]').forEach(function (ed) {
      var ta = ed.querySelector('textarea');
      if (ta && ta.name) out[ta.name] = ed.querySelector('[data-body]').innerHTML;
    });
    return out;
  }

  function validate(root, rules) {
    var ok = true, first = null;
    root.querySelectorAll('[required]').forEach(function (el) {
      var wrap = el.closest('.field') || el.parentNode;
      var good;
      if (el.type === 'checkbox') good = el.checked;
      else good = String(el.value || '').trim() !== '';
      if (good && el.type === 'email') good = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(el.value.trim());
      if (good && rules && rules[el.name]) good = rules[el.name](el.value);
      wrap.classList.toggle('invalid', !good);
      if (!good) { ok = false; if (!first) first = el; }
    });
    if (first) {
      try { first.focus(); } catch (e) { /* ignore */ }
      if (typeof first.scrollIntoView === 'function') {
        try { first.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch (e) { /* older browsers */ }
      }
    }
    return ok;
  }

  /* =====================================================================
     6. DATA TABLE
     ===================================================================== */
  /*  cfg: { cols:[{key,label,render,sortable,width,align}], rows, pageSize, search:fn,
             filters:[{key,label,options}], selectable, onRow, actions, empty }        */
  function dataTable(cfg) {
    var state = {
      q: '', sortKey: cfg.sortKey || null, sortDir: cfg.sortDir || 'asc',
      page: 1, size: cfg.pageSize || 8, sel: {}, filter: {}
    };
    var host = document.createElement('div');
    host.className = 'card';

    function rows() {
      var r = (cfg.rows || []).slice();
      if (state.q) {
        var q = state.q.toLowerCase();
        r = r.filter(function (row) { return (cfg.search ? cfg.search(row) : JSON.stringify(row)).toLowerCase().indexOf(q) > -1; });
      }
      (cfg.filters || []).forEach(function (f) {
        var v = state.filter[f.key];
        if (v && v !== 'all') r = r.filter(function (row) { return String(f.get ? f.get(row) : row[f.key]) === v; });
      });
      if (state.sortKey) {
        var col = cfg.cols.filter(function (c) { return c.key === state.sortKey; })[0];
        var get = (col && col.sortValue) || function (row) { return row[state.sortKey]; };
        r.sort(function (a, b) {
          var x = get(a), y = get(b);
          if (typeof x === 'string') x = x.toLowerCase();
          if (typeof y === 'string') y = y.toLowerCase();
          if (x == null) return 1; if (y == null) return -1;
          return (x < y ? -1 : x > y ? 1 : 0) * (state.sortDir === 'asc' ? 1 : -1);
        });
      }
      return r;
    }

    function render() {
      var all = rows();
      var pages = Math.max(1, Math.ceil(all.length / state.size));
      if (state.page > pages) state.page = pages;
      var slice = all.slice((state.page - 1) * state.size, state.page * state.size);
      var selCount = Object.keys(state.sel).filter(function (k) { return state.sel[k]; }).length;

      var html = '';
      /* toolbar */
      if (cfg.toolbar !== false) {
        html += '<div class="toolbar">';
        html += '<div class="search">' + icon('search', 15) + '<input type="search" placeholder="' + F.esc(cfg.searchPlaceholder || 'Search…') + '" value="' + F.esc(state.q) + '" data-tq aria-label="Search table"></div>';
        (cfg.filters || []).forEach(function (f) {
          var fopts = typeof f.options === 'function' ? f.options() : f.options;
          html += '<select data-tf="' + f.key + '" aria-label="Filter by ' + F.esc(f.label) + '"><option value="all">' + F.esc(f.label) + ': All</option>' +
            fopts.map(function (o) {
              return '<option value="' + F.esc(o) + '"' + (state.filter[f.key] === o ? ' selected' : '') + '>' + F.esc(o) + '</option>';
            }).join('') + '</select>';
        });
        html += '<div class="grow"></div>';
        if (cfg.pageSizeOptions) {
          html += '<select data-tsize aria-label="Rows per page">' + cfg.pageSizeOptions.map(function (n) {
            return '<option value="' + n + '"' + (n === state.size ? ' selected' : '') + '>' + n + ' rows</option>';
          }).join('') + '</select>';
        }
        if (cfg.onExport !== false) html += '<button class="btn btn-outline btn-sm" data-texport>' + icon('download', 14) + '<span class="hide-xs">CSV</span></button>';
        if (cfg.toolbarExtra) html += cfg.toolbarExtra;
        if (cfg.onCreate) html += '<button class="btn btn-primary btn-sm" data-tnew>' + icon('plus', 14) + F.esc(cfg.createLabel || 'New') + '</button>';
        html += '</div>';
      }
      /* bulk bar */
      html += '<div class="bulk-bar' + (selCount ? ' show' : '') + '">' +
        '<span class="n">' + selCount + ' selected</span>' +
        (cfg.bulkActions || []).map(function (b) {
          return '<button class="btn btn-sm ' + (b.cls || 'btn-outline') + '" data-bulk="' + b.id + '">' + (b.icon ? icon(b.icon, 14) : '') + F.esc(b.label) + '</button>';
        }).join('') +
        '<div class="grow" style="flex:1"></div><button class="btn btn-ghost btn-sm" data-clearsel>Clear</button></div>';

      /* table */
      html += '<div class="tbl-wrap"><table class="tbl"><thead><tr>';
      if (cfg.selectable) html += '<th style="width:34px"><input type="checkbox" data-selall aria-label="Select all rows"' + (slice.length && selCount === slice.length ? ' checked' : '') + '></th>';
      cfg.cols.forEach(function (c) {
        var sorted = state.sortKey === c.key;
        var canSort = c.sortable !== false && c.key;
        var cls = [];
        if (canSort) cls.push('sortable');
        if (canSort && sorted) cls.push('sorted', state.sortDir);
        html += '<th' + (cls.length ? ' class="' + cls.join(' ') + '"' : '') +
          (canSort ? ' data-sort="' + c.key + '" tabindex="0" role="columnheader" aria-sort="' + (sorted ? (state.sortDir === 'asc' ? 'ascending' : 'descending') : 'none') + '"' : '') +
          (c.width ? ' style="width:' + c.width + '"' : '') + '>' + F.esc(c.label || '') +
          (canSort ? '<span class="sarrow"></span>' : '') + '</th>';
      });
      if (cfg.onRow || cfg.actions) html += '<th style="text-align:right">Actions</th>';
      html += '</tr></thead><tbody>';

      if (!slice.length) {
        var span = (cfg.selectable ? 1 : 0) + cfg.cols.length + 1;
        html += '<tr><td colspan="' + span + '"><div class="empty">' + icon(cfg.emptyIcon || 'inbox', 44) +
          '<div class="t1">' + F.esc(cfg.emptyTitle || 'Nothing here yet') + '</div>' +
          '<div class="t2">' + F.esc(cfg.emptyText || (state.q ? 'No records match your search.' : 'Create the first record to get started.')) + '</div>' +
          (cfg.onCreate && !state.q ? '<button class="btn btn-primary" data-tnew>' + icon('plus', 15) + F.esc(cfg.createLabel || 'New') + '</button>' : '') +
          '</div></td></tr>';
      } else {
        slice.forEach(function (row) {
          var isSel = !!state.sel[row[cfg.idKey || 'id']];
          html += '<tr data-id="' + F.esc(row[cfg.idKey || 'id']) + '"' + (isSel ? ' class="sel"' : '') + '>';
          if (cfg.selectable) html += '<td><input type="checkbox" data-selrow="' + F.esc(row[cfg.idKey || 'id']) + '"' + (isSel ? ' checked' : '') + ' aria-label="Select row"></td>';
          cfg.cols.forEach(function (c) {
            html += '<td' + (c.align === 'right' ? ' class="num"' : '') + '>' + (c.render ? c.render(row) : F.esc(row[c.key])) + '</td>';
          });
          if (cfg.onRow || cfg.actions) {
            html += '<td><div class="acts">' + (cfg.actions ? cfg.actions(row) : '') +
              (cfg.onRow ? '<button class="btn btn-ghost btn-sm" data-view="' + F.esc(row[cfg.idKey || 'id']) + '" title="Open" aria-label="Open record">' + icon('chevronRight', 15) + '</button>' : '') +
              '</div></td>';
          }
          html += '</tr>';
        });
      }
      html += '</tbody></table></div>';

      /* footer */
      html += '<div class="tbl-foot"><span>' +
        (all.length ? 'Showing ' + ((state.page - 1) * state.size + 1) + '–' + Math.min(state.page * state.size, all.length) + ' of ' + F.num(all.length) : 'No records') +
        (cfg.totalLabel ? ' ' + cfg.totalLabel : '') + '</span>' +
        '<div class="pager">' +
        '<button data-pg="prev"' + (state.page <= 1 ? ' disabled' : '') + ' aria-label="Previous page">' + icon('chevronLeft', 15) + '</button>' +
        pagerButtons(state.page, pages) +
        '<button data-pg="next"' + (state.page >= pages ? ' disabled' : '') + ' aria-label="Next page">' + icon('chevronRight', 15) + '</button>' +
        '</div></div>';

      host.innerHTML = html;
      bind();
      return host;
    }

    function pagerButtons(cur, total) {
      var out = [], i, add = function (n) { out.push('<button data-pg="' + n + '" class="' + (n === cur ? 'active' : '') + '" aria-label="Page ' + n + '"' + (n === cur ? ' aria-current="page"' : '') + '>' + n + '</button>'); };
      if (total <= 7) { for (i = 1; i <= total; i++) add(i); return out.join(''); }
      add(1);
      if (cur > 3) out.push('<span class="gap btn">…</span>');
      for (i = Math.max(2, cur - 1); i <= Math.min(total - 1, cur + 1); i++) add(i);
      if (cur < total - 2) out.push('<span class="gap btn">…</span>');
      add(total);
      return out.join('');
    }

    function bind() {
      var q = host.querySelector('[data-tq]');
      if (q) {
        q.addEventListener('input', function () { state.q = q.value; state.page = 1; rerender(true); });
        q.addEventListener('keydown', function (e) { if (e.key === 'Escape') { q.value = ''; state.q = ''; state.page = 1; rerender(); } });
      }
      host.querySelectorAll('[data-tf]').forEach(function (s) {
        s.addEventListener('change', function () { state.filter[s.dataset.tf] = s.value; state.page = 1; rerender(); });
      });
      var sz = host.querySelector('[data-tsize]');
      if (sz) sz.addEventListener('change', function () { state.size = parseInt(sz.value, 10); state.page = 1; rerender(); });
      host.querySelectorAll('[data-sort]').forEach(function (th) {
        var flip = function () {
          var k = th.dataset.sort;
          if (state.sortKey === k) state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
          else { state.sortKey = k; state.sortDir = 'asc'; }
          rerender();
        };
        th.addEventListener('click', flip);
        th.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); }
        });
      });
      host.querySelectorAll('[data-pg]').forEach(function (b) {
        b.addEventListener('click', function () {
          var v = b.dataset.pg;
          var pages = Math.max(1, Math.ceil(rows().length / state.size));
          if (v === 'prev') state.page = Math.max(1, state.page - 1);
          else if (v === 'next') state.page = Math.min(pages, state.page + 1);
          else state.page = parseInt(v, 10);
          rerender();
        });
      });
      var selAll = host.querySelector('[data-selall]');
      if (selAll) selAll.addEventListener('change', function () {
        var all = rows().slice((state.page - 1) * state.size, state.page * state.size);
        all.forEach(function (r) { state.sel[r[cfg.idKey || 'id']] = selAll.checked; });
        rerender();
      });
      host.querySelectorAll('[data-selrow]').forEach(function (c) {
        c.addEventListener('change', function () { state.sel[c.dataset.selrow] = c.checked; rerender(); });
      });
      var cs = host.querySelector('[data-clearsel]');
      if (cs) cs.addEventListener('click', function () { state.sel = {}; rerender(); });
      host.querySelectorAll('[data-bulk]').forEach(function (b) {
        b.addEventListener('click', function () {
          var ids = Object.keys(state.sel).filter(function (k) { return state.sel[k]; });
          if (!ids.length) { toast('Select at least one record first.', 'Nothing selected', 'warn'); return; }
          cfg.onBulk(b.dataset.bulk, ids, function () { state.sel = {}; rerender(); });
        });
      });
      host.querySelectorAll('[data-tnew]').forEach(function (b) { b.addEventListener('click', function () { cfg.onCreate(); }); });
      var ex = host.querySelector('[data-texport]');
      if (ex) ex.addEventListener('click', function () { cfg.onCsv ? cfg.onCsv(rows()) : toast('Export is not available for this table.', 'Export', 'warn'); });
      host.querySelectorAll('[data-view]').forEach(function (b) {
        b.addEventListener('click', function (e) { e.stopPropagation(); cfg.onRow(b.dataset.view); });
      });
      if (cfg.onAction) {
        host.querySelectorAll('[data-act]').forEach(function (b) {
          b.addEventListener('click', function (e) { e.stopPropagation(); cfg.onAction(b.dataset.act, b.dataset.id); });
        });
      }
      if (cfg.onRow) {
        host.querySelectorAll('tbody tr[data-id]').forEach(function (tr) {
          tr.style.cursor = 'pointer';
          tr.addEventListener('click', function (e) {
            if (e.target.closest('button,input,a,select')) return;
            cfg.onRow(tr.dataset.id);
          });
        });
      }
    }

    var keepFocus = false;
    function rerender(keepQ) {
      var val = keepFocus && keepQ ? host.querySelector('[data-tq]').value : null;
      var pos = keepQ ? (host.querySelector('[data-tq]') || {}).selectionStart : null;
      render();
      if (cfg.onRender) cfg.onRender(host, rows());
      if (val != null) {
        var nq = host.querySelector('[data-tq]');
        if (nq) { nq.value = val; try { nq.setSelectionRange(pos, pos); } catch (e) { } nq.focus(); }
      }
    }

    var api = {
      el: host,
      refresh: function () { state.page = 1; render(); if (cfg.onRender) cfg.onRender(host, rows()); },
      rerender: rerender,
      state: state,
      count: function () { return rows().length; }
    };
    render();
    return api;
  }

  /* =====================================================================
     7. CSV EXPORT
     ===================================================================== */
  function toCSV(cols, rows) {
    var head = cols.map(function (c) { return '"' + String(c.label).replace(/"/g, '""') + '"'; }).join(',');
    var body = rows.map(function (r) {
      return cols.map(function (c) {
        var v = c.csv ? c.csv(r) : r[c.key];
        v = v == null ? '' : String(v).replace(/<[^>]+>/g, '');
        return '"' + v.replace(/"/g, '""') + '"';
      }).join(',');
    }).join('\n');
    return head + '\n' + body;
  }
  function download(filename, text, mime) {
    var blob = new Blob([text], { type: mime || 'text/plain;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 400);
  }

  /* Copy text to the clipboard without any external service. Uses the async
     Clipboard API when available and falls back to a hidden textarea +
     execCommand, which still works on plain http and older browsers. */
  function copyText(text, okMsg) {
    function fallback() {
      try {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.cssText = 'position:fixed;top:-1000px;opacity:0';
        document.body.appendChild(ta);
        ta.select();
        var ok = document.execCommand && document.execCommand('copy');
        ta.remove();
        toast(ok ? (okMsg || 'Copied to the clipboard.') : 'Select the text and copy it manually.', 'Copy', ok ? 'ok' : 'warn');
      } catch (e) {
        toast('Copying is blocked in this browser.', 'Copy', 'warn');
      }
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        toast(okMsg || 'Copied to the clipboard.', 'Copy', 'ok');
      }, fallback);
    } else { fallback(); }
  }

  /* =====================================================================
     8. CHARTS (pure SVG)
     ===================================================================== */
  var tip = null;
  function ensureTip() {
    if (!tip) {
      tip = document.createElement('div');
      tip.className = 'chart-tip';
      tip.setAttribute('role', 'status');
      document.body.appendChild(tip);
      document.addEventListener('mousemove', function (e) {
        if (!tip.classList.contains('show')) return;
        tip.style.left = e.clientX + 'px';
        tip.style.top = e.clientY + 'px';
      });
    }
    return tip;
  }
  document.addEventListener('mouseover', function (e) {
    var t = e.target.closest('[data-tip]');
    if (!t) { if (tip) tip.classList.remove('show'); return; }
    var el = ensureTip();
    el.innerHTML = t.dataset.tip;
    el.classList.add('show');
    el.style.left = (e.clientX) + 'px';
    el.style.top = (e.clientY) + 'px';
  });

  var palette = ['#0b6b3a', '#d9a520', '#1c7ed6', '#7048b6', '#0e8f8f', '#c0392b', '#1e9d5c', '#e08700'];

  function niceMax(v) {
    if (v <= 0) return 10;
    var mag = Math.pow(10, Math.floor(Math.log10(v)));
    var n = v / mag;
    var step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10;
    return step * mag;
  }

  /* --- area / line chart ---
     cfg: {labels:[], series:[{name,values,color,area}], height, yFmt, xEvery}      */
  function lineChart(cfg) {
    var W = 720, H = cfg.height || 230, padL = 46, padR = 12, padT = 14, padB = 26;
    var labels = cfg.labels || [];
    var series = cfg.series || [];
    var max = 0;
    series.forEach(function (s) { s.values.forEach(function (v) { if (v > max) max = v; }); });
    max = niceMax(max * 1.08);
    var n = labels.length;
    var iw = W - padL - padR, ih = H - padT - padB;
    var x = function (i) { return padL + (n <= 1 ? iw / 2 : (i / (n - 1)) * iw); };
    var y = function (v) { return padT + ih - (v / max) * ih; };
    var fmt = cfg.yFmt || F.compact;
    var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" role="img" aria-label="' + F.esc(cfg.ariaLabel || 'Line chart') + '">';
    /* grid + y labels */
    for (var g = 0; g <= 4; g++) {
      var gy = padT + (ih / 4) * g;
      s += '<line class="c-grid" x1="' + padL + '" y1="' + gy + '" x2="' + (W - padR) + '" y2="' + gy + '"/>';
      s += '<text class="c-axis" x="' + (padL - 8) + '" y="' + (gy + 3.5) + '" text-anchor="end">' + fmt(Math.round(max - (max / 4) * g)) + '</text>';
    }
    /* x labels */
    var every = cfg.xEvery || Math.max(1, Math.ceil(n / (W < 500 ? 5 : 9)));
    labels.forEach(function (l, i) {
      if (i % every !== 0 && i !== n - 1) return;
      s += '<text class="c-axis" x="' + x(i) + '" y="' + (H - 7) + '" text-anchor="middle">' + F.esc(l) + '</text>';
    });
    series.forEach(function (se, si) {
      var col = se.color || palette[si % palette.length];
      var pts = se.values.map(function (v, i) { return x(i) + ',' + y(v); });
      if (se.area !== false) {
        var gid = 'grad' + Math.random().toString(36).slice(2, 7);
        s += '<defs><linearGradient id="' + gid + '" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0" stop-color="' + col + '" stop-opacity=".30"/><stop offset="1" stop-color="' + col + '" stop-opacity="0"/>' +
          '</linearGradient></defs>';
        s += '<polygon points="' + padL + ',' + (padT + ih) + ' ' + pts.join(' ') + ' ' + x(n - 1) + ',' + (padT + ih) + '" fill="url(#' + gid + ')"/>';
      }
      s += '<polyline class="c-line" points="' + pts.join(' ') + '" stroke="' + col + '"/>';
      se.values.forEach(function (v, i) {
        s += '<circle class="c-dot" cx="' + x(i) + '" cy="' + y(v) + '" r="3.2" fill="' + col + '" data-tip="<b>' + F.esc(labels[i] || '') + '</b> · ' + F.esc(se.name) + ': ' + F.esc((cfg.tipFmt || F.num)(v)) + '"/>';
      });
    });
    s += '</svg>';
    var legend = series.length > 1 ? '<div class="legend">' + series.map(function (se, i) {
      return '<span class="li"><span class="sw" style="background:' + (se.color || palette[i % palette.length]) + '"></span>' + F.esc(se.name) + '</span>';
    }).join('') + '</div>' : '';
    return '<div class="chart">' + s + legend + '</div>';
  }

  /* --- vertical bar chart --- */
  function barChart(cfg) {
    var W = 720, H = cfg.height || 230, padL = 46, padR = 10, padT = 14, padB = 30;
    var labels = cfg.labels || [], values = cfg.values || [];
    var max = niceMax(Math.max.apply(null, values.concat([1])) * 1.1);
    var iw = W - padL - padR, ih = H - padT - padB;
    var bw = Math.min(cfg.barMax || 46, (iw / labels.length) * 0.62);
    var fmt = cfg.yFmt || F.compact;
    var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" role="img" aria-label="' + F.esc(cfg.ariaLabel || 'Bar chart') + '">';
    for (var g = 0; g <= 4; g++) {
      var gy = padT + (ih / 4) * g;
      s += '<line class="c-grid" x1="' + padL + '" y1="' + gy + '" x2="' + (W - padR) + '" y2="' + gy + '"/>';
      s += '<text class="c-axis" x="' + (padL - 8) + '" y="' + (gy + 3.5) + '" text-anchor="end">' + fmt(Math.round(max - (max / 4) * g)) + '</text>';
    }
    labels.forEach(function (l, i) {
      var slot = iw / labels.length;
      var cx = padL + slot * i + slot / 2;
      var h = (values[i] / max) * ih;
      var col = Array.isArray(cfg.colors) ? cfg.colors[i % cfg.colors.length] : (cfg.color || 'var(--green-700)');
      s += '<rect class="c-bar" x="' + (cx - bw / 2) + '" y="' + (padT + ih - h) + '" width="' + bw + '" height="' + Math.max(1.5, h) + '" rx="4" fill="' + col + '" data-tip="<b>' + F.esc(l) + '</b>: ' + F.esc((cfg.tipFmt || F.num)(values[i])) + '"/>';
      s += '<text class="c-axis" x="' + cx + '" y="' + (H - 9) + '" text-anchor="middle">' + F.esc(l) + '</text>';
    });
    return '<div class="chart">' + s + '</svg></div>';
  }

  /* --- donut / pie --- */
  function donutChart(cfg) {
    var data = cfg.data || [], total = 0;
    data.forEach(function (d) { total += Number(d.value) || 0; });
    var size = cfg.size || 190, r = size / 2, ir = cfg.thickness || 22, rad = r - ir / 2 - 4;
    var C = 2 * Math.PI * rad, off = 0;
    var s = '<svg viewBox="0 0 ' + size + ' ' + size + '" width="' + size + '" height="' + size + '" role="img" aria-label="' + F.esc(cfg.ariaLabel || 'Donut chart') + '" style="max-width:100%">';
    s += '<circle cx="' + r + '" cy="' + r + '" r="' + rad + '" fill="none" stroke="var(--surface-3)" stroke-width="' + ir + '"/>';
    data.forEach(function (d, i) {
      var frac = total ? (Number(d.value) || 0) / total : 0;
      var len = frac * C;
      var col = d.color || palette[i % palette.length];
      s += '<circle cx="' + r + '" cy="' + r + '" r="' + rad + '" fill="none" stroke="' + col + '" stroke-width="' + ir + '" ' +
        'stroke-dasharray="' + len.toFixed(2) + ' ' + (C - len).toFixed(2) + '" stroke-dashoffset="' + (-off).toFixed(2) + '" ' +
        'transform="rotate(-90 ' + r + ' ' + r + ')" stroke-linecap="butt" data-tip="<b>' + F.esc(d.name) + '</b>: ' + F.esc((cfg.tipFmt || F.num)(d.value)) + ' (' + Math.round(frac * 100) + '%)"/>';
      off += len;
    });
    s += '</svg>';
    var center = cfg.center ? '<div class="donut-center"><div><div class="v">' + cfg.center.value + '</div><div class="l">' + F.esc(cfg.center.label || '') + '</div></div></div>' : '';
    var legend = cfg.legend === false ? '' : '<div class="legend">' + data.map(function (d, i) {
      return '<span class="li"><span class="sw" style="background:' + (d.color || palette[i % palette.length]) + '"></span>' + F.esc(d.name) + ' <b>' + F.esc((cfg.legendFmt || F.pct)(d.value)) + '</b></span>';
    }).join('') + '</div>';
    return '<div class="chart" style="display:grid;place-items:center;position:relative">' + s + center + '</div>' + legend;
  }

  /* --- progress ring --- */
  function ring(value, opts) {
    opts = opts || {};
    var size = opts.size || 104, t = opts.thickness || 10, r = (size - t) / 2, C = 2 * Math.PI * r;
    var v = Math.max(0, Math.min(100, Number(value) || 0));
    var col = opts.color || 'var(--green-600)';
    return '<div class="progress-ring" style="width:' + size + 'px;height:' + size + 'px">' +
      '<svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '">' +
      '<circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" fill="none" stroke="var(--surface-3)" stroke-width="' + t + '"/>' +
      '<circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" fill="none" stroke="' + col + '" stroke-width="' + t + '" stroke-linecap="round" ' +
      'stroke-dasharray="' + C.toFixed(1) + '" stroke-dashoffset="' + (C - (v / 100) * C).toFixed(1) + '" transform="rotate(-90 ' + size / 2 + ' ' + size / 2 + ')"/>' +
      '</svg><div class="pr-t"><div class="v">' + (opts.label || Math.round(v) + '%') + '</div>' + (opts.sub ? '<div class="l">' + F.esc(opts.sub) + '</div>' : '') + '</div></div>';
  }

  /* --- sparkline --- */
  function spark(values, color, height) {
    var W = 160, H = height || 34, max = Math.max.apply(null, values.concat([1])), min = Math.min.apply(null, values);
    var range = (max - min) || 1;
    var pts = values.map(function (v, i) {
      return (i / (values.length - 1 || 1)) * W + ',' + (H - 3 - ((v - min) / range) * (H - 7));
    });
    var gid = 'sp' + Math.random().toString(36).slice(2, 7);
    return '<div class="spark"><svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" aria-hidden="true">' +
      '<defs><linearGradient id="' + gid + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + (color || 'var(--green-600)') + '" stop-opacity=".28"/><stop offset="1" stop-color="' + (color || 'var(--green-600)') + '" stop-opacity="0"/></linearGradient></defs>' +
      '<polygon points="0,' + H + ' ' + pts.join(' ') + ' ' + W + ',' + H + '" fill="url(#' + gid + ')"/>' +
      '<polyline points="' + pts.join(' ') + '" fill="none" stroke="' + (color || 'var(--green-600)') + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
      '</svg></div>';
  }

  /* --- horizontal bar list --- */
  function hbars(items, opts) {
    opts = opts || {};
    var max = Math.max.apply(null, items.map(function (i) { return i.value; }).concat([1]));
    return '<div class="bars-list">' + items.map(function (i) {
      return '<div class="bar-row"><div class="br-t"><span class="n">' + F.esc(i.label) + '</span>' +
        '<span class="v">' + (opts.fmt ? opts.fmt(i.value) : F.num(i.value)) + '</span></div>' +
        '<div class="bar-track ' + (i.tone || opts.tone || '') + '"><i data-w="' + Math.round((i.value / max) * 100) + '"></i></div></div>';
    }).join('') + '</div>';
  }
  function animateBars(root) {
    (root || document).querySelectorAll('.bar-track i[data-w]').forEach(function (b) {
      requestAnimationFrame(function () { b.style.width = b.dataset.w + '%'; });
    });
  }

  /* =====================================================================
     9. SMALL HELPERS
     ===================================================================== */
  function statusBadge(status) {
    var map = {
      'Published': 'b-ok', 'Approved': 'b-ok', 'Active': 'b-ok', 'Resolved': 'b-ok', 'Closed': 'b-ok', 'Completed': 'b-ok', 'Subscribed': 'b-ok', 'Sent': 'b-ok', 'Verified': 'b-ok',
      'Draft': 'b-outline', 'New': 'b-info', 'Open': 'b-info', 'Scheduled': 'b-info', 'Planning': 'b-info', 'Monitoring': 'b-info', 'Under review': 'b-info',
      'In review': 'b-warn', 'Pending': 'b-warn', 'Site verification': 'b-warn', 'Conditional approval': 'b-warn', 'Sampling done': 'b-warn', 'Site visit scheduled': 'b-warn', 'Invited': 'b-warn',
      'Rejected': 'b-danger', 'Suspended': 'b-danger', 'In progress': 'b-purple', 'Under investigation': 'b-purple', 'Urgent': 'b-danger', 'Critical': 'b-danger',
      'High': 'b-warn', 'Medium': 'b-info', 'Normal': 'b-outline', 'Low': 'b-outline'
    };
    return '<span class="badge ' + (map[status] || 'b-outline') + '"><span class="dot"></span>' + F.esc(status || '—') + '</span>';
  }

  function priorityBadge(p) {
    var map = { 'Urgent': 'b-solid-danger', 'Critical': 'b-solid-danger', 'High': 'b-warn', 'Medium': 'b-info', 'Normal': 'b-outline', 'Low': 'b-outline' };
    return '<span class="badge ' + (map[p] || 'b-outline') + '">' + F.esc(p || '—') + '</span>';
  }

  function avatarHtml(name, cls, src) {
    return '<span class="avatar ' + (cls || '') + '">' + (src ? '<img src="' + F.esc(src) + '" alt="">' : F.esc(F.initials(name))) + '</span>';
  }

  function thumb(src, cls, alt) {
    return src ? '<span class="' + (cls || 'thumb') + '" style="background-image:url(\'' + F.esc(src) + '\')" role="img" aria-label="' + F.esc(alt || '') + '"></span>'
      : '<span class="' + (cls || 'thumb') + '" style="display:grid;place-items:center;color:var(--faint)">' + icon('image', 15) + '</span>';
  }

  function actBtn(act, id, iconName, label, cls) {
    return '<button class="btn btn-ghost btn-xs ' + (cls || '') + '" data-act="' + act + '" data-id="' + F.esc(id) + '" title="' + F.esc(label) + '" aria-label="' + F.esc(label) + '">' + icon(iconName, 14) + '</button>';
  }

  /* =====================================================================
     EXPORT
     ===================================================================== */
  global.UI = {
    icon: icon, crest: CREST, F: F, palette: palette,
    toast: toast, modal: modal, confirm: confirmDialog, drawer: drawer, closeTop: closeTop,
    field: field, form: form, wireFields: wireFields, readForm: readForm, validate: validate,
    dataTable: dataTable, toCSV: toCSV, download: download, copyText: copyText,
    charts: { line: lineChart, bar: barChart, donut: donutChart, ring: ring, spark: spark, hbars: hbars, animateBars: animateBars },
    statusBadge: statusBadge, priorityBadge: priorityBadge, avatar: avatarHtml, thumb: thumb, act: actBtn
  };
})(window);
