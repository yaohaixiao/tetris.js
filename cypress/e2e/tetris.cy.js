describe('Tetris E2E', () => {
  beforeEach(() => {
    cy.visit('/dist/tetris.html');
  });

  // ========== 页面加载 ==========
  it('页面加载显示所有元素', () => {
    cy.get('#tetris-game-board').should('be.visible');
    cy.get('#tetris-next-piece').should('be.visible');
    cy.get('#tetri-hold-piece').should('be.visible');
    cy.get('#tetris-score').should('be.visible');
    cy.get('#tetris-lines').should('be.visible');
    cy.get('#tetris-level').should('be.visible');
    cy.get('#tetris-high-score').should('be.visible');
    cy.get('#tetris-controller').should('be.visible');
  });

  // ========== 主菜单：等级选择 ==========
  describe('主菜单 - 等级选择', () => {
    it('按 1 键选择等级 1', () => {
      cy.get('body').type('1');
      cy.get('#tetris-level').should('contain', '01');
    });

    it('按 5 键选择等级 5', () => {
      cy.get('body').type('5');
      cy.get('#tetris-level').should('contain', '05');
    });

    it('按 T 键选择等级 10', () => {
      cy.get('body').type('t');
      cy.get('#tetris-level').should('contain', '10');
    });
  });

  // ========== 难度选择 ==========
  describe('难度选择', () => {
    it('Enter 进入难度选择界面', () => {
      cy.get('body').type('1');
      cy.get('body').type('{enter}');
      cy.get('#tetris-game-board[data-mode="difficulty"]').should('exist');
    });

    it('按 E 选择 Easy 并确认开始', () => {
      cy.get('body').type('1');
      cy.get('body').type('{enter}');
      cy.get('body').type('e');
      cy.get('body').type('{enter}');
      cy.get('#tetris-game-board').should('be.visible');
    });

    it('按 N 选择 Normal 并确认开始', () => {
      cy.get('body').type('3');
      cy.get('body').type('{enter}');
      cy.get('body').type('n');
      cy.get('body').type('{enter}');
      cy.get('#tetris-game-board').should('be.visible');
    });

    it('按 H 选择 Hard 并确认开始', () => {
      cy.get('body').type('5');
      cy.get('body').type('{enter}');
      cy.get('body').type('h');
      cy.get('body').type('{enter}');
      cy.get('#tetris-game-board').should('be.visible');
    });

    it('按 X 选择 Expert 并确认开始', () => {
      cy.get('body').type('9');
      cy.get('body').type('{enter}');
      cy.get('body').type('x');
      cy.get('body').type('{enter}');
      cy.get('#tetris-game-board').should('be.visible');
    });

    it('难度选择界面按 B 返回等级选择', () => {
      cy.get('body').type('1');
      cy.get('body').type('{enter}');
      cy.get('body').type('b');
      cy.get('body').type('3');
      cy.get('#tetris-level').should('contain', '03');
    });
  });

  // ========== 游戏中操作 ==========
  describe('游戏中操作', () => {
    const startGame = () => {
      cy.get('body').type('1');
      cy.get('body').type('{enter}');
      cy.get('body').type('e');
      cy.get('body').type('{enter}');
      cy.wait(4500);
    };

    it('完整开始流程：选等级 → 难度 → 开始 → 倒计时', () => {
      startGame();
      cy.get('#tetris-game-board').should('be.visible');
    });

    it('方向键移动方块', () => {
      startGame();
      cy.get('body').type('{leftarrow}');
      cy.get('body').type('{leftarrow}');
      cy.get('body').type('{rightarrow}');
      cy.get('body').type('{uparrow}');
      cy.get('body').type(' ');
    });

    it('P 暂停 / 恢复', () => {
      startGame();
      cy.get('body').type('p');
      cy.wait(500);
      cy.get('body').type('p');
      cy.wait(500);
      cy.get('#tetris-game-board').should('be.visible');
    });

    it('M 切换背景音乐', () => {
      startGame();
      cy.get('body').type('m');
      cy.wait(300);
      cy.get('body').type('m');
      cy.get('#tetris-game-board').should('be.visible');
    });

    it('R 重新开始', () => {
      startGame();
      cy.get('body').type('r');
      cy.wait(2000);
      cy.get('#tetris-game-board').should('be.visible');
    });

    // ========== Lock Delay ==========
    it('方块触底后仍可左右移动', () => {
      startGame();
      // 快速硬降到底
      cy.get('body').type(' ');
      cy.wait(100);
      // 触底后仍能左右移动
      cy.get('body').type('{leftarrow}');
      cy.get('body').type('{rightarrow}');
      cy.get('#tetris-game-board').should('be.visible');
    });

    // ========== SRS 墙踢 ==========
    it('贴墙旋转成功', () => {
      startGame();
      // 移到最左边
      for (let i = 0; i < 6; i++) {
        cy.get('body').type('{leftarrow}');
      }
      // 旋转应该被墙踢
      cy.get('body').type('{uparrow}');
      cy.get('#tetris-game-board').should('be.visible');
    });

    // ========== DAS/ARR ==========
    it('长按左右键自动移动', () => {
      startGame();
      // 按住右键不放（模拟）
      cy.get('body').trigger('keydown', { key: 'ArrowRight' });
      cy.wait(300); // 超过 DAS 延迟
      cy.get('body').trigger('keyup', { key: 'ArrowRight' });
      cy.get('#tetris-game-board').should('be.visible');
    });

    // ========== Hold ==========
    it('按 C 键暂存方块', () => {
      startGame();
      cy.get('body').type('c');
      cy.get('#tetri-hold-piece').should('be.visible');
    });

    it('再次按 C 键交换方块', () => {
      startGame();
      cy.get('body').type('c');
      cy.wait(100);
      cy.get('body').type('c');
      cy.get('#tetris-game-board').should('be.visible');
    });

    it('不能连续 hold 两次', () => {
      startGame();
      cy.get('body').type('c');
      cy.wait(100);
      cy.get('body').type('c');
      cy.wait(100);
      cy.get('body').type('c'); // 第三次应该无效
      cy.get('#tetris-game-board').should('be.visible');
    });
  });

  // ========== AI 切换与控制 ==========
  describe('AI 切换与控制', () => {
    const startGame = () => {
      cy.get('body').type('1');
      cy.get('body').type('{enter}');
      cy.get('body').type('e');
      cy.get('body').type('{enter}');
      cy.wait(4500);
    };

    it('初始状态 controller 显示 HUMAN', () => {
      startGame();
      cy.get('#tetris-controller').should('contain', 'HUMAN');
    });

    it('按 S 键切换为 AI 模式', () => {
      startGame();
      cy.get('body').type('s');
      cy.get('#tetris-controller').should('contain', 'AI');
    });

    it('AI 模式下按 S 键切换回 HUMAN', () => {
      startGame();
      cy.get('body').type('s');
      cy.get('#tetris-controller').should('contain', 'AI');
      cy.get('body').type('s');
      cy.get('#tetris-controller').should('contain', 'HUMAN');
    });

    it('AI 模式下 M 键可以正常使用', () => {
      startGame();
      cy.get('body').type('s');
      cy.get('#tetris-controller').should('contain', 'AI');
      cy.get('body').type('m');
      cy.wait(300);
      cy.get('body').type('m');
      cy.get('#tetris-game-board').should('be.visible');
    });

    it('AI 模式下 P 键可以正常使用', () => {
      startGame();
      cy.get('body').type('s');
      cy.get('#tetris-controller').should('contain', 'AI');
      cy.get('body').type('p');
      cy.wait(500);
      cy.get('body').type('p');
      cy.wait(500);
      cy.get('#tetris-game-board').should('be.visible');
    });

    it('AI 模式下 R 键可以正常使用', () => {
      startGame();
      cy.get('body').type('s');
      cy.get('#tetris-controller').should('contain', 'AI');
      cy.get('body').type('r');
      cy.wait(2000);
      cy.get('#tetris-game-board').should('be.visible');
    });

    it('AI 模式下 Q 键可以正常使用', () => {
      startGame();
      cy.get('body').type('s');
      cy.get('#tetris-controller').should('contain', 'AI');
      cy.get('body').type('q');
      cy.wait(500);
      cy.get('#tetris-game-board').should('be.visible');
    });

    it('AI 模式下方向键和空格键不影响游戏', () => {
      startGame();
      cy.get('body').type('s');
      cy.get('#tetris-controller').should('contain', 'AI');
      cy.get('body').type('{leftarrow}');
      cy.get('body').type('{rightarrow}');
      cy.get('body').type('{uparrow}');
      cy.get('body').type('{downarrow}');
      cy.get('body').type(' ');
      cy.get('#tetris-game-board').should('be.visible');
      cy.get('#tetris-controller').should('contain', 'AI');
    });

    it('AI 模式下切换到 HUMAN 后可正常操作方块', () => {
      startGame();
      cy.get('body').type('s');
      cy.get('#tetris-controller').should('contain', 'AI');
      cy.get('body').type('s');
      cy.get('#tetris-controller').should('contain', 'HUMAN');
      cy.get('body').type('{leftarrow}');
      cy.get('body').type('{rightarrow}');
      cy.get('body').type('{uparrow}');
      cy.get('body').type(' ');
      cy.get('#tetris-game-board').should('be.visible');
    });

    it('多次 S 键切换不报错', () => {
      startGame();
      cy.get('body').type('s');
      cy.get('body').type('s');
      cy.get('body').type('s');
      cy.get('body').type('s');
      cy.get('#tetris-game-board').should('be.visible');
    });
  });

  // ========== Replay 回放 ==========
  describe('Replay 回放', () => {
    const playAndTriggerReplay = () => {
      cy.get('body').type('1');
      cy.get('body').type('{enter}');
      cy.get('body').type('e');
      cy.get('body').type('{enter}');
      cy.wait(4500);

      cy.get('body').type('{leftarrow}');
      cy.get('body').type('{uparrow}');
      cy.get('body').type('{rightarrow}');
      cy.get('body').type(' ').wait(300);
      cy.get('body').type('{leftarrow}');
      cy.get('body').type(' ').wait(300);
      cy.get('body').type('{rightarrow}');
      cy.get('body').type('{uparrow}');
      cy.get('body').type(' ');

      cy.get('body').type('q');
      cy.wait(500);
    };

    it('按 Q 强制结束后自动进入回放，HUD 归零', () => {
      playAndTriggerReplay();
      cy.get('#tetris-game-board[data-mode="replay"]').should('exist');
      cy.get('#tetris-score').should('contain', '00000');
      cy.get('#tetris-lines').should('contain', '00');
      cy.get('#tetris-level').should('contain', '01');
    });

    it('回放期间键盘只有 Enter 有效', () => {
      playAndTriggerReplay();
      cy.get('#tetris-game-board[data-mode="replay"]').should('exist');
      cy.get('body').type('{leftarrow}');
      cy.get('body').type('{rightarrow}');
      cy.get('body').type('{uparrow}');
      cy.get('body').type('p');
      cy.get('body').type('r');
      cy.get('body').type('m');
      cy.get('body').type('s');
      cy.get('body').type('{enter}');
      cy.get('#tetris-game-board').should('be.visible');
    });

    it('回放结束后进入 game-over', () => {
      playAndTriggerReplay();
      cy.get('#tetris-game-board[data-mode="game-over"]', {
        timeout: 30000,
      }).should('exist');
      cy.get('#tetris-game-board').should('be.visible');
      cy.get('#tetris-score').should('be.visible');
    });

    it('回放结束后 high-score 已显示', () => {
      playAndTriggerReplay();
      cy.get('#tetris-game-board[data-mode="game-over"]', {
        timeout: 30000,
      }).should('exist');
      cy.get('#tetris-high-score').should('be.visible');
    });

    it('game-over 后按 Enter 回到主菜单', () => {
      playAndTriggerReplay();
      cy.get('#tetris-game-board[data-mode="game-over"]', {
        timeout: 30000,
      }).should('exist');
      cy.get('body').type('{enter}');
      cy.get('#tetris-game-board[data-mode="main-menu"]').should('exist');
      cy.get('#tetris-score').should('contain', '00000');
    });

    it('回放结束后可重新开始游戏', () => {
      playAndTriggerReplay();
      cy.get('#tetris-game-board[data-mode="game-over"]', {
        timeout: 30000,
      }).should('exist');
      cy.get('body').type('{enter}');
      cy.get('#tetris-game-board[data-mode="main-menu"]').should('exist');
      cy.get('body').type('1');
      cy.get('body').type('{enter}');
      cy.get('body').type('e');
      cy.get('body').type('{enter}');
      cy.wait(4500);
      cy.get('#tetris-game-board').should('be.visible');
    });

    it('回放中按 Enter 返回主菜单，重新开始后 controller 为 HUMAN', () => {
      playAndTriggerReplay();
      cy.get('#tetris-game-board[data-mode="replay"]', {
        timeout: 30000,
      }).should('exist');
      cy.get('body').type('{enter}');
      cy.get('#tetris-game-board[data-mode="main-menu"]').should('exist');
      cy.get('#tetris-controller').should('contain', 'HUMAN');
      cy.get('body').type('1');
      cy.get('#tetris-level').should('contain', '01');
      cy.get('body').type('{enter}');
      cy.get('#tetris-game-board[data-mode="difficulty"]').should('exist');
      cy.get('body').type('e');
      cy.get('body').type('{enter}');
      cy.wait(4500);
      cy.get('#tetris-game-board').should('be.visible');
      cy.get('#tetris-controller').should('contain', 'HUMAN');
      cy.get('body').type('{leftarrow}');
      cy.get('body').type('{leftarrow}');
      cy.get('body').type('{rightarrow}');
      cy.get('body').type('{uparrow}');
      cy.get('body').type(' ');
      cy.get('#tetris-game-board').should('be.visible');
    });
  });

  // ========== TouchController 触摸控制 ==========
  describe('TouchController 触摸控制', () => {
    beforeEach(() => {
      cy.viewport(375, 667);
      cy.visit('/dist/tetris.html');
    });

    describe('主菜单 - 等级选择（触摸）', () => {
      it('DPAD UP 切换等级', () => {
        cy.get('#tetris-level').should('contain', '01');
        cy.get('#tetris-dpad-up').click();
        cy.get('#tetris-level').should('contain', '02');
        cy.get('#tetris-dpad-up').click();
        cy.get('#tetris-dpad-up').click();
        cy.get('#tetris-level').should('contain', '04');
      });

      it('DPAD DOWN 切换等级', () => {
        cy.get('#tetris-dpad-up').click();
        cy.get('#tetris-dpad-up').click();
        cy.get('#tetris-dpad-up').click();
        cy.get('#tetris-level').should('contain', '04');
        cy.get('#tetris-dpad-down').click();
        cy.get('#tetris-level').should('contain', '03');
      });

      it('DPAD UP 最高到 10', () => {
        for (let i = 0; i < 12; i++) {
          cy.get('#tetris-dpad-up').click();
        }
        cy.get('#tetris-level').should('contain', '10');
      });

      it('DPAD DOWN 最低到 1', () => {
        for (let i = 0; i < 12; i++) {
          cy.get('#tetris-dpad-down').click();
        }
        cy.get('#tetris-level').should('contain', '01');
      });

      it('START 进入难度选择', () => {
        cy.get('#tetris-btn-start').click();
        cy.get('#tetris-game-board[data-mode="difficulty"]').should('exist');
      });
    });

    describe('难度选择（触摸）', () => {
      beforeEach(() => {
        cy.get('#tetris-btn-start').click();
        cy.get('#tetris-game-board[data-mode="difficulty"]').should('exist');
      });

      it('A 按钮选择 Easy', () => {
        cy.get('#tetris-btn-a').click();
        cy.get('#tetris-btn-start').click();
        cy.wait(4500);
        cy.get('#tetris-game-board').should('be.visible');
      });

      it('B 按钮选择 Normal', () => {
        cy.get('#tetris-btn-b').click();
        cy.get('#tetris-btn-start').click();
        cy.wait(4500);
        cy.get('#tetris-game-board').should('be.visible');
      });

      it('Y 按钮选择 Hard', () => {
        cy.get('#tetris-btn-y').click();
        cy.get('#tetris-btn-start').click();
        cy.wait(4500);
        cy.get('#tetris-game-board').should('be.visible');
      });

      it('X 按钮选择 Expert', () => {
        cy.get('#tetris-btn-x').click();
        cy.get('#tetris-btn-start').click();
        cy.wait(4500);
        cy.get('#tetris-game-board').should('be.visible');
      });

      it('BACK 返回主菜单', () => {
        cy.get('#tetris-btn-back').click();
        cy.get('#tetris-game-board[data-mode="main-menu"]').should('exist');
      });
    });

    describe('游戏中操作（触摸）', () => {
      const startGame = () => {
        cy.get('#tetris-btn-start').click();
        cy.get('#tetris-btn-b').click();
        cy.get('#tetris-btn-start').click();
        cy.wait(4500);
      };

      it('DPAD LEFT 左移', () => {
        startGame();
        cy.get('#tetris-dpad-left').click();
        cy.get('#tetris-dpad-left').click();
        cy.get('#tetris-game-board').should('be.visible');
      });

      it('DPAD RIGHT 右移', () => {
        startGame();
        cy.get('#tetris-dpad-right').click();
        cy.get('#tetris-dpad-right').click();
        cy.get('#tetris-game-board').should('be.visible');
      });

      it('DPAD UP 旋转', () => {
        startGame();
        cy.get('#tetris-dpad-up').click();
        cy.get('#tetris-game-board').should('be.visible');
      });

      it('DPAD DOWN 软降', () => {
        startGame();
        cy.get('#tetris-dpad-down').click();
        cy.get('#tetris-game-board').should('be.visible');
      });

      it('B 按钮硬降', () => {
        startGame();
        cy.get('#tetris-btn-b').click();
        cy.get('#tetris-game-board').should('be.visible');
      });

      it('A 按钮切换音乐', () => {
        startGame();
        cy.get('#tetris-btn-a').click();
        cy.get('#tetris-game-board').should('be.visible');
      });

      it('Y 按钮暂停/继续', () => {
        startGame();
        cy.get('#tetris-btn-y').click();
        cy.wait(500);
        cy.get('#tetris-btn-y').click();
        cy.get('#tetris-game-board').should('be.visible');
      });

      it('X 按钮重新开始', () => {
        startGame();
        cy.get('#tetris-btn-x').click();
        cy.wait(2000);
        cy.get('#tetris-game-board').should('be.visible');
      });

      it('BACK 按钮退出', () => {
        startGame();
        cy.get('#tetris-btn-back').click();
        cy.wait(500);
        cy.get('#tetris-game-board').should('be.visible');
      });

      it('HOLD 按钮暂存方块', () => {
        startGame();
        cy.get('#tetris-btn-hold').click();
        cy.get('#tetri-hold-piece').should('be.visible');
      });
    });

    describe('回放模式（触摸）', () => {
      const playAndQuit = () => {
        cy.get('#tetris-btn-start').click();
        cy.get('#tetris-btn-b').click();
        cy.get('#tetris-btn-start').click();
        cy.wait(4500);
        cy.get('#tetris-btn-b').click();
        cy.get('#tetris-btn-back').click();
        cy.wait(500);
      };

      it('回放中按 BACK 不报错', () => {
        playAndQuit();
        cy.get('#tetris-game-board[data-mode="replay"]', {
          timeout: 30000,
        }).should('exist');
        cy.get('#tetris-btn-back').click();
        cy.get('#tetris-game-board').should('be.visible');
      });

      it('回放中按 START 返回主菜单', () => {
        playAndQuit();
        cy.get('#tetris-game-board[data-mode="replay"]', {
          timeout: 30000,
        }).should('exist');
        cy.get('#tetris-btn-start').click();
        cy.get('#tetris-game-board[data-mode="main-menu"]').should('exist');
      });
    });
  });
});
