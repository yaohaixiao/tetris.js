import SHAPES from '@/lib/game/constants/shapes.js';

/**
 * # 是否为首个袋子
 *
 * 首个袋子需要避免以 S、Z、T 开头，后续袋子不受此限制。 使用模块级变量在整个游戏生命周期中保持状态。
 *
 * @type {boolean}
 */
let isFirstBag = true;

/**
 * # 填充新袋子（7-bag 算法）
 *
 * 将 8 种方块（含 I5 加长版）随机排列后放入袋子。 方块被逐个取出，取空后调用此函数生成新袋子。
 *
 * ## 7-bag 原理
 *
 * 每 8 个方块保证所有类型各出现一次。 相比纯随机，避免了连出多个同类型方块的极端情况， 在保证随机性的同时提供更公平稳定的游戏体验。
 *
 * ## 开局限制
 *
 * 首个袋子的第一个方块不能是 S(6)、Z(7) 或 T(3)。 这三种方块在空棋盘顶部旋转后容易形成难以填补的缺口， 开局给它们会让玩家处于不利状态。
 *
 * 使用 `while` 循环反复洗牌直到第一个方块符合规则。 后续袋子不受此限制。
 *
 * @returns {object[]} 随机排列的 8 种方块数组
 */
const refillBag = () => {
  /*
   * ==================== 随机打乱方块数组 ====================
   *
   * 使用 toSorted 配合随机比较函数生成随机排列的新袋子。
   * toSorted 返回新数组，不修改原始 SHAPES。
   */
  let bag = [...SHAPES].toSorted(() => Math.random() - 0.5);

  /*
   * ==================== 首个袋子开局限制 ====================
   *
   * S(索引 6)、Z(索引 7)、T(索引 3) 在空棋盘顶部放置时
   * 旋转后容易形成无法填补的缺口，开局应避免。
   * 循环洗牌直到第一个方块不是限制类型。
   */
  if (isFirstBag) {
    while ([3, 6, 7].includes(bag[0].colorIndex)) {
      bag = [...SHAPES].toSorted(() => Math.random() - 0.5);
    }
  }

  /*
   * ==================== 标记首个袋子已生成 ====================
   *
   * 后续袋子不再受开局限制
   */
  isFirstBag = false;

  return bag;
};

/**
 * # 重置首个袋子标记
 *
 * 仅供单元测试使用，将 `isFirstBag` 重置为 `true`， 以便多个测试用例都能验证开局限制逻辑。
 *
 * @returns {void}
 */
refillBag._reset = () => {
  isFirstBag = true;
};

export default refillBag;
