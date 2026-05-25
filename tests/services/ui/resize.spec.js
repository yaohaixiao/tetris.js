// tests/services/ui/core/resize.spec.js

import resize from '@/lib/services/ui/core/resize';

describe('resize', () => {
  let canvas;

  beforeEach(() => {
    canvas = {
      gameBoard: { width: 0, height: 0 },
      nextPiece: { width: 0, height: 0 },
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

      // h = 768 * 0.9 = 691.2, floor(691.2 / 20) = 34
      expect(canvas.blockSize).toBe(34);
    });

    it('gameBoard 宽高正确', () => {
      resize(canvas);

      expect(canvas.gameBoard.width).toBe(340);
      expect(canvas.gameBoard.height).toBe(680);
    });

    it('fontSize = floor(blockSize * rows * 0.032)', () => {
      resize(canvas);

      // 34 * 20 * 0.032 = 21.76, floor = 21
      expect(canvas.fontSize).toBe(21);
    });

    it('nextPiece = min(innerWidth*0.1, innerHeight*0.18)', () => {
      resize(canvas);

      // 1024*0.1 = 102.4, 768*0.18 = 138.24, min = 102.4
      expect(canvas.nextPiece.width).toBe(102.4);
      expect(canvas.nextPiece.height).toBe(102.4);
    });

    it('innerHeight*0.18 更小时取 height', () => {
      globalThis.innerWidth = 1920;
      globalThis.innerHeight = 500;

      resize(canvas);

      // 1920*0.1 = 192, 500*0.18 = 90, min = 90
      expect(canvas.nextPiece.width).toBe(90);
      expect(canvas.nextPiece.height).toBe(90);
    });
  });

  describe('移动端（< 480px）', () => {
    beforeEach(() => {
      globalThis.innerWidth = 375;
      globalThis.innerHeight = 667;
    });

    it('blockSize 取 width 和 maxH 的较小值', () => {
      resize(canvas);

      // width = 375*0.64 = 240, floor(240/10) = 24
      // maxH = 667*0.68 = 453.56, floor(453.56/20) = 22
      // min(24, 22) = 22
      expect(canvas.blockSize).toBe(22);
    });

    it('gameBoard 宽高正确', () => {
      resize(canvas);

      expect(canvas.gameBoard.width).toBe(220);
      expect(canvas.gameBoard.height).toBe(440);
    });

    it('nextSize = blockSize * 5', () => {
      resize(canvas);

      expect(canvas.nextPiece.width).toBe(110);
      expect(canvas.nextPiece.height).toBe(110);
    });

    it('height 限制更严时用 height', () => {
      globalThis.innerWidth = 479;
      globalThis.innerHeight = 320;

      resize(canvas);

      // width = 479*0.64 = 306.56, floor(306.56/10) = 30
      // maxH = 320*0.68 = 217.6, floor(217.6/20) = 10
      // min(30, 10) = 10
      expect(canvas.blockSize).toBe(10);
    });
  });

  describe('边界情况', () => {
    it('自定义 cols 和 rows', () => {
      canvas.cols = 8;
      canvas.rows = 16;
      globalThis.innerWidth = 800;
      globalThis.innerHeight = 600;

      resize(canvas);

      // h = 600*0.9 = 540, floor(540/16) = 33
      expect(canvas.blockSize).toBe(33);
      expect(canvas.gameBoard.width).toBe(264);
      expect(canvas.gameBoard.height).toBe(528);
    });
  });
});
