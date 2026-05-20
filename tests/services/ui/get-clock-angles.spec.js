import getClockAngles from '@/lib/services/ui/effects/clock/utils/get-clock-angles.js';

describe('getClockAngles', () => {
  // ==================== 12:00:00（所有指针指向 12 点方向） ====================
  describe('12:00:00 - 所有指针指向 12 点', () => {
    let angles;

    beforeEach(() => {
      angles = getClockAngles(new Date('2024-01-01 12:00:00'));
    });

    it('时针应该指向 12 点方向（0 弧度）', () => {
      expect(angles.hAng).toBeCloseTo(0, 5);
    });

    it('分针应该指向 12 点方向（0 弧度）', () => {
      expect(angles.mAng).toBeCloseTo(0, 5);
    });

    it('秒针应该指向 12 点方向（0 弧度）', () => {
      expect(angles.sAng).toBeCloseTo(0, 5);
    });
  });

  // ==================== 3:00:00（时针指向 3 点，分针秒针指向 12 点） ====================
  describe('3:00:00', () => {
    let angles;

    beforeEach(() => {
      angles = getClockAngles(new Date('2024-01-01 03:00:00'));
    });

    it('时针应该指向 3 点方向（π/2 弧度）', () => {
      expect(angles.hAng).toBeCloseTo(Math.PI / 2, 5);
    });

    it('分针应该指向 12 点方向（0 弧度）', () => {
      expect(angles.mAng).toBeCloseTo(0, 5);
    });

    it('秒针应该指向 12 点方向（0 弧度）', () => {
      expect(angles.sAng).toBeCloseTo(0, 5);
    });
  });

  // ==================== 6:00:00（时针指向 6 点） ====================
  describe('6:00:00', () => {
    let angles;

    beforeEach(() => {
      angles = getClockAngles(new Date('2024-01-01 06:00:00'));
    });

    it('时针应该指向 6 点方向（π 弧度）', () => {
      expect(angles.hAng).toBeCloseTo(Math.PI, 5);
    });

    it('分针应该指向 12 点方向（0 弧度）', () => {
      expect(angles.mAng).toBeCloseTo(0, 5);
    });

    it('秒针应该指向 12 点方向（0 弧度）', () => {
      expect(angles.sAng).toBeCloseTo(0, 5);
    });
  });

  // ==================== 9:00:00（时针指向 9 点） ====================
  describe('9:00:00', () => {
    let angles;

    beforeEach(() => {
      angles = getClockAngles(new Date('2024-01-01 09:00:00'));
    });

    it('时针应该指向 9 点方向（3π/2 弧度）', () => {
      expect(angles.hAng).toBeCloseTo((3 * Math.PI) / 2, 5);
    });

    it('分针应该指向 12 点方向（0 弧度）', () => {
      expect(angles.mAng).toBeCloseTo(0, 5);
    });

    it('秒针应该指向 12 点方向（0 弧度）', () => {
      expect(angles.sAng).toBeCloseTo(0, 5);
    });
  });

  // ==================== 分针测试 ====================
  describe('分针角度', () => {
    it('15 分钟时，分针应该指向 3 点方向（π/2 弧度）', () => {
      const angles = getClockAngles(new Date('2024-01-01 12:15:00'));

      expect(angles.mAng).toBeCloseTo(Math.PI / 2, 5);
    });

    it('30 分钟时，分针应该指向 6 点方向（π 弧度）', () => {
      const angles = getClockAngles(new Date('2024-01-01 12:30:00'));

      expect(angles.mAng).toBeCloseTo(Math.PI, 5);
    });

    it('45 分钟时，分针应该指向 9 点方向（3π/2 弧度）', () => {
      const angles = getClockAngles(new Date('2024-01-01 12:45:00'));

      expect(angles.mAng).toBeCloseTo((3 * Math.PI) / 2, 5);
    });
  });

  // ==================== 秒针测试 ====================
  describe('秒针角度', () => {
    it('15 秒时，秒针应该指向 3 点方向（π/2 弧度）', () => {
      const angles = getClockAngles(new Date('2024-01-01 12:00:15'));

      expect(angles.sAng).toBeCloseTo(Math.PI / 2, 5);
    });

    it('30 秒时，秒针应该指向 6 点方向（π 弧度）', () => {
      const angles = getClockAngles(new Date('2024-01-01 12:00:30'));

      expect(angles.sAng).toBeCloseTo(Math.PI, 5);
    });

    it('45 秒时，秒针应该指向 9 点方向（3π/2 弧度）', () => {
      const angles = getClockAngles(new Date('2024-01-01 12:00:45'));

      expect(angles.sAng).toBeCloseTo((3 * Math.PI) / 2, 5);
    });
  });

  // ==================== 时针微调（分针和秒针对时针的影响） ====================
  describe('时针微调', () => {
    it('12:30:00 时，时针应该偏离 12 点，指向 12 和 1 之间（π/12 ≈ 0.2618 弧度）', () => {
      const angles = getClockAngles(new Date('2024-01-01 12:30:00'));

      // 12 小时制下，12 点方向为 0 弧度
      // 30 分钟 = 0.5 小时，时针偏移 = 0.5 / 12 * 2π = π/12
      expect(angles.hAng).toBeCloseTo(Math.PI / 12, 5);
    });

    it('12:00:30 时，秒针对时针有微小影响', () => {
      const angles = getClockAngles(new Date('2024-01-01 12:00:30'));

      // 30 秒对时针的影响非常小：30 / 3600 / 12 * 2π = π/720 ≈ 0.00436
      expect(angles.hAng).toBeCloseTo(Math.PI / 720, 5);
    });

    it('6:30:00 时，时针应该在 6 和 7 之间', () => {
      const angles = getClockAngles(new Date('2024-01-01 06:30:00'));

      // 6 点 = π，30 分钟偏移 = π/12
      expect(angles.hAng).toBeCloseTo(Math.PI + Math.PI / 12, 5);
    });
  });

  // ==================== 分针微调（秒针对分针的影响） ====================
  describe('分针微调', () => {
    it('12:00:30 时，分针应该有微小偏移', () => {
      const angles = getClockAngles(new Date('2024-01-01 12:00:30'));

      // 30 秒对分针的影响：30 / 60 / 60 * 2π = π/60 ≈ 0.0524
      expect(angles.mAng).toBeCloseTo(Math.PI / 60, 5);
    });
  });

  // ==================== 综合场景 ====================
  describe('综合场景', () => {
    it('12:30:45 时各指针角度', () => {
      const angles = getClockAngles(new Date('2024-01-01 12:30:45'));

      // 时针：12h + 30min + 45s → (0 + 30/60 + 45/3600) / 12 * 2π
      const expectedHAng = (0 + 30 / 60 + 45 / 3600) * ((2 * Math.PI) / 12);
      // 分针：30min + 45s → (30 + 45/60) / 60 * 2π
      const expectedMAng = (30 + 45 / 60) * ((2 * Math.PI) / 60);
      // 秒针：45s → 45/60 * 2π
      const expectedSAng = 45 * ((2 * Math.PI) / 60);

      expect(angles.hAng).toBeCloseTo(expectedHAng, 5);
      expect(angles.mAng).toBeCloseTo(expectedMAng, 5);
      expect(angles.sAng).toBeCloseTo(expectedSAng, 5);
    });

    it('15:15:15 时各指针角度', () => {
      const angles = getClockAngles(new Date('2024-01-01 15:15:15'));

      // 时针：15%12=3h + 15min + 15s → (3 + 15/60 + 15/3600) / 12 * 2π
      const expectedHAng = (3 + 15 / 60 + 15 / 3600) * ((2 * Math.PI) / 12);
      // 分针：15min + 15s → (15 + 15/60) / 60 * 2π
      const expectedMAng = (15 + 15 / 60) * ((2 * Math.PI) / 60);
      // 秒针：15s → 15/60 * 2π
      const expectedSAng = 15 * ((2 * Math.PI) / 60);

      expect(angles.hAng).toBeCloseTo(expectedHAng, 5);
      expect(angles.mAng).toBeCloseTo(expectedMAng, 5);
      expect(angles.sAng).toBeCloseTo(expectedSAng, 5);
    });

    it('23:59:59 时各指针角度（午夜前最后一秒）', () => {
      const angles = getClockAngles(new Date('2024-01-01 23:59:59'));

      // 时针：23%12=11h + 59min + 59s
      const expectedHAng = (11 + 59 / 60 + 59 / 3600) * ((2 * Math.PI) / 12);
      // 分针：59min + 59s
      const expectedMAng = (59 + 59 / 60) * ((2 * Math.PI) / 60);
      // 秒针：59s
      const expectedSAng = 59 * ((2 * Math.PI) / 60);

      expect(angles.hAng).toBeCloseTo(expectedHAng, 5);
      expect(angles.mAng).toBeCloseTo(expectedMAng, 5);
      expect(angles.sAng).toBeCloseTo(expectedSAng, 5);
    });

    it('00:00:00 午夜时各指针指向 12 点', () => {
      const angles = getClockAngles(new Date('2024-01-01 00:00:00'));

      expect(angles.hAng).toBeCloseTo(0, 5);
      expect(angles.mAng).toBeCloseTo(0, 5);
      expect(angles.sAng).toBeCloseTo(0, 5);
    });
  });

  // ==================== 边界情况 ====================
  describe('边界情况', () => {
    it('不同日期但相同时间应返回相同角度', () => {
      const angles1 = getClockAngles(new Date('2024-01-01 12:30:45'));
      const angles2 = getClockAngles(new Date('2024-06-15 12:30:45'));

      expect(angles1.hAng).toBeCloseTo(angles2.hAng, 5);
      expect(angles1.mAng).toBeCloseTo(angles2.mAng, 5);
      expect(angles1.sAng).toBeCloseTo(angles2.sAng, 5);
    });

    it('返回的角度应在 0 到 2π 范围内', () => {
      // 测试多个时间点
      const times = [
        '00:00:00',
        '03:00:00',
        '06:00:00',
        '09:00:00',
        '12:00:00',
        '15:00:00',
        '18:00:00',
        '21:00:00',
        '23:59:59',
      ];

      times.forEach((time) => {
        const angles = getClockAngles(new Date(`2024-01-01 ${time}`));

        expect(angles.hAng).toBeGreaterThanOrEqual(0);
        expect(angles.hAng).toBeLessThan(2 * Math.PI);

        expect(angles.mAng).toBeGreaterThanOrEqual(0);
        expect(angles.mAng).toBeLessThan(2 * Math.PI);

        expect(angles.sAng).toBeGreaterThanOrEqual(0);
        expect(angles.sAng).toBeLessThan(2 * Math.PI);
      });
    });

    it('应该返回包含 hAng、mAng、sAng 三个属性的对象', () => {
      const angles = getClockAngles(new Date());

      expect(angles).toHaveProperty('hAng');
      expect(angles).toHaveProperty('mAng');
      expect(angles).toHaveProperty('sAng');
    });

    it('三个角度应该都是数字类型', () => {
      const angles = getClockAngles(new Date());

      expect(typeof angles.hAng).toBe('number');
      expect(typeof angles.mAng).toBe('number');
      expect(typeof angles.sAng).toBe('number');
    });
  });
});
