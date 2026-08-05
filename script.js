/* =====================================================
   Giridhar M — Portfolio Script
   Handles: mobile nav, scroll effects, active-link highlighting,
   scroll-reveal animations, back-to-top, contact form validation.
   ===================================================== */

/* ---------- Scroll-reveal safety net ----------
   Only opt into the hidden/animate-in state if IntersectionObserver
   is actually available. Also set a hard timeout fallback: if
   anything below throws before the reveal observer gets attached,
   every .reveal element is still forced visible after 1.5s so the
   page can never get stuck blank. */
if ('IntersectionObserver' in window) {
  document.documentElement.classList.add('js-ready');
}
window.setTimeout(() => {
  document.querySelectorAll('.reveal:not(.in-view)').forEach(el => {
    el.classList.add('in-view');
  });
}, 1500);

document.addEventListener('DOMContentLoaded', () => {
 try {

  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Mobile navigation toggle ---------- */
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');

  navToggle.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('open');
    navToggle.classList.toggle('open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  // Close mobile menu when a link is clicked
  navMenu.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  /* ---------- Navbar background on scroll ---------- */
  const navbar = document.getElementById('navbar');
  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 12);
    toggleBackToTop();
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Active nav-link highlighting on scroll ---------- */
  const sections = document.querySelectorAll('main section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.toggle('active', link.dataset.section === id);
        });
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

  sections.forEach(section => sectionObserver.observe(section));

  /* ---------- Scroll-reveal animations ---------- */
  const revealEls = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealEls.forEach((el, i) => {
    // subtle stagger for elements revealing together
    el.style.transitionDelay = `${(i % 4) * 70}ms`;
    revealObserver.observe(el);
  });

  /* ---------- Back-to-top button ---------- */
  const backToTop = document.getElementById('backToTop');

  function toggleBackToTop() {
    backToTop.classList.toggle('visible', window.scrollY > 500);
  }

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ---------- Contact form validation ---------- */
  const form = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');

  const fields = {
    name: { el: document.getElementById('name'), error: document.getElementById('nameError') },
    email: { el: document.getElementById('email'), error: document.getElementById('emailError') },
    subject: { el: document.getElementById('subject'), error: document.getElementById('subjectError') },
    message: { el: document.getElementById('message'), error: document.getElementById('messageError') },
  };

  function validateField(key) {
    const { el, error } = fields[key];
    const value = el.value.trim();
    let message = '';

    if (!value) {
      message = 'This field is required.';
    } else if (key === 'email') {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(value)) message = 'Enter a valid email address.';
    } else if (key === 'message' && value.length < 10) {
      message = 'Message should be at least 10 characters.';
    }

    el.classList.toggle('invalid', Boolean(message));
    error.textContent = message;
    return !message;
  }

  Object.keys(fields).forEach(key => {
    fields[key].el.addEventListener('blur', () => validateField(key));
  });

  const submitBtn = document.getElementById('submitBtn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const results = Object.keys(fields).map(validateField);
    const isValid = results.every(Boolean);

    if (!isValid) {
      formStatus.style.color = '#ff6b6b';
      formStatus.textContent = 'Please fix the highlighted fields before sending.';
      return;
    }

    const originalBtnText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';
    formStatus.style.color = 'var(--text-dim)';
    formStatus.textContent = '';

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        formStatus.style.color = 'var(--success)';
        formStatus.textContent = "Thanks! Your message has been sent — I'll get back to you soon.";
        form.reset();
      } else {
        const data = await response.json().catch(() => null);
        const errMsg = data && data.errors
          ? data.errors.map(err => err.message).join(', ')
          : 'Something went wrong. Please try again or email me directly.';
        formStatus.style.color = '#ff6b6b';
        formStatus.textContent = errMsg;
      }
    } catch (err) {
      formStatus.style.color = '#ff6b6b';
      formStatus.textContent = 'Network error — please try again or email me directly.';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalBtnText;
    }
  });

 } catch (err) {
   // Never let a script error leave the page blank — reveal everything
   // and log the problem for debugging.
   console.error('Portfolio script error:', err);
   document.querySelectorAll('.reveal').forEach(el => el.classList.add('in-view'));
 }
});
