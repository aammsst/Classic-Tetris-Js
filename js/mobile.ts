let moveStartX: number, moveEndX: number, moveStartY: number, moveEndY: number;
let sensibility = 50;

function getX(e: TouchEvent) {
    let col = e.changedTouches[0].target as HTMLElement;
    let a = parseInt(col.getAttribute("col")!);
    mobileHMove(a);
}

// when touch starts, takes the X value
function mobileMoveStart(e: TouchEvent) {
    e.preventDefault();
    // getX(e);
    moveStartX = e.changedTouches[0].clientX;
    moveStartY = e.changedTouches[0].clientY;
    // return moveStartY;
}
// when touch ends, takes the X value
function mobileMoveEnd(e: TouchEvent) {
    e.preventDefault();
    moveEndX = e.changedTouches[0].clientX;
    moveEndY = e.changedTouches[0].clientY;
    let col = e.changedTouches[0].target as HTMLElement;
    let intCol = parseInt(col.getAttribute("col")!);
    moveDetec(moveStartX,moveEndX,moveStartY,moveEndY, intCol);
}

// s=Start, e=End
function moveDetec(sx: number, ex: number, sy: number, ey: number, col: number) {
    if (sx - ex > sensibility){
        rotateCW();
    } else if (sx - ex < -sensibility){
        rotateCCW();
    } else if (ey - sy > sensibility){
        softDrop();
    } else if (ey - sy < -sensibility){
        togglePause();
    } else {
        mobileHMove(col);
    }
}

function mobileHMove(col: number) {
    let i = 0;
    let correction = 1;
    switch (currPiece) {
        // exceptions on the position of the first block on the left
        case 0:
            // l
            if (currRot == 3)
                correction = 2;
            break;
        case 1:
            // z
            if (currRot == 1 || currRot == 3)
                correction = 2;
            break;
        case 3:
            // i
            if (currRot == 1)
                correction = 3;
            
            if (currRot == 3)
                correction = 2;

            break;
        case 4:
            // t
            if (currRot == 3)
                correction = 2;
            break;
        case 5:
            // s
            if (currRot == 1 || currRot == 3)
                correction = 2;
            break;
        case 6:
            // j
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
        } while (actualPos > col && i < 10)
    } else {
        do {
            i++;
            moveRight();
            actualPos = (currPos + correction) % 10;
        } while (actualPos < col && i < 10);
    }
}

// btns das
function moveRightDas() {
    if (!rightPressed || leftPressed) {
        clearTimeout(dasTimeout);
        return;
    }

    if (!dasCharged) {
        const tmpPos = currPos;
        moveRight();
        if (tmpPos == currPos) {
            // piece on edge or borders
            dasCharged = true;
        }
        dasTimeout = setTimeout(moveRightDas, dasSlow);
        dasCharged = true;
    } else {
        moveRight();
        dasTimeout = setTimeout(moveRightDas, dasFast);
    }
}

function moveLeftDas() {
    if (!leftPressed || rightPressed) {
        clearTimeout(dasTimeout);
        return;
    }

    if (!dasCharged) {
        const tmpPos = currPos;
        moveLeft();
        if (tmpPos == currPos) {
            // piece on edge or borders
            dasCharged = true;
        }
        dasTimeout = setTimeout(moveLeftDas, dasSlow);
        dasCharged = true;
    } else {
        moveLeft();
        dasTimeout = setTimeout(moveLeftDas, dasFast);
    }
}


function toggleFS() {
    if (!document.fullscreenElement) {
        fullSBtn!.innerText = "Exit FullScreen";
        gridCont!.requestFullscreen()
        .then(() => {
            // set grid and menues dimensions
            gridToFS();
            gameBtns!.classList.replace("in-game-btn-container", "in-game-btn-container-FS");
            gameMenu!.classList.replace("gameMenu", "gameMenuFS");
            optionsMenu!.classList.replace("gameMenu", "gameMenuFS");
            // display next on full screen
            miniGridMob!.style.display = "flex";
            displayShapeMob();
            // display info
            infoMob!.style.display = "flex";
            window.history.pushState({page: 1}, 'Full Screen')
        })
        .catch(er => {
            console.log(er);
        })
    } else {
        exitFS();
        fullSBtn!.innerText = "FullScreen";
        miniGridMob!.style.display = "none";
        infoMob!.style.display = "none";
        document.exitFullscreen();
    }
}

function gridToFS() {
    grid!.style.height = "100%";

    // new height in px
    const h = window.innerHeight;
    // initial height = 500px
    // initial width = 200px
    const w = (h * 200) / 500;
    grid!.style.width = w + "px";

    // in-game buttons
    // initial height = 60px
    // initial width = 50% = 100px
    const inGameBtnsFSheight = ((60 * h) / 500) 
    moveLeftBtn!.style.height = inGameBtnsFSheight + "px";
    moveRightBtn!.style.height = inGameBtnsFSheight + "px";
    rotCWBtn!.style.height = inGameBtnsFSheight + "px";
    rotCCWBtn!.style.height = inGameBtnsFSheight + "px"; 
    hardDropBtn!.style.height = inGameBtnsFSheight + "px"; 
    hardDropBtn!.style.bottom = -inGameBtnsFSheight + "px"; 
}

function exitFS() {
    grid!.style.height = "500px";
    grid!.style.width = "200px";
    moveLeftBtn!.style.height = "60px";
    moveRightBtn!.style.height = "60px";
    rotCWBtn!.style.height = "60px";
    rotCCWBtn!.style.height = "60px"; 
    hardDropBtn!.style.height = "60px"; 
    hardDropBtn!.style.bottom = "-60px"; 
    gameBtns!.classList.replace("in-game-btn-container-FS", "in-game-btn-container");
    gameMenu!.classList.replace("gameMenuFS", "gameMenu");
    optionsMenu!.classList.replace("gameMenuFS", "gameMenu");
}

function displayShapeMob() {

    if (gameManager.status != "Started") {
        return;
    }

    // undraw current piece
    resetDisplayShapeMob();

    // draw next piece
    let nextColor: string;
    switch (nextPiece) {
        case 0:
        case 1:
            nextColor = colorSet + 1;
            break;
        case 2:
        case 3:
        case 4:
            nextColor = colorSet + 2;
            break;
        case 5:
        case 6:
            nextColor = colorSet + 3;
            break;
    }

    upNextTetrominoes[nextPiece].forEach(index => {
        displaySqMob[displayIndex + index].classList.add('tetrominos', nextColor);
    })
}

function resetDisplayShapeMob() {
    displaySqMob.forEach(square => {
        square.classList.remove('tetrominos', colorSet + 1, colorSet + 2, colorSet + 3);
    })
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
