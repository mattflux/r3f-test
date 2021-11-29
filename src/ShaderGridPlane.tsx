import { MeshProps, useFrame} from "@react-three/fiber";
import { useRef } from "react";
import { shaderMaterial } from "@react-three/drei";

import * as THREE from "three";
import {useGridShaderMaterial} from "./useGridShaderMaterial";

declare global {
    namespace JSX {
        interface IntrinsicElements {
            waveShaderMaterial: any;
        }
    }
}

const ShaderGridPlane = (props: MeshProps) => {
    const planeMesh = useRef<THREE.Mesh>();
    const gridShader = useGridShaderMaterial();

    useFrame(({clock}) => {
        if (planeMesh.current) {
            gridShader.uniforms.u_time.value = clock.oldTime * 0.001;
        }
    });

    // We do 10 subdivisions on the plane mesh.. without it, the derivatives lose precision and cause artifacts.
    return (
        <mesh ref={planeMesh} {...props}>
            <planeGeometry args={[10, 10, 1, 1]} />
            <shaderMaterial attach="material" args={[gridShader]} />
        </mesh>
    );
};
export default ShaderGridPlane;
