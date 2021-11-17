import "./App.css";
import React, { useState, useEffect, Suspense } from "react";
import Box from "./components/Box";
import { OrthographicCamera, PerspectiveCamera } from "@react-three/drei";
import { Stats } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import * as dat from "dat.gui";

import OrthographicNavigationControls from "./OrthographicNavigationControls";
import ShaderGridPlane from "./ShaderGridPlane";
import AbstractLayoutView from "./AbstractLayoutView";
import create from "zustand";
import PerspectiveNavigationControls from "./PerspectiveNavigationControls";
import PhysicalLayoutView from "./PhysicalLayoutView";

const gui = new dat.GUI();

const defaultGridZ = -11;

export const useStore = create<{
    flipped: boolean;
    setFlipped: (f: boolean) => void;
}>((set) => ({
    flipped: false,
    setFlipped: (f: boolean) => set((state) => ({ flipped: f })),
}));

function App() {
    const myCamera = React.useRef();
    const [gridZ, setGridZ] = useState(defaultGridZ);
    const flipped = useStore((state) => state.flipped);
    const [is3D, setIs3D] = useState(true);

    useEffect(() => {
        gui.add({ gridZ: defaultGridZ }, "gridZ").onChange((z) => {
            setGridZ(z);
        });
    }, []);

    return (
        <>
            <p
                style={{
                    position: "absolute",
                    fontSize: 40,
                    zIndex: 1000,
                    color: "pink",
                }}
            >
                {flipped ? "flipped" : "not flipped"}
            </p>
            <Canvas
                style={{
                    position: "fixed",
                    top: 0,
                    height: "100vh",
                    background: "black",
                }}
                gl={{ antialias: true }}
                dpr={window.devicePixelRatio}
            >
                <Suspense fallback={null}>
                    {is3D ? <ShaderGridPlane position={[0, 0, -0.2]} /> : <ShaderGridPlane position={[0, 0, flipped ? 11 : -11]} />}
                </Suspense>
                {is3D ? (
                    <>
                        <PerspectiveCamera
                            position={[0, 0, 1]}
                            up={[0, 0, 1]}
                            makeDefault={is3D}
                            far={10000}
                            near={0.001}
                            userData={{main3d: true}}
                        />
                        <PerspectiveNavigationControls />
                    </>
                ) : (
                    <>
                        <OrthographicCamera
                            position={[0, 0, 1]}
                            up={[0, 0, 1]}
                            makeDefault={!is3D}
                            far={10000}
                            near={0.001}
                            zoom={100}
                            userData={{ main2d: true }}
                            ref={myCamera}
                        />
                        <OrthographicNavigationControls />
                    </>
                )}
                <group>
                    <axesHelper args={[1]} />
                    <ambientLight />
                    <Box position={[0, 0.1, 0]} />
                    <Box position={[0.1, 0.1, 0]} />
                    <Box position={[0.2, 0.1, 0]} />
                    <Box position={[0.3, 0.1, 0]} />
                    <Box position={[0, -0.1, 0]} />
                    <group name={"layout"}>
                        {is3D ? <PhysicalLayoutView uid={"layout"} /> : <AbstractLayoutView uid={"layout"} />}
                    </group>
                </group>
                <Stats />
            </Canvas>
        </>
    );
}

export default App;
