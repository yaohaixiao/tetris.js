import rotateCounterClockwise from '@/lib/game/logic/rotate/rotate-counter-clockwise.js';
import rotateClockwise from '@/lib/game/logic/rotate/rotate-clockwise.js';

/**
 * ============================================================
 *
 * # 计算旋转后的形状矩阵
 *
 * ============================================================
 *
 * 根据旋转方向调用对应的旋转函数，返回旋转后的新形状。 不修改原形状，返回全新矩阵。
 *
 * ## 旋转方向
 *
 * | direction | 函数                   | 说明   |
 * | :-------- | :--------------------- | :----- |
 * | 1         | rotateClockwise        | 顺时针 |
 * | -1        | rotateCounterClockwise | 逆时针 |
 *
 * @function computeRotatedShape
 * @param {number[][]} shape - 原始形状矩阵
 * @param {number} direction - 旋转方向（1=顺时针，-1=逆时针）
 * @returns {number[][]} 旋转后的形状矩阵
 */
const computeRotatedShape = (shape, direction) =>
  direction === 1 ? rotateClockwise(shape) : rotateCounterClockwise(shape);

export default computeRotatedShape;
