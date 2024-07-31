document.addEventListener('DOMContentLoaded', () => {
    const gameBoard = document.getElementById('gameBoard');
    const statusDisplay = document.getElementById('status');
    const resetButton = document.getElementById('resetButton');
    const undoButton = document.getElementById('undoButton');
    const redScoreDisplay = document.getElementById('redScore');
    const yellowScoreDisplay = document.getElementById('yellowScore');
    const columnIndicators = document.getElementById('columnIndicators');
    const startButton = document.getElementById('startButton');
    const rowsInput = document.getElementById('rows');
    const columnsInput = document.getElementById('columns');

    let currentPlayer = 'red';
    let gameActive = true;
    let moveHistory = [];
    let redScore = 0;
    let yellowScore = 0;
    let rows = parseInt(rowsInput.value);
    let columns = parseInt(columnsInput.value);
    let board;

    startButton.addEventListener('click', startGame);

    function startGame() {
        rows = parseInt(rowsInput.value);
        columns = parseInt(columnsInput.value);
        gameBoard.innerHTML = '';
        columnIndicators.innerHTML = '';
        moveHistory = [];
        currentPlayer = 'red';
        gameActive = true;
        statusDisplay.textContent = 'Current Player: Red';
        initializeBoard();
        initializeColumnIndicators();
    }

    function initializeBoard() {
        board = [];
        gameBoard.style.gridTemplateColumns = `repeat(${columns}, 50px)`;
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
    }

    function initializeColumnIndicators() {
        columnIndicators.style.gridTemplateColumns = `repeat(${columns}, 50px)`;
        for (let c = 0; c < columns; c++) {
            const indicator = document.createElement('div');
            indicator.classList.add('column-indicator');
            indicator.dataset.column = c;
            indicator.addEventListener('mouseover', handleIndicatorHover);
            indicator.addEventListener('mouseout', handleIndicatorOut);
            columnIndicators.appendChild(indicator);
        }
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

    function handleIndicatorHover(event) {
        if (!gameActive) return;

        const column = event.target.dataset.column;
        for (let r = 0; r < rows; r++) {
            const cell = board[r][column];
            if (!cell.classList.contains('red') && !cell.classList.contains('yellow')) {
                cell.classList.add(`preview-${currentPlayer}`);
            } else {
                break;
            }
        }
        event.target.classList.add('highlight');
    }

    function handleIndicatorOut(event) {
        const column = event.target.dataset.column;
        for (let r = 0; r < rows; r++) {
            const cell = board[r][column];
            cell.classList.remove('preview-red', 'preview-yellow');
        }
        event.target.classList.remove('highlight');
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
        const bestMove = findBestMove();
        makeMove(bestMove);
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

    function findBestMove() {
        // Simple AI logic: choose a random column
        const availableColumns = [];
        for (let c = 0; c < columns; c++) {
            if (board[0][c].classList.contains('red') || board[0][c].classList.contains('yellow')) {
                continue;
            }
            availableColumns.push(c);
        }
        return availableColumns[Math.floor(Math.random() * availableColumns.length)];
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

    resetButton.addEventListener('click', startGame);

    undoButton.addEventListener('click', undoMove);

    function undoMove() {
        if (!gameActive || moveHistory.length === 0) return;

        const lastMove = moveHistory.pop();
        board[lastMove.row][lastMove.column].classList.remove(lastMove.player);
        switchPlayer();
        statusDisplay.textContent = `Current Player: ${currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)}`;
        gameActive = true;
    }

    startGame();
});
