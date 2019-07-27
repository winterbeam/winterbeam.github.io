var debugging: boolean = false
var running: boolean
var fps: number = 0
var delts: number[] = []
var hasFocus: boolean

var canvasElement: HTMLCanvasElement
var bufferElement: HTMLTextAreaElement
var ctx: CanvasRenderingContext2D
var width, height: number

var stats;

interface Timer {
  length: number
  last: number
}

interface Rect {
  x: number, y: number, w: number, h: number
}

interface Word {
  str: string
  index: number
  x: number
  y: number
  remove: boolean
  fallrate: number
}

var dict: string[] = []
var words: Word[] = []
var spawnrate: number = 1000
var fallrate: number = 2

var font: string = "Georgia"
var bgColor: string = "#284652"
var wordColor: string = "#319C8F"
var wordSize: number = 24

//INIT CODE
function init() {
  running = true
  loadDict()

  bufferElement = <HTMLTextAreaElement>document.getElementById("buffer")
  canvasElement = <HTMLCanvasElement>document.getElementById("canvas")
  ctx = canvasElement.getContext("2d")
  resizeCanvas()
  window.onresize = resizeCanvas
  window.onfocus = () => {hasFocus = true}
  window.onblur = () => {hasFocus = false}
  window.onkeydown = inputListener

  bufferClear()
}

function loadDict() {
  //TODO: support for user dicts
  fetch('dict.txt')
    .then(function(response: Response): Promise<string> { return response.text() } )
    .then(function(text: string): void {
      dict = text.split("\n")
      dict.forEach(function(word, i, words) { words[i] = word.trim(); })
      run()
    })
}

//UPDATE CODE
function update(delta: number) {
  words.forEach(updateWord, {delta: delta})
  removeWords()
}

function updateWord(word: Word, index: number, words: Word[]) {
  words[index].y += word.fallrate * (this.delta / 16)
  if(word.y > height) words[index].remove = true
}

//RENDER CODE
function render() {
  ctx.clearRect(0, 0, width, height)
  ctx.fillStyle = bgColor
  ctx.fillRect(0, 0, width, height)

  words.forEach(renderWord)

  if (debugging) {
    ctx.fillStyle = "white"
    ctx.font = "24px Consolas"
    ctx.fillText(fps+"", 0, 20)
  }
}

function renderWord(word: Word) {
  ctx.fillStyle = wordColor
  ctx.font = wordSize + "px " + font
  ctx.fillText(word.str, word.x, word.y)
}


//HELPER FUNCTIONS
function resizeCanvas() {
  canvasElement.width = window.innerWidth
  canvasElement.height = window.innerHeight
  width = canvasElement.width
  height = canvasElement.height
}

function randomWord(): string {
  //console.log(dict[Math.floor(Math.random() * dict.length)])
  return dict[Math.floor(Math.random() * dict.length)]
}

function spawnWord() {
  if (!hasFocus) return
  var w: Word = {
    str: "",
    x: 0,
    y: 0,
    index: 0,
    remove: false,
    fallrate: 0
  }
  w.str = randomWord()
  w.x = Math.random() * (width - drawSize(w.str))
  w.y = -10
  w.remove = false
  w.fallrate = (-w.str.length + 20) * (fallrate/20)
  words.push(w)
}

function drawSize(word: string): number {
  return ctx.measureText(word).width
}

function bufferClear() {
  bufferElement.value = ""
}

function bufferCheck() {
  var clear = false
  var buffer = bufferElement.value
  words.forEach((element, index, array) => {
    if (element.str == buffer.trim()) {
      array[index].remove = true
      clear = true
    }
  });
  if (clear) bufferClear()
}

function removeWords() {
  if (words.length <= 0) return
  for(var i = words.length-1; i >= 0; i--) {
    if (words[i].remove) {
      words.splice(i, 1)
    }
  }
}

function inputListener(event: KeyboardEvent) {
  if (event.key == "Enter" || event.key == " ") {
    bufferCheck()
    bufferClear()
  }
}

function run() {
  var delta: number
  var last: number
  var lastFpsTime: number = 0
  var lastSpawnTime: number = 0
  function main(timestamp: DOMHighResTimeStamp) {
    if (running) window.requestAnimationFrame(main)
    
    delta = timestamp - last
    last = timestamp
    if (!isNaN(delta) && delta != undefined) delts.push(delta)
    if (delts.length > 10) delts = delts.slice(1)
    if (timestamp - lastFpsTime > 150) {
      lastFpsTime = timestamp
      delts.forEach(d => { fps = (fps + 1000/d) / 2 });
      fps = Math.round(fps)
    }

    if (timestamp - lastSpawnTime > spawnrate) {
      lastSpawnTime = timestamp
      spawnWord()
    }

    update(delta)
    render()
  }
  main(0)
}

init()