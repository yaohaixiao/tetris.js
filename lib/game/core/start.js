/**
 * # 开始游戏
 *
 * 从等级选择界面进入倒计时界面
 *
 * @function start
 * @param {object} game - 执行上下文对象
 * @returns {void}
 */
const start = (game) => {
  const { id, Store } = game;
  const level = Store.getLevel();
  const lines = (level - 1) * 10;

  // 记录初始等级的基准行数，用于后续计算等级提升
  Store.setBaseLines(lines);

  // 进入倒计时界面
  game.emit(`game:${id}:start:countdown`, { game });
};

export default start;
