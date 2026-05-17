class VersusState {
  constructor() {
    /** 当前 battle 是否运行 */
    this.running = false;

    /** 玩家胜负 */
    this.winner = null;

    /** 玩家攻击缓存 */
    this.playerGarbage = 0;

    /** AI 攻击缓存 */
    this.aiGarbage = 0;
  }

  reset() {
    this.running = false;

    this.winner = null;

    this.playerGarbage = 0;

    this.aiGarbage = 0;
  }
}

export default VersusState;
