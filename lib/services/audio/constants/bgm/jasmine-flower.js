const JasmineFlower = {
  name: 'Jasmine Flower',
  melody: [
    // ===== A段：好一朵美丽的茉莉花 =====
    { freq: 659, dur: 0.7 }, // 好 E5
    { freq: 659, dur: 0.7 }, // 一
    { freq: 784, dur: 1.5 }, // 朵 G5  ← 重点长音
    { freq: 880, dur: 0.5 }, // 美 A5
    { freq: 1047, dur: 0.5 }, // 丽 C6
    { freq: 1047, dur: 0.5 }, // 的
    { freq: 880, dur: 1.3 }, // 茉 A5  ← 长音
    { freq: 784, dur: 1 }, // 莉 G5
    { freq: 659, dur: 3 }, // 花 E5（句尾长音）

    // ===== B段：芬芳美丽满枝桠 =====
    { freq: 659, dur: 0.5 }, // 芬
    { freq: 784, dur: 0.5 }, // 芳
    { freq: 880, dur: 1.4 }, // 美
    { freq: 1047, dur: 0.5 }, // 丽
    { freq: 1047, dur: 0.5 }, // 满
    { freq: 880, dur: 1.4 }, // 枝
    { freq: 784, dur: 2.5 }, // 桠

    // ===== A'段：又香又白人人夸 =====
    { freq: 659, dur: 0.7 },
    { freq: 659, dur: 0.7 },
    { freq: 784, dur: 1.5 },
    { freq: 880, dur: 0.5 },
    { freq: 1047, dur: 0.5 },
    { freq: 880, dur: 0.5 }, // 人
    { freq: 784, dur: 0.5 }, // 人
    { freq: 659, dur: 1 }, // 夸
    { freq: 659, dur: 2.5 }, // (收束)

    // ===== C段：让我来将你摘下 =====
    { freq: 659, dur: 0.5 },
    { freq: 784, dur: 0.5 },
    { freq: 880, dur: 1.4 },
    { freq: 1047, dur: 0.5 },
    { freq: 1047, dur: 0.5 },
    { freq: 880, dur: 1.4 },
    { freq: 784, dur: 0.7 },
    { freq: 659, dur: 2.8 },

    // ===== D段：送给别人家 =====
    { freq: 784, dur: 0.7 },
    { freq: 880, dur: 0.4 },
    { freq: 1047, dur: 1.5 },
    { freq: 880, dur: 0.5 },
    { freq: 784, dur: 0.7 },
    { freq: 659, dur: 1.5 },
    { freq: 523, dur: 3.2 }, // 低收“家——”

    // ===== E段：茉莉花呀茉莉花（低八度起来，摇曳收尾）=====
    { freq: 523, dur: 0.8 },
    { freq: 587, dur: 0.4 }, // 莉：短促
    { freq: 659, dur: 1 }, // 花
    { freq: 784, dur: 0.6 },
    { freq: 880, dur: 0.6 },
    { freq: 1047, dur: 2 }, // 莉：长音，摇曳
    { freq: 880, dur: 0.6 },
    { freq: 784, dur: 1 },
    { freq: 659, dur: 4.5 }, // 最终“花”长拖

    // 句末停顿
    { freq: 0, dur: 2.5 },
  ],
  duration: 540,
  volume: 0.35,
  wave: 'sine',
  gate: 0.9,
  articulation: {
    attackTime: 0.01,
    releaseTime: 0.03,
    sustainRatio: 1,
  },
};

export default JasmineFlower;
