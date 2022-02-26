"use strict";

const currentPlayer = (function () {
    let playerIndex = 0;

    function resetPlayer() {
        playerIndex = 0;
    }



    function currentPlayer(event) {

        // do not increment the playerIndex, i.e go to next player
        // unless the player chose a valid move, keep the current player same
        if (event.target.textContent === "") playerIndex++;

        if (playerIndex > 1) playerIndex = 0;

        return playerIndex;
    }

    return {
        currentPlayer,
        resetPlayer
    };
})();



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


    function isValidMove(cell) {
        return cell.textContent === '';
    }

    function setCell(cell, text) {
        if (isValidMove(cell)) {
            cell.textContent = text;
            cell.classList.remove('puff-in-center')
            cell.classList.add('puff-in-center')
        }
    }

    return {
        board,
        getRow,
        getColumn,
        getDiagonal,
        setCell,
        isValidMove,
    };
})();

// @return bool: false if game is not over else, return the winner str: ['X' or 'O' or 'draw']
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

    function formatWinner(segment) {
        segment.forEach(cell => cell.classList.add('red'))
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
                formatWinner(segment)
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
        gameBoard.board.forEach((cell) => cell.addEventListener("click", play));
    }

    function restartGame() {
        gameBoard.board.forEach((cell) => (cell.textContent = ""));
        gameBoard.board.forEach((cell) => (cell.classList.remove("red")));

        document.querySelector("#winner-msg-container").innerHTML = "";
        currentPlayer.resetPlayer()
    }


    function play(event) {
        const mark = currentPlayer.currentPlayer(event) === 1 ? "X" : "O";

        if (event.target.textContent === "") {
            event.target.textContent = mark;
        } else {
            console.log("Illegal Move at:");
            console.log(event.target);
            return false;
        }

        const winner = isGameOver();

        if (winner) {
            displayGameOverMessage(winner);
        }

        return true;
    }

    return {
        start,
        restartGame,
        play,

    };
})();

function displayGameOverMessage(winner) {
    const winnerElement = document.createElement("div");
    winnerElement.setAttribute("id", "winner");
    // winnerElement.addEventListener('click', game.restartGame)

    const para = document.createElement("p");
    if (winner === "draw") {
        para.textContent = "It's a draw!";
    } else {
        para.textContent = `${winner} won`;
    }

    const restartButton = document.createElement("button");
    restartButton.textContent = "Restart";
    restartButton.addEventListener("click", game.restartGame);

    winnerElement.appendChild(para);
    winnerElement.appendChild(restartButton);

    document.querySelector("#winner-msg-container").appendChild(winnerElement);

    Scores.updateScore(winner);
}



const Scores = (function name() {
    const xScorePara = document.querySelector("#x-score");
    const oScorePara = document.querySelector("#o-score");

    let xScore = 0;
    let oScore = 0;


    function renderScore() {
        xScorePara.textContent = `X : ${xScore}`;
        oScorePara.textContent = `O : ${oScore}`;
    }

    function updateScore(winner) {
        if (winner === "X") xScore++;
        if (winner === "O") oScore++;

        renderScore()
    }



    function resetScore() {
        xScore = 0;
        oScore = 0;

        renderScore()
    }

    return {
        updateScore,
        resetScore,
    };
})();



const ai = (function () {

    const enableButton = document.querySelector('#ai button')
    const difficultySelection = document.querySelector('#difficulty-selection')

    function init() {
        enableButton.addEventListener('click', start)
    }



    function start() {
        difficultySelection.style.visibility = 'visible'
        gameBoard.board.forEach(cell => cell.removeEventListener('click', game.play))

        game.restartGame()
        gameBoard.board.forEach(cell => cell.addEventListener('click', playVsAi))
        Scores.resetScore()
        enableButton.textContent = 'Play against a friend locally'
        enableButton.style.backgroundColor = 'red';
        enableButton.removeEventListener('click', start)
        enableButton.addEventListener('click', terminate)




    }


    function terminate() {
        difficultySelection.style.visibility = 'hidden'

        game.restartGame()
        Scores.resetScore()
        gameBoard.board.forEach(cell => cell.removeEventListener('click', playVsAi))
        game.start()
        enableButton.style.backgroundColor = 'var(--blue)';
        enableButton.textContent = 'Play Against The Computer'
        init()

    }


    function makeRandomMove() {

        function getRandomNumber(min, max) {
            // max is not inclusive
            return Math.trunc(Math.random() * (max - min) + min);
        }


        for (let i = 0; i < 9; i++) {

            let randomIndex = getRandomNumber(0, 9)

            let randomCell = gameBoard.board[randomIndex]
            if (gameBoard.isValidMove(randomCell)) {
                randomCell.textContent = 'O';
                return;
            }
        }

    }


    function playVsAi(event) {

        let winner = isGameOver();

        if (winner) {
            displayGameOverMessage(winner);
            return true;

        }

        if (gameBoard.isValidMove(event.target)) {
            event.target.textContent = 'X'
            if (difficultySelection.value === 'Easy') {
                makeRandomMove()
            }
            else {
                const minimaxMove = minimax(getBoardState(), true)
                const oneDindex = (minimaxMove[1] * 3) + minimaxMove[2]; // Indexes
                if (!isNaN(oneDindex)) {
                    gameBoard.setCell(gameBoard.board[oneDindex], 'O')

                }

            }



        }

        winner = isGameOver();

        if (winner) {
            displayGameOverMessage(winner);
            return true;

        }
    }


    function isBoardOver(boardState) {


        function checkGroup(group) {

            // checking for empty cells first
            for (const cell of group) {
                if (cell === "") {
                    return false;
                }
            }

            const set = new Set(group);

            const innerWinner = set.size === 1 ? [...set][0] : false;

            return innerWinner;
        }


        for (const row of boardState) {
            let winner = checkGroup(row)
            if (winner) return winner;

        }

        for (let i = 0; i < 3; i++) {
            let col = boardState.map(function (value, index) { return value[i]; });

            let winner = checkGroup(col)
            if (winner) return winner;
        }


        const firstDiagonal = [boardState[0][0], boardState[1][1], boardState[2][2]]
        const secondDiagonal = [boardState[0][2], boardState[1][1], boardState[2][0]]

        for (const diagonal of [firstDiagonal, secondDiagonal]) {
            let winner = checkGroup(diagonal)
            if (winner) return winner;

        }

        for (let i = 0; i < 3; i++) {

            for (let j = 0; j < 3; j++) {
                if (boardState[i][j] === '') return false;
            }
        }

        return 'draw'
    }

    function getBoardState() {
        const boardState = [
            [gameBoard.board[0].textContent, gameBoard.board[1].textContent, gameBoard.board[2].textContent],
            [gameBoard.board[3].textContent, gameBoard.board[4].textContent, gameBoard.board[5].textContent],
            [gameBoard.board[6].textContent, gameBoard.board[7].textContent, gameBoard.board[8].textContent]
        ]

        return boardState
    }



    function minimax(boardState, isMaxmizingPlayer) {
        /// "O" is the maxmizing player.
        const gameOver = isBoardOver(boardState)
        if (gameOver) {
            if (gameOver === 'O') {
                return [1]
            }
            else if (gameOver === 'draw') {
                return [0]
            }
            else {
                return [-1]
            }
        }


        if (isMaxmizingPlayer) {

            let maxScore = -Infinity
            let bestRow = 0
            let bestCol = 0

            for (let row = 0; row < 3; row++) {

                for (let col = 0; col < 3; col++) {

                    if (boardState[row][col] === '') {
                        boardState[row][col] = 'O'
                        let score = minimax(boardState, false)[0]
                        boardState[row][col] = '';
                        if (score > maxScore) {
                            maxScore = score
                            bestRow = row
                            bestCol = col
                        }
                    }
                }

            }

            return [maxScore, bestRow, bestCol]
        }

        else {
            let minScore = Infinity
            let bestRow = 0
            let bestCol = 0

            for (let row = 0; row < 3; row++) {

                for (let col = 0; col < 3; col++) {

                    if (boardState[row][col] === '') {
                        boardState[row][col] = 'X'
                        let score = minimax(boardState, true)[0]
                        boardState[row][col] = '';
                        if (score < minScore) {
                            minScore = score
                            bestRow = row
                            bestCol = col

                        }
                    }
                }

            }

            return [minScore, bestRow, bestCol]
        }
    }



    return {
        init,
    }

})()





game.start();
ai.init();

