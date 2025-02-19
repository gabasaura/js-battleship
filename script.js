document.addEventListener('DOMContentLoaded', () => {

    const playerBoard = document.getElementById('game-board-player');
    const cpuBoard = document.getElementById('game-board-cpu');
    const ships = document.querySelectorAll('.ship');
    const restartButton = document.getElementById('btn-restart');
    const playerSquares = [];
    const cpuSquares = [];
    let playerTurn = true;

    // Init game boards
    let playerGameBoard = Array(10).fill().map(() => Array(10).fill(0));
    let cpuGameBoard = Array(10).fill().map(() => Array(10).fill(0));

    // Store ship data for checking if all parts of a ship are hit
    const playerShips = [];
    const cpuShips = [];

    // Create the game boards
    createBoard(playerBoard, playerSquares);
    createBoard(cpuBoard, cpuSquares);

    // Restart button event listener
    restartButton.addEventListener('click', restartGame);

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
            placeShip(ship, dropLocation, playerSquares, gameBoard, playerShips);
            checkAllShipsPlaced();
        } else {
            alert('Ops! Ahí no se puede 🤷‍♀️');
            console.log('posicion invalida')
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

    function placeShip(ship, index, squares, gameBoard, shipsArray) {
        const shipLength = parseInt(ship.dataset.length);
        const row = Math.floor(index / 10);
        const col = index % 10;
        const shipParts = [];

        for (let i = 0; i < shipLength; i++) {
            squares[index + i].classList.add('taken', 'player-ship');
            gameBoard[row][col + i] = 1;
            shipParts.push({ row, col: col + i, hit: false });
        }

        shipsArray.push(shipParts);
        ship.parentNode.removeChild(ship); // Proper way to remove the ship from the DOM
    }

    // CPU setup
    function placeCpuShips() {
        const shipLengths = [5, 3, 3, 2, 1];
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
        const shipParts = [];

        for (let i = 0; i < length; i++) {
            squares[index + i].classList.add('taken');
            gameBoard[row][col + i] = 1;
            shipParts.push({ row, col: col + i });
        }

        cpuShips.push(shipParts);
    }

    placeCpuShips();

    // Game logic
    function checkAllShipsPlaced() {
        const shipsLeft = document.querySelectorAll('.ship');
        if (shipsLeft.length === 0) {
            cpuBoard.addEventListener('click', handleCpuBoardClick);
        } else {
            cpuBoard.removeEventListener('click', handleCpuBoardClick);
        }
    }

    function handleCpuBoardClick(e) {
        if (playerTurn && !e.target.classList.contains('hit') && !e.target.classList.contains('miss')) {
            const target = e.target;
            const index = parseInt(target.dataset.id);
            const row = Math.floor(index / 10);
            const col = index % 10;
            if (cpuGameBoard[row][col] === 1) {
                target.classList.add('hit');
                cpuGameBoard[row][col] = 2;
                checkShipSunk(cpuShips, row, col, cpuBoard);
                checkGameOver(cpuShips, 'Persona'); // If CPU dont have ships (2) Persona Win.
            } else {
                target.classList.add('miss');
                cpuGameBoard[row][col] = 3;
            }
            playerTurn = false;
            document.getElementById('turn-display').textContent = 'CPU';
            setTimeout(cpuTurn, 1000);
        }
    }

    function cpuTurn() {
        const validTargets = playerSquares.filter(square => !square.classList.contains('hit') && !square.classList.contains('miss'));
        const target = validTargets[Math.floor(Math.random() * validTargets.length)];
        const index = parseInt(target.dataset.id);
        const row = Math.floor(index / 10);
        const col = index % 10;

        if (playerGameBoard[row][col] === 1) {
            target.classList.add('hit');
            playerGameBoard[row][col] = 2;
            checkShipSunk(playerShips, row, col, playerBoard);
            checkGameOver(playerShips, 'CPU');
        } else {
            target.classList.add('miss');
            playerGameBoard[row][col] = 3;
        }
        playerTurn = true;
        document.getElementById('turn-display').textContent = 'Persona';
    }

    function checkShipSunk(ships, row, col, board) {
        ships.forEach(ship => {
            const index = ship.findIndex(part => part.row === row && part.col === col);
            if (index !== -1) {
                ship[index].hit = true;
                if (ship.every(part => part.hit)) {
                    ship.forEach(part => {
                        const square = board.querySelector(`[data-id='${part.row * 10 + part.col}']`);
                        square.classList.add('sunk');
                    });
                }
            }
        });
    }
    // Winner
    function checkGameOver(ships, player) {
        if (ships.every(ship => ship.every(part => part.hit))) {
            document.getElementById('info').textContent = `${player} Win!`;
            cpuBoard.removeEventListener('click', handleCpuBoardClick); // Remove event listener for CPU clicks
        }
    }

    function restartGame() {
        // Clear boards and reset states for a new game
        playerSquares.forEach(square => {
            square.classList.remove('hit', 'miss', 'taken', 'player-ship', 'sunk');
        });
        cpuSquares.forEach(square => {
            square.classList.remove('hit', 'miss', 'taken', 'sunk');
        });

        // Reset game boards
        playerGameBoard = Array(10).fill().map(() => Array(10).fill(0));
        cpuGameBoard = Array(10).fill().map(() => Array(10).fill(0));

        // Replace ships
        document.getElementById('game-props').innerHTML = `
            <div class="ship" id="ship1" draggable="true" data-length="1"></div>
            <div class="ship" id="ship2" draggable="true" data-length="2"></div>
            <div class="ship" id="ship3" draggable="true" data-length="3"></div>
            <div class="ship" id="ship4" draggable="true" data-length="3"></div>
            <div class="ship" id="ship5" draggable="true" data-length="5"></div>
        `;

        // Re-attach drag event listeners to new ship elements
        const newShips = document.querySelectorAll('.ship');
        newShips.forEach(ship => {
            ship.addEventListener('dragstart', dragStart);
        });

        // Reset ships arrays
        playerShips.length = 0;
        cpuShips.length = 0;

        // Place CPU ships
        placeCpuShips();

        document.getElementById('turn-display').textContent = 'Persona';
        document.getElementById('info').textContent = '';
        playerTurn = true;
    }
});
