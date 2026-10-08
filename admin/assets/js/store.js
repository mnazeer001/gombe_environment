/* =====================================================================
   Gombe State Ministry of Environment & Forest Resources
   ADMIN CONSOLE — store.js
   Data layer: seed content (mirrors the public website) + persistence.
   No dependencies. No backend. Everything lives in localStorage.
   ===================================================================== */
(function (global) {
  'use strict';

  var KEY = 'gmbeAdminConsole.v1';
  var SESSION = 'gmbeAdminSession.v1';

  /* ---------------------------------------------------------------------
     Storage shim.
     localStorage is blocked on opaque origins (opening the console straight
     from the file system in Chrome, or in a sandboxed iframe). When that
     happens we fall back to an in-memory store so the console still works
     for the session, and the app warns the user that changes will not
     persist. Serve the site over http(s) for real persistence.
  --------------------------------------------------------------------- */
  function makeShim() {
    var mem = {};
    return {
      __shim: true,
      getItem: function (k) { return Object.prototype.hasOwnProperty.call(mem, k) ? mem[k] : null; },
      setItem: function (k, v) { mem[k] = String(v); },
      removeItem: function (k) { delete mem[k]; },
      clear: function () { mem = {}; }
    };
  }
  function safeStore(kind) {
    try {
      var s = window[kind];
      var t = '__probe__' + Math.random();
      s.setItem(t, '1');
      s.removeItem(t);
      return { store: s, ok: true };
    } catch (e) {
      return { store: makeShim(), ok: false };
    }
  }
  var LS = safeStore('localStorage');
  var SS = safeStore('sessionStorage');

  /* ---------- date helpers (relative to "today" so the demo is always fresh) ---------- */
  function d(offsetDays, h, m) {
    var t = new Date();
    t.setDate(t.getDate() + offsetDays);
    t.setHours(h == null ? 9 : h, m == null ? 0 : m, 0, 0);
    return t.toISOString();
  }
  function day(offsetDays) { return d(offsetDays).slice(0, 10); }

  var uid = function (p) {
    return (p || 'id') + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7);
  };

  var IMG = '../assets/img/';

  /* =====================================================================
     SEED
     ===================================================================== */
  function seed() {
    return {
      meta: { version: 1, seededAt: new Date().toISOString() },

      /* ---------------- settings ---------------- */
      settings: {
        siteName: 'Ministry of Environment & Forest Resources',
        siteShort: 'Gombe Environment',
        government: 'Gombe State Government of Nigeria',
        tagline: 'The Jewel in the Savannah',
        footerBlurb: 'The lead agency for environmental protection, climate action, forestry and natural resource management in Gombe State — the Jewel in the Savannah.',
        accent: '#0b6b3a',
        crestVariant: 'green',
        address: 'Ministry of Environment & Forest Resources, State Secretariat Complex, Ashaka Road, Gombe, Gombe State, Nigeria',
        phone: '+234 803 000 0000',
        hotline: '0800 GOMBE ENV (0800 466 2336)',
        email: 'info@environment.gombestate.gov.ng',
        hours: 'Mon – Fri, 8:00am – 4:00pm',
        mapEmbed: 'https://www.openstreetmap.org/export/embed.html?bbox=11.14%2C10.24%2C11.24%2C10.32&layer=mapnik',
        socials: { facebook: '#', twitter: '#', youtube: '#', instagram: '', linkedin: '' },
        noticeBand: {
          enabled: true,
          label: 'Public notice',
          text: 'Monthly environmental sanitation — last Saturday of every month, 7:00am – 10:00am. Movement restrictions apply.',
          page: 'news'
        },
        maintenance: { enabled: false, message: 'We are updating our systems. Please check back shortly.' },
        features: {
          newsletter: true, onlineForms: true, galleryLightbox: true,
          heroSlider: true, seedlingRequests: true, eiaApplications: true, comments: false
        },
        seo: [
          { page: 'Home', file: 'index.html', title: 'Home | Ministry of Environment & Forest Resources, Gombe State Government of Nigeria', desc: 'Official website of the Gombe State Ministry of Environment & Forest Resources — environmental protection, afforestation, climate action, erosion control and waste management.', keywords: 'gombe environment, forestry, afforestation, climate action, erosion control' },
          { page: 'About', file: 'about.html', title: 'About Us | Ministry of Environment & Forest Resources, Gombe State', desc: 'Our mandate, vision, leadership and the agencies that deliver environmental services across Gombe State.', keywords: 'gombe ministry mandate, vision, mission, GOSEPA, ACReSAL' },
          { page: 'Departments', file: 'departments.html', title: 'Departments | Ministry of Environment & Forest Resources, Gombe State', desc: 'Eight directorates deliver the Ministry mandate, each headed by a Director reporting to the Permanent Secretary.', keywords: 'forestry directorate, environmental protection, climate change, biodiversity' },
          { page: 'Services', file: 'services.html', title: 'Services | Ministry of Environment & Forest Resources, Gombe State', desc: 'Permits, approvals, requests and public services offered by the Ministry to citizens, businesses and institutions.', keywords: 'EIA approval, tree felling permit, waste operator licence, seedlings' },
          { page: 'Projects', file: 'projects.html', title: 'Projects | Ministry of Environment & Forest Resources, Gombe State', desc: 'Flagship initiatives restoring land, controlling erosion, greening our cities and building climate resilience.', keywords: 'Gombe Goes Green, ACReSAL, gully erosion, Great Green Wall' },
          { page: 'News', file: 'news.html', title: 'News & Media | Ministry of Environment & Forest Resources, Gombe State', desc: 'Press releases, public notices, project updates and downloadable publications from the Ministry.', keywords: 'gombe environment news, press release, public notice' },
          { page: 'Gallery', file: 'gallery.html', title: 'Gallery | Ministry of Environment & Forest Resources, Gombe State', desc: 'Images from our afforestation drives, erosion control works, sanitation programmes and community engagements.', keywords: 'environment photos gombe, tree planting, erosion works' },
          { page: 'Contact', file: 'contact.html', title: 'Contact Us | Ministry of Environment & Forest Resources, Gombe State', desc: 'Reach the Ministry — head office, departmental desks, emergency hotline and online enquiry form.', keywords: 'contact gombe environment, report pollution, service desk' }
        ],
        officeHours: [
          { day: 'Monday', open: '08:00', close: '16:00', closed: false },
          { day: 'Tuesday', open: '08:00', close: '16:00', closed: false },
          { day: 'Wednesday', open: '08:00', close: '16:00', closed: false },
          { day: 'Thursday', open: '08:00', close: '16:00', closed: false },
          { day: 'Friday', open: '08:00', close: '16:00', closed: false },
          { day: 'Saturday', open: '', close: '', closed: true },
          { day: 'Sunday', open: '', close: '', closed: true }
        ],
        departmentsDesks: [
          { name: 'Service Desk — Block C', phone: '+234 803 000 0001', email: 'servicedesk@environment.gombestate.gov.ng' },
          { name: 'Forestry & Permits', phone: '+234 803 000 0002', email: 'forestry@environment.gombestate.gov.ng' },
          { name: 'Pollution & EIA', phone: '+234 803 000 0003', email: 'eia@environment.gombestate.gov.ng' },
          { name: 'Sanitation & Waste', phone: '+234 803 000 0004', email: 'waste@environment.gombestate.gov.ng' }
        ]
      },

      /* ---------------- animated counters shown on the public pages ---------------- */
      counters: [
        { id: 'c1', label: 'Trees planted since 2019', value: 5000000, suffix: '+', show: 'home,projects' },
        { id: 'c2', label: 'Hectares restored', value: 1000, suffix: '+', show: 'home,about' },
        { id: 'c3', label: 'LGAs served', value: 11, suffix: '', show: 'about' },
        { id: 'c4', label: 'Technical directorates', value: 8, suffix: '', show: 'about' },
        { id: 'c5', label: 'Gully kilometres stabilised', value: 50, suffix: 'km', show: 'projects' },
        { id: 'c6', label: 'Active programmes', value: 6, suffix: '', show: 'projects' }
      ],

      /* ---------------- users, roles, permissions ---------------- */
      currentUser: 'u-1',
      users: [
        { id: 'u-1', name: 'Amina Bello', email: 'amina.bello@environment.gombestate.gov.ng', role: 'Super Admin', dept: 'Admin & Finance', phone: '+234 803 111 2233', status: 'Active', lastLogin: d(0, 7, 42), created: day(-640), avatar: '' },
        { id: 'u-2', name: 'Ibrahim Sule', email: 'ibrahim.sule@environment.gombestate.gov.ng', role: 'Editor', dept: 'Planning, Research & Statistics', phone: '+234 803 222 3344', status: 'Active', lastLogin: d(-1, 16, 5), created: day(-410), avatar: '' },
        { id: 'u-3', name: 'Hauwa Mohammed', email: 'hauwa.m@environment.gombestate.gov.ng', role: 'Officer', dept: 'Environmental Protection', phone: '+234 803 333 4455', status: 'Active', lastLogin: d(-2, 11, 20), created: day(-320), avatar: '' },
        { id: 'u-4', name: 'Daniel Yakubu', email: 'daniel.y@environment.gombestate.gov.ng', role: 'Officer', dept: 'Forestry & Forest Resources', phone: '+234 803 444 5566', status: 'Active', lastLogin: d(-5, 9, 12), created: day(-260), avatar: '' },
        { id: 'u-5', name: 'Fatima Ahmed', email: 'fatima.a@environment.gombestate.gov.ng', role: 'Contributor', dept: 'Climate Change & Green Economy', phone: '+234 803 555 6677', status: 'Invited', lastLogin: '', created: day(-14), avatar: '' },
        { id: 'u-6', name: 'Emeka Nwosu', email: 'emeka.n@acreSAL-gombe.ng', role: 'Partner', dept: 'ACReSAL PIU', phone: '+234 803 666 7788', status: 'Suspended', lastLogin: d(-38, 13, 0), created: day(-190), avatar: '' }
      ],
      roles: [
        { id: 'r-1', name: 'Super Admin', level: 1, users: 1, desc: 'Unrestricted access including settings, users and destructive actions.', perms: { dashboard: 1, content: 1, publish: 1, enquiries: 1, permits: 1, media: 1, users: 1, settings: 1, analytics: 1, audit: 1 } },
        { id: 'r-2', name: 'Editor', level: 2, users: 1, desc: 'Create and publish all public content, manage media and enquiries.', perms: { dashboard: 1, content: 1, publish: 1, enquiries: 1, permits: 1, media: 1, users: 0, settings: 0, analytics: 1, audit: 0 } },
        { id: 'r-3', name: 'Officer', level: 3, users: 2, desc: 'Process enquiries, reports and permit applications; draft content.', perms: { dashboard: 1, content: 1, publish: 0, enquiries: 1, permits: 1, media: 1, users: 0, settings: 0, analytics: 0, audit: 0 } },
        { id: 'r-4', name: 'Contributor', level: 4, users: 1, desc: 'Submit drafts and upload media for review; no publishing rights.', perms: { dashboard: 1, content: 1, publish: 0, enquiries: 0, permits: 0, media: 1, users: 0, settings: 0, analytics: 0, audit: 0 } },
        { id: 'r-5', name: 'Partner', level: 5, users: 1, desc: 'Read-only access to shared project data and document downloads.', perms: { dashboard: 1, content: 0, publish: 0, enquiries: 0, permits: 0, media: 0, users: 0, settings: 0, analytics: 1, audit: 0 } }
      ],

      /* ---------------- newsroom ---------------- */
      news: [
        { id: 'n-1', title: 'Ministry opens 2026/2027 seedling distribution to schools and communities', cat: 'Press release', date: day(-20), author: 'Ibrahim Sule', status: 'Published', featured: true, image: IMG + 'nursery.jpg', tags: ['seedlings', '3G', 'schools'], excerpt: 'Over 600,000 assorted economic and forest tree seedlings are available free of charge to schools, community associations and farmers ahead of the planting season.', body: '<p>The Ministry of Environment &amp; Forest Resources has opened applications for the 2026/2027 seedling distribution exercise. Over 600,000 assorted economic and forest tree seedlings are available free of charge to schools, community associations and farmers ahead of the planting season.</p><p>Species on offer include moringa, mango, cashew, neem, gum arabic, eucalyptus and indigenous shade trees. Requests are received at the Service Desk, Block C, State Secretariat Complex, and through the Ministry website.</p><p>Applicants must indicate the planting site, the number of seedlings required and a commitment to after-care. Priority is given to public schools, women and youth cooperatives, and communities hosting shelterbelt projects.</p>', views: 4820, pinned: true },
        { id: 'n-2', title: 'Doma mega-college erosion works reach 70% completion', cat: 'Project update', date: day(-29), author: 'Hauwa Mohammed', status: 'Published', featured: true, image: IMG + 'erosion.jpg', tags: ['erosion', 'ACReSAL', 'Doma'], excerpt: 'Channelisation, gabion works and slope stabilisation are protecting classrooms, homes and farmland from further gully advance in the Doma catchment.', body: '<p>Works at the Doma mega-college gully complex have reached 70% completion. The intervention combines concrete channelisation, gabion check-dams, graded earthworks and bio-remediation planting.</p><p>When complete, the project will protect classrooms, staff quarters, nearby homes and several hectares of farmland from further gully advance.</p>', views: 3110, pinned: false },
        { id: 'n-3', title: 'Monthly environmental sanitation holds last Saturday of every month', cat: 'Public notice', date: day(-37), author: 'Amina Bello', status: 'Published', featured: false, image: IMG + 'waste.jpg', tags: ['sanitation', 'notice'], excerpt: 'Residents and businesses are reminded that movement restrictions apply from 7:00am to 10:00am; enforcement teams will be on patrol across the metropolis.', body: '<p>Residents and businesses are reminded that the monthly environmental sanitation exercise holds on the last Saturday of every month. Movement restrictions apply from 7:00am to 10:00am.</p><p>Enforcement teams will patrol the metropolis and issue sanctions where premises are found unclean after the exercise.</p>', views: 6240, pinned: true },
        { id: 'n-4', title: 'Green clubs from 40 schools join the state tree-planting drive', cat: 'Event', date: day(-48), author: 'Ibrahim Sule', status: 'Published', featured: false, image: IMG + 'afforestation.jpg', tags: ['education', 'green clubs', 'planting'], excerpt: 'Pupils and teachers planted shade and fruit trees in their school compounds as part of the Ministry environmental education programme.', body: '<p>Green clubs from forty public and private schools took part in the state tree-planting drive, establishing shade and fruit trees in their school compounds.</p>', views: 1980, pinned: false },
        { id: 'n-5', title: 'Ministry publishes catchment management plans for public comment', cat: 'Announcement', date: day(-64), author: 'Fatima Ahmed', status: 'Published', featured: false, image: '', tags: ['ACReSAL', 'watershed', 'consultation'], excerpt: 'Draft plans covering priority watersheds are open for stakeholder input for 30 days at the Planning, Research & Statistics Department.', body: '<p>Draft catchment management plans covering priority watersheds are open for stakeholder input for thirty days.</p><p>Comments may be submitted at the Planning, Research &amp; Statistics Department or by email.</p>', views: 1420, pinned: false },
        { id: 'n-6', title: 'Protecting the wildlife of our rocky outcrops and wetlands', cat: 'Feature', date: day(-83), author: 'Daniel Yakubu', status: 'Published', featured: false, image: IMG + 'wildlife.jpg', tags: ['biodiversity', 'conservation'], excerpt: 'A look at conservation work across the state remaining natural habitats and the communities helping to safeguard them.', body: '<p>From the rocky outcrops of the south to the seasonal wetlands of the north, Gombe State retains pockets of habitat that support a surprising diversity of birds, reptiles and small mammals.</p>', views: 2260, pinned: false },
        { id: 'n-7', title: 'How to apply for a tree-felling permit', cat: 'Public notice', date: day(-118), author: 'Daniel Yakubu', status: 'Published', featured: false, image: '', tags: ['permits', 'forestry', 'guide'], excerpt: 'Step-by-step guidance on the documents, fees and processing times for tree-felling and fuelwood movement permits.', body: '<p>Tree-felling permits are issued by the Directorate of Forestry &amp; Forest Resources. Applicants must submit a written application, evidence of land title or consent, and a site sketch.</p>', views: 5310, pinned: false },
        { id: 'n-8', title: 'Invitation to tender — nursery shade-netting and borehole rehabilitation', cat: 'Procurement', date: day(3), author: 'Amina Bello', status: 'Scheduled', featured: false, image: '', tags: ['procurement', 'tender', 'nurseries'], excerpt: 'Interested contractors may obtain bidding documents from the Procurement Desk, Admin & Finance Department.', body: '<p>The Ministry invites qualified contractors to bid for the supply and installation of shade netting at four zonal nurseries and the rehabilitation of two nursery boreholes.</p>', views: 0, pinned: false },
        { id: 'n-9', title: 'State launches air-quality monitoring at three industrial clusters', cat: 'Press release', date: day(-3), author: 'Hauwa Mohammed', status: 'Draft', featured: false, image: '', tags: ['pollution', 'monitoring', 'industry'], excerpt: 'Portable monitoring stations will record particulate matter, noise and effluent parameters across Ashaka, Bajoga and Gombe metropolis.', body: '<p>Portable monitoring stations will record particulate matter, noise levels and effluent parameters across three industrial clusters.</p><p><em>Draft — awaiting directorate sign-off.</em></p>', views: 0, pinned: false },
        { id: 'n-10', title: 'Recycling enterprise support: equipment handed to 120 waste pickers', cat: 'Project update', date: day(-9), author: 'Ibrahim Sule', status: 'In review', featured: false, image: IMG + 'waste.jpg', tags: ['circular economy', 'waste', 'jobs'], excerpt: 'Personal protective equipment, sorting tools and off-take linkages were provided under the materials recovery facility programme.', body: '<p>One hundred and twenty informal waste pickers received personal protective equipment, sorting tools and introductions to registered off-takers.</p>', views: 0, pinned: false }
      ],
      newsCategories: ['Press release', 'Public notice', 'Project update', 'Event', 'Announcement', 'Feature', 'Procurement'],

      /* ---------------- page content blocks ---------------- */
      pages: [
        { id: 'p-home', name: 'Home', file: 'index.html', status: 'Published', updated: day(-4), editor: 'Ibrahim Sule', blocks: [
          { id: 'b1', label: 'Hero eyebrow', type: 'text', value: 'Gombe Goes Green · 5,000,000+ trees planted' },
          { id: 'b2', label: 'Hero heading', type: 'text', value: 'Protecting our environment, greening our future' },
          { id: 'b3', label: 'Hero paragraph', type: 'textarea', value: 'We safeguard Gombe State land, air, water, forests and biodiversity — driving climate action, land restoration, clean sanitation and sustainable livelihoods for every community in the Jewel in the Savannah.' },
          { id: 'b4', label: 'Primary button', type: 'text', value: 'Explore Our Services' },
          { id: 'b5', label: 'Secondary button', type: 'text', value: 'View Flagship Projects' }
        ] },
        { id: 'p-about', name: 'About', file: 'about.html', status: 'Published', updated: day(-21), editor: 'Amina Bello', blocks: [
          { id: 'b1', label: 'Vision', type: 'textarea', value: 'A clean, green and climate-resilient Gombe State where every citizen enjoys a healthy environment and shares in the benefits of well-managed natural resources.' },
          { id: 'b2', label: 'Mission', type: 'textarea', value: 'To protect and restore the environment through effective regulation, evidence-based planning, large-scale land restoration and inclusive partnerships that create sustainable livelihoods.' },
          { id: 'b3', label: 'Core values', type: 'text', value: 'Integrity · Accountability · Professionalism · Inclusiveness · Innovation · Service to the citizen' }
        ] },
        { id: 'p-services', name: 'Services', file: 'services.html', status: 'Published', updated: day(-12), editor: 'Hauwa Mohammed', blocks: [
          { id: 'b1', label: 'Intro line', type: 'text', value: 'All applications are received at the Ministry Service Desk, Block C, State Secretariat Complex, Gombe.' },
          { id: 'b2', label: 'Anti-corruption notice', type: 'textarea', value: 'Statutory fees are published in the approved State Revenue Schedule. Always demand an official government receipt — the Ministry does not accept cash payments to staff.' }
        ] },
        { id: 'p-projects', name: 'Projects', file: 'projects.html', status: 'Published', updated: day(-6), editor: 'Ibrahim Sule', blocks: [
          { id: 'b1', label: 'Section heading', type: 'text', value: 'Our active programmes' },
          { id: 'b2', label: 'Section lede', type: 'textarea', value: 'Filter by theme to explore what the Ministry and its partners are delivering across the eleven local government areas.' },
          { id: 'b3', label: 'CTA heading', type: 'text', value: 'Adopt a site, plant a legacy' }
        ] },
        { id: 'p-contact', name: 'Contact', file: 'contact.html', status: 'Published', updated: day(-30), editor: 'Amina Bello', blocks: [
          { id: 'b1', label: 'Form intro', type: 'textarea', value: 'Enquiry, complaint or environmental report — use the form below and a desk officer will respond within three working days.' }
        ] },
        { id: 'p-news', name: 'News', file: 'news.html', status: 'Published', updated: day(-2), editor: 'Ibrahim Sule', blocks: [] },
        { id: 'p-departments', name: 'Departments', file: 'departments.html', status: 'Published', updated: day(-45), editor: 'Amina Bello', blocks: [] },
        { id: 'p-gallery', name: 'Gallery', file: 'gallery.html', status: 'Published', updated: day(-16), editor: 'Daniel Yakubu', blocks: [] }
      ],
      heroSlides: [
        { id: 'h-1', image: IMG + 'hero-1.jpg', alt: 'Afforestation drive in Gombe State', active: true, order: 1 },
        { id: 'h-2', image: IMG + 'afforestation.jpg', alt: 'Community tree planting', active: true, order: 2 },
        { id: 'h-3', image: IMG + 'erosion.jpg', alt: 'Gully erosion rehabilitation works', active: true, order: 3 },
        { id: 'h-4', image: IMG + 'nursery.jpg', alt: 'Seedlings at a state nursery', active: false, order: 4 }
      ],
      milestones: [
        { id: 'm-1', year: '1996', title: 'Gombe State created', text: 'Environmental functions are carried out under a combined ministry serving the new state.', order: 1 },
        { id: 'm-2', year: '2011', title: 'Erosion & watershed programme begins', text: 'The state joins the Nigeria Erosion and Watershed Management Project (NEWMAP) pipeline.', order: 2 },
        { id: 'm-3', year: '2019', title: 'Gombe Goes Green (3G) launched', text: 'A flagship afforestation campaign with a target of one million trees a year.', order: 3 },
        { id: 'm-4', year: '2022', title: 'ACReSAL comes on stream', text: 'The World Bank-supported project begins catchment restoration and climate-smart livelihood investments.', order: 4 },
        { id: 'm-5', year: '2024', title: 'Waste-to-wealth facility commissioned', text: 'A legacy dumpsite is converted into a materials recovery and recycling hub.', order: 5 },
        { id: 'm-6', year: '2026', title: 'Over 1,000 hectares restored', text: 'Cumulative land restoration passes 1,000 hectares with nearly 50km of gullies stabilised.', order: 6 }
      ],
      quickLinks: [
        { id: 'q-1', title: 'EIA Approval', text: 'Apply for environmental impact assessment clearance.', target: 'services.html', group: 'home', order: 1, enabled: true },
        { id: 'q-2', title: 'Free Seedlings', text: 'Request tree seedlings from our state nurseries.', target: 'services.html', group: 'home', order: 2, enabled: true },
        { id: 'q-3', title: 'Waste Services', text: 'Sanitation schedules, permits and waste operators.', target: 'services.html', group: 'home', order: 3, enabled: true },
        { id: 'q-4', title: 'Report a Hazard', text: 'Pollution, illegal logging, erosion, open dumping.', target: 'contact.html', group: 'home', order: 4, enabled: true }
      ],

      /* ---------------- projects & programmes ---------------- */
      projects: [
        { id: 'pr-1', name: 'Gombe Goes Green (3G) Initiative', theme: 'Forestry', tags: ['Flagship', 'Afforestation'], period: '2019 – date', partner: 'State Government', status: 'Active', progress: 78, budget: 1250000000, spent: 940000000, lga: 'Statewide', manager: 'Daniel Yakubu', image: IMG + 'afforestation.jpg', desc: 'Statewide tree planting, urban greening and shelterbelt establishment, with school green clubs and nursery enterprises for youth and women.', metric: 'Over five million trees planted to date.', metricLabel: 'Annual target progress' },
        { id: 'pr-2', name: 'ACReSAL — Agro-Climatic Resilience in Semi-Arid Landscapes', theme: 'Land restoration', tags: ['World Bank'], period: '2022 – date', partner: 'World Bank / Federal Ministry of Environment', status: 'Active', progress: 65, budget: 4800000000, spent: 3010000000, lga: 'Gombe, Akko, Dukku, Nafada', manager: 'Emeka Nwosu', image: IMG + 'erosion.jpg', desc: 'Catchment management plans, reclamation and afforestation of degraded land, borrow pits and landfills, roadside plantations, and community revolving funds.', metric: 'Implementation progress', metricLabel: 'Implementation progress' },
        { id: 'pr-3', name: 'Gully Erosion Control — GSU, FCE & Doma sites', theme: 'Erosion', tags: ['Watershed', 'Legacy & follow-on'], period: '2021 – date', partner: 'NEWMAP follow-on / State', status: 'Active', progress: 70, budget: 2650000000, spent: 1720000000, lga: 'Gombe', manager: 'Hauwa Mohammed', image: IMG + 'erosion.jpg', desc: 'Engineering and bio-remediation works across three major gully complexes stretching nearly 50km, protecting schools, homes, farmland and roads.', metric: 'Doma site works', metricLabel: 'Doma site works' },
        { id: 'pr-4', name: 'Materials Recovery & Recycling Facility', theme: 'Waste', tags: ['Circular economy', 'Waste-to-wealth'], period: '2024 – date', partner: 'GOSEPA / Private operator', status: 'Active', progress: 55, budget: 780000000, spent: 402000000, lga: 'Gombe', manager: 'Ibrahim Sule', image: IMG + 'waste.jpg', desc: 'Conversion of a legacy dumpsite into a sorting, baling and recycling hub, supporting informal waste pickers with equipment, safety gear and off-take linkages.', metric: 'Phase 2 expansion', metricLabel: 'Phase 2 expansion' },
        { id: 'pr-5', name: 'State Nursery Expansion Programme', theme: 'Forestry', tags: ['Nurseries', 'Seedling production'], period: 'Annual', partner: 'State / Community nurseries', status: 'Active', progress: 82, budget: 340000000, spent: 268000000, lga: 'Statewide', manager: 'Daniel Yakubu', image: IMG + 'nursery.jpg', desc: 'Upgrading zonal nurseries with boreholes, shade netting and improved germplasm to raise production of economic species.', metric: 'Season production target', metricLabel: 'Season production target' },
        { id: 'pr-6', name: 'Great Green Wall Shelterbelts & Conservation', theme: 'Climate', tags: ['Great Green Wall', 'Anti-desertification'], period: 'Ongoing', partner: 'NAGGW Agency', status: 'Active', progress: 48, budget: 1980000000, spent: 862000000, lga: 'Dukku, Nafada, Funakaye', manager: 'Fatima Ahmed', image: IMG + 'wildlife.jpg', desc: 'Shelterbelt establishment and biodiversity protection in frontline communities, with grazing reserves, fuel-efficient stoves and alternative livelihood support.', metric: 'Belt establishment', metricLabel: 'Belt establishment' },
        { id: 'pr-7', name: 'Urban Drainage & Flood Early Warning', theme: 'Erosion', tags: ['Flood', 'Early warning'], period: '2025 – 2027', partner: 'Gombe Capital Development Authority', status: 'Planning', progress: 12, budget: 620000000, spent: 41000000, lga: 'Gombe, Akko', manager: 'Hauwa Mohammed', image: '', desc: 'Drainage rehabilitation in flood-prone wards combined with a community-based early warning network and evacuation drills.', metric: 'Design & stakeholder phase', metricLabel: 'Design & stakeholder phase' },
        { id: 'pr-8', name: 'Clean Cooking & Fuel-Efficient Stoves', theme: 'Climate', tags: ['Livelihoods', 'Energy'], period: '2023 – 2026', partner: 'Development partners', status: 'Completed', progress: 100, budget: 210000000, spent: 208000000, lga: 'Balanga, Billiri, Kaltungo', manager: 'Fatima Ahmed', image: '', desc: 'Distribution of 24,000 fuel-efficient stoves and training of 300 women producers, reducing fuelwood demand in southern LGAs.', metric: 'Closed — final report published', metricLabel: 'Status' }
      ],

      /* ---------------- departments, staff, agencies ---------------- */
      departments: [
        { id: 'dp-1', name: 'Directorate of Forestry & Forest Resources', head: 'Daniel Yakubu', staff: 84, email: 'forestry@environment.gombestate.gov.ng', phone: '+234 803 000 0002', summary: 'Forest conservation, silviculture, timber licensing, log control, agro-forestry, and development of forest reserves.', duties: ['Management of the state forest estate, nurseries, shelterbelts and community forestry', 'Establishment and maintenance of forest reserves and shelterbelts', 'Production and distribution of tree seedlings', 'Issuance of tree-felling and fuelwood movement permits', 'Forest law enforcement and anti-desertification works'], order: 1, enabled: true },
        { id: 'dp-2', name: 'Directorate of Environmental Protection', head: 'Hauwa Mohammed', staff: 96, email: 'protection@environment.gombestate.gov.ng', phone: '+234 803 000 0003', summary: 'Environmental impact assessments, regulatory compliance, sanitation, waste management frameworks, and public health safety.', duties: ['Air, water, noise and soil quality monitoring', 'Industrial effluent and emissions compliance inspections', 'Abatement notices, sanctions and remediation orders', 'Management of hazardous waste and dumpsite regulation', 'Environmental impact assessment review and certification'], order: 2, enabled: true },
        { id: 'dp-3', name: 'Directorate of Climate Change & Green Economy', head: 'Fatima Ahmed', staff: 42, email: 'climate@environment.gombestate.gov.ng', phone: '+234 803 000 0005', summary: 'Carbon credit mapping, climate mitigation, adaptation strategies, renewable energy promotion, and green investment tracking.', duties: ['State climate action plan coordination and GHG inventory', 'Adaptation and resilience programming', 'Climate finance mobilisation and partner coordination', 'Renewable energy and clean cooking promotion'], order: 3, enabled: true },
        { id: 'dp-4', name: 'Directorate of Biodiversity & Wildlife Conservation', head: 'Musa Abubakar', staff: 38, email: 'wildlife@environment.gombestate.gov.ng', phone: '+234 803 000 0006', summary: 'Game reserve management, habitat protection, anti-poaching enforcement, eco-tourism, and preservation of endangered species.', duties: ['Habitat and species inventory and monitoring', 'Anti-poaching patrols and enforcement', 'Eco-tourism development', 'Community conservation agreements'], order: 4, enabled: true },
        { id: 'dp-5', name: 'Directorate of Environmental Monitoring & Pollution Control', head: 'Grace Audu', staff: 51, email: 'monitoring@environment.gombestate.gov.ng', phone: '+234 803 000 0007', summary: 'Air and water quality testing, industrial effluent monitoring, oil spill tracking, and regulation of hazardous waste.', duties: ['Routine and complaint-driven environmental monitoring', 'Laboratory analysis of air, water and soil samples', 'Effluent discharge permitting and compliance', 'Pollution incident response'], order: 5, enabled: true },
        { id: 'dp-6', name: 'Directorate of Ecosystem Restoration & Desertification Control', head: 'Sani Usman', staff: 47, email: 'restoration@environment.gombestate.gov.ng', phone: '+234 803 000 0008', summary: 'Gully erosion control, Great Green Wall projects, sand dune stabilisation, and rehabilitation of degraded lands.', duties: ['Gully erosion treatment and watershed management', 'Great Green Wall and shelterbelt establishment', 'Sand dune stabilisation', 'Degraded and borrow-pit land reclamation'], order: 6, enabled: true },
        { id: 'dp-7', name: 'Directorate of Admin & Finance', head: 'Amina Bello', staff: 112, email: 'admin@environment.gombestate.gov.ng', phone: '+234 803 000 0009', summary: 'Human resources, records, welfare, training, logistics, budgeting, procurement, accounting, and general administration.', duties: ['Human resources, records and staff welfare', 'Budget preparation and financial control', 'Procurement and contract administration', 'General administration and logistics'], order: 7, enabled: true },
        { id: 'dp-8', name: 'Directorate of Planning, Research & Statistics', head: 'Ibrahim Sule', staff: 36, email: 'planning@environment.gombestate.gov.ng', phone: '+234 803 000 0010', summary: 'Policy formulation, data collection, project monitoring, performance evaluation, and academic research collaboration.', duties: ['Ministry planning, M&E and annual reports', 'Environmental data collection and open data publishing', 'Project monitoring and performance evaluation', 'Research collaboration with tertiary institutions'], order: 8, enabled: true }
      ],
      staff: [
        { id: 'st-1', name: 'Hon. Yusuf L. Jalingo', role: 'Honourable Commissioner', dept: 'Office of the Commissioner', email: 'commissioner@environment.gombestate.gov.ng', phone: '+234 803 000 0000', photo: IMG + 'commissioner.png', featured: true, bio: 'Honourable Commissioner of Environment & Forest Resources, Gombe State.', order: 1, active: true },
        { id: 'st-2', name: 'Mrs. Amina Bello', role: 'Permanent Secretary', dept: 'Office of the Permanent Secretary', email: 'ps@environment.gombestate.gov.ng', phone: '+234 803 000 0011', photo: '', featured: true, bio: 'Head of the civil service establishment of the Ministry.', order: 2, active: true },
        { id: 'st-3', name: 'Mr. Daniel Yakubu', role: 'Director, Forestry', dept: 'Directorate of Forestry & Forest Resources', email: 'forestry@environment.gombestate.gov.ng', phone: '+234 803 000 0002', photo: '', featured: false, bio: '', order: 3, active: true },
        { id: 'st-4', name: 'Mrs. Fatima Ahmed', role: 'Director, Climate Change', dept: 'Directorate of Climate Change & Green Economy', email: 'climate@environment.gombestate.gov.ng', phone: '+234 803 000 0005', photo: '', featured: false, bio: '', order: 4, active: true },
        { id: 'st-5', name: 'Mrs. Hauwa Mohammed', role: 'Director, Environmental Protection', dept: 'Directorate of Environmental Protection', email: 'protection@environment.gombestate.gov.ng', phone: '+234 803 000 0003', photo: '', featured: false, bio: '', order: 5, active: true },
        { id: 'st-6', name: 'Mr. Musa Abubakar', role: 'Director, Biodiversity & Wildlife', dept: 'Directorate of Biodiversity & Wildlife Conservation', email: 'wildlife@environment.gombestate.gov.ng', phone: '+234 803 000 0006', photo: '', featured: false, bio: '', order: 6, active: true },
        { id: 'st-7', name: 'Mrs. Grace Audu', role: 'Director, Monitoring & Pollution Control', dept: 'Directorate of Environmental Monitoring', email: 'monitoring@environment.gombestate.gov.ng', phone: '+234 803 000 0007', photo: '', featured: false, bio: '', order: 7, active: true },
        { id: 'st-8', name: 'Mr. Sani Usman', role: 'Director, Ecosystem Restoration', dept: 'Directorate of Ecosystem Restoration', email: 'restoration@environment.gombestate.gov.ng', phone: '+234 803 000 0008', photo: '', featured: false, bio: '', order: 8, active: true },
        { id: 'st-9', name: 'Mr. Ibrahim Sule', role: 'Director, Planning, Research & Statistics', dept: 'Directorate of Planning', email: 'planning@environment.gombestate.gov.ng', phone: '+234 803 000 0010', photo: '', featured: false, bio: '', order: 9, active: true }
      ],
      agencies: [
        { id: 'ag-1', name: 'Gombe State Environmental Protection Agency (GOSEPA)', type: 'Agency', head: 'Mrs. Zainab Aliyu', desc: 'Statutory agency for environmental sanitation, waste management and pollution enforcement in the state.', contact: 'gosepa@environment.gombestate.gov.ng' },
        { id: 'ag-2', name: 'ACReSAL State Project Implementation Unit', type: 'Project unit', head: 'Mr. Emeka Nwosu', desc: 'Implements the World Bank-supported Agro-Climatic Resilience in Semi-Arid Landscapes project.', contact: 'piu@acresal-gombe.ng' },
        { id: 'ag-3', name: 'Gombe Goes Green (3G) Secretariat', type: 'Secretariat', head: 'Mr. Daniel Yakubu', desc: 'Coordinates the state flagship afforestation and urban greening campaign.', contact: '3g@environment.gombestate.gov.ng' },
        { id: 'ag-4', name: 'Great Green Wall / NAGGW Desk', type: 'Desk', head: 'Mrs. Fatima Ahmed', desc: 'State focal desk for the National Agency for the Great Green Wall programmes.', contact: 'naggw@environment.gombestate.gov.ng' }
      ],

      /* ---------------- services, fees, FAQs ---------------- */
      services: [
        { id: 'sv-1', title: 'EIA & Environmental Audit Approval', short: 'Screening, review and certification of Environmental Impact Assessments, Environmental Management Plans and audits.', dept: 'Environmental Protection', cta: 'Application steps', href: 'services.html#eia', icon: 'doc', enabled: true, order: 1 },
        { id: 'sv-2', title: 'Permits & Licences', short: 'Tree-felling permits, fuelwood movement permits, waste-operator licences, effluent discharge permits and quarry site clearances.', dept: 'Forestry & Forest Resources', cta: 'Fees & timelines', href: 'services.html#permits', icon: 'badge', enabled: true, order: 2 },
        { id: 'sv-3', title: 'Tree Seedling Supply', short: 'Free and subsidised economic and forest seedlings for schools, communities, farmers and corporate greening projects.', dept: 'Forestry & Forest Resources', cta: 'Request seedlings', href: 'services.html#seedlings', icon: 'tree', enabled: true, order: 3 },
        { id: 'sv-4', title: 'Waste & Sanitation Services', short: 'Collection schedules, bulk waste evacuation, licensing of private operators and support to recycling enterprises.', dept: 'Environmental Protection', cta: 'Sanitation notice', href: 'services.html#waste', icon: 'bin', enabled: true, order: 4 },
        { id: 'sv-5', title: 'Complaints & Enforcement', short: 'Investigation of pollution, illegal logging, open dumping, bush burning, noise nuisance and unsafe waste handling.', dept: 'Monitoring & Pollution Control', cta: 'Lodge a complaint', href: 'services.html#complaints', icon: 'alert', enabled: true, order: 5 },
        { id: 'sv-6', title: 'Environmental Education', short: 'School green clubs, community sensitisation, training for artisans and support to civil-society campaigns.', dept: 'Planning, Research & Statistics', cta: 'Request a session', href: 'services.html#education', icon: 'book', enabled: true, order: 6 },
        { id: 'sv-7', title: 'Erosion & Flood Advisory', short: 'Site assessment for communities threatened by gullies or flooding, plus technical guidance for developers.', dept: 'Ecosystem Restoration', cta: 'Request assessment', href: 'services.html#erosion', icon: 'wave', enabled: true, order: 7 },
        { id: 'sv-8', title: 'Environmental Data Requests', short: 'Access to rainfall, land-cover, degradation mapping and project monitoring datasets for research and planning.', dept: 'Planning, Research & Statistics', cta: 'Open data', href: 'services.html#data', icon: 'chart', enabled: true, order: 8 },
        { id: 'sv-9', title: 'Partnership & CSR Greening', short: 'Adopt-a-site schemes, corporate greening partnerships and development partner coordination.', dept: 'Office of the Permanent Secretary', cta: 'Partner with us', href: 'services.html#partnership', icon: 'handshake', enabled: true, order: 9 }
      ],
      fees: [
        { id: 'f-1', service: 'EIA report review & approval', docs: 'EIA report (6 hard copies + soft copy), site plan, company registration', time: '4 – 8 weeks', where: 'Pollution Control Dept.', amount: 250000, order: 1 },
        { id: 'f-2', service: 'Environmental audit certification', docs: 'Audit report, previous approval, compliance evidence', time: '3 – 4 weeks', where: 'Pollution Control Dept.', amount: 150000, order: 2 },
        { id: 'f-3', service: 'Tree-felling permit', docs: 'Application letter, land title/consent, site sketch', time: '5 – 10 working days', where: 'Forestry Dept.', amount: 25000, order: 3 },
        { id: 'f-4', service: 'Fuelwood / forest produce movement permit', docs: 'Application letter, source declaration, vehicle details', time: '2 – 3 working days', where: 'Forestry Dept.', amount: 8000, order: 4 },
        { id: 'f-5', service: 'Private waste operator licence', docs: 'CAC certificate, fleet list, disposal plan, tax clearance', time: '2 – 3 weeks', where: 'Sanitation Dept. / GOSEPA', amount: 120000, order: 5 },
        { id: 'f-6', service: 'Effluent discharge permit', docs: 'Effluent analysis, treatment description, site plan', time: '3 – 4 weeks', where: 'Pollution Control Dept.', amount: 180000, order: 6 },
        { id: 'f-7', service: 'Tree seedling request (bulk)', docs: 'Request letter, planting site details, maintenance commitment', time: '3 – 7 working days', where: 'Forestry Dept. / 3G Secretariat', amount: 0, order: 7 },
        { id: 'f-8', service: 'Erosion / flood site assessment', docs: 'Community or LGA request letter, location description', time: '2 – 4 weeks', where: 'Planning Dept. / ACReSAL PIU', amount: 0, order: 8 }
      ],
      faqs: [
        { id: 'fq-1', q: 'Do I need an EIA before starting construction?', a: 'Developments listed in the State Environmental Impact Assessment Regulations require screening and, where applicable, a full EIA before works begin. The Service Desk will advise on the category your project falls under.', open: false, order: 1 },
        { id: 'fq-2', q: 'How do I request free tree seedlings?', a: 'Submit a request letter stating the planting site, species preference, quantity and your after-care commitment. Schools, community associations and smallholder farmers are given priority.', open: false, order: 2 },
        { id: 'fq-3', q: 'How do I report illegal logging or open dumping?', a: 'Use the Report an Issue form, call the emergency hotline on 0800 GOMBE ENV, or visit the nearest departmental desk. Reports may be submitted anonymously and are treated confidentially.', open: false, order: 3 },
        { id: 'fq-4', q: 'What are the sanctions for skipping the monthly sanitation exercise?', a: 'Premises found unclean after the monthly exercise may receive an abatement notice, a fine, or prosecution under the state environmental sanitation law.', open: false, order: 4 },
        { id: 'fq-5', q: 'Can a private company operate a waste collection business in Gombe State?', a: 'Yes. Private operators must obtain a licence from the Sanitation Department / GOSEPA with CAC certificate, fleet list, disposal plan and tax clearance.', open: false, order: 5 }
      ],
      applySteps: [
        { id: 'as-1', step: '1. Enquire', text: 'Visit the Service Desk or call the Ministry to confirm the category of approval your project requires.', order: 1 },
        { id: 'as-2', step: '2. Submit', text: 'File your application letter with the prescribed documents and evidence of payment of the statutory fee.', order: 2 },
        { id: 'as-3', step: '3. Review', text: 'A technical committee reviews the submission; for EIAs a site verification and stakeholder display may apply.', order: 3 },
        { id: 'as-4', step: '4. Decision', text: 'The Ministry issues an approval, a conditional approval with mitigation requirements, or a refusal with reasons.', order: 4 },
        { id: 'as-5', step: '5. Monitor', text: 'Approved projects are monitored for compliance; audits may be required annually depending on the risk class.', order: 5 }
      ],
      partners: ['World Bank', 'NAGGW Agency', 'Federal Ministry of Environment', 'NESREA', 'Gombe State University', 'UNDP Nigeria', 'GOSEPA'],

      /* ---------------- media library ---------------- */
      media: [
        { id: 'md-1', name: 'hero-1.jpg', src: IMG + 'hero-1.jpg', type: 'image/jpeg', size: 312430, folder: 'Hero', alt: 'Aerial view of restored land in Gombe State', uploaded: day(-210), by: 'Ibrahim Sule', usedIn: ['home'], w: 1600, h: 1067 },
        { id: 'md-2', name: 'afforestation.jpg', src: IMG + 'afforestation.jpg', type: 'image/jpeg', size: 358905, folder: 'Programmes', alt: 'Community tree planting during the rainy season', uploaded: day(-190), by: 'Daniel Yakubu', usedIn: ['home', 'gallery'], w: 1600, h: 1067 },
        { id: 'md-3', name: 'erosion.jpg', src: IMG + 'erosion.jpg', type: 'image/jpeg', size: 348427, folder: 'Programmes', alt: 'Gully rehabilitation and slope stabilisation works', uploaded: day(-180), by: 'Hauwa Mohammed', usedIn: ['home', 'projects', 'gallery'], w: 1600, h: 1067 },
        { id: 'md-4', name: 'nursery.jpg', src: IMG + 'nursery.jpg', type: 'image/jpeg', size: 420761, folder: 'Programmes', alt: 'Seedlings raised at a state nursery', uploaded: day(-170), by: 'Daniel Yakubu', usedIn: ['home', 'news', 'gallery'], w: 1600, h: 1067 },
        { id: 'md-5', name: 'waste.jpg', src: IMG + 'waste.jpg', type: 'image/jpeg', size: 302890, folder: 'Sanitation', alt: 'Sorting recyclables at the materials recovery facility', uploaded: day(-150), by: 'Ibrahim Sule', usedIn: ['home', 'news', 'gallery'], w: 1600, h: 1067 },
        { id: 'md-6', name: 'wildlife.jpg', src: IMG + 'wildlife.jpg', type: 'image/jpeg', size: 314072, folder: 'Conservation', alt: 'Wildlife in a protected savannah habitat', uploaded: day(-140), by: 'Musa Abubakar', usedIn: ['home', 'projects', 'gallery'], w: 1600, h: 1067 },
        { id: 'md-7', name: 'commissioner.png', src: IMG + 'commissioner.png', type: 'image/png', size: 305760, folder: 'Leadership', alt: 'Hon. Yusuf L. Jalingo, Honourable Commissioner', uploaded: day(-260), by: 'Amina Bello', usedIn: ['home', 'about'], w: 900, h: 900 }
      ],
      mediaFolders: ['Hero', 'Programmes', 'Sanitation', 'Conservation', 'Leadership', 'Uploads'],

      /* ---------------- public gallery ---------------- */
      gallery: [
        { id: 'g-1', caption: 'Community tree planting during the rainy season', cat: 'Afforestation', src: IMG + 'afforestation.jpg', alt: 'Residents planting seedlings in a row', order: 1, published: true, added: day(-120) },
        { id: 'g-2', caption: 'Seedlings raised at a state nursery', cat: 'Afforestation', src: IMG + 'nursery.jpg', alt: 'Rows of potted seedlings under shade netting', order: 2, published: true, added: day(-118) },
        { id: 'g-3', caption: 'Gully rehabilitation and slope stabilisation works', cat: 'Erosion control', src: IMG + 'erosion.jpg', alt: 'Concrete channelisation along a stabilised gully', order: 3, published: true, added: day(-115) },
        { id: 'g-4', caption: 'Sorting recyclables at the materials recovery facility', cat: 'Waste management', src: IMG + 'waste.jpg', alt: 'Workers sorting plastic and metal for baling', order: 4, published: true, added: day(-110) },
        { id: 'g-5', caption: 'Restored savannah landscape with new shelterbelts', cat: 'Afforestation', src: IMG + 'hero-1.jpg', alt: 'Young shelterbelt trees across open savannah', order: 5, published: true, added: day(-104) },
        { id: 'g-6', caption: 'Wildlife in a protected savannah habitat', cat: 'Conservation', src: IMG + 'wildlife.jpg', alt: 'Birdlife on a rocky outcrop', order: 6, published: true, added: day(-96) },
        { id: 'g-7', caption: 'School green club members planting shade trees', cat: 'Events', src: IMG + 'nursery.jpg', alt: 'Pupils planting a shade tree in a school compound', order: 7, published: true, added: day(-88) },
        { id: 'g-8', caption: 'Channel works protecting homes and farmland', cat: 'Erosion control', src: IMG + 'erosion.jpg', alt: 'Drainage channel beside farmland', order: 8, published: true, added: day(-70) },
        { id: 'g-9', caption: 'Green jobs created through recycling enterprises', cat: 'Waste management', src: IMG + 'waste.jpg', alt: 'Baled recyclables ready for off-take', order: 9, published: true, added: day(-52) },
        { id: 'g-10', caption: 'Shelterbelt monitoring visit, Dukku frontline', cat: 'Conservation', src: IMG + 'wildlife.jpg', alt: 'Officers inspecting shelterbelt survival rates', order: 10, published: false, added: day(-11) }
      ],
      galleryCats: ['Afforestation', 'Erosion control', 'Waste management', 'Conservation', 'Events'],

      /* ---------------- enquiries from the contact form ---------------- */
      messages: [
        { id: 'ms-1', ref: 'GM-2026-481902', name: 'Aisha Lawan', email: 'aisha.lawan@gmail.com', phone: '0803 445 6677', lga: 'Gombe', subject: 'Report pollution or open dumping', location: 'Behind Panteka market, Ward 8', message: 'A large heap of refuse has been burning beside the market for three days. The smoke is affecting traders and nearby residents. Please send an enforcement team.', date: d(0, 8, 12), status: 'New', priority: 'High', assigned: 'Hauwa Mohammed', read: false, starred: true, reply: '' },
        { id: 'ms-2', ref: 'GM-2026-481877', name: 'Bala Audu', email: 'bala.audu@yahoo.com', phone: '0806 221 4488', lga: 'Akko', subject: 'Erosion or flooding concern', location: 'Kashere road, near the primary school', message: 'The gully behind the primary school has advanced about four metres this rainy season and is threatening the classroom block. We request a site assessment.', date: d(0, 7, 30), status: 'New', priority: 'Urgent', assigned: '', read: false, starred: true, reply: '' },
        { id: 'ms-3', ref: 'GM-2026-481840', name: 'Green Future Schools', email: 'info@greenfuture.ng', phone: '0802 990 1122', lga: 'Billiri', subject: 'Request tree seedlings', location: 'School compound, Billiri town', message: 'Our green club would like to request 300 mango and moringa seedlings for planting in the school compound and along the access road this season.', date: d(-1, 14, 5), status: 'Open', priority: 'Normal', assigned: 'Daniel Yakubu', read: true, starred: false, reply: 'Thank you for your request. Kindly submit a planting plan and a named after-care focal person so we can schedule collection from the Billiri zonal nursery.' },
        { id: 'ms-4', ref: 'GM-2026-481806', name: 'Nasarawa Quarry Ltd', email: 'ops@nasarawaquarry.ng', phone: '0805 334 7788', lga: 'Kaltungo', subject: 'Permit, licence or EIA enquiry', location: 'Kaltungo quarry site', message: 'We are expanding our quarry operations and would like to confirm whether a fresh EIA is required, or whether an environmental audit of the existing approval will suffice.', date: d(-1, 11, 40), status: 'Open', priority: 'High', assigned: 'Hauwa Mohammed', read: true, starred: false, reply: '' },
        { id: 'ms-5', ref: 'GM-2026-481771', name: 'Musa Ibrahim', email: 'musa.ibrahim82@gmail.com', phone: '0813 667 2211', lga: 'Dukku', subject: 'Report illegal logging or bush burning', location: 'Dukku forest reserve fringe', message: 'Several mature trees were felled and carted away at night last week. Charcoal kilns are also visible along the reserve boundary.', date: d(-2, 17, 22), status: 'In progress', priority: 'Urgent', assigned: 'Daniel Yakubu', read: true, starred: true, reply: 'Your report has been forwarded to the Forest Guard unit. A joint patrol with the Nigeria Police is scheduled.' },
        { id: 'ms-6', ref: 'GM-2026-481735', name: 'Zainab Aliyu', email: 'z.aliyu@outlook.com', phone: '0706 118 9090', lga: 'Nafada', subject: 'General enquiry', location: '', message: 'Please can you share the schedule of statutory fees for waste operator licences? We are a start-up collection company.', date: d(-3, 9, 15), status: 'Resolved', priority: 'Low', assigned: 'Ibrahim Sule', read: true, starred: false, reply: 'The approved schedule of fees is available under Downloads on our website. A copy has also been attached to this reply.' },
        { id: 'ms-7', ref: 'GM-2026-481700', name: 'Chinedu Okafor', email: 'chinedu.okafor@buildwell.ng', phone: '0809 774 3322', lga: 'Gombe', subject: 'Partnership / CSR proposal', location: 'Ashaka Road', message: 'Buildwell Nigeria would like to adopt a shelterbelt segment under your adopt-a-site scheme as part of our CSR programme. Kindly share the partnership framework.', date: d(-4, 13, 50), status: 'Open', priority: 'Normal', assigned: 'Amina Bello', read: true, starred: false, reply: '' },
        { id: 'ms-8', ref: 'GM-2026-481662', name: 'Halima Yusuf', email: 'halima.yusuf@gmail.com', phone: '0816 220 5544', lga: 'Yamaltu/Deba', subject: 'Feedback about our service', location: '', message: 'The seedling distribution at Deba was well organised. My only suggestion is to open collection over two days to reduce the queue.', date: d(-5, 10, 5), status: 'Resolved', priority: 'Low', assigned: 'Ibrahim Sule', read: true, starred: false, reply: 'Thank you for the constructive feedback — it has been noted for the next distribution window.' },
        { id: 'ms-9', ref: 'GM-2026-481628', name: 'Abubakar Sadiq', email: 'abba.sadiq@yahoo.com', phone: '0802 556 1212', lga: 'Funakaye', subject: 'Report pollution or open dumping', location: 'Bajoga roadside, near the filling station', message: 'Used engine oil is being discharged into the drainage beside the filling station. The stream downstream is discoloured.', date: d(-6, 15, 35), status: 'In progress', priority: 'High', assigned: 'Grace Audu', read: true, starred: false, reply: '' },
        { id: 'ms-10', ref: 'GM-2026-481590', name: 'Gombe Tech Hub', email: 'hello@gombetechhub.ng', phone: '0703 889 4455', lga: 'Gombe', subject: 'Environmental Data Requests', location: '', message: 'We are building a flood risk visualisation for student projects. Can we access the rainfall and land-cover datasets published by the Planning Department?', date: d(-8, 12, 0), status: 'Resolved', priority: 'Normal', assigned: 'Ibrahim Sule', read: true, starred: false, reply: 'Access granted under our open data terms. A download link has been sent to your email.' },
        { id: 'ms-11', ref: 'GM-2026-481544', name: 'Yakubu Danjuma', email: 'yakubu.d@gmail.com', phone: '0813 004 7788', lga: 'Shongom', subject: 'Erosion or flooding concern', location: 'Bohu ward', message: 'Our farmland is losing topsoil every rainy season. Is there a community programme we can join for terracing and planting?', date: d(-10, 8, 45), status: 'Closed', priority: 'Normal', assigned: 'Sani Usman', read: true, starred: false, reply: 'You have been registered for the next ACReSAL community revolving fund window in your ward.' },
        { id: 'ms-12', ref: 'GM-2026-481501', name: 'Fatima Bello', email: 'fatima.bello@school.ng', phone: '0806 112 3344', lga: 'Balanga', subject: 'Request tree seedlings', location: 'Government Day Secondary School, Balanga', message: 'We would like 150 shade trees for the school compound ahead of the planting season.', date: d(-12, 9, 25), status: 'Closed', priority: 'Low', assigned: 'Daniel Yakubu', read: true, starred: false, reply: 'Seedlings released on the date indicated in your acknowledgement slip.' }
      ],
      messageSubjects: ['General enquiry', 'Report pollution or open dumping', 'Report illegal logging or bush burning', 'Erosion or flooding concern', 'Request tree seedlings', 'Permit, licence or EIA enquiry', 'Partnership / CSR proposal', 'Feedback about our service', 'Environmental Data Requests'],
      lgas: ['Akko', 'Balanga', 'Billiri', 'Dukku', 'Funakaye', 'Gombe', 'Kaltungo', 'Kwami', 'Nafada', 'Shongom', 'Yamaltu/Deba'],

      /* ---------------- environmental incident reports ---------------- */
      reports: [
        { id: 'rp-1', ref: 'ENV-2026-0142', type: 'Open dumping & burning', lga: 'Gombe', location: 'Panteka market rear, Ward 8', lat: 10.2861, lng: 11.1673, source: 'Contact form', severity: 'High', status: 'Verified', officer: 'Hauwa Mohammed', raised: d(0, 8, 20), updated: d(0, 10, 5), note: 'Enforcement team dispatched; abatement notice to be served on the market association.' },
        { id: 'rp-2', ref: 'ENV-2026-0141', type: 'Gully erosion', lga: 'Akko', location: 'Kashere road, behind primary school', lat: 10.1480, lng: 11.2010, source: 'Contact form', severity: 'Critical', status: 'Site visit scheduled', officer: 'Sani Usman', raised: d(0, 7, 45), updated: d(0, 9, 10), note: 'Requires ACReSAL PIU technical assessment; school authorities informed.' },
        { id: 'rp-3', ref: 'ENV-2026-0140', type: 'Illegal logging', lga: 'Dukku', location: 'Dukku forest reserve fringe', lat: 10.8290, lng: 10.7720, source: 'Hotline', severity: 'Critical', status: 'Under investigation', officer: 'Daniel Yakubu', raised: d(-2, 18, 0), updated: d(-1, 11, 30), note: 'Joint patrol with police forestry unit. Two suspects identified.' },
        { id: 'rp-4', ref: 'ENV-2026-0139', type: 'Effluent discharge', lga: 'Funakaye', location: 'Bajoga roadside filling station', lat: 10.4870, lng: 11.3560, source: 'Contact form', severity: 'High', status: 'Sampling done', officer: 'Grace Audu', raised: d(-6, 16, 0), updated: d(-4, 9, 40), note: 'Water samples at the laboratory; hydrocarbon levels above permitted threshold.' },
        { id: 'rp-5', ref: 'ENV-2026-0138', type: 'Bush burning', lga: 'Balanga', location: 'Along Balanga–Biliri road', lat: 9.9480, lng: 11.5640, source: 'Field patrol', severity: 'Medium', status: 'Resolved', officer: 'Musa Abubakar', raised: d(-11, 13, 20), updated: d(-9, 10, 0), note: 'Fire suppressed by community volunteers; sensitisation held with farmers.' },
        { id: 'rp-6', ref: 'ENV-2026-0137', type: 'Noise nuisance', lga: 'Gombe', location: 'Tudun Wada nightlife cluster', lat: 10.2930, lng: 11.1780, source: 'Contact form', severity: 'Low', status: 'Monitoring', officer: 'Grace Audu', raised: d(-14, 21, 40), updated: d(-12, 8, 30), note: 'Decibel readings taken at 10pm on three consecutive nights.' },
        { id: 'rp-7', ref: 'ENV-2026-0136', type: 'Hazardous waste', lga: 'Kwami', location: 'Abandoned workshop site', lat: 10.3480, lng: 11.2870, source: 'GOSEPA referral', severity: 'High', status: 'Verified', officer: 'Hauwa Mohammed', raised: d(-18, 10, 15), updated: d(-15, 14, 45), note: 'Drums of used oil to be evacuated by a licensed operator.' },
        { id: 'rp-8', ref: 'ENV-2026-0135', type: 'Sand mining', lga: 'Nafada', location: 'Deba river bank', lat: 10.6740, lng: 11.3010, source: 'Community report', severity: 'Medium', status: 'Closed', officer: 'Sani Usman', raised: d(-25, 9, 0), updated: d(-20, 16, 20), note: 'Operators regularised with permits and monitoring conditions.' }
      ],
      reportTypes: ['Open dumping & burning', 'Gully erosion', 'Illegal logging', 'Effluent discharge', 'Bush burning', 'Noise nuisance', 'Hazardous waste', 'Sand mining', 'Air pollution', 'Flooding'],

      /* ---------------- permits & applications ---------------- */
      permits: [
        { id: 'pm-1', ref: 'PER-2026-0312', type: 'EIA report review & approval', applicant: 'Nasarawa Quarry Ltd', contact: 'ops@nasarawaquarry.ng', phone: '0805 334 7788', lga: 'Kaltungo', dept: 'Environmental Protection', officer: 'Hauwa Mohammed', fee: 250000, paid: true, status: 'Site verification', submitted: d(-14, 10, 0), due: d(9), decided: '', notes: 'Expanded pit boundary requires fresh screening; stakeholder display pending.' },
        { id: 'pm-2', ref: 'PER-2026-0311', type: 'Tree-felling permit', applicant: 'Gombe Capital Development Authority', contact: 'works@gcda.gov.ng', phone: '0802 118 4455', lga: 'Gombe', dept: 'Forestry & Forest Resources', officer: 'Daniel Yakubu', fee: 25000, paid: true, status: 'Approved', submitted: d(-19, 9, 30), due: d(-9), decided: d(-10, 12, 0), notes: '84 trees cleared for road alignment; replacement planting of 250 seedlings mandated.' },
        { id: 'pm-3', ref: 'PER-2026-0310', type: 'Private waste operator licence', applicant: 'CleanCity Gombe Ltd', contact: 'hello@cleancity.ng', phone: '0703 224 8899', lga: 'Gombe', dept: 'Environmental Protection', officer: 'Ibrahim Sule', fee: 120000, paid: false, status: 'Under review', submitted: d(-8, 14, 20), due: d(6), decided: '', notes: 'Awaiting tax clearance certificate and disposal plan.' },
        { id: 'pm-4', ref: 'PER-2026-0309', type: 'Effluent discharge permit', applicant: 'Savannah Beverages Plc', contact: 'compliance@savannahbev.ng', phone: '0806 557 1234', lga: 'Akko', dept: 'Monitoring & Pollution Control', officer: 'Grace Audu', fee: 180000, paid: true, status: 'Under review', submitted: d(-11, 11, 10), due: d(4), decided: '', notes: 'Effluent analysis shows BOD slightly above limit; treatment upgrade requested.' },
        { id: 'pm-5', ref: 'PER-2026-0308', type: 'Fuelwood / forest produce movement permit', applicant: 'Alhaji Sani Charcoal Union', contact: '—', phone: '0813 664 2200', lga: 'Dukku', dept: 'Forestry & Forest Resources', officer: 'Daniel Yakubu', fee: 8000, paid: true, status: 'Approved', submitted: d(-6, 8, 50), due: d(-4), decided: d(-5, 15, 0), notes: 'Three vehicles; source declaration verified against reserve records.' },
        { id: 'pm-6', ref: 'PER-2026-0307', type: 'Tree seedling request (bulk)', applicant: 'Green Future Schools', contact: 'info@greenfuture.ng', phone: '0802 990 1122', lga: 'Billiri', dept: 'Forestry & Forest Resources', officer: 'Daniel Yakubu', fee: 0, paid: true, status: 'New', submitted: d(-1, 14, 10), due: d(5), decided: '', notes: '300 mango and moringa seedlings requested for school compounds.' },
        { id: 'pm-7', ref: 'PER-2026-0306', type: 'Environmental audit certification', applicant: 'Ashaka Cement Distribution Depot', contact: 'hse@ashakadepot.ng', phone: '0809 442 7766', lga: 'Funakaye', dept: 'Environmental Protection', officer: 'Hauwa Mohammed', fee: 150000, paid: true, status: 'Conditional approval', submitted: d(-24, 10, 40), due: d(-3), decided: d(-4, 9, 20), notes: 'Approved subject to installation of dust suppression within 90 days.' },
        { id: 'pm-8', ref: 'PER-2026-0305', type: 'Erosion / flood site assessment', applicant: 'Kashere Community Development Association', contact: '—', phone: '0803 778 1100', lga: 'Akko', dept: 'Ecosystem Restoration', officer: 'Sani Usman', fee: 0, paid: true, status: 'Site verification', submitted: d(-3, 9, 0), due: d(11), decided: '', notes: 'Linked to incident report ENV-2026-0141.' },
        { id: 'pm-9', ref: 'PER-2026-0304', type: 'Tree-felling permit', applicant: 'Mrs. Rebecca Jonah', contact: '—', phone: '0816 330 8899', lga: 'Balanga', dept: 'Forestry & Forest Resources', officer: 'Daniel Yakubu', fee: 25000, paid: false, status: 'Rejected', submitted: d(-30, 12, 30), due: d(-22), decided: d(-23, 11, 0), notes: 'Land title/consent not provided; applicant advised to re-apply with documentation.' },
        { id: 'pm-10', ref: 'PER-2026-0303', type: 'Quarry site clearance', applicant: 'Jalingo Aggregates Ltd', contact: 'info@jalingoagg.ng', phone: '0805 116 3344', lga: 'Shongom', dept: 'Environmental Protection', officer: 'Hauwa Mohammed', fee: 250000, paid: true, status: 'Approved', submitted: d(-41, 9, 15), due: d(-27), decided: d(-28, 14, 30), notes: 'Valid for 24 months with quarterly monitoring returns.' }
      ],
      permitTypes: ['EIA report review & approval', 'Environmental audit certification', 'Tree-felling permit', 'Fuelwood / forest produce movement permit', 'Private waste operator licence', 'Effluent discharge permit', 'Tree seedling request (bulk)', 'Erosion / flood site assessment', 'Quarry site clearance'],
      permitFlow: ['New', 'Under review', 'Site verification', 'Approved', 'Conditional approval', 'Rejected'],

      /* ---------------- events ---------------- */
      events: [
        { id: 'ev-1', title: 'Monthly environmental sanitation', date: day(saturdayOffset(0)), time: '07:00', end: '10:00', type: 'Sanitation', location: 'Statewide', owner: 'GOSEPA', color: 'gold', public: true, note: 'Movement restrictions apply 7:00am – 10:00am.' },
        { id: 'ev-2', title: 'Seedling collection window — Billiri zone', date: day(2), time: '09:00', end: '15:00', type: 'Forestry', location: 'Billiri zonal nursery', owner: 'Daniel Yakubu', color: '', public: true, note: 'Approved school and community requests.' },
        { id: 'ev-3', title: 'ACReSAL catchment stakeholder meeting', date: day(5), time: '10:00', end: '13:00', type: 'Meeting', location: 'Ministry conference room, Block C', owner: 'Fatima Ahmed', color: 'info', public: false, note: 'Draft catchment management plans for comment.' },
        { id: 'ev-4', title: 'Tender opening — nursery shade netting', date: day(7), time: '12:00', end: '14:00', type: 'Procurement', location: 'Admin & Finance Department', owner: 'Amina Bello', color: 'purple', public: false, note: 'Procurement committee and bidders present.' },
        { id: 'ev-5', title: 'Gully inspection visit — Doma site', date: day(9), time: '08:30', end: '12:30', type: 'Field visit', location: 'Doma mega-college', owner: 'Sani Usman', color: 'danger', public: false, note: 'Progress verification ahead of the quarterly report.' },
        { id: 'ev-6', title: 'School green club training', date: day(12), time: '09:00', end: '14:00', type: 'Education', location: 'Gombe metropolis (4 venues)', owner: 'Ibrahim Sule', color: '', public: true, note: 'Training for 60 club coordinators.' },
        { id: 'ev-7', title: 'World Environment Day state launch', date: day(21), time: '08:00', end: '16:00', type: 'Event', location: 'State Secretariat forecourt', owner: 'Office of the Commissioner', color: 'gold', public: true, note: 'Tree planting, exhibition and media engagements.' },
        { id: 'ev-8', title: 'Monthly environmental sanitation', date: day(saturdayOffset(4)), time: '07:00', end: '10:00', type: 'Sanitation', location: 'Statewide', owner: 'GOSEPA', color: 'gold', public: true, note: '' },
        { id: 'ev-9', title: 'Air-quality monitoring rollout briefing', date: day(-3), time: '11:00', end: '12:30', type: 'Meeting', location: 'Monitoring & Pollution Control', owner: 'Grace Audu', color: 'info', public: false, note: 'Completed — press release in draft.' },
        { id: 'ev-10', title: 'Waste picker equipment handover', date: day(-9), time: '10:00', end: '12:00', type: 'Event', location: 'Materials recovery facility', owner: 'Ibrahim Sule', color: '', public: true, note: '120 beneficiaries.' }
      ],
      eventTypes: ['Sanitation', 'Forestry', 'Meeting', 'Procurement', 'Field visit', 'Education', 'Event', 'Training'],

      /* ---------------- downloadable documents ---------------- */
      documents: [
        { id: 'dc-1', title: 'State of the Environment Report', cat: 'Reports', file: 'soer-2026.pdf', size: 4820, format: 'PDF', downloads: 1842, updated: day(-40), public: true, owner: 'Planning, Research & Statistics' },
        { id: 'dc-2', title: 'Gombe State Climate Change Action Plan', cat: 'Policy', file: 'climate-action-plan.pdf', size: 3210, format: 'PDF', downloads: 1265, updated: day(-120), public: true, owner: 'Climate Change & Green Economy' },
        { id: 'dc-3', title: 'Environmental Sanitation Calendar 2026', cat: 'Notices', file: 'sanitation-calendar-2026.pdf', size: 420, format: 'PDF', downloads: 3980, updated: day(-30), public: true, owner: 'Environmental Protection' },
        { id: 'dc-4', title: 'Approved Schedule of Fees', cat: 'Notices', file: 'schedule-of-fees.pdf', size: 610, format: 'PDF', downloads: 2740, updated: day(-18), public: true, owner: 'Admin & Finance' },
        { id: 'dc-5', title: 'EIA Application Form (ENV-01)', cat: 'Forms', file: 'env-01-eia-form.pdf', size: 280, format: 'PDF', downloads: 1610, updated: day(-95), public: true, owner: 'Environmental Protection' },
        { id: 'dc-6', title: 'Tree-Felling Permit Form (FOR-02)', cat: 'Forms', file: 'for-02-felling.pdf', size: 190, format: 'PDF', downloads: 2205, updated: day(-95), public: true, owner: 'Forestry & Forest Resources' },
        { id: 'dc-7', title: 'Seedling Request Form (FOR-07)', cat: 'Forms', file: 'for-07-seedlings.pdf', size: 165, format: 'PDF', downloads: 4412, updated: day(-60), public: true, owner: 'Forestry & Forest Resources' },
        { id: 'dc-8', title: 'ACReSAL Catchment Management Plans (Draft)', cat: 'Reports', file: 'acresal-cmp-draft.pdf', size: 8640, format: 'PDF', downloads: 512, updated: day(-12), public: true, owner: 'ACReSAL PIU' },
        { id: 'dc-9', title: 'Great Green Wall State Progress Report', cat: 'Reports', file: 'ggw-progress.pdf', size: 2410, format: 'PDF', downloads: 388, updated: day(-55), public: false, owner: 'Ecosystem Restoration' },
        { id: 'dc-10', title: 'Freedom of Information — Request Guide', cat: 'Policy', file: 'foi-guide.pdf', size: 340, format: 'PDF', downloads: 720, updated: day(-200), public: true, owner: 'Admin & Finance' }
      ],
      docCats: ['Reports', 'Policy', 'Notices', 'Forms', 'Data'],

      /* ---------------- newsletter ---------------- */
      subscribers: (function () {
        var first = ['Aisha', 'Musa', 'Grace', 'Ibrahim', 'Fatima', 'Daniel', 'Zainab', 'Yakubu', 'Hauwa', 'Emeka', 'Blessing', 'Sani', 'Ngozi', 'Abdul', 'Rebecca', 'Chinedu', 'Halima', 'Bala', 'Maryam', 'Joseph'];
        var last = ['Lawan', 'Audu', 'Okoro', 'Sule', 'Ahmed', 'Yakubu', 'Aliyu', 'Danjuma', 'Mohammed', 'Nwosu', 'Eze', 'Usman', 'Okafor', 'Abubakar', 'Jonah', 'Bello', 'Yusuf', 'Amadu', 'Ibrahim', 'Chukwu'];
        var doms = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'gombestate.gov.ng', 'environment.gombestate.gov.ng'];
        var out = [], i, f, l;
        for (i = 0; i < 46; i++) {
          f = first[i % first.length]; l = last[(i * 7) % last.length];
          out.push({
            id: 'sb-' + (i + 1), email: (f + '.' + l + (i > 19 ? i : '') + '@' + doms[i % doms.length]).toLowerCase(),
            name: f + ' ' + l, lga: ['Akko', 'Balanga', 'Billiri', 'Dukku', 'Funakaye', 'Gombe', 'Kaltungo', 'Kwami', 'Nafada', 'Shongom', 'Yamaltu/Deba'][i % 11],
            interest: ['General updates', 'Forestry & planting', 'Policy & notices', 'Procurement', 'Research & data'][(i * 3) % 5],
            status: i % 13 === 0 ? 'Unsubscribed' : 'Subscribed', joined: day(-(400 - i * 9)), opens: (i * 17) % 42, source: i % 4 === 0 ? 'Import' : 'Website form'
          });
        }
        return out;
      })(),
      campaigns: [
        { id: 'cp-1', subject: 'Seedling distribution opens for the 2026/2027 season', audience: 'All subscribers', sent: day(-19), status: 'Sent', recipients: 412, opens: 268, clicks: 141, bounces: 4, by: 'Ibrahim Sule' },
        { id: 'cp-2', subject: 'Monthly sanitation reminder — last Saturday', audience: 'All subscribers', sent: day(-36), status: 'Sent', recipients: 410, opens: 322, clicks: 88, bounces: 6, by: 'Amina Bello' },
        { id: 'cp-3', subject: 'Catchment management plans open for public comment', audience: 'Policy & notices', sent: day(-60), status: 'Sent', recipients: 138, opens: 96, clicks: 61, bounces: 1, by: 'Fatima Ahmed' },
        { id: 'cp-4', subject: 'Invitation to tender — nursery shade netting', audience: 'Procurement', sent: '', status: 'Draft', recipients: 0, opens: 0, clicks: 0, bounces: 0, by: 'Amina Bello' }
      ],

      /* ---------------- tasks ---------------- */
      tasks: [
        { id: 'tk-1', title: 'Sign off draft press release on air-quality monitoring', owner: 'Amina Bello', due: day(1), priority: 'High', done: false, module: 'Newsroom' },
        { id: 'tk-2', title: 'Publish tender notice for nursery shade netting', owner: 'Ibrahim Sule', due: day(3), priority: 'High', done: false, module: 'Newsroom' },
        { id: 'tk-3', title: 'Respond to Kashere gully erosion request', owner: 'Sani Usman', due: day(0), priority: 'Urgent', done: false, module: 'Enquiries' },
        { id: 'tk-4', title: 'Upload Q3 project photographs to media library', owner: 'Daniel Yakubu', due: day(-1), priority: 'Normal', done: false, module: 'Media' },
        { id: 'tk-5', title: 'Verify effluent lab results for Savannah Beverages', owner: 'Grace Audu', due: day(4), priority: 'High', done: false, module: 'Permits' },
        { id: 'tk-6', title: 'Update approved schedule of fees download', owner: 'Amina Bello', due: day(-4), priority: 'Medium', done: true, module: 'Documents' },
        { id: 'tk-7', title: 'Prepare World Environment Day programme flyer', owner: 'Ibrahim Sule', due: day(14), priority: 'Normal', done: false, module: 'Events' },
        { id: 'tk-8', title: 'Review 3 pending gallery submissions', owner: 'Daniel Yakubu', due: day(6), priority: 'Low', done: false, module: 'Gallery' },
        { id: 'tk-9', title: 'Export enquiry data for quarterly report', owner: 'Hauwa Mohammed', due: day(2), priority: 'Medium', done: false, module: 'Enquiries' },
        { id: 'tk-10', title: 'Restore nightly backup and test', owner: 'Amina Bello', due: day(0), priority: 'High', done: true, module: 'Settings' }
      ],

      /* ---------------- analytics ---------------- */
      analytics: {
        traffic: (function () {
          var out = [], i, base = 980;
          for (i = 29; i >= 0; i--) {
            var wk = new Date(); wk.setDate(wk.getDate() - i);
            var weekend = [0, 6].indexOf(wk.getDay()) > -1;
            var v = Math.round(base + Math.sin(i / 3.4) * 210 + (weekend ? -330 : 120) + Math.random() * 190 + (29 - i) * 9);
            out.push({ date: wk.toISOString().slice(0, 10), views: Math.max(120, v), visitors: Math.max(80, Math.round(v * 0.62)) });
          }
          return out;
        })(),
        pages: [
          { page: '/index.html', title: 'Home', views: 18420, share: 27.4, trend: 6.2 },
          { page: '/services.html', title: 'Services', views: 12880, share: 19.2, trend: 3.1 },
          { page: '/news.html', title: 'News & Media', views: 9640, share: 14.4, trend: 12.8 },
          { page: '/contact.html', title: 'Contact', views: 7210, share: 10.7, trend: -2.4 },
          { page: '/projects.html', title: 'Projects', views: 6480, share: 9.7, trend: 4.6 },
          { page: '/about.html', title: 'About', views: 4930, share: 7.3, trend: 1.2 },
          { page: '/gallery.html', title: 'Gallery', views: 4260, share: 6.3, trend: 8.9 },
          { page: '/departments.html', title: 'Departments', views: 3390, share: 5.0, trend: -1.1 }
        ],
        sources: [
          { name: 'Direct', value: 31, color: 'var(--green-700)' },
          { name: 'Google Search', value: 38, color: 'var(--gold-500)' },
          { name: 'Facebook', value: 12, color: 'var(--info)' },
          { name: 'X (Twitter)', value: 8, color: 'var(--purple)' },
          { name: 'Referrals (.gov.ng)', value: 7, color: 'var(--teal)' },
          { name: 'Email / newsletter', value: 4, color: 'var(--danger)' }
        ],
        devices: [{ name: 'Mobile', value: 71 }, { name: 'Desktop', value: 23 }, { name: 'Tablet', value: 6 }],
        lgaViews: [
          { name: 'Gombe', value: 28 }, { name: 'Akko', value: 12 }, { name: 'Yamaltu/Deba', value: 9 },
          { name: 'Kwami', value: 8 }, { name: 'Billiri', value: 7 }, { name: 'Dukku', value: 7 },
          { name: 'Nafada', value: 6 }, { name: 'Funakaye', value: 6 }, { name: 'Balanga', value: 6 },
          { name: 'Kaltungo', value: 6 }, { name: 'Shongom', value: 5 }
        ],
        monthly: (function () {
          var names = [], vals = [], i, t = new Date();
          for (i = 5; i >= 0; i--) {
            var m = new Date(t.getFullYear(), t.getMonth() - i, 1);
            names.push(m.toLocaleString('en', { month: 'short' }));
            vals.push(Math.round(16000 + Math.sin(i / 1.7) * 3800 + Math.random() * 2600 + (5 - i) * 1400));
          }
          return { labels: names, values: vals };
        })()
      },

      /* ---------------- audit log ---------------- */
      logs: [
        { id: 'lg-1', at: d(0, 8, 31), user: 'Amina Bello', action: 'login', module: 'Session', detail: 'Signed in from 10.14.2.31 (Gombe)', level: 'info' },
        { id: 'lg-2', at: d(0, 8, 44), user: 'Hauwa Mohammed', action: 'create', module: 'Reports', detail: 'Created incident report ENV-2026-0142 (Open dumping & burning)', level: 'ok' },
        { id: 'lg-3', at: d(-1, 16, 12), user: 'Ibrahim Sule', action: 'update', module: 'Newsroom', detail: 'Moved "Recycling enterprise support" to In review', level: 'info' },
        { id: 'lg-4', at: d(-1, 14, 50), user: 'System', action: 'receive', module: 'Enquiries', detail: 'New contact form submission GM-2026-481840', level: 'info' },
        { id: 'lg-5', at: d(-2, 11, 5), user: 'Daniel Yakubu', action: 'approve', module: 'Permits', detail: 'Approved PER-2026-0308 fuelwood movement permit', level: 'ok' },
        { id: 'lg-6', at: d(-2, 9, 40), user: 'Amina Bello', action: 'settings', module: 'Settings', detail: 'Updated public notice band text on news page', level: 'warn' },
        { id: 'lg-7', at: d(-3, 15, 22), user: 'System', action: 'backup', module: 'Settings', detail: 'Nightly export completed (184 KB)', level: 'ok' },
        { id: 'lg-8', at: d(-4, 10, 18), user: 'Grace Audu', action: 'update', module: 'Reports', detail: 'Added laboratory result note to ENV-2026-0139', level: 'info' },
        { id: 'lg-9', at: d(-5, 12, 0), user: 'Ibrahim Sule', action: 'publish', module: 'Newsroom', detail: 'Published "Ministry opens 2026/2027 seedling distribution"', level: 'ok' },
        { id: 'lg-10', at: d(-6, 8, 55), user: 'Amina Bello', action: 'delete', module: 'Media', detail: 'Removed obsolete image dumpsite-before.jpg', level: 'danger' },
        { id: 'lg-11', at: d(-7, 13, 41), user: 'System', action: 'receive', module: 'Permits', detail: 'New application PER-2026-0303 submitted', level: 'info' },
        { id: 'lg-12', at: d(-8, 9, 30), user: 'Fatima Ahmed', action: 'create', module: 'Events', detail: 'Scheduled ACReSAL catchment stakeholder meeting', level: 'ok' }
      ],

      notifications: [
        { id: 'nt-1', type: 'enquiry', title: 'Urgent: erosion report from Kashere', text: 'Bala Audu reported gully advance threatening a primary school block.', at: d(0, 7, 30), read: false, link: 'enquiries' },
        { id: 'nt-2', type: 'permit', title: 'EIA due for decision', text: 'PER-2026-0312 (Nasarawa Quarry Ltd) reaches its due date in 9 days.', at: d(0, 6, 5), read: false, link: 'permits' },
        { id: 'nt-3', type: 'news', title: 'Draft awaiting sign-off', text: '"State launches air-quality monitoring" has been in draft for 3 days.', at: d(-1, 17, 20), read: false, link: 'news' },
        { id: 'nt-4', type: 'media', title: 'Storage at 62% of the browser quota', text: 'Consider exporting the media library or clearing unused uploads.', at: d(-1, 9, 0), read: true, link: 'settings' },
        { id: 'nt-5', type: 'system', title: 'Nightly backup completed', text: '184 KB exported successfully.', at: d(-2, 3, 0), read: true, link: 'settings' }
      ]
    };
  }

  /* next/previous "last Saturday of the month" style offset helper */
  function saturdayOffset(weeksAhead) {
    var t = new Date();
    // last Saturday of the current month
    var last = new Date(t.getFullYear(), t.getMonth() + 1, 0);
    while (last.getDay() !== 6) last.setDate(last.getDate() - 1);
    var diff = Math.round((last - t) / 86400000) + (weeksAhead || 0) * 7;
    return diff;
  }

  /* =====================================================================
     STORE
     ===================================================================== */
  var Store = {
    data: null,

    init: function () {
      if (this.data) return this.data;
      var raw = null;
      try { raw = LS.store.getItem(KEY); } catch (e) { raw = null; }
      if (raw) {
        try {
          var parsed = JSON.parse(raw);
          if (parsed && parsed.meta && parsed.settings) { this.data = parsed; return this.data; }
        } catch (e) { /* corrupt → reseed */ }
      }
      this.data = seed();
      this.save();
      return this.data;
    },

    save: function () {
      try {
        LS.store.setItem(KEY, JSON.stringify(this.data));
        return { ok: true, bytes: JSON.stringify(this.data).length, persisted: LS.ok };
      } catch (e) {
        return { ok: false, error: e && e.name === 'QuotaExceededError' ? 'quota' : 'unknown' };
      }
    },

    size: function () {
      try { return JSON.stringify(this.data).length; } catch (e) { return 0; }
    },

    reset: function () {
      this.data = seed();
      this.save();
      return this.data;
    },

    import: function (json) {
      var obj = typeof json === 'string' ? JSON.parse(json) : json;
      if (!obj || !obj.settings) throw new Error('Not a valid console export.');
      this.data = obj;
      this.save();
      return this.data;
    },

    export: function () {
      return JSON.stringify(this.data, null, 2);
    },

    /* collection helpers */
    list: function (name) { return (this.data && this.data[name]) || []; },
    find: function (name, id) {
      var arr = this.list(name);
      for (var i = 0; i < arr.length; i++) if (arr[i].id === id) return arr[i];
      return null;
    },
    add: function (name, item) {
      if (!item.id) item.id = uid(name.slice(0, 2));
      this.data[name].unshift(item);
      this.save();
      return item;
    },
    update: function (name, id, patch) {
      var it = this.find(name, id);
      if (!it) return null;
      for (var k in patch) if (Object.prototype.hasOwnProperty.call(patch, k)) it[k] = patch[k];
      this.save();
      return it;
    },
    remove: function (name, ids) {
      var arr = Array.isArray(ids) ? ids : [ids];
      this.data[name] = this.data[name].filter(function (x) { return arr.indexOf(x.id) === -1; });
      this.save();
    },
    move: function (name, id, dir) {
      var arr = this.data[name];
      var i = -1, j;
      for (j = 0; j < arr.length; j++) if (arr[j].id === id) { i = j; break; }
      if (i < 0) return;
      var t = i + dir;
      if (t < 0 || t >= arr.length) return;
      var tmp = arr[i]; arr[i] = arr[t]; arr[t] = tmp;
      arr.forEach(function (x, k) { x.order = k + 1; });
      this.save();
    },

    /* audit log */
    log: function (action, module, detail, level) {
      var user = this.currentUser();
      this.data.logs.unshift({
        id: uid('lg'), at: new Date().toISOString(),
        user: user ? user.name : 'System',
        action: action, module: module || 'General',
        detail: detail || '', level: level || 'info'
      });
      if (this.data.logs.length > 400) this.data.logs.length = 400;
      this.save();
    },

    currentUser: function () { return this.find('users', this.data.currentUser); },

    /* session */
    session: {
      get: function () {
        try { return JSON.parse(SS.store.getItem(SESSION) || LS.store.getItem(SESSION) || 'null'); }
        catch (e) { return null; }
      },
      set: function (s, remember) {
        try {
          var v = JSON.stringify(s);
          if (remember) LS.store.setItem(SESSION, v); else SS.store.setItem(SESSION, v);
        } catch (e) { /* ignore */ }
      },
      clear: function () {
        try { SS.store.removeItem(SESSION); LS.store.removeItem(SESSION); } catch (e) { }
      }
    },

    /* true when changes survive a page reload */
    persistent: function () { return LS.ok || SS.ok; },
    storageInfo: function () { return { local: LS.ok, session: SS.ok }; },
    wipe: function () {
      try { LS.store.removeItem(KEY); } catch (e) { }
      try { SS.store.removeItem(SESSION); } catch (e) { }
    },

    seed: seed, uid: uid
  };

  /* Initialise immediately: view modules read seed data while they are being
     defined, which happens before the application boots. */
  try { Store.init(); } catch (e) { Store.data = Store.seed(); }

  global.AdminStore = Store;
})(window);
