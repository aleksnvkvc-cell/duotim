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
