
#ifdef GL_ES
precision mediump float;
#endif

    //CONFIG
//raymarching
#define MAX_RAYMARCH_STEPS 32
#define SURFACE_DIST 0.005

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_smoothness;
uniform float u_operation;
uniform float u_boxness;

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

float smin( float a, float b, float k )
{
    float h = max( k-abs(a-b), 0.0 )/k;
    return min( a, b ) - h*h*h*k*(1.0/6.0);
}

float sphere(vec3 pos, vec2 mouse, float t){
  float radius = 0.3;

  return distance(pos, vec3(mouse.x, mouse.y, 0.))-radius;
}

float box(vec3 pos, vec2 mouse, float t){
  float size = 0.5;

  vec3 p = rotateY(t)*rotateX(t)*pos;
  vec3 b = vec3(size);
  vec3 q = abs(p) -b;
  float res = length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
  float res_sphere = distance(pos, vec3(0.))-size;
  return mix(res_sphere, res, u_boxness);
}

vec4 DE(vec3 pos, vec2 mouse, float t) {
  float b = box(pos, mouse, t);
  float s = sphere(pos, mouse, t);
  vec3 b_colour = vec3(0.9294, 0.6745, 0.12156);
  vec3 s_colour = vec3(0.12156, 0.58039, 0.9294);
  vec3 mixed_colour = vec3(0.12156, 0.9294, 0.1333);
  vec3 c;
  if (u_operation < 0.5) {
    // union
    if (b < s) {
      c = b_colour;
    } else {
      c = s_colour;
    }
    return vec4(smin(b,s, u_smoothness), c);
  } else {
    // intersect
    c = mixed_colour;
    return vec4(-smin(-b,-s, u_smoothness), c);
  }
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
  color *= 1.-float(s)/20.;
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
  vec3 o = vec3(0.,0.,-4.);
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
