let canvas, ctx;

let width, height;

let windowWidth, windowHeight;

let mouseX, mouseY;
let keyCode;

let images = [];
let imagesLoaded = false;

let PI = Math.PI;
let frameCount = 0;

window.onload = function () {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = false;
    // ctx.mozImageSmoothingEnabled = false;
    // ctx.webkitImageSmoothingEnabled = false;
    // ctx.msImageSmoothingEnabled = false;
    // ctx.imageSmoothingEnabled = false;
    // ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.stroke();

    addEventListeners();

    setLibValues();

    setup(function () {
        setInterval(function () {
            draw();
            frameCount++;
        }, 1000 / 60);
    });
}

function redraw() {
    draw();
}

function setLibValues() {
    width = canvas.width;
    height = canvas.height;

    windowWidth = window.innerWidth;
    windowHeight = window.innerHeight;
}

let sources = {};

function loadImages(sources) {

    let numImages = 0;
    for (src in sources) {
        numImages++;
    }
    let loadedImages = 0;
    for (src in sources) {
        images[src] = new Image();
        images[src].onload = function () {
            loadedImages++;
            if (loadedImages == numImages) {
                //console.log("Images loaded!");
                imagesLoaded = true;
            }
        };
        images[src].src = sources[src];
    }
}

function image(img, x, y, width, height) {
    ctx.drawImage(img, x, y, width, height);
}

function resizeCanvas(width, height) {
    ctx.canvas.width = width;
    ctx.canvas.height = height;
    canvas.width = width;
    canvas.height = height;

    setLibValues();
}

function background(color) {
    fill(color);
    rect(0, 0, canvas.width, canvas.height);
}

function clearBackground() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function font(f) {
    ctx.font = f;
}

function textAlign(a) {
    ctx.textAlign = a;
}

function text(text, x, y) {
    ctx.fillText(text, x, y);
}

function randomRgb() {
    return rgba(random(0, 256), random(0, 256), random(0, 256));
}

function fill(color) {
    ctx.fillStyle = color;
}

function ellipse(x, y, r) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, true);
    ctx.fill();
}

function rect(x, y, width, height) {
    ctx.fillRect(x, y, width, height);
}

function strokeRect(x, y, width, height) {
    ctx.strokeRect(x, y, width, height);
}

function lineWidth(x) {
    ctx.lineWidth = x;
}

function globalAlpha(a = 1) {
    ctx.globalAlpha = a;
}

function rgba(r, g, b, a = 1) {
    return "rgba(" + floor(r) + ", " + floor(g) + ", " + floor(b) + ", " + a + ")";
}

function hsl(h, s, l) {
    return "hsl(" + floor(h) + ", " + floor(s) + "%, " + floor(l) + "%)";
}

function lerp(start, end, rate) {
    return (end - start) * rate + start;
}

// MATH SHORTS

function floor(a) {
    return Math.floor(a);
}

function ceil(a) {
    return Math.ceil(a);
}

function round(a) {
    return Math.round(a);
}

function abs(a) {
    return Math.abs(a);
}

function random(a, b) {
    return Math.random() * (b - a) + a;
}

// ARRAY PROTOTYPES

Array.prototype.random = function () {
    return this[Math.floor((Math.random() * this.length))];
}
Array.prototype.first = function () {
    return this[0];
}
Array.prototype.last = function () {
    return this[this.length - 1];
}

function push() {
    ctx.save()
};

function translate(x, y) {
    ctx.translate(x, y);
}

function pop() {
    ctx.restore();
}

function beginShape() {
    ctx.beginPath();
}

function vertex(x, y) {
    ctx.lineTo(x, y);
}

function endShape() {
    ctx.closePath();
    ctx.stroke();
}

function stroke(color) {
    ctx.strokeStyle = color;
}

function mouseContained(x1, y1, x2, y2) {
    return (mouseX > x1 && mouseX < x2 && mouseY > y1 && mouseY < y2);
}

// STORAGE PROTOTYPES

Storage.prototype.hasKey = function (key) {
    return this.getItem(key) !== null;
}
Storage.prototype.getParsed = function (key) {
    return JSON.parse(this.getItem(key));
}

// EVENT LISTENERS

function mousePressed() {}

function mouseReleased() {}

function windowResized() {}

function keyPressed() {}

function addEventListeners() {
    canvas.addEventListener("mousedown", mousePressed);
    canvas.addEventListener("mouseup", mouseReleased);
    canvas.addEventListener('mousemove', updateMouseMove);

    window.addEventListener("keypress", function (evt) {
        keyCode = evt.keyCode;
        keyPressed(keyCode);
    });

    window.addEventListener('touchstart', function (evt) {
        updateTouchMove(evt)
        mousePressed();
    });
    window.addEventListener('touchend', mouseReleased);
    window.addEventListener('touchmove', function (evt) {
        evt.preventDefault();
        updateTouchMove(evt);
    });

    window.onresize = function (event) {
        setLibValues();
        windowResized();
    };

    function updateMouseMove(evt) {
        let rect = canvas.getBoundingClientRect();
        let root = document.documentElement;
        mouseX = evt.clientX - rect.left - root.scrollLeft;
        mouseY = evt.clientY - rect.top - root.scrollTop;
    }

    function updateTouchMove(evt) {
        let rect = canvas.getBoundingClientRect();
        let root = document.documentElement;
        mouseX = evt.touches[0].clientX - rect.left - root.scrollLeft;
        mouseY = evt.touches[0].clientY - rect.top - root.scrollTop;
    }
}

// VECTOR

class Vector {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    add(v) {
        this.x += v.x;
        this.y += v.y;
    }

    set(x, y) {
        this.x = x;
        this.y = y;
    }

    copy() {
        return new Vector(this.x, this.y);
    }
}

function vec(x = 0, y = 0) {
    return new Vector(x, y);
}