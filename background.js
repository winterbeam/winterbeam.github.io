var canvas, ctx, width, height, objects=[];

//pseudo-object
function snowflake(coord, size, speed) {
  var _ = this;

  // pseudo-constructor
  (function() {
    _.coord = coord || null
    _.size  = size  || null
    _.speed = speed || null
    _.xpat  = {
      variation : 1,
      amplitude : 1 * Math.random(),
      frequency : .05 * Math.random(),
      shift     : Math.PI * Math.random(),
      zed: 0
    }
  })();

  this.update = function() {
    //apply zed logic
    _.xpat.zed = _.xpat.amplitude * Math.sin(_.xpat.frequency * coord.y + (_.xpat.shift) )
    _.coord.x += _.xpat.zed
    _.coord.y += .5*(_.size/2)
    if(coord.y - 10 > height) coord.y = -10
  }

  this.render = function() {
    ctx.beginPath();
    ctx.arc(_.coord.x, _.coord.y, _.size, 0, Math.PI * 2)
    ctx.fillStyle="white";
    ctx.fill();
  }
}

function init() {
  initGraphics()
  for(var i = 0; i < 50; i++) {
    var coord = { x: Math.random() * width, y: Math.random() * (-height*2) }
    var size = Math.trunc(Math.random() * 3 + 1)
    objects.push(new snowflake(coord, size, Math.random() +.5))
  }
  animate()
}

function initGraphics() {
  canvas = document.getElementsByTagName('canvas')[0]
  width = window.innerWidth
  height = window.innerHeight
  canvas.width = width
  canvas.height = height
  ctx = canvas.getContext('2d')
}

function resize() {
  width = window.innerWidth
  height = window.innerHeight
  canvas.width = width
  canvas.height = height
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  objects.forEach(function(object) {
    object.update()
    object.render()
  })

  requestAnimationFrame(animate)
}

init();
