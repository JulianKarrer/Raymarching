const canvas = document.getElementById("raymarch-visualize");
const eye = document.getElementById("eyecon");

let current_step = "first";
document.getElementById("impress").addEventListener( "impress:stepenter", function(event) {
  current_step = event.target.id;
});

let mousepos = {x: 0.0, y:0.0};
canvas.onmousemove = function(e) {
  let rect = canvas.getBoundingClientRect();
  mousepos.x = (e.clientX - rect.left)/rect.width;
  mousepos.y = (e.clientY - rect.top)/rect.height;
}

const makeCircle = (r, cx, cy)=>{
  return {
    radius: r,
    centre: {x: cx, y:cy},
    sdf: function(x,y){
      return Math.sqrt((x-this.centre.x)*(x-this.centre.x) + (y-this.centre.y)*(y-this.centre.y)) - this.radius
    },
    draw: function(ctx){
      ctx.beginPath();
      ctx.arc(this.centre.x, this.centre.y, this.radius, 0, 2 * Math.PI);
      ctx.stroke();
    }
  }
}

const makeBox = (wx, wy, cx, cy)=>{
  return {
    centre: {x: cx, y:cy},
    width: {x: wx, y:wy}, 
    sdf: function(x,y){
      let offset_x = Math.abs(x-this.centre.x- wx/2) - wx/2;
      let offset_y = Math.abs(y-this.centre.y- wy/2) - wy/2;
      let u_dist = Math.sqrt(Math.max(offset_x, 0)*Math.max(offset_x, 0) + Math.max(offset_y, 0)*Math.max(offset_y, 0))
      let dist_in = Math.max(Math.min(offset_x, 0), Math.min(offset_y, 0))
      return u_dist + dist_in
    },
    draw: function(ctx){
      ctx.beginPath();
      ctx.strokeRect(this.centre.x, this.centre.y, this.width.x, this.width.y);
      ctx.stroke();
    }
  }
}

const ctx = canvas.getContext("2d");

function runSdfVisualization(){
  let height = canvas.height;
  let width = canvas.width;
  let px = mousepos.x*width;
  let py = mousepos.y*height;
  const scene = [makeCircle(height/10, width/3, height/3), makeBox(height/8, height/13, 2*width/3, 2*height/3)];
  ctx.fillStyle = "white";
  ctx.clearRect(0, 0, width, height)
  ctx.strokeStyle = "white";
  ctx.lineWidth = 2;

  // visualize the scene
  let sdf = 99999999999;
  for (const elem in scene){
    scene[elem].draw(ctx);
    sdf = Math.min(sdf,  scene[elem].sdf(px, py))
  }

  // draw a dot around the cursor
  ctx.moveTo(px,py);
  ctx.beginPath();
  let radius = 8;
  ctx.ellipse(px, py, radius, radius, 0, 0, 2.0*Math.PI, true);
  ctx.fill();
  ctx.font = "20px Quicksand";
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.fillText("p", px - 10, py-10); 

  // visualize sdf
  //  as a sphere
  ctx.strokeStyle = "gray";
  ctx.moveTo(px,py);
  ctx.beginPath();
  ctx.arc(px, py, Math.abs(sdf), 0, 2.0*Math.PI);
  ctx.stroke();
  //  as a function
  ctx.font = "30px Quicksand";
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  let text = "D(p)="+sdf.toFixed(2);
  ctx.fillText(text, width/2, height - 30); 

  requestAnimationFrame(runSdfVisualization);
}

function runRayVisualization(){
  let height = canvas.height;
  let width = canvas.width;
  ctx.fillStyle = "white";
  ctx.clearRect(0, 0, width, height)
  ctx.strokeStyle = "white";
  ctx.lineWidth = 5;

  // draw the ray
  ctx.beginPath(); 
  let ox = width/10; 
  let oy = height/2;
  let px = mousepos.x*width;
  let py = mousepos.y*height;
  ctx.moveTo(ox,oy);
  ctx.lineTo(ox+(px-ox)*20, oy+(py-oy)*20);
  ctx.stroke();
  ctx.fill();
  // draw an eye
  let imgwidth = 0.8*ox;
  ctx.filter = "invert()"
  ctx.drawImage(eye, 2, oy-imgwidth/2, imgwidth, imgwidth);
  ctx.filter = "none"
  // draw a dot around the cursor
  ctx.moveTo(px,py);
  ctx.beginPath();
  let radius = 8;
  ctx.ellipse(px, py, radius, radius, 0, 0, 2.0*Math.PI, true);
  ctx.fill();


  requestAnimationFrame(runRayVisualization);
}


requestAnimationFrame(runSdfVisualization);


