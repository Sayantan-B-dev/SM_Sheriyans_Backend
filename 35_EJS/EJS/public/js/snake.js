(() => {
  const canvas = document.getElementById("snake-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  // 🔥 pixel-perfect rendering
  ctx.imageSmoothingEnabled = false;

  const TILE = 12; // smaller = more pixelated
  const COLS = canvas.width / TILE;
  const ROWS = canvas.height / TILE;

  let snake, dir, food, score, running, lastTime;

  function reset() {
    snake = [{ x: 5, y: 5 }];
    dir = { x: 1, y: 0 };
    food = spawnFood();
    score = 0;
    running = true;
    lastTime = 0;
    document.getElementById("snake-score").textContent = "Score: 0";
    requestAnimationFrame(loop);
  }

  function spawnFood() {
    return {
      x: Math.floor(Math.random() * COLS),
      y: Math.floor(Math.random() * ROWS)
    };
  }

  function loop(time) {
    if (!running) return;

    if (time - lastTime > 140) {
      update();
      draw();
      lastTime = time;
    }
    requestAnimationFrame(loop);
  }

  function update() {
    const head = {
      x: (snake[0].x + dir.x + COLS) % COLS,
      y: (snake[0].y + dir.y + ROWS) % ROWS
    };

    if (snake.some(seg => seg.x === head.x && seg.y === head.y)) {
      running = false;
      drawGameOver();
      return;
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
      score++;
      document.getElementById("snake-score").textContent = `Score: ${score}`;
      food = spawnFood();
    } else {
      snake.pop();
    }
  }

  function draw() {
    ctx.fillStyle = "#020617";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // food
    ctx.fillStyle = "#ff4d4d";
    ctx.fillRect(food.x * TILE, food.y * TILE, TILE, TILE);

    // snake
    ctx.fillStyle = "#00e676";
    snake.forEach(seg => {
      ctx.fillRect(seg.x * TILE, seg.y * TILE, TILE - 1, TILE - 1);
    });
  }

  function drawGameOver() {
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff";
    ctx.font = "14px monospace";
    ctx.fillText("GAME OVER", 70, 110);
  }

  document.addEventListener("keydown", e => {
    // intercept arrow keys to prevent page scrolling when playing
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
      e.preventDefault();
      if (e.key === "ArrowUp" && dir.y === 0) dir = { x: 0, y: -1 };
      if (e.key === "ArrowDown" && dir.y === 0) dir = { x: 0, y: 1 };
      if (e.key === "ArrowLeft" && dir.x === 0) dir = { x: -1, y: 0 };
      if (e.key === "ArrowRight" && dir.x === 0) dir = { x: 1, y: 0 };
    }
  });

  const restartBtn = document.getElementById("restart-snake");
  if (restartBtn) restartBtn.addEventListener("click", reset);

  reset();
})();
