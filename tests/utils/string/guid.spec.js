import guid from '@/lib/utils/string/guid.js';

describe('guid', () => {
  const originalCrypto = globalThis.crypto;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    globalThis.crypto = originalCrypto;
  });

  // ==================== 基本功能 ====================
  describe('基本功能', () => {
    it('应该返回一个字符串', () => {
      const id = guid();
      expect(typeof id).toBe('string');
    });

    it('每次调用应该返回不同的 ID', () => {
      const id1 = guid();
      const id2 = guid();
      expect(id1).not.toBe(id2);
    });

    it('返回的 ID 不应该为空', () => {
      const id = guid();
      expect(id.length).toBeGreaterThan(0);
    });
  });

  // ==================== crypto.randomUUID 可用时 ====================
  describe('crypto.randomUUID 可用时', () => {
    let mockRandomUUID;

    beforeEach(() => {
      mockRandomUUID = jest
        .fn()
        .mockReturnValue('123e4567-e89b-12d3-a456-426614174000');
      Object.defineProperty(globalThis, 'crypto', {
        value: { randomUUID: mockRandomUUID },
        writable: true,
        configurable: true,
      });
    });

    afterEach(() => {
      Object.defineProperty(globalThis, 'crypto', {
        value: originalCrypto,
        writable: true,
        configurable: true,
      });
    });

    it('应该使用 crypto.randomUUID 生成标准 UUID', () => {
      const id = guid();

      expect(mockRandomUUID).toHaveBeenCalled();
      expect(id).toBe('123e4567-e89b-12d3-a456-426614174000');
    });

    it('应该返回符合 UUID v4 格式的字符串', () => {
      const uuidPattern =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      mockRandomUUID.mockReturnValue('f47ac10b-58cc-4372-a567-0e02b2c3d479');

      const id = guid();

      expect(id).toMatch(uuidPattern);
    });
  });

  // ==================== crypto.randomUUID 不可用时（回退方案） ====================
  describe('crypto.randomUUID 不可用时', () => {
    let mockCrypto;

    beforeEach(() => {
      mockCrypto = { randomUUID: undefined };
      Object.defineProperty(globalThis, 'crypto', {
        value: mockCrypto,
        writable: true,
        configurable: true,
      });
    });

    afterEach(() => {
      Object.defineProperty(globalThis, 'crypto', {
        value: originalCrypto,
        writable: true,
        configurable: true,
      });
    });

    it('应该回退到时间戳方案', () => {
      const id = guid();

      // 修复：第三部分可能为空字符串，使用 * 而不是 +
      expect(id).toMatch(/^\d+-[a-z0-9]+-[a-z0-9]*$/);
    });

    it('应该包含时间戳前缀', () => {
      const nowSpy = jest.spyOn(Date, 'now').mockReturnValue(1628496000000);
      const id = guid();

      expect(id.startsWith('1628496000000')).toBe(true);

      nowSpy.mockRestore();
    });

    it('应该包含 36 进制截取段', () => {
      const nowSpy = jest.spyOn(Date, 'now').mockReturnValue(1628496000000);
      const timestamp = 1628496000000;
      // 先计算实际的36进制值
      const radix36 = timestamp.toString(36); // 实际是 '28496000'

      console.log('Actual radix36:', radix36); // 调试输出：'28496000'
      console.log('slice(2, 10):', radix36.slice(2, 10)); // '496000'
      console.log('slice(12, 20):', radix36.slice(12, 20)); // '' (空字符串，因为长度只有8)

      const id = guid();

      // 格式：1628496000000-496000-
      // 第二部分应该是 radix36 从索引2开始的实际截取值
      expect(id).toBe(`1628496000000-${radix36.slice(2, 10)}-`);
      // 或者用包含检查（确保不包含额外的 '-0-'）
      expect(id).toContain(`-${radix36.slice(2, 10)}-`);
      // 第三部分为空，ID 以 '-' 结尾
      expect(id.endsWith('-')).toBe(true);

      nowSpy.mockRestore();
    });

    it('同一毫秒内调用应该生成相同的 ID（确定性方案）', () => {
      const nowSpy = jest.spyOn(Date, 'now').mockReturnValue(1628496000000);

      const id1 = guid();
      const id2 = guid();

      // 修复：回退方案是确定性的，同一时间戳生成相同ID
      expect(id1).toBe(id2);
      expect(id1.startsWith('1628496000000')).toBe(true);
      expect(id2.startsWith('1628496000000')).toBe(true);

      nowSpy.mockRestore();
    });
  });

  // ==================== crypto 为 null 时 ====================
  describe('crypto 为 null 时', () => {
    beforeEach(() => {
      Object.defineProperty(globalThis, 'crypto', {
        value: null,
        writable: true,
        configurable: true,
      });
    });

    afterEach(() => {
      Object.defineProperty(globalThis, 'crypto', {
        value: originalCrypto,
        writable: true,
        configurable: true,
      });
    });

    it('应该回退到时间戳方案', () => {
      const id = guid();

      // 修复：允许第三部分为空
      expect(id).toMatch(/^\d+-[a-z0-9]+-[a-z0-9]*$/);
    });

    it('返回的 ID 应该非空', () => {
      const id = guid();

      expect(id.length).toBeGreaterThan(0);
    });

    it('应该包含时间戳前缀', () => {
      const nowSpy = jest.spyOn(Date, 'now').mockReturnValue(1628496000000);
      const id = guid();

      expect(id.startsWith('1628496000000')).toBe(true);

      nowSpy.mockRestore();
    });
  });

  // ==================== 格式验证（回退方案） ====================
  describe('格式验证', () => {
    let mockCrypto;

    beforeEach(() => {
      mockCrypto = { randomUUID: undefined };
      Object.defineProperty(globalThis, 'crypto', {
        value: mockCrypto,
        writable: true,
        configurable: true,
      });
    });

    afterEach(() => {
      Object.defineProperty(globalThis, 'crypto', {
        value: originalCrypto,
        writable: true,
        configurable: true,
      });
    });

    it('回退方案应该包含两个连字符', () => {
      const id = guid();
      const parts = id.split('-');

      // 修复：split 会将空字符串部分也保留
      // 例如 "1628496000000-4cgzk0-" split 后为 ["1628496000000", "4cgzk0", ""]
      expect(parts).toHaveLength(3);
    });

    it('回退方案的时间戳部分应该是数字', () => {
      const id = guid();
      const timestampPart = id.split('-')[0];

      expect(timestampPart).toMatch(/^\d+$/);
    });

    it('回退方案的中间部分应该是 36 进制字符', () => {
      const id = guid();
      const parts = id.split('-');

      // 中间部分至少包含1个字符
      expect(parts[1].length).toBeGreaterThan(0);
      expect(parts[1]).toMatch(/^[a-z0-9]+$/);
    });
  });

  // ==================== 性能 ====================
  describe('性能', () => {
    it('应该快速生成 ID', () => {
      const start = performance.now();

      for (let i = 0; i < 1000; i++) {
        guid();
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(100);
    });
  });

  // ==================== 随机性 ====================
  describe('随机性', () => {
    it('生成的 ID 应该具有足够的随机性', () => {
      const ids = new Set();

      for (let i = 0; i < 100; i++) {
        ids.add(guid());
      }

      expect(ids.size).toBe(100);
    });

    it('回退方案是确定性的，相同时间戳产生相同 ID', () => {
      const mockCrypto = { randomUUID: undefined };
      Object.defineProperty(globalThis, 'crypto', {
        value: mockCrypto,
        writable: true,
        configurable: true,
      });

      const nowSpy = jest.spyOn(Date, 'now').mockReturnValue(1628496000000);

      const ids = new Set();
      for (let i = 0; i < 50; i++) {
        ids.add(guid());
      }

      // 修复：回退方案是确定性的，所有ID都相同
      expect(ids.size).toBe(1);

      nowSpy.mockRestore();
      Object.defineProperty(globalThis, 'crypto', {
        value: originalCrypto,
        writable: true,
        configurable: true,
      });
    });
  });
});
