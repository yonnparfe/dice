const { gameInstance } = require('../index');

beforeEach(() => {
  document.body.innerHTML = `
    <button id="start-button"></button>
    <button id="roll-button"></button>
    <button id="finalize-button"></button>
    <div id="die1">?</div>
    <div id="die2">?</div>
    <div id="die3">?</div>
    <div id="die4">?</div>
    <div id="result"></div>
    <div id="result2"></div>
    <div id="player1" class="player"></div>
    <div id="player2" class="player"></div>
    <div id="final-result"></div>
    <div id="current-round"></div>
    <div id="games-played"></div>
    <div id="player1-wins"></div>
    <div id="player2-wins"></div>
    <div id="draws"></div>
    <button id="clear-stats"></button>
  `;

  gameInstance.startGame();
});

describe('Класс DiceGame', () => {
  describe('Метод startGame()', () => {
    test('сбрасывает все параметры игры', () => {
      gameInstance.player1Score = 10;
      gameInstance.player2Score = 8;
      gameInstance.currentRound = 5;
      gameInstance.currentPlayer = 2;
      gameInstance.gameFinished = true;

      gameInstance.startGame();

      expect(gameInstance.player1Score).toBe(0);
      expect(gameInstance.player2Score).toBe(0);
      expect(gameInstance.currentRound).toBe(1);
      expect(gameInstance.currentPlayer).toBe(1);
      expect(gameInstance.gameFinished).toBe(false);
    });
  });

  describe('Метод rollDice()', () => {
    let mockMathRandom;

    beforeEach(() => {
      mockMathRandom = jest.spyOn(global.Math, 'random')
        .mockReturnValueOnce(0.333)
        .mockReturnValueOnce(0.166);
    });

    afterEach(() => {
      mockMathRandom.mockRestore();
    });

    test('не начисляет очки при несовпадении суммы', () => {
      gameInstance.currentRound = 5;
      
      jest.spyOn(global.Math, 'random')
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(0);
      
      gameInstance.rollDice(1);
      expect(gameInstance.player1Score).toBe(0);
    });

    test('переключает игрока после хода', () => {
      const initialPlayer = gameInstance.currentPlayer;
      gameInstance.rollDice(initialPlayer);
      expect(gameInstance.currentPlayer).toBe(initialPlayer === 1 ? 2 : 1);
    });

    test('увеличивает раунд после хода второго игрока', () => {
      gameInstance.currentPlayer = 2;
      gameInstance.currentRound = 3;
      
      gameInstance.rollDice(2);
      
      expect(gameInstance.currentRound).toBe(4);
    });
  });

  describe('Метод showFinalResult()', () => {
    test('определяет победителя (игрок 1)', () => {
      gameInstance.player1Score = 10;
      gameInstance.player2Score = 8;
      gameInstance.showFinalResult();
      
      expect(document.getElementById('final-result').textContent).toBe('Древний Дух восторжествовал!');
      expect(gameInstance.stats.player1Wins).toBe(1);
    });

    test('определяет победителя (игрок 2)', () => {
      gameInstance.player1Score = 5;
      gameInstance.player2Score = 8;
      gameInstance.showFinalResult();
      
      expect(document.getElementById('final-result').textContent).toBe('Лесной Хранитель одержал победу!');
      expect(gameInstance.stats.player2Wins).toBe(1);
    });

    test('определяет ничью', () => {
      gameInstance.player1Score = 7;
      gameInstance.player2Score = 7;
      gameInstance.showFinalResult();
      
      expect(document.getElementById('final-result').textContent).toBe('Силы остались в равновесии!');
      expect(gameInstance.stats.draws).toBe(1);
    });
  });

  describe('Работа с куками', () => {
    test('сохраняет статистику', () => {
      Object.defineProperty(document, 'cookie', {
        writable: true,
        value: ''
      });

      gameInstance.stats.gamesPlayed = 5;
      gameInstance.saveStats();
      
      expect(document.cookie).toContain('forestDiceStats');
    });

    test('загружает статистику', () => {
      document.cookie = 'forestDiceStats={"gamesPlayed":3,"player1Wins":1,"player2Wins":1,"draws":1}';
      gameInstance.loadStats();
      
      expect(gameInstance.stats.gamesPlayed).toBe(3);
      expect(gameInstance.stats.player1Wins).toBe(1);
      expect(gameInstance.stats.player2Wins).toBe(1);
      expect(gameInstance.stats.draws).toBe(1);
    });
  });
});