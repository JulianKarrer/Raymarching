
#ifdef GL_ES
precision mediump float;
#endif

    //CONFIG
//raymarching
#define MAX_RAYMARCH_STEPS 32
#define SURFACE_DIST 0.005
//mandelbulb
#define POWER 3.
#define MANDELBULB_MAX_ITERATIONS 32
#define R 2.


uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;


float currentPow(){
  return POWER + 5.0*u_mouse.y/u_resolution.y;
}

//distance estimator calculates the distance to the rendered object given a point in space
//returns the distance and number of steps until divergant
vec2 DE(vec3 pos) {
    //from http://blog.hvidtfeldts.net/index.php/2011/06/distance-estimated-3d-fractals-part-i/
    float Power = currentPow();
	vec3 z = pos;
	float dr = 1.0;
	float r = 0.0;
  int iterations = 0;
  float smoothie = 0.0;
	for (int i = 0; i < MANDELBULB_MAX_ITERATIONS; i++){
        iterations = i; //keep track of i to determine escape speed
		r = length(z);
		if (r>R) break;

		// convert to polar coordinates
		float theta = acos(z.z/r);
		float phi = atan(z.y,z.x);
		dr =  pow( r, Power-1.0)*Power*dr + 1.0;

		// scale and rotate the point
		float zr = pow( r,Power);
		theta = theta*Power;
		phi = phi*Power;

		// convert back to cartesian coordinates
		z = zr*vec3(sin(theta)*cos(phi), sin(phi)*sin(theta), cos(theta));
		z+=pos;
        smoothie =  float(iterations) + log(log(R*R))/log(POWER) - log(log(dot(z,z)))/log(POWER);
	}
	return vec2( 0.5*log(r)*r/dr, float(smoothie) );
}

//raymarching to object defined by DE()
vec2 trace(vec3 o, vec3 r){
	float d = 0.;
	int s = 0;
	for (int i = 0; i < MAX_RAYMARCH_STEPS; i ++){
		vec3 p = o + r * d;
		float cur_d = DE(p).x;
        d += cur_d;
		s = i;
		if (cur_d < SURFACE_DIST) break;
	}
	//return the objects estimated distance and number of steps to get there
	return vec2(float(s)/float(MAX_RAYMARCH_STEPS), DE(o+r*d).y);
}

        //GRAPHICS FUNCTIONS

vec3 hsv2rgb( in vec3 c ){
    //via https://www.shadertoy.com/view/MsS3Wc
    vec3 rgb = clamp( abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0, 0.0, 1.0 );
    return c.z * mix( vec3(1.0), rgb, c.y);
}

vec3 colorize(vec2 res){
    //brightness
    float b = pow(res.x, 0.42);  //reduce brightness in pow, increase linearly in return -> contrast
    b = 1.-b;
    //colour
    float c = 1.-res.y/(float(MAX_RAYMARCH_STEPS)*0.5);
    c += 1.0;
    c = mod(c, 1.);

    float currentPow =  currentPow();
    return mix(vec3(0.), hsv2rgb(vec3(c,.4, b*1.5)), res.y * (currentPow/(POWER+3.)  ));
}


        //MAIN FUNCTION

void main( void ) {
    //UV
	//normalize uv to [-1;1] and adjust aspect ratio
    vec2 p = (gl_FragCoord.xy * 2. - u_resolution) / min(u_resolution.x, u_resolution.y);
    vec2 uv = gl_FragCoord.xy / u_resolution;

    //CAMERA
    //setup origin and FOV
    vec3 o = vec3(0.,0.,-4.);
    float FOV = 1.5 + 1.0*0.8; //higher number = zoomed in
    vec3 cameraDir = normalize(vec3(p, FOV));

    //make the camera rotate
    float t = u_mouse.x/u_resolution.x * 2.0;

    o.xz         *= mat2(cos(t), -sin(t), sin(t), cos(t));
    cameraDir.xz *= mat2(cos(t), -sin(t), sin(t), cos(t));

    o.xy         *= mat2(cos(t), -sin(t), sin(t), cos(t));
    cameraDir.xy *= mat2(cos(t), -sin(t), sin(t), cos(t));

    o.yz         *= mat2(cos(t), -sin(t), sin(t), cos(t));
    cameraDir.yz *= mat2(cos(t), -sin(t), sin(t), cos(t));

    //RENDER

    vec3 color = vec3(0.);
    color +=  colorize(trace(o, cameraDir));

    float transparency = 1.;
    if(color.r == 0. && color.g == 0. && color.b == 0.) {transparency = 0.;}
	  gl_FragColor = vec4(color, transparency);

}
