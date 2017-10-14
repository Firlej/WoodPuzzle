var canvas;
var ctx;

var width;
var height;

var windowWidth;
var windowHeight;

var mouseX;
var mouseY;

var images = [];
var imagesLoaded = false;

var PI = Math.PI;
var frameCount = 0;

window.onload = function() {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    ctx.mozImageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.msImageSmoothingEnabled = false;
    ctx.imageSmoothingEnabled = false;
    ctx.stroke();

    addEventListeners();

    setLibValues();

    setup(function() {
        setInterval(function() {
            draw();
            frameCount++;
        }, 1000/120);
    });
}

function setLibValues() {
    width = canvas.width;
    height = canvas.height;

    windowWidth = window.innerWidth;
    windowHeight = window.innerHeight;
}
var sources = {};
function loadImages(sources) {

    var numImages = 0;
    for(src in sources) {
        numImages++;
    }
    var loadedImages = 0;
    for(src in sources) {
        images[src] = new Image();
        images[src].onload = function() {
            loadedImages++;
            if(loadedImages==numImages) {
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

function font(f) {
    ctx.font = f;
}

function textAlign(a) {
    ctx.textAlign = a;
}

function text(text, x , y) {
    ctx.fillText(text, x, y);
}

function fill(color) {
    ctx.fillStyle = color;
}

function ellipse(x, y, r) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI*2, true);
    ctx.fill();
}
function rect(x, y, width, height) {
    ctx.fillRect(x, y, width, height);
}
function text(text, x, y) {
    ctx.fillText(text, x, y);
}

function rgba(r, g, b, a) {
    r = floor(r);
    g = floor(g);
    b = floor(b);
    if (typeof a === 'undefined') { a = 255; }
    else { a = floor(a); }
    return "rgba("+r+", "+g+", "+b+", "+a+")";
}

function hsl(h, s, l) {
    h = floor(h);
    s = floor(s);
    l = floor(l);
    return "hsl("+h+", "+s+"%, "+l+"%)";
}

function lerp(start, end, rate) {
    return (end-start)*rate + start;
}

function floor(a) {
    return Math.floor(a);
}
function random(a, b) {
    var x = b-a;
    x = Math.random()*x + a;
    return x;
}

function push() { ctx.save() };
function translate(x, y) { ctx.translate(x, y); }
function pop() { ctx.restore(); }

function beginShape() { ctx.beginPath(); }
function vertex(x, y) { ctx.lineTo(x, y); }
function endShape() { ctx.closePath(); ctx.stroke(); }
function stroke(color) { ctx.strokeStyle = color; }

function mousePressed() {}
function mouseReleased() {}

function addEventListeners() {
    canvas.addEventListener("mousedown", mousePressed);
    canvas.addEventListener("mouseup", mouseReleased);
    canvas.addEventListener('mousemove', updateMouseMove);

    window.addEventListener('touchstart', function(evt) {
        updateTouchMove(evt)
        mousePressed();
    });
    window.addEventListener('touchend', mouseReleased);
    window.addEventListener('touchmove', function(evt) {
        evt.preventDefault();
        updateTouchMove(evt);
    });

    window.onresize = function(event) {
        setLibValues();
        windowResized();
    };

    function updateMouseMove(evt) {
        var rect = canvas.getBoundingClientRect();
        var root = document.documentElement;
        mouseX = evt.clientX - rect.left - root.scrollLeft;
        mouseY = evt.clientY - rect.top - root.scrollTop;
    }
    function updateTouchMove(evt) {
        var rect = canvas.getBoundingClientRect();
        var root = document.documentElement;
        mouseX = evt.touches[0].clientX - rect.left - root.scrollLeft;
        mouseY = evt.touches[0].clientY - rect.top - root.scrollTop;
    }
}