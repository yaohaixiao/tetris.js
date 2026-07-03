/** @file 垃圾行系统单元测试 - 完整修正版 */

import { calculateGarbage, applyGarbage } from '@/lib/battle/rules/garbage-system.js';
import COLORS from '@/lib/constants/colors.js';
import lighten from '@/lib/utils/color/lighten.js';

jest.mock('@/lib/constants/colors.js', () => ({
  BLACK: '#000000',
}));

jest.mock('@/lib/utils/color/lighten.js', () => {
  return jest.fn((color, amount) => `lightened(${color}, ${amount})`);
});

describe('Garbage System', () => {
  const createEmptyBoard = (rows = 20, cols = 10) => {
    return Array.from({ length: rows }, () => Array(cols).fill(0));
  };

  const createFilledBoard = (rows = 20, cols = 10, value = 1) => {
    return Array.from({ length: rows }, () => Array(cols).fill(value));
  };

  // ==================== calculateGarbage ====================

  describe('calculateGarbage', () => {
    test('消 1 行应该返回 0（无攻击）', () => {
      expect(calculateGarbage(1)).toBe(0);
    });

    test('消 2 行应该返回 1', () => {
      expect(calculateGarbage(2)).toBe(1);
    });

    test('消 3 行应该返回 2', () => {
      expect(calculateGarbage(3)).toBe(2);
    });

    test('消 4 行应该返回 3（Tetris）', () => {
      expect(calculateGarbage(4)).toBe(3);
    });

    test('消 5 行应该返回 4（超级消除）', () => {
      expect(calculateGarbage(5)).toBe(4);
    });

    test('消 0 行应该返回 0', () => {
      expect(calculateGarbage(0)).toBe(0);
    });

    test('消 6 行（超出映射表）应该返回 0', () => {
      expect(calculateGarbage(6)).toBe(0);
    });

    test('消 10 行（超出映射表）应该返回 0', () => {
      expect(calculateGarbage(10)).toBe(0);
    });

    test('负数消行应该返回 0', () => {
      expect(calculateGarbage(-1)).toBe(0);
    });

    test('应该返回数字类型', () => {
      const result = calculateGarbage(4);
      expect(typeof result).toBe('number');
    });

    test('所有有效消行数的对照验证', () => {
      const expectedMap = { 0: 0, 1: 0, 2: 1, 3: 2, 4: 3, 5: 4 };
      Object.entries(expectedMap).forEach(([lines, expected]) => {
        expect(calculateGarbage(Number(lines))).toBe(expected);
      });
    });

    test('应该处理 undefined 参数', () => {
      expect(calculateGarbage(undefined)).toBe(0);
    });

    test('应该处理 null 参数', () => {
      expect(calculateGarbage(null)).toBe(0);
    });

    test('应该处理非数字参数', () => {
      expect(calculateGarbage('4')).toBe(3);
      expect(calculateGarbage('invalid')).toBe(0);
    });

    test('相同消行数多次调用结果应一致', () => {
      for (let i = 0; i < 10; i++) {
        expect(calculateGarbage(4)).toBe(3);
      }
    });
  });

  // ==================== applyGarbage ====================

  describe('applyGarbage', () => {
    // ==================== 基本功能 ====================
    describe('基本功能', () => {
      test('应该在棋盘底部添加垃圾行', () => {
        const board = createEmptyBoard(10, 5);
        const result = applyGarbage(board, 2, 'easy');

        expect(result.length).toBe(10);

        // 顶部 8 行是原棋盘的底部 8 行（移除了顶部 2 行）
        for (let i = 0; i < 8; i++) {
          expect(result[i]).toEqual(board[i + 2]);
        }

        // 底部 2 行不是全 0（是垃圾行）
        expect(result[8]).not.toEqual(Array(5).fill(0));
        expect(result[9]).not.toEqual(Array(5).fill(0));
      });

      test('应该不修改原棋盘', () => {
        const board = createEmptyBoard(10, 5);
        const original = JSON.stringify(board);

        applyGarbage(board, 2, 'easy');

        expect(JSON.stringify(board)).toBe(original);
      });

      test('amount 为 0 时应返回原棋盘引用', () => {
        const board = createEmptyBoard(10, 5);
        expect(applyGarbage(board, 0, 'easy')).toBe(board);
      });

      test('amount 为负数时应返回原棋盘引用', () => {
        const board = createEmptyBoard(10, 5);
        expect(applyGarbage(board, -1, 'easy')).toBe(board);
      });

      test('amount > 0 时返回新数组引用', () => {
        const board = createEmptyBoard(10, 5);
        expect(applyGarbage(board, 2, 'easy')).not.toBe(board);
      });

      test('amount 为 NaN 时不返回原引用（NaN <= 0 为 false）', () => {
        const board = createEmptyBoard(10, 5);
        const result = applyGarbage(board, NaN, 'easy');
        // NaN <= 0 → false，进入处理逻辑，生成新数组
        expect(result).not.toBe(board);
      });
    });

    // ==================== 棋盘行数 ====================
    describe('棋盘行数', () => {
      test('添加垃圾行后棋盘行数应保持不变', () => {
        const testCases = [
          { rows: 20, cols: 10, amount: 3 },
          { rows: 15, cols: 8, amount: 5 },
          { rows: 10, cols: 6, amount: 1 },
          { rows: 5, cols: 4, amount: 2 },
        ];

        testCases.forEach(({ rows, cols, amount }) => {
          const board = createEmptyBoard(rows, cols);
          const result = applyGarbage(board, amount, 'easy');
          expect(result.length).toBe(rows);
        });
      });

      test('amount 等于棋盘高度时应替换所有行', () => {
        const board = createFilledBoard(10, 5, 1);
        const result = applyGarbage(board, 10, 'easy');

        expect(result.length).toBe(10);
        result.forEach((row) => {
          expect(row).not.toEqual(Array(5).fill(1));
        });
      });

      test('amount 超过棋盘高度时结果行数等于 amount', () => {
        const board = createFilledBoard(5, 5, 1);
        const result = applyGarbage(board, 10, 'easy');

        // splice(0, 10) 移除全部 5 行，push 10 行 → 10 行
        expect(result.length).toBe(10);
        result.forEach((row) => {
          const holeCount = row.filter((c) => c === 0).length;
          expect(holeCount).toBeGreaterThan(0);
        });
      });

      test('splice 移除后行数应正确', () => {
        const board = createFilledBoard(10, 3, 1);
        const result = applyGarbage(board, 3, 'easy');

        expect(result.length).toBe(10);
        for (let i = 0; i < 7; i++) {
          expect(result[i]).toEqual(board[i + 3]);
        }
      });
    });

    // ==================== 垃圾行结构 ====================
    describe('垃圾行结构', () => {
      test('垃圾行应使用 lighten 处理后的颜色', () => {
        const board = createEmptyBoard(10, 10);
        const result = applyGarbage(board, 1, 'easy');

        const garbageRow = result[9];
        const expectedColor = lighten(COLORS.BLACK, 0.6);
        const nonHoleCells = garbageRow.filter((cell) => cell !== 0);

        expect(nonHoleCells.length).toBeGreaterThan(0);
        nonHoleCells.forEach((cell) => {
          expect(cell).toBe(expectedColor);
        });
      });

      test('lighten 应该被正确调用', () => {
        lighten.mockClear();
        applyGarbage(createEmptyBoard(10, 5), 1, 'easy');
        expect(lighten).toHaveBeenCalledWith('#000000', 0.6);
      });

      test('垃圾行应包含正确数量的空洞', () => {
        const board = createEmptyBoard(10, 10);
        const result = applyGarbage(board, 3, 'normal');

        for (let i = 7; i < 10; i++) {
          const holeCount = result[i].filter((cell) => cell === 0).length;
          expect(holeCount).toBe(2);
        }
      });

      test('空洞位置应为 0', () => {
        const board = createEmptyBoard(10, 10);
        const result = applyGarbage(board, 2, 'easy');

        for (let i = 8; i < 10; i++) {
          const holes = result[i].filter((cell) => cell === 0);
          expect(holes.length).toBeGreaterThan(0);
          holes.forEach((hole) => {
            expect(hole).toBe(0);
          });
        }
      });

      test('非空洞位置不应为 0', () => {
        const board = createEmptyBoard(10, 5);
        const result = applyGarbage(board, 2, 'easy');

        const expectedColor = lighten(COLORS.BLACK, 0.6);
        for (let i = 8; i < 10; i++) {
          result[i].forEach((cell) => {
            if (cell !== 0) {
              expect(cell).toBe(expectedColor);
            }
          });
        }
      });

      test('每行垃圾的空洞位置应随机', () => {
        const board = createEmptyBoard(10, 10);
        const result = applyGarbage(board, 5, 'normal');

        const holePositions = [];
        for (let i = 5; i < 10; i++) {
          const holes = [];
          result[i].forEach((cell, index) => {
            if (cell === 0) holes.push(index);
          });
          holePositions.push(JSON.stringify(holes));
        }

        // 5 行全相同的概率极低
        const uniquePositions = new Set(holePositions);
        expect(uniquePositions.size).toBeGreaterThan(1);
      });

      test('垃圾行的每格类型（lighten 返回字符串）', () => {
        const board = createEmptyBoard(10, 5);
        const result = applyGarbage(board, 1, 'easy');

        const garbageRow = result[9];
        garbageRow.forEach((cell) => {
          if (cell !== 0) {
            expect(typeof cell).toBe('string');
          } else {
            expect(typeof cell).toBe('number');
          }
        });
      });

      test('垃圾行的长度应等于棋盘宽度', () => {
        const board = createEmptyBoard(10, 7);
        const result = applyGarbage(board, 2, 'easy');

        for (let i = 8; i < 10; i++) {
          expect(result[i].length).toBe(7);
        }
      });
    });

    // ==================== 难度等级 ====================
    describe('难度等级', () => {
      test('easy 难度每行应有 1 个空洞', () => {
        const board = createEmptyBoard(10, 10);
        const result = applyGarbage(board, 3, 'easy');

        for (let i = 7; i < 10; i++) {
          expect(result[i].filter((c) => c === 0).length).toBe(1);
        }
      });

      test('normal 难度每行应有 2 个空洞', () => {
        const board = createEmptyBoard(10, 10);
        const result = applyGarbage(board, 3, 'normal');

        for (let i = 7; i < 10; i++) {
          expect(result[i].filter((c) => c === 0).length).toBe(2);
        }
      });

      test('hard 难度每行应有 3 个空洞', () => {
        const board = createEmptyBoard(10, 10);
        const result = applyGarbage(board, 3, 'hard');

        for (let i = 7; i < 10; i++) {
          expect(result[i].filter((c) => c === 0).length).toBe(3);
        }
      });

      test('expert 难度每行应有 4 个空洞', () => {
        const board = createEmptyBoard(10, 10);
        const result = applyGarbage(board, 3, 'expert');

        for (let i = 7; i < 10; i++) {
          expect(result[i].filter((c) => c === 0).length).toBe(4);
        }
      });

      test('未知难度应默认为 1 个空洞', () => {
        const board = createEmptyBoard(10, 10);
        const result = applyGarbage(board, 3, 'unknown');

        for (let i = 7; i < 10; i++) {
          expect(result[i].filter((c) => c === 0).length).toBe(1);
        }
      });

      test('不传 difficulty 应默认为 1 个空洞', () => {
        const board = createEmptyBoard(10, 10);
        const result = applyGarbage(board, 3, undefined);

        for (let i = 7; i < 10; i++) {
          expect(result[i].filter((c) => c === 0).length).toBe(1);
        }
      });

      test('null difficulty 应默认为 1 个空洞', () => {
        const board = createEmptyBoard(10, 10);
        const result = applyGarbage(board, 3, null);

        for (let i = 7; i < 10; i++) {
          expect(result[i].filter((c) => c === 0).length).toBe(1);
        }
      });

      test('不同难度应有不同数量的空洞', () => {
        const board = createEmptyBoard(10, 10);

        const easyResult = applyGarbage(board, 1, 'easy');
        const expertResult = applyGarbage(board, 1, 'expert');

        const easyHoles = easyResult[9].filter((c) => c === 0).length;
        const expertHoles = expertResult[9].filter((c) => c === 0).length;

        expect(easyHoles).toBe(1);
        expect(expertHoles).toBe(4);
        expect(easyHoles).not.toBe(expertHoles);
      });

      test('所有难度等级都应正确映射', () => {
        const board = createEmptyBoard(10, 10);
        const difficultyMap = { easy: 1, normal: 2, hard: 3, expert: 4 };

        Object.entries(difficultyMap).forEach(([diff, expected]) => {
          const result = applyGarbage(board, 1, diff);
          expect(result[9].filter((c) => c === 0).length).toBe(expected);
        });
      });
    });

    // ==================== 空洞位置验证 ====================
    describe('空洞位置验证', () => {
      test('同一行空洞不应重复（Set 去重）', () => {
        const board = createEmptyBoard(10, 10);

        for (let test = 0; test < 10; test++) {
          const result = applyGarbage(board, 1, 'expert');
          const garbageRow = result[9];

          const holeIndices = [];
          garbageRow.forEach((cell, index) => {
            if (cell === 0) holeIndices.push(index);
          });

          const uniqueHoles = new Set(holeIndices);
          expect(uniqueHoles.size).toBe(holeIndices.length);
        }
      });

      test('空洞位置在有效范围内', () => {
        const board = createEmptyBoard(10, 5);

        for (let test = 0; test < 10; test++) {
          const result = applyGarbage(board, 1, 'normal');
          const garbageRow = result[9];

          garbageRow.forEach((cell, index) => {
            if (cell === 0) {
              expect(index).toBeGreaterThanOrEqual(0);
              expect(index).toBeLessThan(5);
            }
          });
        }
      });

      test('宽棋盘应能生成多个空洞', () => {
        const wideBoard = createEmptyBoard(10, 20);

        const result = applyGarbage(wideBoard, 1, 'expert');
        const garbageRow = result[9];
        expect(garbageRow.filter((c) => c === 0).length).toBe(4);
      });

      test('棋盘宽度足够时应生成指定数量的空洞', () => {
        const difficulties = [
          { name: 'easy', expected: 1, width: 5 },
          { name: 'normal', expected: 2, width: 5 },
          { name: 'hard', expected: 3, width: 5 },
          { name: 'expert', expected: 4, width: 10 },
        ];

        difficulties.forEach(({ name, expected, width }) => {
          const board = createEmptyBoard(10, width);
          const result = applyGarbage(board, 1, name);
          expect(result[9].filter((c) => c === 0).length).toBe(expected);
        });
      });

      test('每行空洞数至少为 1', () => {
        const board = createEmptyBoard(10, 10);
        ['easy', 'normal', 'hard', 'expert'].forEach((diff) => {
          const result = applyGarbage(board, 1, diff);
          expect(
            result[9].filter((c) => c === 0).length,
          ).toBeGreaterThanOrEqual(1);
        });
      });
    });

    // ==================== 棋盘数据完整性 ====================
    describe('棋盘数据完整性', () => {
      test('保留的行内容不应被修改', () => {
        const board = createFilledBoard(10, 5, 7);
        const result = applyGarbage(board, 3, 'easy');

        for (let i = 0; i < 7; i++) {
          expect(result[i]).toEqual(Array(5).fill(7));
        }
      });

      test('多行垃圾应正确排列', () => {
        const board = createFilledBoard(10, 5, 1);
        const result = applyGarbage(board, 3, 'easy');

        for (let i = 0; i < 7; i++) {
          expect(result[i]).toEqual(board[i + 3]);
        }

        const expectedColor = lighten(COLORS.BLACK, 0.6);
        for (let i = 7; i < 10; i++) {
          result[i].forEach((cell) => {
            if (cell !== 0) {
              expect(cell).toBe(expectedColor);
            }
          });
        }
      });

      test('结果独立于原棋盘（修改结果不影响原棋盘）', () => {
        const board = createFilledBoard(10, 5, 1);
        const result = applyGarbage(board, 2, 'easy');

        result[0][0] = 999;
        expect(board[0][0]).toBe(1);
      });

      test('原棋盘修改不影响已生成的结果', () => {
        const board = createFilledBoard(10, 5, 1);
        const result = applyGarbage(board, 2, 'easy');

        board[5][0] = 888;
        expect(result[5]).not.toContain(888);
      });

      test('两次调用返回不同棋盘（浅拷贝行独立）', () => {
        const board = createEmptyBoard(10, 5);

        const result1 = applyGarbage(board, 1, 'easy');
        const result2 = applyGarbage(board, 1, 'easy');

        expect(result1).not.toBe(result2);
        // 共享的行引用是浅拷贝的正常行为
      });

      test('棋盘所有行应有相同的长度', () => {
        const board = createEmptyBoard(10, 5);
        const result = applyGarbage(board, 3, 'easy');

        const width = result[0].length;
        result.forEach((row) => {
          expect(row.length).toBe(width);
        });
      });
    });

    // ==================== 边界情况 ====================
    describe('边界情况', () => {
      test('空棋盘 amount = 0 返回原引用', () => {
        const board = [];
        expect(applyGarbage(board, 0, 'easy')).toBe(board);
      });

      test('空棋盘 amount > 0 会报错', () => {
        const board = [];
        expect(() => applyGarbage(board, 1, 'easy')).toThrow();
      });

      test('单行棋盘', () => {
        const board = createEmptyBoard(1, 10);
        const result = applyGarbage(board, 1, 'easy');

        expect(result.length).toBe(1);
        expect(result[0].filter((c) => c === 0).length).toBe(1);
      });

      test('单列棋盘', () => {
        const board = createEmptyBoard(10, 1);
        const result = applyGarbage(board, 2, 'easy');

        expect(result.length).toBe(10);
        expect(result[9].filter((c) => c === 0).length).toBe(1);
      });

      test('单行单列棋盘', () => {
        const board = createEmptyBoard(1, 1);
        const result = applyGarbage(board, 1, 'easy');

        expect(result.length).toBe(1);
        expect(result[0].length).toBe(1);
        expect(result[0][0]).toBe(0);
      });

      test('大量垃圾行（100行）', () => {
        const board = createFilledBoard(200, 10, 1);
        const result = applyGarbage(board, 100, 'normal');

        expect(result.length).toBe(200);

        for (let i = 0; i < 100; i++) {
          expect(result[i]).toEqual(board[i + 100]);
        }

        const expectedColor = lighten(COLORS.BLACK, 0.6);
        for (let i = 100; i < 200; i++) {
          result[i].forEach((cell) => {
            if (cell !== 0) {
              expect(cell).toBe(expectedColor);
            }
          });
        }
      });

      test('amount 超过高度：结果行数 = amount', () => {
        const board = createFilledBoard(5, 10, 1);
        const result = applyGarbage(board, 10, 'easy');

        // splice(0, 10) 清空 5 行，push 10 行 = 10 行
        expect(result.length).toBe(10);
        result.forEach((row) => {
          expect(row.filter((c) => c === 0).length).toBeGreaterThan(0);
        });
      });

      test('amount 为非常大的值', () => {
        const board = createFilledBoard(5, 5, 1);
        const result = applyGarbage(board, 1000, 'easy');

        // splice(0, 1000) 清空 5 行，push 1000 行 = 1000 行
        expect(result.length).toBe(1000);
        result.forEach((row) => {
          expect(row.filter((c) => c === 0).length).toBeGreaterThan(0);
        });
      });

      test('amount 为浮点数时循环次数 = ceil(amount)', () => {
        const board = createEmptyBoard(10, 5);
        const result = applyGarbage(board, 2.7, 'easy');

        // for (i = 0; i < 2.7; i++) → i = 0, 1, 2（3次）
        // splice(0, 2.7) → 移除 2 行
        // 10 - 2 + 3 = 11 行
        expect(result.length).toBe(11);
        for (let i = 8; i < 11; i++) {
          expect(result[i].filter((c) => c === 0).length).toBe(1);
        }
      });

      test('大棋盘（100x20）', () => {
        const board = createEmptyBoard(100, 20);
        const result = applyGarbage(board, 50, 'hard');

        expect(result.length).toBe(100);
        for (let i = 50; i < 100; i++) {
          expect(result[i].filter((c) => c === 0).length).toBe(3);
        }
      });
    });

    // ==================== 边缘情况 ====================
    describe('边缘情况', () => {
      test('棋盘所有格子为 0 时应用垃圾行', () => {
        const board = createEmptyBoard(5, 5);
        const result = applyGarbage(board, 2, 'normal');

        expect(result.length).toBe(5);
        for (let i = 3; i < 5; i++) {
          expect(result[i].filter((c) => c === 0).length).toBe(2);
        }
      });

      test('棋盘所有格子为非零时应用垃圾行', () => {
        const board = createFilledBoard(5, 5, 8);
        const result = applyGarbage(board, 1, 'hard');

        expect(result.length).toBe(5);
        for (let i = 0; i < 4; i++) {
          expect(result[i]).toEqual(Array(5).fill(8));
        }
        expect(result[4].filter((c) => c === 0).length).toBe(3);
      });

      test('棋盘包含混合值时', () => {
        const board = [
          [1, 2, 3],
          [4, 5, 6],
          [7, 8, 9],
        ];
        const result = applyGarbage(board, 1, 'easy');

        expect(result.length).toBe(3);
        expect(result[0]).toEqual([4, 5, 6]);
        expect(result[1]).toEqual([7, 8, 9]);
        expect(result[2].filter((c) => c === 0).length).toBe(1);
      });
    });
  });

  // ==================== 集成测试 ====================

  describe('集成测试', () => {
    test('计算攻击力并应用到棋盘', () => {
      const attack = calculateGarbage(4);
      expect(attack).toBe(3);

      const opponentBoard = createEmptyBoard(20, 10);
      const newBoard = applyGarbage(opponentBoard, attack, 'normal');

      expect(newBoard.length).toBe(20);
      expect(newBoard).not.toBe(opponentBoard);

      for (let i = 17; i < 20; i++) {
        expect(newBoard[i].filter((c) => c === 0).length).toBe(2);
      }
    });

    test('不同消行数的完整攻击流程', () => {
      const testCases = [
        { lines: 1, expectedAttack: 0 },
        { lines: 2, expectedAttack: 1 },
        { lines: 3, expectedAttack: 2 },
        { lines: 4, expectedAttack: 3 },
        { lines: 5, expectedAttack: 4 },
      ];

      testCases.forEach(({ lines, expectedAttack }) => {
        const attack = calculateGarbage(lines);
        expect(attack).toBe(expectedAttack);

        if (attack > 0) {
          const board = createEmptyBoard(10, 5);
          const result = applyGarbage(board, attack, 'easy');
          expect(result.length).toBe(10);
        }
      });
    });

    test('多次攻防交互模拟', () => {
      let board = createEmptyBoard(20, 10);

      board = applyGarbage(board, 3, 'normal');
      expect(board.length).toBe(20);

      board = applyGarbage(board, 2, 'hard');
      expect(board.length).toBe(20);

      // 底部 2 行是 hard（3 孔）
      for (let i = 18; i < 20; i++) {
        expect(board[i].filter((c) => c === 0).length).toBe(3);
      }
      // 倒数 3-5 行是 normal（2 孔）
      for (let i = 15; i < 18; i++) {
        expect(board[i].filter((c) => c === 0).length).toBe(2);
      }
    });

    test('难度递增的垃圾行', () => {
      const board = createEmptyBoard(10, 10);

      ['easy', 'normal', 'hard', 'expert'].forEach((diff, i) => {
        const result = applyGarbage(board, 1, diff);
        expect(result[9].filter((c) => c === 0).length).toBe(i + 1);
      });
    });

    test('快速连续应用垃圾行（压力测试）', () => {
      let board = createEmptyBoard(10, 10);

      for (let i = 0; i < 10; i++) {
        board = applyGarbage(board, 1, 'normal');
      }

      expect(board.length).toBe(10);

      board.forEach((row) => {
        expect(row.filter((c) => c === 0).length).toBe(2);
        expect(row.filter((c) => c !== 0).length).toBe(8);
      });
    });

    test('攻击力 0 时不应修改棋盘', () => {
      const board = createEmptyBoard(10, 5);
      const attack = calculateGarbage(1);
      expect(attack).toBe(0);
      expect(applyGarbage(board, attack, 'easy')).toBe(board);
    });

    test('完整的一局对战垃圾行变化', () => {
      let board = createEmptyBoard(20, 10);

      // 第 1 波：2 行 normal
      board = applyGarbage(board, 2, 'normal');
      // 第 2 波：3 行 hard
      board = applyGarbage(board, 3, 'hard');

      expect(board.length).toBe(20);

      // 底部 3 行 hard（3 孔）
      for (let i = 17; i < 20; i++) {
        expect(board[i].filter((c) => c === 0).length).toBe(3);
      }
      // 倒数 4-5 行 normal（2 孔）
      for (let i = 15; i < 17; i++) {
        expect(board[i].filter((c) => c === 0).length).toBe(2);
      }
      // 其余行是原空行
      for (let i = 0; i < 15; i++) {
        expect(board[i]).toEqual(Array(10).fill(0));
      }
    });
  });
});
