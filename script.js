const cardGrid = document.getElementById("card-grid");
const restartBtn = document.getElementById("restart-btn");
const themeSelect = document.getElementById("theme-select");
const timerEl = document.getElementById("timer");
const movesEl = document.getElementById("moves");
const highScoreEl = document.getElementById("high-score");

const THEMES = {
  fruits: ["🍎", "🍇", "🍉", "🍌", "🍓", "🍍", "🥝", "🍒"],
  emojis: ["😄", "🤖", "👻", "🐶", "🐱", "🦊", "🐼", "🦄"],
  travel: ["🗽", "🗼", "🏯", "⛩️", "🕌", "🗿", "🌋", "🏝️"]
};

let firstCard, secondCard, lockBoard = false;
let moves = 0, time = 0, timerInterval;
let matchedPairs = 0;
const maxPairs = 8;

function shuffle(array) {
  return array.concat(array).sort(() => 0.5 - Math.random());
}

function startGame() {
  clearInterval(timerInterval);
  time = 0;
  timerEl.textContent = `Time: 0s`;
  moves = 0;
  movesEl.textContent = `Moves: 0`;
  matchedPairs = 0;
  lockBoard = false;
  firstCard = secondCard = null;
  cardGrid.innerHTML = "";

  const theme = themeSelect.value;
  const icons = shuffle(THEMES[theme]);

  icons.forEach(icon => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.dataset.icon = icon;
    card.innerHTML = "";
    card.addEventListener("click", flipCard);
    cardGrid.appendChild(card);
  });

  timerInterval = setInterval(() => {
    time++;
    timerEl.textContent = `Time: ${time}s`;
  }, 1000);
}

function flipCard() {
  if (lockBoard || this.classList.contains("matched") || this === firstCard) return;

  this.textContent = this.dataset.icon;
  this.classList.add("flip");

  if (!firstCard) {
    firstCard = this;
    return;
  }

  secondCard = this;
  moves++;
  movesEl.textContent = `Moves: ${moves}`;

  checkForMatch();
}

function checkForMatch() {
  const isMatch = firstCard.dataset.icon === secondCard.dataset.icon;

  if (isMatch) {
    firstCard.classList.add("matched");
    secondCard.classList.add("matched");
    matchedPairs++;

    if (matchedPairs === maxPairs) {
      clearInterval(timerInterval);
      updateHighScore();
    }

    resetTurn();
  } else {
    lockBoard = true;
    setTimeout(() => {
      firstCard.textContent = "";
      secondCard.textContent = "";
      firstCard.classList.remove("flip");
      secondCard.classList.remove("flip");
      resetTurn();
    }, 800);
  }
}

function resetTurn() {
  [firstCard, secondCard] = [null, null];
  lockBoard = false;
}

function updateHighScore() {
  const currentBest = JSON.parse(localStorage.getItem("memoryGameBest")) || {};
  const theme = themeSelect.value;
  const previous = currentBest[theme];

  if (!previous || moves < previous.moves || (moves === previous.moves && time < previous.time)) {
    currentBest[theme] = { moves, time };
    localStorage.setItem("memoryGameBest", JSON.stringify(currentBest));
  }

  displayHighScore();
}

function displayHighScore() {
  const theme = themeSelect.value;
  const currentBest = JSON.parse(localStorage.getItem("memoryGameBest")) || {};
  const best = currentBest[theme];

  highScoreEl.textContent = best ? `Best: ${best.moves} moves / ${best.time}s` : "Best: --";
}

restartBtn.addEventListener("click", startGame);
themeSelect.addEventListener("change", () => {
  displayHighScore();
  startGame();
});

// Start the game on load
window.onload = () => {
  displayHighScore();
  startGame();
};

document.getElementById("mode-toggle").addEventListener("change", function () {
  document.body.classList.toggle("dark");
});
