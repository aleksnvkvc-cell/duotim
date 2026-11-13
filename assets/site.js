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
  var ADDR = 'Djure Jakšića 24, 12371 Vlaški Do';
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
  p.setAttribute('aria-label', text);
  p.innerHTML = text.split('').map(function (ch, n) {
    if (ch === ' ') return (n === text.indexOf('radove') - 1) ? '<br>' : ' ';
    return '<span class="bub" aria-hidden="true" style="--d:' + (n * 0.03).toFixed(2) + 's">' + ch + '</span>';
  }).join('');
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
  p.setAttribute('aria-label', full);
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
      p.setAttribute('aria-label', full);
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

// preview only: a pen to mark the page; it does not appear on the public GitHub Pages site
(function () {
  if (/github\.io$/.test(location.hostname)) return;
  var c = document.createElement('canvas');
  c.style.cssText = 'position:fixed;left:0;top:0;width:100vw;height:100vh;z-index:9999;pointer-events:none;touch-action:none';
  document.body.appendChild(c);
  var ctx = c.getContext('2d');
  function size() { c.width = innerWidth; c.height = innerHeight; ctx.strokeStyle = '#e53935'; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; }
  size();
  addEventListener('resize', size);
  var bar = document.createElement('div');
  bar.style.cssText = 'position:fixed;left:10px;bottom:10px;z-index:10000;display:flex;gap:8px';
  bar.innerHTML = '<button type="button" data-a="draw" style="font:600 14px system-ui,sans-serif;padding:8px 12px;border-radius:8px;border:0;background:#e53935;color:#fff">Crtaj: isključeno</button><button type="button" data-a="clear" style="font:600 14px system-ui,sans-serif;padding:8px 12px;border-radius:8px;border:0;background:#333;color:#fff">Obriši</button>';
  document.body.appendChild(bar);
  var on = false, drawing = false, last = null;
  var draw = bar.querySelector('[data-a=draw]');
  draw.addEventListener('click', function () {
    on = !on;
    c.style.pointerEvents = on ? 'auto' : 'none';
    draw.textContent = on ? 'Crtaj: uključeno' : 'Crtaj: isključeno';
  });
  bar.querySelector('[data-a=clear]').addEventListener('click', function () { ctx.clearRect(0, 0, c.width, c.height); });
  function pos(e) { var r = c.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
  c.addEventListener('pointerdown', function (e) { drawing = true; last = pos(e); c.setPointerCapture(e.pointerId); });
  c.addEventListener('pointermove', function (e) {
    if (!drawing) return;
    var p = pos(e);
    ctx.beginPath(); ctx.moveTo(last.x, last.y); ctx.lineTo(p.x, p.y); ctx.stroke();
    last = p;
  });
  c.addEventListener('pointerup', function () { drawing = false; });
  c.addEventListener('pointercancel', function () { drawing = false; });
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
