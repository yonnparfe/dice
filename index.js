class DiceGame {
  constructor() {
    this.player1Score = 0;
    this.player2Score = 0;
    this.currentPlayer = 1;
    this.currentRound = 1;
    this.gameFinished = false;
    this.totalRounds = 11;
    this.stats = {
      gamesPlayed: 0,
      player1Wins: 0,
      player2Wins: 0,
      draws: 0
    };
  }

  startGame() {
    this.player1Score = 0;
    this.player2Score = 0;
    this.currentRound = 1;
    this.currentPlayer = 1;
    this.gameFinished = false;
    
    this.updateUI();
    this.updateScores();
    this.updatePlayerDisplay();
    this.updateRoundDisplay();
  }

  rollDice(player) {
    if (this.gameFinished) return;
    
    const die1 = Math.floor(Math.random() * 6) + 1;
    const die2 = Math.floor(Math.random() * 6) + 1;
    const sum = die1 + die2;
    const requiredScore = this.currentRound;

    if (player === 1) {
      this.updateDiceElements(die1, die2, 'die1', 'die2');
      
      if (sum === requiredScore) {
        this.player1Score += requiredScore;
      }
    } else {
      this.updateDiceElements(die1, die2, 'die3', 'die4');
      
      if (sum === requiredScore) {
        this.player2Score += requiredScore;
      }
      
      this.currentRound++;
      this.updateRoundDisplay();
    }

    this.updateScores();
    this.switchPlayer();
    
    if (this.currentRound > this.totalRounds) {
      this.handleGameEnd();
    }
  }

  handleGameEnd() {
    if (typeof document !== 'undefined') {
      document.getElementById('finalize-button').style.display = 'inline-block';
      document.getElementById('roll-button').style.display = 'none';
    }
    this.gameFinished = true;
  }

  showFinalResult() {
    if (this.gameFinished) return;
    
    this.gameFinished = true;
    this.stats.gamesPlayed++;
    
    let winner;
    if (this.player1Score > this.player2Score) {
      winner = "Древний Дух восторжествовал!";
      this.stats.player1Wins++;
    } else if (this.player2Score > this.player1Score) {
      winner = "Лесной Хранитель одержал победу!";
      this.stats.player2Wins++;
    } else {
      winner = "Силы остались в равновесии!";
      this.stats.draws++;
    }
    
    this.updateFinalResult(winner);
    this.saveStats();
    this.updateStatsDisplay();
  }

  updateStatsDisplay() {
    if (typeof document === 'undefined') return;
    
    document.getElementById('games-played').textContent = `Игр сыграно: ${this.stats.gamesPlayed}`;
    document.getElementById('player1-wins').textContent = `Побед Древнего Духа: ${this.stats.player1Wins}`;
    document.getElementById('player2-wins').textContent = `Побед Лесного Хранителя: ${this.stats.player2Wins}`;
    document.getElementById('draws').textContent = `Ничьих: ${this.stats.draws}`;
    
    if (this.stats.gamesPlayed > 0) {
      document.getElementById('clear-stats').style.display = 'inline-block';
    }
  }

  updateUI() {
    if (typeof document === 'undefined') return;
    
    const elements = {
      'roll-button': 'inline-block',
      'finalize-button': 'none',
      'final-result': '',
      'die1': '?',
      'die2': '?',
      'die3': '?',
      'die4': '?'
    };
    
    for (const [id, value] of Object.entries(elements)) {
      const el = document.getElementById(id);
      if (!el) continue;
      
      if (id.includes('button')) {
        el.style.display = value;
      } else {
        el.textContent = value;
      }
    }
  }

  updateDiceElements(die1, die2, id1, id2) {
    if (typeof document === 'undefined') return;
    document.getElementById(id1).textContent = die1;
    document.getElementById(id2).textContent = die2;
  }

  updateScores() {
    if (typeof document === 'undefined') return;
    document.getElementById('result').textContent = `Сила Духа: ${this.player1Score}`;
    document.getElementById('result2').textContent = `Мудрость Хранителя: ${this.player2Score}`;
  }

  switchPlayer() {
    this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
    this.updatePlayerDisplay();
  }

  updatePlayerDisplay() {
    if (typeof document === 'undefined') return;
    
    const player1 = document.getElementById('player1');
    const player2 = document.getElementById('player2');
    
    player1.classList.remove('active-player');
    player2.classList.remove('active-player');
    
    if (this.currentPlayer === 1) {
      player1.classList.add('active-player');
    } else {
      player2.classList.add('active-player');
    }
  }

  updateRoundDisplay() {
    if (typeof document === 'undefined') return;
    const round = Math.min(this.currentRound, this.totalRounds);
    document.getElementById('current-round').textContent = 
      `Текущее испытание: ${round} (Сумма пророчества: ${round})`;
  }

  updateFinalResult(result) {
    if (typeof document === 'undefined') return;
    document.getElementById('final-result').textContent = result;
  }

  saveStats() {
    if (typeof document === 'undefined') return;
    document.cookie = `forestDiceStats=${JSON.stringify(this.stats)}; max-age=31536000; path=/`;
  }

  loadStats() {
    if (typeof document === 'undefined') return;
    const cookies = document.cookie.split(';').map(c => c.trim());
    const statsCookie = cookies.find(c => c.startsWith('forestDiceStats='));
    
    if (statsCookie) {
      try {
        this.stats = JSON.parse(statsCookie.split('=')[1]);
        this.updateStatsDisplay();
      } catch (e) {
        console.error('Error parsing stats cookie', e);
      }
    }
  }
}

const game = new DiceGame();

if (typeof document !== 'undefined') {
  document.addEventListener("DOMContentLoaded", function() {
    game.loadStats();
    
    document.getElementById('start-button').addEventListener('click', () => {
      game.startGame();
    });

    document.getElementById('roll-button').addEventListener('click', () => {
      if (!game.gameFinished && game.currentRound <= game.totalRounds) {
        game.rollDice(game.currentPlayer);
      }
    });

    document.getElementById('finalize-button').addEventListener('click', () => {
      game.showFinalResult();
    });

    document.getElementById('clear-stats').addEventListener('click', () => {
      game.stats = { gamesPlayed: 0, player1Wins: 0, player2Wins: 0, draws: 0 };
      document.cookie = 'forestDiceStats=; max-age=0; path=/';
      game.updateStatsDisplay();
      document.getElementById('clear-stats').style.display = 'none';
    });
  });
}

module.exports = {
  DiceGame,
  gameInstance: game
};