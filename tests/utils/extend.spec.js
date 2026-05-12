import hasOwn from '@/lib/utils/has-own.js';
import extend from '@/lib/utils/extend.js';

// Mock hasOwn 模块
jest.mock('@/lib/utils/has-own.js');

describe('extend', () => {
  beforeEach(() => {
    // 默认 mock：hasOwn 返回 true，模拟 Object.prototype.hasOwnProperty 的行为
    hasOwn.mockImplementation((obj, prop) => {
      return Object.prototype.hasOwnProperty.call(obj, prop);
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('基本功能', () => {
    it('应该将 source 的属性复制到 origin 上', () => {
      const origin = { a: 1 };
      const source = { b: 2, c: 3 };
      const result = extend(origin, source);

      expect(result).toBe(origin);
      expect(origin).toEqual({ a: 1, b: 2, c: 3 });
    });

    it('当属性重名时，source 应该覆盖 origin 的属性', () => {
      const origin = { a: 1, b: 2 };
      const source = { b: 3, c: 4 };

      extend(origin, source);

      expect(origin).toEqual({ a: 1, b: 3, c: 4 });
    });

    it('应该返回 origin 对象本身', () => {
      const origin = {};
      const source = { a: 1 };
      const result = extend(origin, source);

      expect(result).toBe(origin);
    });
  });

  describe('hasOwn 调用验证', () => {
    it('应该使用 hasOwn 来判断是否为自身属性', () => {
      const origin = {};
      const source = { a: 1, b: 2 };

      extend(origin, source);

      expect(hasOwn).toHaveBeenCalledTimes(2);
      expect(hasOwn).toHaveBeenCalledWith(source, 'a');
      expect(hasOwn).toHaveBeenCalledWith(source, 'b');
    });

    it('当 hasOwn 返回 false 时，不应该复制该属性', () => {
      const origin = {};
      const source = { a: 1, b: 2, c: 3 };

      // hasOwn 对属性 'b' 返回 false
      hasOwn.mockImplementation((obj, prop) => {
        return prop !== 'b';
      });

      extend(origin, source);

      // 'b' 不应被复制
      expect(origin).toHaveProperty('a');
      expect(origin).not.toHaveProperty('b');
      expect(origin).toHaveProperty('c');
      expect(origin.a).toBe(1);
      expect(origin.c).toBe(3);
    });
  });

  describe('for...in 遍历测试', () => {
    it('应该遍历所有可枚举属性，包括继承来的可枚举属性', () => {
      // 创建一个原型上有可枚举属性的对象
      const parent = { parentProp: 'inherited' };
      const source = Object.create(parent);
      source.ownProp = 'own';

      // 默认 mock 下，hasOwn 会正确区分自身属性和原型属性
      extend({}, source);

      // hasOwn 应该对两个属性都进行判断
      expect(hasOwn).toHaveBeenCalledWith(source, 'ownProp');
      expect(hasOwn).toHaveBeenCalledWith(source, 'parentProp');
    });

    it('不应该遍历不可枚举属性', () => {
      const origin = {};
      const source = { a: 1 };

      // 添加不可枚举属性
      Object.defineProperty(source, 'hidden', {
        value: 'secret',
        enumerable: false,
      });

      extend(origin, source);

      // 不可枚举属性不会被 for...in 遍历到
      expect(origin).not.toHaveProperty('hidden');
      expect(origin).toHaveProperty('a');
      // hasOwn 只应该被调用一次（只遍历了 'a'）
      expect(hasOwn).toHaveBeenCalledTimes(1);
    });
  });

  describe('边界情况', () => {
    it('source 为空对象时，origin 应该保持不变', () => {
      const origin = { a: 1, b: 2 };
      const source = {};

      extend(origin, source);

      expect(origin).toEqual({ a: 1, b: 2 });
      expect(hasOwn).not.toHaveBeenCalled();
    });

    it('origin 为空对象时，应该正常复制属性', () => {
      const origin = {};
      const source = { a: 1, b: 2 };

      extend(origin, source);

      expect(origin).toEqual({ a: 1, b: 2 });
    });

    it('两个空对象应该正常工作', () => {
      const origin = {};
      const source = {};

      extend(origin, source);

      expect(origin).toEqual({});
      expect(hasOwn).not.toHaveBeenCalled();
    });

    it('应该正确处理不同数据类型的属性值', () => {
      const origin = {};
      const source = {
        str: 'string',
        num: 123,
        bool: true,
        arr: [1, 2, 3],
        obj: { nested: 'value' },
        nullVal: null,
        undefinedVal: undefined,
      };

      extend(origin, source);

      // undefined 值也应该被复制
      expect(origin).toEqual(source);
      expect(origin.undefinedVal).toBeUndefined();
      expect(origin.nullVal).toBeNull();
    });

    it('嵌套对象应该保持引用关系（浅拷贝）', () => {
      const origin = {};
      const nestedObj = { nested: 'value' };
      const source = { obj: nestedObj };

      extend(origin, source);

      expect(origin.obj).toBe(nestedObj);
    });

    it('应该正确处理单个属性的对象', () => {
      const origin = {};
      const source = { single: true };

      extend(origin, source);

      expect(origin).toEqual({ single: true });
      expect(hasOwn).toHaveBeenCalledTimes(1);
    });
  });

  describe('原始对象修改验证', () => {
    it('应该直接修改传入的 origin 对象', () => {
      const origin = { original: true };
      const source = { new: true };
      const originRef = origin;

      extend(origin, source);

      expect(origin).toBe(originRef);
      expect(origin.original).toBe(true);
      expect(origin.new).toBe(true);
    });

    it('多次 extend 应该累积属性', () => {
      const origin = {};

      extend(origin, { a: 1 });
      expect(origin).toEqual({ a: 1 });

      extend(origin, { b: 2 });
      expect(origin).toEqual({ a: 1, b: 2 });

      extend(origin, { a: 'updated', c: 3 });
      expect(origin).toEqual({ a: 'updated', b: 2, c: 3 });
    });
  });

  describe('Symbol 属性', () => {
    it('不应该遍历 Symbol 属性（for...in 不遍历 Symbol）', () => {
      const origin = {};
      const sym = Symbol('test');
      const source = {
        regular: 'value',
        [sym]: 'symbolValue',
      };

      extend(origin, source);

      expect(origin.regular).toBe('value');
      expect(origin[sym]).toBeUndefined();
    });
  });
});
