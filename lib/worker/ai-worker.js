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
 * { type: 'error', error: string }
 * ```
 *
 * `best` 中的 `placeOn` 是函数无法序列化传递， 因此只返回 `actions` 和 `y` 字段。 主线程执行时直接用 `actions`
 * 驱动游戏，不需要棋盘数据。
 */
globalThis.addEventListener('message', (e) => {
  // 解构主线程发来的决策请求
  const { type, bag, state, weights, depth, beam } = e.data;

  // 只处理 think 类型的消息
  if (type !== 'think') {
    return;
  }

  try {
    // 在 Worker 内部创建快照（避免序列化快照传递）
    const snapshot = createSnapshot(state, bag);

    // 执行决策，返回 { placeOn, actions, y }
    const best = selfPlay(snapshot, weights, depth, beam);

    /**
     * 只传回可序列化的字段。
     *
     * PlaceOn 是函数无法序列化传递，因此只返回 actions 和 y。
     * 主线程 loop() 从 actions 队列中逐个取出动作执行。
     */
    globalThis.postMessage({
      type: 'result',
      best: best ? { actions: best.actions, y: best.y } : null,
    });
  } catch (error) {
    // 决策出错时返回错误信息，主线程 _onWorkerMessage 处理
    globalThis.postMessage({ type: 'error', error: error.message });
  }
});
