/**
 * ============================================================
 *
 * # 计算等级与升级步长
 *
 * ============================================================
 *
 * 采用动态升级步长算法：
 *
 * - 初始 10 行升一级
 * - 每次升级后所需行数 +2
 * - 步长封顶 60 行
 *
 * | 等级 | 升级需行数 | 累计需行数 |
 * | :--- | :--------- | :--------- |
 * | 1    | 10         | 10         |
 * | 2    | 12         | 22         |
 * | 3    | 14         | 36         |
 * | ...  | ...        | ...        |
 * | 26   | 60         | 910        |
 * | 27+  | 60         | 每 60 行   |
 *
 * @function calculateLevel
 * @param {number} totalLines - 总累计消除行数
 * @param {number} maxLevel - 最大等级（256）
 * @returns {{ level: number; levelUpSteps: number }} 计算后的等级和当前升级步长
 */
const calculateLevel = (totalLines, maxLevel) => {
  let level = 1;
  let required = 10;
  let consumed = 0;

  while (level < maxLevel && totalLines >= consumed + required) {
    consumed += required;
    level++;
    required = Math.min(required + 2, 60);
  }

  return { level, levelUpSteps: required };
};

export default calculateLevel;
