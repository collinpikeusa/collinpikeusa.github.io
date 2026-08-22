/* ============================================================
   WE4RR — QRZ biography generator
   Builds a self-contained, inline-styled HTML block suitable for
   pasting into the QRZ.com bio editor.

   QRZ constraints this template respects:
     • no <script>, no <style> blocks, no external CSS or fonts
     • every rule is an inline style="" attribute
     • tables (not flex/grid) carry the column layouts
     • all colours are explicit, so it renders identically on
       QRZ's light theme and its dark theme
   ============================================================ */
(function () {
  'use strict';

  var CALLSIGN = 'WE4RR';

  /* Baked-in fallbacks — used if the POTA API cannot be reached. */
  var DATA = {
    activations: 207,
    parks:       114,
    qsos:        5147,
    awards:      32,
    endorsements: 108,
    hunterParks: 701,
    hunterQsos:  1175,
    recent:      []
  };

  var n = function (v) { return Number(v || 0).toLocaleString('en-US'); };
  var esc = function (s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  };

  function fmtDate(iso) {
    if (!iso) return '';
    var p = String(iso).slice(0, 10).split('-');
    if (p.length !== 3) return esc(iso);
    var m = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return (m[parseInt(p[1], 10) - 1] || p[1]) + ' ' + parseInt(p[2], 10) + ', ' + p[0];
  }

  /* ---------- Small builders ---------- */

  function statCell(value, label, colour) {
    return '<td width="25%" align="center" valign="top" style="padding:16px 8px;">' +
      '<div style="font-family:Consolas,\'Courier New\',monospace;font-size:30px;font-weight:bold;line-height:1;color:' + colour + ';">' + value + '</div>' +
      '<div style="font-family:Arial,Helvetica,sans-serif;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#7f8ea8;padding-top:8px;">' + label + '</div>' +
      '</td>';
  }

  function heading(text) {
    return '<div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:bold;letter-spacing:3px;' +
      'text-transform:uppercase;color:#3ce0cf;padding:0 0 12px 0;">' + text + '</div>';
  }

  function specRow(k, v, last) {
    var border = last ? 'none' : '1px solid #1c2540';
    return '<tr>' +
      '<td style="padding:9px 0;border-bottom:' + border + ';font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#7f8ea8;white-space:nowrap;">' + k + '</td>' +
      '<td align="right" style="padding:9px 0;border-bottom:' + border + ';font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#e8eefb;font-weight:bold;">' + v + '</td>' +
      '</tr>';
  }

  function pill(text) {
    return '<span style="display:inline-block;font-family:Consolas,\'Courier New\',monospace;font-size:11px;' +
      'color:#c2cee4;background:#141c2e;border:1px solid #24304d;border-radius:5px;padding:5px 10px;margin:0 5px 6px 0;">' +
      text + '</span>';
  }

  function paragraph(html) {
    return '<p style="font-family:Georgia,\'Times New Roman\',serif;font-size:14.5px;line-height:1.75;color:#c2cee4;margin:0 0 14px 0;">' + html + '</p>';
  }

  /* ---------- The template ---------- */

  function build(d) {
    var recentRows = '';
    (d.recent || []).slice(0, 6).forEach(function (a, i, arr) {
      var last = (i === arr.length - 1);
      var border = last ? 'none' : '1px solid #1c2540';
      recentRows +=
        '<tr>' +
        '<td style="padding:9px 10px 9px 0;border-bottom:' + border + ';font-family:Consolas,\'Courier New\',monospace;font-size:12px;color:#7f8ea8;white-space:nowrap;">' + fmtDate(a.date) + '</td>' +
        '<td style="padding:9px 10px;border-bottom:' + border + ';font-family:Consolas,\'Courier New\',monospace;font-size:12px;color:#3ce0cf;white-space:nowrap;">' + esc(a.reference) + '</td>' +
        '<td style="padding:9px 10px;border-bottom:' + border + ';font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#e8eefb;">' + esc(a.park) + '</td>' +
        '<td align="right" style="padding:9px 0 9px 10px;border-bottom:' + border + ';font-family:Consolas,\'Courier New\',monospace;font-size:13px;color:#ffb648;font-weight:bold;">' + esc(a.total) + '</td>' +
        '</tr>';
    });

    var recentBlock = recentRows
      ? '<div style="height:34px;"></div>' +
        heading('Recent activations') +
        '<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">' +
        recentRows + '</table>'
      : '';

    return '' +
'<div style="max-width:960px;margin:0 auto;background:#0b101a;border:1px solid #1c2540;border-radius:14px;overflow:hidden;">' +

  /* ---- Header ---- */
  '<div style="background:#0f1523;border-bottom:1px solid #1c2540;padding:34px 34px 30px 34px;">' +
    '<div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#3ce0cf;padding-bottom:14px;">' +
      'Augusta, Georgia &middot; USA' +
    '</div>' +
    '<div style="font-family:Consolas,\'Courier New\',monospace;font-size:62px;font-weight:bold;letter-spacing:-2px;line-height:1;color:#ffb648;">' +
      CALLSIGN +
    '</div>' +
    '<div style="font-family:Arial,Helvetica,sans-serif;font-size:20px;color:#e8eefb;padding-top:12px;">Collin Pike</div>' +
    '<div style="font-family:Consolas,\'Courier New\',monospace;font-size:12px;color:#7f8ea8;padding-top:6px;letter-spacing:1px;">' +
      'ex-KJ4AXB &nbsp;/&nbsp; KJ4AXB&#47;VP9 &nbsp;&middot;&nbsp; EM83vk &nbsp;&middot;&nbsp; Amateur Extra' +
    '</div>' +
  '</div>' +

  /* ---- Stats ---- */
  '<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background:#0d131f;border-bottom:1px solid #1c2540;">' +
    '<tr>' +
      statCell(n(d.activations), 'Activations', '#ffb648') +
      statCell(n(d.parks),       'Parks',       '#ffb648') +
      statCell(n(d.qsos),        'POTA QSOs',   '#ffb648') +
      statCell(n(d.awards),      'Awards',      '#ffb648') +
    '</tr>' +
  '</table>' +

  /* ---- Body ---- */
  '<div style="padding:34px;">' +

    heading('About the station') +
    paragraph('Thanks for the contact &mdash; and thanks for stopping by. I am a <b style="color:#e8eefb;">digital-first, ' +
      'portable operator</b>. Almost everything I work happens from a picnic table: a Yaesu FT-897D, a magnetic loop on a ' +
      'tripod, a lithium power station, and a laptop running FT8.') +
    paragraph('In 2022 alone I logged upwards of <b style="color:#e8eefb;">six thousand FT8 contacts</b> on that setup, ' +
      'and passed ten thousand contacts inside a single year &mdash; no tower, no beam, no radials. It is a persuasive ' +
      'argument for what a small antenna and good weak-signal software can do together.') +
    paragraph('I started activating in the Mid-Atlantic &mdash; Maryland, DC, Delaware, West Virginia &mdash; and have ' +
      'since moved south to Augusta, Georgia, where <b style="color:#e8eefb;">Mistletoe State Park (US-2191)</b> has become ' +
      'my home park. I have also been lucky enough to operate as KJ4AXB&#47;VP9 from Bermuda.') +

    '<div style="height:34px;"></div>' +

    /* Station + POTA, side by side */
    '<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">' +
      '<tr>' +
        '<td width="52%" valign="top" style="padding-right:22px;">' +
          heading('Station') +
          '<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">' +
            specRow('Transceiver', 'Yaesu FT-897D') +
            specRow('Antenna',     'Alpha Antenna MagLoop') +
            specRow('Power',       'Jackery Explorer 300') +
            specRow('Interface',   'SignaLink USB &#47; DigiRig') +
            specRow('Computer',    'Lenovo ThinkPad T440p') +
            specRow('Case',        'Apache 4800') +
            specRow('QTH',         'Augusta, GA') +
            specRow('ITU &#47; CQ', '8 &#47; 5', true) +
          '</table>' +
        '</td>' +
        '<td width="48%" valign="top" style="padding-left:22px;border-left:1px solid #1c2540;">' +
          heading('Operating') +
          '<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">' +
            specRow('Class',        'Amateur Extra') +
            specRow('Grid',         'EM83vk') +
            specRow('Modes',        'FT8, digital, some SSB') +
            specRow('Bands',        '10 &ndash; 40 m') +
            specRow('Software',     'WSJT-Z, HRD') +
            specRow('POTA hunter',  n(d.hunterParks) + ' parks') +
            specRow('Endorsements', n(d.endorsements)) +
            specRow('Top tier',     'Sapphire', true) +
          '</table>' +
        '</td>' +
      '</tr>' +
    '</table>' +

    recentBlock +

    '<div style="height:34px;"></div>' +

    heading('Awards') +
    '<div style="padding-bottom:6px;">' +
      pill('Sapphire Activator') + pill('Sapphire Hunter') + pill('Diamond Activator') +
      pill('Diamond Hunter') + pill('Platinum') + pill('Gold') + pill('Silver') + pill('Bronze') +
      pill('World Continents') + pill('USA Award') + pill('DX World') + pill('Grid Squared') +
      pill('MRC &mdash; North America') + pill('MRC &mdash; Europe') +
    '</div>' +

    '<div style="height:34px;"></div>' +

    heading('QSL') +
    '<div style="background:#0f1523;border-left:3px solid #ffb648;border-radius:0 8px 8px 0;padding:18px 22px;">' +
      '<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.7;color:#c2cee4;">' +
        '<b style="color:#ffb648;">LoTW</b> &mdash; preferred, and uploaded after every session.<br>' +
        '<b style="color:#ffb648;">Direct</b> &mdash; always answered; an SASE is appreciated.<br>' +
        '<b style="color:#ffb648;">Bureau</b> &mdash; answered in batches.' +
      '</div>' +
    '</div>' +

    '<div style="height:26px;"></div>' +
    '<div style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#7f8ea8;line-height:1.7;">' +
      'If we worked a park together and something looks wrong in the log, please get in touch &mdash; ' +
      'I would much rather fix it than leave you chasing a confirmation.' +
    '</div>' +

  '</div>' +

  /* ---- Footer ---- */
  '<div style="background:#0f1523;border-top:1px solid #1c2540;padding:18px 34px;">' +
    '<span style="font-family:Consolas,\'Courier New\',monospace;font-size:13px;letter-spacing:2px;color:#ffb648;font-weight:bold;">' + CALLSIGN + '</span>' +
    '<span style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#7f8ea8;"> &nbsp;&middot;&nbsp; 73, and see you in the parks.</span>' +
  '</div>' +

'</div>';
  }

  /* ---------- Page wiring ---------- */
  var preview = document.getElementById('qrzPreview');
  var source  = document.getElementById('qrzSource');
  var copyBtn = document.getElementById('copyBtn');
  var status  = document.getElementById('qrzStatus');
  var sizeEl  = document.getElementById('qrzSize');

  function render() {
    var html = build(DATA);
    if (preview) preview.innerHTML = html;
    if (source)  source.value = html;
    if (sizeEl)  sizeEl.textContent = (html.length / 1024).toFixed(1) + ' KB';
  }

  render();

  /* Refresh the numbers from POTA so the generated bio is current. */
  if (window.fetch) {
    fetch('https://api.pota.app/profile/' + CALLSIGN, { cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (d) {
        var s = d.stats || {}, a = s.activator || {}, h = s.hunter || {};
        DATA.activations  = a.activations  != null ? a.activations  : DATA.activations;
        DATA.parks        = a.parks        != null ? a.parks        : DATA.parks;
        DATA.qsos         = a.qsos         != null ? a.qsos         : DATA.qsos;
        DATA.awards       = s.awards       != null ? s.awards       : DATA.awards;
        DATA.endorsements = s.endorsements != null ? s.endorsements : DATA.endorsements;
        DATA.hunterParks  = h.parks        != null ? h.parks        : DATA.hunterParks;
        DATA.hunterQsos   = h.qsos         != null ? h.qsos         : DATA.hunterQsos;
        DATA.recent       = (d.recent_activity || {}).activations || [];
        render();
        if (status) {
          status.setAttribute('data-state', 'ok');
          status.textContent = 'Numbers refreshed live from pota.app';
        }
      })
      .catch(function () {
        if (status) {
          status.setAttribute('data-state', 'err');
          status.textContent = 'Could not reach pota.app — generated with last-known totals';
        }
      });
  }

  if (copyBtn && source) {
    copyBtn.addEventListener('click', function () {
      var done = function (ok) {
        copyBtn.textContent = ok ? '✓ Copied to clipboard' : 'Press Ctrl+C to copy';
        setTimeout(function () { copyBtn.textContent = 'Copy HTML'; }, 2600);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(source.value).then(function () { done(true); }, function () {
          source.select(); done(false);
        });
      } else {
        source.select();
        try { done(document.execCommand('copy')); } catch (e) { done(false); }
      }
    });
  }
})();
