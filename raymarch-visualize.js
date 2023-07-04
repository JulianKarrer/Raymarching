const eye = document.getElementById("eyecon");

let current_step = "first";
document.getElementById("impress").addEventListener( "impress:stepenter", function(event) {
  current_step = event.target.id;
});

let ids = ["circle-sdf-canvas",/*"box-sdf-canvas",*/"sdf-union-canvas","raymarch-visualize", "raymarch-visualize-fluent"]

let mousepos = {x: 0.0, y:0.0};
let mouse_updater = (e)=>{
  let rect = e.target.getBoundingClientRect();
  mousepos.x = (e.clientX - rect.left)/rect.width;
  mousepos.y = (e.clientY - rect.top)/rect.height;
};

ids.forEach((id)=>{document.getElementById(id).onmousemove = mouse_updater;})

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


function runCircleVisualization(){
  const canvas = document.getElementById("circle-sdf-canvas");
  const ctx = canvas.getContext("2d");
  let height = canvas.height;
  let width = canvas.width;
  let px = mousepos.x*width;
  let py = mousepos.y*height;

  
  let sx = width/2; let sy = height/2; let r = height/4; 

  const scene = [makeCircle(r, sx, sy)];
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

  // line rom p to centre
  ctx.beginPath();
  ctx.strokeStyle = "gray";
  ctx.ellipse(sx, sy, radius, radius, 0, 0, 2.0*Math.PI, true);
  ctx.fill();
  ctx.fillText("centre", sx, sy-10); 

  ctx.beginPath();
  ctx.strokeStyle = "gray";
  ctx.moveTo(px, py);
  ctx.lineTo(sx, sy);
  ctx.stroke();
    // draw radius seperately
  ctx.beginPath();
  ctx.strokeStyle = "red";
  ctx.fillStyle = "red";
  ctx.moveTo(sx, sy);
  let dx = px-sx; let dy = py-sy;
  let length = Math.sqrt(dx*dx+dy*dy);
  ctx.lineTo(sx + dx*(r/length), sy + dy*(r/length));
  ctx.fillText("radius", sx + dx*(r/length/2), sy + dy*(r/length/2)-10); 
  ctx.stroke();

  // write function
  ctx.font = "30px Quicksand";
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  let text = "D(p)="+sdf.toFixed(2);
  ctx.fillText(text, width/2, height - 30); 

  

  requestAnimationFrame(runCircleVisualization);
}
function runBoxVisualization(){
  const canvas = document.getElementById("box-sdf-canvas");
  const ctx = canvas.getContext("2d");
  let height = canvas.height;
  let width = canvas.width;
  let px = mousepos.x*width;
  let py = mousepos.y*height;
  const scene = [makeBox(width/3, height/3, width/3, height/3)];
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
  if (sdf >= 0) {ctx.strokeStyle = "gray"} else {ctx.strokeStyle = "red "};
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

  requestAnimationFrame(runBoxVisualization);
}

function runSdfUnionVisualization(){
  const canvas = document.getElementById("sdf-union-canvas");
  const ctx = canvas.getContext("2d");
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
  if (sdf >= 0) {ctx.strokeStyle = "gray"} else {ctx.strokeStyle = "red "};
  ctx.moveTo(px,py);
  ctx.beginPath();
  ctx.arc(px, py, Math.abs(sdf), 0, 2.0*Math.PI);
  ctx.stroke();
  //  as a function
  ctx.font = "30px Quicksand";
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.fillText("D(p) = min("+scene[0].sdf(px, py).toFixed(2)+", "+scene[1].sdf(px, py).toFixed(2)+") = " +sdf.toFixed(2), width/2, height - 30);

  requestAnimationFrame(runSdfUnionVisualization);
}

let dots = [[0.1, 0.5]]
document.getElementById("raymarch-visualize").onclick = (e)=>{
  let rect = e.target.getBoundingClientRect();
  let x = (e.clientX - rect.left)/rect.width;
  let y = (e.clientY - rect.top)/rect.height;
  dots.push([x,y])
};

function runRayVisualization(){
  const canvas = document.getElementById("raymarch-visualize");
  const ctx = canvas.getContext("2d");
  let height = canvas.height;
  let width = canvas.width;
  ctx.fillStyle = "white";
  ctx.clearRect(0, 0, width, height)
  ctx.strokeStyle = "white";
  ctx.lineWidth = 2;
  let px = mousepos.x*width;
  let py = mousepos.y*height;
  let ox = width/10; 
  let oy = height/2;
  let gx = width;
  let gy = 3.3*height/4;

  const ray = (x)=>{
    let t = Math.min(Math.max((x-ox)/(gx-ox), 0.0), 1.0)
    return [ox+t*(gx-ox), oy+t*(gy-oy)]
  }

  const scene = [makeCircle(height/10, width/3, height/3), makeBox(height/8, height/13, 2*width/3, 2*height/3)];

  // draw the ray
  ctx.beginPath(); 
  ctx.lineWidth = 5;
  ctx.moveTo(ox,oy);
  ctx.lineTo(gx,gy);
  ctx.stroke();
  ctx.lineWidth = 2;

  // draw an eye
  let imgwidth = 0.8*ox;
  ctx.filter = "invert()"
  ctx.drawImage(eye, 2, oy-imgwidth/2, imgwidth, imgwidth);
  ctx.filter = "none";
  ctx.fill();

  // draw a dot on the line at the height of the cursor
  ctx.beginPath();
  ctx.fillStyle = "gray"
  let [dot_x, dot_y] = ray(px);
  let radius = 8;
  ctx.ellipse(dot_x, dot_y, radius, radius, 0, 0, 2.0*Math.PI, true);
  ctx.fill();

  // draw all recorded spheres
  let shortest = 99999999999;
  ctx.strokeStyle = "gray"
  for (const dot in dots){
    ctx.beginPath();
    let [x,y] = ray(dots[dot][0]*width);
    let sdf = 99999999999;
    for (const elem in scene){
      sdf = Math.min(sdf,  scene[elem].sdf(x, y))
      shortest = Math.min(shortest, sdf)
    }
    ctx.arc(x, y, Math.abs(sdf), 0, 2 * Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(x, y, radius, radius, 0, 0, 2.0*Math.PI, true);
    ctx.fill();
  }
  ctx.strokeStyle = "white"

  // visualize the scene if the intersection was found
  if (shortest < 10){
    for (const elem in scene){
      scene[elem].draw(ctx);
    }
  }


  requestAnimationFrame(runRayVisualization);
}


function settingVisualizer(){
  const canvas = document.getElementById("setting-visualize");
  const ctx = canvas.getContext("2d");
  let height = canvas.height;
  let width = canvas.width;
  ctx.fillStyle = "white";
  ctx.clearRect(0, 0, width, height)
  ctx.strokeStyle = "white";
  ctx.lineWidth = 2;
  let px = mousepos.x*width;
  let py = mousepos.y*height;
  let ox = width/10; 
  let oy = height/2;
  let gx = width;
  let gy = 3.3*height/4;

  const scene = [makeCircle(height/10, width/3, height/3), makeBox(height/8, height/13, 2*width/3, 2*height/3)];

  // draw the ray
  ctx.beginPath(); 
  ctx.lineWidth = 5;
  ctx.moveTo(ox,oy);
  ctx.lineTo(gx,gy);
  ctx.stroke();
  ctx.lineWidth = 2;

  // draw ray origin
  ctx.beginPath();
  ctx.fillStyle = "gray"
  let radius = 8;
  ctx.ellipse(ox, oy, radius, radius, 0, 0, 2.0*Math.PI, true);
  ctx.fill();

  ctx.font = "20px Quicksand";
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.fillText("o", ox, oy+30); 

  // draw ray direction
  let tox = ox+0.15*(gx-ox);
  let toy = oy+0.15*(gy-oy);
  
  ctx.font = "20px Quicksand";
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.fillText("d", tox-15, toy+30); 

  var headlen = 30; // length of head in pixels
  var dx = tox - ox;
  var dy = toy - oy;
  var angle = Math.atan2(dy, dx);
  ctx.beginPath();
  ctx.moveTo(tox, toy);
  ctx.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
  ctx.moveTo(tox, toy);
  ctx.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
  ctx.stroke();

  // draw an eye
  let imgwidth = 0.8*ox;
  ctx.filter = "invert()"
  console.log(eye)
  ctx.drawImage(eye, 2, oy-imgwidth/2, imgwidth, imgwidth);
  ctx.filter = "none";
  ctx.fill();

  ctx.strokeStyle = "white"

  // visualize the scene if the intersection was found
  for (const elem in scene){
    scene[elem].draw(ctx);
  }

}

let fluentDots = []
let fluentEnable = false;
document.getElementById("raymarch-visualize-fluent").onclick = (e)=>{
  if (fluentEnable){
    fluentEnable = false;
    fluentDots = [];
  } else {
    fluentEnable = true;
  }
};

function runRayFluentVisualization(){
  const canvas = document.getElementById("raymarch-visualize-fluent");
  const ctx = canvas.getContext("2d");
  let height = canvas.height;
  let width = canvas.width;
  ctx.fillStyle = "white";
  ctx.clearRect(0, 0, width, height)
  ctx.strokeStyle = "white";
  ctx.lineWidth = 2;
  let px = mousepos.x*width;
  let py = mousepos.y*height;
  let ox = width/10; 
  let oy = height/2;
  let dist = Math.sqrt((px-ox)*(px-ox)+(py-oy)*(py-oy));
  let dirx = (px-ox)/dist;
  let diry = (py-oy)/dist;

  const ray = (t)=>{
    return [ox+t*dirx, oy+t*diry]
  }

  const scene = [makeCircle(height/10, width/3, height/3), makeBox(height/8, height/13, 2*width/3, 2*height/3)];

  // draw the ray
  ctx.beginPath(); 
  ctx.lineWidth = 5;
  ctx.moveTo(ox,oy);
  ctx.lineTo(ray(1000)[0],ray(1000)[1]);
  ctx.stroke();
  ctx.lineWidth = 2;

  // draw an eye
  let imgwidth = 0.8*ox;
  ctx.filter = "invert()"
  ctx.drawImage(eye, 2, oy-imgwidth/2, imgwidth, imgwidth);
  ctx.filter = "none";
  ctx.fill();

  // draw a dot on the line at the height of the cursor
  // ctx.beginPath();
  // ctx.fillStyle = "gray"
  // let [dot_x, dot_y] = ray(px);
  // let radius = 8;
  // ctx.ellipse(dot_x, dot_y, radius, radius, 0, 0, 2.0*Math.PI, true);
  // ctx.fill();

  ctx.strokeStyle = "gray"
  let t = 0;
  let close_enough = 1;
  for(let i=0; i<= 100; i++){
    // draw current setting
    let [x,y] = ray(t);

    let sdf = 99999999999;
    for (const elem in scene){
      sdf = Math.min(sdf,  scene[elem].sdf(x, y))
    }
    if (t > width){break;}
    if (sdf < close_enough && fluentEnable){
      fluentDots.push([x,y])
      break;
    }

    ctx.beginPath();
    ctx.arc(x, y, Math.abs(sdf), 0, 2 * Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(x, y, 5, 5, 0, 0, 2.0*Math.PI, true);
    ctx.fill();

    // evaluate sdf and update t
    t += sdf;
  }
  ctx.strokeStyle = "white"


  // visualize the scene
  scene.forEach((elem)=>{elem.draw(ctx)})
  
  // visualize dots calculated
  ctx.fillStyle = "blue";
  fluentDots.forEach((dot)=>{
    let [x,y] = dot;
    ctx.beginPath();
    ctx.ellipse(x, y, 5, 5, 0, 0, 2.0*Math.PI, true);
    ctx.fill();
  })

  requestAnimationFrame(runRayFluentVisualization);
}


setTimeout(()=>{
  requestAnimationFrame(runSdfUnionVisualization);
  requestAnimationFrame(runCircleVisualization);
  // requestAnimationFrame(runBoxVisualization);
  requestAnimationFrame(runRayVisualization);
  requestAnimationFrame(runRayFluentVisualization);
  requestAnimationFrame(settingVisualizer);
}, 100);



// GLSL Sandbox Uniform updates
function lerp(start, end, cur){
  return (1-cur)*start+cur*end
}

const updateUniforms = ()=>{
  // csg 
  let k = document.getElementById("softmaxslider").value/500;
  let boxy = document.getElementById("boxnessslider").value/1000;
  let operation = document.getElementById("csg-op").value === "union" ? 0.0 : 1.0;

  // transformations
  let transforms = 
    (document.getElementById("rotatex").checked ? 0.1 : 0 )+
    (document.getElementById("rotatey").checked ? 0.01 : 0) +
    document.getElementById("inst").value  * 0.001 +
    document.getElementById("noise").value * 0.00001;

  try{
    window.glslCanvases.forEach((c)=>{
      c.setUniform("u_smoothness", k);
      c.setUniform("u_boxness", boxy);
      c.setUniform("u_operation", operation);
      c.setUniform("u_transforms", transforms);
    })
    document.getElementById("smoothness_span").innerText = "k " + k.toFixed(3);
    document.getElementById("boxness_span").innerText = "☐ " + boxy.toFixed(3);
  }
  catch(e){console.log(e)}
  

  requestAnimationFrame(updateUniforms);
}
requestAnimationFrame(updateUniforms);


const smoothmin = (a,b,k)=>{
  let h = Math.max( k-Math.abs(a-b), 0.0 )/k
  return Math.min( a, b ) - h*h*h*k*(1.0/6.0);
}

const makePlot = ()=>{
  let selected = document.getElementById("csg-op").value;
  let k = document.getElementById("softmaxslider").value/500;
  let boxy = document.getElementById("boxnessslider").value/1000;

  var x1Values = [];
  var y1Values = [];
  var x2Values = [];
  var y2Values = [];
  var x3Values = [];
  var y3Values = [];
  for (var x = 0; x <= 10; x += 0.1) {
    x1Values.push(x);
    x2Values.push(x);
    x3Values.push(x);
    
    let a = Math.sin(x);
    let b = lerp(a*2, Math.sin(x)*x, boxy);
    let res = 
      selected === "union"? 
        smoothmin(a,b,k) : 
      selected === "sub" ? 
        Math.min(Math.sin(x), Math.sin(x)*x) :
      -smoothmin(-a,-b,k);

    y1Values.push(a);
    y2Values.push(b);
    y3Values.push(res);
  }

  // Display using Plotly
  var data = [{x:x1Values, y:y1Values, mode:"lines"}, {x:x2Values, y:y2Values, mode:"lines"}, {x:x3Values, y:y3Values, mode:"lines"}];
  var layout =  {	margin: { t: 0, r:0, l:0, b:0 }, width: 600, height: 600 }
  Plotly.react("func-plot", data, layout);
  requestAnimationFrame(makePlot)
}
requestAnimationFrame(makePlot)
