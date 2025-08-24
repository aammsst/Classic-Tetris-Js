let gameMenu: HTMLElement | null;
let menuTxt: HTMLElement | null;
let optionsMenu: HTMLElement | null;
let optionsTxt: HTMLElement | null;

let grid: HTMLElement | null;
let miniGridMob: HTMLElement | null;
let squares: HTMLElement[];
let lastLine: HTMLElement | null;
let lastScore: HTMLElement | null;
let lines: HTMLElement | null;

let startBtn: HTMLElement | null;
let optionsBtn: HTMLElement | null;
let backBtn: HTMLElement | null;
let pauseBtn: HTMLElement | null;
let restartBtn: HTMLElement | null;
let gameBtns: HTMLElement | null;

let scoreDisplay: HTMLElement | null;
let displaySq: HTMLElement[];
let displaySqMob: HTMLElement[];
let gridCont: HTMLElement | null;
let leftCont: HTMLElement | null;

let buttons: HTMLElement[] | null;
let fullSBtn: HTMLElement | null;
let mobInstr: HTMLElement | null = null;

// in game mobile buttons
let moveLeftBtn: HTMLElement | null;
let moveRightBtn: HTMLElement | null;
let hardDropBtn: HTMLElement | null;
let rotCWBtn: HTMLElement | null; // clockwise
let rotCCWBtn: HTMLElement | null; // counter-clockwise
let movementPressed = false;
let dasCharged = false;
const dasFast = 100;
const dasSlow = 500;

const singleScore = 10;
const doubleScore = 25;
const tripleScore = 40;
const tetrisScore = 80;

type gameStatus = "Unstarted" | "Started" | "GameOver" | "Paused";

type game = {
    status: gameStatus;
    isMobile: boolean;
    score: number;
    lines: number;
}

let gameManager: game = {
    status: "Unstarted",
    isMobile: false,
    score: 0,
    lines: 0,
}

document.addEventListener('DOMContentLoaded',() => {
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

        gameBtns.style.display = "none";

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
            loadOptions();
            showOptions();
        });
    }

    // in options btn
    if (backBtn && grid) {
        backBtn.addEventListener("click", () => {
            hideOptions();
        });
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
        moveRightBtn.addEventListener('touchstart', () => {
            movementPressed = true;
            moveDas(moveRight);
        })
        moveRightBtn.addEventListener('touchend', () => {
            dasCharged = false;
            movementPressed = false;
        })
        moveRightBtn.addEventListener('touchcancel', e => {
            e.preventDefault();
        })
        moveRightBtn.addEventListener('touchmove', e => {
            e.preventDefault();
        })
    }

    if (moveLeftBtn) {
        moveLeftBtn.addEventListener('touchstart', () => {
            movementPressed = true;
            moveDas(moveLeft);
        })
        moveLeftBtn.addEventListener('touchend', () => {
            dasCharged = false;
            movementPressed = false;
        })
        moveLeftBtn.addEventListener('touchcancel', e => {
            e.preventDefault();
        })
        moveLeftBtn.addEventListener('touchmove', e => {
            e.preventDefault();
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

let setTimerID = () => {
    timerId = setInterval(moveDown, 500);
}

// start fn {{{
function startGame() {
    gameManager.status = "Started";
    gameMenu!.style.display = "none";
    optionsBtn!.style.display = "none";
    if (gameManager.isMobile) {
        gameBtns!.style.display = "block";
        grid?.addEventListener("touchstart",mobileMoveStart)
        grid?.addEventListener("touchend",mobileMoveEnd)
    } else {
        document.addEventListener('keydown',control);
        document.addEventListener('keyup',controlR);
    }
    timerId = setInterval(moveDown, 500);
    reset();
    displayShape();
    displayShapeMob();
    draw();
    pauseBtn!.style.display = "block";
    startBtn!.style.display = "none";
}
// }}}

// restart fn {{{
function restartGame() {
    gameMenu!.style.display = "none";
    gameBtns!.style.display = "block";
    optionsBtn!.style.display = "none";
    if (mobInstr) {
        mobInstr.style.display = "flex";
    }
    pauseBtn!.innerText = "Puase";
    for(let i = 0; i < 250; i++) {
        squares[i].classList.remove("tetrominos","taken");
        squares[i].style.backgroundColor = '';
        squares[i].style.borderColor = '';
    }
    pauseBtn!.style.display = "block";
    if (gameManager.isMobile) {
        grid?.addEventListener("touchstart",mobileMoveStart)
        grid?.addEventListener("touchend",mobileMoveEnd)
    } else {
        document.addEventListener('keydown',control);
        document.addEventListener('keyup',controlR);
    }
    timerId = setInterval(moveDown, 500);
    gameManager.score = 0;
    scoreDisplay!.innerHTML = gameManager.score.toString();
    gameManager.lines = 0;
    lines!.innerHTML = gameManager.lines.toString();
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
            document.removeEventListener('keyup',controlR);
            document.removeEventListener('keydown',control);
        }
        timerId = 0;
        pauseBtn!.innerText = "Continue";
        menuTxt!.innerText = "-- Pause --";
        gameMenu!.style.display = "block";
        restartBtn!.style.display = "block";
        optionsBtn!.style.display = "block";
        backBtn!.style.display = "none";
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
            document.addEventListener('keydown',control);
            document.addEventListener('keyup',controlR);
        }
        timerId = setInterval(moveDown, 500);
        pauseBtn!.innerText = "Puase";
    }
}
// }}}

// options {{{

function showOptions() {
    // show options
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
    if (gameManager.status == "Paused") {
        gameMenu!.style.display = "block";
        pauseBtn!.style.display = "block";
        restartBtn!.style.display = "block";
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
    const gridCheck = document.getElementById("grid-check-box") as HTMLInputElement;

    gridCheck.addEventListener('change', () => {
        if (gridCheck!.checked) {
            showGrid();
        } else {
            hideGrid();
        }
    })

    if (gameManager.isMobile) {
        // use rot buttons?
        const rotCheck = document.getElementById("use-rot-check-box") as HTMLInputElement;

        rotCheck.addEventListener('change', () => {
            if (rotCheck!.checked) {
                handleBtns(true, "rotate");
            } else {
                handleBtns(false, "rotate");
            }
        })

        // use movement buttons?
        const movementCheck = document.getElementById("use-mov-check-box") as HTMLInputElement;

        movementCheck.addEventListener('change', () => {
            if (movementCheck!.checked) {
                handleBtns(true, "movement");
            } else {
                handleBtns(false, "movement");
            }
        })

        // use hard-drop?
        const hardCheck = document.getElementById("use-hard-drop-check-box") as HTMLInputElement;

        hardCheck.addEventListener('change', () => {
            if (hardCheck!.checked) {
                handleBtns(true, "hardDrop");
            } else {
                handleBtns(false, "hardDrop");
            }
        })

        // transparent buttons?
        const transparentCheck = document.getElementById("transparent-check-box") as HTMLInputElement;

        transparentCheck.addEventListener('change', () => {
            if (transparentCheck!.checked) {
                handleBtns(true, "transparent");
            } else {
                handleBtns(false, "transparent");
            }
        })
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
                squares[index].style.backgroundColor = '';
                squares[index].style.borderColor = '';
            });

            // adding new lines at the top
            const squaresRemoved = squares.splice(rowIndex, width);
            squares = squaresRemoved.concat(squares);
            squares.forEach(cell => grid!.appendChild(cell));
        }
    })
    
    // Updating Lines and Score
    // TODO: combos
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
    scoreDisplay!.innerHTML = gameManager.score.toString();
    lines!.innerHTML = gameManager.lines.toString();
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
            document.removeEventListener('keydown',control);
            document.removeEventListener('keyup',controlR);
        }
    }
}
// }}}
