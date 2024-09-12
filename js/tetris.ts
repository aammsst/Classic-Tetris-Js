let nextRandom: number;
let timerId: number | undefined;
let score = 0;
let lineCounter = 0;

const colors = [
	'#feac4e',
	'#feac4e',
	'#ccc',
	'#ccc',
	'#ccc',
	'#e44537',
	'#e44537'
];

const width = 10;

    // tetrominos {{{
    const lTetromino = [
	    [width+1,width+2,width+3,width*2+1],
	    [1,2,width+2,width*2+2],
	    [3,width+1,width+2,width+3],
	    [2,width+2,width*2+2,width*2+3],
    ];
    const zTetromino = [
	    [width+1,width+2,width*2+2,width*2+3],
	    [3,width+2,width+3,width*2+2],
	    [width+1,width+2,width*2+2,width*2+3],
	    [3,width+2,width+3,width*2+2],
    ];
    const oTetromino = [
	    [1,2,width+1,width+2],
	    [1,2,width+1,width+2],
	    [1,2,width+1,width+2],
	    [1,2,width+1,width+2],
    ];
    const iTetromino = [
	    [width+1,width+2,width+3,width+4],
	    [2,width+2,width*2+2,width*3+2],
	    [width*2+1,width*2+2,width*2+3,width*2+4],
	    [3,width+3,width*2+3,width*3+3],
    ];
    const tTetromino = [
	    [width+1,width+2,width+3,width*2+2],
	    [2,width+1,width+2,width*2+2],
	    [2,width+1,width+2,width+3],
	    [2,width+2,width+3,width*2+2],
    ];
    const sTetromino = [
	    [width+2,width+3,width*2+1,width*2+2],
	    [2,width+2,width+3,width*2+3],
	    [width+2,width+3,width*2+1,width*2+2],
	    [2,width+2,width+3,width*2+3],
    ];
    const jTetromino = [
	    [width+1,width+2,width+3,width*2+3],
	    [2,width+2,width*2+2,width*2+1],
	    [1,width+1,width+2,width+3],
	    [2,3,width+2,width*2+2],
    ];
   
    const tetrominos = [
        lTetromino,
        zTetromino,
        oTetromino,
        iTetromino,
        tTetromino,
        sTetromino,
        jTetromino,
    ];
    // }}}

let initialRot = 0;
let initialPos = 3;
// select random tetrominos
let random = Math.floor(Math.random()*tetrominos.length);
let current = tetrominos[random][initialRot];

// drawing, undrawing, freezing and actions {{{
// reset on restart
function reset() {
    initialPos = 3;
    initialRot = 0;
    random = Math.floor(Math.random()*tetrominos.length);
    current = tetrominos[random][initialRot];
}

// drawing tetrominos
function draw() {
    current.forEach(index => {
        squares[initialPos + index].classList.add('tetrominos');
        squares[initialPos + index].style.backgroundColor = colors[random];
        squares[initialPos + index].style.borderColor = colors[random];
    })
};

// undrawing tetrominos
function undraw() {
    current.forEach(index => {
        squares[initialPos + index].style.backgroundColor = '';
        squares[initialPos + index].style.borderColor = '';
        squares[initialPos + index].classList.remove('tetrominos');
    })
};

// move down
function moveDown() {
    if (!freeze()) {
        undraw();
        initialPos += width;
        draw();
    }
}

function softDrop() {
    while (!freeze()) {
        undraw();
        initialPos += width;
        draw();
    }
}

// freeze at the bottom and when touching other pieces
function freeze(): boolean {
    if (current.some(index => squares[initialPos + index + width].classList.contains('taken'))) {
        current.forEach(index => squares[initialPos + index].classList.add('taken'));
        random = nextRandom;
        nextRandom = Math.floor(Math.random()*tetrominos.length);
        initialRot = 0;
        current = tetrominos[random][initialRot];
        initialPos = 3;
        addScore();
        draw();
        if (document.fullscreenElement){
            displayShapeMob();
        } else {
            displayShape();
        }
        gameOver();
        return true;
    };
    return false;
};

// move Left
function moveLeft() {
    undraw();
    const leftEdge = current.some(index => (initialPos + index) % width === 0);
    if (!leftEdge)
        initialPos--;

    if (current.some(index => squares[initialPos + index].classList.contains('taken')))
        initialPos++;

    draw();
};

function fullLeft() {
    undraw();
    let leftEdge = current.some(index => (initialPos + index) % width === 0);
    while (!leftEdge) {
        initialPos--;
        leftEdge = current.some(index => (initialPos + index) % width === 0);
        if (current.some(index => squares[initialPos + index].classList.contains('taken'))) {
            initialPos++;
            break;
        }
    }
    draw();
}

// move Right
function moveRight() {
    undraw();

    const rightEdge = current.some(index => (initialPos + index) % width === width - 1);
    if (!rightEdge)
        initialPos++;

    if (current.some(index => squares[initialPos + index].classList.contains('taken')))
        initialPos--;

    draw();
};

function fullRight() {
    undraw();
    let rightEdge = current.some(index => (initialPos + index) % width === width - 1);
    while (!rightEdge) {
        initialPos++;
        rightEdge = current.some(index => (initialPos + index) % width === width - 1);
        if (current.some(index => squares[initialPos + index].classList.contains('taken'))) {
            initialPos--;
            break;
        }
    }
    draw();
}

// rotate clockwise
function rotateCW() {
    undraw();
    const rightEdge = current.some(index => (initialPos + index) % width === width - 1);
    const leftEdge = current.some(index => (initialPos + index) % width === 0);
    if (!rightEdge && !leftEdge) {
        initialRot++
            // ------------------------- exception for L tetrominos
    } else if (rightEdge && random == 0 && initialRot != 1) {
        initialRot++
    } else if (leftEdge && random == 0 && initialRot != 3) {
        initialRot++
            // ------------------------- exception fot Z tetrominos
    } else if (rightEdge && random == 1) {
        initialRot++
    } else if (leftEdge && random == 1 && (initialRot == 0 || initialRot == 2)) {
        initialRot++
            // ------------------------- exception for I tetrominos
    } else if (rightEdge && random == 3 && (initialRot == 0 || initialRot == 2)) {
        initialRot++
    } else if (leftEdge && random == 3 && (initialRot == 0 || initialRot == 2)) {
        initialRot++
            // ------------------------- exception for T tetrominos
    } else if (rightEdge && random == 4 && initialRot != 1) {
        initialRot++
    } else if (leftEdge && random == 4 && initialRot != 3) {
        initialRot++
            // ------------------------- exception for S tetrominos
    } else if (rightEdge && random == 5) {
        initialRot++
    } else if (leftEdge && random == 5 && (initialRot == 0 || initialRot == 2)) {
        initialRot++
            // ------------------------- exception for J tetrominos
    } else if (rightEdge && random == 6 && initialRot != 1) {
        initialRot++
    } else if (leftEdge && random == 6 && initialRot != 3) {
        initialRot++
    }

    if (initialRot === current.length) initialRot = 0 
        
    current = tetrominos[random][initialRot];
    draw();
};

// rotate counter clockwise
function rotateCCW() {
    undraw();
    const rightEdge = current.some(index => (initialPos + index) % width === width - 1);
    const leftEdge = current.some(index => (initialPos + index) % width === 0);
    if (!rightEdge && !leftEdge) {
        initialRot--
            // ------------------------- exception for L tetrominos
    } else if (rightEdge && random == 0 && initialRot != 1) {
        initialRot--
    } else if (leftEdge && random == 0 && initialRot != 3) {
        initialRot--
            // ------------------------- exception fot Z tetrominos
    } else if (rightEdge && random == 1) {
        initialRot--
    } else if (leftEdge && random == 1 && (initialRot == 0 || initialRot == 2)) {
        initialRot--
            // ------------------------- exception for I tetrominos
    } else if (rightEdge && random == 3 && (initialRot == 0 || initialRot == 2)) {
        initialRot--
    } else if (leftEdge && random == 3 && (initialRot == 0 || initialRot == 2)) {
        initialRot--
            // ------------------------- exception for T tetrominos
    } else if (rightEdge && random == 4 && initialRot != 1) {
        initialRot--
    } else if (leftEdge && random == 4 && initialRot != 3) {
        initialRot--
            // ------------------------- exception for S tetrominos
    } else if (rightEdge && random == 5) {
        initialRot--
    } else if (leftEdge && random == 5 && (initialRot == 0 || initialRot == 2)) {
        initialRot--
            // ------------------------- exception for J tetrominos
    } else if (rightEdge && random == 6 && initialRot != 1) {
        initialRot--
    } else if (leftEdge && random == 6 && initialRot != 3) {
        initialRot--
    }

    if (initialRot < 0) initialRot = 3

    current = tetrominos[random][initialRot];
    draw();
};
// }}}

// move and rotation for pc {{{
// move control
function control(e: KeyboardEvent) {
    switch (e.key) {
        case 'ArrowLeft':
            e.preventDefault();
            moveLeft();
            break;
        case 'ArrowRight':
            e.preventDefault();
            moveRight();
            break;
        case 'ArrowDown':
            e.preventDefault();
            moveDown();
            break;
    }
};

// rotation control
function controlR(e: KeyboardEvent) {
    if (e.key === 'f') {
        rotateCW();
    } else if (e.key === 'd') {
        rotateCCW();
    };
};
// }}}

// show up next tetromino in mini-grid {{{
let displayWidth = 4;
let displayIndex = 0;

// tetrominos without rotation
const upNextTetrominoes = [
    [displayWidth+1,displayWidth+2,displayWidth+3,displayWidth*2+1],// L
    [displayWidth+1,displayWidth+2,displayWidth*2+2,displayWidth*2+3],// Z
    [1,2,displayWidth+1,displayWidth+2], // O
    [displayWidth,displayWidth+1,displayWidth+2,displayWidth+3],// I
    [displayWidth+1,displayWidth+2,displayWidth+3,displayWidth*2+2], // T
    [displayWidth+2,displayWidth+3,displayWidth*2+1,displayWidth*2+2], // S
    [displayWidth+1,displayWidth+2,displayWidth+3,displayWidth*2+3] // J
];

// display the shape in mini-grid
function displayShape() {
    displaySq.forEach(square => {
        square.classList.remove('tetrominos');
        square.style.backgroundColor = '';
        square.style.borderColor = '';
    })
    upNextTetrominoes[nextRandom].forEach(index => {
        displaySq[displayIndex + index].classList.add('tetrominos');
        displaySq[displayIndex + index].style.backgroundColor = colors[nextRandom];
        displaySq[displayIndex + index].style.borderColor = colors[nextRandom];
    })
};
// }}}

