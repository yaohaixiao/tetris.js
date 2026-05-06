const createHUDAnimator = (from, to, duration, onUpdate, onComplete) => {
  let elapsed = 0;
  let done = false;

  const update = (delta) => {
    if (done) {
      return;
    }

    // delta 是秒，转毫秒
    elapsed += delta * 1000;

    const progress = Math.min(elapsed / duration, 1);
    const value = Math.floor(from + (to - from) * progress);

    onUpdate(value);

    if (progress >= 1) {
      done = true;
      onComplete?.();
    }
  };

  const cancel = () => {
    done = true;
  };

  return {
    get done() {
      return done;
    },
    update,
    cancel,
  };
};

export default createHUDAnimator;
