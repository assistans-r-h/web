/* ─────────────────────────────────────────────
   Assistans Runt Hörnan AB  ·  app.js
   ─────────────────────────────────────────────  */

document.addEventListener('DOMContentLoaded', () => {

  /* ────────────────────────────────────────────
     1. NAV – shadow on scroll + active link
  ──────────────────────────────────────────── */
  const nav = document.getElementById('main-nav');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  // Highlight active nav link based on scroll position
  const sections  = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.nav-links a');

  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(s => sectionObserver.observe(s));


  /* ────────────────────────────────────────────
     2. SMOOTH SCROLL for all anchor links
  ──────────────────────────────────────────── */
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


  /* ────────────────────────────────────────────
     3. SCROLL REVEAL
  ──────────────────────────────────────────── */
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  // Observe elements already marked .reveal in HTML
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  // Stagger service cards
  document.querySelectorAll('.service-card').forEach((card, i) => {
    card.classList.add('reveal');
    card.style.transitionDelay = `${i * 0.08}s`;
    revealObserver.observe(card);
  });

  // Stagger lang cards
  document.querySelectorAll('.lang-card').forEach((card, i) => {
    card.classList.add('reveal');
    card.style.transitionDelay = `${i * 0.09}s`;
    revealObserver.observe(card);
  });

  // Stagger award cards
  document.querySelectorAll('.award-card').forEach((card, i) => {
    card.classList.add('reveal');
    card.style.transitionDelay = `${i * 0.08}s`;
    revealObserver.observe(card);
  });


  /* ────────────────────────────────────────────
     4. COUNTER ANIMATION for hero stats
  ──────────────────────────────────────────── */
  const counterObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el     = entry.target;
      const target = parseInt(el.dataset.target, 10);
      const suffix = el.dataset.suffix || '';
      const duration = 1400; // ms
      const interval = 16;   // ~60fps
      const steps  = duration / interval;
      let current  = 0;

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


  /* ────────────────────────────────────────────
     5. CONTACT FORM – Formspree AJAX submission
     No page reload, no server needed.
     Works on GitHub Pages as a static site.
  ──────────────────────────────────────────── */
  const form       = document.getElementById('contact-form');
  const submitBtn  = document.getElementById('submit-btn');
  const statusEl   = document.getElementById('form-status');
  const btnLabel   = submitBtn ? submitBtn.querySelector('.btn-label')  : null;
  const btnArrow   = submitBtn ? submitBtn.querySelector('.btn-arrow')  : null;
  const btnSpinner = submitBtn ? submitBtn.querySelector('.btn-spinner') : null;

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Basic client-side validation
      const email = form.querySelector('#email');
      if (!email.value || !/\S+@\S+\.\S+/.test(email.value)) {
        showStatus('Ange en giltig e-postadress.', 'error');
        email.focus();
        return;
      }

      // Show loading state
      setLoading(true);
      showStatus('', '');

      try {
        const data     = new FormData(form);
        const response = await fetch(form.action, {
          method:  'POST',
          body:    data,
          headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
          showStatus('Tack! Vi återkommer till dig så snart som möjligt.', 'success');
          form.reset();
        } else {
          const json = await response.json().catch(() => ({}));
          const msg  = (json.errors && json.errors.map(e => e.message).join(', '))
                    || 'Något gick fel. Försök igen eller ring oss på 08-760 19 35.';
          showStatus(msg, 'error');
        }
      } catch {
        showStatus('Kunde inte skicka meddelandet. Kontrollera din internetanslutning.', 'error');
      } finally {
        setLoading(false);
      }
    });
  }

  function setLoading(loading) {
    if (!submitBtn) return;
    submitBtn.disabled = loading;
    if (btnLabel)   btnLabel.textContent     = loading ? 'Skickar…' : 'Skicka meddelande';
    if (btnArrow)   btnArrow.style.display   = loading ? 'none' : 'block';
    if (btnSpinner) btnSpinner.style.display = loading ? 'block' : 'none';
  }

  function showStatus(message, type) {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.className   = 'form-status ' + (type || '');
  }

});