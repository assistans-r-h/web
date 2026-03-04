/* ═══════════════════════════════════════════════════════
   Assistans Runt Hörnan AB · Professional JavaScript
   Modern, Accessible, Performance-Optimized
   ═══════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  
  // ────────────────────────────────────────────────────────
  // AUTO-UPDATE CURRENT YEAR
  // ────────────────────────────────────────────────────────
  const yearElements = document.querySelectorAll('#current-year');
  const currentYear = new Date().getFullYear();
  yearElements.forEach(el => {
    el.textContent = currentYear;
  });

  // ────────────────────────────────────────────────────────
  // NAVIGATION: SCROLL & MOBILE MENU
  // ────────────────────────────────────────────────────────
  const nav = document.getElementById('main-nav');
  const menuToggle = document.querySelector('.mobile-menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  const navLinkItems = document.querySelectorAll('.nav-links a');
  
  // Add scrolled class to navigation on scroll
  let scrollTimeout;
  window.addEventListener('scroll', () => {
    if (scrollTimeout) {
      window.cancelAnimationFrame(scrollTimeout);
    }
    scrollTimeout = window.requestAnimationFrame(() => {
      nav?.classList.toggle('scrolled', window.scrollY > 20);
    });
  }, { passive: true });

  // Mobile menu toggle
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      const isActive = menuToggle.classList.toggle('active');
      navLinks.classList.toggle('active');
      menuToggle.setAttribute('aria-expanded', isActive);
      
      // Prevent body scroll when menu is open
      document.body.style.overflow = isActive ? 'hidden' : '';
    });
  }

  // Close mobile menu when clicking on a link
  navLinkItems.forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 1023) {
        menuToggle?.classList.remove('active');
        navLinks?.classList.remove('active');
        menuToggle?.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  });

  // Close mobile menu when clicking outside
  document.addEventListener('click', (e) => {
    if (window.innerWidth <= 1023 && 
        navLinks?.classList.contains('active') &&
        !navLinks.contains(e.target) && 
        !menuToggle?.contains(e.target)) {
      menuToggle?.classList.remove('active');
      navLinks?.classList.remove('active');
      menuToggle?.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });

  // ────────────────────────────────────────────────────────
  // SMOOTH SCROLL FOR ANCHOR LINKS
  // ────────────────────────────────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId === '#') return;
      
      const target = document.querySelector(targetId);
      if (!target) return;
      
      e.preventDefault();
      
      const navHeight = nav?.offsetHeight || 80;
      const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight;
      
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
      
      // Update URL without jumping
      if (history.pushState) {
        history.pushState(null, null, targetId);
      }
    });
  });

  // ────────────────────────────────────────────────────────
  // ACTIVE NAVIGATION LINK
  // ────────────────────────────────────────────────────────
  const sections = document.querySelectorAll('section[id]');
  const allNavLinks = document.querySelectorAll('.nav-links a');

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const sectionId = entry.target.getAttribute('id');
        allNavLinks.forEach(link => {
          const href = link.getAttribute('href');
          if (href === `#${sectionId}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, {
    rootMargin: '-30% 0px -60% 0px',
    threshold: 0
  });

  sections.forEach(section => {
    sectionObserver.observe(section);
  });

  // ────────────────────────────────────────────────────────
  // SCROLL REVEAL ANIMATIONS
  // ────────────────────────────────────────────────────────
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  // Observe all reveal elements
  document.querySelectorAll('.reveal').forEach(el => {
    revealObserver.observe(el);
  });

  // ────────────────────────────────────────────────────────
  // CONTACT FORM HANDLING
  // ────────────────────────────────────────────────────────
  const contactForm = document.getElementById('contact-form');
  const submitBtn = document.getElementById('submit-btn');
  const statusEl = document.getElementById('form-status');

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // Validate form
      if (!validateForm(contactForm)) {
        return;
      }

      // Disable submit button
      submitBtn.disabled = true;
      const btnLabel = submitBtn.querySelector('.btn-label');
      const originalText = btnLabel?.textContent || 'Skicka meddelande';
      if (btnLabel) btnLabel.textContent = 'Skickar...';

      // Collect form data
      const formData = new FormData(contactForm);
      const data = {
        fornamn: formData.get('fornamn'),
        efternamn: formData.get('efternamn'),
        telefon: formData.get('telefon') || 'Ej angiven',
        email: formData.get('email'),
        tjanst: formData.get('tjanst') || 'Ej vald',
        meddelande: formData.get('meddelande')
      };

      // Create email body
      const emailBody = `
Kontaktförfrågan från webbplatsen

Namn: ${data.fornamn} ${data.efternamn}
E-post: ${data.email}
Telefon: ${data.telefon}
Tjänst: ${data.tjanst}

Meddelande:
${data.meddelande}

---
Skickat från kontaktformuläret på assistans-r-h.se
      `.trim();

      // Create mailto link
      const mailtoLink = `mailto:info@assistans-r-h.se?subject=Kontaktförfrågan från webbplatsen - ${data.fornamn} ${data.efternamn}&body=${encodeURIComponent(emailBody)}`;
      
      // Simulate sending delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Open email client
      window.location.href = mailtoLink;
      
      // Show success message
      showFormStatus('Ditt e-postprogram har öppnats. Skicka meddelandet därifrån för att kontakta oss.', 'success');
      
      // Reset form after delay
      setTimeout(() => {
        contactForm.reset();
        submitBtn.disabled = false;
        if (btnLabel) btnLabel.textContent = originalText;
        showFormStatus('', '');
      }, 5000);
    });
  }

  /**
   * Validate contact form
   */
  function validateForm(form) {
    const email = form.querySelector('#email');
    const fname = form.querySelector('#fname');
    const lname = form.querySelector('#lname');
    const message = form.querySelector('#message');

    // Check required fields
    if (!fname?.value.trim()) {
      showFormStatus('Vänligen ange ditt förnamn.', 'error');
      fname?.focus();
      return false;
    }

    if (!lname?.value.trim()) {
      showFormStatus('Vänligen ange ditt efternamn.', 'error');
      lname?.focus();
      return false;
    }

    // Validate email
    if (!email?.value || !isValidEmail(email.value)) {
      showFormStatus('Vänligen ange en giltig e-postadress.', 'error');
      email?.focus();
      return false;
    }

    // Check message
    if (!message?.value.trim() || message.value.trim().length < 10) {
      showFormStatus('Vänligen skriv ett meddelande (minst 10 tecken).', 'error');
      message?.focus();
      return false;
    }

    return true;
  }

  /**
   * Validate email format
   */
  function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  /**
   * Show form status message
   */
  function showFormStatus(message, type) {
    if (!statusEl) return;
    
    statusEl.textContent = message;
    statusEl.className = 'form-status';
    
    if (type) {
      statusEl.classList.add(type);
    }

    // Announce to screen readers
    statusEl.setAttribute('role', 'alert');
    statusEl.setAttribute('aria-live', 'polite');
  }

  // ────────────────────────────────────────────────────────
  // LOG INITIALIZATION
  // ────────────────────────────────────────────────────────
  
  console.log('✓ Assistans Runt Hörnan AB - Website initialized');
  console.log('✓ All interactive features loaded');
  console.log('✓ Accessibility enhancements active');
});
