const animateHUDNumber = (from, to, duration, onUpdate, onComplete) => {
  let rafId = null;

  if (from === to) {
    return;
  }

  let elapsed = 0;
  let lastTimestamp = 0;

  const step = (timestamp) => {
    if (!lastTimestamp) {
      lastTimestamp = timestamp;
    }

    const delta = timestamp - lastTimestamp;
    lastTimestamp = timestamp;

    elapsed += delta;

    const progress = Math.min(elapsed / duration, 1);
    const value = Math.floor(from + (to - from) * progress);

    onUpdate(value, rafId);

    if (progress < 1) {
      rafId = requestAnimationFrame(step);
    } else {
      // 动画结束回调
      onComplete?.();
    }
  };

  rafId = requestAnimationFrame(step);

  return {
    cancel: () => cancelAnimationFrame(rafId),
  };
};

export default animateHUDNumber;
