import selfPlay from '@/lib/ai/planner/self-play.js';
import createSnapshot from '@/lib/ai/snapshot/create-snapshot.js';

/**
 * # AI Worker 线程
 *
 * 在独立线程中运行 selfPlay 决策，不阻塞主线程渲染。 通过 postMessage 与主线程通信。
 *
 * ## 消息协议
 *
 * ### 主线程 → Worker
 *
 * ```js
 * { type: 'think', state, weights, depth, beam }
 * ```
 *
 * ### Worker → 主线程
 *
 * ```js
 * { type: 'result', best: { actions, y } | null }
 * ```
 *
 * `best` 中的 `evaluate` 函数无法序列化传递， 因此只返回 `actions` 和 `y` 字段。
 */

globalThis.addEventListener('message', (e) => {
  const { type, state, weights, depth, beam } = e.data;

  if (type !== 'think') {
    return;
  }

  try {
    // 在 Worker 内部创建快照（避免序列化快照传递）
    const snapshot = createSnapshot(state);

    // 执行决策
    const best = selfPlay(snapshot, weights, depth, beam);

    // 只传回可序列化的字段（evaluate 是函数，不能传）
    globalThis.postMessage({
      type: 'result',
      best: best ? { actions: best.actions, y: best.y } : null,
    });
  } catch (error) {
    globalThis.postMessage({ type: 'error', error: error.message });
  }
});
