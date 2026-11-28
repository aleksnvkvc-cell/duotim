(function () {
  // mouse tilt for the 3D logo (home only)
  var hero = document.querySelector('.hero');
  var tilt = document.getElementById('tilt');
  if (hero && tilt && window.matchMedia('(hover: hover)').matches) {
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var y = (e.clientY - r.top) / r.height - 0.5;
      tilt.style.transform = 'rotateY(' + (x * 28) + 'deg) rotateX(' + (-y * 20) + 'deg)';
    });
    hero.addEventListener('pointerleave', function () {
      tilt.style.transform = '';
    });
  }

  // hamburger menu
  var menuBtn = document.getElementById('menuBtn');
  var mobileNav = document.getElementById('mobileNav');

  function setMenu(open) {
    mobileNav.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    menuBtn.setAttribute('aria-label', open ? 'Zatvori meni' : 'Otvori meni');
  }

  menuBtn.addEventListener('click', function () {
    setMenu(!mobileNav.classList.contains('open'));
  });

  mobileNav.addEventListener('click', function (e) {
    var a = e.target.closest('a');
    if (!a) return;
    setMenu(false);
  });

  // tapping anywhere outside the open menu closes it
  document.addEventListener('click', function (e) {
    if (!mobileNav.classList.contains('open')) return;
    if (mobileNav.contains(e.target) || menuBtn.contains(e.target)) return;
    setMenu(false);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setMenu(false);
  });

  var desktop = window.matchMedia('(min-width: 801px)');
  var onDesktop = function (e) { if (e.matches) setMenu(false); };
  if (desktop.addEventListener) desktop.addEventListener('change', onDesktop);
  else desktop.addListener(onDesktop);

  // Google Maps links: app on phone, web on desktop
  var ADDR = 'Đure Jakšića 24, 12371 Vlaški Do';
  var ua = navigator.userAgent || '';
  var gmapsUrl, gmapsTarget;
  if (/Android/i.test(ua)) {
    gmapsUrl = 'geo:0,0?q=' + encodeURIComponent(ADDR);
    gmapsTarget = '_self';
  } else if (/iPhone|iPad|iPod/i.test(ua)) {
    gmapsUrl = 'https://maps.google.com/?q=' + encodeURIComponent(ADDR);
    gmapsTarget = '_blank';
  } else {
    gmapsUrl = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(ADDR);
    gmapsTarget = '_blank';
  }
  var gmapsLinks = document.querySelectorAll('[data-gmaps]');
  for (var i = 0; i < gmapsLinks.length; i++) {
    gmapsLinks[i].setAttribute('href', gmapsUrl);
    gmapsLinks[i].setAttribute('target', gmapsTarget);
    if (gmapsTarget === '_blank') gmapsLinks[i].setAttribute('rel', 'noopener');
    else gmapsLinks[i].removeAttribute('rel');
  }

  // gallery lightbox: click opens, arrows/keys/swipe move, Esc or backdrop closes
  var items = document.querySelectorAll('.gallery a');
  var lb = document.getElementById('lightbox');
  if (items.length && lb) {
    var lbImg = document.getElementById('lbImg');
    var lbCount = document.getElementById('lbCount');
    var closeBtn = lb.querySelector('.lb-close');
    var cur = 0, lastFocus = null, startX = null;

    function show(i) {
      cur = (i + items.length) % items.length;
      var a = items[cur];
      var im = a.querySelector('img');
      lbImg.src = a.getAttribute('href');
      lbImg.alt = im ? im.alt : '';
      lbCount.textContent = (cur + 1) + ' / ' + items.length;
    }
    function openLb(i) {
      lastFocus = document.activeElement;
      show(i);
      lb.classList.add('open');
      document.body.style.overflow = 'hidden';
      closeBtn.focus();
    }
    function closeLb() {
      lb.classList.remove('open');
      document.body.style.overflow = '';
      lbImg.removeAttribute('src');
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    for (var k = 0; k < items.length; k++) {
      (function (idx) {
        items[idx].addEventListener('click', function (e) { e.preventDefault(); openLb(idx); });
      })(k);
    }
    closeBtn.addEventListener('click', closeLb);
    lb.querySelector('.lb-prev').addEventListener('click', function () { show(cur - 1); });
    lb.querySelector('.lb-next').addEventListener('click', function () { show(cur + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') closeLb();
      else if (e.key === 'ArrowLeft') show(cur - 1);
      else if (e.key === 'ArrowRight') show(cur + 1);
    });
    lb.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      if (startX === null) return;
      var dx = e.changedTouches[0].clientX - startX;
      startX = null;
      if (Math.abs(dx) > 40) show(cur + (dx < 0 ? 1 : -1));
    });
  }

  // same-page anchors (e.g. #telefoni on the contact page): centre the target under the header
  if (location.hash.length > 1) {
    var target = document.getElementById(location.hash.slice(1));
    if (target) {
      var headerH = 72;
      var free = window.innerHeight - headerH;
      var pad = target.offsetHeight < free ? (free - target.offsetHeight) / 2 : 8;
      var top = window.scrollY + target.getBoundingClientRect().top - headerH - pad;
      window.scrollTo({ top: Math.max(0, top), behavior: 'auto' });
    }
  }
})();

// touch: swipe right on any subpage returns to the main page
(function () {
  var isHome = /(^|\/)index\.html$/.test(location.pathname) || location.pathname.replace(/\/+$/, '') === '' || /\/duotim$/.test(location.pathname);
  if (isHome) return;
  var sx = 0, sy = 0, st = 0, tracking = false;
  document.addEventListener('touchstart', function (e) {
    if (e.touches.length !== 1) { tracking = false; return; }
    // ignore swipes that start inside horizontally scrollable content (tables, maps, galleries)
    if (e.target.closest && e.target.closest('.map, .lightbox, .lb, pre, table, .tiles-scroll')) { tracking = false; return; }
    sx = e.touches[0].clientX; sy = e.touches[0].clientY; st = Date.now(); tracking = true;
  }, { passive: true });
  document.addEventListener('touchend', function (e) {
    if (!tracking) return;
    tracking = false;
    var t = e.changedTouches[0];
    var dx = t.clientX - sx, dy = t.clientY - sy, dt = Date.now() - st;
    // a deliberate, fast, mostly horizontal swipe to the right
    if (dx > 90 && Math.abs(dy) < 60 && Math.abs(dx) > Math.abs(dy) * 2 && dt < 600) {
      location.href = 'index.html';
    }
    // swipe left goes back to the page the visitor came from on this site
    if (dx < -90 && Math.abs(dy) < 60 && Math.abs(dx) > Math.abs(dy) * 2 && dt < 600 && history.length > 1) {
      history.back();
    }
  }, { passive: true });
})();

// Static mode: keep original semantic headings and full text visible.

// Static mode: slides do not advance automatically; first images remain visible.

/* slideshow radova: fotografija leži u pravoj perspektivi na tablu vrata sa loga (umesto ravne slike isečene na kosi oblik) */
(function () {
  var boxes = document.querySelectorAll('#winSlides, .radovi-show .win-slides, .ur-show .win-slides');
  if (!boxes.length) return;
  var Q = [[0, .30], [.70, .10], [.70, .92], [0, .76]];
  function solve(w, h) {
    var src = [[0, 0], [w, 0], [w, h], [0, h]], A = [], k, r, c, p;
    for (k = 0; k < 4; k++) {
      var x = src[k][0], y = src[k][1], X = Q[k][0] * w, Y = Q[k][1] * h;
      A.push([x, y, 1, 0, 0, 0, -x * X, -y * X, X]);
      A.push([0, 0, 0, x, y, 1, -x * Y, -y * Y, Y]);
    }
    for (c = 0; c < 8; c++) {
      p = c;
      for (r = c + 1; r < 8; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r;
      var t = A[c]; A[c] = A[p]; A[p] = t;
      for (r = 0; r < 8; r++) if (r !== c) { var f = A[r][c] / A[c][c]; for (k = c; k < 9; k++) A[r][k] -= f * A[c][k]; }
    }
    return A.map(function (row, n) { return row[8] / row[n]; });
  }
  function fit() {
    [].forEach.call(boxes, function (b) {
      var w = b.offsetWidth, h = b.offsetHeight;
      if (!w || !h) return;
      var m = solve(w, h);
      b.style.setProperty('--persp', 'matrix3d(' + [m[0], m[3], 0, m[6], m[1], m[4], 0, m[7], 0, 0, 1, 0, m[2], m[5], 0, 1].join(',') + ')');
      b.classList.add('win-persp');
    });
  }
  fit();
  window.addEventListener('load', fit);
  window.addEventListener('resize', fit);
  /* kao u galeriji: na prelazak mišem ili dodir slika se okrene licem ka posetiocu */
  [].forEach.call(document.querySelectorAll('.hero .winshow, .ur-show .winshow'), function (w) {
    w.classList.add('can-face');
    w.addEventListener('click', function () { w.classList.toggle('face'); });
  });
})();

/* header address: load the mini map only on first hover or focus */
(function () {
  var box = document.querySelector('.tb-map');
  if (!box) return;
  function load() {
    var f = box.querySelector('.tb-map-frame');
    if (!f || f.firstChild || !f.dataset.src) return;
    var i = document.createElement('iframe');
    i.src = f.dataset.src; i.title = 'Mini mapa: Đure Jakšića 24, Vlaški Do'; i.tabIndex = -1;
    f.appendChild(i);
  }
  box.addEventListener('mouseenter', load);
  box.addEventListener('focusin', load);
})();

(function () {
  const preview = document.querySelector('.hero-work-preview');
  if (!preview) return;

  const slides = Array.from(preview.querySelectorAll('.work-preview-slide'));
  if (slides.length < 2) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const hover = window.matchMedia('(hover: hover)');
  let current = 0;

  window.setInterval(() => {
    if (document.hidden || reducedMotion.matches || preview.matches(':focus-within') ||
        (hover.matches && preview.matches(':hover'))) return;

    slides[current].hidden = true;
    current = (current + 1) % slides.length;
    slides[current].hidden = false;
  }, 3500);
})();

/* Hero-yellow back-to-top chevron. */
(function () {
  if (document.querySelector('.back-to-top')) return;
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'back-to-top';
  button.setAttribute('aria-label', 'Vrati na vrh');
  button.title = 'Vrati na vrh';
  button.innerHTML = '<svg viewBox="0 0 48 48" width="48" height="48" aria-hidden="true" focusable="false"><path d="M7 29 L24 15 L41 29" fill="none" stroke="var(--accent, #fbb400)" stroke-width="6" stroke-linejoin="miter"/></svg>';
  button.style.cssText = 'position:fixed;right:max(16px,env(safe-area-inset-right));bottom:calc(20px + env(safe-area-inset-bottom,0px));z-index:100;width:48px;height:48px;padding:0;border:0;background:transparent;box-shadow:none;cursor:pointer;line-height:0;';
  document.body.appendChild(button);
  function sync() { button.style.display = window.scrollY < 320 && document.activeElement !== button ? 'none' : 'block'; }
  window.addEventListener('scroll', sync, {passive:true});
  window.addEventListener('pageshow', sync);
  button.addEventListener('blur', sync);
  button.addEventListener('click', function () {
    window.scrollTo({top:0, behavior:'instant'});
    button.blur();
    sync();
  });
  sync();
})();

/* One compact flyer masthead: contacts and navigation share one surface. */
(function () {
  const contacts = document.querySelector('body > .topbar');
  const header = document.querySelector('body > header');
  if (!contacts || !header) return;
  header.classList.add('flyer-unified-header');
  header.prepend(contacts);
  const style = document.createElement('style');
  style.textContent = `
    :root[data-theme] .flyer-unified-header {position:relative;top:auto;border-bottom:2px solid var(--accent);}
    .flyer-unified-header > .topbar {background:#25272a!important;color:#fff!important;z-index:2;border:0;}
    .flyer-unified-header > .topbar a {color:inherit!important;}
    .flyer-unified-header > .topbar .wrap {padding:5px 0!important;}
    .flyer-unified-header > .bar {height:auto;min-height:48px;}
    @media(max-width:800px) {
      .flyer-unified-header > .topbar .wrap {gap:2px 10px!important;}
      .flyer-unified-header > .bar {min-height:44px;}
    }
  `;
  document.head.appendChild(style);
})();

/* Home belongs to the same navigation list, not a separate button. */
(function () {
  const bar = document.querySelector('header .bar');
  if (!bar) return;
  const brand = bar.querySelector('.brand-up');
  const list = bar.querySelector('nav ul');
  if (!brand || !list) return;
  const home = document.createElement('a');
  home.href = brand.getAttribute('href') || './';
  home.textContent = 'Početna';
  if (/\/(?:index\.html)?$/.test(location.pathname)) home.setAttribute('aria-current','page');
  const li = document.createElement('li');
  li.appendChild(home);
  list.prepend(li);
  brand.remove();
  const style = document.createElement('style');
  style.textContent = 'header .bar{justify-content:flex-end} @media(min-width:801px){header .bar > nav > ul{gap:clamp(10px,2vw,26px)}}';
  document.head.appendChild(style);
})();

/* Consistent flyer navigation on desktop and mobile. */
(function () {
  const order = ['index.html','o-nama.html','usluge.html','profili.html','katalog.html','radovi.html','kontakt.html'];
  function key(a) {
    const href = a.getAttribute('href');
    if (href === './' || href === 'index.html') return 'index.html';
    return href;
  }
  document.querySelectorAll('header nav ul, header .mobile-nav').forEach(function (list) {
    const items = Array.from(list.children);
    const ranked = items.map(function (node) {
      const a = node.matches('a') ? node : node.querySelector('a');
      return {node:node,a:a,rank:a ? order.indexOf(key(a)) : -1};
    }).filter(function (item) { return item.rank >= 0; });
    ranked.sort(function (a,b) { return a.rank-b.rank; });
    const fragment = document.createDocumentFragment();
    ranked.forEach(function (item) {
      if (key(item.a) === 'radovi.html') item.a.textContent = 'Galerija';
      fragment.appendChild(item.node);
    });
    list.prepend(fragment);
  });
  document.querySelectorAll('main a[href="radovi.html"]').forEach(function (a) {
    if (a.textContent.trim() === 'Radovi') a.textContent = 'Galerija';
  });
})();
