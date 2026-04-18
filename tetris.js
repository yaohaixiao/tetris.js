var tetris = (() => {
  var xt = { rafId: null, accumulator: 0, lastTimestamp: 0 },
    g = xt;
  var Et = {
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
    o = Et;
  var Lt = { COLS: 10, ROWS: 20 },
    L = Lt;
  var pe = document.querySelector('#game-board'),
    vt = pe.getContext('2d'),
    de = document.querySelector('#next-piece'),
    Tt = de.getContext('2d'),
    At = 0,
    Mt = 0,
    Ot = {
      gameBoard: pe,
      gameBoardContext: vt,
      nextPiece: de,
      nextPieceContext: Tt,
      fontSize: At,
      blockSize: Mt,
    },
    f = Ot;
  var yt = () => {
      let { ROWS: e, COLS: t } = L,
        { gameBoard: n, nextPiece: i } = f,
        m = globalThis.innerHeight * 0.9;
      ((f.blockSize = Math.floor(m / e)),
        (n.width = f.blockSize * t),
        (n.height = f.blockSize * e),
        (f.fontSize = Math.floor(n.height * 0.032)));
      let s = Math.min(
        globalThis.innerWidth * 0.1,
        globalThis.innerHeight * 0.18,
      );
      ((i.width = s), (i.height = s));
    },
    K = yt;
  var Gt = () => o.mode,
    S = Gt;
  var Ct = '#18c8fa',
    Rt = 'rgba(50, 190, 239, 0.3)',
    Bt = '#ff0',
    wt = '#a0a',
    bt = '#00f',
    It = '#ff7f00',
    kt = '#0f0',
    Pt = '#f00',
    _t = '#444',
    Nt = 'rgba(0,0,0,.5)',
    Ft = '#fff',
    Ht = {
      TEAL: Ct,
      RGBA_TEAL: Rt,
      YELLOW: Bt,
      PURPLE: wt,
      BLUE: bt,
      ORANGE: It,
      GREEN: kt,
      RED: Pt,
      BLACK: _t,
      RGBA_BLACK: Nt,
      WHITE: Ft,
    },
    h = Ht;
  var Vt = [0, 100, 300, 500, 800],
    Dt = '"Press Start 2P", monospace, sans-serif',
    Wt = 99,
    $t = { CLEAR_SCORES: Vt, MAX_LEVEL: Wt, FONT_FAMILY: Dt },
    x = $t;
  function zt() {
    let { gameBoard: e, gameBoardContext: t } = f,
      { width: n, height: i } = e;
    t.clearRect(0, 0, n, i);
  }
  var b = zt;
  var Ut = () => {
      let { GREEN: e } = h,
        { FONT_FAMILY: t } = x,
        { gameBoard: n, gameBoardContext: i, fontSize: m } = f,
        { width: s, height: l } = n;
      (i.save(),
        (i.textAlign = 'center'),
        (i.font = `${m * 1.1}px ${t}`),
        (i.fillStyle = e),
        i.fillText('TETRIS.JS', s / 2, l * 0.1),
        i.restore());
    },
    y = Ut;
  var Yt = () => {
      let { TEAL: e } = h,
        { FONT_FAMILY: t } = x,
        { gameBoard: n, gameBoardContext: i, fontSize: m } = f,
        { width: s, height: l } = n;
      (i.save(),
        (i.textAlign = 'center'),
        (i.font = `${m * 1.15}px ${t}`),
        (i.fillStyle = e),
        i.fillText('ENTER START', s / 2, l * 0.7),
        i.restore());
    },
    X = Yt;
  var qt = (e) => {
      let { RGBA_BLACK: t, GREEN: n, WHITE: i } = h,
        { FONT_FAMILY: m } = x,
        { gameBoard: s, gameBoardContext: l, fontSize: a } = f,
        { width: r, height: c } = s;
      (b(),
        l.save(),
        (l.fillStyle = t),
        l.fillRect(0, 0, r, c),
        y(),
        l.save(),
        (l.textAlign = 'center'),
        (l.font = `${a}px ${m}`),
        (l.fillStyle = n),
        l.fillText('LEVEL', r / 2, c * 0.35),
        l.restore(),
        l.save(),
        (l.textAlign = 'center'),
        (l.font = `${a * 3}px ${m}`),
        (l.fillStyle = n),
        l.fillText(e.toString(), r / 2, c * 0.5),
        l.restore(),
        l.save(),
        (l.textAlign = 'center'),
        (l.font = `${a}px ${m}`),
        (l.fillStyle = i),
        l.fillText('1-9 or T KEY', r / 2, c * 0.58),
        l.restore(),
        X(),
        l.restore());
    },
    B = qt;
  var Kt = (e, t, n, i) => {
      let { BLACK: m } = h,
        { blockSize: s } = f,
        l = s,
        a = 1,
        r = l - a * 2,
        c = t * l + a,
        u = n * l + a;
      ((e.fillStyle = i),
        e.fillRect(c, u, r, r),
        (e.strokeStyle = m),
        e.strokeRect(c, u, r, r));
    },
    F = Kt;
  function Xt(e) {
    let { ROWS: t, COLS: n } = L,
      { gameBoardContext: i } = f;
    b();
    for (let m = 0; m < t; m++)
      for (let s = 0; s < n; s++) e[m][s] && F(i, s, m, e[m][s]);
  }
  var ue = Xt;
  var Qt = (e, t, n) => {
      let { gameBoardContext: i } = f,
        { shape: m, color: s } = e,
        { length: l } = m;
      for (let a = 0; a < l; a++)
        for (let r = 0; r < m[a].length; r++) m[a][r] && F(i, t + r, n + a, s);
      return !0;
    },
    he = Qt;
  var jt = () => {
      (ue(o.board), o.curr && he(o.curr, o.cx, o.cy));
    },
    A = jt;
  var Jt = () => {
      let { nextPiece: e, nextPieceContext: t } = f,
        { width: n, height: i } = e;
      t.clearRect(0, 0, n, i);
    },
    ge = Jt;
  var Zt = (e) => {
      let { BLACK: t } = h,
        { nextPiece: n, nextPieceContext: i } = f,
        { width: m, height: s } = n,
        a = Math.floor(m / 5);
      if (!e) return;
      let { shape: r } = e,
        c = Math.floor((m - r[0].length * a) / 2),
        u = Math.floor((s - r.length * a) / 2);
      ge();
      for (let E = 0; E < r.length; E++)
        for (let T = 0; T < r[E].length; T++)
          if (r[E][T]) {
            let R = c + T * a,
              q = u + E * a;
            ((i.fillStyle = e.color),
              i.fillRect(R, q, a - 2, a - 2),
              (i.strokeStyle = t),
              i.strokeRect(R, q, a - 2, a - 2));
          }
    },
    H = Zt;
  var eo = () => {
      let { RGBA_BLACK: e, RED: t, YELLOW: n } = h,
        { FONT_FAMILY: i } = x,
        { gameBoard: m, gameBoardContext: s, fontSize: l } = f,
        { width: a, height: r } = m;
      (b(),
        A(),
        H(o.next),
        (s.fillStyle = e),
        s.fillRect(0, 0, a, r),
        y(),
        s.save(),
        (s.fillStyle = t),
        (s.strokeStyle = n),
        (s.textAlign = 'center'),
        (s.font = `${l * 2.3}px ${i}`),
        s.strokeText('GAME', a / 2, r / 2.2),
        s.fillText('GAME', a / 2, r / 2.2),
        s.restore(),
        s.save(),
        (s.fillStyle = t),
        (s.strokeStyle = n),
        (s.textAlign = 'center'),
        (s.font = `${l * 2.3}px ${i}`),
        s.strokeText('OVER', a / 2, r / 1.8),
        s.fillText('OVER', a / 2, r / 1.8),
        s.restore(),
        X());
    },
    Se = eo;
  var to = () => {
      let e = S(),
        { level: t, next: n } = o;
      if (e === 'main-menu') {
        B(t);
        return;
      }
      if (e === 'game-over') {
        Se();
        return;
      }
      (A(), H(n));
    },
    V = to;
  var oo = () => {
      (K(), V());
    },
    xe = oo;
  var ro = {
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
    no = (e) => {
      let t = ro[e];
      return (t && t) || null;
    },
    Ee = no;
  var D = [],
    I = (e) => {
      D.push(e);
    },
    Le = (e) => {
      for (let t = D.length - 1; t >= 0; t--) D[t].update(e) || D.splice(t, 1);
    },
    ve = () => {
      let e = D.slice().toSorted((t, n) => t.layer - n.layer);
      for (let t of e) t.render();
    },
    Q = (e) =>
      D.some((t) => {
        let n = t.blocking;
        return e && e.length > 0 ? n && e.includes(t.name) : t.blocking;
      });
  var re = new AudioContext(),
    io = (e, t, n = 0.1, i = 'square') => {
      let m = re.createOscillator(),
        s = re.createGain();
      ((m.type = i),
        (m.frequency.value = e),
        (s.gain.value = n),
        m.connect(s),
        s.connect(re.destination),
        m.start(),
        setTimeout(() => {
          m.stop();
        }, t));
    },
    p = io;
  var ao = {
      levelSelect: () => p(523, 80, 0.1, 'sine'),
      levelStart: () => p(1319, 160, 0.22, 'sine'),
      countdown: () => p(784, 180, 0.3, 'sine'),
      move: () => p(330, 60),
      rotate: () => p(440, 60),
      drop: () => p(220, 100),
      fall: () => p(180, 200),
      clear: () => {
        (p(587, 220, 0.35, 'square'),
          setTimeout(() => p(698, 260, 0.32, 'square'), 160),
          setTimeout(() => p(880, 300, 0.3, 'square'), 320),
          setTimeout(() => p(1174, 380, 0.25, 'square'), 480));
      },
      levelUp: () => {
        (p(523, 220),
          setTimeout(() => p(587, 220), 260),
          setTimeout(() => p(659, 240), 520),
          setTimeout(() => p(784, 260), 780),
          setTimeout(() => p(880, 280), 1060),
          setTimeout(() => p(1047, 320), 1360),
          setTimeout(() => p(1175, 360), 1700),
          setTimeout(() => p(1319, 480), 2080));
      },
      pause: () => p(300, 150),
      secondTick: () => p(880, 50, 0.085, 'sine'),
      resume: () => p(400, 150),
      gameOver: () => {
        (p(330, 200),
          setTimeout(() => p(294, 300), 210),
          setTimeout(() => p(262, 500), 520));
      },
      bgmToggle: () => p(440, 100),
    },
    d = ao;
  var so = (e) => {
      let { YELLOW: t, BLACK: n, RGBA_BLACK: i, GREEN: m } = h,
        { FONT_FAMILY: s } = x,
        { gameBoard: l, gameBoardContext: a, fontSize: r } = f,
        { width: c, height: u } = l,
        { scale: E, number: T } = e;
      (b(),
        a.save(),
        (a.fillStyle = i),
        a.fillRect(0, 0, c, u),
        y(),
        a.save(),
        (a.textAlign = 'center'),
        (a.textBaseline = 'middle'),
        a.translate(c / 2, u / 2),
        a.scale(E, E),
        (a.font = `${r * 3.25}px ${s}`),
        (a.fillStyle = t),
        (a.strokeStyle = n),
        (a.lineWidth = 6),
        a.strokeText(T.toString(), 0, 0),
        a.fillText(T.toString(), 0, 0),
        a.restore(),
        a.save(),
        (a.textAlign = 'center'),
        (a.textBaseline = 'top'),
        (a.font = `${r * 1.1}px ${s}`),
        (a.fillStyle = m),
        (a.strokeStyle = n),
        a.strokeText('GET READY!', c / 2, u / 1.46),
        a.fillText('GET READY!', c / 2, u / 1.46),
        a.restore(),
        a.restore());
    },
    ne = so;
  var mo = (e) => {
      o.mode = e;
    },
    v = mo;
  var lo = { bgmEnabled: !0, bgmTimer: null },
    j = lo;
  var Te = (e, t) => {
      (e >= t.length && (e = 0),
        p(t[e], 110, 0.05),
        (o.bgmTimer = setTimeout(() => {
          Te(e + 1, t);
        }, 130)));
    },
    Ae = Te;
  var co = () => {
      (o.bgmTimer && clearTimeout(o.bgmTimer), (o.bgmTimer = null));
    },
    M = co;
  var fo = () => {
      let e = [
        659, 659, 587, 659, 784, 880, 523, 523, 440, 523, 659, 784, 659, 659,
        587, 659, 784, 880, 988, 880, 784, 659, 880, 784, 659, 587, 523, 587,
        659, 784, 659, 587,
      ];
      if (!j.bgmEnabled) return !1;
      (M(), Ae(0, e));
    },
    G = fo;
  var po = (e, t) => {
      localStorage.setItem(e, t);
    },
    Me = po;
  var uo = () => {
      let { score: e } = o;
      e > o.highScore &&
        ((o.highScore = e), Me('tetris-high-score', o.highScore.toString()));
    },
    J = uo;
  var ho = () => {
      let e = S();
      if (e === 'game-over' || e === 'paused' || e === 'main-menu') return !1;
      (v('game-over'), J(), M(), d.gameOver());
    },
    Z = ho;
  var {
      BLUE: go,
      TEAL: So,
      YELLOW: xo,
      PURPLE: Eo,
      ORANGE: Lo,
      GREEN: vo,
      RED: To,
    } = h,
    Ao = [
      { shape: [[1, 1, 1, 1]], color: So },
      {
        shape: [
          [1, 1],
          [1, 1],
        ],
        color: xo,
      },
      {
        shape: [
          [0, 1, 0],
          [1, 1, 1],
        ],
        color: Eo,
      },
      {
        shape: [
          [1, 0, 0],
          [1, 1, 1],
        ],
        color: go,
      },
      {
        shape: [
          [0, 0, 1],
          [1, 1, 1],
        ],
        color: Lo,
      },
      {
        shape: [
          [0, 1, 1],
          [1, 1, 0],
        ],
        color: vo,
      },
      {
        shape: [
          [1, 1, 0],
          [0, 1, 1],
        ],
        color: To,
      },
    ],
    ie = Ao;
  function Mo() {
    let e = Math.floor(Math.random() * ie.length),
      t = ie[e];
    return { ...t, shape: t.shape.map((n) => [...n]) };
  }
  var ae = Mo;
  var Oo = (e, t) => {
      let { ROWS: n, COLS: i } = L;
      if (!o.curr) return !1;
      let m = o.curr.shape;
      for (let s = 0; s < m.length; s++)
        for (let l = 0; l < m[s].length; l++)
          if (m[s][l]) {
            let a = o.cx + l + e,
              r = o.cy + s + t,
              c = a < 0 || a >= i || r >= n,
              u = r >= 0 && r < n && o.board[r][a];
            if (c || u) return !0;
          }
      return !1;
    },
    W = Oo;
  var yo = () => {
      let { COLS: e } = L;
      ((o.curr = o.next
        ? { ...o.next, shape: o.next.shape.map((t) => [...t]) }
        : ae()),
        (o.next = ae()),
        (o.cx = Math.floor(e / 2) - Math.floor(o.curr.shape[0].length / 2)),
        (o.cy = 0),
        H(o.next),
        W(0, 0) && Z());
    },
    k = yo;
  var Go = () => Math.max(100, 1e3 - (o.level - 1) * 80),
    Oe = Go;
  var Co = (e, t) => (W(e, t) ? !1 : ((o.cx += e), (o.cy += t), d.move(), !0)),
    P = Co;
  var Ro = () => {
      let { curr: e } = o,
        t = e.shape;
      for (let n = 0; n < t.length; n++)
        for (let i = 0; i < t[n].length; i++)
          t[n][i] && (o.board[o.cy + n][o.cx + i] = e.color);
    },
    ee = Ro;
  var Bo = (e) => {
      let { COLS: t } = L,
        { gameBoardContext: n } = f;
      for (let i of e.lines) {
        (n.save(), (n.globalAlpha = i.alpha));
        for (let m = 0; m < t; m++) F(n, m, i.y, i.color);
        n.restore();
      }
    },
    ye = Bo;
  var wo = (e, t) => e.toString().padStart(t, '0'),
    C = wo;
  var bo = {
      score: document.querySelector('#score'),
      lines: document.querySelector('#lines'),
      level: document.querySelector('#level'),
      highScore: document.querySelector('#highScore'),
    },
    w = bo;
  var Io = (e, t, n, i, m) => {
      let s = null;
      if (e === t) return;
      let l = 0,
        a = 0,
        r = (c) => {
          a || (a = c);
          let u = c - a;
          ((a = c), (l += u));
          let E = Math.min(l / n, 1),
            T = Math.floor(e + (t - e) * E);
          (i(T, s), E < 1 ? (s = requestAnimationFrame(r)) : m?.());
        };
      return (
        (s = requestAnimationFrame(r)),
        { cancel: () => cancelAnimationFrame(s) }
      );
    },
    Ge = Io;
  var _ = (e, t, n = 0) => (e.textContent = n ? C(t, n) : String(t)),
    ko = () => {
      let e = { score: 0, lines: 0, level: 1, highScore: 0 },
        t = { score: 0 },
        n = { score: !1 },
        i = (c) => {
          ((t.score = c),
            !n.score &&
              ((n.score = !0),
              Ge(
                e.score,
                t.score,
                300,
                (u) => {
                  _(w.score, u, 5);
                },
                () => {
                  ((e.score = t.score),
                    (n.score = !1),
                    e.score !== t.score && i(t.score));
                },
              )));
        },
        m = (c) => {
          c !== e.lines && (_(w.lines, c, 2), (e.lines = c));
        },
        s = (c) => {
          c !== e.level && (_(w.level, c, 2), (e.level = c));
        },
        l = (c) => {
          c !== e.highScore && (_(w.highScore, c, 5), (e.highScore = c));
        };
      return {
        update: (c) => {
          (i(c.score), m(c.lines), s(c.level), l(c.highScore));
        },
        reset: () => {
          ((e.score = e.lines = e.level = e.highScore = 0),
            (n.score = !1),
            _(w.score, 0, 5),
            _(w.lines, 0, 2),
            _(w.level, 1, 2),
            _(w.highScore, 0, 5));
        },
      };
    },
    Ce = ko;
  var Po = (e, t, n, i, m = !1) => {
      let s = Ce();
      ((S() === 'main-menu' || m) && s.reset(),
        s.update({ score: e, lines: t, level: n, highScore: i }));
    },
    N = Po;
  var { TEAL: _o, YELLOW: No, PURPLE: Fo, ORANGE: Ho, GREEN: Vo, RED: Do } = h,
    Wo = [_o, No, Fo, Ho, Vo, Do],
    se = Wo;
  var $o = (e) => {
      let { gameBoardContext: t } = f;
      for (let n of e.fireworks)
        ((t.globalAlpha = n.alpha),
          (t.fillStyle = n.color),
          t.beginPath(),
          t.arc(n.x, n.y, n.radius, 0, Math.PI * 2),
          t.fill(),
          (n.x += n.vx),
          (n.y += n.vy),
          (n.alpha -= 0.024));
    },
    Re = $o;
  function zo(e) {
    let { RGBA_BLACK: t, BLACK: n, GREEN: i, YELLOW: m } = h,
      { FONT_FAMILY: s } = x,
      { gameBoard: l, gameBoardContext: a, fontSize: r } = f,
      { width: c, height: u } = l;
    return e.show
      ? (a.save(),
        (a.fillStyle = t),
        a.fillRect(0, 0, c, u),
        y(),
        a.save(),
        (a.textAlign = 'center'),
        (a.font = `${r * 1.2}px ${s}`),
        (a.fillStyle = i),
        a.fillText('LEVEL UP', c / 2, u / 2.5),
        a.restore(),
        a.save(),
        (a.textAlign = 'center'),
        (a.font = `${r * 2.5}px ${s}`),
        (a.fillStyle = i),
        a.fillText(`${o.level}`, c / 2, u / 1.85),
        a.restore(),
        a.save(),
        (a.textAlign = 'center'),
        (a.font = `${r * 1.3}px ${s}`),
        (a.fillStyle = m),
        (a.strokeStyle = n),
        (a.lineWidth = 3),
        a.strokeText('CONGRATS!', c / 2, u / 1.6),
        a.fillText('CONGRATS!', c / 2, u / 1.6),
        a.restore(),
        Re(e),
        a.restore(),
        !0)
      : !1;
  }
  var Be = zo;
  var me = class {
      constructor({ onComplete: t }) {
        ((this.fireworks = this.createFireworks()),
          (this.onComplete = t),
          (this.name = 'level-up'),
          (this.timer = 0),
          (this.duration = 3),
          (this.spawnTimer = 0),
          (this.layer = 100),
          (this.blocking = !0));
      }
      createFireworks() {
        let { width: t, height: n } = f.gameBoard,
          i = [];
        for (let m = 0; m < 40; m++) {
          let s = Math.random() * Math.PI * 2,
            l = 5 + Math.random() * 15;
          i.push({
            x: t / 2,
            y: n / 2 - 60,
            vx: Math.cos(s) * l,
            vy: Math.sin(s) * l,
            radius: 3 + Math.random() * 4,
            color: se[Math.floor(Math.random() * se.length)],
            alpha: 1,
          });
        }
        return i;
      }
      update(t) {
        return (
          (this.timer += t),
          (this.spawnTimer += t),
          this.updateFireworks(t),
          this.spawnTimer > 0.6 &&
            (this.fireworks.push(...this.createFireworks()),
            (this.spawnTimer = 0)),
          this.timer >= this.duration ? (this.onComplete?.(), !1) : !0
        );
      }
      updateFireworks(t) {
        for (let i of this.fireworks)
          ((i.vx *= 0.98),
            (i.vy *= 0.98),
            (i.vy += 0.01 * t),
            (i.x += i.vx * t * 0.008),
            (i.y += i.vy * t * 0.008),
            (i.alpha -= t * 0.024),
            (i.radius += t * 10));
        this.fireworks = this.fireworks.filter((i) => i.alpha > 0);
      }
      render() {
        Be({ show: !0, fireworks: this.fireworks });
      }
    },
    we = me;
  var Uo = () => {
      (M(),
        d.levelUp(),
        I(
          new we({
            onComplete: () => {
              G();
            },
          }),
        ));
    },
    be = Uo;
  var le = class {
      constructor(t) {
        ((this.lines = t.map((n) => ({ y: n, alpha: 1, timer: 0 }))),
          (this.name = 'clear-lines'),
          (this.layer = 200),
          (this.blocking = !0));
      }
      update(t) {
        let n = !0;
        for (let i of this.lines) {
          let m = Math.floor(i.timer / 0.12);
          ((i.alpha = m % 2 === 0 ? 1 : 0),
            (i.timer += t),
            i.timer < 0.72 && (n = !1));
        }
        return n ? (this.finish(), !1) : !0;
      }
      render() {
        (A(), ye({ lines: this.lines }));
      }
      finish() {
        let { ROWS: t, COLS: n } = L,
          { CLEAR_SCORES: i, MAX_LEVEL: m } = x,
          s = 0;
        for (let r = t - 1; r >= 0; r--)
          o.board[r].every(Boolean) &&
            (o.board.splice(r, 1),
            o.board.unshift(Array.from({ length: n }).fill(0)),
            s++,
            r++);
        ((o.lines += s), (o.score += i[s] * o.level));
        let l = o.baseLines + o.lines,
          a = Math.floor(l / 10) + 1;
        (a > o.level && be(),
          (o.level = Math.min(Math.max(o.level, a), m)),
          N(o.score, o.lines, o.level, o.highScore));
      }
    },
    Ie = le;
  var Yo = (e) => {
      I(new Ie(e));
    },
    ke = Yo;
  var qo = () => {
      let { ROWS: e } = L,
        t = 0,
        n = [];
      for (let i = e - 1; i >= 0; i--)
        o.board[i].every((s) => !!s) && (n.push(i), t++);
      return t === 0 ? (J(), !1) : (d.clear(), ke(n), !0);
    },
    te = qo;
  var Ko = () => {
      let e = S();
      return e === 'game-over' ||
        e === 'main-menu' ||
        Q() ||
        (!P(0, 1) && (ee(), d.fall(), te(), k(), e === 'game-over'))
        ? !1
        : (A(), !0);
    },
    Pe = Ko;
  var _e = (e) => {
      g.timestamp || (g.timestamp = e);
      let t = (e - g.timestamp) / 1e3,
        n = Oe();
      ((g.timestamp = e),
        Le(t),
        (!g.accumulator || e - g.accumulator > n) &&
          (Pe(), (g.accumulator = e)),
        V(),
        ve(),
        (g.rafId = requestAnimationFrame(_e)));
    },
    $ = _e;
  var Xo = () => {
      g.rafId &&
        (cancelAnimationFrame(g.rafId), (g.rafId = null), (g.timestamp = 0));
    },
    Ne = Xo;
  var Qo = () => {
      (Ne(), (g.rafId = requestAnimationFrame($)));
    },
    z = Qo;
  var jo = () => {
      let e = document.querySelector('#level');
      (e && (e.textContent = C(o.level, 2)),
        v('playing'),
        k(),
        d.levelStart(),
        setTimeout(() => {
          G();
        }, 250),
        (g.rafId = requestAnimationFrame(z)));
    },
    Fe = jo;
  var Jo = () => {
      let e = { show: !0, number: 3, scale: 4, count: 0, acc: 0 };
      return {
        name: 'countdown',
        layer: 100,
        blocking: !0,
        update(t) {
          return (
            (e.acc += t),
            e.acc < 0.01
              ? !0
              : ((e.acc = 0),
                ne(e),
                e.count++,
                (e.scale = Math.max(1, e.scale - 0.4)),
                e.count >= 50 &&
                  ((e.count = 0),
                  e.number--,
                  (e.scale = 4),
                  e.number >= 1 && d.countdown()),
                e.number <= 0 ? (v('playing'), Fe(), !1) : !0)
          );
        },
        render() {
          ne(e);
        },
      };
    },
    He = Jo;
  var Zo = () => {
      I(He());
    },
    Ve = Zo;
  var er = () => {
      ((o.baseLines = (o.level - 1) * 10), Ve());
    },
    De = er;
  var tr = (e) => {
      ((o.level = e), d.levelSelect(), B(e));
    },
    O = tr;
  var or = {
      LEVEL_ONE: () => {
        O(1);
      },
      LEVEL_TWO: () => {
        O(2);
      },
      LEVEL_THREE: () => {
        O(3);
      },
      LEVEL_FOUR: () => {
        O(4);
      },
      LEVEL_FIVE: () => {
        O(5);
      },
      LEVEL_SIX: () => {
        O(6);
      },
      LEVEL_SEVEN: () => {
        O(7);
      },
      LEVEL_EIGHT: () => {
        O(8);
      },
      LEVEL_NINE: () => {
        O(9);
      },
      LEVEL_TEN: () => {
        O(10);
      },
      CONFIRM: De,
    },
    rr = (e) => {
      let t = or[e];
      t?.();
    },
    We = rr;
  var nr = () => {
      let { curr: e } = o,
        t = e.shape;
      ((e.shape = t[0].map((n, i) => t.map((m) => m[i]).toReversed())),
        W(0, 0) ? (e.shape = t) : d.rotate());
    },
    $e = nr;
  var ir = () => {
      for (; P(0, 1); );
      (ee(), d.fall(), te(), k(), d.drop());
    },
    ze = ir;
  var ar = {
      MOVE_LEFT: () => {
        (P(-1, 0), A());
      },
      MOVE_RIGHT: () => {
        (P(1, 0), A());
      },
      MOVE_DOWN: () => {
        (P(0, 1), A());
      },
      ROTATE: () => {
        ($e(), A());
      },
      DROP: () => {
        (ze(), A());
      },
    },
    sr = (e) => {
      let t = ar[e];
      t?.();
    },
    Ue = sr;
  var mr = () => {
      let { COLS: e, ROWS: t } = L;
      o.board = Array.from({ length: t }, () =>
        Array.from({ length: e }).fill(0),
      );
    },
    U = mr;
  var lr = () => {
      (M(),
        (o.rafId = requestAnimationFrame($)),
        U(),
        v('main-menu'),
        (o.score = 0),
        (o.lines = 0),
        (o.level = 1),
        (o.next = null),
        B(o.level),
        N(o.score, o.lines, o.level, o.highScore));
    },
    Ye = lr;
  var cr = { CONFIRM: Ye },
    fr = (e) => {
      let t = cr[e];
      t?.();
    },
    qe = fr;
  var pr = { 'main-menu': We, playing: Ue, paused: () => {}, 'game-over': qe },
    Ke = pr;
  var dr = () => {
      let e = S();
      e === 'paused' ||
        e === 'game-over' ||
        e === 'main-menu' ||
        (M(),
        v('playing'),
        (o.score = 0),
        (o.lines = 0),
        (o.level = 1),
        U(),
        N(o.score, o.lines, o.level, o.highScore, !0),
        k(),
        G(),
        z());
    },
    Xe = dr;
  var ur = (e, t = 'yyyy-MM-dd HH:mm:ss') => {
      let n = e.getFullYear(),
        i = e.getMonth() + 1,
        m = e.getDate(),
        s = e.getHours(),
        l = e.getMinutes(),
        a = e.getSeconds(),
        r = () => (s > 12 ? 'PM' : 'AM'),
        c = t.includes('a'),
        u = {
          yyyy: n,
          MM: C(i, 2),
          dd: C(m, 2),
          HH: C(s, 2),
          hh: c && s > 12 ? s - 12 : s,
          mm: C(l, 2),
          ss: C(a, 2),
          a: r(),
        },
        E = t;
      for (let T of Object.keys(u)) E = E.replace(T, u[T]);
      return E;
    },
    Qe = ur;
  var hr = () => {
      let { GREEN: e, WHITE: t } = h,
        { FONT_FAMILY: n } = x,
        { gameBoard: i, gameBoardContext: m, fontSize: s } = f,
        { width: l, height: a } = i,
        r = Qe(new Date(), 'HH:mm:ss');
      (m.save(),
        (m.fillStyle = e),
        (m.textAlign = 'center'),
        (m.font = `${s * 0.86}px ${n}`),
        m.fillText(`${r}`, l / 2, a / 3.65),
        (m.shadowColor = t),
        (m.shadowBlur = 13),
        (m.shadowOffsetX = 2),
        (m.shadowOffsetY = 2),
        m.restore());
    },
    je = hr;
  var gr = () => {
      let e = new Date(),
        t = e.getHours(),
        n = e.getMinutes(),
        i = e.getSeconds(),
        { TEAL: m, RGBA_TEAL: s, ORANGE: l } = h,
        { gameBoard: a, gameBoardContext: r } = f,
        { width: c, height: u } = a,
        E = c / 2,
        T = u / 2.2,
        R = Math.floor(c * 0.25);
      (r.save(),
        r.translate(E, T),
        (r.lineCap = 'round'),
        (r.strokeStyle = m),
        (r.fillStyle = m),
        r.save(),
        r.beginPath(),
        r.arc(0, 0, R, 0, Math.PI * 2),
        (r.lineWidth = Math.floor(c * 0.064)),
        r.stroke(),
        r.restore(),
        r.save(),
        r.beginPath(),
        r.arc(0, 0, R, 0, Math.PI * 2),
        (r.fillStyle = s),
        r.fill(),
        r.restore());
      let q = Math.floor(c * 0.016),
        pt = Math.floor(c * 0.08),
        dt = R - pt;
      for (let oe = 0; oe < 12; oe++)
        (r.save(),
          r.rotate((oe * Math.PI) / 6),
          r.beginPath(),
          r.arc(0, -dt, q, 0, Math.PI * 2),
          r.fill(),
          r.restore());
      let ut = ((t % 12) + n / 60 + i / 3600) * ((2 * Math.PI) / 12);
      (r.save(),
        r.rotate(ut),
        (r.lineWidth = 5),
        r.beginPath(),
        r.moveTo(0, 0),
        r.lineTo(0, -R * 0.4),
        r.stroke(),
        r.restore());
      let ht = (n + i / 60) * ((2 * Math.PI) / 60);
      (r.save(),
        r.rotate(ht),
        (r.lineWidth = 4),
        r.beginPath(),
        r.moveTo(0, 0),
        r.lineTo(0, -R * 0.65),
        r.stroke(),
        r.restore());
      let gt = i * ((2 * Math.PI) / 60);
      (r.save(),
        r.rotate(gt),
        (r.strokeStyle = l),
        (r.lineWidth = 2),
        r.beginPath(),
        r.moveTo(0, 0),
        r.lineTo(0, -R * 0.75),
        r.stroke(),
        r.restore());
      let St = Math.floor(c * 0.014);
      (r.save(),
        (r.fillStyle = l),
        r.beginPath(),
        r.arc(0, 0, St, 0, Math.PI * 2),
        r.fill(),
        r.restore(),
        r.restore());
    },
    Je = gr;
  var Sr = () => {
      let { RGBA_BLACK: e, YELLOW: t, WHITE: n } = h,
        { FONT_FAMILY: i } = x,
        { gameBoard: m, gameBoardContext: s, fontSize: l } = f,
        { width: a, height: r } = m;
      ((s.fillStyle = e),
        s.fillRect(0, 0, a, r),
        y(),
        je(),
        Je(),
        s.save(),
        (s.fillStyle = t),
        (s.textAlign = 'center'),
        (s.font = `${l * 1.6}px ${i}`),
        s.fillText('PAUSED', a / 2, r / 1.45),
        (s.shadowColor = n),
        (s.shadowBlur = 13),
        (s.shadowOffsetX = 2),
        (s.shadowOffsetY = 2),
        s.restore());
    },
    ce = Sr;
  var fe = class {
      constructor(t = 500) {
        ((this.layer = t),
          (this.name = 'paused'),
          (this.timer = 0),
          (this.blocking = !0));
      }
      update(t) {
        return (
          (this.timer += t),
          ce(),
          this.timer >= 1 && (d.secondTick(), (this.timer = 0)),
          !0
        );
      }
      render() {
        ce();
      }
    },
    Ze = fe;
  var Y = null,
    et = () => {
      Y || ((Y = new Ze()), I(Y));
    },
    tt = () => {
      Y && ((Y.update = () => !1), (Y = null));
    };
  var xr = () => {
      let e = S();
      if (e === 'game-over' || e === 'main-menu') return !1;
      e === 'playing'
        ? (v('paused'), M(), d.pause(), et())
        : (tt(), v('playing'), d.resume(), G(), z());
    },
    ot = xr;
  var Er = () => {
      let { bgmEnabled: e } = j,
        t = S();
      t === 'main-menu' ||
        t === 'paused' ||
        t === 'game-over' ||
        ((e = !e), d.bgmToggle(), e ? G() : M());
    },
    rt = Er;
  var Lr = { RESTART: Xe, QUIT: Z, TOGGLE_PAUSE: ot, TOGGLE_MUSIC: rt },
    vr = (e) => {
      let t = Lr[e];
      return S() === 'main-menu' ? !1 : t ? (t(), !0) : !1;
    },
    nt = vr;
  var Tr = (e) => {
      let { action: t } = e,
        n = S();
      if (Q(['countdown', 'level-up']) || !t || nt(t)) return;
      let i = Ke[n];
      i?.(t);
    },
    it = Tr;
  var Ar = (e) => {
      let t = e.key.toLowerCase(),
        n = Ee(t);
      n && it({ type: 'keydown', key: t, action: n });
    },
    at = Ar;
  var Mr = () => {
      (globalThis.addEventListener('resize', xe),
        document.addEventListener('keydown', at));
    },
    st = Mr;
  var Or = (e) => localStorage.getItem(e),
    mt = Or;
  var yr = () => {
      o.highScore = Number.parseInt(mt('tetris-high-score'), 10) || 0;
    },
    lt = yr;
  var Gr = () => {
      document?.fonts?.load
        ? document.fonts.load('40px "Press Start 2P"').then(() => {
            B(o.level);
          })
        : setTimeout(() => {
            B(o.level);
          }, 150);
    },
    ct = Gr;
  var Cr = () => {
      (U(),
        lt(),
        v('main-menu'),
        (o.score = 0),
        (o.lines = 0),
        (o.level = 1),
        V(),
        K(),
        N(o.score, o.lines, o.level, o.highScore),
        ct(),
        st(),
        (g.rafId = requestAnimationFrame($)));
    },
    ft = Cr;
  ft();
})();
//# sourceMappingURL=tetris.js.map
