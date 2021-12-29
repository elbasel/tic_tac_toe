"use strict";

const currentPlayer = (function () {
  let playerIndex = 0;

  function currentPlayer(event) {
    if (event.target.textContent === "") playerIndex++;

    if (playerIndex > 1) playerIndex = 0;

    return playerIndex;
  }

  return {
    currentPlayer,
  };
})();

function play(event) {
  const mark = currentPlayer.currentPlayer(event) === 1 ? "X" : "O";
  if (event.target.textContent === "") {
    event.target.textContent = mark;
  } else {
    console.log("Illegal Move at:");
    console.log(event.target);
    return;
  }

  const winner = isGameOver();

  if (winner) {
    displayGameOverMessage(winner);
  }
}

const gameBoard = (function () {
  const board = [...document.querySelectorAll(".cell")];

  function getRow(row) {
    if (row === 1) return board.slice(0, 3);
    if (row === 2) return board.slice(3, 6);
    if (row === 3) return board.slice(6, 9);
  }

  function getColumn(col) {
    return [board[col - 1], board[col + 2], board[col + 5]];
  }

  function getDiagonal(diag) {
    if (diag === 1) return [board[0], board[4], board[8]];
    if (diag === 2) return [board[2], board[4], board[6]];
  }

  return {
    board,
    getRow,
    getColumn,
    getDiagonal,
  };
})();

// @return false if game is not over else, return the winner: 'X' or 'O'
function isGameOver() {
  function getWinner(arr) {
    // converting divs to textContent
    arr = arr.map((cell) => cell.textContent);

    // checking for empty cells first
    for (const cell of arr) {
      if (cell === "") {
        return false;
      }
    }

    const set = new Set(arr);

    const winner = set.size === 1 ? [...set][0] : false;

    return winner;
  }

  const firstRow = gameBoard.getRow(1);
  const secondRow = gameBoard.getRow(2);
  const thirdRow = gameBoard.getRow(3);

  const firstColumn = gameBoard.getColumn(1);
  const secondColumn = gameBoard.getColumn(2);
  const thirdColumn = gameBoard.getColumn(3);

  const firstDiagonal = gameBoard.getDiagonal(1);
  const secondDiagonal = gameBoard.getDiagonal(2);

  const rows = [firstRow, secondRow, thirdRow];
  const columns = [firstColumn, secondColumn, thirdColumn];
  const diagonals = [firstDiagonal, secondDiagonal];

  let winner = "";
  for (const group of [rows, columns, diagonals]) {
    for (const segment of group) {
      winner = getWinner(segment);
      if (winner) {
        return winner;
      }
    }
  }

  for (const group of [rows, columns, diagonals]) {
    for (let segment of group) {
      segment = segment.map((cell) => cell.textContent);

      // checking for empty cells first
      for (const cell of segment) {
        if (cell === "") {
          return false;
        }
      }
    }
    return "draw";
  }

  return false;
}

const game = (function () {
  function start() {
    gameBoard.board.forEach((cell) => addEventListener("click", play));
  }

  return {
    start,
  };
})();

function displayGameOverMessage(winner) {
  const winnerElement = document.createElement("div");
  winnerElement.setAttribute("id", "winner");
  // winnerElement.addEventListener('click', restartGame)

  const para = document.createElement("p");
  if (winner === "draw") {
    para.textContent = "It's a draw!";
  } else {
    para.textContent = `${winner} won`;
  }

  const restartButton = document.createElement("button");
  restartButton.textContent = "Restart";
  restartButton.addEventListener("click", restartGame);

  winnerElement.appendChild(para);
  winnerElement.appendChild(restartButton);

  document.querySelector("#winner-msg-container").appendChild(winnerElement);

  Scores.updateScore(winner);
}

function restartGame() {
  gameBoard.board.forEach((cell) => (cell.textContent = ""));
  document.querySelector("#winner-msg-container").innerHTML = "";
}

const Scores = (function name() {
  const xScorePara = document.querySelector("#x-score");
  const oScorePara = document.querySelector("#o-score");

  let xScore = 0;
  let oScore = 0;

  function updateScore(winner) {
    if (winner === "X") xScore++;
    if (winner === "O") oScore++;

    xScorePara.textContent = `X: ${xScore}`;
    oScorePara.textContent = `O: ${oScore}`;
  }

  return {
    updateScore,
  };
})();

game.start();
