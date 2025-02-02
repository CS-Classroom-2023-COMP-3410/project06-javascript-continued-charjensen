// keyboardtrainer.js

const prompts = {
  easy: [
    [
      { current: 'The', options: ['quick', 'lazy', 'small'], correct: 'quick' },
      { current: 'quick', options: ['brown', 'green', 'yellow'], correct: 'brown' },
      { current: 'brown', options: ['fox', 'dog', 'cat'], correct: 'fox' }
    ],
    [
      { current: 'A', options: ['big', 'tiny', 'huge'], correct: 'big' },
      { current: 'big', options: ['red', 'blue', 'green'], correct: 'red' },
      { current: 'red', options: ['ball', 'cube', 'star'], correct: 'ball' }
    ]
  ],
  medium: [
    [
      { current: 'Once', options: ['upon', 'above', 'before'], correct: 'upon' },
      { current: 'upon', options: ['a', 'an', 'the'], correct: 'a' },
      { current: 'a', options: ['time', 'story', 'dream'], correct: 'time' }
    ],
    [
      { current: 'In', options: ['the', 'a', 'one'], correct: 'the' },
      { current: 'the', options: ['middle', 'center', 'edge'], correct: 'middle' },
      { current: 'middle', options: ['of', 'with', 'by'], correct: 'of' }
    ]
  ],
  hard: [
    [
      { current: 'Supercalifragilistic', options: ['expialidocious', 'fantabulous', 'magnificent'], correct: 'expialidocious' },
      { current: 'expialidocious', options: ['even', 'though', 'it'], correct: 'even' },
      { current: 'even', options: ['though', 'when', 'if'], correct: 'though' }
    ],
    [
      { current: 'Pseudopseudohypoparathyroidism', options: ['is', 'means', 'denotes'], correct: 'is' },
      { current: 'is', options: ['an', 'a', 'the'], correct: 'an' },
      { current: 'an', options: ['example', 'instance', 'case'], correct: 'example' }
    ]
  ]
};

let currentPrompt = [];
let currentIndex = 0;
let incorrectGuesses = [];
let startTime, timerInterval;
let elapsedSeconds = 0;
let currentWPM = 0;
let currentPromptId = '';

function handleGuess(input) {
  const currentPair = currentPrompt[currentIndex];

  if (input === currentPair.correct.toLowerCase()) {
    currentIndex++;
    incorrectGuesses = [];
    document.getElementById('guessInput').value = '';

    if (currentIndex === 1 && !startTime) {
      startTime = new Date();
      startTimer();
    }

    renderGame();
  } else {
    if (!incorrectGuesses.includes(input)) {
      incorrectGuesses.push(input);
    }
    renderGame();
  }
}

function startTimer() {
  timerInterval = setInterval(() => {
    if (startTime) {
      const currentTime = new Date();
      elapsedSeconds = ((currentTime - startTime) / 1000).toFixed(2);
      document.getElementById('timer').textContent = elapsedSeconds;
      currentWPM = calculateWPM(startTime, currentTime, currentIndex);
      document.getElementById('wpm').textContent = isNaN(currentWPM) ? 0 : currentWPM.toFixed(2);
    }
  }, 100);
}

function stopTimer() {
  clearInterval(timerInterval);
}

function restartGame() {
  currentIndex = 0;
  incorrectGuesses = [];
  startTime = null;
  elapsedSeconds = 0;
  currentWPM = 0;
  document.getElementById('guessInput').value = '';
  document.getElementById('timer').textContent = '0.00';
  document.getElementById('wpm').textContent = '0.00';
  stopTimer();
  renderGame();
}

function choosePrompt(difficulty) {
  const promptSet = prompts[difficulty];
  const randomPrompt = promptSet[Math.floor(Math.random() * promptSet.length)];
  currentPrompt = randomPrompt;
  currentPromptId = `${difficulty}-${promptSet.indexOf(randomPrompt)}`;
  currentIndex = 0;
  incorrectGuesses = [];
  startTime = null;
  elapsedSeconds = 0;
  currentWPM = 0;
  document.getElementById('timer').textContent = '0.00';
  document.getElementById('wpm').textContent = '0.00';
  stopTimer();
  renderGame();
}

function calculateWPM(start, end, wordCount) {
  const timeInMinutes = (end - start) / 60000;
  return (wordCount / timeInMinutes);
}

function updateLeaderboard(time, wpm) {
  const leaderboardKey = `leaderboard-${currentPromptId}`;
  const leaderboard = JSON.parse(localStorage.getItem(leaderboardKey)) || [];
  const newEntry = { time: parseFloat(time), wpm: parseFloat(wpm), date: new Date().toLocaleString() };

  leaderboard.push(newEntry);
  leaderboard.sort((a, b) => a.time - b.time);
  leaderboard.splice(5); // Keep only top 5 scores

  localStorage.setItem(leaderboardKey, JSON.stringify(leaderboard));
  //renderLeaderboard(leaderboard); //problematic
}

function renderLeaderboard(leaderboard) {
  const leaderboardContainer = document.getElementById('leaderboard');
  leaderboardContainer.innerHTML = '<h3>Leaderboard</h3>';

  leaderboard.forEach((entry, index) => {
    const entryDiv = document.createElement('div');
    entryDiv.className = 'leaderboard-entry';
    entryDiv.innerHTML = `
      <span>${index + 1}.</span>
      <span>${entry.time.toFixed(2)}s</span>
      <span>${entry.wpm.toFixed(2)} WPM</span>
      <span>${entry.date}</span>
    `;
    leaderboardContainer.appendChild(entryDiv);
  });

  leaderboardContainer.style.display = 'block';
}

function renderGame() {
  const gameContainer = document.getElementById('gameContainer');
  gameContainer.innerHTML = '';

  if (currentPrompt.length === 0) {
    gameContainer.innerHTML = `
      <button class="difficulty-button" onclick="choosePrompt('easy')">Easy</button>
      <button class="difficulty-button" onclick="choosePrompt('medium')">Medium</button>
      <button class="difficulty-button" onclick="choosePrompt('hard')">Hard</button>
    `;
    return;
  }

  if (currentIndex >= currentPrompt.length) {
    stopTimer();
    updateLeaderboard(elapsedSeconds, currentWPM);

    gameContainer.innerHTML = `
      <div class="completion-message">Congratulations! You've completed the sequence.</div>
      <div class="stats">Time Taken: ${elapsedSeconds} seconds | WPM: ${currentWPM.toFixed(2)}</div>
      <button id="restartButton" class="restart-button">Restart Game</button>
      <div id="leaderboard"></div>
      <div class="difficulty-options">
        <button class="difficulty-button" onclick="choosePrompt('easy')">Choose Easy</button>
        <button class="difficulty-button" onclick="choosePrompt('medium')">Choose Medium</button>
        <button class="difficulty-button" onclick="choosePrompt('hard')">Choose Hard</button>
      </div>
    `;
    document.getElementById('restartButton').addEventListener('click', restartGame);

    const leaderboardKey = `leaderboard-${currentPromptId}`;
    const leaderboard = JSON.parse(localStorage.getItem(leaderboardKey)) || [];
    renderLeaderboard(leaderboard);
    return;
  }

  const currentPair = currentPrompt[currentIndex];

  const currentWord = document.createElement('p');
  currentWord.className = 'current-word';
  currentWord.textContent = currentPair.current;
  gameContainer.appendChild(currentWord);

  const optionsContainer = document.createElement('div');
  optionsContainer.className = 'options-container';

  currentPair.options.forEach(option => {
    const optionDiv = document.createElement('div');
    optionDiv.className = `option ${incorrectGuesses.includes(option.toLowerCase()) ? 'incorrect' : ''}`;
    optionDiv.textContent = option;
    optionsContainer.appendChild(optionDiv);
  });

  gameContainer.appendChild(optionsContainer);
}

document.getElementById('guessInput').addEventListener('input', function (e) {
  const input = e.target.value.toLowerCase();
  handleGuess(input);
});

renderGame();
