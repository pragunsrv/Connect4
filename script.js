document.addEventListener('DOMContentLoaded', () => {
    const columns = 7;
    const rows = 6;
    const gameBoard = document.getElementById('gameBoard');
    const statusDisplay = document.getElementById('status');
    const resetButton = document.getElementById('resetButton');
    const undoButton = document.getElementById('undoButton');
    const redScoreDisplay = document.getElementById('redScore');
    const yellowScoreDisplay = document.getElementById('yellowScore');

    let currentPlayer = 'red';
    let gameActive = true;
    let moveHistory = [];
    let redScore = 0;
    let yellowScore = 0;

    // Initialize the game board
    const board = [];
    for (let r = 0; r < rows; r++) {
        const row = [];
        for (let c = 0; c < columns; c++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.column = c;
            cell.addEventListener('click', handleCellClick);
            gameBoard.appendChild(cell);
            row.push(cell);
        }
        board.push(row);
    }

    function handleCellClick(event) {
        if (!gameActive) return;

        const column = event.target.dataset.column;
        if (makeMove(column)) {
            const winningCells = checkWin();
            if (winningCells) {
                highlightWinningCells(winningCells);
                updateScore();
                statusDisplay.textContent = `Player ${currentPlayer} wins!`;
                gameActive = false;
            } else {
                switchPlayer();
                if (currentPlayer === 'yellow') {
                    aiMove();
                }
            }
        }
    }

    function makeMove(column) {
        for (let r = rows - 1; r >= 0; r--) {
            const cell = board[r][column];
            if (!cell.classList.contains('red') && !cell.classList.contains('yellow')) {
                cell.classList.add(currentPlayer);
                moveHistory.push({ row: r, column: column, player: currentPlayer });
                return true;
            }
        }
        return false;
    }

    function checkWin() {
        const lastMove = moveHistory[moveHistory.length - 1];
        return (
            checkDirection(lastMove.row, lastMove.column, 0, 1) || // Horizontal
            checkDirection(lastMove.row, lastMove.column, 1, 0) || // Vertical
            checkDirection(lastMove.row, lastMove.column, 1, 1) || // Diagonal down-right
            checkDirection(lastMove.row, lastMove.column, 1, -1)   // Diagonal down-left
        );
    }

    function checkDirection(row, col, rowDir, colDir) {
        let count = 0;
        let r = row;
        let c = col;
        const winningCells = [];
        while (isValid(r, c) && board[r][c].classList.contains(currentPlayer)) {
            count++;
            winningCells.push({ row: r, col: c });
            r += rowDir;
            c += colDir;
        }
        r = row - rowDir;
        c = col - colDir;
        while (isValid(r, c) && board[r][c].classList.contains(currentPlayer)) {
            count++;
            winningCells.push({ row: r, col: c });
            r -= rowDir;
            c -= colDir;
        }
        if (count >= 4) {
            return winningCells;
        }
        return null;
    }

    function highlightWinningCells(cells) {
        cells.forEach(cell => {
            board[cell.row][cell.col].classList.add('highlight');
        });
    }

    function isValid(row, col) {
        return row >= 0 && row < rows && col >= 0 && col < columns;
    }

    function switchPlayer() {
        currentPlayer = currentPlayer === 'red' ? 'yellow' : 'red';
        statusDisplay.textContent = `Current Player: ${currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)}`;
    }

    function aiMove() {
        if (!gameActive) return;

        let column;
        do {
            column = Math.floor(Math.random() * columns);
        } while (!makeMove(column));
        const winningCells = checkWin();
        if (winningCells) {
            highlightWinningCells(winningCells);
            updateScore();
            statusDisplay.textContent = `Player ${currentPlayer} wins!`;
            gameActive = false;
        } else {
            switchPlayer();
        }
    }

    function undoMove() {
        if (moveHistory.length === 0 || !gameActive) return;

        const lastMove = moveHistory.pop();
        const cell = board[lastMove.row][lastMove.column];
        cell.classList.remove('red', 'yellow', 'highlight');
        currentPlayer = lastMove.player;
        statusDisplay.textContent = `Current Player: ${currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)}`;
    }

    function updateScore() {
        if (currentPlayer === 'red') {
            redScore++;
            redScoreDisplay.textContent = redScore;
        } else {
            yellowScore++;
            yellowScoreDisplay.textContent = yellowScore;
        }
    }

    resetButton.addEventListener('click', resetGame);
    undoButton.addEventListener('click', undoMove);

    function resetGame() {
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < columns; c++) {
                board[r][c].classList.remove('red', 'yellow', 'highlight');
            }
        }
        currentPlayer = 'red';
        statusDisplay.textContent = `Current Player: Red`;
        gameActive = true;
        moveHistory = [];
    }
});
