(function () {
  var doc = document.documentElement;
  var body = document.body;

  // Header: solid background once the page scrolls past the top
  var header = document.querySelector('.site-header');
  function onScroll() {
    if (!header) return;
    header.classList.toggle('is-solid', window.scrollY > 40 || body.classList.contains('menu-open'));
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile menu
  var toggle = document.querySelector('.menu-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var open = body.classList.toggle('menu-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      onScroll();
    });
    document.querySelectorAll('.nav a').forEach(function (a) {
      a.addEventListener('click', function () {
        body.classList.remove('menu-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && body.classList.contains('menu-open')) toggle.click();
    });
  }

  // Intro curtain, then the hero load sequence
  var curtain = document.querySelector('.intro-curtain');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function startHero() { requestAnimationFrame(function () { body.classList.add('is-loaded'); }); }
  if (curtain && !doc.classList.contains('no-intro') && !reduceMotion) {
    setTimeout(function () {
      curtain.classList.add('is-out');
      setTimeout(startHero, 350);
      setTimeout(function () { curtain.remove(); }, 1100);
    }, 1500);
    try { sessionStorage.setItem('stravous-intro', '1'); } catch (e) {}
  } else {
    if (curtain) curtain.remove();
    startHero();
  }

  // Respect reduced motion for autoplaying video
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) {
    document.querySelectorAll('video[autoplay]').forEach(function (v) { v.pause(); v.removeAttribute('autoplay'); });
  }

  // Play / pause buttons for background films
  document.querySelectorAll('[data-film-toggle]').forEach(function (btn) {
    var video = document.getElementById(btn.getAttribute('data-film-toggle'));
    if (!video) return;
    var label = btn.querySelector('span');
    var pauseIcon = '<svg viewBox="0 0 12 12" aria-hidden="true"><rect x="1" y="0" width="3.5" height="12" fill="currentColor"/><rect x="7.5" y="0" width="3.5" height="12" fill="currentColor"/></svg>';
    var playIcon = '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M1 0l11 6-11 6z" fill="currentColor"/></svg>';
    function sync() {
      var playing = !video.paused;
      btn.querySelector('i').innerHTML = playing ? pauseIcon : playIcon;
      label.textContent = playing ? 'Pause film' : 'Play film';
    }
    btn.addEventListener('click', function () { video.paused ? video.play() : video.pause(); });
    video.addEventListener('play', sync);
    video.addEventListener('pause', sync);
    sync();
  });

  // Lightbox for any [data-gallery] group
  var groups = {};
  document.querySelectorAll('[data-gallery] [data-full]').forEach(function (el) {
    var name = el.closest('[data-gallery]').getAttribute('data-gallery');
    (groups[name] = groups[name] || []).push(el);
  });
  var names = Object.keys(groups);
  if (names.length) {
    var dlg = document.createElement('dialog');
    dlg.className = 'lightbox';
    dlg.setAttribute('aria-label', 'Photo viewer');
    dlg.innerHTML =
      '<img alt="">' +
      '<button class="lb-close" type="button" aria-label="Close photo viewer"><svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="M1 1l16 16M17 1L1 17" stroke="currentColor" stroke-width="1.5"/></svg></button>' +
      '<button class="lb-prev" type="button" aria-label="Previous photo"><svg width="10" height="18" viewBox="0 0 10 18" aria-hidden="true"><path d="M9 1L1 9l8 8" fill="none" stroke="currentColor" stroke-width="1.5"/></svg></button>' +
      '<button class="lb-next" type="button" aria-label="Next photo"><svg width="10" height="18" viewBox="0 0 10 18" aria-hidden="true"><path d="M1 1l8 8-8 8" fill="none" stroke="currentColor" stroke-width="1.5"/></svg></button>' +
      '<p class="lb-count" aria-live="polite"></p>';
    body.appendChild(dlg);
    var img = dlg.querySelector('img');
    var count = dlg.querySelector('.lb-count');
    var current = [], index = 0, opener = null;

    dlg.setAttribute('data-lenis-prevent', '');
    function show(i) {
      index = (i + current.length) % current.length;
      var el = current[index];
      img.src = el.getAttribute('data-full');
      img.alt = (el.querySelector('img') || {}).alt || '';
      count.textContent = (index + 1) + ' of ' + current.length;
    }
    names.forEach(function (n) {
      groups[n].forEach(function (el, i) {
        el.addEventListener('click', function (e) {
          e.preventDefault();
          current = groups[n]; opener = el;
          show(i);
          if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
          body.style.overflow = 'hidden';
          if (window.__lenis) window.__lenis.stop();
        });
      });
    });
    dlg.querySelector('.lb-close').addEventListener('click', function () { dlg.close(); });
    dlg.querySelector('.lb-prev').addEventListener('click', function () { show(index - 1); });
    dlg.querySelector('.lb-next').addEventListener('click', function () { show(index + 1); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') show(index - 1);
      if (e.key === 'ArrowRight') show(index + 1);
    });
    dlg.addEventListener('close', function () {
      body.style.overflow = '';
      if (window.__lenis) window.__lenis.start();
      if (opener) opener.focus();
    });
  }

  // Contact form (Netlify Forms)
  var form = document.querySelector('form[data-contact]');
  if (form) {
    var status = form.querySelector('.form-status');
    function validate(field) {
      var input = field.querySelector('input, select, textarea');
      if (!input) return true;
      var ok = input.checkValidity();
      field.classList.toggle('invalid', !ok);
      input.setAttribute('aria-invalid', ok ? 'false' : 'true');
      return ok;
    }
    form.querySelectorAll('.field').forEach(function (f) {
      var input = f.querySelector('input, select, textarea');
      if (input) input.addEventListener('blur', function () { if (input.value) validate(f); });
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true, first = null;
      form.querySelectorAll('.field').forEach(function (f) {
        if (!validate(f)) { ok = false; first = first || f.querySelector('input, select, textarea'); }
      });
      if (!ok) { first.focus(); return; }
      var btn = form.querySelector('button[type="submit"]');
      btn.disabled = true; btn.textContent = 'Sending…';
      var data = new URLSearchParams(new FormData(form)).toString();
      fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: data })
        .then(function (r) {
          if (!r.ok) throw new Error(r.status);
          form.reset();
          status.textContent = 'Message sent. Our team will reply within 24 hours.';
          status.classList.add('show');
          btn.textContent = 'Message sent';
        })
        .catch(function () {
          status.textContent = 'Your message could not be sent. Check your connection and try again, or email info@stravousconstruction.com.';
          status.classList.add('show');
          btn.disabled = false; btn.textContent = 'Send message';
        });
    });
  }

  // Footer year
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();

/* =========================================================
   Motion and effects
   ========================================================= */
(function () {
  var doc = document.documentElement;
  var body = document.body;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  doc.classList.add('fx');

  var finePointer = window.matchMedia('(pointer: fine)').matches;

  // ---- Smooth scrolling (desktop) ----
  var lenis = null;
  if (window.Lenis && finePointer) {
    lenis = new window.Lenis({ duration: 1.15, smoothWheel: true, anchors: true });
    window.__lenis = lenis;
  }

  // ---- Split headings into words ----
  var headings = document.querySelectorAll('main h2, .page-head h1, .city__text h2');
  headings.forEach(function (h) {
    if (h.closest('.mv')) return;
    var words = h.textContent.trim().split(/\s+/);
    h.setAttribute('aria-label', h.textContent.trim());
    h.innerHTML = words.map(function (w, i) {
      return '<span class="w" aria-hidden="true"><span class="wi" style="--i:' + i + '">' + w + '</span></span>';
    }).join(' ');
    h.classList.add('split-words');
  });
  // Hero headline uses the same treatment, triggered by the load sequence
  var heroH1 = document.querySelector('.hero h1');
  if (heroH1) {
    var i = 0;
    heroH1.querySelectorAll('.line').forEach(function (line) {
      line.innerHTML = line.textContent.trim().split(/\s+/).map(function (w) {
        return '<span class="w"><span class="wi" style="--i:' + (i++) + '">' + w + '</span></span>';
      }).join(' ');
    });
    heroH1.classList.add('split-words');
  }

  // ---- Tag elements for reveal ----
  function tag(selector, cls, stagger) {
    document.querySelectorAll(selector).forEach(function (el) {
      el.classList.add(cls);
      if (stagger) {
        var sibs = Array.prototype.filter.call(el.parentElement.children, function (c) { return c.matches(selector); });
        el.style.setProperty('--d', sibs.indexOf(el) % 8);
      }
    });
  }
  tag('.section-head p, .section-head .text-link, .intro__body p, .split__text > p, .split__text > .text-link, .page-head p, .cta p, .cta .btn-row, .city__text p, .city__text .btn, .contact__lead', 'rise');
  tag('.facts > div, .commitments > div, .values article, .mv article, .process li, .service, .team figure, .details section, .form .field, .form__foot', 'rise', true);
  tag('.service__img, .work .ph, .team .ph, .process__img, .split__media img, .films video', 'wipe', true);
  tag('.mosaic button, .gallery button, .strip button, .city figure', 'wipe', true);
  document.querySelectorAll('.facts, .commitments, .values, .mv').forEach(function (el) { el.classList.add('line-host'); });
  document.querySelectorAll('.datum__line').forEach(function (el) { if (!el.closest('.hero')) el.classList.add('draw-line'); });

  // split__media images are not siblings of the same parent in a way that staggers well
  document.querySelectorAll('.split__media .b').forEach(function (el) { el.style.setProperty('--d', 2); });

  // ---- Reveal on scroll ----
  var targets = document.querySelectorAll('.split-words:not(.hero h1), .rise, .wipe, .draw-line, .line-host, .footer-mark');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    targets.forEach(function (t) { if (!t.closest('.hero')) io.observe(t); });
  } else {
    targets.forEach(function (t) { t.classList.add('in'); });
  }
  // Hero and page-head headings start with the load sequence
  function heroIn() {
    document.querySelectorAll('.hero .split-words, .page-head .split-words').forEach(function (h) { h.classList.add('in'); });
  }
  if (body.classList.contains('is-loaded')) heroIn();
  else new MutationObserver(function (m, obs) {
    if (body.classList.contains('is-loaded')) { heroIn(); obs.disconnect(); }
  }).observe(body, { attributes: true, attributeFilter: ['class'] });

  // ---- Scroll-driven effects ----
  var progress = document.createElement('div');
  progress.className = 'scroll-progress';
  body.appendChild(progress);
  var header = document.querySelector('.site-header');
  var lastY = window.scrollY;
  var parallax = [];
  function addParallax(sel, speed) {
    document.querySelectorAll(sel).forEach(function (el) { parallax.push({ el: el, speed: speed }); });
  }
  addParallax('.page-head__media img', 0.18);
  addParallax('.band img', 0.14);
  addParallax('.hero__inner', -0.12);
  document.querySelectorAll('.page-head__media img, .band img').forEach(function (img) { img.style.scale = '1.18'; });

  var films = document.querySelectorAll('.film');
  var process = document.querySelector('.process');
  var marquee = document.querySelector('.marquee__track');
  var mqX = 0, mqSpeed = 0.6, velocity = 0;

  function frame() {
    var y = window.scrollY, vh = window.innerHeight;
    var max = doc.scrollHeight - vh;
    progress.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';

    // header hide on scroll down
    if (header && !body.classList.contains('menu-open')) {
      if (y > lastY + 4 && y > 300) header.classList.add('is-hidden');
      else if (y < lastY - 4 || y < 300) header.classList.remove('is-hidden');
    }
    velocity = y - lastY;
    lastY = y;

    parallax.forEach(function (p) {
      var r = p.el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      var center = r.top + r.height / 2 - vh / 2;
      p.el.style.transform = 'translate3d(0,' + (center * p.speed * -1).toFixed(1) + 'px,0)';
    });

    films.forEach(function (f) {
      var r = f.getBoundingClientRect();
      var p = Math.min(1, Math.max(0, (vh - r.top) / (vh * 0.85)));
      f.style.setProperty('--inset', ((1 - p) * 7).toFixed(2) + '%');
    });

    if (process) {
      var pr = process.getBoundingClientRect();
      var pp = Math.min(1, Math.max(0, (vh * 0.85 - pr.top) / (pr.height * 0.9)));
      process.style.setProperty('--p', pp.toFixed(3));
    }

    if (marquee) {
      mqSpeed += ((0.6 + Math.min(Math.abs(velocity), 40) * 0.12) - mqSpeed) * 0.08;
      mqX -= mqSpeed * (velocity < 0 ? -1 : 1);
      var w = marquee.scrollWidth / 2;
      if (mqX <= -w) mqX += w;
      if (mqX > 0) mqX -= w;
      marquee.style.transform = 'translate3d(' + mqX.toFixed(1) + 'px,0,0)';
    }
  }

  function loop(t) {
    if (lenis) lenis.raf(t);
    frame();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  // ---- Fine-pointer effects: cursor, magnetic buttons, tilt ----
  if (!finePointer) return;
  doc.classList.add('has-cursor');
  var ring = document.createElement('div');
  ring.className = 'cursor';
  ring.innerHTML = '<span>View</span>';
  var dot = document.createElement('div');
  dot.className = 'cursor-dot';
  body.appendChild(ring); body.appendChild(dot);
  var mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
  window.addEventListener('mousemove', function (e) {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = 'translate3d(' + mx + 'px,' + my + 'px,0)';
  }, { passive: true });
  (function follow() {
    rx += (mx - rx) * 0.16; ry += (my - ry) * 0.16;
    ring.style.transform = 'translate3d(' + rx.toFixed(1) + 'px,' + ry.toFixed(1) + 'px,0)';
    requestAnimationFrame(follow);
  })();
  document.addEventListener('mouseover', function (e) {
    var view = e.target.closest('[data-full], .work a');
    var link = e.target.closest('a, button, select, label');
    ring.classList.toggle('is-view', !!view);
    dot.classList.toggle('is-view', !!view);
    ring.classList.toggle('is-link', !view && !!link);
  });
  document.addEventListener('mouseleave', function () { ring.classList.add('is-hidden'); dot.classList.add('is-hidden'); });
  document.addEventListener('mouseenter', function () { ring.classList.remove('is-hidden'); dot.classList.remove('is-hidden'); });
  document.querySelectorAll('input, textarea, iframe').forEach(function (el) {
    el.addEventListener('mouseenter', function () { ring.classList.add('is-hidden'); dot.classList.add('is-hidden'); });
    el.addEventListener('mouseleave', function () { ring.classList.remove('is-hidden'); dot.classList.remove('is-hidden'); });
  });

  document.querySelectorAll('.btn').forEach(function (btn) {
    btn.classList.add('magnet');
    btn.addEventListener('mousemove', function (e) {
      var r = btn.getBoundingClientRect();
      var dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      btn.style.transform = 'translate(' + (dx * 0.22).toFixed(1) + 'px,' + (dy * 0.32).toFixed(1) + 'px)';
    });
    btn.addEventListener('mouseleave', function () { btn.style.transform = ''; });
  });

  document.querySelectorAll('.service, .team figure').forEach(function (card) {
    card.classList.add('tilt');
    card.addEventListener('mousemove', function (e) {
      var r = card.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = 'perspective(900px) rotateY(' + (px * 5).toFixed(2) + 'deg) rotateX(' + (py * -5).toFixed(2) + 'deg)';
    });
    card.addEventListener('mouseleave', function () { card.style.transform = ''; });
  });
})();
