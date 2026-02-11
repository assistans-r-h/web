/* ─────────────────────────────────────────────
   Assistans Runt Hörnan AB  ·  app.js
   ─────────────────────────────────────────────  */

document.addEventListener('DOMContentLoaded', () => {

  /* ── NAV SCROLL & MOBILE MENU ── */
  const nav = document.getElementById('main-nav');
  const menuToggle = document.querySelector('.mobile-menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  const navLinkItems = document.querySelectorAll('.nav-links a');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      menuToggle.classList.toggle('active');
      navLinks.classList.toggle('active');
      document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
    });
  }

  navLinkItems.forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 960) {
        menuToggle.classList.remove('active');
        navLinks.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  });

  /* ── SMOOTH SCROLL ── */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = nav ? nav.offsetHeight : 70;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ── ACTIVE NAV LINK ── */
  const sections = document.querySelectorAll('section[id]');
  const allNavLinks = document.querySelectorAll('.nav-links a');

  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        allNavLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(s => sectionObserver.observe(s));

  /* ── SCROLL REVEAL ── */
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  document.querySelectorAll('.service-card').forEach((card, i) => {
    card.classList.add('reveal');
    card.style.transitionDelay = `${i * 0.08}s`;
    revealObserver.observe(card);
  });

  document.querySelectorAll('.lang-card').forEach((card, i) => {
    card.classList.add('reveal');
    card.style.transitionDelay = `${i * 0.09}s`;
    revealObserver.observe(card);
  });

  /* ── COUNTER ANIMATION ── */
  const counterObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.target, 10);
      const suffix = el.dataset.suffix || '';
      const duration = 1400;
      const interval = 16;
      const steps = duration / interval;
      let current = 0;

      const timer = setInterval(() => {
        current++;
        const value = Math.round(easeOut(current / steps) * target);
        el.textContent = value + suffix;
        if (current >= steps) {
          el.textContent = target + suffix;
          clearInterval(timer);
        }
      }, interval);

      counterObserver.unobserve(el);
    });
  }, { threshold: 0.6 });

  document.querySelectorAll('.stat-num[data-target]').forEach(el => {
    counterObserver.observe(el);
  });

  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

  /* ── CONTACT FORM (mailto fallback) ── */
  const form = document.getElementById('contact-form');
  const submitBtn = document.getElementById('submit-btn');
  const statusEl = document.getElementById('form-status');
  const btnLabel = submitBtn ? submitBtn.querySelector('.btn-label') : null;
  const btnArrow = submitBtn ? submitBtn.querySelector('.btn-arrow') : null;
  const btnSpinner = submitBtn ? submitBtn.querySelector('.btn-spinner') : null;

  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();

      const email = form.querySelector('#email');
      if (!email.value || !/\S+@\S+\.\S+/.test(email.value)) {
        showStatus('Ange en giltig e-postadress.', 'error');
        email.focus();
        return;
      }

      // Collect form data
      const data = new FormData(form);
      const body = [];
      for (const [key, value] of data.entries()) {
        body.push(`${key}: ${value}`);
      }

      // Build mailto link
      const mailto = `mailto:info@assistans-r-h.se?subject=Kontaktförfrågan från webbplats&body=${encodeURIComponent(body.join('\n'))}`;

      // Open mailto
      window.location.href = mailto;

      // Show success message
      showStatus('Ditt e-postprogram öppnas. Skicka meddelandet därifrån.', 'success');
      
      // Reset form after 3 seconds
      setTimeout(() => {
        form.reset();
        showStatus('', '');
      }, 3000);
    });
  }

  function showStatus(message, type) {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.className = 'form-status ' + (type || '');
  }

});
