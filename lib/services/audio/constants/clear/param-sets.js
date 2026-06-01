/**
 * # 消行音效 — 16 套配器参数
 *
 * 每 16 关切换一套配器参数，共 16 套（256 / 16），与和弦方案同步切换。 等级越高，音量略降、速度略快、波形逐渐柔和，
 * 模拟从"清晰响亮"到"朦胧急促"的听觉变化。
 *
 * ## 参数说明
 *
 * | 参数   | 说明                                 |
 * | ------ | ------------------------------------ |
 * | volMul | 音量倍率（0-1），越小越轻            |
 * | spdMul | 速度倍率，越大音符越短促             |
 * | wave   | 波形类型（square / triangle / sine） |
 *
 * ## 波形变化
 *
 * - `square`：方波，经典 8-bit 音色，清晰有力
 * - `triangle`：三角波，柔和圆润
 * - `sine`：正弦波，最纯净柔和
 *
 * 后期偏向 sine 波形，营造高等级时的朦胧急促感。 末尾两套（225-256关）为辉煌终章，音量回升。
 *
 * @constant {object[]}
 */
const PARAM_SETS = [
  { volMul: 1, spdMul: 1, wave: 'square' }, // 0: 1-16 关
  { volMul: 1, spdMul: 1.05, wave: 'square' }, // 1: 17-32 关
  { volMul: 1, spdMul: 1.1, wave: 'triangle' }, // 2: 33-48 关
  { volMul: 0.95, spdMul: 1.15, wave: 'triangle' }, // 3: 49-64 关
  { volMul: 0.9, spdMul: 1.2, wave: 'sine' }, // 4: 65-80 关
  { volMul: 0.9, spdMul: 1.1, wave: 'square' }, // 5: 81-96 关
  { volMul: 0.85, spdMul: 1.15, wave: 'triangle' }, // 6: 97-112 关
  { volMul: 0.8, spdMul: 1.2, wave: 'sine' }, // 7: 113-128 关
  { volMul: 0.8, spdMul: 1.25, wave: 'square' }, // 8: 129-144 关
  { volMul: 0.75, spdMul: 1.3, wave: 'triangle' }, // 9: 145-160 关
  { volMul: 0.8, spdMul: 1.2, wave: 'square' }, // 10: 161-176 关
  { volMul: 0.75, spdMul: 1.25, wave: 'sine' }, // 11: 177-192 关
  { volMul: 0.74, spdMul: 1.3, wave: 'square' }, // 12: 193-208 关
  { volMul: 0.75, spdMul: 1.35, wave: 'triangle' }, // 13: 209-224 关
  { volMul: 0.86, spdMul: 1.4, wave: 'sine' }, // 14: 225-240 关
  { volMul: 0.96, spdMul: 1.5, wave: 'square' }, // 15: 241-256 关
];

export default PARAM_SETS;
