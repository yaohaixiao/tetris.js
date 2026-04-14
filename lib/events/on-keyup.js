import executeStopHiddenModeCommand from '@/lib/commands/execute-stop-hidden-mode-command.js';

/**
 * # Keyup 事件处理器
 *
 * 主要用于检测 P 长按松开后，退出隐藏模式的触发流程
 *
 * @function onKeyup
 * @param {KeyboardEvent} e - 键盘事件对象
 */
const onKeyup = (e) => {
  const key = e.key.toLowerCase();

  // 判断松开的是否是 P 键
  if (key === 'p') {
    // 清除长按计时器，取消隐藏模式触发
    executeStopHiddenModeCommand();
  }
};

export default onKeyup;
