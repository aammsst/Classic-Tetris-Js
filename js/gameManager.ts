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
let scoreDisplay: HTMLElement | null;
let displaySq: HTMLElement[];
let displaySqMob: HTMLElement[];
let gridCont: HTMLElement | null;
let leftCont: HTMLElement | null;
let buttons: HTMLElement[] | null;
let fullSBtn: HTMLElement | null;
let mobInstr: HTMLElement | null = null;

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
    let optionsBtns = document.createElement("DIV");

    // mobile detect
    if (navigator.maxTouchPoints > 0 &&
       window.innerWidth < window.innerHeight) {
        (document.querySelector(".instructions") as HTMLElement).style.display="none";

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

        optionsBtns.classList.add("mobBtns");
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

        mobileEvents();

    } else {
        // generate btns for web browser
        btns.classList.add("buttons");
        btns.innerHTML += `
            <button id="start-button" type="button" class="btn">Start</button>
            <button id="options-button" type="button" class="btn">Options</button>
            <button id="pause-button" type="button" class="btn">Pause</button>
            <button id="restart-button" type="button" class="btn">Restart</button>
            <button id="fullscreen-button" type="button" class="btn" hidden="true">FullScreen</button>
        `;
        leftCont!.appendChild(btns);

        startBtn = document.getElementById("start-button");
        optionsBtn = document.getElementById("options-button");
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
}
// }}}

let setTimerID = () => {
    timerId = setInterval(moveDown, 500);
}

// start fn {{{
function startGame() {
    gameManager.status = "Started";
    gameMenu!.style.display = "none";
    if (gameManager.isMobile) {
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
    } else {
        // unpause
        gameManager.status = "Started";
        gameMenu!.style.display = "none";
        restartBtn!.style.display = "none";
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
    gameMenu!.style.display = "none";
    restartBtn!.style.display = "none";
    startBtn!.style.display = "none";
    optionsBtn!.style.display = "none";
    backBtn!.style.display = "block";
    optionsMenu!.style.display = "block";
}

function hideOptions() {
    if (gameManager.status == "Paused") {
        gameMenu!.style.display = "block";
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
