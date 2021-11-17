import { extend, MeshProps, useFrame, useLoader } from "@react-three/fiber";
import { useRef } from "react";
import { shaderMaterial } from "@react-three/drei";
import glsl from "babel-plugin-glsl/macro";
import texture from "./photo.jpg";

import * as THREE from "three";
import {DoubleSide} from "three";

declare global {
    namespace JSX {
        interface IntrinsicElements {
            waveShaderMaterial: any;
        }
    }
}

const WaveShaderMaterial = shaderMaterial(
    // Uniform
    {
        uTime: 0,
        uColor: new THREE.Color(0.0, 0.0, 0.0),
        uTexture: new THREE.Texture(),
    },
    // Vertex Shader
    glsl`
    precision mediump float;
    varying vec2 vUv;
    varying float vWave;
    uniform float uTime;
    #pragma glslify: snoise3 = require(glsl-noise/simplex/3d);
    void main() {
      vUv = uv;
      vec3 pos = position;
      float noiseFreq = 2.0;
      float noiseAmp = 0.4;
      vec3 noisePos = vec3(pos.x * noiseFreq + uTime, pos.y, pos.z);
      pos.z += snoise3(noisePos) * noiseAmp;
      vWave = pos.z;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);  
    }
  `,
    // Fragment Shader
    glsl`
    precision mediump float;
    uniform vec3 uColor;
    uniform float uTime;
    uniform sampler2D uTexture;
    varying vec2 vUv;
    varying float vWave;
    void main() {
      float wave = vWave * 0.2;
      vec3 texture = texture2D(uTexture, vUv + wave).rgb;
      gl_FragColor = vec4(texture, 1.0); 
    }
  `
);

extend({ WaveShaderMaterial });

const ShaderGridPlane = (props: MeshProps) => {
    const planeMesh = useRef<THREE.Mesh>();
    const ref = useRef({ uTime: 0 });

    useFrame(({ clock }) => (ref.current.uTime = clock.getElapsedTime()));

  const [image] = useLoader(THREE.TextureLoader, [
      `
https://images.unsplash.com/photo-1624054241012-b05191cc5ea8?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=774&q=80      `
    ]);

    // We do 10 subdivisions on the plane mesh.. without it, the derivatives lose precision and cause artifacts.
    return (
        <mesh ref={planeMesh} {...props}>
            <planeGeometry args={[10, 10, 1, 1]} />
            <waveShaderMaterial uColor={"black"} ref={ref} uTexture={image} side={DoubleSide} />
        </mesh>
    );
};
export default ShaderGridPlane;
