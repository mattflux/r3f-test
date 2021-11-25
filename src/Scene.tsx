import "./App.css";
import React, { useState, useEffect, Suspense } from "react";
import Box from "./components/Box";
import { OrthographicCamera, PerspectiveCamera } from "@react-three/drei";
import { Stats } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";

import OrthographicNavigationControls from "./OrthographicNavigationControls";
import ShaderGridPlane from "./ShaderGridPlane";
import AbstractLayoutView from "./AbstractLayoutView";
import create from "zustand";
import PerspectiveNavigationControls from "./PerspectiveNavigationControls";
import PhysicalLayoutView from "./PhysicalLayoutView";
import {usePcbVirtualDomStoreSync} from "./PcbVirtualDomStore";

export const useStore = create<{
    flipped: boolean;
    setFlipped: (f: boolean) => void;
}>((set) => ({
    flipped: false,
    setFlipped: (f: boolean) => set((state) => ({ flipped: f })),
}));

/*
What do we need?

- import all relevant types - DONE
- a generator to make an arbitrary Pcb node tree - DONE
- replicate the "virtualDomStore" - DONE
- add Zustand dev tools for debugging
- replica layout engine to position nodes according to rules

*/

function App() {
    const myCamera = React.useRef();
    const flipped = useStore((state) => state.flipped);
    const [is3D, setIs3D] = useState(true);

    useEffect(() => {
        const onKeyDown = (e: any) => {
            console.log(e);
            if (e.key === "3") {
                setIs3D(!is3D);
            }
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [is3D]);

    usePcbVirtualDomStoreSync();

    return (
        <>
            <p
                style={{
                    position: "absolute",
                    fontSize: 40,
                    zIndex: 1000,
                    top: "10vh",
                    color: "pink",
                }}
            >
                {flipped ? "flipped" : "not flipped"}
            </p>
            <div style={{ height: "10vh", background: "white", width: "100%" }}>
                Header
            </div>
            <Canvas
                style={{
                    top: 0,
                    height: "90vh",
                    background: "black",
                }}
                gl={{ antialias: true }}
                dpr={window.devicePixelRatio}
            >
                <Suspense fallback={null}>
                    {is3D ? (
                        <ShaderGridPlane position={[0, 0, -0.2]} />
                    ) : (
                        <ShaderGridPlane
                            position={[0, 0, flipped ? 11 : -11]}
                        />
                    )}
                </Suspense>
                {is3D ? (
                    <>
                        <PerspectiveCamera
                            position={[0, 0, 1]}
                            up={[0, 0, 1]}
                            makeDefault={is3D}
                            far={10000}
                            near={0.001}
                            userData={{ main3d: true }}
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
                        {is3D ? (
                            <PhysicalLayoutView uid={"layout"} />
                        ) : (
                            <AbstractLayoutView uid={"layout"} />
                        )}
                    </group>
                </group>
                <Stats />
            </Canvas>
        </>
    );
}

export default App;
