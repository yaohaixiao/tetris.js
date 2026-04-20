var tetris = (() => {
  var zt = {
      board: [],
      curr: null,
      cx: 0,
      cy: 0,
      next: null,
      score: 0,
      baseLines: 0,
      lines: 0,
      level: 1,
      highScore: 0,
      mode: 'main-menu',
    },
    S = zt;
  var Vt = {
      recording: !1,
      playing: !1,
      frame: 0,
      data: [],
      cursor: 0,
      startRecord() {
        ((this.recording = !0), (this.data = []), (this.frame = 0));
      },
      stopRecord() {
        this.recording = !1;
      },
      startPlay() {
        ((this.playing = !0), (this.frame = 0), (this.cursor = 0));
      },
      stopPlay() {
        this.playing = !1;
      },
    },
    O = Vt;
  var Ht = {
      queue: [],
      enqueue(e) {
        this.queue.push(e);
      },
      flush(e) {
        let { queue: t } = this;
        for (; t.length > 0; ) t.shift().execute(e);
      },
      clear() {
        this.queue.length = 0;
      },
    },
    Y = Ht;
  var V = [],
    w = (e) => {
      V.push(e);
    },
    Ee = (e) => {
      for (let t = V.length - 1; t >= 0; t--) V[t].update(e) || V.splice(t, 1);
    },
    Se = () => {
      let e = V.slice().toSorted((t, o) => t.layer - o.layer);
      for (let t of e) t.render();
    },
    $ = (e = []) =>
      V.some((t) => {
        let o = t.blocking;
        return e && e.length > 0 ? o && e.includes(t.name) : o;
      });
  var me = new AudioContext(),
    Dt = (e, t, o = 0.1, r = 'square') => {
      let n = me.createOscillator(),
        i = me.createGain();
      ((n.type = r),
        (n.frequency.value = e),
        (i.gain.value = o),
        n.connect(i),
        i.connect(me.destination),
        n.start(),
        setTimeout(() => {
          (n.stop(), n.disconnect(), i.disconnect());
        }, t));
    },
    d = Dt;
  var Wt = {
      levelSelect: () => d(523, 80, 0.1, 'sine'),
      levelStart: () => d(1319, 160, 0.22, 'sine'),
      countdown: () => d(784, 180, 0.3, 'sine'),
      move: () => d(330, 60),
      rotate: () => d(440, 60),
      drop: () => d(220, 100),
      fall: () => d(180, 200),
      clear: () => {
        (d(587, 220, 0.35, 'square'),
          setTimeout(() => d(698, 260, 0.32, 'square'), 160),
          setTimeout(() => d(880, 300, 0.3, 'square'), 320),
          setTimeout(() => d(1174, 380, 0.25, 'square'), 480));
      },
      levelUp: () => {
        (d(523, 220),
          setTimeout(() => d(587, 220), 260),
          setTimeout(() => d(659, 240), 520),
          setTimeout(() => d(784, 260), 780),
          setTimeout(() => d(880, 280), 1060),
          setTimeout(() => d(1047, 320), 1360),
          setTimeout(() => d(1175, 360), 1700),
          setTimeout(() => d(1319, 480), 2080));
      },
      pause: () => d(300, 150),
      secondTick: () => d(880, 50, 0.085, 'sine'),
      resume: () => d(400, 150),
      gameOver: () => {
        (d(330, 200),
          setTimeout(() => d(294, 300), 210),
          setTimeout(() => d(262, 500), 520));
      },
      bgmToggle: () => d(440, 100),
    },
    h = Wt;
  var Le = document.querySelector('#game-board'),
    Ut = Le.getContext('2d'),
    ve = document.querySelector('#next-piece'),
    qt = ve.getContext('2d'),
    Yt = 0,
    Kt = 0,
    Qt = {
      gameBoard: Le,
      gameBoardContext: Ut,
      nextPiece: ve,
      nextPieceContext: qt,
      fontSize: Yt,
      blockSize: Kt,
    },
    m = Qt;
  function Xt() {
    let { gameBoard: e, gameBoardContext: t } = m,
      { width: o, height: r } = e;
    t.clearRect(0, 0, o, r);
  }
  var A = Xt;
  var $t = '#18c8fa',
    jt = 'rgba(50, 190, 239, 0.3)',
    Jt = '#ff0',
    Zt = '#a0a',
    eo = '#00f',
    to = '#ff7f00',
    oo = '#0f0',
    ro = '#f00',
    no = '#444',
    io = 'rgba(0,0,0,.5)',
    so = '#fff',
    ao = {
      TEAL: $t,
      RGBA_TEAL: jt,
      YELLOW: Jt,
      PURPLE: Zt,
      BLUE: eo,
      ORANGE: to,
      GREEN: oo,
      RED: ro,
      BLACK: no,
      RGBA_BLACK: io,
      WHITE: so,
    },
    f = ao;
  var mo = [0, 100, 300, 500, 800, 1200],
    co = '"Press Start 2P", monospace, sans-serif',
    lo = 99,
    fo = { CLEAR_SCORES: mo, MAX_LEVEL: lo, FONT_FAMILY: co },
    H = fo;
  var po = (e) => {
      let {
          text: t,
          x: o,
          y: r,
          color: n,
          strokeColor: i,
          size: l = 1,
          center: p = !0,
          baseline: s = '',
          stroke: c = !1,
          lineWidth: g = 2,
        } = e,
        { FONT_FAMILY: L } = H,
        { gameBoardContext: u, fontSize: E } = m;
      (u.save(),
        p && (u.textAlign = 'center'),
        s && (u.textBaseline = s),
        (u.font = `${E * l}px ${L}`),
        c &&
          ((u.strokeStyle = i || n), (u.lineWidth = g), u.strokeText(t, o, r)),
        (u.fillStyle = n),
        u.fillText(t, o, r),
        u.restore());
    },
    x = po;
  var uo = () => {
      let { GREEN: e } = f,
        { gameBoard: t } = m,
        { width: o, height: r } = t;
      x({ text: 'TETRIS.JS', x: o / 2, y: r * 0.1, color: e, size: 1.1 });
    },
    R = uo;
  var ho = (e) => {
      let { RGBA_BLACK: t } = f,
        { gameBoard: o, gameBoardContext: r } = m,
        { width: n, height: i } = o;
      (r.save(), (r.fillStyle = e || t), r.fillRect(0, 0, n, i), r.restore());
    },
    B = ho;
  var go = (e, t = 1) => {
      let { YELLOW: o, BLACK: r } = f,
        { FONT_FAMILY: n } = H,
        { gameBoard: i, gameBoardContext: l, fontSize: p } = m,
        { width: s, height: c } = i;
      (l.save(),
        (l.textAlign = 'center'),
        (l.textBaseline = 'middle'),
        l.translate(s / 2, c / 2),
        l.scale(t, t),
        (l.font = `${p * 3.25}px ${n}`),
        (l.fillStyle = o),
        (l.strokeStyle = r),
        (l.lineWidth = 6));
      let g = String(e);
      (l.strokeText(g, 0, 0), l.fillText(g, 0, 0), l.restore());
    },
    Te = go;
  var xo = () => {
      let { GREEN: e, BLACK: t } = f,
        { gameBoard: o } = m,
        { width: r, height: n } = o;
      x({
        text: 'GET READY!',
        x: r / 2,
        y: n / 1.46,
        color: e,
        stroke: !0,
        strokeColor: t,
        size: 1.1,
        center: !0,
        baseline: 'top',
      });
    },
    Oe = xo;
  var Eo = (e) => {
      let { number: t, scale: o } = e;
      (A(), B(), R(), Oe(), Te(t, o));
    },
    ce = Eo;
  var So = new Set(['main-menu', 'playing', 'paused', 'game-over']),
    Lo = (e) => {
      !So.has(e) || S.mode === e || (S.mode = e);
    },
    K = Lo;
  var vo = { bgmEnabled: !0, bgmTimer: null },
    y = vo;
  var ye = (e, t) => {
      (e >= t.length && (e = 0),
        d(t[e], 110, 0.05),
        (y.bgmTimer = setTimeout(() => {
          ye(e + 1, t);
        }, 130)));
    },
    Ce = ye;
  var To = () => {
      (y.bgmTimer && clearTimeout(y.bgmTimer), (y.bgmTimer = null));
    },
    T = To;
  var Oo = () => {
      let e = [
        659, 659, 587, 659, 784, 880, 523, 523, 440, 523, 659, 784, 659, 659,
        587, 659, 784, 880, 988, 880, 784, 659, 880, 784, 659, 587, 523, 587,
        659, 784, 659, 587,
      ];
      if (!y.bgmEnabled) return !1;
      (T(), Ce(0, e));
    },
    b = Oo;
  var yo = { COLS: 10, ROWS: 20 },
    v = yo;
  var {
      BLUE: Co,
      TEAL: Me,
      YELLOW: Mo,
      PURPLE: Ao,
      ORANGE: Ro,
      GREEN: Bo,
      RED: bo,
    } = f,
    Go = [
      { shape: [[1, 1, 1, 1]], color: Me },
      { shape: [[1, 1, 1, 1, 1]], color: Me },
      {
        shape: [
          [1, 1],
          [1, 1],
        ],
        color: Mo,
      },
      {
        shape: [
          [0, 1, 0],
          [1, 1, 1],
        ],
        color: Ao,
      },
      {
        shape: [
          [1, 0, 0],
          [1, 1, 1],
        ],
        color: Co,
      },
      {
        shape: [
          [0, 0, 1],
          [1, 1, 1],
        ],
        color: Ro,
      },
      {
        shape: [
          [0, 1, 1],
          [1, 1, 0],
        ],
        color: Bo,
      },
      {
        shape: [
          [1, 1, 0],
          [0, 1, 1],
        ],
        color: bo,
      },
    ],
    le = Go;
  function wo() {
    let e = Math.floor(Math.random() * le.length),
      t = le[e];
    return { ...t, shape: t.shape.map((o) => [...o]) };
  }
  var fe = wo;
  var ko = (e, t, o) => {
      let { ROWS: r, COLS: n } = v,
        { curr: i, cx: l, cy: p, board: s } = o;
      if (!i) return !1;
      let c = i.shape;
      for (let g = 0; g < c.length; g++)
        for (let L = 0; L < c[g].length; L++)
          if (c[g][L]) {
            let u = l + L + e,
              E = p + g + t,
              F = u < 0 || u >= n || E >= r,
              z = E >= 0 && E < r && s[E][u];
            if (F || z) return !0;
          }
      return !1;
    },
    D = ko;
  var Po = () => {
      let e = a.getMode();
      if (e === 'game-over' || e === 'paused' || e === 'main-menu') return !1;
      (a.setMode('game-over'), a.saveHighScore(), T(), h.gameOver());
    },
    j = Po;
  var _o = () => {
      let { nextPiece: e, nextPieceContext: t } = m,
        { width: o, height: r } = e;
      t.clearRect(0, 0, o, r);
    },
    Ae = _o;
  var Io = (e) => {
      let { next: t } = e,
        { BLACK: o } = f,
        { nextPiece: r, nextPieceContext: n } = m,
        { width: i, height: l } = r;
      if (!t) return;
      let { shape: p } = t,
        c = Math.floor(i / 5),
        g = Math.floor((i - p[0].length * c) / 2),
        L = Math.floor((l - p.length * c) / 2);
      Ae();
      for (let u = 0; u < p.length; u++)
        for (let E = 0; E < p[u].length; E++) {
          if (!p[u][E]) continue;
          let F = g + E * c,
            z = L + u * c;
          ((n.fillStyle = t.color),
            n.fillRect(F, z, c - 2, c - 2),
            (n.strokeStyle = o),
            n.strokeRect(F, z, c - 2, c - 2));
        }
    },
    J = Io;
  var No = (e) => {
      let { COLS: t } = v;
      ((e.curr = e.next
        ? { ...e.next, shape: e.next.shape.map((o) => [...o]) }
        : fe()),
        (e.next = fe()),
        (e.cx = Math.floor(t / 2) - Math.floor(e.curr.shape[0].length / 2)),
        (e.cy = 0),
        J(e.next),
        D(0, 0, e) && j());
    },
    k = No;
  var Fo = () => {
      (a.stop(), (a.rafId = requestAnimationFrame(ee)));
    },
    Z = Fo;
  var zo = (e, t) => {
      let o = Number(e);
      if (!Number.isFinite(o)) return '';
      let r = Math.max(0, Math.floor(t)),
        n = o < 0 ? '-' : '',
        i = Math.abs(o).toString();
      return n + i.padStart(r, '0');
    },
    C = zo;
  var Vo = (e) => {
      let t = document.querySelector('#level');
      (t && (t.textContent = C(e.level, 2)),
        a.setMode('playing'),
        k(e),
        h.levelStart(),
        setTimeout(() => {
          b();
        }, 250),
        (a.rafId = requestAnimationFrame(Z)));
    },
    Re = Vo;
  var Ho = (e) => {
      let t = { show: !0, number: 3, scale: 4, count: 0, acc: 0 };
      return {
        layer: 100,
        blocking: !0,
        name: 'countdown',
        update(o) {
          return (
            (t.acc += o),
            t.acc < 0.01
              ? !0
              : ((t.acc = 0),
                ce(t),
                t.count++,
                (t.scale = Math.max(1, t.scale - 0.4)),
                t.count >= 50 &&
                  ((t.count = 0),
                  (t.number -= 1),
                  (t.scale = 4),
                  t.number >= 1 && h.countdown()),
                t.number <= 0 ? (this.stop(), !1) : !0)
          );
        },
        stop() {
          (K('playing'), Re(e));
        },
        render() {
          ce(t);
        },
      };
    },
    Be = Ho;
  var Do = () => {
      w(Be(a.state));
    },
    be = Do;
  var Wo = (e) => {
      ((e.baseLines = (e.level - 1) * 10), be());
    },
    Ge = Wo;
  var Uo = (e) => {
      (a.setLevel(e), h.levelSelect());
    },
    M = Uo;
  var qo = {
      LEVEL_ONE: () => {
        M(1);
      },
      LEVEL_TWO: () => {
        M(2);
      },
      LEVEL_THREE: () => {
        M(3);
      },
      LEVEL_FOUR: () => {
        M(4);
      },
      LEVEL_FIVE: () => {
        M(5);
      },
      LEVEL_SIX: () => {
        M(6);
      },
      LEVEL_SEVEN: () => {
        M(7);
      },
      LEVEL_EIGHT: () => {
        M(8);
      },
      LEVEL_NINE: () => {
        M(9);
      },
      LEVEL_TEN: () => {
        M(10);
      },
      CONFIRM: (e, t) => {
        Ge(t.state);
      },
    },
    we = qo;
  var Yo = (e, t, o) =>
      D(e, t, o) ? !1 : ((o.cx += e), (o.cy += t), h.move(), !0),
    P = Yo;
  var Ko = (e) => {
      let { curr: t } = e;
      if (!t) return;
      let o = t.shape;
      ((t.shape = o[0].map((r, n) => o.map((i) => i[n]).toReversed())),
        D(0, 0, e) ? (t.shape = o) : h.rotate());
    },
    ke = Ko;
  var Qo = (e) => {
      let { curr: t } = e,
        o = t.shape;
      for (let r = 0; r < o.length; r++)
        for (let n = 0; n < o[r].length; n++)
          o[r][n] && (e.board[e.cy + r][e.cx + n] = t.color);
    },
    te = Qo;
  var Xo = (e, t, o, r) => {
      let { BLACK: n } = f,
        { blockSize: i } = m,
        l = i,
        p = 1,
        s = l - p * 2,
        c = t * l + p,
        g = o * l + p;
      ((e.fillStyle = r),
        e.fillRect(c, g, s, s),
        (e.strokeStyle = n),
        e.strokeRect(c, g, s, s));
    },
    W = Xo;
  var $o = (e) => {
      let { COLS: t } = v,
        { gameBoardContext: o } = m;
      for (let r of e.lines) {
        (o.save(), (o.globalAlpha = r.alpha));
        for (let n = 0; n < t; n++) W(o, n, r.y, r.color);
        o.restore();
      }
    },
    Pe = $o;
  var jo = {
      score: document.querySelector('#score'),
      lines: document.querySelector('#lines'),
      level: document.querySelector('#level'),
      highScore: document.querySelector('#highScore'),
    },
    G = jo;
  var Jo = (e, t, o, r, n) => {
      let i = null;
      if (e === t) return null;
      let l = 0,
        p = 0,
        s = (c) => {
          p || (p = c);
          let g = c - p;
          ((p = c), (l += g));
          let L = Math.min(l / o, 1),
            u = Math.floor(e + (t - e) * L);
          (r(u, i),
            L < 1
              ? (i = requestAnimationFrame(s))
              : (cancelAnimationFrame(i), n?.()));
        };
      return (
        (i = requestAnimationFrame(s)),
        { cancel: () => cancelAnimationFrame(i) }
      );
    },
    _e = Jo;
  var _ = (e, t, o = 0) => (e.textContent = o ? C(t, o) : String(t)),
    Zo = () => {
      let e = { score: 0, lines: 0, level: 1, highScore: 0 },
        t = { score: 0 },
        o = { score: !1 },
        r = (c) => {
          ((t.score = c),
            !o.score &&
              ((o.score = !0),
              _e(
                e.score,
                t.score,
                300,
                (g) => {
                  _(G.score, g, 5);
                },
                () => {
                  ((e.score = t.score),
                    (o.score = !1),
                    e.score !== t.score && r(t.score));
                },
              )));
        },
        n = (c) => {
          c !== e.lines && (_(G.lines, c, 2), (e.lines = c));
        },
        i = (c) => {
          c !== e.level && (_(G.level, c, 2), (e.level = c));
        },
        l = (c) => {
          c !== e.highScore && (_(G.highScore, c, 5), (e.highScore = c));
        };
      return {
        update: (c) => {
          (r(c.score), n(c.lines), i(c.level), l(c.highScore));
        },
        reset: () => {
          ((e.score = e.lines = e.level = e.highScore = 0),
            (o.score = !1),
            _(G.score, 0, 5),
            _(G.lines, 0, 2),
            _(G.level, 1, 2),
            _(G.highScore, 0, 5));
        },
      };
    },
    Ie = Zo;
  var er = (e, t, o, r, n = !1) => {
      let i = Ie();
      ((a.getMode() === 'main-menu' || n) && i.reset(),
        i.update({ score: e, lines: t, level: o, highScore: r }));
    },
    I = er;
  var { TEAL: tr, YELLOW: or, PURPLE: rr, ORANGE: nr, GREEN: ir, RED: sr } = f,
    ar = [tr, or, rr, nr, ir, sr],
    pe = ar;
  var mr = (e) => {
      let { gameBoardContext: t } = m;
      for (let o of e)
        ((t.globalAlpha = o.alpha),
          (t.fillStyle = o.color),
          t.beginPath(),
          t.arc(o.x, o.y, o.radius, 0, Math.PI * 2),
          t.fill(),
          (o.x += o.vx),
          (o.y += o.vy),
          (o.alpha -= 0.024));
      t.globalAlpha = 1;
    },
    Ne = mr;
  var cr = () => {
      let { GREEN: e } = f,
        { gameBoard: t } = m,
        { width: o, height: r } = t;
      x({
        text: 'LEVEL UP',
        x: o / 2,
        y: r / 2.5,
        color: e,
        size: 1.2,
        center: !0,
      });
    },
    Fe = cr;
  var lr = (e, t) => {
      let { GREEN: o } = f,
        { gameBoard: r } = m,
        { width: n } = r;
      x({ text: String(e), x: n / 2, y: t, color: o, size: 3, center: !0 });
    },
    oe = lr;
  var fr = () => {
      let { YELLOW: e, BLACK: t } = f,
        { gameBoard: o } = m,
        { width: r, height: n } = o;
      x({
        text: 'CONGRATS!',
        x: r / 2,
        y: n / 1.6,
        color: e,
        stroke: !0,
        strokeColor: t,
        lineWidth: 3,
        size: 1.3,
        center: !0,
      });
    },
    ze = fr;
  function pr(e, t) {
    let { gameBoard: o } = m,
      { height: r } = o;
    (B(), R(), Fe(), oe(e, r / 1.85), ze(), Ne(t));
  }
  var Ve = pr;
  var de = class {
      constructor(t) {
        ((this.fireworks = this.createFireworks()),
          (this.duration = 3),
          (this.spawnTimer = 0),
          (this.layer = 100),
          (this.blocking = !0),
          (this.timer = 0),
          (this.name = 'level-up'),
          (this.state = t));
      }
      createFireworks() {
        let { width: t, height: o } = m.gameBoard,
          r = [];
        for (let n = 0; n < 40; n++) {
          let i = Math.random() * Math.PI * 2,
            l = 5 + Math.random() * 15;
          r.push({
            x: t / 2,
            y: o / 2 - 60,
            vx: Math.cos(i) * l,
            vy: Math.sin(i) * l,
            radius: 3 + Math.random() * 4,
            color: pe[Math.floor(Math.random() * pe.length)],
            alpha: 1,
          });
        }
        return r;
      }
      update(t) {
        return (
          (this.timer += t),
          (this.spawnTimer += t),
          this.updateFireworks(t),
          this.spawnTimer > 0.6 &&
            (this.fireworks.push(...this.createFireworks()),
            (this.spawnTimer = 0)),
          this.timer >= this.duration ? (this.stop(), !1) : !0
        );
      }
      stop() {
        b();
      }
      updateFireworks(t) {
        for (let r of this.fireworks)
          ((r.vx *= 0.98),
            (r.vy *= 0.98),
            (r.vy += 0.01 * t),
            (r.x += r.vx * t * 0.008),
            (r.y += r.vy * t * 0.008),
            (r.alpha -= t * 0.024),
            (r.radius += t * 10));
        this.fireworks = this.fireworks.filter((r) => r.alpha > 0);
      }
      render() {
        let { fireworks: t, state: o } = this,
          { level: r } = o;
        Ve(r, t);
      }
    },
    He = de;
  var dr = () => {
      let { state: e } = a;
      (T(), h.levelUp(), w(new He(e)));
    },
    De = dr;
  var ue = class {
      constructor(t, o) {
        ((this.lines = t.map((r) => ({ y: r, alpha: 1, timer: 0 }))),
          (this.state = o),
          (this.layer = 200),
          (this.blocking = !0),
          (this.name = 'clear-lines'));
      }
      update(t) {
        let o = !0;
        for (let r of this.lines) {
          let n = Math.floor(r.timer / 0.12);
          ((r.alpha = n % 2 === 0 ? 1 : 0),
            (r.timer += t),
            r.timer < 0.72 && (o = !1));
        }
        return o ? (this.finish(), !1) : !0;
      }
      render() {
        Pe({ lines: this.lines });
      }
      finish() {
        let { ROWS: t, COLS: o } = v,
          { CLEAR_SCORES: r, MAX_LEVEL: n } = H,
          { state: i } = this,
          l = 0;
        for (let c = t - 1; c >= 0; c--)
          i.board[c].every(Boolean) &&
            (i.board.splice(c, 1),
            i.board.unshift(Array.from({ length: o }).fill(0)),
            l++,
            c++);
        ((i.lines += l), (i.score += r[l] * i.level));
        let p = i.baseLines + i.lines,
          s = Math.floor(p / 10) + 1;
        (s > i.level && De(),
          (i.level = Math.min(Math.max(i.level, s), n)),
          I(i.score, i.lines, i.level, i.highScore));
      }
    },
    We = ue;
  var ur = (e) => {
      let t = new We(e, a.state);
      w(t);
    },
    Ue = ur;
  var hr = (e) => {
      let { ROWS: t } = v,
        o = 0,
        r = [];
      for (let n = t - 1; n >= 0; n--)
        e.board[n].every((l) => !!l) && (r.push(n), o++);
      return o === 0 ? (a.saveHighScore(), !1) : (h.clear(), Ue(r), !0);
    },
    re = hr;
  var gr = (e) => {
      for (; P(0, 1, e); );
      (te(e), h.fall(), re(e), k(e), h.drop());
    },
    qe = gr;
  var xr = (e) => {
      let t = a.getMode();
      t === 'paused' ||
        t === 'game-over' ||
        t === 'main-menu' ||
        (T(),
        a.setMode('playing'),
        (e.score = 0),
        (e.lines = 0),
        (e.level = 1),
        a.resetBoard(),
        I(e.score, e.lines, e.level, e.highScore, !0),
        k(e),
        b(),
        a.restart());
    },
    Ye = xr;
  var he = class {
      constructor(t = 500) {
        ((this.layer = t),
          (this.blocking = !0),
          (this.timer = 0),
          (this.active = !0),
          (this.name = 'paused'));
      }
      update(t) {
        return this.active
          ? ((this.timer += t),
            this.timer >= 1 && (h.secondTick(), (this.timer = 0)),
            !0)
          : !1;
      }
      stop() {
        this.active = !1;
      }
      render() {
        this.active = !0;
      }
    },
    Ke = he;
  var U = null,
    Qe = () => {
      U || ((U = new Ke()), w(U));
    },
    Xe = () => {
      U && (U.stop(), (U = null));
    };
  var Er = () => {
      let e = a.getMode();
      if (e === 'game-over' || e === 'main-menu') return !1;
      e === 'playing'
        ? (a.setMode('paused'), T(), h.pause(), Qe())
        : (Xe(), a.setMode('playing'), h.resume(), b(), a.restart());
    },
    ne = Er;
  var Sr = () => {
      let e = a.getMode();
      e === 'main-menu' ||
        e === 'paused' ||
        e === 'game-over' ||
        ((y.bgmEnabled = !y.bgmEnabled),
        h.bgmToggle(),
        y.bgmEnabled ? b() : T());
    },
    $e = Sr;
  var Lr = {
      MOVE_LEFT: (e, t) => {
        P(-1, 0, t.state);
      },
      MOVE_RIGHT: (e, t) => {
        P(1, 0, t.state);
      },
      MOVE_DOWN: (e, t) => {
        P(0, 1, t.state);
      },
      DROP: (e, t) => {
        qe(t.state);
      },
      ROTATE: (e, t) => {
        ke(t.state);
      },
      RESTART: (e, t) => {
        Ye(t.state);
      },
      QUIT: () => {
        j();
      },
      TOGGLE_PAUSE: () => {
        ne();
      },
      TOGGLE_MUSIC: () => {
        $e();
      },
    },
    je = Lr;
  var vr = {
      TOGGLE_PAUSE: () => {
        ne();
      },
    },
    Je = vr;
  var Tr = () => {
      let { COLS: e, ROWS: t } = v;
      S.board = Array.from({ length: t }, () =>
        Array.from({ length: e }).fill(0),
      );
    },
    Q = Tr;
  var Or = (e) => {
      (T(),
        a.start(),
        Q(),
        a.setMode('main-menu'),
        (e.score = 0),
        (e.lines = 0),
        (e.level = 1),
        (e.next = null),
        I(e.score, e.lines, e.level, e.highScore));
    },
    Ze = Or;
  var yr = {
      CONFIRM: (e, t) => {
        Ze(t.state);
      },
    },
    et = yr;
  var Cr = { 'main-menu': we, playing: je, paused: Je, 'game-over': et },
    Mr = (e, t) => {
      let { type: o, payload: r } = e,
        n = t.getMode(),
        i = Cr[n];
      if (!i) return;
      let l = i[o];
      l?.(r, t);
    },
    tt = Mr;
  var ge = class {
      constructor(t, o = {}) {
        ((this.type = t), (this.payload = o));
      }
      execute(t) {
        tt(this, t);
      }
    },
    ie = ge;
  var Ar = (e) => Math.max(100, 1e3 - (e.level - 1) * 80),
    ot = Ar;
  var Rr = (e) => {
      let t = a.getMode();
      return !(
        t === 'main-menu' ||
        t === 'game-over' ||
        $() ||
        (!P(0, 1, e) && (te(e), h.fall(), re(e), k(e), t === 'game-over'))
      );
    },
    rt = Rr;
  var nt = (e) => {
      a.timestamp || (a.timestamp = e);
      let t = e - a.accumulator,
        o = (e - a.timestamp) / 1e3;
      o > 1e3 && (o = 1e3);
      let r = ot(a.state);
      if (((a.timestamp = e), O.playing)) {
        let { data: n } = O;
        for (; O.cursor < n.length && n[O.cursor].frame === O.frame; ) {
          let i = n[O.cursor];
          (Y.enqueue(new ie(i.cmd.type, i.cmd.payload)), O.cursor++);
        }
      }
      (Y.flush(a),
        a.update(o),
        O.frame++,
        (!a.accumulator || t > r) && (rt(a.state), (a.accumulator = e)),
        a.render(),
        a.animate(),
        (a.rafId = requestAnimationFrame(nt)));
    },
    ee = nt;
  var Br = () => {
      a.rafId &&
        (cancelAnimationFrame(a.rafId),
        (a.rafId = null),
        (a.timestamp = 0),
        (a.accumulator = 0));
    },
    it = Br;
  var br = () => {
      a.resize();
    },
    st = br;
  var Gr = (e) => {
      let { action: t } = e;
      if ($(['countdown', 'level-up']) || !t) return;
      let r = new ie(t);
      (Y.enqueue(r), O.recording && O.data.push({ frame: O.frame, cmd: r }));
    },
    at = Gr;
  var wr = {
      arrowleft: 'MOVE_LEFT',
      arrowright: 'MOVE_RIGHT',
      arrowdown: 'MOVE_DOWN',
      arrowup: 'ROTATE',
      ' ': 'DROP',
      m: 'TOGGLE_MUSIC',
      p: 'TOGGLE_PAUSE',
      r: 'RESTART',
      q: 'QUIT',
      1: 'LEVEL_ONE',
      2: 'LEVEL_TWO',
      3: 'LEVEL_THREE',
      4: 'LEVEL_FOUR',
      5: 'LEVEL_FIVE',
      6: 'LEVEL_SIX',
      7: 'LEVEL_SEVEN',
      8: 'LEVEL_EIGHT',
      9: 'LEVEL_NINE',
      t: 'LEVEL_TEN',
      enter: 'CONFIRM',
    },
    kr = (e) => {
      if (!e) return;
      let t = e.toLowerCase();
      return wr[t];
    },
    mt = kr;
  var Pr = (e) => {
      let t = e.key.toLowerCase(),
        o = mt(t);
      o && at({ type: 'keydown', key: t, action: o });
    },
    ct = Pr;
  var _r = () => {
      (globalThis.addEventListener('resize', st),
        document.addEventListener('keydown', ct));
    },
    lt = _r;
  var Ir = (e) => localStorage.getItem(e),
    ft = Ir;
  var Nr = () => {
      S.highScore = Number.parseInt(ft('tetris-high-score'), 10) || 0;
    },
    xe = Nr;
  var Fr = (e, t) => {
      localStorage.setItem(e, t);
    },
    pt = Fr;
  var zr = () => {
      let { score: e } = S;
      e > S.highScore &&
        ((S.highScore = e), pt('tetris-high-score', S.highScore.toString()));
    },
    dt = zr;
  var Vr = () => S.mode,
    ut = Vr;
  var Hr = (e) => {
      S.level = e;
    },
    ht = Hr;
  var Dr = () => {
      let { GREEN: e } = f,
        { gameBoard: t } = m,
        { width: o, height: r } = t;
      x({
        text: 'LEVEL',
        x: o / 2,
        y: r * 0.35,
        color: e,
        size: 1,
        center: !0,
      });
    },
    gt = Dr;
  var Wr = () => {
      let { WHITE: e } = f,
        { gameBoard: t } = m,
        { width: o, height: r } = t;
      x({
        text: '1-9 or T KEY',
        x: o / 2,
        y: r * 0.58,
        color: e,
        size: 1,
        center: !0,
      });
    },
    xt = Wr;
  var Ur = () => {
      let { TEAL: e } = f,
        { gameBoard: t } = m,
        { width: o, height: r } = t;
      x({
        text: 'ENTER START',
        x: o / 2,
        y: r * 0.7,
        color: e,
        size: 1.15,
        center: !0,
      });
    },
    se = Ur;
  var qr = (e) => {
      let { gameBoard: t } = m,
        { height: o } = t;
      (A(), B(), R(), gt(), oe(e, o * 0.5), xt(), se());
    },
    X = qr;
  var Yr = (e) => {
      document?.fonts?.load
        ? document.fonts.load('40px "Press Start 2P"').then(() => {
            X(e.level);
          })
        : setTimeout(() => {
            X(e.level);
          }, 150);
    },
    Et = Yr;
  var Kr = (e) => {
      X(e.level);
    },
    St = Kr;
  var Qr = () => {
      let { YELLOW: e } = f,
        { gameBoard: t } = m,
        { width: o, height: r } = t;
      x({
        text: 'PAUSED',
        x: o / 2,
        y: r / 1.45,
        color: e,
        size: 1.6,
        center: !0,
      });
    },
    Lt = Qr;
  var Xr = (e, t = 'yyyy-MM-dd HH:mm:ss') => {
      let o = e.getFullYear(),
        r = e.getMonth() + 1,
        n = e.getDate(),
        i = e.getHours(),
        l = e.getMinutes(),
        p = e.getSeconds(),
        s = () => (i >= 12 ? 'PM' : 'AM'),
        c = t.includes('a'),
        g = i % 12 || 12,
        L = {
          yyyy: o,
          MM: C(r, 2),
          dd: C(n, 2),
          HH: C(i, 2),
          hh: C(g, 2),
          mm: C(l, 2),
          ss: C(p, 2),
          a: c ? s() : '',
        },
        u = t;
      for (let E of Object.keys(L)) u = u.replace(new RegExp(E, 'g'), L[E]);
      return u;
    },
    vt = Xr;
  var $r = (e, t = 'HH:mm:ss') => {
      let { GREEN: o } = f,
        { gameBoard: r } = m,
        { width: n, height: i } = r,
        l = vt(new Date(), t);
      x({
        text: l,
        x: n / 2,
        y: i / 3.65,
        color: e || o,
        size: 0.86,
        center: !0,
      });
    },
    Tt = $r;
  var jr = (e) => {
      let t = e.getHours(),
        o = e.getMinutes(),
        r = e.getSeconds(),
        n = ((t % 12) + o / 60 + r / 3600) * ((2 * Math.PI) / 12),
        i = (o + r / 60) * ((2 * Math.PI) / 60),
        l = r * ((2 * Math.PI) / 60);
      return { hAng: n, mAng: i, sAng: l };
    },
    Ot = jr;
  var Jr = () => {
      let e = new Date(),
        { hAng: t, mAng: o, sAng: r } = Ot(e),
        { TEAL: n, RGBA_TEAL: i, ORANGE: l } = f,
        { gameBoard: p, gameBoardContext: s } = m,
        { width: c, height: g } = p,
        L = c / 2,
        u = g / 2.2,
        E = Math.floor(c * 0.25);
      (s.save(),
        s.translate(L, u),
        (s.lineCap = 'round'),
        s.beginPath(),
        s.arc(0, 0, E, 0, Math.PI * 2),
        (s.fillStyle = i),
        s.fill(),
        (s.lineWidth = Math.floor(c * 0.06)),
        (s.strokeStyle = n),
        s.stroke());
      let F = Math.floor(c * 0.016),
        z = E - Math.floor(c * 0.08);
      for (let ae = 0; ae < 12; ae++)
        (s.save(),
          s.rotate((ae * Math.PI) / 6),
          s.beginPath(),
          s.arc(0, -z, F, 0, Math.PI * 2),
          (s.fillStyle = n),
          s.fill(),
          s.restore());
      (s.save(),
        s.rotate(t),
        (s.lineWidth = 5),
        s.beginPath(),
        s.moveTo(0, 0),
        s.lineTo(0, -E * 0.4),
        s.stroke(),
        s.restore(),
        s.save(),
        s.rotate(o),
        (s.lineWidth = 4),
        s.beginPath(),
        s.moveTo(0, 0),
        s.lineTo(0, -E * 0.65),
        s.stroke(),
        s.restore(),
        s.save(),
        s.rotate(r),
        (s.strokeStyle = l),
        (s.lineWidth = 2),
        s.beginPath(),
        s.moveTo(0, 0),
        s.lineTo(0, -E * 0.75),
        s.stroke(),
        s.restore(),
        s.beginPath(),
        (s.fillStyle = l),
        s.arc(0, 0, Math.floor(c * 0.014), 0, Math.PI * 2),
        s.fill(),
        s.restore());
    },
    yt = Jr;
  function Zr(e) {
    let { ROWS: t, COLS: o } = v,
      { gameBoardContext: r } = m;
    A();
    for (let n = 0; n < t; n++)
      for (let i = 0; i < o; i++) e[n][i] && W(r, i, n, e[n][i]);
  }
  var Ct = Zr;
  var en = (e, t, o) => {
      let { gameBoardContext: r } = m,
        { shape: n, color: i } = e,
        { length: l } = n;
      for (let p = 0; p < l; p++)
        for (let s = 0; s < n[p].length; s++) n[p][s] && W(r, t + s, o + p, i);
      return !0;
    },
    Mt = en;
  var tn = (e) => {
      let { board: t, curr: o, cx: r, cy: n } = e;
      (t && Ct(t), o && Mt(o, r, n));
    },
    q = tn;
  var on = (e) => {
      (A(), q(e), B(), R(), Tt(), yt(), Lt());
    },
    At = on;
  var rn = (e) => {
      At(e);
    },
    Rt = rn;
  var nn = () => {
      let { RED: e, YELLOW: t } = f,
        { gameBoard: o } = m,
        { width: r, height: n } = o;
      x({
        text: 'GAME',
        x: r / 2,
        y: n / 2.2,
        color: e,
        strokeColor: t,
        size: 2.3,
        center: !0,
        stroke: !0,
      });
    },
    Bt = nn;
  var sn = () => {
      let { RED: e, YELLOW: t } = f,
        { gameBoard: o } = m,
        { width: r, height: n } = o;
      x({
        text: 'OVER',
        x: r / 2,
        y: n / 1.8,
        color: e,
        strokeColor: t,
        size: 2.3,
        center: !0,
        stroke: !0,
      });
    },
    bt = sn;
  var an = (e) => {
      (A(), q(e), B(), R(), Bt(), bt(), se());
    },
    Gt = an;
  var mn = (e) => {
      Gt(e);
    },
    wt = mn;
  var cn = (e) => {
      (q(e), J(e));
    },
    kt = cn;
  var ln = (e) => {
      kt(e);
    },
    Pt = ln;
  var fn = {
      'main-menu': (e) => {
        St(e);
      },
      paused: (e) => {
        Rt(e);
      },
      'game-over': (e) => {
        wt(e);
      },
      playing: (e) => {
        Pt(e);
      },
    },
    _t = fn;
  var pn = (e) => {
      let t = a.getMode(),
        o = _t[t];
      o && o(e);
    },
    It = pn;
  var dn = () => {
      let { ROWS: e, COLS: t } = v,
        { gameBoard: o, nextPiece: r } = m,
        n = globalThis.innerHeight * 0.9;
      ((m.blockSize = Math.floor(n / e)),
        (o.width = m.blockSize * t),
        (o.height = m.blockSize * e),
        (m.fontSize = Math.floor(o.height * 0.032)));
      let i = Math.min(
        globalThis.innerWidth * 0.1,
        globalThis.innerHeight * 0.18,
      );
      ((r.width = i), (r.height = i));
    },
    Nt = dn;
  var N = {
      rafId: null,
      accumulator: 0,
      lastTimestamp: 0,
      state: S,
      resetBoard: Q,
      loadHighScore: xe,
      saveHighScore: dt,
      getMode: ut,
      setMode: K,
      setLevel: ht,
      launch: () => {
        let { state: e } = N;
        (Q(),
          xe(),
          K('main-menu'),
          (e.score = 0),
          (e.lines = 0),
          (e.level = 1),
          N.resize(),
          I(e.score, e.lines, e.level, e.highScore),
          Et(e),
          lt(),
          N.start());
      },
      start: () => {
        N.rafId = requestAnimationFrame(ee);
      },
      stop: () => {
        it();
      },
      restart: () => {
        Z();
      },
      render: () => {
        It(N.state);
      },
      update: (e) => {
        Ee(e);
      },
      animate: () => {
        Se();
      },
      resize: () => {
        (Nt(), N.render());
      },
    },
    a = N;
  var un = () => {
      a.launch();
    },
    Ft = un;
  Ft();
})();
//# sourceMappingURL=tetris.js.map
