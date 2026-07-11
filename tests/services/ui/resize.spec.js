import resize from '@/lib/services/ui/core/resize';

describe('resize', () => {
  let canvas;

  beforeEach(() => {
    canvas = {
      gameBoard: { width: 0, height: 0 },
      nextPiece: { width: 0, height: 0 },
      holdPiece: { width: 0, height: 0 },
      rows: 20,
      cols: 10,
      blockSize: 0,
      fontSize: 0,
    };

    globalThis.innerWidth = 1024;
    globalThis.innerHeight = 768;
  });

  describe('桌面端（>= 480px）', () => {
    beforeEach(() => {
      globalThis.innerWidth = 1024;
      globalThis.innerHeight = 768;
    });

    it('blockSize = floor(innerHeight * 0.9 / rows)', () => {
      resize(canvas);

      expect(canvas.blockSize).toBe(34);
    });

    it('gameBoard 宽高正确', () => {
      resize(canvas);

      expect(canvas.gameBoard.width).toBe(340);
      expect(canvas.gameBoard.height).toBe(680);
    });

    it('fontSize = floor(blockSize * rows * 0.032)', () => {
      resize(canvas);

      expect(canvas.fontSize).toBe(21);
    });

    it('nextPiece = min(innerWidth * 0.16, innerHeight * 0.18)', () => {
      resize(canvas);

      // 1024 * 0.16 = 163.84
      // 768 * 0.18 = 138.24
      // 取较小值 = 138.24
      expect(canvas.nextPiece.width).toBe(138.24);
      expect(canvas.nextPiece.height).toBe(138.24);
    });

    it('holdPiece 和 nextPiece 尺寸相同', () => {
      resize(canvas);

      expect(canvas.holdPiece.width).toBe(138.24);
      expect(canvas.holdPiece.height).toBe(138.24);
    });

    it('innerHeight * 0.18 更小时取 height', () => {
      globalThis.innerWidth = 1920;
      globalThis.innerHeight = 500;

      resize(canvas);

      // 1920 * 0.16 = 307.2
      // 500 * 0.18 = 90
      // 取较小值 = 90
      expect(canvas.nextPiece.width).toBe(90);
      expect(canvas.nextPiece.height).toBe(90);
      expect(canvas.holdPiece.width).toBe(90);
      expect(canvas.holdPiece.height).toBe(90);
    });

    it('innerWidth * 0.16 更小时取 width', () => {
      globalThis.innerWidth = 480;
      globalThis.innerHeight = 1000;

      resize(canvas);

      // 480 * 0.16 = 76.8
      // 1000 * 0.18 = 180
      // 取较小值 = 76.8
      expect(canvas.nextPiece.width).toBe(76.8);
      expect(canvas.nextPiece.height).toBe(76.8);
      expect(canvas.holdPiece.width).toBe(76.8);
      expect(canvas.holdPiece.height).toBe(76.8);
    });
  });

  describe('移动端（< 480px）', () => {
    beforeEach(() => {
      globalThis.innerWidth = 375;
      globalThis.innerHeight = 667;
    });

    it('blockSize 取 width 和 height 的较小值', () => {
      resize(canvas);

      // width = 375 * 0.64 = 240, 240 / 10 = 24
      // height = 667 * 0.68 = 453.56, 453.56 / 20 = 22.678 → floor = 22
      // 取较小值 = 22
      expect(canvas.blockSize).toBe(22);
    });

    it('gameBoard 宽高正确', () => {
      resize(canvas);

      // blockSize = 22
      // width = 22 * 10 = 220
      // height = 22 * 20 = 440
      expect(canvas.gameBoard.width).toBe(220);
      expect(canvas.gameBoard.height).toBe(440);
    });

    it('nextSize = blockSize * 5', () => {
      resize(canvas);

      // blockSize = 22, 22 * 5 = 110
      expect(canvas.nextPiece.width).toBe(110);
      expect(canvas.nextPiece.height).toBe(110);
    });

    it('holdSize = blockSize * 5', () => {
      resize(canvas);

      expect(canvas.holdPiece.width).toBe(110);
      expect(canvas.holdPiece.height).toBe(110);
    });

    it('height 限制更严时用 height', () => {
      globalThis.innerWidth = 479;
      globalThis.innerHeight = 320;

      resize(canvas);

      // width = 479 * 0.64 = 306.56, 306.56 / 10 = 30.656 → floor = 30
      // height = 320 * 0.68 = 217.6, 217.6 / 20 = 10.88 → floor = 10
      // 取较小值 = 10
      expect(canvas.blockSize).toBe(10);
      expect(canvas.gameBoard.width).toBe(100);
      expect(canvas.gameBoard.height).toBe(200);
    });

    it('width 限制更严时用 width', () => {
      globalThis.innerWidth = 320;
      globalThis.innerHeight = 800;

      resize(canvas);

      // width = 320 * 0.64 = 204.8, 204.8 / 10 = 20.48 → floor = 20
      // height = 800 * 0.68 = 544, 544 / 20 = 27.2 → floor = 27
      // 取较小值 = 20
      expect(canvas.blockSize).toBe(20);
      expect(canvas.gameBoard.width).toBe(200);
      expect(canvas.gameBoard.height).toBe(400);
    });
  });

  describe('边界情况', () => {
    it('自定义 cols 和 rows', () => {
      canvas.cols = 8;
      canvas.rows = 16;
      globalThis.innerWidth = 800;
      globalThis.innerHeight = 600;

      resize(canvas);

      // h = 600 * 0.9 = 540, 540 / 16 = 33.75 → floor = 33
      expect(canvas.blockSize).toBe(33);
      expect(canvas.gameBoard.width).toBe(264);
      expect(canvas.gameBoard.height).toBe(528);

      // nextSize = min(800 * 0.16, 600 * 0.18) = min(128, 108) = 108
      expect(canvas.nextPiece.width).toBe(108);
      expect(canvas.nextPiece.height).toBe(108);
      expect(canvas.holdPiece.width).toBe(108);
      expect(canvas.holdPiece.height).toBe(108);
    });

    it('桌面端边界值 480px', () => {
      globalThis.innerWidth = 480;
      globalThis.innerHeight = 800;

      resize(canvas);

      // 桌面端逻辑：innerWidth >= 480
      // h = 800 * 0.9 = 720, 720 / 20 = 36
      expect(canvas.blockSize).toBe(36);
      // nextSize = min(480 * 0.16, 800 * 0.18) = min(76.8, 144) = 76.8
      expect(canvas.nextPiece.width).toBe(76.8);
    });

    it('移动端边界值 479px', () => {
      globalThis.innerWidth = 479;
      globalThis.innerHeight = 800;

      resize(canvas);

      // 移动端逻辑：innerWidth < 480
      // width = 479 * 0.64 = 306.56, 306.56 / 10 = 30.656 → floor = 30
      // height = 800 * 0.68 = 544, 544 / 20 = 27.2 → floor = 27
      // 取较小值 = 27
      expect(canvas.blockSize).toBe(27);
      expect(canvas.nextPiece.width).toBe(135);
    });
  });
});
