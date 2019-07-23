var fps;
var times = [];
var debugging;
var animationFrameHandle;
var hasFocus;
var canvasElement;
var bufferElement;
var ctx;
var width, height;
var dict = [];
var words = [];
var spawnrate = 1000;
var fallrate = 2;
var font = "Georgia";
var bgColor = "#284652";
var wordColor = "#319C8F";
var wordSize = 24;
//INIT CODE
function init() {
    loadDict();
    bufferElement = document.getElementById("buffer");
    canvasElement = document.getElementById("canvas");
    ctx = canvasElement.getContext("2d");
    resizeCanvas();
    window.onresize = resizeCanvas;
    window.onfocus = function () { hasFocus = true; };
    window.onblur = function () { hasFocus = false; };
    window.onkeydown = updateInput;
}
function run() {
    setInterval(spawnWord, spawnrate);
    animationFrameHandle = requestAnimationFrame(mainloop);
}
function loadDict() {
    //TODO: support for user dicts
    fetch('dict.txt')
        .then(function (response) { return response.text(); })
        .then(function (text) {
        dict = text.split("\n");
        dict.forEach(function (word, i, words) { words[i] = word.trim(); });
        run();
    });
}
//CYCLE CODE
function mainloop() {
    var now = performance.now();
    while (times.length > 0 && times[0] <= now - 1000)
        times.shift();
    times.push(now);
    fps = times.length;
    if (hasFocus)
        update();
    if (hasFocus)
        render();
    animationFrameHandle = requestAnimationFrame(mainloop);
}
//UPDATE CODE
function update() {
    words.forEach(updateWord);
    removeWords();
}
function updateWord(word, index, words) {
    //console.log(word)
    //console.log(words[index])
    words[index].y += (-word.str.length + 20) / 10;
    if (word.y > height)
        words[index].remove = true;
}
function updateInput(event) {
    if (event.key == "Enter" || event.key == " ") {
        bufferCheck();
        bufferClear();
    }
}
//RENDER CODE
function render() {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);
    words.forEach(renderWord);
    if (debugging) {
        ctx.fillStyle = "white";
        ctx.font = "24px Consolas";
        ctx.fillText(fps + "", 0, 20);
    }
}
function renderWord(word) {
    ctx.fillStyle = wordColor;
    ctx.font = wordSize + "px " + font;
    ctx.fillText(word.str, word.x, word.y);
}
//HELPER FUNCTIONS
function resizeCanvas() {
    canvasElement.width = window.innerWidth;
    canvasElement.height = window.innerHeight;
    width = canvasElement.width;
    height = canvasElement.height;
}
function randomWord() {
    //console.log(dict[Math.floor(Math.random() * dict.length)])
    return dict[Math.floor(Math.random() * dict.length)];
}
function spawnWord() {
    if (!hasFocus)
        return;
    var w = {
        str: "",
        x: 0,
        y: 0,
        index: 0,
        remove: false
    };
    w.str = randomWord();
    w.x = Math.random() * (width - drawSize(w.str));
    w.y = -10;
    w.remove = false;
    words.push(w);
}
function drawSize(word) {
    return ctx.measureText(word).width;
}
function bufferClear() {
    bufferElement.value = "";
}
function bufferCheck() {
    var clear = false;
    var buffer = bufferElement.value;
    words.forEach(function (element, index, array) {
        if (element.str == buffer.trim()) {
            array[index].remove = true;
            clear = true;
        }
    });
    if (clear)
        bufferClear();
}
function removeWords() {
    if (words.length <= 0)
        return;
    for (var i = words.length - 1; i >= 0; i--) {
        if (words[i].remove) {
            words.splice(i, 1);
        }
    }
}
init();
