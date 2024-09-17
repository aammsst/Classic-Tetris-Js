"use strict";
let gameMenu;
let gMenuTxt;
let grid;
let miniGridMob;
let squares;
let lastLine;
let lastScore;
let lines;
let startBtn;
let pauseBtn;
let restartBtn;
let scoreDisplay;
let displaySq;
let displaySqMob;
let gridCont;
let leftCont;
let buttons;
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
    gameMenu = document.querySelector(".gameMenu");
    gMenuTxt = document.querySelector(".gMenuTxt");
    grid = document.querySelector(".grid");
    squares = Array.from(document.querySelectorAll(".grid div"));
    scoreDisplay = document.getElementById("score");
    lines = document.getElementById("lines");
    lastScore = document.createElement("H2");
    lastLine = document.createElement("H2");
    displaySq = Array.from(document.querySelectorAll('.mini-grid div'));
    displaySqMob = Array.from(document.querySelectorAll('.mini-grid-mob div'));
    miniGridMob = document.querySelector('.mini-grid-mob');
    gridCont = document.getElementById("gridContainer");
    leftCont = document.getElementById("cont2");
    let btns = document.createElement("DIV");
    btns.classList.add("buttons");
    btns.innerHTML += `
        <button id="start-button" type="button" class="btn">Start</button>
        <button id="pause-button" type="button" class="btn">Pause</button>
        <button id="restart-button" type="button" class="btn">Restart</button>
        <button id="fullscreen-button" type="button" class="btn" hidden="true">FullScreen</button>
    `;
    if (navigator.maxTouchPoints > 0 &&
        window.innerWidth < window.innerHeight) {
        document.querySelector(".instructions").style.display = "none";
        gameMenu.appendChild(btns);
        startBtn = document.getElementById("start-button");
        pauseBtn = document.getElementById("pause-button");
        restartBtn = document.getElementById("restart-button");
        let fullSBtn = document.getElementById("fullscreen-button");
        fullSBtn === null || fullSBtn === void 0 ? void 0 : fullSBtn.setAttribute("hidden", "false");
        fullSBtn.style.display = "block";
        fullSBtn.addEventListener('click', () => {
            if (fullSBtn.innerText == "FullScreen") {
                fullSBtn.innerText = "Exit FullScreen";
            }
            else {
                fullSBtn.innerText = "FullScreen";
            }
            toggleFS();
        });
    }
    else {
        leftCont.appendChild(btns);
        startBtn = document.getElementById("start-button");
        pauseBtn = document.getElementById("pause-button");
        restartBtn = document.getElementById("restart-button");
    }
    initBtns();
});
function initBtns() {
    if (startBtn && grid) {
        startBtn.addEventListener('click', () => {
            startGame();
        });
    }
    if (pauseBtn) {
        pauseBtn.addEventListener('click', () => {
            togglePause();
        });
    }
    if (restartBtn) {
        restartBtn.addEventListener('click', () => {
            restartGame();
        });
    }
}
function startGame() {
    gameMan.stat = gameStatus.Started;
    gameMenu.style.display = "none";
    document.addEventListener('keydown', control);
    document.addEventListener('keyup', controlR);
    grid.addEventListener("touchstart", mobileMoveStart);
    grid.addEventListener("touchend", mobileMoveEnd);
    timerId = setInterval(moveDown, 500);
    nextRandom = getNextRand();
    draw();
    displayShape();
    displayShapeMob();
    pauseBtn.style.display = "block";
    startBtn.style.display = "none";
}
function restartGame() {
    gameMenu.style.display = "none";
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
    nextRandom = getNextRand();
    score = 0;
    scoreDisplay.innerHTML = score.toString();
    lineCounter = 0;
    lines.innerHTML = lineCounter.toString();
    if (gameMan.stat == gameStatus.GameOver) {
        gameMenu.style.display = "none";
        gameMenu.removeChild(lastLine);
        gameMenu.removeChild(lastScore);
    }
    gameMan.stat = gameStatus.Started;
    reset();
    displayShape();
    draw();
    restartBtn.style.display = "none";
}
function togglePause() {
    if (gameMan.stat != gameStatus.GameOver && timerId && grid) {
        gameMan.stat = gameStatus.Paused;
        clearInterval(timerId);
        document.removeEventListener('keyup', controlR);
        document.removeEventListener('keydown', control);
        grid.removeEventListener("touchstart", mobileMoveStart);
        grid.removeEventListener("touchend", mobileMoveEnd);
        timerId = 0;
        pauseBtn.innerText = "Continue";
        gMenuTxt.innerText = "-- Pause --";
        gameMenu.style.display = "block";
        restartBtn.style.display = "block";
    }
    else {
        gameMan.stat = gameStatus.Started;
        gameMenu.style.display = "none";
        restartBtn.style.display = "none";
        draw();
        document.addEventListener('keydown', control);
        document.addEventListener('keyup', controlR);
        grid.addEventListener("touchstart", mobileMoveStart);
        grid.addEventListener("touchend", mobileMoveEnd);
        timerId = setInterval(moveDown, 500);
        pauseBtn.innerText = "Puase";
    }
}
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
function gameOver() {
    if (curr.some(index => squares[currPos + index].classList.contains('taken'))) {
        gameMan.stat = gameStatus.GameOver;
        restartBtn.style.display = "block";
        pauseBtn.style.display = "none";
        lastScore.textContent = "Score: " + score;
        lastScore.classList.add("gameOvTxt");
        gameMenu.appendChild(lastScore);
        lastLine.textContent = "Lines: " + lineCounter;
        lastLine.classList.add("gameOvTxt");
        gameMenu.appendChild(lastLine);
        gMenuTxt.innerText = "Game Over";
        gameMenu.style.display = "block";
        clearInterval(timerId);
        document.removeEventListener('keydown', control);
        document.removeEventListener('keyup', controlR);
    }
}
let moveStartX, moveEndX, moveStartY, moveEndY;
function getX(e) {
    let col = e.changedTouches[0].target;
    let a = parseInt(col.getAttribute("col"));
    mobileHMove(a);
}
function mobileMoveStart(e) {
    e.preventDefault();
    moveStartX = e.changedTouches[0].clientX;
    moveStartY = e.changedTouches[0].clientY;
}
function mobileMoveEnd(e) {
    e.preventDefault();
    moveEndX = e.changedTouches[0].clientX;
    moveEndY = e.changedTouches[0].clientY;
    let col = e.changedTouches[0].target;
    let intCol = parseInt(col.getAttribute("col"));
    moveDetec(moveStartX, moveEndX, moveStartY, moveEndY, intCol);
}
function moveDetec(sx, ex, sy, ey, col) {
    if (sx - ex > 30) {
        rotateCW();
    }
    else if (sx - ex < -30) {
        rotateCCW();
    }
    else if (ey - sy > 30) {
        softDrop();
    }
    else {
        mobileHMove(col);
    }
}
function mobileHMove(col) {
    let i = 0;
    let actualPos = (currPos + 1) % 10;
    if (actualPos > col) {
        if (col == 0) {
            fullLeft();
            return;
        }
        while (actualPos > col && i < 10) {
            i++;
            moveLeft();
            actualPos = (currPos + 1) % 10;
        }
    }
    else {
        if (col == 9) {
            fullRight();
            return;
        }
        while (actualPos < col && i < 10) {
            i++;
            moveRight();
            actualPos = (currPos + 1) % 10;
        }
    }
}
function toggleFS() {
    if (!document.fullscreenElement) {
        gridCont.requestFullscreen()
            .then(() => {
            gridToFS();
            menusToFS();
            miniGridMob.style.display = "flex";
            displayShapeMob();
            window.addEventListener('popstate', e => {
                e.preventDefault();
                if (gameMan.stat == gameStatus.Unstarted) {
                }
                else {
                    togglePause();
                }
            });
        })
            .catch(er => {
            console.log(er);
        });
    }
    else {
        exitFS();
        miniGridMob.style.display = "none";
        document.exitFullscreen();
        window.removeEventListener('popstate', () => { });
    }
}
function gridToFS() {
    grid.style.height = "100%";
    let h = window.innerHeight;
    let w = (h * 200) / 500;
    grid.style.width = w + "px";
}
function exitFS() {
    grid.style.height = "500px";
    grid.style.width = "200px";
    gameMenu.classList.remove("gameMenuFS");
    gameMenu.classList.add("gameMenu");
}
function menusToFS() {
    gameMenu.classList.remove("gameMenu");
    gameMenu.classList.add("gameMenuFS");
}
function displayShapeMob() {
    if (gameMan.stat != gameStatus.Started) {
        return;
    }
    displaySqMob.forEach(square => {
        square.classList.remove('tetrominos');
        square.style.backgroundColor = '';
        square.style.borderColor = '';
    });
    upNextTetrominoes[nextIdx].forEach(index => {
        displaySqMob[displayIndex + index].classList.add('tetrominos');
        displaySqMob[displayIndex + index].style.backgroundColor = colors[nextIdx];
        displaySqMob[displayIndex + index].style.borderColor = colors[nextIdx];
    });
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
let nextIdx = -1;
let currIdx = -1;
let currRot = initialRot;
let currPos = initialPos;
let currBatch = new Array(7);
let curr;
function getBatch(lastIdx = -1) {
    let batch = new Array(7);
    let random = Math.floor(Math.random() * 7);
    if (lastIdx == -1) {
        batch[0] = random;
    }
    else {
        do {
            random = Math.floor(Math.random() * 7);
            batch[0] = random;
        } while (random == 1 || random == 5);
    }
    for (let i = 1; i < 7; i++) {
        do {
            random = Math.floor(Math.random() * 7);
        } while (batch.indexOf(random) != -1);
        batch[i] = random;
    }
    return batch;
}
function getNextRand() {
    if (nextIdx == -1) {
        currBatch = getBatch();
        nextIdx++;
        currIdx = nextIdx;
        curr = tetrominos[currIdx][currRot];
        return nextIdx;
    }
    else if (nextIdx == 6) {
        currBatch = getBatch(currBatch[6]);
        nextIdx = 0;
        return nextIdx;
    }
    else {
        nextIdx++;
        return nextIdx;
    }
}
function reset() {
    nextIdx = -1;
    currRot = initialRot;
    currPos = initialPos;
    currBatch = new Array(7);
    currIdx = getNextRand();
    nextIdx = getNextRand();
    curr = tetrominos[currIdx][initialRot];
}
function draw() {
    curr.forEach(index => {
        squares[currPos + index].classList.add('tetrominos');
        squares[currPos + index].style.backgroundColor = colors[currIdx];
        squares[currPos + index].style.borderColor = colors[currIdx];
    });
}
function undraw() {
    curr.forEach(index => {
        squares[currPos + index].style.backgroundColor = '';
        squares[currPos + index].style.borderColor = '';
        squares[currPos + index].classList.remove('tetrominos');
    });
}
function moveDown() {
    if (!freeze()) {
        undraw();
        currPos += width;
        draw();
    }
}
function softDrop() {
    while (!freeze()) {
        undraw();
        currPos += width;
        draw();
    }
}
function freeze() {
    if (curr.some(index => squares[currPos + index + width].classList.contains('taken'))) {
        curr.forEach(index => squares[currPos + index].classList.add('taken'));
        currIdx = nextIdx;
        nextIdx = getNextRand();
        currRot = initialRot;
        curr = tetrominos[currIdx][initialRot];
        currPos = initialPos;
        addScore();
        draw();
        if (document.fullscreenElement) {
            displayShapeMob();
        }
        else {
            displayShape();
        }
        gameOver();
        return true;
    }
    return false;
}
function moveLeft() {
    undraw();
    const leftEdge = curr.some(index => (currPos + index) % width === 0);
    if (!leftEdge)
        currPos--;
    if (curr.some(index => squares[currPos + index].classList.contains('taken')))
        currPos++;
    draw();
}
function fullLeft() {
    undraw();
    let leftEdge = curr.some(index => (currPos + index) % width === 0);
    while (!leftEdge) {
        currPos--;
        leftEdge = curr.some(index => (currPos + index) % width === 0);
        if (curr.some(index => squares[currPos + index].classList.contains('taken'))) {
            currPos++;
            break;
        }
    }
    draw();
}
function moveRight() {
    undraw();
    const rightEdge = curr.some(index => (currPos + index) % width === width - 1);
    if (!rightEdge)
        currPos++;
    if (curr.some(index => squares[currPos + index].classList.contains('taken')))
        currPos--;
    draw();
}
function fullRight() {
    undraw();
    let rightEdge = curr.some(index => (currPos + index) % width === width - 1);
    while (!rightEdge) {
        currPos++;
        rightEdge = curr.some(index => (currPos + index) % width === width - 1);
        if (curr.some(index => squares[currPos + index].classList.contains('taken'))) {
            currPos--;
            break;
        }
    }
    draw();
}
function rotateCW() {
    undraw();
    const rightEdge = curr.some(index => (currPos + index) % width === width - 1);
    const leftEdge = curr.some(index => (currPos + index) % width === 0);
    if (!rightEdge && !leftEdge) {
        currRot++;
    }
    else if (rightEdge && currIdx == 0 && currRot != 1) {
        currRot++;
    }
    else if (leftEdge && currIdx == 0 && currRot != 3) {
        currRot++;
    }
    else if (rightEdge && currIdx == 1) {
        currRot++;
    }
    else if (leftEdge && currIdx == 1 && (currRot == 0 || currRot == 2)) {
        currRot++;
    }
    else if (rightEdge && currIdx == 3 && (currRot == 0 || currRot == 2)) {
        currRot++;
    }
    else if (leftEdge && currIdx == 3 && (currRot == 0 || currRot == 2)) {
        currRot++;
    }
    else if (rightEdge && currIdx == 4 && currRot != 1) {
        currRot++;
    }
    else if (leftEdge && currIdx == 4 && currRot != 3) {
        currRot++;
    }
    else if (rightEdge && currIdx == 5) {
        currRot++;
    }
    else if (leftEdge && currIdx == 5 && (currRot == 0 || currRot == 2)) {
        currRot++;
    }
    else if (rightEdge && currIdx == 6 && currRot != 1) {
        currRot++;
    }
    else if (leftEdge && currIdx == 6 && currRot != 3) {
        currRot++;
    }
    if (currRot === curr.length)
        currRot = 0;
    curr = tetrominos[currIdx][currRot];
    draw();
}
function rotateCCW() {
    undraw();
    const rightEdge = curr.some(index => (currPos + index) % width === width - 1);
    const leftEdge = curr.some(index => (currPos + index) % width === 0);
    if (!rightEdge && !leftEdge) {
        currRot--;
    }
    else if (rightEdge && currIdx == 0 && currRot != 1) {
        currRot--;
    }
    else if (leftEdge && currIdx == 0 && currRot != 3) {
        currRot--;
    }
    else if (rightEdge && currIdx == 1) {
        currRot--;
    }
    else if (leftEdge && currIdx == 1 && (currRot == 0 || currRot == 2)) {
        currRot--;
    }
    else if (rightEdge && currIdx == 3 && (currRot == 0 || currRot == 2)) {
        currRot--;
    }
    else if (leftEdge && currIdx == 3 && (currRot == 0 || currRot == 2)) {
        currRot--;
    }
    else if (rightEdge && currIdx == 4 && currRot != 1) {
        currRot--;
    }
    else if (leftEdge && currIdx == 4 && currRot != 3) {
        currRot--;
    }
    else if (rightEdge && currIdx == 5) {
        currRot--;
    }
    else if (leftEdge && currIdx == 5 && (currRot == 0 || currRot == 2)) {
        currRot--;
    }
    else if (rightEdge && currIdx == 6 && currRot != 1) {
        currRot--;
    }
    else if (leftEdge && currIdx == 6 && currRot != 3) {
        currRot--;
    }
    if (currRot < 0)
        currRot = 3;
    curr = tetrominos[currIdx][currRot];
    draw();
}
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
function controlR(e) {
    if (e.key === 'f') {
        rotateCW();
    }
    else if (e.key === 'd') {
        rotateCCW();
    }
}
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
    upNextTetrominoes[nextIdx].forEach(index => {
        displaySq[displayIndex + index].classList.add('tetrominos');
        displaySq[displayIndex + index].style.backgroundColor = colors[nextIdx];
        displaySq[displayIndex + index].style.borderColor = colors[nextIdx];
    });
}
;
