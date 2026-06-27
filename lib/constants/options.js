/**
 * # 游戏选项配置
 *
 * 集中管理所有选择界面的选项配置，包括游戏模式选择、对战模式选择、退出菜单选择。 每个选项定义了按键提示、显示标签、对应的模式/事件和玩家配置。
 *
 * ## 选项结构
 *
 * | 字段    | 类型     | 说明                                  |
 * | ------- | -------- | ------------------------------------- |
 * | key     | string   | 键盘快捷键提示（显示在选择界面中）    |
 * | label   | string   | 选项显示名称                          |
 * | mode    | string   | 对应的游戏模式（仅 MODE_OPTIONS）     |
 * | players | string[] | 该模式下的玩家列表配置                |
 * | event   | string   | 选项触发的事件类型（仅 EXIT_OPTIONS） |
 *
 * @constant {object} OPTIONS
 */
const OPTIONS = {
  /**
   * ## 游戏模式选择选项
   *
   * 在 game-mode 界面中使用，玩家通过 ↑↓ 方向键移动光标选择游戏模式。 按 Enter 确认后进入对应的模式流程。
   *
   * | 选项   | 按键 | 模式   | 玩家配置        | 说明             |
   * | ------ | ---- | ------ | --------------- | ---------------- |
   * | SINGLE | S    | single | ['human']       | 单人模式         |
   * | BATTLE | B    | versus | ['human', 'ai'] | 对战模式（人机） |
   *
   * 选择 SINGLE → 切换到 main-menu（等级选择） 选择 BATTLE → 切换到 battle-mode（对战类型选择）
   */
  MODE_OPTIONS: [
    {
      key: 'S',
      label: 'SINGLE',
      mode: 'single',
      players: ['human'],
    },
    {
      key: 'B',
      label: 'BATTLE',
      mode: 'versus',
      players: ['human', 'ai'],
    },
  ],

  /**
   * ## 对战模式选择选项
   *
   * 在 battle-mode 界面中使用，玩家通过 ↑↓ 方向键选择对战类型。 按 Enter 确认后启动对战。
   *
   * | 选项     | 按键 | 玩家配置           | 说明                   |
   * | -------- | ---- | ------------------ | ---------------------- |
   * | VS AI    | A    | ['human', 'ai']    | 人机对战（玩家 VS AI） |
   * | VS HUMAN | H    | ['human', 'human'] | 双人对战               |
   *
   * 选择后触发 engine:start 事件，Engine 销毁当前实例并重新 launch。
   */
  BATTLE_OPTIONS: [
    {
      key: 'A',
      label: 'VS AI   ',
      players: ['human', 'ai'],
    },
    {
      key: 'H',
      label: 'VS HUMAN',
      players: ['human', 'human'],
    },
  ],

  /**
   * ## 退出游戏菜单选项
   *
   * 在 exit-game 界面中使用（Single 模式下按 ESC 键触发）。 玩家通过 ↑↓ 方向键选择操作。
   *
   * | 选项        | 按键 | 事件    | 说明                           |
   * | ----------- | ---- | ------- | ------------------------------ |
   * | RESUME GAME | R    | RESUME  | 继续游戏，返回 playing 模式    |
   * | EXIT GAME   | E    | GIVE_UP | 退出游戏，返回游戏模式选择界面 |
   *
   * - **RESUME**：关闭退出菜单，恢复游戏状态
   * - **GIVE_UP**：触发 engine:exit 事件，Engine 销毁当前实例并重新 launch 到模式选择界面
   */
  EXIT_OPTIONS: [
    {
      key: 'R',
      label: 'RESUME GAME',
      event: 'RESUME',
    },
    {
      key: 'E',
      label: 'EXIT GAME  ',
      event: 'GIVE_UP',
    },
  ],
};

export default OPTIONS;
