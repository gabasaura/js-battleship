document.addEventListener('DOMContentLoaded', () => {
    
    
    const playerBoard = document.getElementById('game-board-player');
    const cpuBoard = document.getElementById('game-board-cpu');
    const ships = document.querySelectorAll('.ship');
    const startButton = document.getElementById('btn-start');
    let isHorizontal = true;
    const playerSquares = [];
    const cpuSquares = [];
    let playerTurn = true;
    let playerGameBoard = Array(10).fill().map(() => Array(10).fill(0));
    let cpuGameBoard = Array(10).fill().map(() => Array(10).fill(0));

    // Create the game boards
    createBoard(playerBoard, playerSquares, playerGameBoard);
    createBoard(cpuBoard, cpuSquares, cpuGameBoard);
    console.log(playerGameBoard)


    // Drag and Drop event listeners
    ships.forEach(ship => {
        ship.addEventListener('dragstart', dragStart);
        ship.addEventListener('dragend', dragEnd);
    });

    playerBoard.addEventListener('dragover', dragOver);
    playerBoard.addEventListener('drop', drop);

    // Start button event listener
    startButton.addEventListener('click', startGame);

    // Create board function
    function createBoard(board, squaresArray, gameBoard) {
        for (let i = 0; i < 100; i++) {
            const square = document.createElement('div');
            square.dataset.id = i;
            board.appendChild(square);
            squaresArray.push(square);

            // Set initial class based on gameBoard state
            const row = Math.floor(i / 10);
            const col = i % 10;
            if (gameBoard[row][col] === 1) {
                square.classList.add('taken');
            }
        }
    }

    // Drag functions
    function dragStart(e) {
        e.dataTransfer.setData('text', e.target.id);
        e.target.classList.add('dragging');
    }

    function dragEnd(e) {
        e.target.classList.remove('dragging');
    }

    function dragOver(e) {
        e.preventDefault();
    }

    function drop(e) {
        e.preventDefault();
        const shipId = e.dataTransfer.getData('text');
        const ship = document.getElementById(shipId);
        const shipLength = parseInt(ship.dataset.length);
        const dropLocation = parseInt(e.target.dataset.id);

        // Calculate if the ship can be placed
        if (isValidPlacement(shipLength, dropLocation, playerSquares)) {
            placeShip(ship, dropLocation, playerSquares, playerGameBoard);
        } else {
            alert('Invalid placement');
        }
    }

    function isValidPlacement(length, index, squares) {
        const row = Math.floor(index / 10);
        const col = index % 10;

        for (let i = 0; i < length; i++) {
            if (isHorizontal) {
                if (col + i >= 10 || squares[index + i].classList.contains('taken')) {
                    return false;
                }
            } else {
                if (row + i >= 10 || squares[index + i * 10].classList.contains('taken')) {
                    return false;
                }
            }
        }
        return true;
    }

    function placeShip(ship, index, squares, gameBoard) {
        const shipLength = parseInt(ship.dataset.length);
        const row = Math.floor(index / 10);
        const col = index % 10;

        for (let i = 0; i < shipLength; i++) {
            if (isHorizontal) {
                squares[index + i].classList.add('taken', 'player-ship');
                gameBoard[row][col + i] = 1;
            } else {
                squares[index + i * 10].classList.add('taken', 'player-ship');
                gameBoard[row + i][col] = 1;
            }
        }
        ship.remove();
    }

    // CPU setup
    function placeCpuShips() {
        const shipLengths = [5, 4, 3, 3, 2];
        shipLengths.forEach(length => {
            let valid = false;
            while (!valid) {
                const direction = Math.random() < 0.5;
                isHorizontal = direction;
                const index = Math.floor(Math.random() * 100);
                if (isValidPlacement(length, index, cpuSquares)) {
                    placeShip({
                        dataset: { length }
                    }, index, cpuSquares, cpuGameBoard);
                    valid = true;
                }
            }
        });
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
