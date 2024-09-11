let moveStartX: number, moveEndX: number, moveStartY: number, moveEndY: number;

function getX(e: TouchEvent) {
    let col = e.changedTouches[0].target as HTMLElement;
    // console.log("target: ", col.getAttribute("col"));
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
};
// when touch ends, takes the X value
function mobileMoveEnd(e: TouchEvent) {
    e.preventDefault();
    moveEndX = e.changedTouches[0].clientX;
    moveEndY = e.changedTouches[0].clientY;
    let col = e.changedTouches[0].target as HTMLElement;
    let intCol = parseInt(col.getAttribute("col")!);
    moveDetec(moveStartX,moveEndX,moveStartY,moveEndY, intCol);
};

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
    // } else { rotateCW(); }
}

function mobileHMove(col: number) {
    let i = 0;
    let actualPos = (initialPos + 1) % 10;
    // console.log("initialPos: ", actualPos, "; col: ", col);
    if (actualPos > col) {
        if (col == 0) {
            fullLeft();
            return;
        }
        while (actualPos > col && i < 10) {
            i++;
            moveLeft();
            actualPos = (initialPos + 1) % 10;
        }
    } else {
        if (col == 9) {
            fullRight();
            return;
        }
        while (actualPos < col && i < 10) {
            i++;
            moveRight();
            actualPos = (initialPos + 1) % 10;
        }
    }
}
