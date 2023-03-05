const bombImage = '<img src="images/mine.png">';
const flagImage = '<img src="images/flag.png">';
const wrongBombImage = '<img src="images/wrong-mine.png">';
const sizeLookup = {
  9: { totalBombs: 10, tableWidth: "245px" },
  16: { totalBombs: 40, tableWidth: "420px" },
  30: { totalBombs: 160, tableWidth: "794px" },
};
const colors = [
  "",
  "#0000FA",
  "#4B802D",
  "#DB1300",
  "#202081",
  "#690400",
  "#457A7A",
  "#1B1B1B",
  "#7A7A7A",
];

const size = 16;
let board;
let bombCount;
let timeElapsed;
let adjBombs;
let hitBomb;
let elapsedTime;
let timerId;
let winner;

const boardEl = document.getElementById("board");

boardEl.addEventListener("mousedown", function (e) {
  if (winner || hitBomb) return;
  let clickedEl;
  clickedEl =
    e.target.tagName.toLowerCase() === "img"
      ? e.target.parentElement
      : e.target;
  if (clickedEl.classList.contains("game-cell")) {
    if (!timerId) setTimer();
    const row = parseInt(clickedEl.dataset.row);
    const col = parseInt(clickedEl.dataset.col);
    const cell = board[row][col];
    if (e.button === 2 && !cell.revealed && bombCount > 0) {
      bombCount += cell.flag() ? -1 : 1;
    } else if (e.button === 0) {
      hitBomb = cell.reveal();
      if (hitBomb) {
        revealAll();
        clearInterval(timerId);
        e.target.style.backgroundColor = "red";
      }
    }
    winner = getWinner();
    render();
  }
});

boardEl.oncontextmenu = function (e) {
  e.preventDefault();
  return false;
};

function createResetListener() {
  document.getElementById("reset").addEventListener("click", function () {
    init();
    render();
  });
}

function setTimer() {
  timerId = setInterval(function () {
    elapsedTime += 1;
    document.getElementById("timer").innerText = elapsedTime
      .toString()
      .padStart(3, "0");
  }, 1000);
}

function revealAll() {
  board.forEach(function (rowArr) {
    rowArr.forEach(function (cell) {
      cell.reveal();
    });
  });
}

function buildTable() {
  let topRow = `
  <tr>
    <td class="menu" id="window-title-bar" colspan="${size}">
      <div id="window-title"><img src="images/mine-menu-icon.png"> Minesweeper</div>
    </td>
  <tr>
  <tr>
    <td class="menu" colspan="${size}">
        <section id="status-bar">
          <div id="bomb-counter">000</div>
          <div id="reset"><img src="images/smiley-face.png"></div>
          <div id="timer">000</div>
        </section>
    </td>
  </tr>
    `;
  boardEl.innerHTML =
    topRow +
    `<tr>${'<td class="game-cell"></td>'.repeat(size)}</tr>`.repeat(size);
  boardEl.style.width = sizeLookup[size].tableWidth;
  createResetListener();
  const cells = Array.from(document.querySelectorAll("td:not(.menu)"));
  cells.forEach(function (cell, idx) {
    cell.setAttribute("data-row", Math.floor(idx / size));
    cell.setAttribute("data-col", idx % size);
  });
}

function buildArrays() {
  return Array(size)
    .fill(null)
    .map(() => new Array(size).fill(null));
}

function buildCells() {
  board.forEach((rowArr, rowIdx) =>
    rowArr.forEach(
      (_, colIdx) => (board[rowIdx][colIdx] = new Cell(rowIdx, colIdx, board))
    )
  );
  addBombs();
  runCodeForAllCells((cell) => cell.calcAdjBombs());
}

function init() {
  buildTable();
  board = buildArrays();
  buildCells();
  bombCount = getBombCount();
  elapsedTime = 0;
  clearInterval(timerId);
  timerId = null;
  hitBomb = false;
  winner = false;
}

function getBombCount() {
  return board.flat().filter((cell) => cell.bomb).length;
}

function addBombs() {
  let currentTotalBombs = sizeLookup[`${size}`].totalBombs;
  while (currentTotalBombs !== 0) {
    let row = Math.floor(Math.random() * size);
    let col = Math.floor(Math.random() * size);
    let currentCell = board[row][col];
    if (!currentCell.bomb) {
      currentCell.bomb = true;
      currentTotalBombs -= 1;
    }
  }
}

function getWinner() {
  return board.flat().every((cell) => cell.revealed || cell.bomb);
}

function render() {
  document.getElementById("bomb-counter").innerText = bombCount
    .toString()
    .padStart(3, "0");
  const seconds = timeElapsed % 60;
  Array.from(document.querySelectorAll("[data-row]")).forEach((td) => {
    const rowIdx = parseInt(td.getAttribute("data-row"));
    const colIdx = parseInt(td.getAttribute("data-col"));
    const cell = board[rowIdx][colIdx];
    td.innerHTML = "";
    if (cell.flagged) {
      td.innerHTML = flagImage;
    } else if (cell.revealed) {
      if (cell.bomb) {
        td.innerHTML = bombImage;
      } else if (cell.adjBombs) {
        td.className = "revealed";
        td.style.color = colors[cell.adjBombs];
        td.textContent = cell.adjBombs;
      } else {
        td.className = "revealed";
      }
    }
  });
  if (hitBomb) {
    document.getElementById("reset").innerHTML =
      "<img src=images/dead-face.png>";
    runCodeForAllCells((cell) => {
      if (!cell.bomb && cell.flagged) {
        const td = document.querySelector(
          `[data-row="${cell.row}"][data-col="${cell.col}"]`
        );
        td.innerHTML = wrongBombImage;
      }
    });
  } else if (winner) {
    document.getElementById("reset").innerHTML =
      "<img src=images/cool-face.png>";
    clearInterval(timerId);
  }
}

function runCodeForAllCells(cb) {
  board.flat().forEach(cb);
}

init();
render();
