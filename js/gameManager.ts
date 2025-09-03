let gameMenu: HTMLElement | null;
let menuTxt: HTMLElement | null;
let optionsMenu: HTMLElement | null;
let optionsTxt: HTMLElement | null;

let grid: HTMLElement | null;
let miniGridMob: HTMLElement | null;
let squares: HTMLElement[];
let lastLine: HTMLElement | null;
let lastScore: HTMLElement | null;
let scoreDisplay: HTMLElement | null;
let linesDisplay: HTMLElement | null;
let levelDisplay: HTMLElement | null;
let levelDisplayCont: HTMLElement | null;
let comboDisplay: HTMLElement | null;

let startBtn: HTMLElement | null;
let optionsBtn: HTMLElement | null;
let backBtn: HTMLElement | null;
let pauseBtn: HTMLElement | null;
let restartBtn: HTMLElement | null;
let gameBtns: HTMLElement | null;

let displaySq: HTMLElement[];
let gridCont: HTMLElement | null;
let leftCont: HTMLElement | null;

// global options
let gridCheck: HTMLInputElement;
let survivalCheck: HTMLInputElement;

// mobile options
let mvmntBtnsCheck: HTMLInputElement;
let rotBtnsCheck: HTMLInputElement;
let hardDropBtnCheck: HTMLInputElement;
let transparentBtnsCheck: HTMLInputElement;

let infoMob: HTMLElement | null;
let scoreDisplayMob: HTMLElement | null;
let linesDisplayMob: HTMLElement | null;
let levelDisplayMob: HTMLElement | null;
let comboDisplayMob: HTMLElement | null;
let displaySqMob: HTMLElement[];

let buttons: HTMLElement[] | null;
let fullSBtn: HTMLElement | null;
let mobInstr: HTMLElement | null = null;

// in game mobile buttons
let moveLeftBtn: HTMLElement | null;
let moveRightBtn: HTMLElement | null;
let hardDropBtn: HTMLElement | null;
let rotCWBtn: HTMLElement | null; // clockwise
let rotCCWBtn: HTMLElement | null; // counter-clockwise
let rightPressed = false;
let leftPressed = false;
let dasCharged = false;
const dasFast = 100;
const dasSlow = 500;
let dasTimeout: number;

const singleScore = 10;
const doubleScore = 25;
const tripleScore = 40;
const tetrisScore = 80;
let linesToLevelUp = 0;

let comboNum = 0;
let backToBackNum = 0;

type gameStatus = "Unstarted" | "Started" | "GameOver" | "Paused";

type game = {
    status: gameStatus;
    isMobile: boolean;
    score: number;
    lines: number;
    isSurvival: boolean;
    level: number;
}

let gameManager: game = {
    status: "Unstarted",
    isMobile: false,
    score: 0,
    lines: 0,
    isSurvival: false,
    level: 1,
}

document.addEventListener('DOMContentLoaded',() => {
    gameMenu = document.getElementById("gameMenu");
    menuTxt = document.getElementById("menuTxt");
    optionsMenu = document.getElementById("optionsMenu");
    optionsTxt = document.getElementById("optionsTxt");
    grid = document.querySelector(".grid");
    squares = Array.from(document.querySelectorAll(".grid div"));

    scoreDisplay = document.getElementById("score");
    linesDisplay = document.getElementById("lines");
    lastScore = document.createElement("H2");
    lastLine = document.createElement("H2");
    comboDisplay = document.getElementById("combos");
    levelDisplay = document.getElementById("levels");
    levelDisplayCont = document.getElementById("level-display-container");

    // hide levelDisplay until starting game as non-survival
    levelDisplayCont!.style.display = "none";

    displaySq = Array.from(document.querySelectorAll('.mini-grid div'));
    displaySqMob = Array.from(document.querySelectorAll('.mini-grid-mob div'));
    miniGridMob = document.querySelector('.mini-grid-mob');
    gridCont = document.getElementById("gridContainer");
    leftCont = document.getElementById("cont2");
    let btns = document.createElement("DIV");
    gameBtns = document.createElement("DIV");
    let optionsBtns = document.createElement("DIV");

    // global options
    gridCheck = document.getElementById("grid-check-box") as HTMLInputElement;
    survivalCheck = document.getElementById("survival-check-box") as HTMLInputElement;

    // mobile detect
    if (navigator.maxTouchPoints > 0 &&
       window.innerWidth < window.innerHeight) {
        (document.querySelector(".instructions") as HTMLElement).style.display="none";

        let mobOptions = document.getElementById("mobOptions");
        mobOptions!.style.display = "block";
        gameManager.isMobile = true;

        // generate btns for mobile
        btns.classList.add("mobBtns");
        btns.innerHTML += `
            <button id="start-button" type="button" class="btn">Start</button>
            <button id="options-button" type="button" class="btn">Options</button>
            <button id="pause-button" type="button" class="btn">Pause</button>
            <button id="restart-button" type="button" class="btn">Restart</button>
            <button id="fullscreen-button" type="button" class="btn" hidden="true">FullScreen</button>
        `;

        // inside options buttons
        // TODO: cancel, apply, restart(apply and restart) btns
        optionsBtns.innerHTML += `
            <button id="back-button" type="button" class="btn">Back</button>
        `;

        optionsMenu!.appendChild(optionsBtns);
        gameMenu!.appendChild(btns);
        startBtn = document.getElementById("start-button");
        optionsBtn = document.getElementById("options-button");
        backBtn = document.getElementById("back-button");
        pauseBtn = document.getElementById("pause-button");
        restartBtn = document.getElementById("restart-button");
        fullSBtn = document.getElementById("fullscreen-button");
        fullSBtn!.setAttribute("hidden", "false");
        fullSBtn!.style.display = "block";
        fullSBtn!.addEventListener('click', toggleFS);

        // instructions
        mobInstr = document.createElement("DIV");
        mobInstr.classList.add("mobInstructions");
        mobInstr.innerHTML += `
                    <img alt="Mobile Instructions" title="Mobile Instructions" id="mobInstr" src="./imgs/mobileInstructions.png">
                    <br>
                    <h4 id="mobInstrTxt">Tap to move</h4>
        `;
        gameMenu!.appendChild(mobInstr);

        // virtual in-game buttons
        gameBtns.classList.add("in-game-btn-container");
        gameBtns.innerHTML += `
            <div id="move-left-button" class="in-game-btn"></div>
            <div id="move-right-button" class="in-game-btn"></div>
            <div id="rotate-cw-button" class="in-game-btn"></div>
            <div id="rotate-ccw-button" class="in-game-btn"></div>
            <div id="hard-drop-button" class="in-game-btn"></div>
        `;

        gridCont!.appendChild(gameBtns);

        moveRightBtn = document.getElementById("move-right-button");
        moveLeftBtn = document.getElementById("move-left-button");
        hardDropBtn = document.getElementById("hard-drop-button");
        rotCWBtn = document.getElementById("rotate-cw-button");
        rotCCWBtn = document.getElementById("rotate-ccw-button");

        moveRightBtn!.style.display = "none";
        moveLeftBtn!.style.display = "none";
        hardDropBtn!.style.display = "none";
        rotCWBtn!.style.display = "none";
        rotCCWBtn!.style.display = "none";

        // display info on Full-Screen
        infoMob = document.getElementById("info-mob");
        scoreDisplayMob = document.getElementById("score-mob");
        linesDisplayMob = document.getElementById("lines-mob");
        levelDisplayMob = document.getElementById("level-mob");
        comboDisplayMob = document.getElementById("combos-mob");

        // mobile options

        mvmntBtnsCheck = document.getElementById("use-mov-check-box") as HTMLInputElement;
        rotBtnsCheck = document.getElementById("use-rot-check-box") as HTMLInputElement;
        hardDropBtnCheck = document.getElementById("use-hard-drop-check-box") as HTMLInputElement;
        transparentBtnsCheck = document.getElementById("transparent-check-box") as HTMLInputElement;

        // hide until fullScreen
        infoMob!.style.display = "none";

        mobileEvents();

    } else {
        // generate btns for web browser
        btns.classList.add("buttons");
        btns.innerHTML += `
            <button id="start-button" type="button" class="btn">Start</button>
            <button id="options-button" type="button" class="btn">Options</button>
            <button id="back-button" type="button" class="btn" style="display: none">Back</button>
            <button id="pause-button" type="button" class="btn">Pause</button>
            <button id="restart-button" type="button" class="btn">Restart</button>
            <button id="fullscreen-button" type="button" class="btn" hidden="true">FullScreen</button>
        `;
        leftCont!.appendChild(btns);

        startBtn = document.getElementById("start-button");
        optionsBtn = document.getElementById("options-button");
        backBtn = document.getElementById("back-button");
        pauseBtn = document.getElementById("pause-button");
        restartBtn = document.getElementById("restart-button");
    }

    initBtns();
    loadOptions();
});

// initBtns {{{
function initBtns() {
    // start btn
    if (startBtn && grid) {
        startBtn.addEventListener('click', ()=>{
            startGame();
        });
    }

    // options btn
    if (optionsBtn && grid) {
        optionsBtn.addEventListener('click', ()=>{
            showOptions();
        });
    }

    // in options btn
    if (backBtn && grid) {
        backBtn.addEventListener("click", hideOptions);
    }

    // pause btn
    if (pauseBtn) {
        pauseBtn.addEventListener('click', ()=>{
            togglePause();
        })
    }

    // restart btn
    if (restartBtn) {
        restartBtn.addEventListener('click', ()=>{
            restartGame();
        })
    }

    // mobile in-game btns
    if (moveRightBtn) {
        moveRightBtn.addEventListener('touchstart', e => {
            e.preventDefault();
            rightPressed = true;
            moveRightDas();
        })
        moveRightBtn.addEventListener('touchend', () => {
            rightPressed = false;
        })
    }

    if (moveLeftBtn) {
        moveLeftBtn.addEventListener('touchstart', e => {
            e.preventDefault();
            leftPressed = true;
            moveLeftDas();
        })
        moveLeftBtn.addEventListener('touchend', () => {
            leftPressed = false;
        })
    }

    if (hardDropBtn) {
        hardDropBtn.addEventListener('touchstart', hardDrop)
    }

    if (rotCWBtn && grid) {
        rotCWBtn.addEventListener('touchstart', rotateCW )
    }

    if (rotCCWBtn && grid) {
        rotCCWBtn.addEventListener('touchstart', rotateCCW)
    }

}
// }}}

// start fn {{{
function startGame() {
    gameManager.status = "Started";
    gameMenu!.style.display = "none";
    optionsBtn!.style.display = "none";
    if (gameManager.isMobile) {
        grid?.addEventListener("touchstart",mobileMoveStart)
        grid?.addEventListener("touchend",mobileMoveEnd)
    } else {
        document.addEventListener('keydown', controlDown);
    }
    if (gameManager.isSurvival) {
        levelDisplay!.style.display = "none";
        if (gameManager.isMobile) {
            levelDisplayMob!.style.display = "none";
        }
        levelDisplayCont!.style.display = "none";
        timerId = setInterval(moveDown, 500);
    } else {
        levelDisplayCont!.style.display = "block";
        levelDisplay!.style.display = "block";
        if (gameManager.isMobile) {
            levelDisplayMob!.style.display = "block";
        }
        gameManager.level = 1;
        levelUpdate();
    }
    reset();
    displayShape();
    displayShapeMob();
    dasCharged = false;
    draw();
    pauseBtn!.style.display = "block";
    startBtn!.style.display = "none";
}
// }}}

// restart fn {{{
function restartGame() {
    gameMenu!.style.display = "none";
    optionsBtn!.style.display = "none";
    if (mobInstr) {
        mobInstr.style.display = "flex";
    }
    for (let i = 0; i < 250; i++) {
        squares[i].classList.remove("tetrominos","taken", colorSet+1, colorSet+2, colorSet+3);
    }
    if (gameManager.isMobile) {
        resetDisplayShapeMob();
    }
    resetDisplayShape();
    pauseBtn!.innerText = "Puase";
    pauseBtn!.style.display = "block";
    if (gameManager.isMobile) {
        grid?.addEventListener("touchstart",mobileMoveStart)
        grid?.addEventListener("touchend",mobileMoveEnd)
    } else {
        document.addEventListener('keydown', controlDown);
    }
    if (gameManager.isSurvival) {
        levelDisplay!.style.display = "none";
        if (gameManager.isMobile) {
            levelDisplayMob!.style.display = "none";
        }
        levelDisplayCont!.style.display = "none";
        timerId = setInterval(moveDown, 500);
    } else {
        levelDisplayCont!.style.display = "block";
        levelDisplay!.style.display = "block";
        if (gameManager.isMobile) {
            levelDisplayMob!.style.display = "block";
        }
        gameManager.level = 1;
        levelUpdate();
    }
    gameManager.score = 0;
    scoreDisplay!.innerHTML = gameManager.score.toString();
    gameManager.lines = 0;
    linesDisplay!.innerHTML = gameManager.lines.toString();
    if (gameManager.status == "GameOver") {
        gameMenu!.style.display = "none";
        gameMenu!.removeChild(lastLine!);
        gameMenu!.removeChild(lastScore!);
    }
    gameManager.status = "Started";
    reset();
    displayShape();
    displayShapeMob();
    draw();
    restartBtn!.style.display = "none";
}
// }}}

// pause fn {{{
function togglePause() {
    if (gameManager.status != "GameOver" && timerId && grid) {
        // pause
        gameBtns!.style.display = "none";
        gameManager.status = "Paused";
        clearInterval(timerId);
        if (gameManager.isMobile) {
            grid.removeEventListener("touchstart",mobileMoveStart);
            grid.removeEventListener("touchend",mobileMoveEnd);
        } else {
            document.removeEventListener('keydown', controlDown);
        }
        timerId = 0;
        pauseBtn!.innerText = "Continue";
        menuTxt!.innerText = "-- Pause --";
        gameMenu!.style.display = "block";
        restartBtn!.style.display = "block";
        optionsBtn!.style.display = "block";
        backBtn!.style.display = "none";
        startBtn!.style.display = "none";
    } else {
        // unpause
        gameBtns!.style.display = "block";
        gameManager.status = "Started";
        gameMenu!.style.display = "none";
        restartBtn!.style.display = "none";
        optionsBtn!.style.display = "none";
        draw();
        if (gameManager.isMobile) {
            grid?.addEventListener("touchstart",mobileMoveStart)
            grid?.addEventListener("touchend",mobileMoveEnd)
        } else {
            document.addEventListener('keydown', controlDown);
        }
        if (gameManager.isSurvival) {
            timerId = setInterval(moveDown, 500);
        } else {
            levelUpdate();
        }
        pauseBtn!.innerText = "Puase";
    }
}
// }}}

// options {{{

function showOptions() {
    // show options
    backBtn!.innerHTML = "Back";
    if (gameManager.status == "Paused") {
        gameMenu!.style.display = "none";
        pauseBtn!.style.display = "none";
        restartBtn!.style.display = "none";
    } else if (gameManager.status == "Unstarted" && gameManager.isMobile) {
        gameMenu!.style.display = "none";
        startBtn!.style.display = "none";
    } else if (gameManager.status == "Unstarted") {
        startBtn!.style.display = "none";
    }
    optionsBtn!.style.display = "none";
    backBtn!.style.display = "block";
    optionsMenu!.style.display = "block";
}

function hideOptions() {
    // back to pause menu
    if (gameManager.status == "Paused") {
        gameMenu!.style.display = "block";
        pauseBtn!.style.display = "block";
        restartBtn!.style.display = "block";
        startBtn!.style.display = "none";
    } else if (gameManager.status == "Unstarted" && gameManager.isMobile) {
        gameMenu!.style.display = "block";
        startBtn!.style.display = "block";
    } else if (gameManager.status == "Unstarted") {
        startBtn!.style.display = "block";
    }
    optionsBtn!.style.display = "block";
    backBtn!.style.display = "none";
    optionsMenu!.style.display = "none";
}

function loadOptions() {

    // grid
    gridCheck.addEventListener('change', () => {
        if (gridCheck!.checked) {
            showGrid();
        } else {
            hideGrid();
        }
    })

    // survival - changes require restart
    survivalCheck.addEventListener('change', handleSurvival);

    if (gameManager.isMobile) {
        // use rot buttons?
        rotBtnsCheck.addEventListener('change', () => {
            if (rotBtnsCheck!.checked) {
                handleBtns(true, "rotate");
            } else {
                handleBtns(false, "rotate");
            }
        })

        // use movement buttons?
        mvmntBtnsCheck.addEventListener('change', () => {
            if (mvmntBtnsCheck!.checked) {
                handleBtns(true, "movement");
            } else {
                handleBtns(false, "movement");
            }
        })

        // use hard-drop?
        hardDropBtnCheck.addEventListener('change', () => {
            if (hardDropBtnCheck!.checked) {
                handleBtns(true, "hardDrop");
            } else {
                handleBtns(false, "hardDrop");
            }
        })

        // transparent buttons?
        transparentBtnsCheck.addEventListener('change', () => {
            if (transparentBtnsCheck!.checked) {
                handleBtns(true, "transparent");
            } else {
                handleBtns(false, "transparent");
            }
        })
    }
}

function handleSurvival() {
        if (survivalCheck!.checked) {
            gameManager.isSurvival = true;
        } else {
            gameManager.isSurvival = false;
        }
        toggleRestartBackBtn();
}

function toggleRestartBackBtn() {
    if (backBtn!.innerHTML == "Back") {
        backBtn!.innerHTML = "Restart";
        backBtn!.addEventListener("click", restartGame);
    } else {
        backBtn!.removeEventListener("click", restartGame);
        backBtn!.innerHTML = "Back";
    }
}

function showGrid() {
    const cells = document.querySelectorAll(".cell");
    cells.forEach(cell => {
        (cell as HTMLElement).classList.replace("cell-without-grid", "cell-with-grid"); 
    });
}

function hideGrid() {
    const cells = document.querySelectorAll(".cell");
    cells.forEach(cell => {
        (cell as HTMLElement).classList.replace("cell-with-grid", "cell-without-grid"); 
    });
}

function handleBtns(show: boolean, kind: "movement" | "rotate" | "hardDrop" | "transparent") {
    if (show) {
        switch (kind) {
            case "movement":
                moveLeftBtn!.style.display = "block";
                moveRightBtn!.style.display = "block";
                break;
            case "rotate":
                rotCWBtn!.style.display = "block";
                rotCCWBtn!.style.display = "block";
                break;
            case "hardDrop":
                hardDropBtn!.style.display = "block";
                break;
            case "transparent":
                moveLeftBtn!.style.backgroundColor = "rgba(0,0,0,0)";
                moveRightBtn!.style.backgroundColor = "rgba(0,0,0,0)";
                rotCWBtn!.style.backgroundColor = "rgba(0,0,0,0)";
                rotCCWBtn!.style.backgroundColor = "rgba(0,0,0,0)";
                hardDropBtn!.style.backgroundColor = "rgba(0,0,0,0)";
                break;
        }

    } else {
        switch (kind) {
            case "movement":
                moveLeftBtn!.style.display = "none";
                moveRightBtn!.style.display = "none";
                break;
            case "rotate":
                rotCWBtn!.style.display = "none";
                rotCCWBtn!.style.display = "none";
                break;
            case "hardDrop":
                hardDropBtn!.style.display = "none";
                break;
            case "transparent":
                moveLeftBtn!.style.backgroundColor = "rgba(33, 33, 200, 0.2)";
                moveRightBtn!.style.backgroundColor = "rgba(200, 33, 200, 0.2)";
                rotCWBtn!.style.backgroundColor = "rgba(33, 200, 33, 0.2)";
                rotCCWBtn!.style.backgroundColor = "rgba(200, 200, 33, 0.2)";
                hardDropBtn!.style.backgroundColor = "rgba(200, 33, 33, 0.2)";
                break;
        }

    }
}
// }}}

// add score {{{
function addScore() {
    let linesCleared = 0;

    // identifying rows
    let rowsToCheck = new Set<number>;
    tetrominos[currPiece][currRot].forEach( i => {
        rowsToCheck.add(Math.floor( (i+currPos) / 10 ));
    })

    // identifying rows to clean
    rowsToCheck.forEach( i => {
        let rowIndex = i*10;
        let row = [
            rowIndex,
            rowIndex+1,
            rowIndex+2,
            rowIndex+3,
            rowIndex+4,
            rowIndex+5,
            rowIndex+6,
            rowIndex+7,
            rowIndex+8,
            rowIndex+9
        ];

        if (row.every(index => squares[index].classList.contains('taken'))) {
            linesCleared++;

            // removing lines
            row.forEach( index => {
                squares[index].classList.remove('taken','tetrominos');
                squares[index].classList.remove(colorSet + 1, colorSet + 2, colorSet + 3);
                squares[index].classList.add('colorSet-Transparent');
            });

            // adding new lines at the top
            const squaresRemoved = squares.splice(rowIndex, width);
            squares = squaresRemoved.concat(squares);
            squares.forEach(cell => grid!.appendChild(cell));
        }
    })
    
    // Updating Lines and Score
    let comboText = "";
    switch (linesCleared) {
        case 0:
            comboNum = 0;
            if (comboDisplayMob) comboDisplayMob.innerHTML = "";
            if (comboDisplay) comboDisplay.innerHTML = "";
            return;
        case 1:
            comboNum++;
            backToBackNum = 0;
            gameManager.score += (singleScore + comboNum) * gameManager.level;
            break;
        case 2:
            comboNum++;
            backToBackNum = 0;
            gameManager.score += (doubleScore + comboNum) * gameManager.level;
            comboText = "Double!";
            break;
        case 3:
            comboNum++;
            backToBackNum = 0;
            gameManager.score += (tripleScore + comboNum) * gameManager.level;
            comboText = "Triple!";
            break
        case 4:
            comboNum++;
            backToBackNum++;
            gameManager.score += (tetrisScore + comboNum + backToBackNum) * gameManager.level;
            comboText = backToBackNum > 1 ? "Back To Back Tetris!" : "Tetris!";
            break;
    }

    linesToLevelUp += linesCleared
    gameManager.lines += linesCleared;

    // default display
    scoreDisplay!.innerHTML = gameManager.score.toString();
    linesDisplay!.innerHTML = gameManager.lines.toString();

    // combos
    if ((comboText != "" || comboNum > 1) && comboDisplay) {

        comboDisplay.innerHTML = `x${comboNum} ${comboText}`;
        setTimeout(comboDisplayReset, 3000);
    }

    if (!gameManager.isSurvival) {
        // level update
        if (linesToLevelUp >= 10) {
            linesToLevelUp -= 10;
            gameManager.level++;
            levelUpdate();
            colorUpdate();
            if (levelDisplay) {
                levelDisplay.innerHTML = gameManager.level.toString();
            }
        }
    }

    // mobile fullscreen display
    if (gameManager.isMobile) {
        // combos
        if (comboDisplayMob && comboDisplay) {
            comboDisplayMob.innerHTML = comboDisplay.innerHTML;
        }

        // lines
        if (linesDisplayMob) {
            linesDisplayMob.innerHTML = gameManager.lines.toString(); 
        }

        // score
        if (scoreDisplayMob) {
            scoreDisplayMob.innerHTML = gameManager.score.toString();
        }

        // level
        if (!gameManager.isSurvival && levelDisplayMob) {
            levelDisplayMob.innerHTML = gameManager.level.toString();
        }
    }
}

function levelUpdate() {
    let intervalValue = Math.max((-32 * (gameManager.level)) + 1032, 70);
    clearInterval(timerId);
    timerId = setInterval(moveDown, intervalValue);
}

function colorUpdate() {
    colorNum++;
    if (colorNum > 9) {
        colorNum = 0;
    }

    const newColorSet = "colorSet-" + colorNum + "-";

    for (let i = 1; i<4; i++) {
        let pieces = Array.from(document.getElementsByClassName(colorSet + i)); 
        pieces.forEach(index => {
            index.classList.replace(colorSet + i, newColorSet + i);
        })
    }

    colorSet = newColorSet;
}

function comboDisplayReset() {
    let comboNumTxt = "";
    if (comboNum >= 1) {
        comboNumTxt = `x${comboNum}`;

    }
    if (comboDisplayMob) {
        comboDisplayMob.innerHTML = comboNumTxt;
    } 

    if (comboDisplay) {
        comboDisplay.innerHTML = comboNumTxt;
    }
}
// }}}

// game over {{{
function gameOver() {
    if (curr.some(index => squares[currPos + index].classList.contains('taken'))) {
        gameManager.status = "GameOver";
        gameBtns!.style.display = "none";
        restartBtn!.style.display = "block";
        pauseBtn!.style.display = "none";
        lastScore!.textContent = "Score: " + gameManager.score;
        lastScore!.classList.add("gameOvTxt");
        gameMenu!.appendChild(lastScore!);
        lastLine!.textContent = "Lines: " + gameManager.lines;
        lastLine!.classList.add("gameOvTxt");
        gameMenu!.appendChild(lastLine!);
        menuTxt!.innerText = "Game Over";
        if (mobInstr) {
            mobInstr!.style.display = "none";
        }
        gameMenu!.style.display = "block";
        clearInterval(timerId);
        if (!gameManager.isMobile) {
            document.removeEventListener('keydown', controlDown);
        }
    }
}
// }}}
