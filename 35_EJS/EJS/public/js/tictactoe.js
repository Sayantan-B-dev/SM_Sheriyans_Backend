// Simple 3x3 Tic Tac Toe (local 2-player)
(function () {
const boardEl = document.getElementById('board');
const statusEl = document.getElementById('ttt-status');
const resetBtn = document.getElementById('reset-ttt');
if (!boardEl) return;


const size = 3;
let board = Array(size * size).fill(null);
let current = 'X';
let running = true;


const wins = [
[0,1,2],[3,4,5],[6,7,8],
[0,3,6],[1,4,7],[2,5,8],
[0,4,8],[2,4,6]
];


function render() {
boardEl.innerHTML = '';
board.forEach((cell, idx) => {
const div = document.createElement('div');
div.className = 'ttt-cell';
div.dataset.idx = idx;
div.textContent = cell || '';
div.addEventListener('click', onCellClick);
boardEl.appendChild(div);
});
statusEl.textContent = running ? `Turn: ${current}` : statusEl.textContent;
}


function onCellClick(e) {
if (!running) return;
const idx = Number(e.currentTarget.dataset.idx);
if (board[idx]) return;
board[idx] = current;
if (checkWin(current)) {
statusEl.textContent = `${current} wins!`;
running = false;
} else if (board.every(Boolean)) {
statusEl.textContent = 'Draw!';
running = false;
} else {
current = current === 'X' ? 'O' : 'X';
statusEl.textContent = `Turn: ${current}`;
}
render();
}


function checkWin(player) {
return wins.some(combo => combo.every(i => board[i] === player));
}


resetBtn.addEventListener('click', () => {
board = Array(size * size).fill(null);
current = 'X';
running = true;
statusEl.textContent = `Turn: ${current}`;
render();
});


// initial
statusEl.textContent = `Turn: ${current}`;
render();
})();