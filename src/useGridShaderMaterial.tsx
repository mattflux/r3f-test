import {useMemo} from "react";
import {Vector4, DoubleSide} from "three";

export const useGridShaderMaterial = (side = DoubleSide) => {
    return useMemo(() => {
        /**
         * Antialiased grid shader based on madebyevans demos.
         */
        const material = {
            uniforms: {
                u_time: {type: "f", value: 0},
                uColor: {type: "vec4", value: new Vector4(1, 0.8, 0.9, 1)},
                uGridSpacing: {type: "f", value: 0.01},
                uRadius: {type: "f", value: 10},
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
            vertexShader: `
                //precision highp float;
                uniform float u_time;
                varying vec3 vertex; 
                varying vec3 vPosition;
                varying vec2 vUv;
                varying vec4 mvPosition;

                varying vec3 vCameraWorldPosition;
                void main() {
                    mvPosition = modelViewMatrix * vec4(position, 1.);
                    vPosition = position.xyz;
                    vertex = (modelMatrix * vec4( vPosition, 1.0 )).xyz;
                    gl_Position = projectionMatrix * mvPosition;
                    vUv = uv;

                    vCameraWorldPosition = inverse(viewMatrix)[3].xyz;
                }
            `,
            fragmentShader: `
                uniform float u_time;
                uniform vec4  uColor;
                uniform float uRadius;
                uniform float uGridSpacing;
                uniform mat4  projectionMatrix;

                varying vec2 vUv;
                varying vec3 vertex;
                varying vec3 vPosition;
                varying vec4 mvPosition;
                varying vec3 vCameraWorldPosition;

                const float minLineThickness = 1.5;

                float computeGrid(vec2 coord,float spacing){
                    vec2 vertxy = coord / spacing;
                    vec2 grid = abs(fract(vertxy - 0.5) - 0.5) / (fwidth(vertxy) * minLineThickness);
                    float line = min(grid.x, grid.y);
                    line = (1.0 - min(line, 1.0));
                    return line;
                }

                //Used for per fragment adaptive resolution.. but not right now.
                float nearestPow(float val,float power) {
                    return pow(power, round(log(val) / log(power)));
                }
                float max2 (vec2 v) {
                    return max (v.x, v.y);
                }
                float min2 (vec2 v) {
                    return min (v.x, v.y);
                }
                void main() {
                    float isOrtho = projectionMatrix[3].w;
                    vec2 vxy = vertex.xy;
            
                   // float ring = 1.-min(1.,length(vPosition.xy-vCameraWorldPosition.xy) / uRadius);

                    float ring = 1.-min(1.,length(vPosition.xy) / uRadius);
                    //float pr9 = pow(ring,9.);
                    float pr19 = pow(ring,19.);
                    float gridSpacing = uGridSpacing;

                    if(isOrtho>0.)
                    {
                        //gridSpacing = gridSpacing + nearestPow(min2( fwidth(vxy)*100. ), 10.);
                        gridSpacing =  nearestPow(min2( fwidth(vxy)*1000. ), 2.) *.1;
                    }else{
                        gridSpacing = nearestPow( abs(vCameraWorldPosition.z) , 2.) *.1;
                    }

                    vec4 lineColor = uColor;


                    float nlz = gl_FragCoord.z / gl_FragCoord.w;

                    float line = computeGrid( vxy , gridSpacing);   //Major lines
                    
                    float line1 = computeGrid( vxy, gridSpacing * .1);  //Sub lines

                    
                    float fdworld = min2( fwidth(vxy) * minLineThickness );
                    float threshold = fdworld;
                    if(min(abs(vxy.x),abs(vxy.y)) < threshold) lineColor.rgb = vec3(.5,.5,1.);  //Blue central axis line on X/Y..
            
                    if(isOrtho > .0) //Orthographic camera
                    {
                        float fdworld2 = max2( fwidth(vxy) * 1e5 );
                        //float fdworld2 = max2( fwidth(vUv) * 1e5 );

                        float lineFade =  1.;// * smoothstep(3.,.0, fdworld2*2. ); 
                        float line1fade =  .1;// * smoothstep(.2,.0, fdworld2*2. );


                        line = max( line * lineFade, line1 * line1fade);
                        
                        //lineColor.a = 1.-fdworld2;

                        
                        lineColor.a *= line; //min(1.,min(pr19,line));   //Fade in a ring

                    }else{
                        float lineFade =  1.; //* smoothstep(3.,.0, nlz ); 
                        float line1fade =  .1; //* smoothstep(.2,.0, nlz );

                        line = max( line * lineFade, line1 * line1fade);
                        
                        lineColor.a *= line;
                        lineColor.a *= min(1.,pr19);   //Fade in a ring
                    }


                    gl_FragColor = lineColor;
                }
            `,
        };
        return material;
    }, [side]);
};
