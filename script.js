"use strict";

const currentPlayer = (function () {
    let playerIndex = 0;

    function currentPlayer(event) {

        // do not increment the playerIndex, i.e go to next player
        // unless the player chose a valid move, keep the current player same
        if (event.target.textContent === "") playerIndex++;

        if (playerIndex > 1) playerIndex = 0;

        return playerIndex;
    }

    return {
        currentPlayer,
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

    // max cell index = 8 , min = 0 for a total of nine cells
    function getCell(cellIndex) {
        return gameBoard.board[cellIndex]
    }

    function setCell(cell, text) {
        // if (isValidMove(cell)) {
        cell.textContent = text;
        // }
    }

    return {
        board,
        getRow,
        getColumn,
        getDiagonal,
        setCell,
        getCell,
        isValidMove,
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
                // formatWinner(segment)
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
        // return "draw";
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
        play
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

    function init() {
        enableButton.addEventListener('click', start)
    }



    function start() {
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

        if (gameBoard.isValidMove(event.target)) {
            event.target.textContent = 'X'
            // makeRandomMove()
            let depth = 0;
            for (let i = 0; i < 8; i++) {
                if (gameBoard.isValidMove(gameBoard.getCell(i))) {
                    depth++;
                }
            }
            debugger
            gameBoard.setCell(gameBoard.getCell(getBestMove(depth, false)), 'O')



            const winner = isGameOver();

            if (winner) {
                displayGameOverMessage(winner);
            }

            return true;
        }

    }


    const isGameOverTable = {
        false: 0,
        'X': -1,
        'O': 1,
    }
   
    function getBestMove(depth, isHuman) {

        debugger
     

        if (depth === 0) {
            const returnValue = isGameOverTable[isGameOver()]
            // return isGameOverTable[isGameOver()]
            debugger
            console.log({ returnValue })
            return returnValue
            
        }

        if (isHuman) {
            let value = Infinity
            let bestMove = -1;
            for (let i = 0; i < 9; i++) {
                let cell = gameBoard.getCell(i)
                if (gameBoard.isValidMove(cell)) {
                    gameBoard.setCell(cell, 'X')
                    cell.style.color = 'red'

                    const childNode = getBestMove(depth-1, false)
                    
                    value = Math.min(value, childNode)
                    if (childNode === value) {
                        bestMove = i;
                    }
                    
                    gameBoard.setCell(cell, '')
                    
                }
            }
            return bestMove
        }
        else {
            let value = -Infinity
            let bestMove = -1;
            for (let i = 0; i < 9; i++) {
                let cell = gameBoard.getCell(i)
                if (gameBoard.isValidMove(cell)) {
                    gameBoard.setCell(cell, 'O')
                    cell.style.color = 'blue'

                    const childNode = getBestMove(depth-1, true)
                   
                    value = Math.max(value, childNode)
                    if (childNode === value) {
                        bestMove = i;
                    }
                    gameBoard.setCell(cell, '')
                }
            }
            return bestMove
        }



   




    }




    return {
        init,
        getBestMove
    }

})()





game.start();
ai.init();

