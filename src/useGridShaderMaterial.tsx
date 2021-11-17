import { Vector4, DoubleSide } from "three";

export const useGridShaderMaterial = (side = DoubleSide) => {
    /**
     * Antialiased grid shader based on madebyevans demos.
     */
    const material = {
        uniforms: {
            u_time: { type: "f", value: 0 },
            uColor: { type: "vec4", value: new Vector4(1, 0.8, 0.9, 1) },
            uGridSpacing: { type: "f", value: 0.01 },
            uRadius: { type: "f", value: 5 },
        },
        transparent: true,
        depthWrite: false,
        side,
        polygonOffset: true,
        polygonOffsetFactor: 10,
        polygonOffsetUnits: 10,
        extensions: {
            derivatives: true,
        },
        fragmentShader: `
// Author @patriciogv - 2015
// Title: Zigzag

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;


vec2 mirrorTile(vec2 _st, float _zoom){
    _st *= _zoom;
    if (fract(_st.y * 0.5) > 0.5){
        _st.x = _st.x+0.5;
        _st.y = 1.0-_st.y;
    }
    return fract(_st);
}

float fillY(vec2 _st, float _pct,float _antia){
  return  smoothstep( _pct-_antia, _pct, _st.y);
}

void main(){
  vec2 st = gl_FragCoord.xy/u_resolution.xy;
  vec3 color = vec3(0.0);

  st = mirrorTile(st*vec2(1.,2.),5.);
  float x = st.x*2.;
  float a = floor(1.+sin(x*3.14));
  float b = floor(1.+sin((x+1.)*3.14));
  float f = fract(x);

  color = vec3( fillY(st,mix(a,b,f),0.01) );

  gl_FragColor = vec4( color, 1.0 );
}

            `,
    };
    return material;
};
