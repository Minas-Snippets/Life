/*
 * global variables
 */
const dotColour      = '#45c234';
const diedColour     = '#aa0000';
const bornColour     = '#ffffff';
const gridColour     = '#454545';
const clearColour    = '#000000';

const targetDotSize = 10;

var eMenu, 
    eCounter = null, 
    eCanvas  = null, 
    ctx      = null,
    canvasW, canvasH, canvasM, canvasF, drawMode, multitouch, fullScreen,
    canvasScale = 1,
    ww, wh, wMin,
    generation  = 0,
    geometryHorizontal = false,
    canvasCreated      = false,
    dotSize,
    cM, cN, cX, cY,
    c = 0;
    
var lastEvent = [ ]; // time, type, multitouch, locX, locY
var currEvent = [ ];

const initLevel = 0;
const voidLevel = 3;
const drawLevel = 4;
const genLevel  = 5;
const endLevel  = 6;

var runLevel = initLevel;
    
function initConway() {
    eCanvas = document.getElementById('canvas');
    ctx = eCanvas.getContext("2d");
        
    detectGeometry();
    setCanvasSize();
    initWorld();

    ctx.fillStyle = dotColour;

    document.addEventListener('touchstart',penTouchStart);
    document.addEventListener('touchend',  penTouchEnd);
    document.addEventListener('touchmove', penTouchMove);
    document.addEventListener('mousedown', penMouseStart);
    document.addEventListener('mouseup',   penMouseEnd);
    document.addEventListener('mousemove', penMouseMove);
    
//     eMenu   = document.getElementById('genCounter');
//     document.getElementById("greeting").classList.add("shrink");
//     runLevel = voidLevel;
}

function initWorld() {
    a.length   = 0;
    generation = 0;
    dotSize    = targetDotSize;
    cX         = 0;
    cY         = 0;
    setCanvasSize();
    ctx.clearRect(0,0,canvasW,canvasH);
    ctx.strokeStyle = dotColour;
    ctx.fillStyle = dotColour;
    ctx.font        = canvasF + "px Sans";
    ctx.textAlign   = "center";
    ctx.font        = 1.25*canvasF + "px Sans";
    ctx.fillText("Conway's Game of Life", canvasW/2, 2*canvasF);
    ctx.font        = canvasF + "px Sans";
    ctx.fillText("Draw a shape and press ▶ to start", canvasW/2, 5*canvasF);
    ctx.fillText("Press '?' for more information", canvasW/2, 7*canvasF);

    drawMode   = true;
    runLevel   = voidLevel;
    multitouch = false;
    fullScreen = false;
    lastEvent.length = 0;
    document.body.classList.add('init');
}

function initConway() {
    eCanvas = document.getElementById('canvas');
    eCounter = document.getElementById('counter');
    ctx = eCanvas.getContext("2d");
    
    detectGeometry();
    setCanvasSize();
    initWorld();

    ctx.fillStyle = dotColour;
    drawGame();
    document.addEventListener('touchstart',penTouchStart);
    document.addEventListener('touchend',penTouchEnd);
    document.addEventListener('touchmove',penTouchMove);
    document.addEventListener('mousedown',penMouseStart);
    document.addEventListener('mouseup',penMouseEnd);
    document.addEventListener('mousemove',penMouseMove);
    
    eMenu   = document.getElementById('genCounter');
    runLevel = voidLevel;
}

function rescale() {
    detectGeometry();
    setCanvasSize();
}


function detectGeometry() {
    ww = window.innerWidth;
    wh = window.innerHeight;
    wMin = Math.min(ww,wh);
    if(ww > wh) {
        geometryHorizontal = true;
        document.body.classList.add('horizontal');
    } else {
        geometryHorizontal = false;
        document.body.classList.remove('horizontal');
    }
}

function setCanvasSize() {
    canvasW  = eCanvas.clientWidth;
    canvasH  = eCanvas.clientHeight;
    canvasM  = canvasW < canvasH ? canvasW : canvasH;
    canvasF  = canvasM < 480 ? 16 : canvasM < 640 ? 24 : canvasM < 720 ? 30 : canvasM < 1080 ? 40 : 50;
    ctx.font = canvasF + "px Sans";
    if(!canvasCreated) {
        canvasScale = 1;    
        canvasCreated = true;
    }
    cM = canvasW/(2*dotSize);
    cN = canvasH/(2*dotSize);
    eCanvas.setAttribute("width", canvasW);
    eCanvas.setAttribute("height",canvasH);
}

function rescale() {
    detectGeometry();
    setCanvasSize();
}

function zoom(f) {
    if(f == 0 || f == 1) return;
    dotSize *= f;
    cX += cM*(1 - 1/f)/2;
    cY += cN*(1 - 1/f)/2;
    cM /= f;
    cN /= f;
}

const zoomIn  = () => zoom(1.25);

const zoomOut = () => zoom( 0.8);

function gameMove(x,y) {
    cX -= x/(2*dotSize);
    cY -= y/(2*dotSize);
}

function nextGeneration() {
    if(runLevel != genLevel)
        return;
    gen();
    drawGame();
    generation++;
    if(died.length + born.length == 0)
        runLevel = endLevel;
    if(generation < 200)
        setTimeout(nextGeneration, 600 - 3*generation)
    else
        window.requestAnimationFrame(nextGeneration);
}

function startGame() {
    console.log("starting game");
    runLevel = genLevel;
    document.body.classList.remove('init');
    document.body.classList.add('run');
    nextGeneration();
}

function breakGame() {
    document.body.classList.remove('run');
    runLevel = endLevel;
}

const a2c = (x) => [ 2*dotSize*(x[0] - cX), 2*dotSize*(x[1] - cY) ]; 

const c2a = (x) => [ Math.floor((x[0])/(2*dotSize) + cX + 0.5), Math.floor(x[1]/(2*dotSize) + cY + 0.5) ];

function putDot(x) {
    if(!inCanvas(...x)) return;
    ctx.beginPath();
    ctx.arc(Math.floor(x[0] + 0.5), Math.floor(x[1] + 0.5), Math.ceil(dotSize), 0, 2 * Math.PI, true);
    ctx.fill();
}

function clearDot(x) {
    if(!inArea(x)) return;
    x = a2c(x);
    ctx.clearRect(Math.floor(x[0]-dotSize),Math.floor(x[1]-dotSize),Math.ceil(2*dotSize),Math.ceil(2*dotSize));
}

function showStatus() {
    ctx.strokeStyle = dotColour;
    ctx.font        = canvasF + "px Sans";
    ctx.textAlign   = "left";
    ctx.strokeText("Generation: " + generation + " Live cells: " + a.length, 2*canvasF, 2*canvasF);
}

function drawGrid() {
    ctx.strokeStyle = gridColour;
    ctx.beginPath();
    for(let i=0; i <= cM; i++) {
        ctx.moveTo(cX + (2*i-1)*dotSize, 0);
        ctx.lineTo(cX + (2*i-1)*dotSize, canvasH);
    }
    for(let i=0; i <= cN; i++) {
        ctx.moveTo(0,cY + (2*i-1)*dotSize);
        ctx.lineTo(canvasW,cY + (2*i-1)*dotSize);
    }
    ctx.stroke();
}

function drawGame() {
    ctx.clearRect(0,0,canvasW,canvasH);
    if(runLevel >= genLevel) showStatus();
    if(runLevel == drawLevel) drawGrid();
    ctx.fillStyle = diedColour;
    died.forEach( x => putDot(a2c(x)));
    ctx.fillStyle = dotColour;
    a.forEach(    x => putDot(a2c(x)));
    ctx.fillStyle = bornColour;
    born.forEach( x => putDot(a2c(x)));    
}

const intRand = (l,u) => Math.floor((u-l+1)*Math.random()) + l; 

const moveDot = (x) => [ x[0] + intRand(-2,2),x[1] + intRand(-2,2) ];

const inCanvas = (x,y) => x >= 0 && y >= 0 && x <= canvasW && y <= canvasH;

const inArea = (x) => x[0] >= cX-1 && x[1] >= cY-1 && x[0] <= cM+cX+1 && x[1] <= cN+cY+1;

function setBrush(event) {
    
}

function unsetBrush(event) {
    
}

function unsetDot(x,y) {
    if(!inCanvas(x,y)) return;
    const v = c2a([x,y]);
    const i = hasInd(a,v);
    if(i < 0) return;
    a.splice(i,1);
    clearDot(v);
}

function setDrawDot(x,y) {
    if(!inCanvas(x,y)) return;
    const v = c2a([x,y]);
    ins(a,v);
    putDot(a2c(v));
}

function penMouseStart(e) {
    let x = e.clientX;
    let y = e.clientY;
    multitouch = false;
    handleDown(x, y, x, y);
}

function penTouchStart(e) {
    e.preventDefault();
    multitouch = e.touches.length > 0;
    
    let x0 = e.touches[0].clientX;
    let y0 = e.touches[0].clientY;
    let x1 = multitouch ? e.touches[1].clientX : x0;
    let y2 = multitouch ? e.touches[1].clientY : y0;
    
    currEvent  = [ Date.now(), 'down', multitouch, x0, y0, x1, y1 ];
    handleDown(x0, y0, x1, y1);
}

function handleDown(x0, y0, x1, y1) {
    if(runLevel != genLevel && !inCanvas(x0,y0))
        return;
    lastEvent  = [ Date.now(), 'down', multitouch, x0, y0, x1, y1 ];
    if(runLevel == voidLevel) {
        ctx.clearRect(0,0,canvasW,canvasH);
        drawGrid();
        runLevel = drawLevel;
    }
    if(runLevel == drawLevel) { 
        ctx.fillStyle = dotColour;
        if(drawMode)
            setDrawDot(x0,y0);
        else
            unsetDot(x0,y0);
        return;
    }
}

function penMouseMove(e) {
    currEvent  = [ Date.now(), 'move', false, e.clientX, e.clientY, e.clientX, e.clientX ];
    handleMove(e.clientX, e.clientY, e.clientX, e.clientY, 'move');
}

function penTouchMove(e) {
    e.preventDefault();
    multitouch = e.touches.length > 0;
    let x0 = e.touches[0].clientX;
    let y0 = e.touches[0].clientY;
    let x1 = multitouch ? e.touches[1].clientX : x0;
    let y1 = multitouch ? e.touches[1].clientY : y0;
    currEvent  = [ Date.now(), 'move', multitouch, x0, y0, x1, y1 ];
    handleMove(x0, y0, x1, y1, 'move');
}

const ongoing = () => lastEvent[1] == 'move' || lastEvent[1] == 'down';

const sumSq = (x,y) => x*x + y*y;

function handleMove(x0, y0, x1, y1, t) {
    if(runLevel != genLevel && !inCanvas(x0,y0)) return;
    if(runLevel == drawLevel) {
        if(ongoing()) {
            const dX = x0 - lastEvent[3];
            const dY = y0 - lastEvent[4];
            if(2*Math.abs(dX) < dotSize && 2*Math.abs(dY) < dotSize)
                return;
            if(drawMode) 
                setDrawDot(x0,y0);
            else
                unsetDot(x0,y0);
            lastEvent  = [ Date.now(), t, false, x0, y0, x0, y0 ];
            return;
        }
    }
    if(runLevel == genLevel) {
        if(multitouch && ongoing()) {
            const dX0 = lastEvent[3] - lastEvent[5];
            const dY0 = lastEvent[4] - lastEvent[6];
            const d0 = sumSq(dX0,dY0);
            if(d0 == 0) {
                lastEvent  = [ Date.now(), 'down', true, x0, y0, x1, y1 ];
                return;
            }
            const dX1 = x0 - x1;
            const dY1 = y0 - y1;
            
            const d1 = sumSq(dX1,dY1);
            if(d1 == 0) {
                lastEvent  = [ Date.now(), t, false, x0, y0, x0, y0 ];
                return;
            }
            if(4*Math.abs(d0-d1) < dotSize*dotSize)
                return;
            lastEvent  = [ Date.now(), t, true, x0, y0, x1, y1 ];
            zoom(Math.sqrt(d1/d0));
            return;
        }
        if(lastEvent[1] == 'move' || lastEvent[1] == 'down') {
            const dX = currEvent[3] - lastEvent[3];
            const dY = currEvent[4] - lastEvent[4];
            if(4*Math.abs(dX) < dotSize && 4*Math.abs(dY) < dotSize)
                return;
            lastEvent  = [ Date.now(), t, false, x0, y0, x0, y0 ];
            gameMove(dX,dY);
            return;
        }
    }
}

function penMouseEnd(e) {
    multitouch = false;
    currEvent  = [ Date.now(), 'up', false, e.clientX, e.clientY, e.clientX, e.clientY ];
    handleUp();
}

function penTouchEnd(e) {
    e.preventDefault();
    multitouch = e.touches.length > 0;
    let x0 = e.touches[0].clientX;
    let y0 = e.touches[0].clientY;
    let x1 = multitouch ? e.touches[1].clientX : x0;
    let y2 = multitouch ? e.touches[1].clientY : y0;
    currEvent  = [ Date.now(), 'up', multitouch, x0, y0, x1, y1 ];
    handleUp();
}

function handleUp() {
    if(runLevel == genLevel && lastEvent[1] == 'down' && Date.now()-lastEvent[0] > 500) 
        toggleFullscreen();
    lastEvent = [ ...currEvent ];
}

function doFullscreen() {
    document.body.classList.add('full');
    fullScreen = true;
    setCanvasSize();
}

function toggleFullscreen() {
    if(fullScreen) {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) { /* Safari */
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) { /* IE11 */
            document.msExitFullscreen();
        }
        document.body.classList.remove('full');
        setCanvasSize();
        fullScreen = false;
        return;
    }
    let e = document.documentElement;
    if (e.requestFullscreen) {
        e.requestFullscreen();
        doFullscreen();
    } else if (e.webkitRequestFullscreen) { /* Safari */
        e.webkitRequestFullscreen();
        doFullscreen();
    } else if (e.msRequestFullscreen) { /* IE11 */
        e.msRequestFullscreen();
        doFullscreen();
    }
}

function randomSeed() {
    console.log("random seed");
    let x = [ intRand(cM,cM+cX), intRand(cN,cN+cY) ];
    let z = a2c(x);
    setDrawDot(z[0],z[1]);

    let rN = cN*cM*Math.random()/16;
    for(let i = 0; i < rN; i++) {
        x = moveDot(x);
        z = a2c(x);
        setDrawDot(z[0],z[1]);
    }
}
