let moveStartX: number, moveEndX: number, moveStartY: number, moveEndY: number;

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
    if (sx - ex > 30){
        rotateCW();
    } else if (sx - ex < -30){
        rotateCCW();
    } else if (ey - sy > 30){
        softDrop();
    } else {
        mobileHMove(col);
    }
}

function mobileHMove(col: number) {
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
    } else {
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
        fullSBtn!.innerText = "Exit FullScreen";
        gridCont!.requestFullscreen()
        .then(() => {
            // set grid and menues dimensions
            gridToFS();
            menusToFS();
            // display next on full screen
            miniGridMob!.style.display = "flex";
            displayShapeMob();
            window.history.pushState({page: 1}, 'Full Screen')
        })
        .catch(er => {
            console.log(er);
        })
    } else {
        exitFS();
        fullSBtn!.innerText = "FullScreen";
        miniGridMob!.style.display = "none";
        document.exitFullscreen();
    }
}

function gridToFS() {
    grid!.style.height = "100%";
    // new height in px
    let h = window.innerHeight;
    // initial height = 500px
    // initial width = 200px
    let w = (h * 200) / 500;
    grid!.style.width = w + "px";
}

function exitFS() {
    grid!.style.height = "500px";
    grid!.style.width = "200px";
    gameMenu!.classList.remove("gameMenuFS");
    gameMenu!.classList.add("gameMenu");
}

function menusToFS() {
    gameMenu!.classList.remove("gameMenu");
    gameMenu!.classList.add("gameMenuFS");
}

function displayShapeMob() {

    if (gameMan.stat != gameStatus.Started) {
        return;
    }

    displaySqMob.forEach(square => {
        square.classList.remove('tetrominos');
        square.style.backgroundColor = '';
        square.style.borderColor = '';
    })
    upNextTetrominoes[nextIdx].forEach(index => {
        displaySqMob[displayIndex + index].classList.add('tetrominos');
        displaySqMob[displayIndex + index].style.backgroundColor = colors[nextIdx];
        displaySqMob[displayIndex + index].style.borderColor = colors[nextIdx];
    })
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
