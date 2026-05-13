import extend from '@/lib/utils/extend.js';
import hasOwn from '@/lib/utils/has-own.js';

// Mock hasOwn
jest.mock('@/lib/utils/has-own.js', () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe('extend', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // 默认 hasOwn 返回 true
    hasOwn.mockReturnValue(true);
  });

  // ==================== 基本功能 ====================
  describe('基本功能', () => {
    it('应该将 source 的属性复制到 origin', () => {
      const origin = { a: 1 };
      const source = { b: 2, c: 3 };

      extend(origin, source);

      expect(origin).toEqual({ a: 1, b: 2, c: 3 });
    });

    it('应该返回 origin 对象', () => {
      const origin = { a: 1 };
      const source = { b: 2 };

      const result = extend(origin, source);

      expect(result).toBe(origin);
    });

    it('应该覆盖同名字段', () => {
      const origin = { a: 1, b: 'old' };
      const source = { b: 'new', c: 3 };

      extend(origin, source);

      expect(origin).toEqual({ a: 1, b: 'new', c: 3 });
    });
  });

  // ==================== hasOwn 过滤 ====================
  describe('hasOwn 过滤', () => {
    it('应该只复制自有属性，跳过原型链属性', () => {
      const origin = {};
      const source = Object.create({ inherited: 'from prototype' });
      source.own = 'own property';

      // 只对 own 返回 true
      hasOwn.mockImplementation((obj, prop) => prop === 'own');

      extend(origin, source);

      expect(origin.own).toBe('own property');
      expect(origin.inherited).toBeUndefined();
    });

    it('hasOwn 返回 false 时应该跳过该属性', () => {
      const origin = { a: 1 };
      const source = { b: 2, c: 3 };

      // 只对 b 返回 true，c 跳过
      hasOwn.mockImplementation((obj, prop) => prop === 'b');

      extend(origin, source);

      expect(origin.b).toBe(2);
      expect(origin.c).toBeUndefined();
    });

    it('应该对每个属性调用 hasOwn', () => {
      const origin = {};
      const source = { x: 1, y: 2, z: 3 };

      extend(origin, source);

      expect(hasOwn).toHaveBeenCalledWith(source, 'x');
      expect(hasOwn).toHaveBeenCalledWith(source, 'y');
      expect(hasOwn).toHaveBeenCalledWith(source, 'z');
    });
  });

  // ==================== for...in 遍历特性 ====================
  describe('for...in 遍历特性', () => {
    it('应该遍历所有可枚举属性', () => {
      const origin = {};
      const source = { a: 1, b: 2, c: 3 };

      extend(origin, source);

      expect(Object.keys(origin)).toHaveLength(3);
    });

    it('不应该遍历不可枚举属性', () => {
      const origin = {};
      const source = { visible: 1 };

      Object.defineProperty(source, 'hidden', {
        value: 'secret',
        enumerable: false,
      });

      extend(origin, source);

      expect(origin.visible).toBe(1);
      expect(origin.hidden).toBeUndefined();
    });
  });

  // ==================== 边界情况 ====================
  describe('边界情况', () => {
    it('source 为空对象时应该保持 origin 不变', () => {
      const origin = { a: 1, b: 2 };
      const source = {};

      extend(origin, source);

      expect(origin).toEqual({ a: 1, b: 2 });
    });

    it('origin 为空对象时应该复制所有属性', () => {
      const origin = {};
      const source = { a: 1, b: 2 };

      extend(origin, source);

      expect(origin).toEqual({ a: 1, b: 2 });
    });

    it('source 包含各种类型的属性值', () => {
      const origin = {};
      const fn = () => {};
      const source = {
        str: 'hello',
        num: 42,
        bool: true,
        arr: [1, 2, 3],
        obj: { nested: 'value' },
        func: fn,
        nul: null,
        und: undefined,
      };

      extend(origin, source);

      expect(origin.str).toBe('hello');
      expect(origin.num).toBe(42);
      expect(origin.bool).toBe(true);
      expect(origin.arr).toEqual([1, 2, 3]);
      expect(origin.obj).toEqual({ nested: 'value' });
      expect(origin.func).toBe(fn);
      expect(origin.nul).toBeNull();
      expect(origin.und).toBeUndefined();
    });

    it('不应该修改 source 对象', () => {
      const origin = { a: 1 };
      const source = { b: 2, c: 3 };
      const sourceCopy = { ...source };

      extend(origin, source);

      expect(source).toEqual(sourceCopy);
    });

    it('多次 extend 应该正确叠加', () => {
      const origin = { base: 0 };

      extend(origin, { a: 1 });
      extend(origin, { b: 2 });
      extend(origin, { c: 3 });

      expect(origin).toEqual({ base: 0, a: 1, b: 2, c: 3 });
    });

    it('链式调用多次返回同一个 origin', () => {
      const origin = {};
      const result = extend(origin, { a: 1 });

      extend(result, { b: 2 });
      extend(result, { c: 3 });

      expect(result).toBe(origin);
      expect(origin).toEqual({ a: 1, b: 2, c: 3 });
    });
  });
});
