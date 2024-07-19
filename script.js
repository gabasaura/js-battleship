document.addEventListener('DOMContentLoaded', () => {
    const playerBoard = document.getElementById('game-board-player');
    const cpuBoard = document.getElementById('game-board-cpu');
    const ships = document.querySelectorAll('.ship');
    const flipButton = document.getElementById('btn-flip');
    let isHorizontal = true;
    const playerSquares = [];
    const cpuSquares = [];
    let playerTurn = true;

    // Create the game boards
    createBoard(playerBoard, playerSquares);
    createBoard(cpuBoard, cpuSquares);

    // Flip button event listener
    flipButton.addEventListener('click', () => {
        isHorizontal = !isHorizontal;
        ships.forEach(ship => ship.classList.toggle('vertical'));
    });

    // Drag and Drop event listeners
    ships.forEach(ship => {
        ship.addEventListener('dragstart', dragStart);
    });

    playerBoard.addEventListener('dragover', dragOver);
    playerBoard.addEventListener('drop', drop);

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

    function drop(e) {
        e.preventDefault();
        const shipId = e.dataTransfer.getData('text');
        const ship = document.getElementById(shipId);
        const shipLength = parseInt(ship.dataset.length);
        const dropLocation = parseInt(e.target.dataset.id);

        // Calculate if the ship can be placed
        if (isValidPlacement(shipLength, dropLocation, playerSquares)) {
            placeShip(ship, dropLocation, playerSquares);
        } else {
            console.log('Invalid placement');
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

    function placeShip(ship, index, squares) {
        const shipLength = parseInt(ship.dataset.length);

        for (let i = 0; i < shipLength; i++) {
            if (isHorizontal) {
                squares[index + i].classList.add('taken', 'ship');
            } else {
                squares[index + i * 10].classList.add('taken', 'ship');
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
                    }, index, cpuSquares);
                    valid = true;
                }
            }
        });
    }

    placeCpuShips();

    // Game logic
    cpuBoard.addEventListener('click', e => {
        if (playerTurn && e.target.classList.contains('ship')) {
            e.target.classList.add('hit');
            playerTurn = false;
            document.getElementById('turn-display').textContent = 'CPU';
            setTimeout(cpuTurn, 1000);
        }
    });

    function cpuTurn() {
        const validTargets = playerSquares.filter(square => !square.classList.contains('hit'));
        const target = validTargets[Math.floor(Math.random() * validTargets.length)];
        target.classList.add('hit');
        playerTurn = true;
        document.getElementById('turn-display').textContent = 'Player';
    }
});