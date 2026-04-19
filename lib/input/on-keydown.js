import dispatchInput from '@/lib/input/dispatch-input.js';
import resolveInputAction from '@/lib/input/resolve-input-action.js';

/**
 * # 游戏主键盘事件处理器（统一分发所有按键操作）
 *
 * 根据当前游戏状态，分发到对应逻辑：等级选择、游戏结束、全局快捷键、游戏操控
 *
 * @function onKeydown
 * @param {KeyboardEvent} e - 键盘事件对象
 * @returns {void}
 */
const onKeydown = (e) => {
  const key = e.key.toLowerCase();
  const action = resolveInputAction(key);

  if (!action) {
    return;
  }

  dispatchInput({
    type: 'keydown',
    key,
    action,
  });
};

export default onKeydown;
