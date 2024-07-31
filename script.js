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
    const difficultySelect = document.getElementById('difficulty');
    const chatBox = document.getElementById('chatBox');
    const sendMessage = document.getElementById('sendMessage');
    const chatDisplay = document.getElementById('chatDisplay');
    const leaderboardList = document.getElementById('leaderboardList');

    let currentPlayer = 'red';
    let gameActive = true;
    let moveHistory = [];
    let redScore = 0;
    let yellowScore = 0;
    let rows = parseInt(rowsInput.value);
    let columns = parseInt(columnsInput.value);
    let difficulty = difficultySelect.value;
    let board;
    let leaderboard = [];

    startButton.addEventListener('click', startGame);

    function startGame() {
        rows = parseInt(rowsInput.value);
        columns = parseInt(columnsInput.value);
        difficulty = difficultySelect.value;
        gameBoard.innerHTML = '';
        columnIndicators.innerHTML = '';
        chatDisplay.innerHTML = '';
        leaderboardList.innerHTML = '';
        moveHistory = [];
        currentPlayer = 'red';
        gameActive = true;
        statusDisplay.textContent = 'Current Player: Red';
        initializeBoard();
        initializeColumnIndicators();
        updateLeaderboard();
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
                updateLeaderboard();
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
                moveHistory.push({ row: r, column, player: currentPlayer });
                return true;
            }
        }
        return false;
    }

    function checkWin() {
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < columns; c++) {
                if (board[r][c].classList.contains(currentPlayer)) {
                    const winningCells = checkDirection(r, c, 1, 0) ||
                        checkDirection(r, c, 0, 1) ||
                        checkDirection(r, c, 1, 1) ||
                        checkDirection(r, c, 1, -1);
                    if (winningCells) return winningCells;
                }
            }
        }
        return null;
    }

    function checkDirection(row, col, rowDir, colDir) {
        const winningCells = [];
        let count = 0;
        let r = row;
        let c = col;
        while (isValidCell(r, c) && board[r][c].classList.contains(currentPlayer)) {
            winningCells.push(board[r][c]);
            count++;
            r += rowDir;
            c += colDir;
        }
        if (count >= 4) {
            return winningCells;
        }
        return null;
    }

    function isValidCell(row, col) {
        return row >= 0 && row < rows && col >= 0 && col < columns;
    }

    function highlightWinningCells(cells) {
        cells.forEach(cell => cell.classList.add('highlight'));
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
        // Enhanced AI logic based on difficulty
        const availableColumns = [];
        for (let c = 0; c < columns; c++) {
            if (board[0][c].classList.contains('red') || board[0][c].classList.contains('yellow')) {
                continue;
            }
            availableColumns.push(c);
        }
        if (difficulty === 'easy') {
            return availableColumns[Math.floor(Math.random() * availableColumns.length)];
        }
        if (difficulty === 'medium') {
            return availableColumns[Math.floor(Math.random() * availableColumns.length)];
        }
        // Hard AI logic (placeholder)
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

    function updateLeaderboard() {
        leaderboard.push({ player: 'Red', score: redScore });
        leaderboard.push({ player: 'Yellow', score: yellowScore });
        leaderboard = leaderboard.sort((a, b) => b.score - a.score).slice(0, 5);
        leaderboardList.innerHTML = '';
        leaderboard.forEach(entry => {
            const entryElement = document.createElement('div');
            entryElement.textContent = `${entry.player}: ${entry.score}`;
            leaderboardList.appendChild(entryElement);
        });
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

    sendMessage.addEventListener('click', () => {
        const message = chatBox.value.trim();
        if (message) {
            const messageElement = document.createElement('p');
            messageElement.textContent = `${currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)}: ${message}`;
            chatDisplay.appendChild(messageElement);
            chatBox.value = '';
            chatDisplay.scrollTop = chatDisplay.scrollHeight;
        }
    });

    startGame();
});
