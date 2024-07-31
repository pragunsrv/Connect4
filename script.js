document.addEventListener('DOMContentLoaded', () => {
    const columns = 7;
    const rows = 6;
    const gameBoard = document.getElementById('gameBoard');

    let currentPlayer = 'red';

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
        const column = event.target.dataset.column;
        for (let r = rows - 1; r >= 0; r--) {
            const cell = board[r][column];
            if (!cell.classList.contains('red') && !cell.classList.contains('yellow')) {
                cell.classList.add(currentPlayer);
                currentPlayer = currentPlayer === 'red' ? 'yellow' : 'red';
                break;
            }
        }
    }
});
