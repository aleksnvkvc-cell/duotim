(function () {
  var root = document.documentElement;
  var btn = document.getElementById('themeToggle');
  var label = document.getElementById('themeLabel');

  var saved = null;
  try { saved = localStorage.getItem('duotim-theme'); } catch (e) {}

  var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

  function apply(theme) {
    root.setAttribute('data-theme', theme);
    label.textContent = theme === 'dark' ? 'Svetla tema' : 'Tamna tema';
    btn.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
  }

  apply(saved || (prefersDark ? 'dark' : 'light'));

  btn.addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    apply(next);
    try { localStorage.setItem('duotim-theme', next); } catch (e) {}
  });

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

// hero headline: each word flies in like a bird and lands in place
(function () {
  var h = document.querySelector('.hero h1');
  if (!h || (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) return;
  var text = h.textContent.trim();
  h.setAttribute('aria-label', text);
  h.classList.add('birds');
  h.innerHTML = text.split(/\s+/).map(function (w, i) {
    var accent = i >= 2 && i <= 4 ? ' accent' : '';
    var inner = w;
    if (i === 0) inner = '<span class="win">' + w + '</span>';          // window: opens on its top edge
    if (i === 2) inner = '<span class="door">' + w + '</span>';         // door: swings open on its hinge
    if (w === 'dom') inner = '<span class="house">' + w + '</span>';        // framed in a little house
    // "i" comes out of the window, "za vaš" comes out of the door, once each one has opened
    var emerge = { 1: '2.5s', 3: '3.1s', 4: '3.3s' }[i];
    // light sweep: yellow over "PROZORI I", white over "VRATA ZA VAŠ", yellow over "DOM", left to right
    var sw = i <= 1 ? ['#FBB400', 4.6, i] : (i <= 4 ? ['#ffffff', 5.3, i - 2] : ['#FBB400', 6.2, 0]);
    var sweepStyle = '--sweep:' + sw[0] + ';--s:' + (sw[1] + sw[2] * 0.1).toFixed(2) + 's;';
    var cls = 'bird' + (emerge ? ' emerge' : '') + accent + ' sweep';
    var delay = emerge ? ';--d:' + emerge : '';
    return '<span class="' + cls + '" aria-hidden="true" data-w="' + w + '" style="--i:' + i + delay + ';' + sweepStyle + '">' + inner + '</span>';
  }).join(' ');
  h.querySelectorAll('.house').forEach(function (el) { el.classList.add('settled'); });
  // replay the word flight every 12 seconds
  setInterval(function () {
    h.querySelectorAll('.bird').forEach(function (el) {
      el.style.animation = 'none';
      void el.offsetWidth;
      el.style.animation = '';
    });
    h.querySelectorAll('.win, .door, .house').forEach(function (el) {
      el.style.animation = 'none';
      void el.offsetWidth;
      el.style.animation = '';
    });
    // restart the light sweeps and the house wall shake with the cycle
    h.querySelectorAll('.bird').forEach(function (el) { el.classList.remove('sweep'); });
    h.querySelectorAll('.house').forEach(function (el) { el.classList.remove('settled'); });
    void h.offsetWidth;
    h.querySelectorAll('.bird').forEach(function (el) { el.classList.add('sweep'); });
    h.querySelectorAll('.house').forEach(function (el) { el.classList.add('settled'); });
  }, 12000);
})();

// hero eyebrow: keep the small line at the top, with a shine sweep
(function () {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.querySelectorAll('.eyebrow').forEach(function (eyebrow) { eyebrow.classList.add('shine'); });
})();

// "Istražite" content rises in gently the first time it reaches the screen
(function () {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var el = document.querySelector('#istrazite .wrap');
  if (!el || !('IntersectionObserver' in window)) return;
  el.classList.add('reveal');
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { el.classList.add('in'); io.disconnect(); }
    });
  }, { threshold: 0.25 });
  io.observe(el);
})();

// about page: the Instagram line rises letter by letter like bubbles, once, when it comes into view
(function () {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!('IntersectionObserver' in window)) return;
  var ps = document.querySelectorAll('p');
  var p = null;
  for (var i = 0; i < ps.length; i++) {
    if (ps[i].textContent.indexOf('Pratite nas na Instagramu') === 0) { p = ps[i]; break; }
  }
  if (!p) return;
  var text = p.textContent;
  p.innerHTML = '<span class="sr-only">' + text + '</span><span aria-hidden="true">' + text.split('').map(function (ch, n) {
    if (ch === ' ') return (n === text.indexOf('radove') - 1) ? '<br>' : ' ';
    return '<span class="bub" style="--d:' + (n * 0.03).toFixed(2) + 's">' + ch + '</span>';
  }).join('') + '</span>';
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { p.classList.add('bubbled'); io.disconnect(); }
    });
  }, { threshold: 0.6 });
  io.observe(p);
})();

// hero lead: types out once after the hero has risen in; the height is held so the buttons below do not jump
(function () {
  var p = document.querySelector('.hero .lead');
  if (!p || (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) return;
  var seen = false;
  try { seen = localStorage.getItem('duotim-typed') === '1'; localStorage.setItem('duotim-typed', '1'); } catch (e) {}
  if (seen) return;
  var full = p.textContent;
  p.style.minHeight = p.offsetHeight + 'px';
  setTimeout(function () {
    p.textContent = '';
    p.classList.add('typing');
    var i = 0;
    var t = setInterval(function () {
      i++;
      p.textContent = full.slice(0, i);
      if (i >= full.length) { clearInterval(t); p.classList.remove('typing'); p.classList.add('typed'); }
    }, 12);
  }, 1000);
})();

// subpage leads and the first line of O nama: type once, when they come into view
(function () {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!('IntersectionObserver' in window)) return;
  var els = document.querySelectorAll('.page-head .lead, .about > div:first-child > p:first-child');
  for (var j = 0; j < els.length; j++) {
    (function (p) {
      var full = p.textContent;
      p.style.minHeight = p.offsetHeight + 'px';
      p.textContent = '';
      p.classList.add('typable');
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          io.disconnect();
          p.classList.add('typing');
          var i = 0;
          var t = setInterval(function () {
            i++;
            p.textContent = full.slice(0, i);
            if (i >= full.length) { clearInterval(t); p.classList.remove('typing'); p.classList.add('typed'); }
          }, 12);
        });
      }, { threshold: 0.6 });
      io.observe(p);
    })(els[j]);
  }
})();

/* hero window slideshow: gallery photos cross-fade behind the window frame */
(function () {
  var box = document.getElementById('winSlides');
  if (!box) return;
  var imgs = box.querySelectorAll('img');
  if (imgs.length < 2) return;
  var i = 0;
  function load(img) { if (img.dataset.src) { img.src = img.dataset.src; img.removeAttribute('data-src'); } }
  window.addEventListener('load', function () {
    load(imgs[1]);
    setInterval(function () {
      if (document.hidden) return;
      var next = (i + 1) % imgs.length;
      if (!imgs[next].complete || !imgs[next].naturalWidth) { load(imgs[next]); return; }
      imgs[i].classList.remove('on');
      imgs[next].classList.add('on');
      i = next;
      load(imgs[(i + 1) % imgs.length]);
    }, 3500);
  });
})();

/* radovi slideshow under "Pogledajte radove": one zoomed photo in the door shape, the rest as faint thumbs beside it; a click stops it */
(function () {
  var box = document.getElementById('radSlides');
  if (!box) return;
  var imgs = [].slice.call(box.querySelectorAll('img'));
  if (imgs.length < 2) return;
  var wrap = box.closest('.radovi-show'), thumbs = [];
  var i = 0, timer = null, stopped = false;
  function load(img) { if (img.dataset.src) { img.src = img.dataset.src; img.removeAttribute('data-src'); } }
  function mark() { thumbs.forEach(function (b, n) { b.classList.toggle('cur', n === i); }); }
  function show(n) { imgs[i].classList.remove('on'); imgs[n].classList.add('on'); i = n; mark(); load(imgs[(i + 1) % imgs.length]); }
  function tick() {
    if (document.hidden) return;
    var next = (i + 1) % imgs.length;
    if (!imgs[next].complete || !imgs[next].naturalWidth) { load(imgs[next]); return; }
    show(next);
  }
  function stop() { stopped = true; if (timer) { clearInterval(timer); timer = null; } }
  if (wrap) {
    var half = Math.ceil(imgs.length / 2), L = document.createElement('div'), R = document.createElement('div');
    L.className = R.className = 'rad-side';
    imgs.forEach(function (img, n) {
      var b = document.createElement('button'), t = new Image();
      b.type = 'button'; b.className = 'rad-thumb'; b.setAttribute('aria-label', 'Prikaži rad ' + (n + 1));
      t.loading = 'lazy'; t.alt = ''; t.src = img.getAttribute('src') || img.dataset.src;
      b.appendChild(t);
      b.addEventListener('click', function () { stop(); load(img); if (n !== i) show(n); });
      (n < half ? L : R).appendChild(b); thumbs.push(b);
    });
    wrap.insertBefore(L, wrap.firstChild); wrap.appendChild(R); mark();
  }
  box.addEventListener('click', stop);
  window.addEventListener('load', function () {
    load(imgs[1]);
    if (!stopped) timer = setInterval(tick, 4000);
  });
})();

/* početna, "Usluge i radovi": klik na kategoriju pušta slideshow te kategorije; klik na sliku ga zaustavlja */
(function () {
  var box = document.getElementById('urSlides');
  if (!box) return;
  var cats = [].slice.call(document.querySelectorAll('.ur-cat')), note = document.getElementById('urNote'), more = document.getElementById('urMore');
  var imgs = [], i = 0, timer = null;
  function stop() { if (timer) { clearInterval(timer); timer = null; } }
  function tick() {
    if (document.hidden || imgs.length < 2) return;
    var next = (i + 1) % imgs.length;
    if (!imgs[next].complete || !imgs[next].naturalWidth) return;
    imgs[i].classList.remove('on'); imgs[next].classList.add('on'); i = next;
  }
  function open(btn) {
    stop(); box.innerHTML = ''; i = 0;
    imgs = btn.dataset.imgs.split(',').map(function (src, n) {
      var im = new Image(); im.alt = ''; im.src = src;
      if (/\.svg$/.test(src)) im.className = 'kat';
      if (n === 0) im.classList.add('on');
      box.appendChild(im); return im;
    });
    cats.forEach(function (b) { var a = b === btn; b.classList.toggle('cur', a); b.setAttribute('aria-pressed', a ? 'true' : 'false'); });
    note.textContent = btn.textContent.replace('→', '').trim() + ' · ' + btn.dataset.note;
    more.href = btn.dataset.href;
    more.textContent = /katalog/.test(btn.dataset.href) ? 'Pogledajte katalog' : 'Pogledajte radove';
    timer = setInterval(tick, 3500);
  }
  cats.forEach(function (b) { b.addEventListener('click', function () { open(b); }); });
  box.addEventListener('click', stop);
  var first = cats[1] || cats[0];
  if (first) window.addEventListener('load', function () { open(first); });
})();

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
