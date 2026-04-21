var tetris = (() => {
  var Ut = {
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
      gravityEnabled: !0,
    },
    v = Ut;
  var qt = {
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
    O = qt;
  var Yt = {
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
    Y = Yt;
  var H = [],
    A = (e) => {
      H.push(e);
    },
    Le = (e) => {
      for (let t = H.length - 1; t >= 0; t--) H[t].update(e) || H.splice(t, 1);
    },
    ye = () => {
      let e = H.slice().toSorted((t, o) => t.layer - o.layer);
      for (let t of e) t.render();
    },
    X = (e = []) =>
      H.some((t) => {
        let o = t.blocking;
        return e && e.length > 0 ? o && e.includes(t.name) : o;
      });
  var le = new AudioContext(),
    Kt = (e, t, o = 0.1, r = 'square') => {
      let n = le.createOscillator(),
        i = le.createGain();
      ((n.type = r),
        (n.frequency.value = e),
        (i.gain.value = o),
        n.connect(i),
        i.connect(le.destination),
        n.start(),
        setTimeout(() => {
          (n.stop(), n.disconnect(), i.disconnect());
        }, t));
    },
    x = Kt;
  var $t = {
      levelSelect: () => x(523, 80, 0.1, 'sine'),
      levelStart: () => x(1319, 160, 0.22, 'sine'),
      countdown: () => x(784, 180, 0.3, 'sine'),
      move: () => x(330, 60),
      rotate: () => x(440, 60),
      drop: () => x(220, 100),
      fall: () => x(180, 200),
      clear: (e = 0) => {
        let t = [
            [440, 587, 698],
            [587, 698, 880],
            [698, 880, 1174],
            [587, 880, 1174],
            [440, 880, 1174],
          ],
          o = [260, 300, 380],
          r = [0.32, 0.3, 0.25],
          n = [160, 320, 480],
          i = t[e];
        for (let [a, c] of i.entries())
          setTimeout(() => x(c, o[a], r[a], 'square'), n[a]);
      },
      levelUp: () => {
        (x(523, 220),
          setTimeout(() => x(587, 220), 260),
          setTimeout(() => x(659, 240), 520),
          setTimeout(() => x(784, 260), 780),
          setTimeout(() => x(880, 280), 1060),
          setTimeout(() => x(1047, 320), 1360),
          setTimeout(() => x(1175, 360), 1700),
          setTimeout(() => x(1319, 480), 2080));
      },
      pause: () => x(300, 150),
      secondTick: () => x(880, 50, 0.085, 'sine'),
      resume: () => x(400, 150),
      gameOver: () => {
        (x(330, 200),
          setTimeout(() => x(294, 300), 210),
          setTimeout(() => x(262, 500), 520));
      },
      bgmToggle: () => x(440, 100),
    },
    h = $t;
  var Oe = document.querySelector('#game-board'),
    Qt = Oe.getContext('2d'),
    Te = document.querySelector('#next-piece'),
    Xt = Te.getContext('2d'),
    jt = 0,
    Jt = 0,
    Zt = {
      gameBoard: Oe,
      gameBoardContext: Qt,
      nextPiece: Te,
      nextPieceContext: Xt,
      fontSize: jt,
      blockSize: Jt,
    },
    f = Zt;
  function eo() {
    let { gameBoard: e, gameBoardContext: t } = f,
      { width: o, height: r } = e;
    t.clearRect(0, 0, o, r);
  }
  var R = eo;
  var to = '#18c8fa',
    oo = 'rgba(50, 190, 239, 0.3)',
    ro = '#ff0',
    no = '#a0a',
    io = '#00f',
    so = '#ff7f00',
    ao = '#0f0',
    mo = '#f00',
    co = '#444',
    lo = 'rgba(0,0,0,.5)',
    fo = '#fff',
    po = {
      TEAL: to,
      RGBA_TEAL: oo,
      YELLOW: ro,
      PURPLE: no,
      BLUE: io,
      ORANGE: so,
      GREEN: ao,
      RED: mo,
      BLACK: co,
      RGBA_BLACK: lo,
      WHITE: fo,
    },
    p = po;
  var uo = [0, 100, 300, 500, 800, 1200],
    ho = '"Press Start 2P", monospace, sans-serif',
    go = 99,
    xo = { CLEAR_SCORES: uo, MAX_LEVEL: go, FONT_FAMILY: ho },
    W = xo;
  var So = (e) => {
      let {
          text: t,
          x: o,
          y: r,
          color: n,
          strokeColor: i,
          size: a = 1,
          center: c = !0,
          baseline: s = '',
          stroke: l = !1,
          lineWidth: g = 2,
        } = e,
        { FONT_FAMILY: d } = W,
        { gameBoardContext: u, fontSize: S } = f;
      (u.save(),
        c && (u.textAlign = 'center'),
        s && (u.textBaseline = s),
        (u.font = `${S * a}px ${d}`),
        l &&
          ((u.strokeStyle = i || n), (u.lineWidth = g), u.strokeText(t, o, r)),
        (u.fillStyle = n),
        u.fillText(t, o, r),
        u.restore());
    },
    E = So;
  var Eo = () => {
      let { GREEN: e } = p,
        { gameBoard: t } = f,
        { width: o, height: r } = t;
      E({ text: 'TETRIS.JS', x: o / 2, y: r * 0.1, color: e, size: 1.1 });
    },
    B = Eo;
  var vo = (e) => {
      let { RGBA_BLACK: t } = p,
        { gameBoard: o, gameBoardContext: r } = f,
        { width: n, height: i } = o;
      (r.save(), (r.fillStyle = e || t), r.fillRect(0, 0, n, i), r.restore());
    },
    b = vo;
  var Lo = (e, t = 1) => {
      let { YELLOW: o, BLACK: r } = p,
        { FONT_FAMILY: n } = W,
        { gameBoard: i, gameBoardContext: a, fontSize: c } = f,
        { width: s, height: l } = i;
      (a.save(),
        (a.textAlign = 'center'),
        (a.textBaseline = 'middle'),
        a.translate(s / 2, l / 2),
        a.scale(t, t),
        (a.font = `${c * 3.25}px ${n}`),
        (a.fillStyle = o),
        (a.strokeStyle = r),
        (a.lineWidth = 6));
      let g = String(e);
      (a.strokeText(g, 0, 0), a.fillText(g, 0, 0), a.restore());
    },
    Ce = Lo;
  var yo = () => {
      let { GREEN: e, BLACK: t } = p,
        { gameBoard: o } = f,
        { width: r, height: n } = o;
      E({
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
    Me = yo;
  var Oo = (e) => {
      let { number: t, scale: o } = e;
      (R(), b(), B(), Me(), Ce(t, o));
    },
    fe = Oo;
  var To = new Set(['main-menu', 'playing', 'paused', 'game-over']),
    Co = (e) => {
      !To.has(e) || v.mode === e || (v.mode = e);
    },
    K = Co;
  var Mo = { bgmEnabled: !0, bgmTimer: null },
    T = Mo;
  var Ae = (e, t) => {
      (e >= t.length && (e = 0),
        x(t[e], 110, 0.05),
        (T.bgmTimer = setTimeout(() => {
          Ae(e + 1, t);
        }, 130)));
    },
    Re = Ae;
  var Ao = () => {
      (T.bgmTimer && clearTimeout(T.bgmTimer), (T.bgmTimer = null));
    },
    y = Ao;
  var Ro = () => {
      let e = [
        659, 659, 587, 659, 784, 880, 523, 523, 440, 523, 659, 784, 659, 659,
        587, 659, 784, 880, 988, 880, 784, 659, 880, 784, 659, 587, 523, 587,
        659, 784, 659, 587,
      ];
      if (!T.bgmEnabled) return !1;
      (y(), Re(0, e));
    },
    G = Ro;
  var Bo = { COLS: 10, ROWS: 20 },
    L = Bo;
  var {
      BLUE: bo,
      TEAL: Be,
      YELLOW: Go,
      PURPLE: wo,
      ORANGE: ko,
      GREEN: Po,
      RED: Io,
    } = p,
    _o = [
      { shape: [[1, 1, 1, 1]], color: Be },
      { shape: [[1, 1, 1, 1, 1]], color: Be },
      {
        shape: [
          [1, 1],
          [1, 1],
        ],
        color: Go,
      },
      {
        shape: [
          [0, 1, 0],
          [1, 1, 1],
        ],
        color: wo,
      },
      {
        shape: [
          [1, 0, 0],
          [1, 1, 1],
        ],
        color: bo,
      },
      {
        shape: [
          [0, 0, 1],
          [1, 1, 1],
        ],
        color: ko,
      },
      {
        shape: [
          [0, 1, 1],
          [1, 1, 0],
        ],
        color: Po,
      },
      {
        shape: [
          [1, 1, 0],
          [0, 1, 1],
        ],
        color: Io,
      },
    ],
    pe = _o;
  function No() {
    let e = Math.floor(Math.random() * pe.length),
      t = pe[e];
    return { ...t, shape: t.shape.map((o) => [...o]) };
  }
  var de = No;
  var Fo = (e, t, o) => {
      let { ROWS: r, COLS: n } = L,
        { curr: i, cx: a, cy: c, board: s } = o;
      if (!i) return !1;
      let l = i.shape;
      for (let g = 0; g < l.length; g++)
        for (let d = 0; d < l[g].length; d++)
          if (l[g][d]) {
            let u = a + d + e,
              S = c + g + t,
              z = u < 0 || u >= n || S >= r,
              V = S >= 0 && S < r && s[S][u];
            if (z || V) return !0;
          }
      return !1;
    },
    D = Fo;
  var zo = () => {
      let e = m.getMode();
      if (e === 'game-over' || e === 'paused' || e === 'main-menu') return !1;
      (m.setMode('game-over'), m.saveHighScore(), y(), h.gameOver());
    },
    j = zo;
  var Vo = () => {
      let { nextPiece: e, nextPieceContext: t } = f,
        { width: o, height: r } = e;
      t.clearRect(0, 0, o, r);
    },
    be = Vo;
  var Ho = (e) => {
      let { next: t } = e,
        { BLACK: o } = p,
        { nextPiece: r, nextPieceContext: n } = f,
        { width: i, height: a } = r;
      if (!t) return;
      let { shape: c } = t,
        l = Math.floor(i / 5),
        g = Math.floor((i - c[0].length * l) / 2),
        d = Math.floor((a - c.length * l) / 2);
      be();
      for (let u = 0; u < c.length; u++)
        for (let S = 0; S < c[u].length; S++) {
          if (!c[u][S]) continue;
          let z = g + S * l,
            V = d + u * l;
          ((n.fillStyle = t.color),
            n.fillRect(z, V, l - 2, l - 2),
            (n.strokeStyle = o),
            n.strokeRect(z, V, l - 2, l - 2));
        }
    },
    J = Ho;
  var Wo = (e) => {
      let { COLS: t } = L;
      ((e.curr = e.next
        ? { ...e.next, shape: e.next.shape.map((o) => [...o]) }
        : de()),
        (e.next = de()),
        (e.cx = Math.floor(t / 2) - Math.floor(e.curr.shape[0].length / 2)),
        (e.cy = 0),
        J(e.next),
        D(0, 0, e) && j());
    },
    k = Wo;
  var Do = () => {
      (m.stop(), (m.rafId = requestAnimationFrame(ee)));
    },
    Z = Do;
  var Uo = (e, t) => {
      let o = Number(e);
      if (!Number.isFinite(o)) return '';
      let r = Math.max(0, Math.floor(t)),
        n = o < 0 ? '-' : '',
        i = Math.abs(o).toString();
      return n + i.padStart(r, '0');
    },
    C = Uo;
  var qo = (e) => {
      let t = document.querySelector('#level');
      (t && (t.textContent = C(e.level, 2)),
        m.setMode('playing'),
        k(e),
        h.levelStart(),
        setTimeout(() => {
          G();
        }, 250),
        (m.rafId = requestAnimationFrame(Z)));
    },
    Ge = qo;
  var Yo = (e) => {
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
                fe(t),
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
          (K('playing'), Ge(e));
        },
        render() {
          fe(t);
        },
      };
    },
    we = Yo;
  var Ko = () => {
      A(we(m.state));
    },
    ke = Ko;
  var $o = (e) => {
      ((e.baseLines = (e.level - 1) * 10), ke());
    },
    Pe = $o;
  var Qo = (e) => {
      (m.setLevel(e), h.levelSelect());
    },
    M = Qo;
  var Xo = {
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
        Pe(t.state);
      },
    },
    Ie = Xo;
  var jo = (e, t, o) =>
      D(e, t, o) ? !1 : ((o.cx += e), (o.cy += t), h.move(), !0),
    P = jo;
  var Jo = (e) => {
      let { curr: t } = e;
      if (!t) return;
      let o = t.shape;
      ((t.shape = o[0].map((r, n) => o.map((i) => i[n]).toReversed())),
        D(0, 0, e) ? (t.shape = o) : h.rotate());
    },
    _e = Jo;
  var Zo = (e) => {
      let { curr: t } = e,
        o = t.shape;
      for (let r = 0; r < o.length; r++)
        for (let n = 0; n < o[r].length; n++)
          o[r][n] && (e.board[e.cy + r][e.cx + n] = t.color);
    },
    te = Zo;
  var er = (e, t, o, r) => {
      let { BLACK: n } = p,
        { blockSize: i } = f,
        a = i,
        c = 1,
        s = a - c * 2,
        l = t * a + c,
        g = o * a + c;
      ((e.fillStyle = r),
        e.fillRect(l, g, s, s),
        (e.strokeStyle = n),
        e.strokeRect(l, g, s, s));
    },
    N = er;
  var tr = (e) => {
      let { COLS: t } = L,
        { gameBoardContext: o } = f;
      for (let r of e.lines) {
        (o.save(), (o.globalAlpha = r.alpha));
        for (let n = 0; n < t; n++) N(o, n, r.y, r.color);
        o.restore();
      }
    },
    Ne = tr;
  var or = {
      score: document.querySelector('#score'),
      lines: document.querySelector('#lines'),
      level: document.querySelector('#level'),
      highScore: document.querySelector('#highScore'),
    },
    w = or;
  var rr = (e, t, o, r, n) => {
      let i = null;
      if (e === t) return null;
      let a = 0,
        c = 0,
        s = (l) => {
          c || (c = l);
          let g = l - c;
          ((c = l), (a += g));
          let d = Math.min(a / o, 1),
            u = Math.floor(e + (t - e) * d);
          (r(u, i),
            d < 1
              ? (i = requestAnimationFrame(s))
              : (cancelAnimationFrame(i), n?.()));
        };
      return (
        (i = requestAnimationFrame(s)),
        { cancel: () => cancelAnimationFrame(i) }
      );
    },
    Fe = rr;
  var I = (e, t, o = 0) => (e.textContent = o ? C(t, o) : String(t)),
    nr = () => {
      let e = { score: 0, lines: 0, level: 1, highScore: 0 },
        t = { score: 0 },
        o = { score: !1 },
        r = (l) => {
          ((t.score = l),
            !o.score &&
              ((o.score = !0),
              Fe(
                e.score,
                t.score,
                300,
                (g) => {
                  I(w.score, g, 5);
                },
                () => {
                  ((e.score = t.score),
                    (o.score = !1),
                    e.score !== t.score && r(t.score));
                },
              )));
        },
        n = (l) => {
          l !== e.lines && (I(w.lines, l, 2), (e.lines = l));
        },
        i = (l) => {
          l !== e.level && (I(w.level, l, 2), (e.level = l));
        },
        a = (l) => {
          l !== e.highScore && (I(w.highScore, l, 5), (e.highScore = l));
        };
      return {
        update: (l) => {
          (r(l.score), n(l.lines), i(l.level), a(l.highScore));
        },
        reset: () => {
          ((e.score = e.lines = e.level = e.highScore = 0),
            (o.score = !1),
            I(w.score, 0, 5),
            I(w.lines, 0, 2),
            I(w.level, 1, 2),
            I(w.highScore, 0, 5));
        },
      };
    },
    ze = nr;
  var ir = (e, t, o, r, n = !1) => {
      let i = ze();
      ((m.getMode() === 'main-menu' || n) && i.reset(),
        i.update({ score: e, lines: t, level: o, highScore: r }));
    },
    _ = ir;
  var { TEAL: sr, YELLOW: ar, PURPLE: mr, ORANGE: cr, GREEN: lr, RED: fr } = p,
    pr = [sr, ar, mr, cr, lr, fr],
    ue = pr;
  var dr = (e) => {
      let { gameBoardContext: t } = f;
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
    Ve = dr;
  var ur = () => {
      let { GREEN: e } = p,
        { gameBoard: t } = f,
        { width: o, height: r } = t;
      E({
        text: 'LEVEL UP',
        x: o / 2,
        y: r / 2.5,
        color: e,
        size: 1.2,
        center: !0,
      });
    },
    He = ur;
  var hr = (e, t) => {
      let { GREEN: o } = p,
        { gameBoard: r } = f,
        { width: n } = r;
      E({ text: String(e), x: n / 2, y: t, color: o, size: 3, center: !0 });
    },
    oe = hr;
  var gr = () => {
      let { YELLOW: e, BLACK: t } = p,
        { gameBoard: o } = f,
        { width: r, height: n } = o;
      E({
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
    We = gr;
  function xr(e, t) {
    let { gameBoard: o } = f,
      { height: r } = o;
    (b(), B(), He(), oe(e, r / 1.85), We(), Ve(t));
  }
  var De = xr;
  var he = class {
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
        let { width: t, height: o } = f.gameBoard,
          r = [];
        for (let n = 0; n < 40; n++) {
          let i = Math.random() * Math.PI * 2,
            a = 5 + Math.random() * 15;
          r.push({
            x: t / 2,
            y: o / 2 - 60,
            vx: Math.cos(i) * a,
            vy: Math.sin(i) * a,
            radius: 3 + Math.random() * 4,
            color: ue[Math.floor(Math.random() * ue.length)],
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
        G();
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
        De(r, t);
      }
    },
    Ue = he;
  var Sr = () => {
      let { state: e } = m;
      (y(), h.levelUp(), A(new Ue(e)));
    },
    qe = Sr;
  function Er(e, t = {}) {
    let { ROWS: o, COLS: r } = L,
      { gameBoardContext: n } = f,
      { overrideCells: i = [] } = t;
    R();
    let a = new Set();
    for (let c of i) Number.isInteger(c.fromY) && a.add(`${c.x},${c.fromY}`);
    for (let c = 0; c < o; c++)
      for (let s = 0; s < r; s++)
        e[c][s] && (a.has(`${s},${c}`) || N(n, s, c, e[c][s]));
    for (let c of i) N(n, c.x, c.y, c.value);
  }
  var re = Er;
  var vr = (e) => {
      let t = e.length,
        o = e[0].length,
        r = !1;
      for (let n = 0; n < o; n++) {
        let i = [];
        for (let c = t - 1; c >= 0; c--) e[c][n] && i.push(e[c][n]);
        let a = 0;
        for (let c = t - 1; c >= 0; c--) {
          let s = i[a++] || 0;
          (e[c][n] !== s && (r = !0), (e[c][n] = s));
        }
      }
      return r;
    },
    Ye = vr;
  var Lr = (e) => {
      let t = [];
      for (let o = 0; o < e.length; o++) e[o].every(Boolean) && t.push(o);
      return t;
    },
    Ke = Lr;
  var ge = class {
      constructor(t) {
        ((this.state = t),
          (this.layer = 150),
          (this.blocking = !0),
          (this.name = 'fall'),
          (this.duration = 0.15),
          (this.timer = 0),
          (this.animations = []),
          this.capture());
      }
      capture() {
        let { board: t } = this.state,
          o = t.length,
          r = t[0].length,
          n = t.map((a) => [...a]),
          i = t.map((a) => [...a]);
        Ye(i);
        for (let a = 0; a < r; a++) {
          let c = [],
            s = [];
          for (let d = 0; d < o; d++) (c.push(n[d][a]), s.push(i[d][a]));
          let l = [],
            g = [];
          for (let d = 0; d < o; d++)
            (c[d] && l.push({ y: d, value: c[d] }),
              s[d] && g.push({ y: d, value: s[d] }));
          for (let d = 0; d < l.length; d++) {
            let u = l[d],
              S = g[d];
            S &&
              u.y !== S.y &&
              this.animations.push({
                x: a,
                fromY: u.y,
                toY: S.y,
                value: u.value,
              });
          }
        }
        this.state.board = i;
      }
      update(t) {
        return (
          (this.timer += t),
          this.timer >= this.duration ? (this.stop(), !1) : !0
        );
      }
      render() {
        let t = Math.min(this.timer / this.duration, 1),
          o = 1 - Math.pow(1 - t, 3);
        re(this.state.board, {
          overrideCells: this.animations.map((r) => ({
            x: r.x,
            y: r.fromY + (r.toY - r.fromY) * o,
            value: r.value,
          })),
        });
      }
      stop() {
        let { state: t } = this,
          o = Ke(t.board);
        o.length > 0 && ne(o);
      }
    },
    $e = ge;
  var yr = () => {
      let { state: e } = m,
        t = new $e(e);
      A(t);
    },
    Qe = yr;
  var xe = class {
      constructor(t, o) {
        ((this.lines = t.map((r) => ({ y: r, alpha: 1, timer: 0 }))),
          (this.state = o),
          (this.layer = 200),
          (this.blocking = !0),
          (this.name = 'clear-lines'),
          h.clear(t.length - 1));
      }
      update(t) {
        let o = !0;
        for (let r of this.lines) {
          let n = Math.floor(r.timer / 0.12);
          ((r.alpha = n % 2 === 0 ? 1 : 0),
            (r.timer += t),
            r.timer < 0.72 && (o = !1));
        }
        return o ? (this.stop(), !1) : !0;
      }
      stop() {
        let { ROWS: t, COLS: o } = L,
          { CLEAR_SCORES: r, MAX_LEVEL: n } = W,
          { state: i } = this,
          a = 0;
        for (let l = t - 1; l >= 0; l--)
          i.board[l].every(Boolean) &&
            (i.board.splice(l, 1),
            i.board.unshift(Array.from({ length: o }).fill(0)),
            a++,
            l++);
        ((i.lines += a),
          (i.score += r[a] * i.level),
          i.gravityEnabled && Qe(i));
        let c = i.baseLines + i.lines,
          s = Math.floor(c / 10) + 1;
        (s > i.level && qe(),
          (i.level = Math.min(Math.max(i.level, s), n)),
          _(i.score, i.lines, i.level, i.highScore));
      }
      render() {
        Ne({ lines: this.lines });
      }
    },
    Xe = xe;
  var Or = (e) => {
      let t = new Xe(e, m.state);
      A(t);
    },
    ne = Or;
  var Tr = (e) => {
      let { ROWS: t } = L,
        o = 0,
        r = [];
      for (let n = t - 1; n >= 0; n--)
        e.board[n].every((a) => !!a) && (r.push(n), o++);
      return o === 0 ? (m.saveHighScore(), !1) : (ne(r), !0);
    },
    ie = Tr;
  var Cr = (e) => {
      for (; P(0, 1, e); );
      (te(e), h.fall(), ie(e), k(e), h.drop());
    },
    je = Cr;
  var Mr = (e) => {
      let t = m.getMode();
      t === 'paused' ||
        t === 'game-over' ||
        t === 'main-menu' ||
        (y(),
        m.setMode('playing'),
        (e.score = 0),
        (e.lines = 0),
        (e.level = 1),
        m.resetBoard(),
        _(e.score, e.lines, e.level, e.highScore, !0),
        k(e),
        G(),
        m.restart());
    },
    Je = Mr;
  var Se = class {
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
    Ze = Se;
  var U = null,
    et = () => {
      U || ((U = new Ze()), A(U));
    },
    tt = () => {
      U && (U.stop(), (U = null));
    };
  var Ar = () => {
      let e = m.getMode();
      if (e === 'game-over' || e === 'main-menu') return !1;
      e === 'playing'
        ? (m.setMode('paused'), y(), h.pause(), et())
        : (tt(), m.setMode('playing'), h.resume(), G(), m.restart());
    },
    se = Ar;
  var Rr = () => {
      let e = m.getMode();
      e === 'main-menu' ||
        e === 'paused' ||
        e === 'game-over' ||
        ((T.bgmEnabled = !T.bgmEnabled),
        h.bgmToggle(),
        T.bgmEnabled ? G() : y());
    },
    ot = Rr;
  var Br = {
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
        je(t.state);
      },
      ROTATE: (e, t) => {
        _e(t.state);
      },
      RESTART: (e, t) => {
        Je(t.state);
      },
      QUIT: () => {
        j();
      },
      TOGGLE_PAUSE: () => {
        se();
      },
      TOGGLE_MUSIC: () => {
        ot();
      },
    },
    rt = Br;
  var br = {
      TOGGLE_PAUSE: () => {
        se();
      },
    },
    nt = br;
  var Gr = () => {
      let { COLS: e, ROWS: t } = L;
      v.board = Array.from({ length: t }, () =>
        Array.from({ length: e }).fill(0),
      );
    },
    $ = Gr;
  var wr = (e) => {
      (y(),
        m.start(),
        $(),
        m.setMode('main-menu'),
        (e.score = 0),
        (e.lines = 0),
        (e.level = 1),
        (e.next = null),
        _(e.score, e.lines, e.level, e.highScore));
    },
    it = wr;
  var kr = {
      CONFIRM: (e, t) => {
        it(t.state);
      },
    },
    st = kr;
  var Pr = { 'main-menu': Ie, playing: rt, paused: nt, 'game-over': st },
    Ir = (e, t) => {
      let { type: o, payload: r } = e,
        n = t.getMode(),
        i = Pr[n];
      if (!i) return;
      let a = i[o];
      a?.(r, t);
    },
    at = Ir;
  var Ee = class {
      constructor(t, o = {}) {
        ((this.type = t), (this.payload = o));
      }
      execute(t) {
        at(this, t);
      }
    },
    ae = Ee;
  var _r = (e) => Math.max(100, 1e3 - (e.level - 1) * 80),
    mt = _r;
  var Nr = (e) => {
      let t = m.getMode();
      return !(
        t === 'main-menu' ||
        t === 'game-over' ||
        X() ||
        (!P(0, 1, e) && (te(e), h.fall(), ie(e), k(e), t === 'game-over'))
      );
    },
    ct = Nr;
  var lt = (e) => {
      m.timestamp || (m.timestamp = e);
      let t = e - m.accumulator,
        o = (e - m.timestamp) / 1e3;
      o > 1e3 && (o = 1e3);
      let r = mt(m.state);
      if (((m.timestamp = e), O.playing)) {
        let { data: n } = O;
        for (; O.cursor < n.length && n[O.cursor].frame === O.frame; ) {
          let i = n[O.cursor];
          (Y.enqueue(new ae(i.cmd.type, i.cmd.payload)), O.cursor++);
        }
      }
      (Y.flush(m),
        m.update(o),
        O.frame++,
        (!m.accumulator || t > r) && (ct(m.state), (m.accumulator = e)),
        m.render(),
        m.animate(),
        (m.rafId = requestAnimationFrame(lt)));
    },
    ee = lt;
  var Fr = () => {
      m.rafId &&
        (cancelAnimationFrame(m.rafId),
        (m.rafId = null),
        (m.timestamp = 0),
        (m.accumulator = 0));
    },
    ft = Fr;
  var zr = () => {
      m.resize();
    },
    pt = zr;
  var Vr = (e) => {
      let { action: t } = e;
      if (X(['countdown', 'level-up']) || !t) return;
      let r = new ae(t);
      (Y.enqueue(r), O.recording && O.data.push({ frame: O.frame, cmd: r }));
    },
    dt = Vr;
  var Hr = {
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
    Wr = (e) => {
      if (!e) return;
      let t = e.toLowerCase();
      return Hr[t];
    },
    ut = Wr;
  var Dr = (e) => {
      let t = e.key.toLowerCase(),
        o = ut(t);
      o && dt({ type: 'keydown', key: t, action: o });
    },
    ht = Dr;
  var Ur = () => {
      (globalThis.addEventListener('resize', pt),
        document.addEventListener('keydown', ht));
    },
    gt = Ur;
  var qr = (e) => localStorage.getItem(e),
    xt = qr;
  var Yr = () => {
      v.highScore = Number.parseInt(xt('tetris-high-score'), 10) || 0;
    },
    ve = Yr;
  var Kr = (e, t) => {
      localStorage.setItem(e, t);
    },
    St = Kr;
  var $r = () => {
      let { score: e } = v;
      e > v.highScore &&
        ((v.highScore = e), St('tetris-high-score', v.highScore.toString()));
    },
    Et = $r;
  var Qr = () => v.mode,
    vt = Qr;
  var Xr = (e) => {
      v.level = e;
    },
    Lt = Xr;
  var jr = () => {
      let { GREEN: e } = p,
        { gameBoard: t } = f,
        { width: o, height: r } = t;
      E({
        text: 'LEVEL',
        x: o / 2,
        y: r * 0.35,
        color: e,
        size: 1,
        center: !0,
      });
    },
    yt = jr;
  var Jr = () => {
      let { WHITE: e } = p,
        { gameBoard: t } = f,
        { width: o, height: r } = t;
      E({
        text: '1-9 or T KEY',
        x: o / 2,
        y: r * 0.58,
        color: e,
        size: 1,
        center: !0,
      });
    },
    Ot = Jr;
  var Zr = () => {
      let { TEAL: e } = p,
        { gameBoard: t } = f,
        { width: o, height: r } = t;
      E({
        text: 'ENTER START',
        x: o / 2,
        y: r * 0.7,
        color: e,
        size: 1.15,
        center: !0,
      });
    },
    me = Zr;
  var en = (e) => {
      let { gameBoard: t } = f,
        { height: o } = t;
      (R(), b(), B(), yt(), oe(e, o * 0.5), Ot(), me());
    },
    Q = en;
  var tn = (e) => {
      document?.fonts?.load
        ? document.fonts.load('40px "Press Start 2P"').then(() => {
            Q(e.level);
          })
        : setTimeout(() => {
            Q(e.level);
          }, 150);
    },
    Tt = tn;
  var on = (e) => {
      Q(e.level);
    },
    Ct = on;
  var rn = () => {
      let { YELLOW: e } = p,
        { gameBoard: t } = f,
        { width: o, height: r } = t;
      E({
        text: 'PAUSED',
        x: o / 2,
        y: r / 1.45,
        color: e,
        size: 1.6,
        center: !0,
      });
    },
    Mt = rn;
  var nn = (e, t = 'yyyy-MM-dd HH:mm:ss') => {
      let o = e.getFullYear(),
        r = e.getMonth() + 1,
        n = e.getDate(),
        i = e.getHours(),
        a = e.getMinutes(),
        c = e.getSeconds(),
        s = () => (i >= 12 ? 'PM' : 'AM'),
        l = t.includes('a'),
        g = i % 12 || 12,
        d = {
          yyyy: o,
          MM: C(r, 2),
          dd: C(n, 2),
          HH: C(i, 2),
          hh: C(g, 2),
          mm: C(a, 2),
          ss: C(c, 2),
          a: l ? s() : '',
        },
        u = t;
      for (let S of Object.keys(d)) u = u.replace(new RegExp(S, 'g'), d[S]);
      return u;
    },
    At = nn;
  var sn = (e, t = 'HH:mm:ss') => {
      let { GREEN: o } = p,
        { gameBoard: r } = f,
        { width: n, height: i } = r,
        a = At(new Date(), t);
      E({
        text: a,
        x: n / 2,
        y: i / 3.65,
        color: e || o,
        size: 0.86,
        center: !0,
      });
    },
    Rt = sn;
  var an = (e) => {
      let t = e.getHours(),
        o = e.getMinutes(),
        r = e.getSeconds(),
        n = ((t % 12) + o / 60 + r / 3600) * ((2 * Math.PI) / 12),
        i = (o + r / 60) * ((2 * Math.PI) / 60),
        a = r * ((2 * Math.PI) / 60);
      return { hAng: n, mAng: i, sAng: a };
    },
    Bt = an;
  var mn = () => {
      let e = new Date(),
        { hAng: t, mAng: o, sAng: r } = Bt(e),
        { TEAL: n, RGBA_TEAL: i, ORANGE: a } = p,
        { gameBoard: c, gameBoardContext: s } = f,
        { width: l, height: g } = c,
        d = l / 2,
        u = g / 2.2,
        S = Math.floor(l * 0.25);
      (s.save(),
        s.translate(d, u),
        (s.lineCap = 'round'),
        s.beginPath(),
        s.arc(0, 0, S, 0, Math.PI * 2),
        (s.fillStyle = i),
        s.fill(),
        (s.lineWidth = Math.floor(l * 0.06)),
        (s.strokeStyle = n),
        s.stroke());
      let z = Math.floor(l * 0.016),
        V = S - Math.floor(l * 0.08);
      for (let ce = 0; ce < 12; ce++)
        (s.save(),
          s.rotate((ce * Math.PI) / 6),
          s.beginPath(),
          s.arc(0, -V, z, 0, Math.PI * 2),
          (s.fillStyle = n),
          s.fill(),
          s.restore());
      (s.save(),
        s.rotate(t),
        (s.lineWidth = 5),
        s.beginPath(),
        s.moveTo(0, 0),
        s.lineTo(0, -S * 0.4),
        s.stroke(),
        s.restore(),
        s.save(),
        s.rotate(o),
        (s.lineWidth = 4),
        s.beginPath(),
        s.moveTo(0, 0),
        s.lineTo(0, -S * 0.65),
        s.stroke(),
        s.restore(),
        s.save(),
        s.rotate(r),
        (s.strokeStyle = a),
        (s.lineWidth = 2),
        s.beginPath(),
        s.moveTo(0, 0),
        s.lineTo(0, -S * 0.75),
        s.stroke(),
        s.restore(),
        s.beginPath(),
        (s.fillStyle = a),
        s.arc(0, 0, Math.floor(l * 0.014), 0, Math.PI * 2),
        s.fill(),
        s.restore());
    },
    bt = mn;
  var cn = (e, t, o) => {
      let { gameBoardContext: r } = f,
        { shape: n, color: i } = e,
        { length: a } = n;
      for (let c = 0; c < a; c++)
        for (let s = 0; s < n[c].length; s++) n[c][s] && N(r, t + s, o + c, i);
      return !0;
    },
    Gt = cn;
  var ln = (e) => {
      let { board: t, curr: o, cx: r, cy: n } = e;
      (t && re(t), o && Gt(o, r, n));
    },
    q = ln;
  var fn = (e) => {
      (R(), q(e), b(), B(), Rt(), bt(), Mt());
    },
    wt = fn;
  var pn = (e) => {
      wt(e);
    },
    kt = pn;
  var dn = () => {
      let { RED: e, YELLOW: t } = p,
        { gameBoard: o } = f,
        { width: r, height: n } = o;
      E({
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
    Pt = dn;
  var un = () => {
      let { RED: e, YELLOW: t } = p,
        { gameBoard: o } = f,
        { width: r, height: n } = o;
      E({
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
    It = un;
  var hn = (e) => {
      (R(), q(e), b(), B(), Pt(), It(), me());
    },
    _t = hn;
  var gn = (e) => {
      _t(e);
    },
    Nt = gn;
  var xn = (e) => {
      (q(e), J(e));
    },
    Ft = xn;
  var Sn = (e) => {
      Ft(e);
    },
    zt = Sn;
  var En = {
      'main-menu': (e) => {
        Ct(e);
      },
      paused: (e) => {
        kt(e);
      },
      'game-over': (e) => {
        Nt(e);
      },
      playing: (e) => {
        zt(e);
      },
    },
    Vt = En;
  var vn = (e) => {
      let t = m.getMode(),
        o = Vt[t];
      o && o(e);
    },
    Ht = vn;
  var Ln = () => {
      let { ROWS: e, COLS: t } = L,
        { gameBoard: o, nextPiece: r } = f,
        n = globalThis.innerHeight * 0.9;
      ((f.blockSize = Math.floor(n / e)),
        (o.width = f.blockSize * t),
        (o.height = f.blockSize * e),
        (f.fontSize = Math.floor(o.height * 0.032)));
      let i = Math.min(
        globalThis.innerWidth * 0.1,
        globalThis.innerHeight * 0.18,
      );
      ((r.width = i), (r.height = i));
    },
    Wt = Ln;
  var F = {
      rafId: null,
      accumulator: 0,
      lastTimestamp: 0,
      state: v,
      resetBoard: $,
      loadHighScore: ve,
      saveHighScore: Et,
      getMode: vt,
      setMode: K,
      setLevel: Lt,
      launch: () => {
        let { state: e } = F;
        ($(),
          ve(),
          K('main-menu'),
          (e.score = 0),
          (e.lines = 0),
          (e.level = 1),
          F.resize(),
          _(e.score, e.lines, e.level, e.highScore),
          Tt(e),
          gt(),
          F.start());
      },
      start: () => {
        F.rafId = requestAnimationFrame(ee);
      },
      stop: () => {
        ft();
      },
      restart: () => {
        Z();
      },
      render: () => {
        Ht(F.state);
      },
      update: (e) => {
        Le(e);
      },
      animate: () => {
        ye();
      },
      resize: () => {
        (Wt(), F.render());
      },
    },
    m = F;
  var yn = () => {
      m.launch();
    },
    Dt = yn;
  Dt();
})();
//# sourceMappingURL=tetris.js.map
