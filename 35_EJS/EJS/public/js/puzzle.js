(function () {
  const container = document.getElementById('puzzle');
  const shuffleBtn = document.getElementById('shuffle');
  const solveBtn = document.getElementById('solve');
  const statusEl = document.getElementById('puzzle-status');
  if (!container) return;

  const size = 3;
  let tiles = [];

  function init() {
    container.innerHTML = '';
    tiles = [];
    // create 1..N-1 then empty tile (0) at the end
    for (let i = 1; i < size * size; i++) tiles.push(i);
    tiles.push(0);
    build();
  }

  function build() {
    container.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    container.innerHTML = '';
    tiles.forEach((n, i) => {
      const el = document.createElement('div');
      el.className = 'puzzle-tile';
      el.dataset.idx = i;
      el.dataset.n = n;
      if (n === 0) {
        el.classList.add('empty');
        el.textContent = '';
      } else {
        el.textContent = n;
      }
      el.addEventListener('click', onTileClick);
      container.appendChild(el);
    });
    updateStatus();
  }

  function onTileClick(e) {
    const idx = Number(e.currentTarget.dataset.idx);
    const emptyIdx = tiles.indexOf(0);
    const moves = getNeighbors(emptyIdx);
    if (moves.includes(idx)) {
      // swap
      [tiles[emptyIdx], tiles[idx]] = [tiles[idx], tiles[emptyIdx]];
      build();
    }
  }

  function getNeighbors(i) {
    const r = Math.floor(i / size);
    const c = i % size;
    const neighbors = [];
    [[r-1,c],[r+1,c],[r,c-1],[r,c+1]].forEach(([rr,cc]) => {
      if (rr >= 0 && rr < size && cc >= 0 && cc < size) neighbors.push(rr * size + cc);
    });
    return neighbors;
  }

  function shuffle() {
    // simple shuffle by performing random valid moves
    let emptyIdx = tiles.indexOf(0);
    for (let i = 0; i < 200; i++) {
      const moves = getNeighbors(emptyIdx);
      const pick = moves[Math.floor(Math.random() * moves.length)];
      [tiles[emptyIdx], tiles[pick]] = [tiles[pick], tiles[emptyIdx]];
      emptyIdx = pick;
    }
    build();
  }

  function solved() {
    for (let i = 0; i < tiles.length - 1; i++) {
      if (tiles[i] !== i + 1) return false;
    }
    return tiles[tiles.length - 1] === 0;
  }

  function updateStatus() {
    statusEl.textContent = solved() ? 'Solved!' : 'Keep going';
  }

  if (shuffleBtn) shuffleBtn.addEventListener('click', shuffle);
  if (solveBtn) solveBtn.addEventListener('click', init);

  init();
  // start shuffled
  shuffle();
})();