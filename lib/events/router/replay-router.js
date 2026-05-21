import Base from '@/lib/core';
import {
  AudioEvents,
  AIEvents,
  GameEvents,
  ReplayEvents,
  UIEvents,
} from '@/lib/events/event-catalog.js';

class ReplayRouter extends Base {
  constructor(options) {
    super(options);
  }

  /**
   * ## 绑定所有事件监听
   *
   * 在游戏初始化时调用一次。
   */
  subscribe() {
    const { Game } = this;
    const events = ReplayEvents(Game.id);

    /* ---------- 记录操作 ---------- */
    this.on(events.START_RECORD, this._onStartRecord);
    this.on(events.STOP_RECORD, this._onStopRecord);
    this.on(events.ADD_RECORD, this._onAddRecord);
    this.on(events.ADD_PIECE, this._onAddPiece);

    /* ---------- 回放操作 ---------- */
    this.on(events.START_PLAY, this._onStartPlay);
    this.on(events.RESET, this._onReset);

    /* ---------- 流程控制 ---------- */
    this.on(events.GAME_OVER, this._onGameOver);
    this.on(events.STOP_CLEAR_LINES, this._onStopClearLines);
  }

  unsubscribe() {
    const { Game } = this;
    const events = ReplayEvents(Game.id);

    /* ---------- 记录操作 ---------- */
    this.off(events.START_RECORD, this._onStartRecord);
    this.off(events.STOP_RECORD, this._onStopRecord);
    this.off(events.ADD_RECORD, this._onAddRecord);
    this.off(events.ADD_PIECE, this._onAddPiece);

    /* ---------- 回放操作 ---------- */
    this.off(events.START_PLAY, this._onStartPlay);
    this.off(events.RESET, this._onReset);

    /* ---------- 流程控制 ---------- */
    this.off(events.GAME_OVER, this._onGameOver);
    this.off(events.STOP_CLEAR_LINES, this._onStopClearLines);
  }

  /** @private */
  _onStartRecord = () => {
    const { Replay } = this;
    Replay.startRecord();
  };

  /** @private */
  _onStopRecord = () => {
    const { Replay } = this;
    Replay.stopRecord();
  };

  /**
   * ## 录制一条 command
   *
   * 只在 recording 状态下写入。
   *
   * @private
   * @param {object} record - { ms, cmd }
   */
  _onAddRecord = (record) => {
    const { Replay } = this;
    Replay.addRecord(record);
  };

  /**
   * ## 录制一个方块。
   *
   * 只在 recording 状态下写入，使用深拷贝避免引用污染。
   *
   * @private
   * @param {object} piece - 方块数据
   */
  _onAddPiece = (piece) => {
    const { Replay } = this;
    Replay.addPiece(piece);
  };

  /** @private */
  _onStartPlay = () => {
    const { Replay } = this;
    Replay.startPlay();
  };

  /** @private */
  _onReset = () => {
    const { Replay } = this;
    Replay.reset();
  };

  /**
   * ## 游戏结束时的处理。
   *
   * - 有回放数据：准备棋盘进入回放
   * - 无回放数据：直接进入 game-over 状态
   *
   * @private
   */
  _onGameOver = () => {
    const { Replay, Game } = this;
    const uuid = Game.id;
    const AE = AIEvents(uuid);
    const GE = GameEvents(uuid);
    const UE = UIEvents(uuid);

    if (Replay.hasData) {
      this.emit(AE.STOP);
      this.emit(GE.REPLAY_PREPARE, {
        nextPiece: Replay.getNextPiece(),
      });
    } else {
      this.emit(UE.UPDATE_MODE, { mode: 'game-over' });
      this.emit(GE.UPDATE_MODE, { mode: 'game-over' });
    }
  };

  /**
   * ## 消行时的处理
   *
   * 回放中不触发升级提示音/动画；录制或正常游戏中升级时触发。
   *
   * @private
   * @param {object} param - 参数对象
   * @param {boolean} param.isLevelUp - 是否升级
   * @param {number} param.level - 当前等级
   */
  _onStopClearLines = ({ isLevelUp, level }) => {
    const { Game, Replay } = this;

    if (!isLevelUp || Replay.playing) {
      return;
    }

    const AE = AudioEvents();
    const GE = GameEvents(Game.id);

    // 暂停当前 BGM
    this.emit(AE.STOP_BGM);
    // 播放升级音效
    this.emit(AE.PLAY_SOUND, { sound: 'LEVEL_UP' });
    // 触发升级特效
    this.emit(GE.START_LEVEL_UP, { level });
  };
}

export default ReplayRouter;
