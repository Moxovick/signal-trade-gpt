/* ═══════════════════════════════════════
   PRELOADER
═══════════════════════════════════════ */
(function () {
  const fill = document.getElementById('pre-fill');
  const num  = document.getElementById('pre-num');
  const pre  = document.getElementById('preloader');
  let v = 0;
  const t = setInterval(() => {
    v = Math.min(v + Math.random() * 14 + 3, 100);
    fill.style.width = v + '%';
    num.textContent  = Math.floor(v) + '%';
    if (v >= 100) { clearInterval(t); setTimeout(() => pre.classList.add('done'), 350); }
  }, 90);
})();

/* ═══════════════════════════════════════
   CURSOR
═══════════════════════════════════════ */
const cur  = document.getElementById('cur');
const curR = document.getElementById('cur-r');
let mx = 0, my = 0, rx = 0, ry = 0;
document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
document.querySelectorAll('a, button, [data-tilt]').forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('cur-hover'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('cur-hover'));
});
(function loop() {
  cur.style.left  = mx + 'px'; cur.style.top  = my + 'px';
  rx += (mx - rx) * .11; ry += (my - ry) * .11;
  curR.style.left = rx + 'px'; curR.style.top = ry + 'px';
  requestAnimationFrame(loop);
})();

/* ═══════════════════════════════════════
   SCROLL PROGRESS + NAV
═══════════════════════════════════════ */
const prog  = document.getElementById('progress');
const navEl = document.getElementById('nav');
window.addEventListener('scroll', () => {
  const pct = scrollY / (document.body.scrollHeight - innerHeight) * 100;
  prog.style.width = pct + '%';
  navEl.classList.toggle('scrolled', scrollY > 40);
}, { passive: true });

/* ═══════════════════════════════════════
   BACKGROUND CANVAS
═══════════════════════════════════════ */
(function () {
  const cvs = document.getElementById('bg-canvas');
  const ctx = cvs.getContext('2d');
  let W, H;

  const ORBS = [
    { x: .12, y: .18, r: .38, c: [229, 48, 48],  a: .14, ph: 0,   sp: .00025 },
    { x: .88, y: .55, r: .30, c: [120, 40, 200],  a: .10, ph: 2.1, sp: .00032 },
    { x: .45, y: .92, r: .25, c: [229, 48, 48],   a: .09, ph: 4.5, sp: .00020 },
    { x: .70, y: .08, r: .20, c: [80, 120, 220],  a: .07, ph: 1.3, sp: .00018 },
  ];

  const PARTS = Array.from({ length: 50 }, () => ({
    x: Math.random(), y: Math.random(),
    vx: (Math.random() - .5) * .00018,
    vy: (Math.random() - .5) * .00018,
    r: Math.random() * 1.1 + .4,
  }));

  function resize() {
    W = cvs.width  = innerWidth;
    H = cvs.height = innerHeight;
    cvs.style.width  = W + 'px';
    cvs.style.height = H + 'px';
  }
  window.addEventListener('resize', resize, { passive: true });
  resize();

  function draw(t) {
    ctx.clearRect(0, 0, W, H);

    ORBS.forEach(o => {
      const ox = (o.x + Math.sin(t * o.sp + o.ph) * .07) * W;
      const oy = (o.y + Math.cos(t * o.sp * .65 + o.ph) * .055) * H;
      const rr = o.r * Math.min(W, H);
      const g  = ctx.createRadialGradient(ox, oy, 0, ox, oy, rr);
      g.addColorStop(0,  `rgba(${o.c},${o.a})`);
      g.addColorStop(.6, `rgba(${o.c},${o.a * .3})`);
      g.addColorStop(1,  `rgba(${o.c},0)`);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    });

    const GS = 64;
    ctx.strokeStyle = 'rgba(255,255,255,0.028)';
    ctx.lineWidth = .5;
    ctx.beginPath();
    for (let x = GS; x < W; x += GS) { ctx.moveTo(x, 0); ctx.lineTo(x, H); }
    for (let y = GS; y < H; y += GS) { ctx.moveTo(0, y); ctx.lineTo(W, y); }
    ctx.stroke();

    PARTS.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = 1; if (p.x > 1) p.x = 0;
      if (p.y < 0) p.y = 1; if (p.y > 1) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x * W, p.y * H, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(245,197,24,.65)';
      ctx.fill();
    });

    const DIST = 130;
    for (let i = 0; i < PARTS.length; i++) {
      const pi = PARTS[i];
      for (let j = i + 1; j < PARTS.length; j++) {
        const pj = PARTS[j];
        const dx = (pi.x - pj.x) * W;
        const dy = (pi.y - pj.y) * H;
        const d2 = dx * dx + dy * dy;
        if (d2 > DIST * DIST) continue;
        const a = (1 - Math.sqrt(d2) / DIST) * .22;
        ctx.strokeStyle = `rgba(245,197,24,${a})`;
        ctx.lineWidth = .6;
        ctx.beginPath();
        ctx.moveTo(pi.x * W, pi.y * H);
        ctx.lineTo(pj.x * W, pj.y * H);
        ctx.stroke();
      }
    }

    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
})();

/* ═══════════════════════════════════════
   CANDLESTICK CHART (hero card)
═══════════════════════════════════════ */
(function () {
  const cvs = document.getElementById('chart');
  if (!cvs) return;
  const ctx = cvs.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  function resize() {
    const W = cvs.parentElement.offsetWidth;
    cvs.style.width  = W + 'px';
    cvs.style.height = '200px';
    cvs.width  = W * dpr;
    cvs.height = 200 * dpr;
    ctx.scale(dpr, dpr);
    draw();
  }

  let candles = [];
  function mkC(prev) {
    const o  = prev ? prev.c + (Math.random() - .47) * 0.0008 : 1.0842;
    const mv = (Math.random() - .44) * 0.0012;
    const c  = o + mv;
    return { o, c, h: Math.max(o, c) + Math.random() * 0.0004, l: Math.min(o, c) - Math.random() * 0.0004 };
  }
  for (let i = 0; i < 34; i++) candles.push(mkC(candles[i - 1]));

  function draw() {
    const W = cvs.offsetWidth, H = 200;
    ctx.clearRect(0, 0, W, H);
    const pad = { t: 12, b: 18, l: 6, r: 6 };
    const hi  = Math.max(...candles.map(c => c.h));
    const lo  = Math.min(...candles.map(c => c.l));
    const rng = hi - lo || 1;
    const cw  = Math.floor((W - pad.l - pad.r) / candles.length);
    const yM  = v => pad.t + (1 - (v - lo) / rng) * (H - pad.t - pad.b);

    ctx.strokeStyle = 'rgba(255,255,255,0.04)'; ctx.lineWidth = .5;
    for (let i = 1; i < 4; i++) {
      const y = pad.t + i * (H - pad.t - pad.b) / 4;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    candles.forEach((c, i) => {
      const x    = pad.l + i * cw + 1;
      const bull = c.c >= c.o;
      const col  = bull ? '#00e5a0' : '#f5c518';
      ctx.strokeStyle = col; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x + cw / 2, yM(c.h)); ctx.lineTo(x + cw / 2, yM(c.l)); ctx.stroke();
      ctx.fillStyle = bull ? 'rgba(0,229,160,.82)' : 'rgba(245,197,24,.82)';
      const top = yM(Math.max(c.o, c.c));
      const ht  = Math.max(2, Math.abs(yM(c.o) - yM(c.c)));
      ctx.fillRect(x + 1, top, Math.max(1, cw - 4), ht);
    });

    const last = candles[candles.length - 1];
    const py   = yM(last.c);
    ctx.strokeStyle = 'rgba(0,229,160,.4)'; ctx.lineWidth = 1;
    ctx.setLineDash([4, 5]);
    ctx.beginPath(); ctx.moveTo(0, py); ctx.lineTo(W, py); ctx.stroke();
    ctx.setLineDash([]);
  }

  resize();
  window.addEventListener('resize', resize, { passive: true });

  setInterval(() => {
    candles.shift(); candles.push(mkC(candles[candles.length - 1]));
    draw();
    const last = candles[candles.length - 1];
    const p = last.c.toFixed(4);
    const chg = ((last.c - candles[0].o) / candles[0].o * 100).toFixed(2);
    const priceEl = document.getElementById('cc-price');
    const chgEl   = document.getElementById('cc-chg');
    if (priceEl) priceEl.textContent = p;
    if (chgEl) {
      chgEl.textContent = (chg >= 0 ? '+' : '') + chg + '%';
      chgEl.style.color = chg >= 0 ? 'var(--green)' : '#f0a500';
      chgEl.style.background = chg >= 0 ? 'rgba(0,229,160,.12)' : 'rgba(245,197,24,.12)';
    }
  }, 2200);
})();

/* ═══════════════════════════════════════
   TICKER
═══════════════════════════════════════ */
(function () {
  const data = [
    ['EUR/USD', '+0.34', 'g'], ['GBP/USD', '-0.41', 'r'], ['USD/JPY', '+0.18', 'g'],
    ['AUD/USD', '-0.29', 'r'], ['EUR/GBP', '+0.12', 'g'], ['GBP/JPY', '+0.55', 'g'],
    ['USD/CHF', '-0.15', 'r'], ['NZD/USD', '+0.23', 'g'], ['EUR/JPY', '+0.44', 'g'],
    ['AUD/JPY', '-0.08', 'r'], ['USD/CAD', '+0.31', 'g'], ['EUR/AUD', '-0.19', 'r'],
  ];
  const t = document.getElementById('ticker-t');
  [...data, ...data].forEach(([p, c, dir]) => {
    const el = document.createElement('div');
    el.className = 'ticker-item';
    el.innerHTML = `<span class="pair">${p}</span><span class="chg-${dir}">${dir === 'g' ? '+' : ''}${c}%</span>`;
    t.appendChild(el);
  });
})();

/* ═══════════════════════════════════════
   SCROLL REVEAL + STAT COUNTERS
═══════════════════════════════════════ */
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('on');

    const sb = e.target.closest('.stat-box');
    if (sb) {
      const targets = { s1: 4.2, s2: 14, s3: 87, s4: 24 };
      Object.entries(targets).forEach(([id, target]) => {
        const el = document.getElementById(id);
        if (!el || el._counted) return;
        el._counted = true;
        const isDec = target % 1 !== 0;
        let st = null;
        (function step(ts) {
          if (!st) st = ts;
          const p    = Math.min((ts - st) / 1600, 1);
          const ease = 1 - Math.pow(1 - p, 3);
          el.textContent = isDec ? (target * ease).toFixed(1) : Math.floor(target * ease);
          if (p < 1) requestAnimationFrame(step);
          else el.textContent = isDec ? target.toFixed(1) : target;
        })(performance.now());
      });
    }
  });
}, { threshold: 0.18 });

document.querySelectorAll('.rv, .step, .pr-card, .stat-box').forEach(el => io.observe(el));

/* ═══════════════════════════════════════
   TESTIMONIALS — dual marquee
═══════════════════════════════════════ */
(function () {
  const revs = [
    { n: 'Александр К.', r: 'Pocket Option трейдер',  t: 'Первые 2 недели скептически, потом поймал CALL EUR/USD — экспирация 1 мин, плюс 87$ на сделке. Теперь торгую каждый день.', s: 5, av: 'АК' },
    { n: 'Михаил Р.',    r: 'Бинарные опционы',        t: 'Сигналы по GBP/USD и USD/JPY реально работают. За месяц вышел в плюс на 18% депозита. AI замечает то, что я пропускаю.', s: 5, av: 'МР' },
    { n: 'Дмитрий В.',   r: 'Трейдер, Pocket Option',  t: 'Пробовал другие сервисы — гадают. Здесь реальная логика: CALL/PUT с чётким уровнем Confidence. Уже 4 месяца в плюсе.', s: 4, av: 'ДВ' },
    { n: 'Сергей П.',    r: 'Инвестор',                t: 'Free план попробовал 2 недели — сразу взял Premium. 20+ сигналов в день это совсем другой уровень. Окупился за первую неделю.', s: 5, av: 'СП' },
    { n: 'Игорь Т.',     r: 'Начинающий трейдер',      t: 'Начал без опыта в бинарных опционах. Просто следовал сигналам — за 3 месяца вырастил депозит на 40%. Рекомендую всем.', s: 5, av: 'ИТ' },
    { n: 'Анна К.',      r: 'Трейдер, Минск',          t: 'Думала трейдинг — это сложно. С этими сигналами всё просто: получил сигнал → открыл сделку. Первый профит через 2 дня!', s: 5, av: 'АН' },
    { n: 'Роман Д.',     r: 'Свинг-трейдер',           t: 'Сигналы по EUR/JPY и GBP/JPY — особенно точные. Уже 5 месяцев стабильного профита. VIP план стоит каждого цента.', s: 5, av: 'РД' },
    { n: 'Николай В.',   r: 'Pocket Option, Киев',      t: 'Реферальная программа отдельный кайф — пригласил 7 друзей, получаю бонусы каждую неделю. Сигналы плюс рефералка = отличный доход.', s: 5, av: 'НВ' },
  ];
  const half1 = revs.slice(0, 5);
  const half2 = revs.slice(3);
  function mkCard(r) {
    const d = document.createElement('div');
    d.className = 'test-card';
    d.innerHTML = `<div class="t-stars">${'★'.repeat(r.s)}</div><div class="t-text">${r.t}</div><div class="t-author"><div class="t-av">${r.av}</div><div><div class="t-name">${r.n}</div><div class="t-role">${r.r}</div></div></div>`;
    return d;
  }
  const tr1 = document.getElementById('tr1');
  const tr2 = document.getElementById('tr2');
  [...half1, ...half1].forEach(r => tr1.appendChild(mkCard(r)));
  [...half2, ...half2].forEach(r => tr2.appendChild(mkCard(r)));
})();

/* ═══════════════════════════════════════
   FAQ
═══════════════════════════════════════ */
(function () {
  const data = [
    ['Что такое Signal Trade GPT?',
     'Signal Trade GPT — AI-платформа которая анализирует валютные рынки и генерирует точные сигналы CALL/PUT для торговли бинарными опционами на Pocket Option. Сигналы доставляются прямо в Telegram.'],
    ['Нужен ли опыт в трейдинге?',
     'Нет. Платформа разработана для любого уровня. Сигнал содержит всё что нужно: валютную пару, направление CALL/PUT, время экспирации и уровень AI Confidence. Просто следуй инструкции.'],
    ['Как часто приходят сигналы?',
     'Сигналы генерируются каждые 5–15 минут в рабочие часы 08:00–22:00 UTC. Free план: 3–5 сигналов в день. Premium: 15–25 в день. VIP: без ограничений.'],
    ['Какая точность сигналов?',
     'За последние 30 дней средняя точность составила 87.3%. Результат основан на реальных данных платформы. Помни: никакой сигнал не гарантирует 100% результат — всегда управляй рисками.'],
    ['Как работает реферальная программа?',
     'Получи свою уникальную ссылку командой /referral в боте. Пригласи друга — получай бонус: Free 10%, Premium 15%, VIP 20% от активности реферала.'],
    ['Как отменить подписку?',
     'Отмена в один клик через команду /profile в боте или напиши в поддержку. Доступ сохраняется до конца оплаченного периода.'],
    ['Можно ли потерять деньги?',
     'Да. Торговля бинарными опционами сопряжена с высоким риском потери средств. Используй не более 1–3% депозита на одну сделку и торгуй только теми деньгами, которые готов потерять.'],
  ];
  const list = document.getElementById('faq-list');
  data.forEach(([q, a]) => {
    const el = document.createElement('div');
    el.className = 'faq-item';
    el.innerHTML = `<button class="faq-q" onclick="tFaq(this)"><span>${q}</span><span class="faq-icon">+</span></button><div class="faq-body"><p>${a}</p></div>`;
    list.appendChild(el);
  });
})();

function tFaq(btn) {
  const item = btn.parentElement;
  const open = item.classList.contains('open');
  document.querySelectorAll('.faq-item').forEach(f => f.classList.remove('open'));
  if (!open) item.classList.add('open');
}

/* ═══════════════════════════════════════
   3D TILT
═══════════════════════════════════════ */
document.querySelectorAll('[data-tilt]').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width  - .5;
    const y = (e.clientY - r.top)  / r.height - .5;
    card.style.transform  = `perspective(700px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) translateY(-8px)`;
    card.style.transition = 'transform 0s';
  });
  card.addEventListener('mouseleave', () => {
    card.style.transition = 'transform .6s cubic-bezier(.34,1.56,.64,1)';
    card.style.transform  = '';
  });
});

/* ═══════════════════════════════════════
   SPOTLIGHT
═══════════════════════════════════════ */
document.querySelectorAll('.spotlight-host').forEach(host => {
  const layer = document.createElement('div');
  layer.className = 'spotlight-layer';
  host.appendChild(layer);
  host.addEventListener('mousemove', e => {
    const r = host.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    layer.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(245,197,24,.09), transparent 65%)`;
    layer.style.opacity = '1';
  });
  host.addEventListener('mouseleave', () => layer.style.opacity = '0');
});
