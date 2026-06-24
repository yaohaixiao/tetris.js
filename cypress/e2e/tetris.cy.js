describe('Tetris E2E', () => {
  beforeEach(() => {
    cy.visit('/dist/index.html');
  });

  // ========== 页面加载 ==========
  it('页面加载显示所有元素', () => {
    cy.get('#human-0-tetris-game-board').should('be.visible');
    cy.get('#human-0-tetris-next-piece').should('be.visible');
    cy.get('#human-0-tetri-hold-piece').should('be.visible');
    cy.get('#human-0-tetris-score').should('be.visible');
    cy.get('#human-0-tetris-lines').should('be.visible');
    cy.get('#human-0-tetris-level').should('be.visible');
    cy.get('#human-0-tetris-high-score').should('be.visible');
    cy.get('#human-0-tetris-controller').should('be.visible');
  });

  // ========== 模式选择与界面导航 ==========
  describe('模式选择与界面导航', () => {
    it('场景1：初始界面直接 Enter 进入单人模式主菜单', () => {
      cy.get('body').type('{enter}');
      cy.get('#human-0-tetris-game-board[data-mode="main-menu"]').should(
        'exist',
      );
      cy.get('#tetris-container[data-mode="single"]').should('exist');
      cy.get('.tetris-player').should('have.length', 1);
      cy.get('body').type('1');
      cy.get('#human-0-tetris-level').should('contain', '01');
    });

    it('场景2：按下键再 Enter 进入对战模式选择界面', () => {
      cy.get('body').type('{downarrow}');
      cy.get('body').type('{enter}');
      cy.wait(200);
      cy.get('body').type('{enter}');
      cy.wait(200);
      cy.get('#tetris-container[data-mode="versus"]').should('exist');
      cy.get('.tetris-player').should('exist');
    });

    it('场景3：对战选择界面按 ESC 返回初始界面', () => {
      cy.get('body').type('{downarrow}');
      cy.get('body').type('{enter}');
      cy.wait(200);
      cy.get('body').type('{enter}');
      cy.wait(200);
      cy.get('#tetris-container[data-mode="versus"]').should('exist');
      cy.get('body').type('{esc}');
      cy.get('#tetris-container[data-mode="single"]').should('exist');
      cy.get('#human-0-tetris-game-board[data-mode="game-mode"]').should(
        'exist',
      );
      cy.get('.tetris-player').should('have.length', 1);
    });

    it('场景4：直接 Enter 选择 VS AI 进入对战模式', () => {
      cy.get('body').type('{downarrow}');
      cy.get('body').type('{enter}');
      cy.get('body').type('{enter}');
      cy.get('#tetris-container[data-mode="versus"]').should('exist');
      cy.get('.tetris-player').should('have.length', 2);
      cy.get('#tetris-battle-overlay').should('exist');
      cy.get('.tetris-battle-score').should('have.length', 2);
      cy.get('#human-0-tetris-score').should('exist');
      cy.get('#ai-1-tetris-score').should('exist');
      cy.get('#human-0-tetris-battle-score').should('contain', '0');
      cy.get('#ai-1-tetris-battle-score').should('contain', '0');
    });

    it('场景5：按下键再 Enter 选择 VS HUMAN 进入对战模式', () => {
      cy.get('body').type('{downarrow}');
      cy.get('body').type('{enter}');
      cy.get('body').type('{downarrow}');
      cy.get('body').type('{enter}');
      cy.get('#tetris-container[data-mode="versus"]').should('exist');
      cy.get('.tetris-player').should('have.length', 2);
      cy.get('#tetris-battle-overlay').should('exist');
      cy.get('.tetris-battle-score').should('have.length', 2);
      cy.get('#human-0-tetris-score').should('exist');
      cy.get('#human-1-tetris-score').should('exist');
    });

    it('场景6：对战 ESC 认输后显示 battle-over，按 ESC 返回初始界面', () => {
      // 进入 HUMAN vs AI 对战
      cy.get('body').type('{downarrow}');
      cy.get('body').type('{enter}');
      cy.get('body').type('{enter}');
      cy.get('#human-0-tetris-game-board[data-mode="main-menu"]').should(
        'exist',
      );
      // 选等级 1 → Easy → 开始
      cy.get('body').type('1');
      cy.get('body').type('{enter}');
      cy.get('body').type('e');
      cy.get('body').type('{enter}');
      cy.wait(4500);
      // 按 ESC 认输，对方直接获得 15 分
      cy.get('body').type('{esc}');
      // 等待 BATTLE OVER 显示
      cy.get('#tetris-battle-over', { timeout: 10000 }).should('be.visible');
      // 按 ESC 返回初始界面
      cy.get('body').type('{esc}');
      cy.get('#tetris-container[data-mode="single"]').should('exist');
      cy.get('#human-0-tetris-game-board[data-mode="game-mode"]').should(
        'exist',
      );
    });

    it('场景7：对战模式进入 main-menu 后按 ESC 返回初始界面', () => {
      cy.get('body').type('{downarrow}');
      cy.get('body').type('{enter}');
      cy.get('body').type('{enter}');
      cy.get('#human-0-tetris-game-board[data-mode="main-menu"]').should(
        'exist',
      );
      cy.get('body').type('{esc}');
      cy.get('#tetris-container[data-mode="single"]').should('exist');
      cy.get('#human-0-tetris-game-board[data-mode="game-mode"]').should(
        'exist',
      );
    });

    it('场景8：单人模式进入 main-menu 后按 ESC 返回初始界面', () => {
      cy.get('body').type('{enter}');
      cy.get('#human-0-tetris-game-board[data-mode="main-menu"]').should(
        'exist',
      );
      cy.get('body').type('{esc}');
      cy.get('#tetris-container[data-mode="single"]').should('exist');
      cy.get('#human-0-tetris-game-board[data-mode="game-mode"]').should(
        'exist',
      );
    });

    it('场景9：单人模式游戏结束后按 ESC 返回初始界面', () => {
      cy.get('body').type('{enter}');
      cy.get('body').type('1');
      cy.get('body').type('{enter}');
      cy.get('body').type('e');
      cy.get('body').type('{enter}');
      cy.wait(4500);
      cy.get('body').type('q');
      cy.get('#human-0-tetris-game-board', { timeout: 30000 }).should(
        'be.visible',
      );
      cy.get('body').type('{esc}');
      cy.get('#tetris-container[data-mode="single"]').should('exist');
      cy.get('#human-0-tetris-game-board[data-mode="game-mode"]').should(
        'exist',
      );
      cy.get('.tetris-player').should('have.length', 1);
    });
  });

  // ========== 主菜单：等级选择 ==========
  describe('主菜单 - 等级选择', () => {
    beforeEach(() => {
      cy.get('body').type('{enter}');
    });

    it('按 1 键选择等级 1', () => {
      cy.get('body').type('1');
      cy.get('#human-0-tetris-level').should('contain', '01');
    });

    it('按 5 键选择等级 5', () => {
      cy.get('body').type('5');
      cy.get('#human-0-tetris-level').should('contain', '05');
    });

    it('按 T 键选择等级 10', () => {
      cy.get('body').type('t');
      cy.get('#human-0-tetris-level').should('contain', '10');
    });
  });

  // ========== 难度选择 ==========
  describe('难度选择', () => {
    beforeEach(() => {
      cy.get('body').type('{enter}');
    });

    it('Enter 进入难度选择界面', () => {
      cy.get('body').type('1');
      cy.get('body').type('{enter}');
      cy.get('#human-0-tetris-game-board[data-mode="difficulty"]').should(
        'exist',
      );
    });

    it('按 E 选择 Easy 并确认开始', () => {
      cy.get('body').type('1');
      cy.get('body').type('{enter}');
      cy.get('body').type('e');
      cy.get('body').type('{enter}');
      cy.get('#human-0-tetris-game-board').should('be.visible');
    });

    it('按 N 选择 Normal 并确认开始', () => {
      cy.get('body').type('3');
      cy.get('body').type('{enter}');
      cy.get('body').type('n');
      cy.get('body').type('{enter}');
      cy.get('#human-0-tetris-game-board').should('be.visible');
    });

    it('按 H 选择 Hard 并确认开始', () => {
      cy.get('body').type('5');
      cy.get('body').type('{enter}');
      cy.get('body').type('h');
      cy.get('body').type('{enter}');
      cy.get('#human-0-tetris-game-board').should('be.visible');
    });

    it('按 X 选择 Expert 并确认开始', () => {
      cy.get('body').type('9');
      cy.get('body').type('{enter}');
      cy.get('body').type('x');
      cy.get('body').type('{enter}');
      cy.get('#human-0-tetris-game-board').should('be.visible');
    });

    it('难度选择界面按 B 返回等级选择', () => {
      cy.get('body').type('1');
      cy.get('body').type('{enter}');
      cy.get('body').type('b');
      cy.get('body').type('3');
      cy.get('#human-0-tetris-level').should('contain', '03');
    });
  });

  // ========== 游戏中操作 ==========
  describe('游戏中操作', () => {
    const startGame = () => {
      cy.get('body').type('{enter}');
      cy.get('body').type('1');
      cy.get('body').type('{enter}');
      cy.get('body').type('e');
      cy.get('body').type('{enter}');
      cy.wait(4500);
    };

    it('完整开始流程：选等级 → 难度 → 开始 → 倒计时', () => {
      startGame();
      cy.get('#human-0-tetris-game-board').should('be.visible');
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
      cy.get('#human-0-tetris-game-board').should('be.visible');
    });

    it('M 切换背景音乐', () => {
      startGame();
      cy.get('body').type('m');
      cy.wait(300);
      cy.get('body').type('m');
      cy.get('#human-0-tetris-game-board').should('be.visible');
    });

    it('R 重新开始', () => {
      startGame();
      cy.get('body').type('r');
      cy.wait(2000);
      cy.get('#human-0-tetris-game-board').should('be.visible');
    });

    it('方块触底后仍可左右移动', () => {
      startGame();
      cy.get('body').type(' ');
      cy.wait(100);
      cy.get('body').type('{leftarrow}');
      cy.get('body').type('{rightarrow}');
      cy.get('#human-0-tetris-game-board').should('be.visible');
    });

    it('贴墙旋转成功', () => {
      startGame();
      for (let i = 0; i < 6; i++) {
        cy.get('body').type('{leftarrow}');
      }
      cy.get('body').type('{uparrow}');
      cy.get('#human-0-tetris-game-board').should('be.visible');
    });

    it('长按左右键自动移动', () => {
      startGame();
      cy.get('body').trigger('keydown', { key: 'ArrowRight' });
      cy.wait(300);
      cy.get('body').trigger('keyup', { key: 'ArrowRight' });
      cy.get('#human-0-tetris-game-board').should('be.visible');
    });

    it('按 C 键暂存方块', () => {
      startGame();
      cy.get('body').type('c');
      cy.get('#human-0-tetri-hold-piece').should('be.visible');
    });

    it('再次按 C 键交换方块', () => {
      startGame();
      cy.get('body').type('c');
      cy.wait(100);
      cy.get('body').type('c');
      cy.get('#human-0-tetris-game-board').should('be.visible');
    });

    it('不能连续 hold 两次', () => {
      startGame();
      cy.get('body').type('c');
      cy.wait(100);
      cy.get('body').type('c');
      cy.wait(100);
      cy.get('body').type('c');
      cy.get('#human-0-tetris-game-board').should('be.visible');
    });
  });

  // ========== AI 切换与控制 ==========
  describe('AI 切换与控制', () => {
    const startGame = () => {
      cy.get('body').type('{enter}');
      cy.get('body').type('1');
      cy.get('body').type('{enter}');
      cy.get('body').type('e');
      cy.get('body').type('{enter}');
      cy.wait(4500);
    };

    it('初始状态 controller 显示 HUMAN', () => {
      startGame();
      cy.get('#human-0-tetris-controller').should('contain', 'HUMAN');
    });

    it('按 S 键切换为 AI 模式', () => {
      startGame();
      cy.get('body').type('s');
      cy.get('#human-0-tetris-controller').should('contain', 'AI');
    });

    it('AI 模式下按 S 键切换回 HUMAN', () => {
      startGame();
      cy.get('body').type('s');
      cy.get('#human-0-tetris-controller').should('contain', 'AI');
      cy.get('body').type('s');
      cy.get('#human-0-tetris-controller').should('contain', 'HUMAN');
    });

    it('AI 模式下 M 键可以正常使用', () => {
      startGame();
      cy.get('body').type('s');
      cy.get('#human-0-tetris-controller').should('contain', 'AI');
      cy.get('body').type('m');
      cy.wait(300);
      cy.get('body').type('m');
      cy.get('#human-0-tetris-game-board').should('be.visible');
    });

    it('AI 模式下 P 键可以正常使用', () => {
      startGame();
      cy.get('body').type('s');
      cy.get('#human-0-tetris-controller').should('contain', 'AI');
      cy.get('body').type('p');
      cy.wait(500);
      cy.get('body').type('p');
      cy.wait(500);
      cy.get('#human-0-tetris-game-board').should('be.visible');
    });

    it('AI 模式下 R 键可以正常使用', () => {
      startGame();
      cy.get('body').type('s');
      cy.get('#human-0-tetris-controller').should('contain', 'AI');
      cy.get('body').type('r');
      cy.wait(2000);
      cy.get('#human-0-tetris-game-board').should('be.visible');
    });

    it('AI 模式下 Q 键可以正常使用', () => {
      startGame();
      cy.get('body').type('s');
      cy.get('#human-0-tetris-controller').should('contain', 'AI');
      cy.get('body').type('q');
      cy.wait(500);
      cy.get('#human-0-tetris-game-board').should('be.visible');
    });

    it('AI 模式下方向键和空格键不影响游戏', () => {
      startGame();
      cy.get('body').type('s');
      cy.get('#human-0-tetris-controller').should('contain', 'AI');
      cy.get('body').type('{leftarrow}');
      cy.get('body').type('{rightarrow}');
      cy.get('body').type('{uparrow}');
      cy.get('body').type('{downarrow}');
      cy.get('body').type(' ');
      cy.get('#human-0-tetris-game-board').should('be.visible');
      cy.get('#human-0-tetris-controller').should('contain', 'AI');
    });

    it('AI 模式下切换到 HUMAN 后可正常操作方块', () => {
      startGame();
      cy.get('body').type('s');
      cy.get('#human-0-tetris-controller').should('contain', 'AI');
      cy.get('body').type('s');
      cy.get('#human-0-tetris-controller').should('contain', 'HUMAN');
      cy.get('body').type('{leftarrow}');
      cy.get('body').type('{rightarrow}');
      cy.get('body').type('{uparrow}');
      cy.get('body').type(' ');
      cy.get('#human-0-tetris-game-board').should('be.visible');
    });

    it('多次 S 键切换不报错', () => {
      startGame();
      cy.get('body').type('s');
      cy.get('body').type('s');
      cy.get('body').type('s');
      cy.get('body').type('s');
      cy.get('#human-0-tetris-game-board').should('be.visible');
    });
  });

  // ========== Replay 回放 ==========
  describe('Replay 回放', () => {
    const playAndTriggerReplay = () => {
      cy.get('body').type('{enter}');
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
      cy.get('#human-0-tetris-game-board[data-mode="replay"]').should('exist');
      cy.get('#human-0-tetris-score').should('contain', '00000');
      cy.get('#human-0-tetris-lines').should('contain', '00');
      cy.get('#human-0-tetris-level').should('contain', '01');
    });

    it('回放期间键盘只有 Enter 有效', () => {
      playAndTriggerReplay();
      cy.get('#human-0-tetris-game-board[data-mode="replay"]').should('exist');
      cy.get('body').type('{leftarrow}');
      cy.get('body').type('{rightarrow}');
      cy.get('body').type('{uparrow}');
      cy.get('body').type('p');
      cy.get('body').type('r');
      cy.get('body').type('m');
      cy.get('body').type('s');
      cy.get('body').type('{enter}');
      cy.get('#human-0-tetris-game-board').should('be.visible');
    });

    it('回放结束后进入 game-over', () => {
      playAndTriggerReplay();
      cy.get('#human-0-tetris-game-board[data-mode="game-over"]', {
        timeout: 30000,
      }).should('exist');
      cy.get('#human-0-tetris-game-board').should('be.visible');
      cy.get('#human-0-tetris-score').should('be.visible');
    });

    it('回放结束后 high-score 已显示', () => {
      playAndTriggerReplay();
      cy.get('#human-0-tetris-game-board[data-mode="game-over"]', {
        timeout: 30000,
      }).should('exist');
      cy.get('#human-0-tetris-high-score').should('be.visible');
    });

    it('game-over 后按 Enter 回到主菜单', () => {
      playAndTriggerReplay();
      cy.get('#human-0-tetris-game-board[data-mode="game-over"]', {
        timeout: 30000,
      }).should('exist');
      cy.get('body').type('{enter}');
      cy.get('#human-0-tetris-game-board[data-mode="main-menu"]').should(
        'exist',
      );
      cy.get('#human-0-tetris-score').should('contain', '00000');
    });

    it('回放结束后可重新开始游戏', () => {
      playAndTriggerReplay();
      cy.get('#human-0-tetris-game-board[data-mode="game-over"]', {
        timeout: 30000,
      }).should('exist');
      cy.get('body').type('{enter}');
      cy.get('#human-0-tetris-game-board[data-mode="main-menu"]').should(
        'exist',
      );
      cy.get('body').type('1');
      cy.get('body').type('{enter}');
      cy.get('body').type('e');
      cy.get('body').type('{enter}');
      cy.wait(4500);
      cy.get('#human-0-tetris-game-board').should('be.visible');
    });

    it('回放中按 Enter 返回主菜单，重新开始后 controller 为 HUMAN', () => {
      playAndTriggerReplay();
      cy.get('#human-0-tetris-game-board[data-mode="replay"]', {
        timeout: 30000,
      }).should('exist');
      cy.get('body').type('{enter}');
      cy.get('#human-0-tetris-game-board[data-mode="main-menu"]').should(
        'exist',
      );
      cy.get('#human-0-tetris-controller').should('contain', 'HUMAN');
      cy.get('body').type('1');
      cy.get('#human-0-tetris-level').should('contain', '01');
      cy.get('body').type('{enter}');
      cy.get('#human-0-tetris-game-board[data-mode="difficulty"]').should(
        'exist',
      );
      cy.get('body').type('e');
      cy.get('body').type('{enter}');
      cy.wait(4500);
      cy.get('#human-0-tetris-game-board').should('be.visible');
      cy.get('#human-0-tetris-controller').should('contain', 'HUMAN');
      cy.get('body').type('{leftarrow}');
      cy.get('body').type('{leftarrow}');
      cy.get('body').type('{rightarrow}');
      cy.get('body').type('{uparrow}');
      cy.get('body').type(' ');
      cy.get('#human-0-tetris-game-board').should('be.visible');
    });
  });

  // ========== TouchController 触摸控制 ==========
  describe('TouchController 触摸控制', () => {
    beforeEach(() => {
      cy.viewport(375, 667);
      cy.visit('/dist/index.html');
    });

    describe('主菜单 - 等级选择（触摸）', () => {
      beforeEach(() => {
        cy.get('#human-0-tetris-btn-start').click();
      });

      it('DPAD UP 切换等级', () => {
        cy.get('#human-0-tetris-level').should('contain', '01');
        cy.get('#human-0-tetris-dpad-up').click();
        cy.get('#human-0-tetris-level').should('contain', '02');
        cy.get('#human-0-tetris-dpad-up').click();
        cy.get('#human-0-tetris-dpad-up').click();
        cy.get('#human-0-tetris-level').should('contain', '04');
      });

      it('DPAD DOWN 切换等级', () => {
        cy.get('#human-0-tetris-dpad-up').click();
        cy.get('#human-0-tetris-dpad-up').click();
        cy.get('#human-0-tetris-dpad-up').click();
        cy.get('#human-0-tetris-level').should('contain', '04');
        cy.get('#human-0-tetris-dpad-down').click();
        cy.get('#human-0-tetris-level').should('contain', '03');
      });

      it('DPAD UP 最高到 10', () => {
        for (let i = 0; i < 12; i++) {
          cy.get('#human-0-tetris-dpad-up').click();
        }
        cy.get('#human-0-tetris-level').should('contain', '10');
      });

      it('DPAD DOWN 最低到 1', () => {
        for (let i = 0; i < 12; i++) {
          cy.get('#human-0-tetris-dpad-down').click();
        }
        cy.get('#human-0-tetris-level').should('contain', '01');
      });

      it('START 进入难度选择', () => {
        cy.get('#human-0-tetris-btn-start').click();
        cy.get('#human-0-tetris-game-board[data-mode="difficulty"]').should(
          'exist',
        );
      });
    });

    describe('难度选择（触摸）', () => {
      beforeEach(() => {
        cy.get('#human-0-tetris-btn-start').click();
        cy.get('#human-0-tetris-btn-start').click();
        cy.get('#human-0-tetris-game-board[data-mode="difficulty"]').should(
          'exist',
        );
      });

      it('A 按钮选择 Easy', () => {
        cy.get('#human-0-tetris-btn-a').click();
        cy.get('#human-0-tetris-btn-start').click();
        cy.wait(4500);
        cy.get('#human-0-tetris-game-board').should('be.visible');
      });

      it('B 按钮选择 Normal', () => {
        cy.get('#human-0-tetris-btn-b').click();
        cy.get('#human-0-tetris-btn-start').click();
        cy.wait(4500);
        cy.get('#human-0-tetris-game-board').should('be.visible');
      });

      it('Y 按钮选择 Hard', () => {
        cy.get('#human-0-tetris-btn-y').click();
        cy.get('#human-0-tetris-btn-start').click();
        cy.wait(4500);
        cy.get('#human-0-tetris-game-board').should('be.visible');
      });

      it('X 按钮选择 Expert', () => {
        cy.get('#human-0-tetris-btn-x').click();
        cy.get('#human-0-tetris-btn-start').click();
        cy.wait(4500);
        cy.get('#human-0-tetris-game-board').should('be.visible');
      });

      it('BACK 返回主菜单', () => {
        cy.get('#human-0-tetris-btn-back').click();
        cy.get('#human-0-tetris-game-board[data-mode="main-menu"]').should(
          'exist',
        );
      });
    });

    describe('游戏中操作（触摸）', () => {
      const startGame = () => {
        cy.get('#human-0-tetris-btn-start').click();
        cy.get('#human-0-tetris-btn-start').click();
        cy.get('#human-0-tetris-btn-b').click();
        cy.get('#human-0-tetris-btn-start').click();
        cy.wait(4500);
      };

      it('DPAD LEFT 左移', () => {
        startGame();
        cy.get('#human-0-tetris-dpad-left').click();
        cy.get('#human-0-tetris-dpad-left').click();
        cy.get('#human-0-tetris-game-board').should('be.visible');
      });

      it('DPAD RIGHT 右移', () => {
        startGame();
        cy.get('#human-0-tetris-dpad-right').click();
        cy.get('#human-0-tetris-dpad-right').click();
        cy.get('#human-0-tetris-game-board').should('be.visible');
      });

      it('DPAD UP 旋转', () => {
        startGame();
        cy.get('#human-0-tetris-dpad-up').click();
        cy.get('#human-0-tetris-game-board').should('be.visible');
      });

      it('DPAD DOWN 软降', () => {
        startGame();
        cy.get('#human-0-tetris-dpad-down').click();
        cy.get('#human-0-tetris-game-board').should('be.visible');
      });

      it('B 按钮硬降', () => {
        startGame();
        cy.get('#human-0-tetris-btn-b').click();
        cy.get('#human-0-tetris-game-board').should('be.visible');
      });

      it('A 按钮切换音乐', () => {
        startGame();
        cy.get('#human-0-tetris-btn-a').click();
        cy.get('#human-0-tetris-game-board').should('be.visible');
      });

      it('Y 按钮暂停/继续', () => {
        startGame();
        cy.get('#human-0-tetris-btn-y').click();
        cy.wait(500);
        cy.get('#human-0-tetris-btn-y').click();
        cy.get('#human-0-tetris-game-board').should('be.visible');
      });

      it('X 按钮重新开始', () => {
        startGame();
        cy.get('#human-0-tetris-btn-x').click();
        cy.wait(2000);
        cy.get('#human-0-tetris-game-board').should('be.visible');
      });

      it('BACK 按钮退出', () => {
        startGame();
        cy.get('#human-0-tetris-btn-back').click();
        cy.wait(500);
        cy.get('#human-0-tetris-game-board').should('be.visible');
      });

      it('HOLD 按钮暂存方块', () => {
        startGame();
        cy.get('#human-0-tetris-btn-hold').click();
        cy.get('#human-0-tetri-hold-piece').should('be.visible');
      });
    });

    describe('回放模式（触摸）', () => {
      const playAndQuit = () => {
        cy.get('#human-0-tetris-btn-start').click();
        cy.get('#human-0-tetris-btn-start').click();
        cy.get('#human-0-tetris-btn-b').click();
        cy.get('#human-0-tetris-btn-start').click();
        cy.wait(4500);
        cy.get('#human-0-tetris-btn-b').click();
        cy.get('#human-0-tetris-btn-back').click();
        cy.wait(500);
      };

      it('回放中按 BACK 不报错', () => {
        playAndQuit();
        cy.get('#human-0-tetris-game-board[data-mode="replay"]', {
          timeout: 30000,
        }).should('exist');
        cy.get('#human-0-tetris-btn-back').click();
        cy.get('#human-0-tetris-game-board').should('be.visible');
      });

      it('回放中按 START 返回主菜单', () => {
        playAndQuit();
        cy.get('#human-0-tetris-game-board[data-mode="replay"]', {
          timeout: 30000,
        }).should('exist');
        cy.get('#human-0-tetris-btn-start').click();
        cy.get('#human-0-tetris-game-board[data-mode="main-menu"]').should(
          'exist',
        );
      });
    });
  });
});
