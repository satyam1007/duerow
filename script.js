/* =========================================================
   Duerow Colors Private Limited — shared site script.js
   Handles: sticky/blur navbar, mobile menu, active nav link,
   smooth scroll, back-to-top button, scroll-reveal animations,
   the image/video carousels, and the Web3Forms contact form.
   ========================================================= */

document.addEventListener('DOMContentLoaded', function () {

  /* ---------- 1. Sticky navbar with blur-on-scroll ---------- */
  const navbar = document.getElementById('navbar');
  function updateNavbarState() {
    if (!navbar) return;
    navbar.classList.toggle('scrolled', window.scrollY > 12);
  }
  updateNavbarState();
  window.addEventListener('scroll', updateNavbarState, { passive: true });

  /* ---------- 2. Mobile hamburger menu ---------- */
  const menuBtn = document.getElementById('menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const hamburgerLines = document.querySelectorAll('.hamburger-line');

  function setMenuOpen(isOpen) {
    if (!mobileMenu || !menuBtn) return;
    menuBtn.setAttribute('aria-expanded', String(isOpen));
    if (isOpen) {
      mobileMenu.style.maxHeight = mobileMenu.scrollHeight + 'px';
      mobileMenu.style.opacity = '1';
      if (hamburgerLines[0]) hamburgerLines[0].style.transform = 'translateY(6px) rotate(45deg)';
      if (hamburgerLines[1]) hamburgerLines[1].style.opacity = '0';
      if (hamburgerLines[2]) hamburgerLines[2].style.transform = 'translateY(-6px) rotate(-45deg)';
    } else {
      mobileMenu.style.maxHeight = '0px';
      mobileMenu.style.opacity = '0';
      if (hamburgerLines[0]) hamburgerLines[0].style.transform = 'none';
      if (hamburgerLines[1]) hamburgerLines[1].style.opacity = '1';
      if (hamburgerLines[2]) hamburgerLines[2].style.transform = 'none';
    }
  }

  if (menuBtn && mobileMenu) {
    let menuOpen = false;
    menuBtn.addEventListener('click', function () {
      menuOpen = !menuOpen;
      setMenuOpen(menuOpen);
    });
    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        menuOpen = false;
        setMenuOpen(false);
      });
    });
  }

  /* ---------- 3. Highlight the active nav link ---------- */
  const currentFile = (window.location.pathname.split('/').pop() || 'index.html').replace('.html', '') || 'index';
  document.querySelectorAll('.nav-link').forEach(function (link) {
    if (link.dataset.page === currentFile) {
      link.classList.add('text-brand-600', 'font-semibold');
    }
  });

  /* ---------- 4. Smooth scroll for in-page anchor links ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId.length > 1) {
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });

  /* ---------- 5. Back-to-top button ---------- */
  const backToTopBtn = document.getElementById('back-to-top');
  if (backToTopBtn) {
    function toggleBackToTop() {
      const show = window.scrollY > 480;
      backToTopBtn.classList.toggle('opacity-0', !show);
      backToTopBtn.classList.toggle('pointer-events-none', !show);
      backToTopBtn.classList.toggle('translate-y-4', !show);
    }
    toggleBackToTop();
    window.addEventListener('scroll', toggleBackToTop, { passive: true });
    backToTopBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------- 6. Scroll-reveal animations (Intersection Observer) ---------- */
  const revealEls = document.querySelectorAll('[data-reveal]');
  if (revealEls.length) {
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15 });
      revealEls.forEach(function (el) { io.observe(el); });
    } else {
      revealEls.forEach(function (el) { el.classList.add('reveal-visible'); });
    }
  }

  /* ---------- 7. Horizontal carousels (images + videos) ---------- */
  function Carousel(root) {
    this.root = root;
    this.track = root.querySelector('[data-carousel-track]');
    if (!this.track) return;
    this.slides = Array.from(this.track.children);
    this.count = this.slides.length;
    this.dotsWrap = root.querySelector('[data-carousel-dots]');
    this.prevBtn = root.querySelector('[data-carousel-prev]');
    this.nextBtn = root.querySelector('[data-carousel-next]');
    this.autoplay = root.dataset.autoplay === 'true';
    this.interval = parseInt(root.dataset.interval || '4000', 10);
    this.index = parseInt(root.dataset.start || '0', 10) || 0;
    this.timer = null;
    this.dragging = false;
    this.dragStartX = 0;
    this.dragDeltaX = 0;

    this.buildDots();
    this.bindEvents();
    this.goTo(this.index, false);
    if (this.autoplay) this.startAutoplay();
  }

  Carousel.prototype.buildDots = function () {
    if (!this.dotsWrap) return;
    this.dotsWrap.innerHTML = '';
    const self = this;
    this.slides.forEach(function (_, i) {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'carousel-dot';
      dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
      dot.addEventListener('click', function () {
        self.goTo(i);
        self.restartAutoplay();
      });
      self.dotsWrap.appendChild(dot);
    });
  };

  Carousel.prototype.updateDots = function () {
    if (!this.dotsWrap) return;
    Array.from(this.dotsWrap.children).forEach((d, i) => d.classList.toggle('active', i === this.index));
  };

  Carousel.prototype.goTo = function (i, animate) {
    if (animate === undefined) animate = true;
    this.index = (i + this.count) % this.count;
    this.track.style.transition = animate ? '' : 'none';
    this.track.style.transform = 'translateX(-' + (this.index * 100) + '%)';
    if (!animate) {
      const track = this.track;
      requestAnimationFrame(function () { track.style.transition = ''; });
    }
    this.updateDots();
  };

  Carousel.prototype.next = function () { this.goTo(this.index + 1); };
  Carousel.prototype.prev = function () { this.goTo(this.index - 1); };

  Carousel.prototype.startAutoplay = function () {
    this.stopAutoplay();
    const self = this;
    this.timer = setInterval(function () { self.next(); }, this.interval);
  };
  Carousel.prototype.stopAutoplay = function () {
    if (this.timer) clearInterval(this.timer);
  };
  Carousel.prototype.restartAutoplay = function () {
    if (this.autoplay) this.startAutoplay();
  };

  Carousel.prototype.bindEvents = function () {
    const self = this;
    if (this.prevBtn) this.prevBtn.addEventListener('click', function () { self.prev(); self.restartAutoplay(); });
    if (this.nextBtn) this.nextBtn.addEventListener('click', function () { self.next(); self.restartAutoplay(); });

    if (this.autoplay) {
      this.root.addEventListener('mouseenter', function () { self.stopAutoplay(); });
      this.root.addEventListener('mouseleave', function () { self.startAutoplay(); });
    }

    // Pointer-based drag / touch swipe support
    this.track.addEventListener('pointerdown', function (e) {
      self.dragging = true;
      self.dragStartX = e.clientX;
      self.dragDeltaX = 0;
      self.stopAutoplay();
      self.track.style.transition = 'none';
      try { self.track.setPointerCapture(e.pointerId); } catch (err) {}
    });

    this.track.addEventListener('pointermove', function (e) {
      if (!self.dragging) return;
      self.dragDeltaX = e.clientX - self.dragStartX;
      const basePercent = -self.index * 100;
      self.track.style.transform = 'translateX(calc(' + basePercent + '% + ' + self.dragDeltaX + 'px))';
    });

    function endDrag() {
      if (!self.dragging) return;
      self.dragging = false;
      self.track.style.transition = '';
      const threshold = self.root.clientWidth * 0.15;
      if (self.dragDeltaX > threshold) self.prev();
      else if (self.dragDeltaX < -threshold) self.next();
      else self.goTo(self.index);
      self.dragDeltaX = 0;
      self.restartAutoplay();
    }

    this.track.addEventListener('pointerup', endDrag);
    this.track.addEventListener('pointerleave', function () { if (self.dragging) endDrag(); });
  };

  document.querySelectorAll('.carousel').forEach(function (root) { new Carousel(root); });

  /* ---------- 8. Contact form: validation + Web3Forms submission ---------- */
  const form = document.getElementById('contact-form-el');
  if (form) {
    const submitBtn = document.getElementById('submit-btn');
    const submitBtnText = document.getElementById('submit-btn-text');
    const submitSpinner = document.getElementById('submit-spinner');
    const successBanner = document.getElementById('form-success');
    const errorBanner = document.getElementById('form-error');

    const fields = {
      name: { el: document.getElementById('name'), validate: (v) => v.trim().length > 1 },
      email: { el: document.getElementById('email'), validate: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) },
      phone: { el: document.getElementById('phone'), validate: (v) => /^[+\d][\d\s-]{7,15}$/.test(v.trim()) },
      subject: { el: document.getElementById('subject'), validate: (v) => v.trim().length > 2 },
      message: { el: document.getElementById('message'), validate: (v) => v.trim().length > 9 },
    };

    function setFieldError(fieldEl, hasError) {
      if (!fieldEl) return;
      fieldEl.classList.toggle('field-error', hasError);
    }

    function validateForm() {
      let isValid = true;
      Object.values(fields).forEach(function (field) {
        if (!field.el) return;
        const valid = field.validate(field.el.value || '');
        setFieldError(field.el, !valid);
        if (!valid) isValid = false;
      });
      return isValid;
    }

    Object.values(fields).forEach(function (field) {
      if (!field.el) return;
      field.el.addEventListener('input', function () {
        if (field.validate(field.el.value || '')) setFieldError(field.el, false);
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      successBanner.classList.add('hidden');
      errorBanner.classList.add('hidden');

      if (!validateForm()) return;

      submitBtn.disabled = true;
      submitBtnText.textContent = 'Sending...';
      submitSpinner.classList.remove('hidden');

      const formData = new FormData(form);

      fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: { Accept: 'application/json' },
      })
        .then(function (response) { return response.json(); })
        .then(function (data) {
          if (data.success) {
            successBanner.classList.remove('hidden');
            form.reset();
          } else {
            errorBanner.classList.remove('hidden');
          }
        })
        .catch(function () {
          errorBanner.classList.remove('hidden');
        })
        .finally(function () {
          submitBtn.disabled = false;
          submitBtnText.textContent = 'Send Message';
          submitSpinner.classList.add('hidden');
        });
    });
  }
});
