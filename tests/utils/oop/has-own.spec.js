import hasOwn from '@/lib/utils/oop/has-own.js';

describe('hasOwn', () => {
  describe('应该返回 true', () => {
    it('对象自身包含指定属性', () => {
      expect(hasOwn({ a: 1 }, 'a')).toBe(true);
    });

    it('属性值为 falsy 时也能检测到', () => {
      expect(hasOwn({ a: undefined }, 'a')).toBe(true);
      expect(hasOwn({ a: null }, 'a')).toBe(true);
      expect(hasOwn({ a: '' }, 'a')).toBe(true);
      expect(hasOwn({ a: 0 }, 'a')).toBe(true);
      expect(hasOwn({ a: false }, 'a')).toBe(true);
    });

    it('Objec.prototype 上的属性也会检测到', () => {
      const obj = {};
      obj.hasOwnProperty = () => true;
      expect(hasOwn(obj, 'hasOwnProperty')).toBe(true);
      expect(hasOwn(obj, 'toString')).toBe(false);
    });
  });

  describe('应该返回 false', () => {
    it('属性在原型链上', () => {
      expect(hasOwn({}, 'toString')).toBe(false);
      expect(hasOwn({}, 'hasOwnProperty')).toBe(false);
    });

    it('属性不存在', () => {
      expect(hasOwn({ a: 1 }, 'b')).toBe(false);
    });

    it('对象为 null 或 undefined', () => {
      expect(hasOwn(null, 'a')).toBe(false);
      expect(hasOwn(undefined, 'a')).toBe(false);
    });

    it('对象调用 hasOwnProperty 被覆写', () => {
      const obj = {
        hasOwnProperty: () => false,
        a: 1,
      };
      expect(obj.hasOwnProperty('a')).toBe(false);
      expect(hasOwn(obj, 'a')).toBe(true);
    });

    it('Object.create(null) 创建的对象', () => {
      const obj = Object.create(null);
      obj.a = 1;
      expect(hasOwn(obj, 'a')).toBe(true);
      expect(hasOwn(obj, 'toString')).toBe(false);
    });
  });

  describe('边界情况', () => {
    it('空对象', () => {
      expect(hasOwn({}, 'a')).toBe(false);
    });

    it('属性名为 Symbol（转字符串）', () => {
      const sym = Symbol('test');
      const obj = { [sym]: 'value' };
      expect(hasOwn(obj, sym)).toBe(true);
    });
  });
});
