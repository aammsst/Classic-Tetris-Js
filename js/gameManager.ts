let gameMenu: HTMLElement | null;
let gMenuTxt: HTMLElement | null;
let grid: HTMLElement | null;
let miniGridMob: HTMLElement | null;
let squares: HTMLElement[];
let lastLine: HTMLElement | null;
let lastScore: HTMLElement | null;
let lines: HTMLElement | null;
let startBtn: HTMLElement | null;
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

enum gameStatus {
    Unstarted,
    Started,
    GameOver,
    Paused,
}

type game = {
    stat: gameStatus;
    score: number;
    lines: number;
}

let gameMan: game = {
    stat: gameStatus.Unstarted,
    score: 0,
    lines: 0,
}

document.addEventListener('DOMContentLoaded',() => {
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

    // mobile detect
    if (navigator.maxTouchPoints > 0 &&
       window.innerWidth < window.innerHeight) {
        (document.querySelector(".instructions") as HTMLElement).style.display="none";

        // generate btns for mobile
        btns.classList.add("mobBtns");
        btns.innerHTML += `
            <button id="start-button" type="button" class="btn">Start</button>
            <button id="pause-button" type="button" class="btn">Pause</button>
            <button id="restart-button" type="button" class="btn">Restart</button>
            <button id="fullscreen-button" type="button" class="btn" hidden="true">FullScreen</button>
        `;

        gameMenu!.appendChild(btns);
        startBtn = document.getElementById("start-button");
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
            <button id="pause-button" type="button" class="btn">Pause</button>
            <button id="restart-button" type="button" class="btn">Restart</button>
            <button id="fullscreen-button" type="button" class="btn" hidden="true">FullScreen</button>
        `;
        leftCont!.appendChild(btns);

        startBtn = document.getElementById("start-button");
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

// start fn {{{
function startGame() {
    gameMan.stat = gameStatus.Started;
    gameMenu!.style.display = "none";
    document.addEventListener('keydown',control);
    document.addEventListener('keyup',controlR);
    grid!.addEventListener("touchstart",mobileMoveStart)
    grid!.addEventListener("touchend",mobileMoveEnd)
    timerId = setInterval(moveDown, 500);
    nextRandom = getNextRand();
    draw();
    displayShape();
    displayShapeMob();
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
    document.addEventListener('keydown',control);
    document.addEventListener('keyup',controlR);
    grid!.addEventListener("touchstart",mobileMoveStart)
    grid!.addEventListener("touchend",mobileMoveEnd)
    timerId = setInterval(moveDown, 500);
    nextRandom = getNextRand();
    score = 0;
    scoreDisplay!.innerHTML = score.toString();
    lineCounter = 0;
    lines!.innerHTML = lineCounter.toString();
    if (gameMan.stat == gameStatus.GameOver) {
        gameMenu!.style.display = "none";
        gameMenu!.removeChild(lastLine!);
        gameMenu!.removeChild(lastScore!);
    }
    gameMan.stat = gameStatus.Started;
    reset();
    displayShape();
    draw();
    restartBtn!.style.display = "none";
}
// }}}

// pause fn {{{
function togglePause() {
    if (gameMan.stat != gameStatus.GameOver && timerId && grid) {
        // pause
        gameMan.stat = gameStatus.Paused;
        clearInterval(timerId);
        document.removeEventListener('keyup',controlR);
        document.removeEventListener('keydown',control);
        grid!.removeEventListener("touchstart",mobileMoveStart);
        grid!.removeEventListener("touchend",mobileMoveEnd);
        timerId = 0;
        pauseBtn!.innerText = "Continue";
        gMenuTxt!.innerText = "-- Pause --";
        gameMenu!.style.display = "block";
        restartBtn!.style.display = "block";
    } else {
        // unpause
        gameMan.stat = gameStatus.Started;
        gameMenu!.style.display = "none";
        restartBtn!.style.display = "none";
        draw();
        document.addEventListener('keydown',control);
        document.addEventListener('keyup',controlR);
        grid!.addEventListener("touchstart",mobileMoveStart)
        grid!.addEventListener("touchend",mobileMoveEnd)
        timerId = setInterval(moveDown, 500);
        pauseBtn!.innerText = "Puase";
    }
}
// }}}

// add score {{{
function addScore() {
    for(let i = 0; i < 249; i += width) {
        // single, double, and triple detector
        let row = [i, i+1, i+2, i+3, i+4, i+5, i+6, i+7, i+8, i+9];

        // tetris (four lines) detector
        let tetrisRow = [i, i+1, i+2, i+3, i+4, i+5, i+6, i+7, i+8, i+9,
            i+width, i+width+1, i+width+2, i+width+3, i+width+4, i+width+5, i+width+6, i+width+7, i+width+8, i+width+9,
        i+width*2, i+width*2+1, i+width*2+2, i+width*2+3, i+width*2+4, i+width*2+5, i+width*2+6, i+width*2+7, i+width*2+8, i+width*2+9,
        i+width*3, i+width*3+1, i+width*3+2, i+width*3+3, i+width*3+4, i+width*3+5, i+width*3+6, i+width*3+7, i+width*3+8, i+width*3+9];

        if (i<211 && tetrisRow.every(index => squares[index].classList.contains('taken'))) {
            // tetris score
            score += 60;
            scoreDisplay!.innerHTML = score.toString();
            lineCounter += 4;
            lines!.innerHTML = lineCounter.toString();
            // removing lines
            tetrisRow.forEach(index => {
                squares[index].classList.remove('taken','tetrominos');
                squares[index].style.backgroundColor = '';
                squares[index].style.borderColor = '';
            })
            // adding new lines at the top
            const squaresRemoved = squares.splice(i, width*4);
            squares = squaresRemoved.concat(squares);
            squares.forEach(cell => grid!.appendChild(cell));
        } else if (row.every(index => squares[index].classList.contains('taken'))) {
            // single, double and triple scores
            score += 10;
            scoreDisplay!.innerHTML = score.toString();
            lineCounter += 1;
            lines!.innerHTML = lineCounter.toString();
            // removing lines
            row.forEach(index => {
                squares[index].classList.remove('taken','tetrominos');
                squares[index].style.backgroundColor = '';
                squares[index].style.borderColor = '';
            })
            // adding new lines at the top
            const squaresRemoved = squares.splice(i, width);
            squares = squaresRemoved.concat(squares);
            squares.forEach(cell => grid!.appendChild(cell));
        }
    }
}
// }}}

// game over {{{
function gameOver() {
    if (curr.some(index => squares[currPos + index].classList.contains('taken'))) {
        gameMan.stat = gameStatus.GameOver;
        restartBtn!.style.display = "block";
        pauseBtn!.style.display = "none";
        lastScore!.textContent = "Score: " + score;
        lastScore!.classList.add("gameOvTxt");
        gameMenu!.appendChild(lastScore!);
        lastLine!.textContent = "Lines: " + lineCounter;
        lastLine!.classList.add("gameOvTxt");
        gameMenu!.appendChild(lastLine!);
        gMenuTxt!.innerText = "Game Over";
        if (mobInstr) {
            mobInstr!.style.display = "none";
        }
        gameMenu!.style.display = "block";
        clearInterval(timerId);
        document.removeEventListener('keydown',control);
        document.removeEventListener('keyup',controlR);
    }
}
// }}}
