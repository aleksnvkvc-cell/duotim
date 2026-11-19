(function () {
  var root = document.documentElement;
  var zone = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Belgrade', year: 'numeric', month: '2-digit',
    day: '2-digit', hour: '2-digit', hourCycle: 'h23'
  });
  var storageKey = 'duotim-theme-override';
  var override;
  try { override = JSON.parse(localStorage.getItem(storageKey)); } catch (error) {}
  var button;

  function period(now) {
    var parts = {};
    zone.formatToParts(now).forEach(function (part) { parts[part.type] = part.value; });
    var hour = Number(parts.hour);
    var dark = hour < 7 || hour >= 19;
    var day = Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day) - (hour < 7 ? 1 : 0));
    return { theme: dark ? 'dark' : 'light', key: day + ':' + (dark ? 'night' : 'day') };
  }

  function apply() {
    var scheduled = period(new Date());
    var choice = override && override.key === scheduled.key &&
      (override.theme === 'dark' || override.theme === 'light') ? override.theme : scheduled.theme;
    root.setAttribute('data-theme', choice);
    if (button) button.setAttribute('aria-pressed', String(choice === 'dark'));
  }

  apply();
  document.addEventListener('DOMContentLoaded', function () {
    button = document.getElementById('themeToggle');
    apply();
    if (button) button.addEventListener('click', function () {
      override = { theme: root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark', key: period(new Date()).key };
      try { localStorage.setItem(storageKey, JSON.stringify(override)); } catch (error) {}
      apply();
    });
    window.setInterval(apply, 15000);
    document.addEventListener('visibilitychange', function () { if (!document.hidden) apply(); });
  });
})();
