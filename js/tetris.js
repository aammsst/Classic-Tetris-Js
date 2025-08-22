"use strict";
let gameMenu;
let menuTxt;
let optionsMenu;
let optionsTxt;
let grid;
let miniGridMob;
let squares;
let lastLine;
let lastScore;
let lines;
let startBtn;
let optionsBtn;
let backBtn;
let pauseBtn;
let restartBtn;
let gameBtns;
let scoreDisplay;
let displaySq;
let displaySqMob;
let gridCont;
let leftCont;
let buttons;
let fullSBtn;
let mobInstr = null;
let hardDropBtn;
let rotCWBtn;
let rotCCWBtn;
const singleScore = 10;
const doubleScore = 25;
const tripleScore = 40;
const tetrisScore = 80;
let gameManager = {
    status: "Unstarted",
    isMobile: false,
    score: 0,
    lines: 0,
};
document.addEventListener('DOMContentLoaded', () => {
    gameMenu = document.getElementById("gameMenu");
    menuTxt = document.getElementById("menuTxt");
    optionsMenu = document.getElementById("optionsMenu");
    optionsTxt = document.getElementById("optionsTxt");
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
    gameBtns = document.createElement("DIV");
    let optionsBtns = document.createElement("DIV");
    if (navigator.maxTouchPoints > 0 &&
        window.innerWidth < window.innerHeight) {
        document.querySelector(".instructions").style.display = "none";
        gameManager.isMobile = true;
        btns.classList.add("mobBtns");
        btns.innerHTML += `
            <button id="start-button" type="button" class="btn">Start</button>
            <button id="options-button" type="button" class="btn">Options</button>
            <button id="pause-button" type="button" class="btn">Pause</button>
            <button id="restart-button" type="button" class="btn">Restart</button>
            <button id="fullscreen-button" type="button" class="btn" hidden="true">FullScreen</button>
        `;
        optionsBtns.innerHTML += `
            <button id="back-button" type="button" class="btn">Back</button>
        `;
        optionsMenu.appendChild(optionsBtns);
        gameMenu.appendChild(btns);
        startBtn = document.getElementById("start-button");
        optionsBtn = document.getElementById("options-button");
        backBtn = document.getElementById("back-button");
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
        gameBtns.classList.add("in-game-btn-container");
        gameBtns.innerHTML += `
            <button id="rotate-cw-button" type="button" class="in-game-btn"></button>
            <button id="rotate-ccw-button" type="button" class="in-game-btn"></button>
            <button id="hard-drop-button" type="button" class="in-game-btn"></button>
        `;
        gridCont.appendChild(gameBtns);
        hardDropBtn = document.getElementById("hard-drop-button");
        rotCWBtn = document.getElementById("rotate-cw-button");
        rotCCWBtn = document.getElementById("rotate-ccw-button");
        gameBtns.style.display = "none";
        mobileEvents();
    }
    else {
        btns.classList.add("buttons");
        btns.innerHTML += `
            <button id="start-button" type="button" class="btn">Start</button>
            <button id="options-button" type="button" class="btn">Options</button>
            <button id="pause-button" type="button" class="btn">Pause</button>
            <button id="restart-button" type="button" class="btn">Restart</button>
            <button id="fullscreen-button" type="button" class="btn" hidden="true">FullScreen</button>
        `;
        leftCont.appendChild(btns);
        startBtn = document.getElementById("start-button");
        optionsBtn = document.getElementById("options-button");
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
    if (optionsBtn && grid) {
        optionsBtn.addEventListener('click', () => {
            loadOptions();
            showOptions();
        });
    }
    if (backBtn && grid) {
        backBtn.addEventListener("click", () => {
            hideOptions();
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
    if (hardDropBtn) {
        hardDropBtn.addEventListener('touchstart', hardDrop);
    }
    if (rotCWBtn && grid) {
        rotCWBtn.addEventListener('touchstart', rotateCW);
    }
    if (rotCCWBtn && grid) {
        rotCCWBtn.addEventListener('touchstart', rotateCCW);
    }
}
let setTimerID = () => {
    timerId = setInterval(moveDown, 500);
};
function startGame() {
    gameManager.status = "Started";
    gameMenu.style.display = "none";
    if (gameManager.isMobile) {
        gameBtns.style.display = "block";
        grid === null || grid === void 0 ? void 0 : grid.addEventListener("touchstart", mobileMoveStart);
        grid === null || grid === void 0 ? void 0 : grid.addEventListener("touchend", mobileMoveEnd);
    }
    else {
        document.addEventListener('keydown', control);
        document.addEventListener('keyup', controlR);
    }
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
    gameBtns.style.display = "block";
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
    if (gameManager.isMobile) {
        grid === null || grid === void 0 ? void 0 : grid.addEventListener("touchstart", mobileMoveStart);
        grid === null || grid === void 0 ? void 0 : grid.addEventListener("touchend", mobileMoveEnd);
    }
    else {
        document.addEventListener('keydown', control);
        document.addEventListener('keyup', controlR);
    }
    timerId = setInterval(moveDown, 500);
    gameManager.score = 0;
    scoreDisplay.innerHTML = gameManager.score.toString();
    gameManager.lines = 0;
    lines.innerHTML = gameManager.lines.toString();
    if (gameManager.status == "GameOver") {
        gameMenu.style.display = "none";
        gameMenu.removeChild(lastLine);
        gameMenu.removeChild(lastScore);
    }
    gameManager.status = "Started";
    reset();
    displayShape();
    displayShapeMob();
    draw();
    restartBtn.style.display = "none";
}
function togglePause() {
    if (gameManager.status != "GameOver" && timerId && grid) {
        gameBtns.style.display = "none";
        gameManager.status = "Paused";
        clearInterval(timerId);
        if (gameManager.isMobile) {
            grid.removeEventListener("touchstart", mobileMoveStart);
            grid.removeEventListener("touchend", mobileMoveEnd);
        }
        else {
            document.removeEventListener('keyup', controlR);
            document.removeEventListener('keydown', control);
        }
        timerId = 0;
        pauseBtn.innerText = "Continue";
        menuTxt.innerText = "-- Pause --";
        gameMenu.style.display = "block";
        restartBtn.style.display = "block";
    }
    else {
        gameBtns.style.display = "block";
        gameManager.status = "Started";
        gameMenu.style.display = "none";
        restartBtn.style.display = "none";
        draw();
        if (gameManager.isMobile) {
            grid === null || grid === void 0 ? void 0 : grid.addEventListener("touchstart", mobileMoveStart);
            grid === null || grid === void 0 ? void 0 : grid.addEventListener("touchend", mobileMoveEnd);
        }
        else {
            document.addEventListener('keydown', control);
            document.addEventListener('keyup', controlR);
        }
        timerId = setInterval(moveDown, 500);
        pauseBtn.innerText = "Puase";
    }
}
function showOptions() {
    gameMenu.style.display = "none";
    restartBtn.style.display = "none";
    startBtn.style.display = "none";
    optionsBtn.style.display = "none";
    backBtn.style.display = "block";
    optionsMenu.style.display = "block";
}
function hideOptions() {
    if (gameManager.status == "Paused") {
        gameMenu.style.display = "block";
        restartBtn.style.display = "block";
    }
    else if (gameManager.status == "Unstarted" && gameManager.isMobile) {
        gameMenu.style.display = "block";
        startBtn.style.display = "block";
    }
    else if (gameManager.status == "Unstarted") {
        startBtn.style.display = "block";
    }
    optionsBtn.style.display = "block";
    backBtn.style.display = "none";
    optionsMenu.style.display = "none";
}
function loadOptions() {
    const gridCheck = document.getElementById("grid-check-box");
    gridCheck.addEventListener('change', () => {
        if (gridCheck.checked) {
            showGrid();
        }
        else {
            hideGrid();
        }
    });
    if (gameManager.isMobile) {
        const rotCheck = document.getElementById("use-rot-check-box");
        rotCheck.addEventListener('change', () => {
            if (rotCheck.checked) {
                handleBtns(true, "rotate");
            }
            else {
                handleBtns(false, "rotate");
            }
        });
        const hardCheck = document.getElementById("use-hard-drop-check-box");
        hardCheck.addEventListener('change', () => {
            if (hardCheck.checked) {
                handleBtns(true, "hardDrop");
            }
            else {
                handleBtns(false, "hardDrop");
            }
        });
        const transparentCheck = document.getElementById("transparent-check-box");
        transparentCheck.addEventListener('change', () => {
            if (transparentCheck.checked) {
                handleBtns(true, "transparent");
            }
            else {
                handleBtns(false, "transparent");
            }
        });
    }
}
function showGrid() {
    const cells = document.querySelectorAll(".cell");
    cells.forEach(cell => {
        cell.classList.replace("cell-without-grid", "cell-with-grid");
    });
}
function hideGrid() {
    const cells = document.querySelectorAll(".cell");
    cells.forEach(cell => {
        cell.classList.replace("cell-with-grid", "cell-without-grid");
    });
}
function handleBtns(show, kind) {
    if (show) {
        switch (kind) {
            case "rotate":
                rotCWBtn.style.display = "block";
                rotCCWBtn.style.display = "block";
                break;
            case "hardDrop":
                hardDropBtn.style.display = "block";
                break;
            case "transparent":
                rotCWBtn.style.backgroundColor = "rgba(0,0,0,0)";
                rotCCWBtn.style.backgroundColor = "rgba(0,0,0,0)";
                hardDropBtn.style.backgroundColor = "rgba(0,0,0,0)";
                break;
        }
    }
    else {
        switch (kind) {
            case "rotate":
                rotCWBtn.style.display = "none";
                rotCCWBtn.style.display = "none";
                break;
            case "hardDrop":
                hardDropBtn.style.display = "none";
                break;
            case "transparent":
                rotCWBtn.style.backgroundColor = "rgba(33, 200, 33, 0.2)";
                rotCCWBtn.style.backgroundColor = "rgba(200, 200, 33, 0.2)";
                hardDropBtn.style.backgroundColor = "rgba(200, 33, 33, 0.2)";
                break;
        }
    }
}
function addScore() {
    let linesCleared = 0;
    let rowsToCheck = new Set;
    tetrominos[currPiece][currRot].forEach(i => {
        rowsToCheck.add(Math.floor((i + currPos) / 10));
    });
    rowsToCheck.forEach(i => {
        let rowIndex = i * 10;
        let row = [
            rowIndex,
            rowIndex + 1,
            rowIndex + 2,
            rowIndex + 3,
            rowIndex + 4,
            rowIndex + 5,
            rowIndex + 6,
            rowIndex + 7,
            rowIndex + 8,
            rowIndex + 9
        ];
        if (row.every(index => squares[index].classList.contains('taken'))) {
            linesCleared++;
            row.forEach(index => {
                squares[index].classList.remove('taken', 'tetrominos');
                squares[index].style.backgroundColor = '';
                squares[index].style.borderColor = '';
            });
            const squaresRemoved = squares.splice(rowIndex, width);
            squares = squaresRemoved.concat(squares);
            squares.forEach(cell => grid.appendChild(cell));
        }
    });
    switch (linesCleared) {
        case 0:
            return;
        case 1:
            gameManager.score += singleScore;
        case 2:
            gameManager.score += doubleScore;
        case 3:
            gameManager.score += tripleScore;
        case 4:
            gameManager.score += tetrisScore;
    }
    gameManager.lines += linesCleared;
    scoreDisplay.innerHTML = gameManager.score.toString();
    lines.innerHTML = gameManager.lines.toString();
}
function gameOver() {
    if (curr.some(index => squares[currPos + index].classList.contains('taken'))) {
        gameManager.status = "GameOver";
        gameBtns.style.display = "none";
        restartBtn.style.display = "block";
        pauseBtn.style.display = "none";
        lastScore.textContent = "Score: " + gameManager.score;
        lastScore.classList.add("gameOvTxt");
        gameMenu.appendChild(lastScore);
        lastLine.textContent = "Lines: " + gameManager.lines;
        lastLine.classList.add("gameOvTxt");
        gameMenu.appendChild(lastLine);
        menuTxt.innerText = "Game Over";
        if (mobInstr) {
            mobInstr.style.display = "none";
        }
        gameMenu.style.display = "block";
        clearInterval(timerId);
        if (!gameManager.isMobile) {
            document.removeEventListener('keydown', control);
            document.removeEventListener('keyup', controlR);
        }
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
            gameMenu.classList.replace("gameMenu", "gameMenuFS");
            optionsMenu.classList.replace("gameMenu", "gameMenuFS");
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
    gameMenu.classList.replace("gameMenuFS", "gameMenu");
    optionsMenu.classList.replace("gameMenuFS", "gameMenu");
}
function displayShapeMob() {
    if (gameManager.status != "Started") {
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
        if (gameManager.status == "Started") {
            togglePause();
        }
        if (document.fullscreenElement) {
            toggleFS();
        }
    });
    window.addEventListener('popstate', e => {
        e.preventDefault();
        if (gameManager.status == "Started") {
            togglePause();
        }
        if (document.fullscreenElement) {
            toggleFS();
        }
    });
}
let timerId;
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
    let random;
    const set = new Set();
    if (lastIdx == 1 || lastIdx == 5) {
        do {
            random = Math.floor(Math.random() * 7);
        } while (random == 1 || random == 5);
        set.add(random);
    }
    do {
        random = Math.floor(Math.random() * 7);
        set.add(random);
    } while (set.size < 7);
    return Array.from(set);
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
        addScore();
        currIdx = nextIdx;
        currPiece = nextPiece;
        setNextRand();
        currRot = initialRot;
        curr = tetrominos[currPiece][currRot];
        nextPiece = currBatch[nextIdx];
        currPos = initialPos;
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
