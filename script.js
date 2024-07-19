document.addEventListener('DOMContentLoaded', () => {
    const playerBoard = document.getElementById('game-board-player');
    const cpuBoard = document.getElementById('game-board-cpu');
    const ships = document.querySelectorAll('.ship');
    const startButton = document.getElementById('btn-start');
    const playerSquares = [];
    const cpuSquares = [];
    let playerTurn = true;

    // Initialize the game boards
    let playerGameBoard = Array(10).fill().map(() => Array(10).fill(0));
    let cpuGameBoard = Array(10).fill().map(() => Array(10).fill(0));

    // Create the game boards
    createBoard(playerBoard, playerSquares);
    createBoard(cpuBoard, cpuSquares);

    // Start button event listener
    startButton.addEventListener('click', startGame);

    // Drag and Drop event listeners
    ships.forEach(ship => {
        ship.addEventListener('dragstart', dragStart);
    });

    playerBoard.addEventListener('dragover', dragOver);
    playerBoard.addEventListener('drop', (e) => drop(e, playerGameBoard));

    // Create board function
    function createBoard(board, squaresArray) {
        for (let i = 0; i < 100; i++) {
            const square = document.createElement('div');
            square.dataset.id = i;
            board.appendChild(square);
            squaresArray.push(square);
        }
    }

    // Drag functions
    function dragStart(e) {
        e.dataTransfer.setData('text', e.target.id);
    }

    function dragOver(e) {
        e.preventDefault();
    }

    function drop(e, gameBoard) {
        e.preventDefault();
        const shipId = e.dataTransfer.getData('text');
        const ship = document.getElementById(shipId);
        const shipLength = parseInt(ship.dataset.length);
        const dropLocation = parseInt(e.target.dataset.id);

        // Calculate if the ship can be placed
        if (isValidPlacement(shipLength, dropLocation, playerSquares)) {
            placeShip(ship, dropLocation, playerSquares, gameBoard);
        } else {
            console.log('Invalid placement');
        }
    }

    function isValidPlacement(length, index, squares) {
        const row = Math.floor(index / 10);
        const col = index % 10;

        for (let i = 0; i < length; i++) {
            if (col + i >= 10 || squares[index + i].classList.contains('taken')) {
                return false;
            }
        }
        return true;
    }

    function placeShip(ship, index, squares, gameBoard) {
        const shipLength = parseInt(ship.dataset.length);
        const row = Math.floor(index / 10);
        const col = index % 10;

        for (let i = 0; i < shipLength; i++) {
            squares[index + i].classList.add('taken', 'player-ship');
            gameBoard[row][col + i] = 1;
        }
        ship.parentNode.removeChild(ship); // Proper way to remove the ship from the DOM
    }

    // CPU setup
    function placeCpuShips() {
        const shipLengths = [5, 4, 3, 3, 2];
        shipLengths.forEach(length => {
            let valid = false;
            while (!valid) {
                const index = Math.floor(Math.random() * 100);
                if (isValidPlacement(length, index, cpuSquares)) {
                    placeCpuShip(length, index, cpuSquares, cpuGameBoard);
                    valid = true;
                }
            }
        });
    }

    function placeCpuShip(length, index, squares, gameBoard) {
        const row = Math.floor(index / 10);
        const col = index % 10;

        for (let i = 0; i < length; i++) {
            squares[index + i].classList.add('taken');
            gameBoard[row][col + i] = 1;
        }
    }

    placeCpuShips();

    // Game logic
    cpuBoard.addEventListener('click', e => {
        if (playerTurn && !e.target.classList.contains('hit') && !e.target.classList.contains('miss')) {
            const target = e.target;
            const index = parseInt(target.dataset.id);
            const row = Math.floor(index / 10);
            const col = index % 10;
            if (cpuGameBoard[row][col] === 1) {
                target.classList.add('hit', 'hit-ship');
                cpuGameBoard[row][col] = 2;
            } else {
                target.classList.add('miss');
                cpuGameBoard[row][col] = 3;
            }
            playerTurn = false;
            document.getElementById('turn-display').textContent = 'CPU';
            setTimeout(cpuTurn, 1000);
        }
    });

    function cpuTurn() {
        const validTargets = playerSquares.filter(square => !square.classList.contains('hit') && !square.classList.contains('miss'));
        const target = validTargets[Math.floor(Math.random() * validTargets.length)];
        const index = parseInt(target.dataset.id);
        const row = Math.floor(index / 10);
        const col = index % 10;

        if (playerGameBoard[row][col] === 1) {
            target.classList.add('hit', 'hit-ship');
            playerGameBoard[row][col] = 2;
        } else {
            target.classList.add('miss');
            playerGameBoard[row][col] = 3;
        }
        playerTurn = true;
        document.getElementById('turn-display').textContent = 'Player';
    }

    function startGame() {
        // Clear boards and reset states for a new game
        playerSquares.forEach(square => {
            square.classList.remove('hit', 'miss', 'taken', 'player-ship');
        });
        cpuSquares.forEach(square => {
            square.classList.remove('hit', 'miss', 'taken');
        });
        playerGameBoard = Array(10).fill().map(() => Array(10).fill(0));
        cpuGameBoard = Array(10).fill().map(() => Array(10).fill(0));
        placeCpuShips();
        document.getElementById('turn-display').textContent = 'Player';
        playerTurn = true;
    }
});
