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
let fullSBtn;
let mobInstr = null;
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
    if (navigator.maxTouchPoints > 0 &&
        window.innerWidth < window.innerHeight) {
        document.querySelector(".instructions").style.display = "none";
        btns.classList.add("mobBtns");
        btns.innerHTML += `
            <button id="start-button" type="button" class="btn">Start</button>
            <button id="pause-button" type="button" class="btn">Pause</button>
            <button id="restart-button" type="button" class="btn">Restart</button>
            <button id="fullscreen-button" type="button" class="btn" hidden="true">FullScreen</button>
        `;
        gameMenu.appendChild(btns);
        startBtn = document.getElementById("start-button");
        pauseBtn = document.getElementById("pause-button");
        restartBtn = document.getElementById("restart-button");
        fullSBtn = document.getElementById("fullscreen-button");
        fullSBtn.setAttribute("hidden", "false");
        fullSBtn.style.display = "block";
        fullSBtn.addEventListener('click', toggleFS);
        mobInstr = document.createElement("DIV");
        mobInstr.classList.add("mobInstructions");
        mobInstr.innerHTML += `
                    <img alt="Mobile Instructions" title="Mobile Instructions" id="mobInstr" src="./imgs/mobileInstructions.png">
                    <br>
                    <h4 id="mobInstrTxt">Tap to move</h4>
        `;
        gameMenu.appendChild(mobInstr);
        mobileEvents();
    }
    else {
        btns.classList.add("buttons");
        btns.innerHTML += `
            <button id="start-button" type="button" class="btn">Start</button>
            <button id="pause-button" type="button" class="btn">Pause</button>
            <button id="restart-button" type="button" class="btn">Restart</button>
            <button id="fullscreen-button" type="button" class="btn" hidden="true">FullScreen</button>
        `;
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
let setTimerID = () => {
    timerId = setInterval(moveDown, 500);
};
function startGame() {
    gameMan.stat = gameStatus.Started;
    gameMenu.style.display = "none";
    document.addEventListener('keydown', control);
    document.addEventListener('keyup', controlR);
    grid.addEventListener("touchstart", mobileMoveStart);
    grid.addEventListener("touchend", mobileMoveEnd);
    timerId = setInterval(moveDown, 500);
    reset();
    displayShape();
    displayShapeMob();
    draw();
    pauseBtn.style.display = "block";
    startBtn.style.display = "none";
}
function restartGame() {
    gameMenu.style.display = "none";
    if (mobInstr) {
        mobInstr.style.display = "flex";
    }
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
    displayShapeMob();
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
        if (mobInstr) {
            mobInstr.style.display = "none";
        }
        gameMenu.style.display = "block";
        clearInterval(timerId);
        document.removeEventListener('keydown', control);
        document.removeEventListener('keyup', controlR);
    }
}
let moveStartX, moveEndX, moveStartY, moveEndY;
let sensibility = 50;
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
    if (sx - ex > sensibility) {
        rotateCW();
    }
    else if (sx - ex < -sensibility) {
        rotateCCW();
    }
    else if (ey - sy > sensibility) {
        softDrop();
    }
    else if (ey - sy < -sensibility) {
        togglePause();
    }
    else {
        mobileHMove(col);
    }
}
function mobileHMove(col) {
    let i = 0;
    let correction = 1;
    switch (currPiece) {
        case 0:
            if (currRot == 3)
                correction = 2;
            break;
        case 1:
            if (currRot == 1 || currRot == 3)
                correction = 2;
            break;
        case 3:
            if (currRot == 1)
                correction = 3;
            if (currRot == 3)
                correction = 2;
            break;
        case 4:
            if (currRot == 3)
                correction = 2;
            break;
        case 5:
            if (currRot == 1 || currRot == 3)
                correction = 2;
            break;
        case 6:
            if (currRot == 3)
                correction = 2;
            break;
    }
    let actualPos = (currPos + correction) % 10;
    if (actualPos === col) {
        return;
    }
    if (actualPos > col) {
        do {
            i++;
            moveLeft();
            actualPos = (currPos + correction) % 10;
        } while (actualPos > col && i < 10);
    }
    else {
        do {
            i++;
            moveRight();
            actualPos = (currPos + correction) % 10;
        } while (actualPos < col && i < 10);
    }
}
function toggleFS() {
    if (!document.fullscreenElement) {
        fullSBtn.innerText = "Exit FullScreen";
        gridCont.requestFullscreen()
            .then(() => {
            gridToFS();
            menusToFS();
            miniGridMob.style.display = "flex";
            displayShapeMob();
            window.history.pushState({ page: 1 }, 'Full Screen');
        })
            .catch(er => {
            console.log(er);
        });
    }
    else {
        exitFS();
        fullSBtn.innerText = "FullScreen";
        miniGridMob.style.display = "none";
        document.exitFullscreen();
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
    upNextTetrominoes[nextPiece].forEach(index => {
        displaySqMob[displayIndex + index].classList.add('tetrominos');
        displaySqMob[displayIndex + index].style.backgroundColor = colors[nextPiece];
        displaySqMob[displayIndex + index].style.borderColor = colors[nextPiece];
    });
}
function mobileEvents() {
    document.addEventListener('visibilitychange', e => {
        e.preventDefault();
        if (gameMan.stat == gameStatus.Started) {
            togglePause();
        }
        if (document.fullscreenElement) {
            toggleFS();
        }
    });
    window.addEventListener('popstate', e => {
        e.preventDefault();
        if (gameMan.stat == gameStatus.Started) {
            togglePause();
        }
        if (document.fullscreenElement) {
            toggleFS();
        }
    });
}
let timerId;
let score = 0;
let lineCounter = 0;
let isDrawn = false;
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
    [width + 1, 3, width + 2, width + 3],
    [width + 2, 2, width * 2 + 2, width * 2 + 3],
];
const zTetromino = [
    [width + 1, width + 2, width * 2 + 2, width * 2 + 3],
    [width + 2, 3, width + 3, width * 2 + 2],
    [width + 1, width + 2, width * 2 + 2, width * 2 + 3],
    [width + 2, 3, width + 3, width * 2 + 2],
];
const oTetromino = [
    [1, 2, width + 1, width + 2],
    [1, 2, width + 1, width + 2],
    [1, 2, width + 1, width + 2],
    [1, 2, width + 1, width + 2],
];
const iTetromino = [
    [width + 1, width + 2, width + 3, width + 4],
    [3, width + 3, width * 2 + 3, width * 3 + 3],
    [width * 2 + 1, width * 2 + 2, width * 2 + 3, width * 2 + 4],
    [2, width + 2, width * 2 + 2, width * 3 + 2],
];
const tTetromino = [
    [width + 1, width + 2, width + 3, width * 2 + 2],
    [width + 1, 2, width + 2, width * 2 + 2],
    [width + 1, 2, width + 2, width + 3],
    [2, width + 2, width + 3, width * 2 + 2],
];
const sTetromino = [
    [width * 2 + 1, width + 2, width + 3, width * 2 + 2],
    [2, width + 2, width + 3, width * 2 + 3],
    [width * 2 + 1, width + 2, width + 3, width * 2 + 2],
    [2, width + 2, width + 3, width * 2 + 3],
];
const jTetromino = [
    [width + 1, width + 2, width + 3, width * 2 + 3],
    [width * 2 + 1, 2, width + 2, width * 2 + 2],
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
let currPiece;
let nextPiece;
let curr;
function getBatch(lastIdx = -1) {
    let batch = new Array(7);
    batch.fill(-1);
    let random;
    if (lastIdx == -1) {
        random = Math.floor(Math.random() * 7);
        batch[0] = random;
    }
    else {
        do {
            random = Math.floor(Math.random() * 7);
            batch[0] = random;
        } while (random == 1 || random == 5);
    }
    let j = 0;
    for (let i = 1; i < 7; i++) {
        do {
            j++;
            random = Math.floor(Math.random() * 7);
        } while ((batch.indexOf(random) != -1) && j < 10);
        batch[i] = random;
    }
    return batch;
}
function setNextRand() {
    switch (nextIdx) {
        case -1:
            currBatch = getBatch();
            nextIdx = 1;
            break;
        case 6:
            currBatch = getBatch(currBatch[6]);
            nextIdx = 0;
            break;
        default:
            nextIdx++;
            break;
    }
}
function reset() {
    nextIdx = -1;
    setNextRand();
    nextPiece = currBatch[nextIdx];
    currRot = initialRot;
    currPos = initialPos;
    currIdx = 0;
    currPiece = currBatch[currIdx];
    curr = tetrominos[currPiece][currRot];
}
function draw() {
    curr.forEach(index => {
        squares[currPos + index].classList.add('tetrominos');
        squares[currPos + index].style.backgroundColor = colors[currPiece];
        squares[currPos + index].style.borderColor = colors[currPiece];
    });
    isDrawn = true;
}
function undraw() {
    curr.forEach(index => {
        squares[currPos + index].style.backgroundColor = '';
        squares[currPos + index].style.borderColor = '';
        squares[currPos + index].classList.remove('tetrominos');
    });
    isDrawn = false;
}
function moveDown() {
    if (!isDrawn) {
        return;
    }
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
function hardDrop() {
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
        currPiece = nextPiece;
        setNextRand();
        currRot = initialRot;
        curr = tetrominos[currPiece][currRot];
        nextPiece = currBatch[nextIdx];
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
function moveRight() {
    undraw();
    const rightEdge = curr.some(index => (currPos + index) % width === width - 1);
    if (!rightEdge)
        currPos++;
    if (curr.some(index => squares[currPos + index].classList.contains('taken')))
        currPos--;
    draw();
}
function rotateCW() {
    undraw();
    const rightEdge = curr.some(index => (currPos + index) % width === width - 1);
    const leftEdge = curr.some(index => (currPos + index) % width === 0);
    if (!rightEdge && !leftEdge) {
        currRot++;
    }
    else if (rightEdge) {
        switch (currPiece) {
            case 0:
                if (currRot != 1) {
                    currRot++;
                }
                break;
            case 1:
                currRot++;
                break;
            case 2:
                draw();
                return;
            case 3:
                if (currRot == 0 || currRot == 2) {
                    currRot++;
                }
                break;
            case 4:
                if (currRot != 1) {
                    currRot++;
                }
                break;
            case 5:
                currRot++;
                break;
            case 6:
                if (currRot != 1) {
                    currRot++;
                }
                break;
        }
    }
    else if (leftEdge) {
        switch (currPiece) {
            case 0:
                if (currRot != 3) {
                    currRot++;
                }
                break;
            case 1:
                if (currRot == 0 || currRot == 2) {
                    currRot++;
                }
                break;
            case 2:
                draw();
                return;
            case 3:
                if (currRot == 0 || currRot == 2) {
                    currRot++;
                }
                break;
            case 4:
                if (currRot != 3) {
                    currRot++;
                }
                break;
            case 5:
                if (currRot == 0 || currRot == 2) {
                    currRot++;
                }
                break;
            case 6:
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
    const check = curr.some(index => squares[currPos + index].classList.contains('taken'));
    if (check) {
        currRot--;
        curr = tetrominos[currPiece][currRot];
    }
    draw();
}
function rotateCCW() {
    undraw();
    const rightEdge = curr.some(index => (currPos + index) % width === width - 1);
    const leftEdge = curr.some(index => (currPos + index) % width === 0);
    if (!rightEdge && !leftEdge) {
        currRot--;
    }
    else if (rightEdge) {
        switch (currPiece) {
            case 0:
                if (currRot != 1) {
                    currRot--;
                }
                break;
            case 1:
                currRot--;
                break;
            case 2:
                draw();
                return;
            case 3:
                if (currRot == 0 || currRot == 2) {
                    currRot--;
                }
                break;
            case 4:
                if (currRot != 1) {
                    currRot--;
                }
                break;
            case 5:
                currRot--;
                break;
            case 6:
                if (currRot != 1) {
                    currRot--;
                }
                break;
        }
    }
    else if (leftEdge) {
        switch (currPiece) {
            case 0:
                if (currRot != 3) {
                    currRot--;
                }
                break;
            case 1:
                if (currRot == 0 || currRot == 2) {
                    currRot--;
                }
                break;
            case 2:
                draw();
                return;
            case 3:
                if (currRot == 0 || currRot == 2) {
                    currRot--;
                }
                break;
            case 4:
                if (currRot != 3) {
                    currRot--;
                }
                break;
            case 5:
                if (currRot == 0 || currRot == 2) {
                    currRot--;
                }
                break;
            case 6:
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
    const check = curr.some(index => squares[currPos + index].classList.contains('taken'));
    if (check) {
        currRot++;
        curr = tetrominos[currPiece][currRot];
    }
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
    upNextTetrominoes[nextPiece].forEach(index => {
        displaySq[displayIndex + index].classList.add('tetrominos');
        displaySq[displayIndex + index].style.backgroundColor = colors[nextPiece];
        displaySq[displayIndex + index].style.borderColor = colors[nextPiece];
    });
}
;
