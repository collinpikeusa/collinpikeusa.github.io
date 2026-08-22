/* ============================================================
   WE4RR — site behaviour
   - theme toggle           - animated hero waveform
   - mobile nav             - scroll reveal + count-up
   - live POTA API data     (graceful fallback to baked-in HTML)
   ============================================================ */
(function () {
  'use strict';

  var CALLSIGN   = 'WE4RR';
  var POTA_API   = 'https://api.pota.app/profile/' + CALLSIGN;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Theme ---------- */
  var themeBtn = document.getElementById('themeBtn');
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem('we4rr-theme', next); } catch (e) {}
    });
  }

  /* ---------- Mobile nav ---------- */
  var navToggle = document.getElementById('navToggle');
  var navLinks  = document.getElementById('navlinks');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      var open = navLinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(open));
    });
    navLinks.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- Hero waveform ----------
     Two summed sine waves drawn as an SVG path, drifting slowly. */
  var waveA = document.getElementById('waveA');
  var waveB = document.getElementById('waveB');

  function buildWave(phase, amp, freq, yMid) {
    var pts = [], W = 1440, STEP = 12;
    for (var x = 0; x <= W; x += STEP) {
      var t = x / W * Math.PI * 2;
      var y = yMid
            + Math.sin(t * freq + phase) * amp
            + Math.sin(t * freq * 2.7 + phase * 1.6) * (amp * 0.34);
      pts.push((x === 0 ? 'M' : 'L') + x + ' ' + y.toFixed(1));
    }
    return pts.join(' ');
  }

  if (waveA && waveB) {
    var phase = 0;
    function drawWaves() {
      waveA.setAttribute('d', buildWave(phase,        26, 3, 96));
      waveB.setAttribute('d', buildWave(phase * -0.7, 18, 4, 122));
    }
    drawWaves();
    if (!reduceMotion) {
      (function tick() {
        phase += 0.012;
        drawWaves();
        requestAnimationFrame(tick);
      })();
    }
  }

  /* ---------- Scroll reveal ---------- */
  var revealables = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    revealables.forEach(function (el) { io.observe(el); });
  } else {
    revealables.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Count-up ---------- */
  var counters = document.querySelectorAll('[data-count]');

  function animateCount(el, to) {
    var from = 0, dur = 1250, start = null;
    if (reduceMotion) { el.textContent = to.toLocaleString('en-US'); return; }
    function frame(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);                 // easeOutCubic
      el.textContent = Math.round(from + (to - from) * eased).toLocaleString('en-US');
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  var countedOnce = new WeakSet();
  function runCount(el) {
    if (countedOnce.has(el)) return;
    var target = parseInt(el.getAttribute('data-value') || el.textContent.replace(/[^0-9]/g, ''), 10);
    if (isNaN(target)) return;
    countedOnce.add(el);
    animateCount(el, target);
  }

  if ('IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { runCount(en.target); cio.unobserve(en.target); }
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { cio.observe(el); });
  } else {
    counters.forEach(runCount);
  }

  /* ---------- Live POTA data ---------- */
  var liveNote = document.getElementById('liveNote');
  var liveText = document.getElementById('liveText');
  var actBody  = document.getElementById('actBody');
  var awardGrid = document.getElementById('awardGrid');

  function setLive(state, msg) {
    if (!liveNote) return;
    liveNote.setAttribute('data-state', state);
    if (liveText) liveText.textContent = msg;
  }

  function setCounter(key, value) {
    if (typeof value !== 'number' || isNaN(value)) return;
    document.querySelectorAll('[data-key="' + key + '"]').forEach(function (el) {
      el.setAttribute('data-value', String(value));
      if (countedOnce.has(el)) {
        el.textContent = value.toLocaleString('en-US');   // already animated — just correct it
      } else if (isInView(el)) {
        runCount(el);
      }
    });
  }

  function isInView(el) {
    var r = el.getBoundingClientRect();
    return r.top < window.innerHeight && r.bottom > 0;
  }

  var TIERS = ['sapphire', 'diamond', 'platinum', 'gold', 'silver', 'bronze'];
  function tierOf(name) {
    // Tier awards are named "<Tier> Activator" / "<Tier> Hunter", so match only at
    // the start — otherwise "Ouachita Mountain Goldenrod" reads as a Gold award.
    var lower = String(name || '').toLowerCase();
    for (var i = 0; i < TIERS.length; i++) {
      if (lower.indexOf(TIERS[i] + ' ') === 0) return TIERS[i];
    }
    return '';
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function fmtDate(iso) {
    if (!iso) return '';
    var p = String(iso).slice(0, 10).split('-');
    if (p.length !== 3) return esc(iso);
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var mi = parseInt(p[1], 10) - 1;
    return (months[mi] || p[1]) + ' ' + parseInt(p[2], 10) + ', ' + p[0];
  }

  function renderActivations(list) {
    if (!actBody || !Array.isArray(list) || !list.length) return;
    var rows = list.slice(0, 12).map(function (a) {
      var ref = esc(a.reference || '');
      var url = 'https://pota.app/#/park/' + encodeURIComponent(a.reference || '');
      return '<tr>' +
        '<td class="mono">' + fmtDate(a.date) + '</td>' +
        '<td><a class="ref" href="' + url + '" target="_blank" rel="noopener">' + ref + '</a></td>' +
        '<td class="park">' + esc(a.park || '') + '</td>' +
        '<td class="mono">' + esc(a.location || '') + '</td>' +
        '<td class="num">' + (a.total != null ? esc(a.total) : '') + '</td>' +
        '</tr>';
    }).join('');
    actBody.innerHTML = rows;
  }

  function renderAwards(list) {
    if (!awardGrid || !Array.isArray(list) || !list.length) return;
    // Named tiers first (most impressive), then everything else alphabetically.
    var sorted = list.slice().sort(function (a, b) {
      var ta = TIERS.indexOf(tierOf(a.name || '')), tb = TIERS.indexOf(tierOf(b.name || ''));
      if (ta === -1) ta = 99;
      if (tb === -1) tb = 99;
      if (ta !== tb) return ta - tb;
      return String(a.name).localeCompare(String(b.name));
    });

    awardGrid.innerHTML = sorted.map(function (a) {
      var end = Array.isArray(a.endorsements) ? a.endorsements.length : 0;
      var meta = fmtDate(a.granted) + (end ? ' &middot; ' + end + ' endorsement' + (end === 1 ? '' : 's') : '');
      var tier = tierOf(a.name || '');
      return '<div class="award">' +
        '<span class="award__pip"' + (tier ? ' data-tier="' + tier + '"' : '') + ' aria-hidden="true"></span>' +
        '<span class="award__txt">' +
          '<span class="award__name" title="' + esc(a.name) + '">' + esc(a.name) + '</span>' +
          '<span class="award__meta">' + meta + '</span>' +
        '</span></div>';
    }).join('');
  }

  function loadPota() {
    if (!window.fetch) { setLive('err', 'Showing last-known totals'); return; }

    var ctl = null, timer = null;
    if (window.AbortController) {
      ctl = new AbortController();
      timer = setTimeout(function () { ctl.abort(); }, 9000);
    }

    fetch(POTA_API, { signal: ctl ? ctl.signal : undefined, cache: 'no-store' })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (d) {
        if (timer) clearTimeout(timer);
        var s = d.stats || {};
        var act = s.activator || {}, hun = s.hunter || {};

        setCounter('activations',  act.activations);
        setCounter('parks',        act.parks);
        setCounter('qsos',         act.qsos);
        setCounter('awards',       s.awards);
        setCounter('endorsements', s.endorsements);
        setCounter('hunterParks',  hun.parks);
        setCounter('hunterQsos',   hun.qsos);

        renderActivations((d.recent_activity || {}).activations);
        renderAwards(d.awards);

        setLive('ok', 'Live from pota.app · updated ' +
          new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));
      })
      .catch(function () {
        if (timer) clearTimeout(timer);
        setLive('err', 'POTA API unreachable — showing last-known totals');
        if (actBody) {
          actBody.innerHTML =
            '<tr class="loading-row"><td colspan="5">Activation log is temporarily unavailable. ' +
            'See <a href="https://pota.app/#/profile/' + CALLSIGN + '" target="_blank" rel="noopener">pota.app</a>.</td></tr>';
        }
        if (awardGrid) {
          awardGrid.innerHTML =
            '<div class="card" style="grid-column:1/-1;text-align:center;color:var(--text-3);font-size:.9rem">' +
            'Award list is temporarily unavailable. ' +
            'See <a href="https://pota.app/#/profile/' + CALLSIGN + '" target="_blank" rel="noopener">pota.app</a>.</div>';
        }
      });
  }

  loadPota();
})();
