// CONFIG: imagens devem estar em img/hk1.png ... img/hk6.png (pode ser .jpg se preferir)
const IMAGES = [
  '/img/hk1.png', '/img/hk2.png', '/img/hk3.png', '/img/hk4.jpg', '/img/hk5.jpg', '/img/hk6.jpg'
];

const board = document.getElementById('board');
const movesEl = document.getElementById('moves');
const remainingEl = document.getElementById('remaining');
const restartBtn = document.getElementById('restart');
const overlay = document.getElementById('overlay');
const overlayRestart = document.getElementById('overlayRestart');

let firstCard = null;
let secondCard = null;
let lock = false;
let moves = 0;
let remaining = IMAGES.length;

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function buildDeck() {
  const pairIds = IMAGES.map((src, i) => ({ id: i, src }));
  const deck = [...pairIds, ...pairIds].map((p, idx) => ({ ...p, uid: idx + 1 }));
  return shuffle(deck);
}

function render() {
  board.innerHTML = '';
  const deck = buildDeck();
  deck.forEach(card => {
    const el = document.createElement('div');
    el.className = 'card';
    el.dataset.id = card.id;
    el.dataset.uid = card.uid;
    el.innerHTML = `
      <div class="inner">
        <div class="face back"></div>
        <div class="face front"><img src="${card.src}" alt="Hello Kitty card" loading="lazy"></div>
      </div>`;
    // usamos pointerdown para resposta mais imediata em touch — ainda suportado por mouse
    el.addEventListener('pointerdown', onCardClick);
    board.appendChild(el);
  });
  // reset counters
  moves = 0; remaining = IMAGES.length;
  updateCounters();
  board.classList.remove('winner');
  overlay.classList.remove('show');
  overlay.setAttribute('aria-hidden', 'true');
  // reset state vars (segurança)
  firstCard = null;
  secondCard = null;
  lock = false;
}

function updateCounters() {
  movesEl.textContent = moves;
  remainingEl.textContent = remaining;
}

function onCardClick(e) {
  // usa currentTarget porque o listener está no próprio card
  const card = e.currentTarget;
  // evita múltiplos eventos (pointerdown seguido de click)
  e.preventDefault();

  if (lock) return; // já comparando dois cartões
  if (card.classList.contains('matched') || card.classList.contains('flipped')) return;
  // evita clicar na mesma carta duas vezes e tratar como par
  if (firstCard && card === firstCard) return;

  card.classList.add('flipped');

  if (!firstCard) {
    firstCard = card;
    return;
  }

  secondCard = card;
  lock = true;
  moves++;
  updateCounters();

  // check match
  const id1 = firstCard.dataset.id;
  const id2 = secondCard.dataset.id;

  if (id1 === id2) {
    // matched
    setTimeout(() => {
      firstCard.classList.add('matched');
      secondCard.classList.add('matched');
      // limpa estado
      firstCard = null;
      secondCard = null;
      lock = false;
      remaining--;
      updateCounters();
      if (remaining === 0) onWin();
    }, 300);
  } else {
    // not matched
    setTimeout(() => {
      // animação de flip de volta
      if (firstCard) firstCard.classList.remove('flipped');
      if (secondCard) secondCard.classList.remove('flipped');
      firstCard = null;
      secondCard = null;
      lock = false;
    }, 800);
  }
}

function onWin() {
  // add celebration class to board so cards spin
  board.classList.add('winner');
  overlay.classList.add('show');
  overlay.setAttribute('aria-hidden', 'false');
}

restartBtn.addEventListener('click', () => {
  render();
});
overlayRestart.addEventListener('click', () => {
  render();
});

// init
render();
