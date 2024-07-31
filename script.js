document.addEventListener('DOMContentLoaded', () => {
    const columns = 7;
    const rows = 6;
    const gameBoard = document.getElementById('gameBoard');
    const statusDisplay = document.getElementById('status');
    const resetButton = document.getElementById('resetButton');
    const undoButton = document.getElementById('undoButton');

    let currentPlayer = 'red';
    let gameActive = true;
    let moveHistory = [];

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
        for (let r = rows - 1; r >= 0; r--) {
            const cell = board[r][column];
            if (!cell.classList.contains('red') && !cell.classList.contains('yellow')) {
                cell.classList.add(currentPlayer);
                moveHistory.push({ row: r, column: column, player: currentPlayer });
                if (checkWin(r, column)) {
                    statusDisplay.textContent = `Player ${currentPlayer} wins!`;
                    gameActive = false;
                } else {
                    currentPlayer = currentPlayer === 'red' ? 'yellow' : 'red';
                    statusDisplay.textContent = `Current Player: ${currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)}`;
                }
                break;
            }
        }
    }

    function checkWin(row, col) {
        return (
            checkDirection(row, col, 0, 1) || // Horizontal
            checkDirection(row, col, 1, 0) || // Vertical
            checkDirection(row, col, 1, 1) || // Diagonal down-right
            checkDirection(row, col, 1, -1)   // Diagonal down-left
        );
    }

    function checkDirection(row, col, rowDir, colDir) {
        let count = 0;
        let r = row;
        let c = col;
        while (isValid(r, c) && board[r][c].classList.contains(currentPlayer)) {
            count++;
            r += rowDir;
            c += colDir;
        }
        r = row - rowDir;
        c = col - colDir;
        while (isValid(r, c) && board[r][c].classList.contains(currentPlayer)) {
            count++;
            r -= rowDir;
            c -= colDir;
        }
        return count >= 4;
    }

    function isValid(row, col) {
        return row >= 0 && row < rows && col >= 0 && col < columns;
    }

    function undoMove() {
        if (moveHistory.length === 0 || !gameActive) return;

        const lastMove = moveHistory.pop();
        const cell = board[lastMove.row][lastMove.column];
        cell.classList.remove('red', 'yellow');
        currentPlayer = lastMove.player;
        statusDisplay.textContent = `Current Player: ${currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)}`;
    }

    resetButton.addEventListener('click', resetGame);
    undoButton.addEventListener('click', undoMove);

    function resetGame() {
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < columns; c++) {
                board[r][c].classList.remove('red', 'yellow');
            }
        }
        currentPlayer = 'red';
        statusDisplay.textContent = `Current Player: Red`;
        gameActive = true;
        moveHistory = [];
    }
});
