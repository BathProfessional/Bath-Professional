/* Bath Professional — Main JavaScript */

(function () {
  'use strict';

  gsap.registerPlugin(ScrollTrigger);

  // ─── Lenis Smooth Scroll ───
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });

  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // ─── Custom Cursor (Bathtub) ───
  const cursor = document.getElementById('cursor');
  if (cursor && window.matchMedia('(pointer: fine)').matches) {
    const tub = cursor.querySelector('.cursor-tub');
    let mouseX = 0, mouseY = 0;
    let tubX = 0, tubY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    const TUB_OFFSET_X = 14;
    const TUB_OFFSET_Y = 18;

    function animateTub() {
      const targetX = mouseX + TUB_OFFSET_X;
      const targetY = mouseY + TUB_OFFSET_Y;
      tubX += (targetX - tubX) * 0.12;
      tubY += (targetY - tubY) * 0.12;
      tub.style.left = tubX + 'px';
      tub.style.top = tubY + 'px';
      requestAnimationFrame(animateTub);
    }
    animateTub();

    const hoverTargets = 'a, button, .ba-comparison, .masonry-item, .service-card, .calendar-day, select, .faq-question';
    document.querySelectorAll(hoverTargets).forEach((el) => {
      el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    });
  }

  // ─── Header Scroll ───
  const header = document.getElementById('header');
  ScrollTrigger.create({
    start: 'top -80',
    onUpdate: (self) => header.classList.toggle('scrolled', self.scroll() > 80),
  });

  // ─── Mobile Menu ───
  const menuToggle = document.getElementById('menuToggle');
  const mobileMenu = document.getElementById('mobileMenu');

  menuToggle?.addEventListener('click', () => {
    const open = mobileMenu.classList.toggle('open');
    menuToggle.classList.toggle('active', open);
    document.body.classList.toggle('menu-open', open);
    mobileMenu.setAttribute('aria-hidden', !open);
  });

  document.querySelectorAll('.mobile-nav-link').forEach((link) => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      menuToggle.classList.remove('active');
      document.body.classList.remove('menu-open');
    });
  });

  // ─── Smooth anchor links ───
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        lenis.scrollTo(target, { offset: -80 });
      }
    });
  });

  // ─── Hero Reveal Animation ───
  gsap.to('.hero-badge.reveal-up, .hero-sub.reveal-up, .hero-ctas.reveal-up, .google-trust-panel.reveal-up', {
    opacity: 1,
    y: 0,
    duration: 1,
    stagger: 0.12,
    ease: 'power3.out',
    delay: 0.8,
  });

  gsap.fromTo('.hero-title-brand',
    { opacity: 0, y: 50, scale: 0.92 },
    { opacity: 1, y: 0, scale: 1, duration: 1.2, ease: 'power4.out', delay: 0.2 }
  );

  gsap.fromTo('.hero-title-divider',
    { opacity: 0, scaleX: 0 },
    { opacity: 1, scaleX: 1, duration: 0.8, ease: 'power3.inOut', delay: 0.5 }
  );

  gsap.fromTo('.hero-title-tagline',
    { opacity: 0, y: 24 },
    { opacity: 1, y: 0, duration: 1, ease: 'power3.out', delay: 0.65 }
  );

  // ─── Particle Canvas ───
  const canvas = document.getElementById('particleCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    let w, h;

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    class Particle {
      constructor() { this.reset(); }
      reset() {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.speedY = (Math.random() - 0.5) * 0.3;
        this.opacity = Math.random() * 0.5 + 0.1;
        this.hue = Math.random() > 0.5 ? 170 : 45;
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < 0 || this.x > w || this.y < 0 || this.y > h) this.reset();
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${this.hue}, 80%, 60%, ${this.opacity})`;
        ctx.fill();
        ctx.shadowBlur = 10;
        ctx.shadowColor = `hsla(${this.hue}, 80%, 60%, 0.5)`;
      }
    }

    for (let i = 0; i < 80; i++) particles.push(new Particle());

    function animateParticles() {
      ctx.clearRect(0, 0, w, h);
      particles.forEach((p) => { p.update(); p.draw(); });
      requestAnimationFrame(animateParticles);
    }
    animateParticles();
  }

  // ─── Section Scroll Animations ───
  gsap.utils.toArray('.section-header').forEach((el) => {
    gsap.from(el.children, {
      scrollTrigger: { trigger: el, start: 'top 80%' },
      opacity: 0,
      y: 40,
      duration: 0.8,
      stagger: 0.1,
      ease: 'power3.out',
    });
  });

  gsap.utils.toArray('.service-card').forEach((card, i) => {
    gsap.from(card, {
      scrollTrigger: { trigger: card, start: 'top 85%' },
      opacity: 0,
      y: 60,
      duration: 0.7,
      delay: i * 0.1,
      ease: 'power3.out',
    });
  });

  gsap.utils.toArray('.why-card').forEach((card, i) => {
    gsap.from(card, {
      scrollTrigger: { trigger: card, start: 'top 85%' },
      opacity: 0,
      y: 40,
      scale: 0.95,
      duration: 0.6,
      delay: i * 0.08,
      ease: 'back.out(1.2)',
    });
  });

  // Stats fly-in
  gsap.utils.toArray('.stat-card').forEach((stat, i) => {
    gsap.to(stat, {
      scrollTrigger: { trigger: '.stats-grid', start: 'top 75%' },
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.6,
      delay: i * 0.12,
      ease: 'back.out(1.4)',
    });
  });

  // Counter animation
  document.querySelectorAll('[data-count]').forEach((el) => {
    const target = parseInt(el.dataset.count, 10);
    ScrollTrigger.create({
      trigger: el,
      start: 'top 80%',
      once: true,
      onEnter: () => {
        gsap.to({ val: 0 }, {
          val: target,
          duration: 1.5,
          ease: 'power2.out',
          onUpdate: function () {
            el.textContent = Math.round(this.targets()[0].val);
          },
        });
      },
    });
  });

  // ─── Before/After Slider ───
  function initBAComparison(container) {
    const beforeWrap = container.querySelector('.ba-before-wrap');
    const handle = container.querySelector('.ba-handle');
    if (!beforeWrap || !handle) return;

    let isDragging = false;

    function setPosition(x) {
      const rect = container.getBoundingClientRect();
      let percent = ((x - rect.left) / rect.width) * 100;
      percent = Math.max(5, Math.min(95, percent));
      beforeWrap.style.width = percent + '%';
      handle.style.left = percent + '%';
    }

    const startDrag = (e) => {
      isDragging = true;
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      setPosition(x);
    };

    const moveDrag = (e) => {
      if (!isDragging) return;
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      setPosition(x);
    };

    const endDrag = () => { isDragging = false; };

    container.addEventListener('mousedown', startDrag);
    container.addEventListener('touchstart', startDrag, { passive: true });
    window.addEventListener('mousemove', moveDrag);
    window.addEventListener('touchmove', moveDrag, { passive: true });
    window.addEventListener('mouseup', endDrag);
    window.addEventListener('touchend', endDrag);
  }

  document.querySelectorAll('.ba-comparison').forEach(initBAComparison);

  // BA slide navigation
  const baNavBtns = document.querySelectorAll('.ba-nav-btn');
  const baSlides = document.querySelectorAll('.ba-slide');

  baNavBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const index = parseInt(btn.dataset.slide, 10);
      baNavBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      baSlides.forEach((slide) => slide.classList.remove('active'));
      baSlides[index]?.classList.add('active');
    });
  });

  // ─── Service Lightbox ───
  const serviceGalleries = {
    tub: ['after-1.jpg', 'gallery-1.jpg', 'gallery-5.jpg', 'gallery-9.jpg'],
    shower: ['after-2.jpg', 'after-6.jpg', 'gallery-2.jpg', 'gallery-6.jpg'],
    tile: ['after-4.jpg', 'after-6.jpg', 'gallery-10.jpg', 'gallery-11.jpg'],
    counter: ['after-5.jpg', 'gallery-4.jpg', 'gallery-8.jpg', 'service-counter.jpg'],
    cabinet: ['gallery-7.jpg', 'gallery-11.jpg', 'service-cabinet.jpg'],
    sink: ['gallery-9.jpg', 'gallery-12.jpg', 'service-sink.jpg'],
  };

  const serviceTitles = {
    tub: 'Bathtub Refinishing',
    shower: 'Shower Refinishing',
    tile: 'Tile Refinishing',
    counter: 'Countertop Refinishing',
    cabinet: 'Cabinet Refinishing',
    sink: 'Sink Refinishing',
  };

  const serviceLightbox = document.getElementById('serviceLightbox');
  const lightboxGallery = document.getElementById('lightboxGallery');
  const lightboxTitle = document.getElementById('lightboxTitle');

  document.querySelectorAll('.service-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.gallery;
      const images = serviceGalleries[key] || [];
      lightboxTitle.textContent = serviceTitles[key] || 'Finish Gallery';
      lightboxGallery.innerHTML = images
        .map((img) => `<img src="images/${img}" alt="Bath Professional ${serviceTitles[key]} finish example" loading="lazy">`)
        .join('');
      serviceLightbox.classList.add('open');
      serviceLightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    });
  });

  function closeLightbox(el) {
    el.classList.remove('open');
    el.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.lightbox-close, .lightbox-backdrop').forEach((el) => {
    el.addEventListener('click', () => {
      closeLightbox(el.closest('.lightbox') || el.closest('.video-modal'));
    });
  });

  // ─── Gallery Filter ───
  const filterBtns = document.querySelectorAll('.filter-btn');
  const masonryItems = document.querySelectorAll('.masonry-item');

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      masonryItems.forEach((item) => {
        const cat = item.dataset.category;
        const show = filter === 'all' || cat === filter;
        item.classList.toggle('hidden-item', !show);
        if (show) {
          gsap.fromTo(item, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.4, ease: 'power2.out' });
        }
      });
    });
  });

  // Portfolio lightbox
  const portfolioLightbox = document.getElementById('portfolioLightbox');
  const portfolioBeforeWrap = document.getElementById('portfolioBeforeWrap');
  const portfolioBAHandle = document.getElementById('portfolioBAHandle');
  const portfolioBA = document.getElementById('portfolioBA');

  masonryItems.forEach((item) => {
    item.addEventListener('click', () => {
      document.getElementById('portfolioBefore').src = 'images/' + item.dataset.before.split('/').pop();
      document.getElementById('portfolioAfter').src = 'images/' + item.dataset.after.split('/').pop();
      document.getElementById('portfolioBefore').alt = 'Before transformation';
      document.getElementById('portfolioAfter').alt = 'After transformation — Bath Professional';
      document.getElementById('portfolioQuote').textContent = '"' + item.dataset.testimonial + '"';
      document.getElementById('portfolioClient').textContent = '— ' + item.dataset.client;
      portfolioBeforeWrap.style.width = '50%';
      portfolioBAHandle.style.left = '50%';
      portfolioLightbox.classList.add('open');
      portfolioLightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    });
  });

  if (portfolioBA) {
    let portfolioDragging = false;
    const startP = (e) => {
      portfolioDragging = true;
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      const rect = portfolioBA.getBoundingClientRect();
      let percent = ((x - rect.left) / rect.width) * 100;
      percent = Math.max(5, Math.min(95, percent));
      portfolioBeforeWrap.style.width = percent + '%';
      portfolioBAHandle.style.left = percent + '%';
    };
    portfolioBA.addEventListener('mousedown', startP);
    portfolioBA.addEventListener('touchstart', startP, { passive: true });
    window.addEventListener('mousemove', (e) => {
      if (!portfolioDragging) return;
      startP(e);
    });
    window.addEventListener('touchmove', (e) => {
      if (!portfolioDragging) return;
      startP(e);
    }, { passive: true });
    window.addEventListener('mouseup', () => { portfolioDragging = false; });
    window.addEventListener('touchend', () => { portfolioDragging = false; });
  }

  // ─── Color Wheel ───
  const colorSwatches = document.querySelectorAll('.color-swatch');
  const colorName = document.getElementById('colorName');
  const colorCode = document.getElementById('colorCode');
  const colorPreview = document.querySelector('.color-preview-surface');

  colorSwatches.forEach((swatch) => {
    swatch.addEventListener('click', () => {
      colorSwatches.forEach((s) => s.classList.remove('active'));
      swatch.classList.add('active');
      colorName.textContent = swatch.dataset.color;
      colorCode.textContent = swatch.dataset.code;
      colorPreview.style.background = swatch.style.getPropertyValue('--swatch') || getComputedStyle(swatch).getPropertyValue('--swatch');
      gsap.from(colorPreview, { scale: 0.9, duration: 0.4, ease: 'back.out(1.5)' });
    });
  });

  // ─── Quote Generator ───
  const quoteForm = document.getElementById('quoteForm');
  const quotePlaceholder = document.querySelector('.quote-placeholder');
  const quoteReveal = document.getElementById('quoteReveal');
  const priceAmount = document.getElementById('priceAmount');

  const servicePrices = {
    tub: 650, shower: 750, tile: 900, counter: 850,
    cabinet: 700, sink: 400, multiple: 1800,
  };

  const conditionMultiplier = { good: 1, fair: 1.15, poor: 1.35 };
  const finishMultiplier = { white: 1, biscuit: 1, bone: 1, almond: 1, custom: 1.15 };

  quoteForm?.addEventListener('submit', (e) => {
    e.preventDefault();

    const serviceType = document.getElementById('serviceType').value;
    const condition = document.getElementById('condition').value;
    const finish = document.getElementById('finish').value;

    let base = servicePrices[serviceType] || 750;
    base *= conditionMultiplier[condition] || 1;
    base *= finishMultiplier[finish] || 1;
    base = Math.round(base / 25) * 25;

    quotePlaceholder.style.display = 'none';
    quoteReveal.classList.remove('hidden');

    const priceObj = { val: 0 };
    gsap.to(priceObj, {
      val: base,
      duration: 1.5,
      ease: 'power2.out',
      onUpdate: () => {
        priceAmount.textContent = '$' + Math.round(priceObj.val).toLocaleString();
      },
    });

    gsap.from('.price-reveal', { scale: 0.8, opacity: 0, duration: 0.6, ease: 'back.out(1.5)' });
    gsap.from('.timeline-reveal', { y: 20, opacity: 0, duration: 0.5, delay: 0.3 });
    gsap.from('.calendar-picker', { y: 20, opacity: 0, duration: 0.5, delay: 0.5 });

    buildCalendar();
  });

  function buildCalendar() {
    const grid = document.getElementById('calendarGrid');
    if (!grid) return;
    grid.innerHTML = '';

    const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    days.forEach((d) => {
      const el = document.createElement('div');
      el.className = 'calendar-day header';
      el.textContent = d;
      grid.appendChild(el);
    });

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
      const el = document.createElement('div');
      el.className = 'calendar-day disabled';
      grid.appendChild(el);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const el = document.createElement('div');
      el.className = 'calendar-day';
      el.textContent = d;
      const date = new Date(year, month, d);
      if (date < now || date.getDay() === 0) {
        el.classList.add('disabled');
      } else {
        el.addEventListener('click', () => {
          grid.querySelectorAll('.calendar-day').forEach((c) => c.classList.remove('selected'));
          el.classList.add('selected');
        });
      }
      grid.appendChild(el);
    }
  }

  // ─── FAQ Accordion ───
  document.querySelectorAll('.faq-question').forEach((btn) => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const isOpen = item.classList.contains('open');

      document.querySelectorAll('.faq-item').forEach((i) => {
        i.classList.remove('open');
        i.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
      });

      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // ─── Parallax on scroll ───
  gsap.to('.hero-bg', {
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: true,
    },
    y: 120,
    scale: 1.05,
  });

  gsap.to('.final-cta-bg', {
    scrollTrigger: {
      trigger: '.final-cta',
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
    },
    backgroundPosition: '50% 100%',
  });

  // Escape key closes modals
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      [serviceLightbox, portfolioLightbox, videoModal].forEach((modal) => {
        if (modal?.classList.contains('open')) closeLightbox(modal);
      });
    }
  });

})();