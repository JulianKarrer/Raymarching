
#ifdef GL_ES
precision highp float;
#endif

    //CONFIG
//raymarching
#define MAX_RAYMARCH_STEPS 64
#define SURFACE_DIST 0.1

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

uniform float u_transforms;

mat3 rotateX(float t){
    float c = cos(t);
    float s = sin(t);
    return mat3(vec3(1.,0.,0.), vec3(0.,c,-s), vec3(0.,s,c));
}

mat3 rotateY(float t){
    float c = cos(t);
    float s = sin(t);
    return mat3(vec3(c,0.,s), vec3(0.,1.,0.), vec3(-s,0.,c));
}

float random (in vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))
                 * 43758.5453123);
}

// https://www.shadertoy.com/view/4dS3Wd
float noise (in vec2 st) {
vec2 i = floor(st);
vec2 f = fract(st);

// Four corners in 2D of a tile
float a = random(i);
float b = random(i + vec2(1.0, 0.0));
float c = random(i + vec2(0.0, 1.0));
float d = random(i + vec2(1.0, 1.0));

// Smooth Interpolation

// Cubic Hermine Curve.  Same as SmoothStep()
vec2 u = f*f*(3.0-2.0*f);
// u = smoothstep(0.,1.,f);

// Mix 4 coorners percentages
return mix(a, b, u.x) +
        (c - a)* u.y * (1.0 - u.x) +
        (d - b) * u.x * u.y;
}

float boxframe(vec3 p){
  float e = 0.1;
  vec3 b = vec3(1.);
  p = abs(p)-b;
  vec3 q = abs(p+e)-e;
  return min(min(
      length(max(vec3(p.x,q.y,q.z),0.0))+min(max(p.x,max(q.y,q.z)),0.0),
      length(max(vec3(q.x,p.y,q.z),0.0))+min(max(q.x,max(p.y,q.z)),0.0)),
      length(max(vec3(q.x,q.y,p.z),0.0))+min(max(q.x,max(q.y,p.z)),0.0));
}

vec4 DE(vec3 pos, vec2 mouse, float t) {
  float c = 5.;//vec3(3.0);
  vec3 p = pos;
  float rot_speed = 3.0;
  
  // instancing
  float l = floor(fract(u_transforms * 100.)*10.);
  p = p-c*clamp(floor(p/c+vec3(0.5)),-l,l);
  // rotate x
  if (fract(u_transforms)*10.0 > 0.5){
    p = rotateX(t*rot_speed)*p;
  }
  // rotate y
  if (fract(u_transforms * 10.)*10. > 0.5){
    p = rotateY(t*rot_speed)*p;
  }
  // noise
  float noise = -noise(pos.xy*2.+vec2(2.*cos(t), sin(t*2.0)))
    * fract(u_transforms * 1000.);

  // p = rotateX(t) * rotateY(t) * p;
  float sdf = boxframe(p) + noise;
  return vec4(sdf, vec3(1.));
}

//raymarching to object defined by DE()
vec3 trace(vec3 o, vec3 r, vec2 mouse, float t){
	float d = 0.;
	int s = 0;
  vec3 color = vec3(1.);
	for (int i = 0; i < MAX_RAYMARCH_STEPS; i ++){
		vec3 p = o + r * d;
    vec4 res = DE(p, mouse, t);
		float cur_d = res.x;
        d += cur_d;
		s = i;
		if (cur_d < SURFACE_DIST) {color = res.yzw; break;};
	}
	//return the objects estimated distance and number of steps to get there
  color *= 1.-float(s)/float(MAX_RAYMARCH_STEPS);
	return color;
}



void main( void ) {
//UV
//normalize uv to [-1;1] and adjust aspect ratio
  vec2 p = (gl_FragCoord.xy * 2. - u_resolution) / min(u_resolution.x, u_resolution.y);
  vec2 uv = gl_FragCoord.xy / u_resolution;

  vec2 mouse = 4.0 * ((u_mouse) / u_resolution - vec2(.5));

  //CAMERA
  //setup origin and FOV
  vec3 o = vec3(0., 0.,-20.);
  float FOV = 1.5 + 1.0*0.8; //higher number = zoomed in
  vec3 cameraDir = normalize(vec3(p, FOV));
  vec3 mouseDir = normalize(vec3(mouse, FOV));

  //RENDER
  vec3 color = vec3(0.);
  color += trace(o, cameraDir, mouse, u_time/5.0);

  float transparency = 1.;
  if(color.r == 0. && color.g == 0. && color.b == 0.) {transparency = 0.;}
  gl_FragColor = vec4(color, transparency);

}
