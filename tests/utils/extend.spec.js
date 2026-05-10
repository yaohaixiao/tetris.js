import extend from '@/lib/utils/extend.js';

describe('extend', () => {
  describe('基础功能', () => {
    it('应该将 source 属性复制到 origin', () => {
      const origin = { a: 1 };
      const source = { b: 2, c: 3 };

      extend(origin, source);

      expect(origin).toEqual({ a: 1, b: 2, c: 3 });
    });

    it('应该覆盖同名属性', () => {
      const origin = { a: 1, b: 2 };
      const source = { b: 3, c: 4 };

      extend(origin, source);

      expect(origin).toEqual({ a: 1, b: 3, c: 4 });
      expect(origin.b).toBe(3);
    });

    it('应该修改 origin 本身（非纯函数）', () => {
      const origin = { a: 1 };
      extend(origin, { b: 2 });

      expect(origin).toEqual({ a: 1, b: 2 });
      expect(origin.b).toBe(2);
    });
  });

  describe('属性值类型', () => {
    it('应该复制各类属性值', () => {
      const origin = {};
      const source = {
        str: 'hello',
        num: 42,
        bool: true,
        arr: [1, 2, 3],
        obj: { nested: true },
        fn: () => {},
        undef: undefined,
        nil: null,
      };

      extend(origin, source);

      expect(origin).toEqual(source);
    });

    it('应该浅拷贝引用类型', () => {
      const arr = [1, 2, 3];
      const origin = {};
      const source = { arr };

      extend(origin, source);

      expect(origin.arr).toBe(arr);
    });
  });

  describe('原型链处理', () => {
    it('不应该复制原型链上的属性', () => {
      const origin = {};
      function SourceClass() {
        this.ownProp = 'own';
      }
      SourceClass.prototype.protoProp = 'proto';

      const source = new SourceClass();
      extend(origin, source);

      expect(origin.ownProp).toBe('own');
      expect(origin.protoProp).toBeUndefined();
      expect('protoProp' in origin).toBe(false);
    });

    it('不应该复制 Object.prototype 上的属性', () => {
      const origin = Object.create(null); // 用纯净对象
      const source = { a: 1 };

      extend(origin, source);

      expect(origin.a).toBe(1);
      expect(origin.toString).toBeUndefined();
      expect(origin.hasOwnProperty).toBeUndefined();
    });
  });

  describe('边界情况', () => {
    it('空 source 对象', () => {
      const origin = { a: 1 };

      extend(origin, {});

      expect(origin).toEqual({ a: 1 });
    });

    it('空 origin 对象', () => {
      const origin = {};

      extend(origin, { a: 1 });

      expect(origin).toEqual({ a: 1 });
    });

    it('source 为 Object.create(null)', () => {
      const origin = {};
      const source = Object.create(null);
      source.a = 1;
      source.b = 2;

      extend(origin, source);

      expect(origin).toEqual({ a: 1, b: 2 });
    });

    it('同名属性覆盖包含原型属性的对象', () => {
      const origin = Object.create({ inherited: 'old' });
      origin.own = 'own';

      extend(origin, { own: 'new', inherited: 'new' });

      expect(origin.own).toBe('new');
      expect(origin.inherited).toBe('new');
      expect(origin.inherited).toBe('new');
    });
  });
});
