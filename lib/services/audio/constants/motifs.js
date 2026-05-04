/**
 * # 音乐动机参数配置表
 *
 * 控制不同游戏事件对应的音高偏移、速度与音量变化
 *
 * Shift: 音高偏移（半音单位） speed: 播放速度倍率 volume: 音量倍率
 */
const MOTIFS = {
  combo: {
    shift: 0,
    speed: 1,
    volume: 1,
  },

  tetris: {
    shift: 2,
    speed: 1.2,
    volume: 1.1,
  },

  perfect: {
    shift: 5,
    speed: 0.9,
    volume: 1.3,
  },
};

export default MOTIFS;
