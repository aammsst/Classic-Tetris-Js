let pause: HTMLElement | null;
let start: HTMLElement | null;
let gameOv: HTMLElement | null;
let grid: HTMLElement | null;
let squares: HTMLElement[];
let lastLine: HTMLElement | null;
let lastScore: HTMLElement | null;
let lines: HTMLElement | null;
let startBtn: HTMLElement | null;
let pauseBtn: HTMLElement | null;
let restartBtn: HTMLElement | null;
let scoreDisplay: HTMLElement | null;
let displaySq: HTMLElement[];

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

    // start button {{{
    if (startBtn && grid) {
        startBtn.addEventListener('click', ()=>{
            // start game
            gameMan.stat = gameStatus.Started;
            draw();
            start!.style.display = "none";
            document.addEventListener('keydown',control);
            document.addEventListener('keyup',controlR);
            grid!.addEventListener("touchstart",mobileMoveStart)
            grid!.addEventListener("touchend",mobileMoveEnd)
            timerId = setInterval(moveDown, 500);
            nextRandom = Math.floor(Math.random()*tetrominos.length);
            displayShape();
            pauseBtn!.style.display = "block";
            startBtn!.style.display = "none";
        });
    }
    // }}}

    // pause btn {{{
    if (pauseBtn) {
        pauseBtn.addEventListener('click', ()=>{
            if (gameMan.stat != gameStatus.GameOver && timerId && grid) {
                gameMan.stat = gameStatus.Paused;
                clearInterval(timerId);
                document.removeEventListener('keyup',controlR);
                document.removeEventListener('keydown',control);
                grid!.removeEventListener("touchstart",mobileMoveStart);
                grid!.removeEventListener("touchend",mobileMoveEnd);
                timerId = 0;
                pauseBtn!.innerText = "Continue";
                pause!.style.display = "block";
                restartBtn!.style.display = "block";
            } else {
                gameMan.stat = gameStatus.Started;
                pause!.style.display = "none";
                restartBtn!.style.display = "none";
                draw();
                document.addEventListener('keydown',control);
                document.addEventListener('keyup',controlR);
                grid!.addEventListener("touchstart",mobileMoveStart)
                grid!.addEventListener("touchend",mobileMoveEnd)
                timerId = setInterval(moveDown, 500);
                pauseBtn!.innerText = "Puase";
            }
        })
    }
    // }}}

    // restartBtn {{{
    if (restartBtn) {
        restartBtn.addEventListener('click', ()=>{
            pause!.style.display = "none";
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
            nextRandom = Math.floor(Math.random()*tetrominos.length);
            score = 0;
            scoreDisplay!.innerHTML = score.toString();
            lineCounter = 0;
            lines!.innerHTML = lineCounter.toString();
            if (gameMan.stat == gameStatus.GameOver) {
                gameOv!.style.display = "none";
                gameOv!.removeChild(lastLine!);
                gameOv!.removeChild(lastScore!);
            }
            gameMan.stat = gameStatus.Started;
            reset();
            displayShape();
            draw();
            restartBtn!.style.display = "none";
        })
    }
    // }}}
});

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
};
// }}}

// game over {{{
function gameOver() {
    if (current.some(index => squares[initialPos + index].classList.contains('taken'))) {
        gameMan.stat = gameStatus.GameOver;
        restartBtn!.style.display = "block";
        pauseBtn!.style.display = "none";
        lastScore!.textContent = "Score: " + score;
        lastScore!.classList.add("gameOvTxt");
        gameOv!.appendChild(lastScore!);
        lastLine!.textContent = "Lines: " + lineCounter;
        lastLine!.classList.add("gameOvTxt");
        gameOv!.appendChild(lastLine!);
        gameOv!.style.display = "block";
        clearInterval(timerId);
        document.removeEventListener('keydown',control);
        document.removeEventListener('keyup',controlR);
    }
};
// }}}
