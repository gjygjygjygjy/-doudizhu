// 核心代码 - 转换为浏览器可执行格式
class Cards {
  constructor() {
    this.cards = [];
    this.initCards();
  }

  initCards() {
    const suits = ['♠', '♥', '♦', '♣'];
    const ranks = ['3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A', '2'];
    
    for (let suit of suits) {
      for (let rank of ranks) {
        this.cards.push({ suit, rank, value: ranks.indexOf(rank) + 3 });
      }
    }
    
    this.cards.push({ suit: '', rank: '小王', value: 16 });
    this.cards.push({ suit: '', rank: '大王', value: 17 });
  }

  shuffle() {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  deal() {
    const player1 = [];
    const player2 = [];
    const player3 = [];
    const landlordCards = [];

    for (let i = 0; i < this.cards.length; i++) {
      if (i >= 51) {
        landlordCards.push(this.cards[i]);
      } else if (i % 3 === 0) {
        player1.push(this.cards[i]);
      } else if (i % 3 === 1) {
        player2.push(this.cards[i]);
      } else {
        player3.push(this.cards[i]);
      }
    }

    return {
      player1: this.sortCards(player1),
      player2: this.sortCards(player2),
      player3: this.sortCards(player3),
      landlordCards: this.sortCards(landlordCards)
    };
  }

  sortCards(cards) {
    return cards.sort((a, b) => b.value - a.value);
  }

  getCards() {
    return this.cards;
  }
}

class HandEvaluator {
  evaluate(cards) {
    if (cards.length === 0) return null;
    if (cards.length === 1) return { type: '单牌', strength: cards[0].value };
    if (cards.length === 2) {
      if (cards[0].value === 17 && cards[1].value === 16) {
        return { type: '王炸', strength: 20 };
      } else if (cards[0].value === cards[1].value) {
        return { type: '对子', strength: cards[0].value };
      } else {
        return null;
      }
    }
    if (cards.length === 3) {
      if (cards[0].value === cards[1].value && cards[1].value === cards[2].value) {
        return { type: '三张', strength: cards[0].value };
      } else {
        return null;
      }
    }
    if (cards.length === 4) {
      if (cards[0].value === cards[1].value && cards[1].value === cards[2].value && cards[2].value === cards[3].value) {
        return { type: '炸弹', strength: cards[0].value + 10 };
      } else {
        return null;
      }
    }
    
    const straightResult = this.isStraight(cards);
    if (straightResult) return straightResult;
    
    const straightFlushResult = this.isStraightFlush(cards);
    if (straightFlushResult) return straightFlushResult;
    
    const airplaneResult = this.isAirplane(cards);
    if (airplaneResult) return airplaneResult;
    
    const fourWithResult = this.isFourWith(cards);
    if (fourWithResult) return fourWithResult;
    
    const threeWithResult = this.isThreeWith(cards);
    if (threeWithResult) return threeWithResult;
    
    return null;
  }

  isStraight(cards) {
    if (cards.length < 5) return null;
    
    const values = cards.map(card => card.value).sort((a, b) => a - b);
    
    for (let i = 1; i < values.length; i++) {
      if (values[i] !== values[i - 1] + 1) {
        return null;
      }
    }
    
    return { type: '顺子', strength: values[values.length - 1] };
  }

  isStraightFlush(cards) {
    if (cards.length < 5) return null;
    
    const suit = cards[0].suit;
    if (cards.some(card => card.suit !== suit)) return null;
    
    const straightResult = this.isStraight(cards);
    if (straightResult) {
      return { type: '同花顺', strength: straightResult.strength + 5 };
    }
    
    return null;
  }

  isAirplane(cards) {
    if (cards.length < 6) return null;
    
    const valueCount = {};
    for (let card of cards) {
      valueCount[card.value] = (valueCount[card.value] || 0) + 1;
    }
    
    const triplets = Object.keys(valueCount).filter(value => valueCount[value] === 3).map(Number).sort((a, b) => a - b);
    
    if (triplets.length < 2) return null;
    
    for (let i = 1; i < triplets.length; i++) {
      if (triplets[i] !== triplets[i - 1] + 1) {
        return null;
      }
    }
    
    return { type: '飞机', strength: triplets[triplets.length - 1] };
  }

  isFourWith(cards) {
    if (cards.length < 6) return null;
    
    const valueCount = {};
    for (let card of cards) {
      valueCount[card.value] = (valueCount[card.value] || 0) + 1;
    }
    
    const quad = Object.keys(valueCount).find(value => valueCount[value] === 4);
    if (!quad) return null;
    
    return { type: '四带二', strength: Number(quad) + 8 };
  }

  isThreeWith(cards) {
    if (cards.length < 4) return null;
    
    const valueCount = {};
    for (let card of cards) {
      valueCount[card.value] = (valueCount[card.value] || 0) + 1;
    }
    
    const triplet = Object.keys(valueCount).find(value => valueCount[value] === 3);
    if (!triplet) return null;
    
    return { type: '三带一', strength: Number(triplet) + 3 };
  }

  compare(h1, h2) {
    if (!h1 || !h2) return null;
    if (h1.type !== h2.type && h1.type !== '王炸' && h2.type !== '王炸') return null;
    if (h1.type === '王炸') return 1;
    if (h2.type === '王炸') return -1;
    return h1.strength - h2.strength;
  }
}

class CustomProbability {
  constructor(probability = 0.5) {
    this.goodHandProbability = probability;
  }

  setProbability(probability) {
    this.goodHandProbability = Math.max(0, Math.min(1, probability));
  }

  generateGoodHand(cards) {
    const goodCards = JSON.parse(JSON.stringify(cards));
    
    this.enhanceHand(goodCards);
    
    return goodCards;
  }

  enhanceHand(cards) {
    for (let i = 0; i < cards.length; i++) {
      if (cards[i].value < 13 && Math.random() < 0.8) {
        const highCardValues = [14, 15, 16, 17, 13];
        const randomHighValue = highCardValues[Math.floor(Math.random() * highCardValues.length)];
        cards[i] = {
          suit: cards[i].suit,
          rank: this.getValueToRank(randomHighValue),
          value: randomHighValue
        };
      }
    }
    return cards;
  }

  getValueToRank(value) {
    const rankMap = {
      3: '3', 4: '4', 5: '5', 6: '6', 7: '7', 8: '8', 9: '9',
      10: '10', 11: 'J', 12: 'Q', 13: 'K', 14: 'A', 15: '2',
      16: '小王', 17: '大王'
    };
    return rankMap[value] || '3';
  }

  dealWithProbability() {
    const baseCards = this.createBaseDeck();
    const player1 = [];
    const player2 = [];
    const player3 = [];
    const landlordCards = [];

    if (Math.random() < this.goodHandProbability) {
      const goodHandPlayer = 1;
      
      if (goodHandPlayer === 1) {
        const goodCards = this.generateGoodHand(baseCards.slice(0, 17));
        player1.push(...goodCards);
        for (let i = 17; i < 51; i++) {
          if ((i - 17) % 2 === 0) {
            player2.push(baseCards[i]);
          } else {
            player3.push(baseCards[i]);
          }
        }
      }
    } else {
      for (let i = 0; i < 51; i++) {
        if (i % 3 === 0) {
          player1.push(baseCards[i]);
        } else if (i % 3 === 1) {
          player2.push(baseCards[i]);
        } else {
          player3.push(baseCards[i]);
        }
      }
    }

    for (let i = 51; i < 54; i++) {
      landlordCards.push(baseCards[i]);
    }

    return {
      player1: this.sortCards(player1),
      player2: this.sortCards(player2),
      player3: this.sortCards(player3),
      landlordCards: this.sortCards(landlordCards)
    };
  }

  createBaseDeck() {
    const suits = ['♠', '♥', '♦', '♣'];
    const ranks = ['3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A', '2'];
    const deck = [];
    
    for (let suit of suits) {
      for (let rank of ranks) {
        deck.push({ suit, rank, value: ranks.indexOf(rank) + 3 });
      }
    }
    
    deck.push({ suit: '', rank: '小王', value: 16 });
    deck.push({ suit: '', rank: '大王', value: 17 });
    
    this.shuffle(deck);
    return deck;
  }

  shuffle(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
  }

  sortCards(cards) {
    return cards.sort((a, b) => b.value - a.value);
  }
}

class Game {
  constructor(goodHandProbability = 0.5) {
    this.cards = new Cards();
    this.evaluator = new HandEvaluator();
    this.customProbability = new CustomProbability(goodHandProbability);
    this.players = {
      1: { cards: [], isLandlord: false },
      2: { cards: [], isLandlord: false },
      3: { cards: [], isLandlord: false }
    };
    this.landlordCards = [];
    this.currentPlayer = 1;
    this.landlord = null;
    this.lastHand = null;
    this.lastPlayer = null;
    this.lastPlayedCards = null;
    this.playedCards = [];
  }

  start() {
    const dealResult = this.customProbability.dealWithProbability();
    this.players[1].cards = dealResult.player1;
    this.players[2].cards = dealResult.player2;
    this.players[3].cards = dealResult.player3;
    this.landlordCards = dealResult.landlordCards;
    this.currentPlayer = 1;
    this.landlord = null;
    this.lastHand = null;
    this.lastPlayer = null;
    this.lastPlayedCards = null;
    this.playedCards = [];
    
    return {
      player1: this.players[1].cards,
      player2: this.players[2].cards,
      player3: this.players[3].cards,
      landlordCards: this.landlordCards
    };
  }

  bidLandlord(playerId, bid) {
    if (playerId !== this.currentPlayer) return false;
    
    if (bid) {
      this.landlord = playerId;
      this.players[playerId].isLandlord = true;
      this.players[playerId].cards = [...this.players[playerId].cards, ...this.landlordCards];
      this.players[playerId].cards.sort((a, b) => b.value - a.value);
      this.currentPlayer = playerId;
      return true;
    } else {
      this.currentPlayer = this.currentPlayer % 3 + 1;
      return true;
    }
  }

  play(playerId, selectedCards) {
    if (playerId !== this.currentPlayer) return false;
    
    const handEvaluation = this.evaluator.evaluate(selectedCards);
    if (!handEvaluation) return false;
    
    if (this.lastHand && playerId !== this.lastPlayer) {
      const comparison = this.evaluator.compare(handEvaluation, this.lastHand);
      if (comparison <= 0) return false;
    }
    
    this.players[playerId].cards = this.players[playerId].cards.filter(
      card => !selectedCards.some(selected => 
        selected.suit === card.suit && selected.rank === card.rank
      )
    );
    
    // 更新已打出的牌记录
    this.playedCards.push(...selectedCards);
    
    this.lastHand = handEvaluation;
    this.lastPlayer = playerId;
    this.lastPlayedCards = selectedCards;
    this.currentPlayer = this.currentPlayer % 3 + 1;
    
    return true;
  }

  pass(playerId) {
    if (playerId !== this.currentPlayer) return false;
    
    this.currentPlayer = this.currentPlayer % 3 + 1;
    return true;
  }

  checkWinner() {
    for (let playerId in this.players) {
      if (this.players[playerId].cards.length === 0) {
        return {
          winner: playerId,
          isLandlordWin: this.players[playerId].isLandlord
        };
      }
    }
    return null;
  }

  getPlayerCards(playerId) {
    return this.players[playerId].cards;
  }

  getGameState() {
    return {
      players: this.players,
      currentPlayer: this.currentPlayer,
      landlord: this.landlord,
      lastHand: this.lastHand,
      lastPlayer: this.lastPlayer
    };
  }

  setGoodHandProbability(probability) {
    this.customProbability.setProbability(probability);
  }
}

// 游戏控制
class GameController {
  constructor() {
    this.game = null;
    this.goodHandProbability = 0.5;
    this.selectedCards = [];
    this.gameState = 'menu';
    this.soundEnabled = true;
    this.init();
  }

  playSound(soundId) {
    if (!this.soundEnabled) return;
    
    const sound = document.getElementById(soundId);
    if (sound) {
      sound.currentTime = 0;
      sound.play().catch(e => {
        // 音效文件不存在时不报错，静默处理
        console.log('音效播放失败:', e);
      });
    } else {
      // 如果音效元素不存在，使用Web Audio API创建简单的音效
      this.createSimpleSound();
    }
  }

  playBackgroundMusic() {
    if (!this.soundEnabled) return;
    
    const bgMusic = document.getElementById('bg-music');
    if (bgMusic) {
      bgMusic.volume = 0.3;
      bgMusic.play().catch(e => {
        console.log('背景音乐播放失败:', e);
      });
    }
  }

  stopBackgroundMusic() {
    const bgMusic = document.getElementById('bg-music');
    if (bgMusic) {
      bgMusic.pause();
      bgMusic.currentTime = 0;
    }
  }

  createSimpleSound() {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (e) {
      // Web Audio API不可用时静默处理
      console.log('无法创建音效:', e);
    }
  }

  init() {
    this.bindEvents();
    this.updateProbabilityDisplay();
  }

  bindEvents() {
    // 主菜单按钮
    document.getElementById('start-game').addEventListener('click', () => this.startGame());
    document.getElementById('settings').addEventListener('click', () => this.showSettings());
    document.getElementById('toggle-sound').addEventListener('click', () => this.toggleSound());

    // 设置界面按钮
    document.getElementById('probability-slider').addEventListener('input', () => this.updateProbabilityDisplay());
    document.getElementById('save-settings').addEventListener('click', () => this.saveSettings());
    document.getElementById('cancel-settings').addEventListener('click', () => this.hideSettings());

    // 游戏界面按钮
    document.getElementById('play-button').addEventListener('click', () => this.playCards());
    document.getElementById('pass-button').addEventListener('click', () => this.passTurn());
    document.getElementById('hint-button').addEventListener('click', () => this.hint());

    // 游戏结束按钮
    document.getElementById('play-again').addEventListener('click', () => this.startGame());
    document.getElementById('back-to-menu').addEventListener('click', () => this.backToMenu());
  }

  hint() {
    if (this.game.currentPlayer !== 1) return;
    
    const playerCards = this.game.getPlayerCards(1);
    if (playerCards.length === 0) return;
    
    // 简单的提示逻辑：选择第一张牌
    this.selectedCards = [0];
    this.updateCardSelection();
    this.updateStatusMessage('提示：建议出第一张牌');
    this.playSound('play-sound');
  }

  startGame() {
    this.playBackgroundMusic();
    this.game = new Game(this.goodHandProbability);
    const dealResult = this.game.start();
    
    this.gameState = 'bidding';
    this.selectedCards = [];
    
    this.hideAllMenus();
    document.getElementById('game-interface').classList.remove('hidden');
    
    this.playSound('deal-sound');
    this.renderCards(dealResult);
    this.updateStatusMessage('轮到玩家1叫地主');
    
    // 自动处理其他玩家的叫地主
    setTimeout(() => this.handleBidding(), 1000);
  }

  handleBidding() {
    if (this.gameState !== 'bidding') return;
    
    // 玩家1叫地主
    const player1Bid = true;
    this.game.bidLandlord(1, player1Bid);
    
    if (player1Bid) {
      this.gameState = 'playing';
      this.updateStatusMessage('玩家1成为地主，游戏开始');
      this.updatePlayerStatus();
      this.renderCards(this.game.getGameState());
      
      // 开始游戏循环
      this.gameLoop();
    }
  }

  gameLoop() {
    if (this.gameState !== 'playing') return;
    
    const winner = this.game.checkWinner();
    if (winner) {
      this.endGame(winner);
      return;
    }

    if (this.game.currentPlayer === 1) {
      // 玩家回合
      this.updateStatusMessage('轮到你出牌');
    } else {
      // AI玩家回合
      this.updateStatusMessage(`轮到玩家${this.game.currentPlayer}出牌`);
      setTimeout(() => this.aiPlay(), 1000);
    }
  }

  aiPlay() {
    if (this.game.currentPlayer === 1) return;
    
    // 简单的AI逻辑
    const playerCards = this.game.getPlayerCards(this.game.currentPlayer);
    
    // 随机选择一张牌或pass
    if (playerCards.length > 0 && Math.random() > 0.3) {
      const randomIndex = Math.floor(Math.random() * playerCards.length);
      const selectedCard = [playerCards[randomIndex]];
      
      if (this.game.play(this.game.currentPlayer, selectedCard)) {
        this.updateStatusMessage(`玩家${this.game.currentPlayer}出了一张牌`);
        this.renderCards(this.game.getGameState());
      } else {
        this.game.pass(this.game.currentPlayer);
        this.updateStatusMessage(`玩家${this.game.currentPlayer}选择Pass`);
      }
    } else {
      this.game.pass(this.game.currentPlayer);
      this.updateStatusMessage(`玩家${this.game.currentPlayer}选择Pass`);
    }
    
    // 继续游戏循环
    setTimeout(() => this.gameLoop(), 1000);
  }

  playCards() {
    if (this.game.currentPlayer !== 1 || this.selectedCards.length === 0) return;
    
    // 将索引转换为实际的牌对象
    const playerCards = this.game.getPlayerCards(1);
    const selectedCardObjects = this.selectedCards.map(index => playerCards[index]);
    
    if (this.game.play(1, selectedCardObjects)) {
      this.playSound('play-sound');
      this.updateStatusMessage('你出了牌');
      this.selectedCards = [];
      this.renderCards(this.game.getGameState());
      
      // 继续游戏循环
      setTimeout(() => this.gameLoop(), 1000);
    } else {
      this.updateStatusMessage('出牌无效，请重新选择');
    }
  }

  passTurn() {
    if (this.game.currentPlayer !== 1) return;
    
    this.game.pass(1);
    this.updateStatusMessage('你选择Pass');
    this.selectedCards = [];
    
    // 继续游戏循环
    setTimeout(() => this.gameLoop(), 1000);
  }

  endGame(winner) {
    this.gameState = 'gameOver';
    this.stopBackgroundMusic();
    
    const gameOverTitle = document.getElementById('game-over-title');
    const gameOverMessage = document.getElementById('game-over-message');
    
    if (winner.isLandlordWin) {
      gameOverTitle.textContent = '地主胜利！';
      gameOverMessage.textContent = `玩家${winner.winner}（地主）获胜！`;
      if (winner.winner === '1') {
        this.playSound('win-sound');
      } else {
        this.playSound('lose-sound');
      }
    } else {
      gameOverTitle.textContent = '农民胜利！';
      gameOverMessage.textContent = `玩家${winner.winner}（农民）获胜！`;
      if (winner.winner === '1') {
        this.playSound('win-sound');
      } else {
        this.playSound('lose-sound');
      }
    }
    
    document.getElementById('game-over').classList.remove('hidden');
  }

  renderCards(gameState) {
    // 渲染玩家1的手牌
    const player1CardsElement = document.getElementById('player1-cards');
    player1CardsElement.innerHTML = '';
    
    const player1Cards = this.game.getPlayerCards(1);
    player1Cards.forEach((card, index) => {
      const cardElement = this.createCardElement(card, index);
      player1CardsElement.appendChild(cardElement);
    });
    
    // 更新玩家1的牌数
    document.getElementById('player1-count').textContent = player1Cards.length;

    // 渲染玩家2的牌（牌背）
    const player2CardsElement = document.getElementById('player2-cards');
    player2CardsElement.innerHTML = '';
    
    const player2CardsCount = this.game.getPlayerCards(2).length;
    for (let i = 0; i < player2CardsCount; i++) {
      const cardElement = document.createElement('div');
      cardElement.className = 'card back';
      player2CardsElement.appendChild(cardElement);
    }
    
    // 更新玩家2的牌数
    document.getElementById('player2-count').textContent = player2CardsCount;

    // 渲染玩家3的牌（牌背）
    const player3CardsElement = document.getElementById('player3-cards');
    player3CardsElement.innerHTML = '';
    
    const player3CardsCount = this.game.getPlayerCards(3).length;
    for (let i = 0; i < player3CardsCount; i++) {
      const cardElement = document.createElement('div');
      cardElement.className = 'card back';
      player3CardsElement.appendChild(cardElement);
    }
    
    // 更新玩家3的牌数
    document.getElementById('player3-count').textContent = player3CardsCount;

    // 渲染地主牌
    const landlordCardsElement = document.querySelector('#landlord-cards .cards-area');
    landlordCardsElement.innerHTML = '';
    
    if (gameState && gameState.landlordCards) {
      gameState.landlordCards.forEach(card => {
        const cardElement = this.createCardElement(card);
        cardElement.classList.add('small');
        landlordCardsElement.appendChild(cardElement);
      });
    }
    
    // 渲染出牌区域
    this.renderLastPlay();
    
    // 渲染记牌器
    this.renderCardMemory();
  }

  renderCardMemory() {
    const playedCardsContainer = document.getElementById('played-cards-container');
    playedCardsContainer.innerHTML = '';
    
    if (this.game.playedCards && this.game.playedCards.length > 0) {
      this.game.playedCards.forEach(card => {
        const cardElement = this.createCardElement(card);
        playedCardsContainer.appendChild(cardElement);
      });
    } else {
      const emptyMessage = document.createElement('div');
      emptyMessage.textContent = '暂无已打出的牌';
      emptyMessage.style.color = 'rgba(255, 255, 255, 0.6)';
      emptyMessage.style.fontSize = '12px';
      emptyMessage.style.textAlign = 'center';
      emptyMessage.style.padding = '10px';
      playedCardsContainer.appendChild(emptyMessage);
    }
  }

  renderLastPlay() {
    const lastPlayElement = document.getElementById('last-play');
    lastPlayElement.innerHTML = '';
    
    if (this.game.lastHand && this.game.lastPlayer && this.game.lastPlayedCards) {
      // 添加出牌信息
      const lastPlayMessage = document.createElement('div');
      lastPlayMessage.className = 'last-play-message';
      lastPlayMessage.textContent = `玩家${this.game.lastPlayer}出了: ${this.game.lastHand.type}`;
      lastPlayElement.appendChild(lastPlayMessage);
      
      // 添加出的牌的图片
      const playedCardsContainer = document.createElement('div');
      playedCardsContainer.className = 'played-cards';
      
      // 使用实际出的牌的信息
      this.game.lastPlayedCards.forEach(card => {
        const cardElement = this.createCardElement(card);
        playedCardsContainer.appendChild(cardElement);
      });
      
      lastPlayElement.appendChild(playedCardsContainer);
    }
  }

  createCardElement(card, index) {
    const cardElement = document.createElement('div');
    cardElement.className = 'card';
    
    if (card.suit === '♠') {
      cardElement.classList.add('suit-spade');
      cardElement.innerHTML = `<span>${card.suit}</span><span>${card.rank}</span>`;
    } else if (card.suit === '♥') {
      cardElement.classList.add('suit-heart');
      cardElement.innerHTML = `<span>${card.suit}</span><span>${card.rank}</span>`;
    } else if (card.suit === '♦') {
      cardElement.classList.add('suit-diamond');
      cardElement.innerHTML = `<span>${card.suit}</span><span>${card.rank}</span>`;
    } else if (card.suit === '♣') {
      cardElement.classList.add('suit-club');
      cardElement.innerHTML = `<span>${card.suit}</span><span>${card.rank}</span>`;
    } else {
      cardElement.classList.add('joker');
      cardElement.innerHTML = `<span>${card.rank}</span>`;
    }
    
    // 添加点击事件
    if (index !== undefined) {
      cardElement.addEventListener('click', () => this.toggleCardSelection(index));
    }
    
    return cardElement;
  }

  toggleCardSelection(index) {
    if (this.game.currentPlayer !== 1) return;
    
    const cardIndex = this.selectedCards.indexOf(index);
    if (cardIndex > -1) {
      this.selectedCards.splice(cardIndex, 1);
    } else {
      this.selectedCards.push(index);
    }
    
    this.updateCardSelection();
  }

  updateCardSelection() {
    const player1CardsElement = document.getElementById('player1-cards');
    const cardElements = player1CardsElement.querySelectorAll('.card');
    
    cardElements.forEach((element, index) => {
      if (this.selectedCards.includes(index)) {
        element.classList.add('selected');
      } else {
        element.classList.remove('selected');
      }
    });
  }

  updateStatusMessage(message) {
    document.getElementById('status-message').textContent = message;
  }

  updatePlayerStatus() {
    if (this.game.landlord === 1) {
      document.getElementById('player1-status').textContent = '地主';
    } else {
      document.getElementById('player1-status').textContent = '农民';
    }
  }

  showSettings() {
    document.getElementById('main-menu').classList.add('hidden');
    document.getElementById('settings-menu').classList.remove('hidden');
  }

  hideSettings() {
    document.getElementById('settings-menu').classList.add('hidden');
    document.getElementById('main-menu').classList.remove('hidden');
  }

  saveSettings() {
    const probability = parseInt(document.getElementById('probability-slider').value) / 100;
    this.goodHandProbability = probability;
    this.hideSettings();
  }

  updateProbabilityDisplay() {
    const slider = document.getElementById('probability-slider');
    const valueDisplay = document.getElementById('probability-value');
    valueDisplay.textContent = slider.value;
  }

  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    const button = document.getElementById('toggle-sound');
    button.textContent = `音效：${this.soundEnabled ? '开' : '关'}`;
  }

  backToMenu() {
    this.gameState = 'menu';
    this.hideAllMenus();
    document.getElementById('main-menu').classList.remove('hidden');
  }

  hideAllMenus() {
    document.getElementById('main-menu').classList.add('hidden');
    document.getElementById('settings-menu').classList.add('hidden');
    document.getElementById('game-over').classList.add('hidden');
    document.getElementById('game-interface').classList.add('hidden');
  }
}

// 初始化游戏
window.addEventListener('DOMContentLoaded', () => {
  new GameController();
});