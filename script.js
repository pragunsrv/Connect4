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
    const totalGamesDisplay = document.getElementById('totalGames');
    const totalMovesDisplay = document.getElementById('totalMoves');
    const longestGameDisplay = document.getElementById('longestGame');
    const shortestGameDisplay = document.getElementById('shortestGame');

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
    let totalGames = 0;
    let totalMoves = 0;
    let gameStartTime;
    let gameEndTime;
    let longestGame = 0;
    let shortestGame = Infinity;

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
        updateStatistics();
        gameStartTime = new Date();
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

    function handleIndicatorHover(event) {
        const column = event.target.dataset.column;
        highlightColumn(column, true);
    }

    function handleIndicatorOut(event) {
        const column = event.target.dataset.column;
        highlightColumn(column, false);
    }

    function highlightColumn(column, highlight) {
        for (let r = 0; r < rows; r++) {
            const cell = board[r][column];
            if (highlight) {
                if (!cell.classList.contains('red') && !cell.classList.contains('yellow')) {
                    cell.classList.add(`preview-${currentPlayer}`);
                }
            } else {
                cell.classList.remove('preview-red', 'preview-yellow');
            }
        }
    }

    function handleCellClick(event) {
        if (!gameActive) return;

        const column = event.target.dataset.column;
        if (makeMove(column)) {
            totalMoves++;
            const winningCells = checkWin();
            if (winningCells) {
                highlightWinningCells(winningCells);
                updateScore();
                statusDisplay.textContent = `Player ${currentPlayer} wins!`;
                gameEndTime = new Date();
                const gameDuration = (gameEndTime - gameStartTime) / 1000;
                if (gameDuration > longestGame) longestGame = gameDuration;
                if (gameDuration < shortestGame) shortestGame = gameDuration;
                updateStatistics();
                gameActive = false;
            } else if (moveHistory.length === rows * columns) {
                statusDisplay.textContent = 'Game Draw!';
                gameEndTime = new Date();
                const gameDuration = (gameEndTime - gameStartTime) / 1000;
                if (gameDuration > longestGame) longestGame = gameDuration;
                if (gameDuration < shortestGame) shortestGame = gameDuration;
                updateStatistics();
                gameActive = false;
            } else {
                switchPlayer();
                if (currentPlayer === 'yellow') {
                    setTimeout(aiMove, 500);
                }
            }
        }
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
            gameEndTime = new Date();
            const gameDuration = (gameEndTime - gameStartTime) / 1000;
            if (gameDuration > longestGame) longestGame = gameDuration;
            if (gameDuration < shortestGame) shortestGame = gameDuration;
            updateStatistics();
            gameActive = false;
        } else {
            switchPlayer();
        }
    }

    function findBestMove() {
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
        totalGames++;
    }

    function updateLeaderboard() {
        leaderboard.push({ player: 'Red', score: redScore });
        leaderboard.push({ player: 'Yellow', score: yellowScore });
        leaderboard = leaderboard.sort((a, b) => b.score - a.score).slice(0, 5);
        leaderboardList.innerHTML = '';
        leaderboard.forEach((entry, index) => {
            const listItem = document.createElement('li');
            listItem.textContent = `${index + 1}. ${entry.player}: ${entry.score}`;
            leaderboardList.appendChild(listItem);
        });
    }

    function updateStatistics() {
        totalGamesDisplay.textContent = totalGames;
        totalMovesDisplay.textContent = totalMoves;
        longestGameDisplay.textContent = `${longestGame} seconds`;
        shortestGameDisplay.textContent = `${shortestGame === Infinity ? 'N/A' : shortestGame + ' seconds'}`;
    }

    function undoMove() {
        if (moveHistory.length > 0) {
            const lastMove = moveHistory.pop();
            board[lastMove.row][lastMove.column].classList.remove(lastMove.player);
            switchPlayer();
            gameActive = true;
            statusDisplay.textContent = `Current Player: ${currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)}`;
        }
    }

    resetButton.addEventListener('click', startGame);
    undoButton.addEventListener('click', undoMove);

    sendMessage.addEventListener('click', () => {
        const message = chatBox.value;
        if (message.trim() !== '') {
            const chatMessage = document.createElement('div');
            chatMessage.textContent = `${currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)}: ${message}`;
            chatDisplay.appendChild(chatMessage);
            chatBox.value = '';
        }
    });

    startGame();
});
