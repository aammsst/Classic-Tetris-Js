"use strict";
let pause;
let start;
let gameOv;
let grid;
let squares;
let lastLine;
let lastScore;
let lines;
let startBtn;
let pauseBtn;
let restartBtn;
let scoreDisplay;
let displaySq;
var gameStatus;
(function (gameStatus) {
    gameStatus[gameStatus["Unstarted"] = 0] = "Unstarted";
    gameStatus[gameStatus["Started"] = 1] = "Started";
    gameStatus[gameStatus["GameOver"] = 2] = "GameOver";
    gameStatus[gameStatus["Paused"] = 3] = "Paused";
})(gameStatus || (gameStatus = {}));
let gameMan = {
    stat: gameStatus.Unstarted,
    score: 0,
    lines: 0,
};
document.addEventListener('DOMContentLoaded', () => {
    pause = document.querySelector(".pause");
    start = document.querySelector(".gameStart");
    gameOv = document.querySelector(".gameOv");
    grid = document.querySelector(".grid");
    squares = Array.from(document.querySelectorAll(".grid div"));
    scoreDisplay = document.getElementById("score");
    startBtn = document.getElementById("start-button");
    pauseBtn = document.getElementById("pause-button");
    restartBtn = document.getElementById("restart-button");
    lines = document.getElementById("lines");
    lastScore = document.createElement("H2");
    lastLine = document.createElement("H2");
    displaySq = Array.from(document.querySelectorAll('.mini-grid div'));
    if (startBtn && grid) {
        startBtn.addEventListener('click', () => {
            gameMan.stat = gameStatus.Started;
            draw();
            start.style.display = "none";
            document.addEventListener('keydown', control);
            document.addEventListener('keyup', controlR);
            grid.addEventListener("touchstart", mobileMoveStart);
            grid.addEventListener("touchend", mobileMoveEnd);
            timerId = setInterval(moveDown, 500);
            nextRandom = Math.floor(Math.random() * tetrominos.length);
            displayShape();
            pauseBtn.style.display = "block";
            startBtn.style.display = "none";
        });
    }
    if (pauseBtn) {
        pauseBtn.addEventListener('click', () => {
            if (gameMan.stat != gameStatus.GameOver && timerId && grid) {
                gameMan.stat = gameStatus.Paused;
                clearInterval(timerId);
                document.removeEventListener('keyup', controlR);
                document.removeEventListener('keydown', control);
                grid.removeEventListener("touchstart", mobileMoveStart);
                grid.removeEventListener("touchend", mobileMoveEnd);
                timerId = 0;
                pauseBtn.innerText = "Continue";
                pause.style.display = "block";
                restartBtn.style.display = "block";
            }
            else {
                gameMan.stat = gameStatus.Started;
                pause.style.display = "none";
                restartBtn.style.display = "none";
                draw();
                document.addEventListener('keydown', control);
                document.addEventListener('keyup', controlR);
                grid.addEventListener("touchstart", mobileMoveStart);
                grid.addEventListener("touchend", mobileMoveEnd);
                timerId = setInterval(moveDown, 500);
                pauseBtn.innerText = "Puase";
            }
        });
    }
    if (restartBtn) {
        restartBtn.addEventListener('click', () => {
            pause.style.display = "none";
            pauseBtn.innerText = "Puase";
            for (let i = 0; i < 250; i++) {
                squares[i].classList.remove("tetrominos", "taken");
                squares[i].style.backgroundColor = '';
                squares[i].style.borderColor = '';
            }
            pauseBtn.style.display = "block";
            document.addEventListener('keydown', control);
            document.addEventListener('keyup', controlR);
            grid.addEventListener("touchstart", mobileMoveStart);
            grid.addEventListener("touchend", mobileMoveEnd);
            timerId = setInterval(moveDown, 500);
            nextRandom = Math.floor(Math.random() * tetrominos.length);
            score = 0;
            scoreDisplay.innerHTML = score.toString();
            lineCounter = 0;
            lines.innerHTML = lineCounter.toString();
            if (gameMan.stat == gameStatus.GameOver) {
                gameOv.style.display = "none";
                gameOv.removeChild(lastLine);
                gameOv.removeChild(lastScore);
            }
            gameMan.stat = gameStatus.Started;
            reset();
            displayShape();
            draw();
            restartBtn.style.display = "none";
        });
    }
});
function addScore() {
    for (let i = 0; i < 249; i += width) {
        let row = [i, i + 1, i + 2, i + 3, i + 4, i + 5, i + 6, i + 7, i + 8, i + 9];
        let tetrisRow = [i, i + 1, i + 2, i + 3, i + 4, i + 5, i + 6, i + 7, i + 8, i + 9,
            i + width, i + width + 1, i + width + 2, i + width + 3, i + width + 4, i + width + 5, i + width + 6, i + width + 7, i + width + 8, i + width + 9,
            i + width * 2, i + width * 2 + 1, i + width * 2 + 2, i + width * 2 + 3, i + width * 2 + 4, i + width * 2 + 5, i + width * 2 + 6, i + width * 2 + 7, i + width * 2 + 8, i + width * 2 + 9,
            i + width * 3, i + width * 3 + 1, i + width * 3 + 2, i + width * 3 + 3, i + width * 3 + 4, i + width * 3 + 5, i + width * 3 + 6, i + width * 3 + 7, i + width * 3 + 8, i + width * 3 + 9];
        if (i < 211 && tetrisRow.every(index => squares[index].classList.contains('taken'))) {
            score += 60;
            scoreDisplay.innerHTML = score.toString();
            lineCounter += 4;
            lines.innerHTML = lineCounter.toString();
            tetrisRow.forEach(index => {
                squares[index].classList.remove('taken', 'tetrominos');
                squares[index].style.backgroundColor = '';
                squares[index].style.borderColor = '';
            });
            const squaresRemoved = squares.splice(i, width * 4);
            squares = squaresRemoved.concat(squares);
            squares.forEach(cell => grid.appendChild(cell));
        }
        else if (row.every(index => squares[index].classList.contains('taken'))) {
            score += 10;
            scoreDisplay.innerHTML = score.toString();
            lineCounter += 1;
            lines.innerHTML = lineCounter.toString();
            row.forEach(index => {
                squares[index].classList.remove('taken', 'tetrominos');
                squares[index].style.backgroundColor = '';
                squares[index].style.borderColor = '';
            });
            const squaresRemoved = squares.splice(i, width);
            squares = squaresRemoved.concat(squares);
            squares.forEach(cell => grid.appendChild(cell));
        }
    }
}
;
function gameOver() {
    if (current.some(index => squares[initialPos + index].classList.contains('taken'))) {
        gameMan.stat = gameStatus.GameOver;
        restartBtn.style.display = "block";
        pauseBtn.style.display = "none";
        lastScore.textContent = "Score: " + score;
        lastScore.classList.add("gameOvTxt");
        gameOv.appendChild(lastScore);
        lastLine.textContent = "Lines: " + lineCounter;
        lastLine.classList.add("gameOvTxt");
        gameOv.appendChild(lastLine);
        gameOv.style.display = "block";
        clearInterval(timerId);
        document.removeEventListener('keydown', control);
        document.removeEventListener('keyup', controlR);
    }
}
;
let moveStartX, moveEndX, moveStartY, moveEndY;
function mobileMoveStart(e) {
    e.preventDefault();
    moveStartX = e.changedTouches[0].clientX;
    moveStartY = e.changedTouches[0].clientY;
    return moveStartY;
}
;
function mobileMoveEnd(e) {
    e.preventDefault();
    moveEndX = e.changedTouches[0].clientX;
    moveEndY = e.changedTouches[0].clientY;
    moveDetec(moveStartX, moveEndX, moveStartY, moveEndY);
}
;
function moveDetec(sx, ex, sy, ey) {
    if (sx - ex > 200) {
        moveLeft();
        moveLeft();
        moveLeft();
        moveLeft();
    }
    else if (sx - ex > 150) {
        moveLeft();
        moveLeft();
        moveLeft();
    }
    else if (sx - ex > 100) {
        moveLeft();
        moveLeft();
    }
    else if (sx - ex > 30) {
        moveLeft();
    }
    else if (sx - ex < -200) {
        moveRight();
        moveRight();
        moveRight();
        moveRight();
    }
    else if (sx - ex < -150) {
        moveRight();
        moveRight();
        moveRight();
    }
    else if (sx - ex < -100) {
        moveRight();
        moveRight();
    }
    else if (sx - ex < -30) {
        moveRight();
    }
    else if (ey - sy > 150) {
        moveDown();
        moveDown();
        moveDown();
        moveDown();
        moveDown();
        moveDown();
        moveDown();
        moveDown();
    }
    else if (ey - sy > 100) {
        moveDown();
        moveDown();
        moveDown();
        moveDown();
        moveDown();
        moveDown();
    }
    else if (ey - sy > 30) {
        moveDown();
        moveDown();
        moveDown();
        moveDown();
    }
    else {
        rotateCW();
    }
}
let nextRandom;
let timerId;
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
const lTetromino = [
    [width + 1, width + 2, width + 3, width * 2 + 1],
    [1, 2, width + 2, width * 2 + 2],
    [3, width + 1, width + 2, width + 3],
    [2, width + 2, width * 2 + 2, width * 2 + 3],
];
const zTetromino = [
    [width + 1, width + 2, width * 2 + 2, width * 2 + 3],
    [3, width + 2, width + 3, width * 2 + 2],
    [width + 1, width + 2, width * 2 + 2, width * 2 + 3],
    [3, width + 2, width + 3, width * 2 + 2],
];
const oTetromino = [
    [1, 2, width + 1, width + 2],
    [1, 2, width + 1, width + 2],
    [1, 2, width + 1, width + 2],
    [1, 2, width + 1, width + 2],
];
const iTetromino = [
    [width + 1, width + 2, width + 3, width + 4],
    [2, width + 2, width * 2 + 2, width * 3 + 2],
    [width * 2 + 1, width * 2 + 2, width * 2 + 3, width * 2 + 4],
    [3, width + 3, width * 2 + 3, width * 3 + 3],
];
const tTetromino = [
    [width + 1, width + 2, width + 3, width * 2 + 2],
    [2, width + 1, width + 2, width * 2 + 2],
    [2, width + 1, width + 2, width + 3],
    [2, width + 2, width + 3, width * 2 + 2],
];
const sTetromino = [
    [width + 2, width + 3, width * 2 + 1, width * 2 + 2],
    [2, width + 2, width + 3, width * 2 + 3],
    [width + 2, width + 3, width * 2 + 1, width * 2 + 2],
    [2, width + 2, width + 3, width * 2 + 3],
];
const jTetromino = [
    [width + 1, width + 2, width + 3, width * 2 + 3],
    [2, width + 2, width * 2 + 2, width * 2 + 1],
    [1, width + 1, width + 2, width + 3],
    [2, 3, width + 2, width * 2 + 2],
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
let initialRot = 0;
let initialPos = 3;
let random = Math.floor(Math.random() * tetrominos.length);
let current = tetrominos[random][initialRot];
function reset() {
    initialPos = 3;
    initialRot = 0;
    random = Math.floor(Math.random() * tetrominos.length);
    current = tetrominos[random][initialRot];
}
function draw() {
    current.forEach(index => {
        squares[initialPos + index].classList.add('tetrominos');
        squares[initialPos + index].style.backgroundColor = colors[random];
        squares[initialPos + index].style.borderColor = colors[random];
    });
}
;
function undraw() {
    current.forEach(index => {
        squares[initialPos + index].style.backgroundColor = '';
        squares[initialPos + index].style.borderColor = '';
        squares[initialPos + index].classList.remove('tetrominos');
    });
}
;
function moveDown() {
    freeze();
    undraw();
    initialPos += width;
    draw();
}
function freeze() {
    if (current.some(index => squares[initialPos + index + width].classList.contains('taken'))) {
        current.forEach(index => squares[initialPos + index].classList.add('taken'));
        random = nextRandom;
        nextRandom = Math.floor(Math.random() * tetrominos.length);
        initialRot = 0;
        current = tetrominos[random][initialRot];
        initialPos = 3;
        addScore();
        draw();
        displayShape();
        gameOver();
    }
    ;
}
;
function moveLeft() {
    undraw();
    const leftEdge = current.some(index => (initialPos + index) % width === 0);
    if (!leftEdge)
        initialPos -= 1;
    if (current.some(index => squares[initialPos + index].classList.contains('taken'))) {
        initialPos += 1;
    }
    ;
    draw();
}
;
function moveRight() {
    undraw();
    const rightEdge = current.some(index => (initialPos + index) % width === width - 1);
    if (!rightEdge)
        initialPos += 1;
    if (current.some(index => squares[initialPos + index].classList.contains('taken'))) {
        initialPos -= 1;
    }
    ;
    draw();
}
;
function rotateCW() {
    undraw();
    const rightEdge = current.some(index => (initialPos + index) % width === width - 1);
    const leftEdge = current.some(index => (initialPos + index) % width === 0);
    if (!rightEdge && !leftEdge) {
        initialRot++;
    }
    else if (rightEdge && random == 0 && initialRot != 1) {
        initialRot++;
    }
    else if (leftEdge && random == 0 && initialRot != 3) {
        initialRot++;
    }
    else if (rightEdge && random == 1) {
        initialRot++;
    }
    else if (leftEdge && random == 1 && (initialRot == 0 || initialRot == 2)) {
        initialRot++;
    }
    else if (rightEdge && random == 3 && (initialRot == 0 || initialRot == 2)) {
        initialRot++;
    }
    else if (leftEdge && random == 3 && (initialRot == 0 || initialRot == 2)) {
        initialRot++;
    }
    else if (rightEdge && random == 4 && initialRot != 1) {
        initialRot++;
    }
    else if (leftEdge && random == 4 && initialRot != 3) {
        initialRot++;
    }
    else if (rightEdge && random == 5) {
        initialRot++;
    }
    else if (leftEdge && random == 5 && (initialRot == 0 || initialRot == 2)) {
        initialRot++;
    }
    else if (rightEdge && random == 6 && initialRot != 1) {
        initialRot++;
    }
    else if (leftEdge && random == 6 && initialRot != 3) {
        initialRot++;
    }
    if (initialRot === current.length)
        initialRot = 0;
    current = tetrominos[random][initialRot];
    draw();
}
;
function rotateCCW() {
    undraw();
    const rightEdge = current.some(index => (initialPos + index) % width === width - 1);
    const leftEdge = current.some(index => (initialPos + index) % width === 0);
    if (!rightEdge && !leftEdge) {
        initialRot--;
    }
    else if (rightEdge && random == 0 && initialRot != 1) {
        initialRot--;
    }
    else if (leftEdge && random == 0 && initialRot != 3) {
        initialRot--;
    }
    else if (rightEdge && random == 1) {
        initialRot--;
    }
    else if (leftEdge && random == 1 && (initialRot == 0 || initialRot == 2)) {
        initialRot--;
    }
    else if (rightEdge && random == 3 && (initialRot == 0 || initialRot == 2)) {
        initialRot--;
    }
    else if (leftEdge && random == 3 && (initialRot == 0 || initialRot == 2)) {
        initialRot--;
    }
    else if (rightEdge && random == 4 && initialRot != 1) {
        initialRot--;
    }
    else if (leftEdge && random == 4 && initialRot != 3) {
        initialRot--;
    }
    else if (rightEdge && random == 5) {
        initialRot--;
    }
    else if (leftEdge && random == 5 && (initialRot == 0 || initialRot == 2)) {
        initialRot--;
    }
    else if (rightEdge && random == 6 && initialRot != 1) {
        initialRot--;
    }
    else if (leftEdge && random == 6 && initialRot != 3) {
        initialRot--;
    }
    if (initialRot < 0)
        initialRot = 3;
    current = tetrominos[random][initialRot];
    draw();
}
;
function control(e) {
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
;
function controlR(e) {
    if (e.key === 'f') {
        rotateCW();
    }
    else if (e.key === 'd') {
        rotateCCW();
    }
    ;
}
;
let displayWidth = 4;
let displayIndex = 0;
const upNextTetrominoes = [
    [displayWidth + 1, displayWidth + 2, displayWidth + 3, displayWidth * 2 + 1],
    [displayWidth + 1, displayWidth + 2, displayWidth * 2 + 2, displayWidth * 2 + 3],
    [1, 2, displayWidth + 1, displayWidth + 2],
    [displayWidth, displayWidth + 1, displayWidth + 2, displayWidth + 3],
    [displayWidth + 1, displayWidth + 2, displayWidth + 3, displayWidth * 2 + 2],
    [displayWidth + 2, displayWidth + 3, displayWidth * 2 + 1, displayWidth * 2 + 2],
    [displayWidth + 1, displayWidth + 2, displayWidth + 3, displayWidth * 2 + 3]
];
function displayShape() {
    displaySq.forEach(square => {
        square.classList.remove('tetrominos');
        square.style.backgroundColor = '';
        square.style.borderColor = '';
    });
    upNextTetrominoes[nextRandom].forEach(index => {
        displaySq[displayIndex + index].classList.add('tetrominos');
        displaySq[displayIndex + index].style.backgroundColor = colors[nextRandom];
        displaySq[displayIndex + index].style.borderColor = colors[nextRandom];
    });
}
;
