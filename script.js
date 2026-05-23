/* ============================================================
   AWR TRADING — script.js
   Minimal vanilla JS. No dependencies. Runs once on DOMContentLoaded.

   Responsibilities:
     1. Mobile nav toggle (hamburger)
     2. Sticky-header scroll state (transparent → solid)
     3. Reveal-on-scroll using IntersectionObserver
     4. Contact form client-side validation + success state
        (only runs if the form exists on the current page)
   ============================================================ */

(function () {
  'use strict';

  // ── 1. Mobile nav ──────────────────────────────────────────
  const toggle = document.querySelector('[data-nav-toggle]');
  const menu   = document.querySelector('[data-nav-menu]');

  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      menu.setAttribute('data-open', String(!open));
      document.body.classList.toggle('nav-open', !open);
    });

    // Close menu on link click (mobile)
    menu.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => {
        toggle.setAttribute('aria-expanded', 'false');
        menu.setAttribute('data-open', 'false');
        document.body.classList.remove('nav-open');
      });
    });
  }

  // ── 2. Sticky-header scroll state ──────────────────────────
  const header = document.querySelector('[data-header]');
  if (header) {
    const setScrolled = () => {
      header.setAttribute('data-scrolled', String(window.scrollY > 8));
    };
    setScrolled();
    window.addEventListener('scroll', setScrolled, { passive: true });
  }

  // ── 3. Reveal-on-scroll ────────────────────────────────────
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealEls = document.querySelectorAll('.reveal');

  if (reduced || !('IntersectionObserver' in window)) {
    // Show everything immediately
    revealEls.forEach((el) => el.classList.add('is-visible'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });

    revealEls.forEach((el) => io.observe(el));
  }

  // ── 4. Contact form ────────────────────────────────────────
  // Only runs if the form is present (contact.html).
  // The form's `action` is left blank by default; see contact.html
  // for instructions on wiring to Formspree or another endpoint.
  const form = document.querySelector('[data-contact-form]');
  if (form) {
    const msg = form.querySelector('[data-form-msg]');
    const setMsg = (text, state) => {
      if (!msg) return;
      msg.textContent = text;
      if (state) msg.setAttribute('data-state', state);
      else msg.removeAttribute('data-state');
    };

    form.addEventListener('submit', async (e) => {
      // If no action URL has been wired yet, intercept and fake success.
      const action = form.getAttribute('action');
      const hasEndpoint = action && action.trim() !== '' && action.trim() !== '#';

      // Basic HTML5 validation
      if (!form.checkValidity()) {
        e.preventDefault();
        setMsg('Please complete the required fields.', 'error');
        return;
      }

      if (!hasEndpoint) {
        e.preventDefault();
        setMsg('Thanks — we will be in touch shortly. (Demo mode: connect a form endpoint to send for real.)', 'success');
        form.reset();
        return;
      }

      // Real endpoint: submit via fetch for a smoother UX
      e.preventDefault();
      setMsg('Sending…');
      try {
        const res = await fetch(action, {
          method: form.method || 'POST',
          headers: { 'Accept': 'application/json' },
          body: new FormData(form)
        });
        if (res.ok) {
          setMsg('Thanks — we will be in touch shortly.', 'success');
          form.reset();
        } else {
          setMsg('Something went wrong. Please email us directly.', 'error');
        }
      } catch (err) {
        setMsg('Network error. Please email us directly.', 'error');
      }
    });
  }
})();
