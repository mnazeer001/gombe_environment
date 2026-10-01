/* =====================================================================
   Gombe State Ministry of Environment & Forest Resources
   main.js — navigation, slider, reveal, counters, accordion,
             gallery filter + lightbox, forms, back-to-top
   ===================================================================== */
(function () {
  'use strict';

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  /* ---------- Mobile navigation ---------- */
  const toggle   = $('.nav-toggle');
  const nav      = $('.main-nav');
  const backdrop = $('.nav-backdrop');

  function setToggleLabel(open) {
    if (!toggle) return;
    // The same button opens and closes the drawer, so its label must change with state.
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
    toggle.setAttribute('title', open ? 'Close menu' : 'Menu');
  }

  function closeNav(returnFocus) {
    if (!nav || !nav.classList.contains('open')) return;
    nav.classList.remove('open');
    backdrop && backdrop.classList.remove('show');
    setToggleLabel(false);
    document.body.style.overflow = '';
    if (returnFocus && toggle) toggle.focus();
  }

  if (toggle && nav) {
    setToggleLabel(false);
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      backdrop && backdrop.classList.toggle('show', open);
      setToggleLabel(open);
      document.body.style.overflow = open && window.innerWidth < 1100 ? 'hidden' : '';
      if (open) {
        const first = nav.querySelector('a');
        first && setTimeout(() => first.focus({ preventScroll: true }), 320);
      }
    });
    backdrop && backdrop.addEventListener('click', () => closeNav(false));
    $$('.main-nav a').forEach(a => a.addEventListener('click', () => closeNav(false)));
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && nav.classList.contains('open')) closeNav(true);
      // keep keyboard focus inside the open drawer
      if (e.key === 'Tab' && nav.classList.contains('open') && window.innerWidth < 1100) {
        const items = $$('a, button', nav).filter(el => el.offsetParent !== null);
        const chain = [toggle].concat(items);
        const i = chain.indexOf(document.activeElement);
        if (i > -1) {
          e.preventDefault();
          const next = e.shiftKey ? (i - 1 + chain.length) % chain.length : (i + 1) % chain.length;
          chain[next].focus();
        }
      }
    });
    window.addEventListener('resize', () => { if (window.innerWidth >= 1100) closeNav(false); });
  }

  /* ---------- Sticky header shadow + back-to-top ---------- */
  const header = $('.site-header');
  const toTop  = $('.to-top');
  function onScroll() {
    const y = window.scrollY;
    header && header.classList.toggle('stuck', y > 8);
    toTop && toTop.classList.toggle('show', y > 420);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  toTop && toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ---------- Hero slider ---------- */
  const slides = $$('.hero-slide');
  if (slides.length > 1) {
    const dotsWrap = $('.hero-dots');
    let idx = 0, timer = null;

    slides.forEach((_, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', 'Show slide ' + (i + 1));
      if (i === 0) b.classList.add('active');
      b.addEventListener('click', () => { go(i); restart(); });
      dotsWrap && dotsWrap.appendChild(b);
    });

    function go(n) {
      slides[idx].classList.remove('active');
      dotsWrap && dotsWrap.children[idx] && dotsWrap.children[idx].classList.remove('active');
      idx = (n + slides.length) % slides.length;
      slides[idx].classList.add('active');
      dotsWrap && dotsWrap.children[idx] && dotsWrap.children[idx].classList.add('active');
    }
    function start()   { timer = setInterval(() => go(idx + 1), 6500); }
    function restart() { clearInterval(timer); start(); }
    start();
  }

  /* ---------- Scroll reveal ---------- */
  const revealEls = $$('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((en, i) => {
        if (en.isIntersecting) {
          setTimeout(() => en.target.classList.add('in'), (i % 4) * 90);
          obs.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in'));
  }

  /* ---------- Animated counters ---------- */
  const counters = $$('[data-count]');
  function runCounter(el) {
    const target   = parseFloat(el.dataset.count);
    const decimals = (el.dataset.count.split('.')[1] || '').length;
    const suffix   = el.dataset.suffix || '';
    const prefix   = el.dataset.prefix || '';
    const dur      = 1600;
    const t0       = performance.now();
    function tick(now) {
      const p = Math.min((now - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = target * eased;
      el.textContent = prefix + val.toLocaleString('en-NG', {
        minimumFractionDigits: decimals, maximumFractionDigits: decimals
      }) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  if ('IntersectionObserver' in window && counters.length) {
    const co = new IntersectionObserver((entries, obs) => {
      entries.forEach(en => { if (en.isIntersecting) { runCounter(en.target); obs.unobserve(en.target); } });
    }, { threshold: 0.4 });
    counters.forEach(el => co.observe(el));
  } else {
    counters.forEach(el => { el.textContent = (el.dataset.prefix || '') + el.dataset.count + (el.dataset.suffix || ''); });
  }

  /* ---------- Progress bars ---------- */
  const bars = $$('.progress i[data-value]');
  if ('IntersectionObserver' in window && bars.length) {
    const po = new IntersectionObserver((entries, obs) => {
      entries.forEach(en => {
        if (en.isIntersecting) { en.target.style.width = en.target.dataset.value + '%'; obs.unobserve(en.target); }
      });
    }, { threshold: 0.4 });
    bars.forEach(b => po.observe(b));
  } else {
    bars.forEach(b => { b.style.width = b.dataset.value + '%'; });
  }

  /* ---------- Commissioner profile interaction ---------- */
  const commissionerCard = $('.commissioner-card');
  if (commissionerCard) {
    commissionerCard.addEventListener('pointermove', (event) => {
      const rect = commissionerCard.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width;
      const py = (event.clientY - rect.top) / rect.height;
      const rotateY = (px - 0.5) * 10;
      const rotateX = (0.5 - py) * 10;

      commissionerCard.classList.add('is-tilting');
      commissionerCard.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    commissionerCard.addEventListener('pointerleave', () => {
      commissionerCard.classList.remove('is-tilting');
      commissionerCard.style.transform = '';
    });

    commissionerCard.addEventListener('focusin', () => commissionerCard.classList.add('is-tilting'));
    commissionerCard.addEventListener('focusout', () => {
      commissionerCard.classList.remove('is-tilting');
      commissionerCard.style.transform = '';
    });
  }

  /* ---------- Accordions ---------- */
  $$('.acc-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const panel = btn.nextElementSibling;
      const open  = btn.getAttribute('aria-expanded') === 'true';
      const group = btn.closest('.accordion');
      if (group && group.dataset.single !== 'false') {
        $$('.acc-btn', group).forEach(other => {
          if (other !== btn) {
            other.setAttribute('aria-expanded', 'false');
            other.nextElementSibling.style.maxHeight = null;
          }
        });
      }
      btn.setAttribute('aria-expanded', String(!open));
      panel.style.maxHeight = open ? null : panel.scrollHeight + 'px';
    });
  });

  /* ---------- Filters (gallery / projects) ---------- */
  $$('[data-filter-group]').forEach(group => {
    const targets = $$('[data-cat]', document.getElementById(group.dataset.filterGroup) || document);
    $$('.filter-btn', group).forEach(btn => {
      btn.addEventListener('click', () => {
        $$('.filter-btn', group).forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const f = btn.dataset.filter;
        targets.forEach(t => {
          const show = f === 'all' || t.dataset.cat.split(' ').includes(f);
          t.classList.toggle('hide', !show);
        });
      });
    });
  });

  /* ---------- Lightbox ---------- */
  const gitems = $$('.gitem');
  if (gitems.length) {
    const lb    = document.createElement('div');
    lb.className = 'lightbox';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.innerHTML =
      '<button class="lb-close" aria-label="Close">&times;</button>' +
      '<button class="lb-nav lb-prev" aria-label="Previous">&#10094;</button>' +
      '<button class="lb-nav lb-next" aria-label="Next">&#10095;</button>' +
      '<div><img alt=""><p class="cap"></p></div>';
    document.body.appendChild(lb);

    const lbImg = $('img', lb), lbCap = $('.cap', lb);
    let current = 0;
    const visible = () => gitems.filter(g => !g.classList.contains('hide'));

    function open(item) {
      const list = visible();
      current = list.indexOf(item);
      show();
      lb.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    function show() {
      const list = visible();
      const item = list[current];
      if (!item) return;
      const img = $('img', item);
      lbImg.src = img.src;
      lbImg.alt = img.alt;
      lbCap.textContent = (item.querySelector('figcaption') || {}).textContent || img.alt;
    }
    function step(d) {
      const list = visible();
      current = (current + d + list.length) % list.length;
      show();
    }
    function close() { lb.classList.remove('open'); document.body.style.overflow = ''; }

    gitems.forEach(it => it.addEventListener('click', () => open(it)));
    $('.lb-close', lb).addEventListener('click', close);
    $('.lb-prev', lb).addEventListener('click', () => step(-1));
    $('.lb-next', lb).addEventListener('click', () => step(1));
    lb.addEventListener('click', e => { if (e.target === lb) close(); });
    document.addEventListener('keydown', e => {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') step(-1);
      if (e.key === 'ArrowRight') step(1);
    });
  }

  /* ---------- Form validation (client-side demo) ---------- */
  $$('form[data-validate]').forEach(form => {
    const alertBox = $('.alert', form);
    form.addEventListener('submit', e => {
      e.preventDefault();
      let ok = true;
      $$('[required]', form).forEach(input => {
        const field = input.closest('.field') || input.parentElement;
        let valid = input.type === 'checkbox' ? input.checked : input.value.trim() !== '';
        if (valid && input.type === 'email') valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.value.trim());
        if (valid && input.dataset.phone !== undefined) valid = /^[0-9+()\-\s]{7,20}$/.test(input.value.trim());
        field.classList.toggle('invalid', !valid);
        if (!valid && ok) { input.focus(); ok = false; }
      });
      if (!ok) return;
      const ref = 'GM-' + new Date().getFullYear() + '-' +
                  Math.floor(100000 + Math.random() * 899999);
      if (alertBox) {
        alertBox.innerHTML =
          '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">' +
          '<path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/></svg>' +
          '<div><strong>Submission received.</strong> Your reference number is <b>' + ref +
          '</b>. A desk officer will respond within 3 working days. ' +
          '<em>(Demo site — no data is transmitted or stored.)</em></div>';
        alertBox.classList.add('show');
        alertBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      form.reset();
      $$('.invalid', form).forEach(f => f.classList.remove('invalid'));
    });
    $$('input,select,textarea', form).forEach(i => {
      i.addEventListener('input', () => {
        const f = i.closest('.field');
        f && f.classList.remove('invalid');
      });
    });
  });

  /* ---------- Footer year ---------- */
  $$('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });

})();
