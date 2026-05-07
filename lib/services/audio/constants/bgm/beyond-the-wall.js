const BeyondTheWall = {
  name: 'BeyondTheWall',

  // 推荐：全局控制（你也可以在 engine 里做分段 gate）
  config: {
    gate: {
      intro: 0.92,
      main: 0.93,
      drive: 0.96,
      dnb: 0.88,
      outro: 0.91,
    }
  },

  melody: [
    // 前奏：胡笳感脉冲
    { freq: 330, dur: 0.6 },
    { freq: 0,   dur: 0.15 },

    { freq: 392, dur: 0.6 },
    { freq: 0,   dur: 0.15 },

    { freq: 330, dur: 0.6 },
    { freq: 392, dur: 0.6 },

    { freq: 330, dur: 0.6 },
    { freq: 0,   dur: 0.15 },

    { freq: 392, dur: 0.6 },
    { freq: 0,   dur: 0.15 },

    { freq: 440, dur: 1.8 },
    { freq: 0,   dur: 0.3 },


    // 主旋律：苍凉开场
    { freq: 440, dur: 1.2 },
    { freq: 523, dur: 0.6 },

    { freq: 587, dur: 1.2 },
    { freq: 0,   dur: 0.2 },

    { freq: 523, dur: 0.6 },
    { freq: 440, dur: 1.2 },

    { freq: 392, dur: 0.6 },
    { freq: 330, dur: 1.2 },

    { freq: 392, dur: 1.2 },
    { freq: 0,   dur: 0.25 },


    { freq: 440, dur: 1.2 },
    { freq: 523, dur: 0.6 },

    { freq: 659, dur: 1.8 },
    { freq: 0,   dur: 0.2 },

    { freq: 587, dur: 0.6 },
    { freq: 523, dur: 1.2 },

    { freq: 440, dur: 0.6 },
    { freq: 392, dur: 1.2 },

    { freq: 330, dur: 1.2 },
    { freq: 0,   dur: 0.3 },


    // 推进段：马蹄
    { freq: 392, dur: 0.6 },
    { freq: 440, dur: 0.3 },

    { freq: 523, dur: 0.6 },
    { freq: 587, dur: 0.3 },

    { freq: 659, dur: 0.6 },
    { freq: 587, dur: 0.3 },

    { freq: 523, dur: 0.6 },
    { freq: 440, dur: 0.3 },


    { freq: 392, dur: 0.6 },
    { freq: 440, dur: 0.3 },

    { freq: 523, dur: 0.6 },
    { freq: 587, dur: 0.3 },

    { freq: 659, dur: 1.2 },
    { freq: 0,   dur: 0.2 },

    { freq: 587, dur: 0.6 },
    { freq: 523, dur: 1.2 },


    // 高潮：边塞号角（加“断气点”）
    { freq: 659, dur: 1.2 },
    { freq: 784, dur: 0.6 },

    { freq: 880, dur: 1.8 },
    { freq: 0,   dur: 0.25 },

    { freq: 784, dur: 0.6 },
    { freq: 659, dur: 1.2 },

    { freq: 587, dur: 0.6 },
    { freq: 523, dur: 1.2 },

    { freq: 440, dur: 0.6 },
    { freq: 0,   dur: 0.2 },


    { freq: 659, dur: 1.2 },
    { freq: 784, dur: 0.6 },

    { freq: 880, dur: 1.2 },
    { freq: 0,   dur: 0.25 },

    { freq: 784, dur: 0.6 },
    { freq: 659, dur: 1.2 },

    { freq: 587, dur: 0.6 },
    { freq: 523, dur: 1.8 },


    // DnB段：改成“破碎节奏 + 空拍”
    { freq: 440, dur: 0.4 },
    { freq: 0,   dur: 0.2 },

    { freq: 440, dur: 0.4 },
    { freq: 523, dur: 0.4 },

    { freq: 0,   dur: 0.2 },
    { freq: 440, dur: 0.4 },

    { freq: 392, dur: 0.4 },
    { freq: 330, dur: 0.4 },

    { freq: 0,   dur: 0.2 },
    { freq: 392, dur: 0.4 },

    { freq: 440, dur: 0.4 },
    { freq: 0,   dur: 0.2 },


    { freq: 523, dur: 0.4 },
    { freq: 523, dur: 0.4 },

    { freq: 587, dur: 0.4 },
    { freq: 0,   dur: 0.2 },

    { freq: 523, dur: 0.4 },
    { freq: 440, dur: 0.4 },

    { freq: 392, dur: 0.4 },
    { freq: 0,   dur: 0.2 },

    { freq: 440, dur: 0.4 },
    { freq: 523, dur: 0.4 },


    // 回落：大漠孤烟（拉长 + 留白）
    { freq: 659, dur: 1.2 },
    { freq: 0,   dur: 0.25 },

    { freq: 587, dur: 0.6 },
    { freq: 523, dur: 1.2 },

    { freq: 440, dur: 0.6 },
    { freq: 392, dur: 1.2 },

    { freq: 330, dur: 1.2 },
    { freq: 0,   dur: 0.3 },


    { freq: 392, dur: 1.2 },
    { freq: 330, dur: 0.6 },

    { freq: 294, dur: 1.2 },
    { freq: 0,   dur: 0.25 },

    { freq: 330, dur: 0.6 },
    { freq: 392, dur: 1.8 },


    // 循环衔接（更“远”）
    { freq: 330, dur: 0.6 },
    { freq: 0,   dur: 0.15 },

    { freq: 392, dur: 0.6 },
    { freq: 0,   dur: 0.15 },

    { freq: 330, dur: 0.6 },
    { freq: 392, dur: 0.6 },

    { freq: 440, dur: 1.8 },
  ],

  duration: 130,
  volume: 0.09,
  wave: 'triangle',
};

export default BeyondTheWall;
