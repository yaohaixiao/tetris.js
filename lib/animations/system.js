const system = [];

export const registerAnimation = (anim) => {
  system.push(anim);
};

export const updateAnimations = (delta) => {
  for (let i = system.length - 1; i >= 0; i--) {
    const anim = system[i];

    const active = anim.update(delta);

    if (!active) {
      system.splice(i, 1);
    }
  }
};

export const renderAnimations = () => {
  // 按 layer 排序（越大越上层）
  const sorted = system.slice().toSorted((a, b) => a.layer - b.layer);

  for (const anim of sorted) {
    anim.render();
  }
};

export const hasBlockingAnimation = (names) =>
  system.some((a) => {
    const isBlocking = a.blocking;

    return names && names.length > 0
      ? isBlocking && names.includes(a.name)
      : a.blocking;
  });
