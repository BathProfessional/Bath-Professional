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

  // ─── Hero sparkle FX ───
  const sparkleField = document.getElementById('heroSparkleField');
  const mouseSparkles = document.getElementById('heroMouseSparkles');
  const heroSection = document.getElementById('hero');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.innerWidth < 768;

  if (!reducedMotion) {
    if (sparkleField) {
      const colors = ['teal', 'gold', 'white'];
      const count = isMobile ? 32 : 56;

      for (let i = 0; i < count; i++) {
        const el = document.createElement('span');
        const isDiamond = Math.random() > 0.6;
        el.className = `hero-sparkle ${colors[i % 3]}${isDiamond ? ' diamond' : ''}`;
        el.style.left = `${Math.random() * 100}%`;
        el.style.top = `${Math.random() * 100}%`;
        el.style.setProperty('--sz', `${2 + Math.random() * 6}px`);
        el.style.setProperty('--dur', `${1.8 + Math.random() * 4.5}s`);
        el.style.setProperty('--delay', `${Math.random() * 6}s`);
        sparkleField.appendChild(el);
      }
    }

    if (mouseSparkles && heroSection && window.matchMedia('(pointer: fine)').matches) {
      const sparkleColors = ['#5eead4', '#fbbf24', '#ffffff'];
      let lastSpawn = 0;

      heroSection.addEventListener('mousemove', (e) => {
        const now = Date.now();
        if (now - lastSpawn < 45) return;
        lastSpawn = now;

        const rect = heroSection.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        const spark = document.createElement('span');
        spark.className = 'hero-mouse-sparkle';
        spark.style.left = `${x}%`;
        spark.style.top = `${y}%`;
        spark.style.setProperty('--sz', `${3 + Math.random() * 4}px`);
        spark.style.setProperty('--sparkle-color', sparkleColors[Math.floor(Math.random() * 3)]);
        mouseSparkles.appendChild(spark);

        if (mouseSparkles.children.length > 24) {
          mouseSparkles.firstElementChild?.remove();
        }
        spark.addEventListener('animationend', () => spark.remove());
      });
    }
  }

  // ─── Particle Canvas (sparkle stars) ───
  const canvas = document.getElementById('particleCanvas');
  if (canvas && !reducedMotion) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    let sparkBursts = [];
    let w, h;
    let mouseX = -1000;
    let mouseY = -1000;

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    document.getElementById('hero')?.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    });

    function drawStar(x, y, size, opacity, hue) {
      const spikes = 4;
      const outer = size;
      const inner = size * 0.35;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(Math.PI / 4);
      ctx.beginPath();
      for (let i = 0; i < spikes * 2; i++) {
        const r = i % 2 === 0 ? outer : inner;
        const a = (Math.PI / spikes) * i;
        const px = Math.cos(a) * r;
        const py = Math.sin(a) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fillStyle = `hsla(${hue}, 90%, 72%, ${opacity})`;
      ctx.shadowBlur = size * 3;
      ctx.shadowColor = `hsla(${hue}, 90%, 60%, ${opacity * 0.8})`;
      ctx.fill();
      ctx.restore();
    }

    class Particle {
      constructor() { this.reset(); }
      reset() {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.size = Math.random() * 2.5 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.4;
        this.speedY = (Math.random() - 0.5) * 0.4 - 0.15;
        this.opacity = Math.random() * 0.6 + 0.15;
        this.hue = Math.random() > 0.45 ? 168 : 43;
        this.twinkle = Math.random() * Math.PI * 2;
        this.twinkleSpeed = 0.02 + Math.random() * 0.04;
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.twinkle += this.twinkleSpeed;
        const tw = 0.5 + Math.sin(this.twinkle) * 0.5;
        this.currentOpacity = this.opacity * tw;

        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          this.x -= dx * 0.008;
          this.y -= dy * 0.008;
          this.currentOpacity = Math.min(1, this.currentOpacity + 0.15);
        }

        if (this.x < -20 || this.x > w + 20 || this.y < -20 || this.y > h + 20) this.reset();
      }
      draw() {
        drawStar(this.x, this.y, this.size * 1.6, this.currentOpacity, this.hue);
      }
    }

    class SparkBurst {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.life = 1;
        this.decay = 0.02 + Math.random() * 0.025;
        this.size = 3 + Math.random() * 4;
        this.hue = Math.random() > 0.5 ? 168 : 43;
      }
      update() {
        this.life -= this.decay;
        return this.life > 0;
      }
      draw() {
        drawStar(this.x, this.y, this.size * (0.5 + this.life * 1.5), this.life * 0.85, this.hue);
      }
    }

    const particleCount = isMobile ? 80 : 140;
    for (let i = 0; i < particleCount; i++) particles.push(new Particle());

    setInterval(() => {
      if (sparkBursts.length < 10) {
        sparkBursts.push(new SparkBurst(Math.random() * w, Math.random() * h * 0.85));
      }
    }, isMobile ? 1200 : 700);

    function animateParticles() {
      ctx.clearRect(0, 0, w, h);
      particles.forEach((p) => { p.update(); p.draw(); });
      sparkBursts = sparkBursts.filter((b) => {
        b.draw();
        return b.update();
      });
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
    const handle = container.querySelector('.ba-handle');
    if (!handle) return;

    let isDragging = false;

    function setPosition(x) {
      const rect = container.getBoundingClientRect();
      if (rect.width <= 0) return;
      let percent = ((x - rect.left) / rect.width) * 100;
      percent = Math.max(5, Math.min(95, percent));
      container.style.setProperty('--ba-split', percent + '%');
      handle.style.left = percent + '%';
    }

    setPosition(container.getBoundingClientRect().left + container.getBoundingClientRect().width * 0.5);
    container._syncBA = () => {
      const split = container.style.getPropertyValue('--ba-split') || '50%';
      container.style.setProperty('--ba-split', split);
    };

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
      requestAnimationFrame(() => {
        baSlides[index]?.querySelectorAll('.ba-comparison').forEach((el) => el._syncBA?.());
      });
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