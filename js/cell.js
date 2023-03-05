class Cell {
  constructor(row, col, board) {
    this.row = row;
    this.col = col;
    this.bomb = false;
    this.board = board;
    this.revealed = false;
    this.flagged = false;
  }

  getAdjCells() {
    const adj = [];
    const lastRow = this.board.length - 1;
    const lastCol = this.board[0].length - 1;
    const row = this.row;
    const col = this.col;
    if (row > 0 && col > 0) adj.push(this.board[row - 1][col - 1]);
    if (row > 0) adj.push(this.board[row - 1][col]);
    if (row > 0 && col < lastCol) adj.push(this.board[row - 1][col + 1]);
    if (col < lastCol) adj.push(this.board[row][col + 1]);
    if (row < lastRow && col < lastCol) adj.push(this.board[row + 1][col + 1]);
    if (row < lastRow) adj.push(this.board[row + 1][col]);
    if (row < lastRow && col > 0) adj.push(this.board[row + 1][col - 1]);
    if (col > 0) adj.push(this.board[row][col - 1]);
    return adj;
  }

  calcAdjBombs() {
    const adjCells = this.getAdjCells();
    const len = adjCells.length;
    let adjBombs = 0;
    for (let i = 0; i < len; i++) {
      if (adjCells[i].bomb) adjBombs++;
    }
    this.adjBombs = adjBombs;
  }

  flag() {
    if (!this.revealed) {
      this.flagged = !this.flagged;
      return this.flagged;
    }
  }

  reveal() {
    if (this.revealed && !hitBomb) return;
    this.revealed = true;
    if (this.bomb) return true;
    if (this.adjBombs === 0) {
      const adj = this.getAdjCells();
      const len = adj.length;
      for (let i = 0; i < len; i++) {
        const cell = adj[i];
        if (!cell.revealed) cell.reveal();
      }
    }
    return false;
  }
}
