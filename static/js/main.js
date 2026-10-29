/* DreamX project page — interactions
   ------------------------------------------------------------------
   Content you are likely to edit lives in the three data lists below:
   A2A_EXAMPLES (any-to-any video transfer), DATASETS (pretraining data),
   and the attention-mask definitions (MASKS).
   ------------------------------------------------------------------ */
(function () {
  'use strict';

  /* ---------------- data ---------------- */
  var A2A_EXAMPLES = {
    scene: [
      { id: 'fig04_ex1', src: ['r', 'Bridge WidowX'], tgt: ['r', 'Bridge WidowX · different kitchen'], fig: 'Fig. 4' },
      { id: 'fig10_ex1', src: ['r', 'Bridge WidowX'], tgt: ['r', 'Bridge WidowX'] },
      { id: 'fig10_ex2', src: ['r', 'Bridge WidowX'], tgt: ['r', 'Bridge WidowX'] }
    ],
    robot: [
      { id: 'fig04_ex2', src: ['r', 'Bimanual YAM'], tgt: ['r', 'AgiBot'], fig: 'Fig. 4' },
      { id: 'fig10_ex3', src: ['r', 'Bimanual YAM'], tgt: ['r', 'Bridge WidowX'] },
      { id: 'fig10_ex4', src: ['r', 'AgiBot'], tgt: ['r', 'Bimanual YAM'] }
    ],
    human: [
      { id: 'fig04_ex3', src: ['h', 'Human (egocentric)'], tgt: ['r', 'Bridge WidowX'], fig: 'Fig. 4' },
      { id: 'fig10_ex5', src: ['h', 'Human (egocentric)'], tgt: ['r', 'Bridge WidowX'] },
      { id: 'fig10_ex6', src: ['h', 'Human (EgoVerse)'], tgt: ['r', 'Bimanual YAM'], wideSrc: true }
    ],
    general: [
      { id: 'fig04_ex4', src: ['h', 'Human hand, open / close'], tgt: ['o', 'Dog in a sunflower field'], fig: 'Fig. 4' }
    ]
  };

  var DATASETS = [
    { id: 'egodex', name: 'EgoDex', type: 'human', hours: 410.1, pct: 18.7, color: '#E0A93B', desc: 'Egocentric dexterous manipulation',
      clips: [['build_lego_ep011689', 'Build freely with Lego bricks'], ['braid_yarn_ep010809', 'Braid yarn into a fishtail braid']] },
    { id: 'egoverse', name: 'EgoVerse', type: 'human', hours: 59.0, pct: 2.7, color: '#F2C77A', desc: 'Egocentric human demonstrations',
      clips: [['prepare_plant_cuttings_ep006182', 'Prepare plant cuttings'], ['change_light_bulb_ep007106', 'Change the light bulb on a lamp']] },
    { id: 'agibot', name: 'AgiBot', type: 'robot', hours: 818.2, pct: 37.4, color: '#8CAB24', desc: 'AgiBot World robot manipulation',
      clips: [['stock_snack_bag_ep143003', 'Hang a bag of chips on the snack rack'], ['apply_ketchup_ep145529', 'Squeeze ketchup onto a meat slice']] },
    { id: 'molmoact_yam', name: 'MolmoAct-BimanualYAM', type: 'robot', hours: 502.3, pct: 23.0, color: '#B5CC6A', desc: 'Bimanual YAM arms',
      clips: [['clean_plates_ep015027', 'Clean dirty plates and stack them'], ['fold_clothes_ep009305', 'Fold clothes']] },
    { id: 'droid', name: 'DROID', type: 'robot', hours: 350.5, pct: 16.0, color: '#6C8FD6', desc: 'Franka arm, diverse real-world scenes',
      clips: [['green_block_in_bowl_ep000018', 'Put the green block in the bowl'], ['pour_bowl_into_cup_ep000045', 'Pour the blue bowl into the green cup']] },
    { id: 'bridge', name: 'Bridge', type: 'robot', hours: 47.9, pct: 2.2, color: '#A9BDF0', desc: 'WidowX arm, toy-kitchen scenes',
      clips: [['red_object_into_pot_ep000002', 'Put the red object into the pot'], ['fold_yellow_cloth_ep000020', 'Fold the cloth']] }
  ];

  /* row attends to column (1) or is masked (0) — paper Fig. 2(b) */
  var MASKS = {
    enc: {
      el: 'mask-enc', ox: 36, oy: 100,
      groups: [['V', 'v', 3], ['Q', 'q', 3]],
      m: [
        [1,1,1, 0,0,0],
        [1,1,1, 0,0,0],
        [1,1,1, 0,0,0],
        [1,0,0, 1,1,1],
        [1,1,0, 1,1,1],
        [1,1,1, 1,1,1]
      ]
    },
    dec: {
      el: 'mask-dec', ox: 334, oy: 100,
      groups: [['V', 'v', 3], ['Q', 'q', 3], ['A', 'a', 3]],
      m: [
        [1,1,1, 1,0,0, 0,0,0],
        [1,1,1, 1,1,0, 0,0,0],
        [1,1,1, 1,1,1, 0,0,0],
        [0,0,0, 1,0,0, 0,0,0],
        [0,0,0, 0,1,0, 0,0,0],
        [0,0,0, 0,0,1, 0,0,0],
        [0,0,0, 1,0,0, 1,1,1],
        [0,0,0, 1,1,0, 1,1,1],
        [0,0,0, 1,1,1, 1,1,1]
      ]
    }
  };

  /* ---------------- helpers ---------------- */
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function play(v) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
  var SVGNS = 'http://www.w3.org/2000/svg';
  function svgEl(tag, attrs) {
    var e = document.createElementNS(SVGNS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }
  var hasIO = 'IntersectionObserver' in window;

  /* ---------------- lazy, synced video groups ----------------
     Any element with class "vgroup" holds <video data-src>. Videos load and
     play only while the group is near the viewport. Groups with class "sync"
     keep all their videos on the first video's clock. */
  function loadGroup(g) {
    $$('video', g).forEach(function (v) {
      if (v.dataset.src && v.getAttribute('src') !== v.dataset.src) { v.src = v.dataset.src; }
      play(v);
    });
  }
  function pauseGroup(g) { $$('video', g).forEach(function (v) { v.pause(); }); }
  function attachSync(g) {
    if (g._synced) return; g._synced = true;
    var vids = $$('video', g), lead = vids[0];
    if (!lead) return;
    lead.addEventListener('timeupdate', function () {
      vids.forEach(function (v) {
        if (v !== lead && !v.seeking && v.readyState > 1 && Math.abs(v.currentTime - lead.currentTime) > 0.15) {
          v.currentTime = lead.currentTime;
        }
      });
    });
  }
  var groupIO = hasIO ? new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      e.target._visible = e.isIntersecting;
      if (e.isIntersecting) loadGroup(e.target); else pauseGroup(e.target);
    });
  }, { rootMargin: '200px 0px' }) : null;
  function watchGroup(g) {
    if (g.classList.contains('sync')) attachSync(g);
    if (groupIO) groupIO.observe(g); else loadGroup(g);
  }

  /* ---------------- auto-upgrading media slots ----------------
     <div class="slot" data-video="path.mp4"> shows its placeholder until the
     file exists; then the video takes over. Nothing to change in HTML. */
  function probeVideo(url, onReady) {
    var v = document.createElement('video');
    v.muted = true; v.loop = true; v.playsInline = true; v.setAttribute('playsinline', '');
    v.preload = 'auto';
    v.addEventListener('loadeddata', function () { onReady(v); }, { once: true });
    v.addEventListener('error', function () {}, { once: true });
    v.src = url;
    return v;
  }
  function upgradeSlot(slot) {
    if (slot._probed) return; slot._probed = true;
    probeVideo(slot.dataset.video, function (v) {
      if (slot.hasAttribute('data-controls')) { v.controls = true; v.style.objectFit = 'contain'; }
      slot.appendChild(v);
      slot.classList.add('live');
      play(v);
    });
  }
  var slotIO = hasIO ? new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (e.isIntersecting) upgradeSlot(e.target);
      var v = $('video', e.target);
      if (v && !v.controls) { if (e.isIntersecting) play(v); else v.pause(); }
    });
  }, { rootMargin: '300px 0px' }) : null;
  function watchSlot(s) { if (slotIO) slotIO.observe(s); else upgradeSlot(s); }

  /* ---------------- teaser: overlay videos on SVG photo slots ---------------- */
  $$('.tpanel').forEach(function (panel) {
    var svg = $(':scope > svg', panel);
    if (!svg) return;
    var vb = svg.viewBox.baseVal;
    $$('svg.tslot[data-video]', svg).forEach(function (s) {
      var x = s.x.baseVal.value, y = s.y.baseVal.value, w = s.width.baseVal.value, h = s.height.baseVal.value;
      probeVideo(s.getAttribute('data-video'), function (v) {
        var off = parseFloat(s.getAttribute('data-offset') || '0');
        if (off > 0 && isFinite(v.duration)) v.currentTime = off * v.duration;
        var ov = document.createElement('div');
        ov.className = 'ov';
        ov.style.left = ((x - vb.x) / vb.width * 100) + '%';
        ov.style.top = ((y - vb.y) / vb.height * 100) + '%';
        ov.style.width = (w / vb.width * 100) + '%';
        ov.style.height = (h / vb.height * 100) + '%';
        ov.appendChild(v);
        panel.appendChild(ov);
        s.style.visibility = 'hidden';
        play(v);
      });
    });
  });

  /* ---------------- any-to-any video transfer ---------------- */
  var FLOW = '<div class="flow" aria-hidden="true"><div class="q">Q</div><svg viewBox="0 0 44 14"><path d="M3 7 H35"/><path class="head" d="M30 2 L37 7 L30 12"/></svg><span>latent action</span></div>';
  function chip(c) { return '<span class="chip ' + c[0] + '">' + c[1] + '</span>'; }
  function tile(src, poster, kind, ours) {
    return '<div class="tile' + (ours ? ' ours' : '') + '"><video data-src="' + src + '" poster="' + poster + '" muted loop playsinline preload="none"></video>' +
      '<div class="tag"><span class="kind' + (ours ? ' ours' : '') + '">' + kind + '</span></div></div>';
  }
  function a2aBlock(ex, feature) {
    var base = 'static/videos/any2any/' + ex.id, pb = 'static/posters/' + ex.id;
    return '<div class="xblock' + (feature ? ' feature' : '') + '">' +
      '<div class="xmeta">' + chip(ex.src) + '<span class="arrow">→</span>' + chip(ex.tgt) + (ex.fig ? '<span class="fig">' + ex.fig + '</span>' : '') + '</div>' +
      '<div class="xpair vgroup sync' + (ex.wideSrc ? ' wide-src' : '') + '">' +
        tile(base + '_source.mp4', pb + '_source.jpg', 'Source', false) + FLOW +
        tile(base + '_target.mp4', pb + '_target.jpg', 'Transferred', true) +
      '</div></div>';
  }
  $$('[data-a2a]').forEach(function (panel) {
    var list = A2A_EXAMPLES[panel.dataset.a2a] || [];
    var html = list.length ? a2aBlock(list[0], true) : '';
    if (list.length > 1) html += '<div class="xgrid">' + list.slice(1).map(function (ex) { return a2aBlock(ex, false); }).join('') + '</div>';
    panel.innerHTML = html;
  });

  /* tabs */
  var tabs = $$('#video-transfer [role=tab][aria-controls]');
  tabs.forEach(function (t) {
    t.addEventListener('click', function () {
      tabs.forEach(function (o) {
        var on = o === t, p = document.getElementById(o.getAttribute('aria-controls'));
        o.setAttribute('aria-selected', on ? 'true' : 'false');
        p.hidden = !on;
        if (!on) $$('video', p).forEach(function (v) { v.pause(); });
      });
    });
  });

  function select(group, btn) {
    $$('.pill', group).forEach(function (b) { b.setAttribute('aria-selected', b === btn ? 'true' : 'false'); });
  }

  /* ---------------- HumanAndRobot comparison ---------------- */
  var hrGroup = $('#hr-group'), hrPills = $('#hr-pills');
  function setHR(task) {
    $$('video', hrGroup).forEach(function (v) {
      var name = task + '_' + v.dataset.k;
      v.dataset.src = 'static/videos/hr_benchmark/' + name + '.mp4';
      v.poster = 'static/posters/' + name + '.jpg';
    });
    if (hrGroup._visible) loadGroup(hrGroup);
  }
  setHR($('.pill[aria-selected=true]', hrPills).dataset.task);
  hrPills.addEventListener('click', function (e) {
    var b = e.target.closest('.pill'); if (!b) return;
    select(hrPills, b); setHR(b.dataset.task);
  });

  /* ---------------- action transfer ---------------- */
  var actGroup = $('#act-group'), actPills = $('#act-pills');
  var human = $('#act-human'), robot = $('#act-robot');
  function setAct(id) {
    human.dataset.src = 'static/videos/action_transfer/' + id + '_human.mp4';
    robot.dataset.src = 'static/videos/action_transfer/' + id + '_robot.mp4';
    human.poster = 'static/posters/' + id + '_human.jpg';
    robot.poster = 'static/posters/' + id + '_robot.jpg';
    if (actGroup._visible) loadGroup(actGroup);
  }
  setAct($('.pill[aria-selected=true]', actPills).dataset.id);
  actPills.addEventListener('click', function (e) {
    var b = e.target.closest('.pill'); if (!b) return;
    select(actPills, b); setAct(b.dataset.id);
  });
  $('#act-replay').addEventListener('click', function () {
    loadGroup(actGroup);
    [human, robot].forEach(function (v) { v.currentTime = 0; play(v); });
  });

  /* ---------------- attention maps: one clip at a time + progress gauge ---------------- */
  var attGroup = $('#att-group'), attPills = $('#att-pills'), attVid = $('#att-video'), attFill = $('#att-gauge-fill');
  function setAtt(b) {
    var id = b.dataset.id;
    attVid.width = +b.dataset.w; attVid.height = +b.dataset.h;   // clips keep their source aspect ratio
    attVid.dataset.src = 'static/videos/attention/' + id + '.mp4';
    attVid.poster = 'static/posters/att_' + id + '.jpg';
    attFill.style.width = '0%';
    if (attGroup._visible) loadGroup(attGroup);
  }
  setAtt($('.pill[aria-selected=true]', attPills));
  attPills.addEventListener('click', function (e) {
    var b = e.target.closest('.pill'); if (!b) return;
    select(attPills, b); setAtt(b);
  });
  (function () {
    var raf = 0;
    function paint() {
      var d = attVid.duration;
      attFill.style.width = (d ? Math.min(100, attVid.currentTime / d * 100) : 0) + '%';
      raf = attVid.paused ? 0 : requestAnimationFrame(paint);
    }
    attVid.addEventListener('play', function () { if (!raf) raf = requestAnimationFrame(paint); });
    attVid.addEventListener('seeked', paint);
  })();

  /* ---------------- datasets: donut + cards ---------------- */
  function setupClips(el, d) {
    var v = $('video', el), task = $('.ds-task', el), dots = $$('.ds-dots button', el), cur = 0, visible = false;
    function show(i, autoplay) {
      cur = i;
      var c = d.clips[i];
      v.src = 'static/videos/datasets/' + d.id + '/' + c[0] + '.mp4';
      v.poster = 'static/posters/ds_' + c[0] + '.jpg';
      task.textContent = c[1];
      dots.forEach(function (b, k) { b.classList.toggle('on', k === i); });
      if (autoplay) play(v);
    }
    v.addEventListener('ended', function () { show((cur + 1) % d.clips.length, visible); });
    dots.forEach(function (b, k) { b.addEventListener('click', function () { show(k, true); }); });
    var start = function () { visible = true; if (!v.getAttribute('src')) show(0, true); else play(v); };
    if (hasIO) {
      new IntersectionObserver(function (es) {
        if (es[0].isIntersecting) start(); else { visible = false; v.pause(); }
      }, { rootMargin: '200px 0px' }).observe(el);
    } else start();
  }
  (function () {
    var segs = $('#donut-segs'), legend = $('#legend');
    var R = 110, C = 2 * Math.PI * R, acc = 0, GAP = 2.5;
    var order = ['agibot', 'molmoact_yam', 'droid', 'bridge', 'egoverse', 'egodex'];
    var byId = {}; DATASETS.forEach(function (d) { byId[d.id] = d; });
    var arcs = [];
    order.forEach(function (id) {
      var d = byId[id], len = Math.max(1, d.pct / 100 * C - GAP);
      var c = svgEl('circle', { cx: 150, cy: 150, r: R, 'class': 'seg', stroke: d.color, 'stroke-dashoffset': -acc, 'data-id': id });
      c.style.strokeDasharray = '0 ' + C;
      c.style.transition = 'stroke-dasharray 1.1s cubic-bezier(.2,.7,.2,1) ' + (arcs.length * 0.08) + 's, stroke-width .2s';
      var t = svgEl('title', {}); t.textContent = d.name + ' — ' + d.hours + ' h (' + d.pct + '%)'; c.appendChild(t);
      segs.appendChild(c); arcs.push([c, len]); acc += d.pct / 100 * C;
    });
    function grow() {
      arcs.forEach(function (a) { a[0].style.strokeDasharray = a[1] + ' ' + C; });
      /* settle to the final state even if the browser throttled the transition */
      setTimeout(function () { arcs.forEach(function (a) { a[0].style.transition = 'stroke-width .2s'; a[0].style.strokeDasharray = a[1] + ' ' + C; }); }, 2200);
    }
    if (hasIO) {
      var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { grow(); io.disconnect(); } }, { threshold: .3 });
      io.observe($('#donut'));
    } else grow();

    DATASETS.slice().sort(function (a, b) { return b.hours - a.hours; }).forEach(function (d) {
      var li = document.createElement('li'); li.dataset.id = d.id;
      li.innerHTML = '<span class="sw" style="background:' + d.color + '"></span><span>' + d.name + '</span><span class="hrs">' + d.hours.toFixed(1) + ' h · ' + d.pct.toFixed(1) + '%</span>';
      legend.appendChild(li);
    });

    /* each card plays its dataset's sample clips one after another (static/videos/datasets/<id>/<clip>.mp4) */
    DATASETS.forEach(function (d) {
      var el = document.createElement('div'); el.className = 'ds'; el.dataset.id = d.id;
      var dots = d.clips.map(function (c, i) { return '<button type="button" aria-label="Clip ' + (i + 1) + ': ' + c[1] + '"' + (i ? '' : ' class="on"') + '></button>'; }).join('');
      el.innerHTML =
        '<div class="ds-media">' +
          '<video muted playsinline preload="none" poster="static/posters/ds_' + d.clips[0][0] + '.jpg"></video>' +
          '<div class="ds-task">' + d.clips[0][1] + '</div>' +
          '<div class="ds-dots">' + dots + '</div>' +
        '</div>' +
        '<div class="ds-meta"><span class="ds-name">' + d.name + '</span><span class="chip ' + (d.type === 'human' ? 'h">Human' : 'g">Robot') + '</span>' +
        '<span class="ds-hrs">' + d.hours.toFixed(1) + ' h · ' + d.pct.toFixed(1) + '%</span></div>' +
        '<div class="ds-desc">' + d.desc + '</div>';
      $('#ds-cards').appendChild(el);
      setupClips(el, d);
    });
    /* humans first, then robots, each by hours */
    DATASETS.slice().sort(function (a, b) { return (a.type === b.type) ? b.hours - a.hours : (a.type === 'human' ? -1 : 1); }).forEach(function (d) {
      var card = $('.ds[data-id="' + d.id + '"]'); card.parentNode.appendChild(card);
    });

    function hl(id, on) {
      $$('[data-id="' + id + '"]').forEach(function (e) { e.classList.toggle('hl', on); });
    }
    $$('.seg, .legend li, .ds').forEach(function (e) {
      e.addEventListener('mouseenter', function () { hl(e.dataset.id || e.getAttribute('data-id'), true); });
      e.addEventListener('mouseleave', function () { hl(e.dataset.id || e.getAttribute('data-id'), false); });
    });
  })();

  /* ---------------- attention masks (paper Fig. 2b) ----------------
     Animates one modality group at a time: encoder V, encoder Q,
     decoder V, decoder Q, decoder A. Hover a group to pin it. */
  (function () {
    var PITCH = 42, CELL = 38;
    var GCOL = { v: '#8BA33A', q: '#C99A1E', a: '#5D7FC4' };
    var DESC = {
      'enc-v': '<b>Encoder · video tokens</b> attend to all video tokens and never to the queries, so the pretrained backbone sees the clip as usual.',
      'enc-q': '<b>Encoder · latent-action queries</b> are frame-causal: query group Q<sub>g</sub> reads frames V<sub>0</sub>…V<sub>g</sub>, and attends to every query.',
      'dec-v': '<b>Decoder · video tokens</b> read all video tokens plus the latent-action prefix: frame V<sub>t</sub> sees Q<sub>0</sub>…Q<sub>t</sub>.',
      'dec-q': '<b>Decoder · latent actions</b> are pure conditioning: each query attends only to itself.',
      'dec-a': '<b>Decoder · action tokens</b> read the latent-action prefix (A<sub>m</sub> sees Q<sub>0</sub>…Q<sub>m</sub>) and all action tokens, but never the video.'
    };
    var groups = [];   /* {key, type, r0, r1, rows:[cells[]], box, mtx} */
    var matrices = {}; /* key -> all rows (array of cell arrays) */
    ['enc', 'dec'].forEach(function (key) {
      var M = MASKS[key], g = document.getElementById(M.el);
      var types = [];
      M.groups.forEach(function (gr) { for (var i = 0; i < gr[2]; i++) types.push(gr[1]); });
      var n = types.length, start = 0, allRows = [];
      for (var r = 0; r < n; r++) {
        var cells = [];
        for (var c = 0; c < n; c++) {
          var on = M.m[r][c] === 1;
          var rect = svgEl('rect', { x: M.ox + c * PITCH, y: M.oy + r * PITCH, width: CELL, height: CELL, rx: 4, 'class': 'mask-cell ' + (on ? 'on-' + types[r] : 'off') });
          g.appendChild(rect); cells.push(rect);
        }
        allRows.push(cells);
      }
      matrices[key] = allRows;
      M.groups.forEach(function (gr) {
        var mid = (start + gr[2] / 2) * PITCH - 2;
        g.appendChild(Object.assign(svgEl('text', { x: M.ox + mid, y: M.oy - 14, 'text-anchor': 'middle', 'font-size': 24, fill: GCOL[gr[1]] }), { textContent: gr[0] }));
        var rowLbl = Object.assign(svgEl('text', { x: M.ox - 16, y: M.oy + mid + 8, 'text-anchor': 'middle', 'font-size': 24, fill: GCOL[gr[1]] }), { textContent: gr[0] });
        g.appendChild(rowLbl);
        var grp = { key: key, type: gr[1], r0: start, r1: start + gr[2], lbl: rowLbl,
          box: { x: M.ox - 5, y: M.oy + start * PITCH - 5, w: n * PITCH + 6, h: gr[2] * PITCH + 6 } };
        var hit = svgEl('rect', { x: M.ox - 32, y: M.oy + start * PITCH - 2, width: n * PITCH + 32, height: gr[2] * PITCH, 'class': 'mask-row-hit' });
        hit.addEventListener('mouseenter', (function (i) { return function () { stop(); activate(i); }; })(groups.length));
        hit.addEventListener('mouseleave', resume);
        g.appendChild(hit);
        groups.push(grp);
        start += gr[2];
      });
    });
    var outline = svgEl('rect', { rx: 8, fill: 'none', stroke: '#1B1F14', 'stroke-width': 3, opacity: 0 });
    outline.style.transition = 'x .35s, y .35s, width .35s, height .35s, opacity .2s';
    $('#mask-svg').appendChild(outline);
    var info = $('#mask-info'), cur = -1;
    function activate(i) {
      cur = i;
      var G = groups[i];
      Object.keys(matrices).forEach(function (key) {
        matrices[key].forEach(function (cells, r) {
          var dim = key === G.key && (r < G.r0 || r >= G.r1);
          cells.forEach(function (cell) { cell.classList.toggle('dim', dim); });
        });
      });
      groups.forEach(function (o) { o.lbl.setAttribute('font-weight', o === G ? 700 : 400); });
      outline.setAttribute('x', G.box.x); outline.setAttribute('y', G.box.y);
      outline.setAttribute('width', G.box.w); outline.setAttribute('height', G.box.h);
      outline.setAttribute('opacity', 1);
      info.innerHTML = DESC[G.key + '-' + G.type];
    }
    var timer = null, resumeT = null;
    function tick() { activate((cur + 1) % groups.length); }
    function start() { if (!timer) timer = setInterval(tick, 2600); }
    function stop() { clearInterval(timer); timer = null; clearTimeout(resumeT); }
    function resume() { clearTimeout(resumeT); resumeT = setTimeout(start, 1500); }
    if (hasIO) {
      new IntersectionObserver(function (es) { if (es[0].isIntersecting) { if (cur < 0) tick(); start(); } else stop(); }, { threshold: .3 }).observe($('#mask-svg'));
    } else { tick(); start(); }
  })();

  /* ---------------- LARYBench bars ---------------- */
  $$('.bars').forEach(function (el) {
    var max = parseFloat(el.dataset.max), digits = parseInt(el.dataset.digits, 10);
    JSON.parse(el.dataset.rows).forEach(function (r) {
      var row = document.createElement('div');
      row.className = 'bar' + (r[2] ? ' ours' : '');
      row.innerHTML = '<span class="name"></span><span class="track"><span class="fill"></span></span><span class="val"></span>';
      row.querySelector('.name').textContent = r[0];
      row.querySelector('.val').textContent = r[1].toFixed(digits);
      row.querySelector('.fill').dataset.w = Math.max(2, r[1] / max * 100) + '%';
      el.appendChild(row);
    });
  });
  function growBars() { $$('.bar .fill').forEach(function (f) { f.style.width = f.dataset.w; }); }
  if (hasIO) {
    var bo = new IntersectionObserver(function (es) { if (es.some(function (e) { return e.isIntersecting; })) { growBars(); bo.disconnect(); } }, { threshold: .2 });
    bo.observe($('#lary'));
  } else growBars();

  /* ---------------- copy BibTeX ---------------- */
  $$('.copy').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var txt = $(btn.dataset.copy).textContent;
      var done = function () { btn.textContent = 'Copied'; setTimeout(function () { btn.textContent = 'Copy'; }, 1400); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(done, done);
      else { var ta = document.createElement('textarea'); ta.value = txt; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); } catch (e) {} ta.remove(); done(); }
    });
  });

  /* ---------------- day / night toggle ---------------- */
  (function () {
    var root = document.documentElement, btn = $('#theme-toggle');
    if (!btn) return;
    function label(t) {
      btn.setAttribute('aria-pressed', t === 'dark' ? 'true' : 'false');
      btn.setAttribute('aria-label', t === 'dark' ? 'Switch to day mode' : 'Switch to night mode');
    }
    function set(t, persist) {
      root.setAttribute('data-theme', t); label(t);
      if (persist) { try { localStorage.setItem('dreamx-theme', t); } catch (e) {} }
    }
    label(root.getAttribute('data-theme') || 'light');
    btn.addEventListener('click', function () {
      set(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark', true);
    });
    /* follow the OS setting until the visitor picks one */
    if (window.matchMedia) {
      var mq = window.matchMedia('(prefers-color-scheme: dark)');
      var onChange = function (e) {
        var saved = null; try { saved = localStorage.getItem('dreamx-theme'); } catch (err) {}
        if (saved !== 'light' && saved !== 'dark') set(e.matches ? 'dark' : 'light', false);
      };
      if (mq.addEventListener) mq.addEventListener('change', onChange); else if (mq.addListener) mq.addListener(onChange);
    }
  })();

  /* ---------------- start watching ---------------- */
  $$('.vgroup').forEach(watchGroup);
  $$('.slot[data-video]').forEach(watchSlot);
})();
