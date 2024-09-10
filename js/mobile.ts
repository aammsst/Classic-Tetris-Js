let moveStartX: number, moveEndX: number, moveStartY: number, moveEndY: number;

// when touch starts, takes the X value
function mobileMoveStart(e: TouchEvent) {
    e.preventDefault();
    moveStartX = e.changedTouches[0].clientX;
    moveStartY = e.changedTouches[0].clientY;
    return moveStartY;
};
// when touch ends, takes the X value
function mobileMoveEnd(e: TouchEvent) {
    e.preventDefault();
    moveEndX = e.changedTouches[0].clientX;
    moveEndY = e.changedTouches[0].clientY;
    moveDetec(moveStartX,moveEndX,moveStartY,moveEndY);
};
// s=Start, e=End
function moveDetec(sx: number,ex: number,sy: number,ey: number) {
    if (sx - ex > 200) {
        moveLeft();
        moveLeft();
        moveLeft();
        moveLeft();
    } else if (sx - ex > 150){
        moveLeft();
        moveLeft();
        moveLeft();
    } else if (sx - ex > 100){
        moveLeft();
        moveLeft();
    } else if (sx - ex > 30){
        moveLeft();
    } else if (sx - ex < -200) {
        moveRight();
        moveRight();
        moveRight();
        moveRight();
    } else if (sx - ex < -150){
        moveRight();
        moveRight();
        moveRight();
    } else if (sx - ex < -100){
        moveRight();
        moveRight();
    } else if (sx - ex < -30){
        moveRight();
    } else if (ey - sy > 150){
        moveDown();
        moveDown();
        moveDown();
        moveDown();
        moveDown();
        moveDown();
        moveDown();
        moveDown();
    } else if (ey - sy > 100){
        moveDown();
        moveDown();
        moveDown();
        moveDown();
        moveDown();
        moveDown();
    } else if (ey - sy > 30){
        moveDown();
        moveDown();
        moveDown();
        moveDown();
    } else { rotateCW(); }
}
