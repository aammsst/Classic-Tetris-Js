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
	    [width+1,3,width+2,width+3],
	    [width+2,2,width*2+2,width*2+3],
    ];
    const zTetromino = [
	    [width+1,width+2,width*2+2,width*2+3],
	    [width+2,3,width+3,width*2+2],
	    [width+1,width+2,width*2+2,width*2+3],
	    [width+2,3,width+3,width*2+2],
    ];
    const oTetromino = [
	    [1,2,width+1,width+2],
	    [1,2,width+1,width+2],
	    [1,2,width+1,width+2],
	    [1,2,width+1,width+2],
    ];
    const iTetromino = [
	    [width+1,width+2,width+3,width+4],
	    [3,width+3,width*2+3,width*3+3],
	    [width*2+1,width*2+2,width*2+3,width*2+4],
	    [2,width+2,width*2+2,width*3+2],
    ];
    const tTetromino = [
	    [width+1,width+2,width+3,width*2+2],
	    [width+1,2,width+2,width*2+2],
	    [width+1,2,width+2,width+3],
	    [2,width+2,width+3,width*2+2],
    ];
    const sTetromino = [
	    [width*2+1,width+2,width+3,width*2+2],
	    [2,width+2,width+3,width*2+3],
	    [width*2+1,width+2,width+3,width*2+2],
	    [2,width+2,width+3,width*2+3],
    ];
    const jTetromino = [
	    [width+1,width+2,width+3,width*2+3],
	    [width*2+1,2,width+2,width*2+2],
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
let nextIdx = -1;
let currIdx = -1;
let currRot = initialRot;
let currPos = initialPos;
let currBatch: number[] = new Array(7);
let currPiece: number;
let nextPiece: number;
let curr: number[];
// select random tetrominos
// let random = Math.floor(Math.random()*tetrominos.length);
// let current = tetrominos[random][initialRot];

// gen random {{{
function getBatch(lastIdx = -1) {
    let batch: number[] = new Array(7);
    batch.fill(-1);
    let random;

    // first piece generation
    if (lastIdx == -1) {
        random = Math.floor(Math.random()*7);
        batch[0] = random; 

    } else {
        // protection against ss, zz, szsz or zszs paterns
        do {
            random = Math.floor(Math.random()*7);
            batch[0] = random; 
        } while (random == 1 || random == 5);
    }

    let j = 0;
    for (let i=1; i<7; i++) {
        do {
            j++;
            random = Math.floor(Math.random()*7);
        } while ((batch.indexOf(random) != -1) && j<10);
        batch[i] = random; 
    }
    return batch;
}

function setNextRand() {
    // manages batch of random idx and
    // returns next random idx
    switch (nextIdx) {
        case -1:
            // first generation of rand pieces
            currBatch = getBatch();
            nextIdx = 1;
            break;
        case 6:
            // gen next batch of pices
            currBatch = getBatch(currBatch[6]);
            nextIdx = 0;
            break;
        default:
            nextIdx++;
            break;
    }
}
// }}}

// drawing, undrawing, freezing and actions {{{
// reset on restart
function reset() {
    nextIdx = -1;
    // currBatch = new Array(7);
    setNextRand(); // updates nextIdx and generates next batch if necesary
    nextPiece = currBatch[nextIdx];
    currRot = initialRot;
    currPos = initialPos;
    currIdx = 0;
    currPiece = currBatch[currIdx];
    curr = tetrominos[currPiece][currRot];
}

// drawing tetrominos
function draw() {
    curr.forEach(index => {
        squares[currPos + index].classList.add('tetrominos');
        squares[currPos + index].style.backgroundColor = colors[currPiece];
        squares[currPos + index].style.borderColor = colors[currPiece];
    })
}

// undrawing tetrominos
function undraw() {
    curr.forEach(index => {
        squares[currPos + index].style.backgroundColor = '';
        squares[currPos + index].style.borderColor = '';
        squares[currPos + index].classList.remove('tetrominos');
    })
}

// move down
function moveDown() {
    if (!freeze()) {
        undraw();
        currPos += width;
        draw();
    }
}

function softDrop() {
    clearInterval(timerId);
    while (!curr.some(index => squares[currPos + index + width].classList.contains('taken'))) {
        undraw();
        currPos += width;
        draw();
    }
    timerId = setInterval(moveDown, 500);
}

// TODO: settings menu to chose hard or soft, colors, and speed
// also the score is muy bad
function hardDrop() {
    while (!freeze()) {
        undraw();
        currPos += width;
        draw();
    }
}

// freeze at the bottom and when touching other pieces
function freeze(): boolean {
    if (curr.some(index => squares[currPos + index + width].classList.contains('taken'))) {
        curr.forEach(index => squares[currPos + index].classList.add('taken'));
        currIdx = nextIdx;
        currPiece = nextPiece;
        setNextRand(); // updates nextIdx and generates next batch if necesary
        currRot = initialRot;
        curr = tetrominos[currPiece][currRot];
        nextPiece = currBatch[nextIdx];
        currPos = initialPos;
        addScore();
        draw();
        if (document.fullscreenElement){
            displayShapeMob();
        } else {
            displayShape();
        }
        gameOver();
        return true;
    }
    return false;
}

// move Left
function moveLeft() {
    undraw();
    const leftEdge = curr.some(index => (currPos + index) % width === 0);
    if (!leftEdge)
        currPos--;

    if (curr.some(index => squares[currPos + index].classList.contains('taken')))
        currPos++;

    draw();
}

// move Right
function moveRight() {
    undraw();

    const rightEdge = curr.some(index => (currPos + index) % width === width - 1);
    if (!rightEdge)
        currPos++;

    if (curr.some(index => squares[currPos + index].classList.contains('taken')))
        currPos--;

    draw();
}

// rotate clockwise
function rotateCW() {
    undraw();
    const rightEdge = curr.some(index => (currPos + index) % width === width - 1);
    const leftEdge = curr.some(index => (currPos + index) % width === 0);

    if (!rightEdge && !leftEdge) {
        currRot++;

    } else if (rightEdge) {
        switch (currPiece) {
            case 0:
                // l
                if (currRot != 1) {
                    currRot++;
                }
                break;
            case 1:
                // z
                currRot++;
                break;
            case 2:
                // o
                draw();
                return;
            case 3:
                // i
                if (currRot == 0 || currRot == 2) {
                    currRot++;
                }
                break;
            case 4:
                // t
                if (currRot != 1) {
                    currRot++;
                }
                break;
            case 5:
                // s
                currRot++;
                break;
            case 6:
                // j
                if (currRot != 1) {
                    currRot++;
                }
                break;
        }
    } else if (leftEdge) {
        switch (currPiece) {
            case 0:
                // l
                if (currRot != 3) {
                    currRot++;
                }
                break;
            case 1:
                // z
                if (currRot == 0 || currRot == 2) {
                    currRot++;
                }
                break;
            case 2:
                // o
                draw();
                return;
            case 3:
                // i
                if (currRot == 0 || currRot == 2) {
                    currRot++;
                }
                break;
            case 4:
                // t
                if (currRot != 3) {
                    currRot++;
                }
                break;
            case 5:
                // s
                if (currRot == 0 || currRot == 2) {
                    currRot++;
                }
                break;
            case 6:
                // j
                if (currRot != 3) {
                    currRot++;
                }
                break;
        }
    }

    if (currRot === curr.length) {
        currRot = 0;
    }

    curr = tetrominos[currPiece][currRot];
    // overlapping check
    const check = curr.some(index => squares[currPos + index].classList.contains('taken'));
    if (check) {
        currRot--;
        curr = tetrominos[currPiece][currRot];
    }

    draw();
}

// rotate counter clockwise
function rotateCCW() {
    undraw();
    const rightEdge = curr.some(index => (currPos + index) % width === width - 1);
    const leftEdge = curr.some(index => (currPos + index) % width === 0);

    if (!rightEdge && !leftEdge) {
        currRot--;
    } else if (rightEdge) {
        switch (currPiece) {
            case 0:
                // l
                if (currRot != 1) {
                    currRot--;
                }
                break;
            case 1:
                // z
                currRot--;
                break;
            case 2:
                // o
                draw();
                return;
            case 3:
                // i
                if (currRot == 0 || currRot == 2) {
                    currRot--;
                }
                break;
            case 4:
                // t
                if (currRot != 1) {
                    currRot--;
                }
                break;
            case 5:
                // s
                currRot--;
                break;
            case 6:
                // j
                if (currRot != 1) {
                    currRot--;
                }
                break;
        }

    } else if (leftEdge) {
        switch (currPiece) {
            case 0:
                // l
                if (currRot != 3) {
                    currRot--;
                }
                break;
            case 1:
                // z
                if (currRot == 0 || currRot == 2) {
                    currRot--;
                }
                break;
            case 2:
                // o
                draw();
                return;
            case 3:
                // i
                if (currRot == 0 || currRot == 2) {
                    currRot--;
                }
                break;
            case 4:
                // t
                if (currRot != 3) {
                    currRot--;
                }
                break;
            case 5:
                // s
                if (currRot == 0 || currRot == 2) {
                    currRot--;
                }
                break;
            case 6:
                // j
                if (currRot != 3) {
                    currRot--;
                }
                break;
        }
    }

    if (currRot < 0) {
        currRot = 3;
    }

    curr = tetrominos[currPiece][currRot];
    // overlapping check
    const check = curr.some(index => squares[currPos + index].classList.contains('taken'));
    if (check) {
        currRot++;
        curr = tetrominos[currPiece][currRot];
    }

    draw();
}
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
}

// rotation control
function controlR(e: KeyboardEvent) {
    if (e.key === 'f') {
        rotateCW();
    } else if (e.key === 'd') {
        rotateCCW();
    }
}
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
    });
    upNextTetrominoes[nextPiece].forEach(index => {
        displaySq[displayIndex + index].classList.add('tetrominos');
        displaySq[displayIndex + index].style.backgroundColor = colors[nextPiece];
        displaySq[displayIndex + index].style.borderColor = colors[nextPiece];
    });
};
// }}}
