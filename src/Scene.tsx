import "./App.css";
import React, { useState, useEffect, Suspense } from "react";
import { OrthographicCamera, PerspectiveCamera } from "@react-three/drei";
import { Stats } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";

import OrthographicNavigationControls from "./OrthographicNavigationControls";
import ShaderGridPlane from "./ShaderGridPlane";
import AbstractLayoutView from "./AbstractLayoutView";
import create from "zustand";
import PerspectiveNavigationControls from "./PerspectiveNavigationControls";
import PhysicalLayoutView from "./PhysicalLayoutView";
import { usePcbVirtualDomStoreSync } from "./PcbVirtualDomStore";
import PcbEditorScene from "./PcbEditorScene";
import { PcbBoardLayer } from "./bakedModels";
import {
    PcbBoardLayerExtended,
    PcbBoardLayerExtendedMap,
} from "./SharedDataModels";

export interface PcbEditorUiState {
    flipped: boolean;
    setFlipped: (f: boolean) => void;
    cameraMode: "2d" | "3d";
    setCameraMode: (m: "2d" | "3d") => void;
    layerVisibilityMap: PcbBoardLayerExtendedMap;
    focussedLayer: PcbBoardLayer | null;
}

export const usePcbEditorUiStore = create<PcbEditorUiState>((set) => ({
    flipped: false,
    setFlipped: (f: boolean) => set((state) => ({ flipped: f })),
    cameraMode: "2d",
    setCameraMode: (m: "2d" | "3d") => set((state) => ({ cameraMode: m })),
    layerVisibilityMap: {},
    focussedLayer: null,
    initLayerVisibilityMap: (layers: PcbBoardLayer[]) => {
        const updatedLayerVisibilityMap: PcbBoardLayerExtendedMap = {};

        layers.forEach((layer) => {
            updatedLayerVisibilityMap[layer.uid] = {
                ...layer,
                hidden: false,
                copperFilled: true,
            };
        });

        set({ layerVisibilityMap: updatedLayerVisibilityMap });
    },
    clearVisibilityMap: () => {
        set({ layerVisibilityMap: {} });
    },
    setFocussedLayer: (focussedLayer: PcbBoardLayer | null) => {
        set((state) => {
            const map = state.layerVisibilityMap;

            if (focussedLayer) {
                let layerUpdated: PcbBoardLayerExtended = {
                    ...map[focussedLayer.uid],
                    hidden: false,
                    copperFilled: true,
                };
                map[focussedLayer.uid] = layerUpdated!;

                return { ...state, focussedLayer: focussedLayer, layers: map };
            }

            return { ...state, focussedLayer: focussedLayer };
        });
    },
}));

/*
What do we need?

- import all relevant types - DONE
- a generator to make an arbitrary Pcb node tree - DONE
- replicate the "virtualDomStore" - DONE
- add Zustand dev tools for debugging - DONE
- replica layout engine to position nodes according to rules

*/

function App() {
    const myCamera = React.useRef();
    const flipped = usePcbEditorUiStore((state) => state.flipped);
    const { cameraMode, setCameraMode } = usePcbEditorUiStore((state) => ({
        cameraMode: state.cameraMode,
        setCameraMode: state.setCameraMode,
    }));
    const is3D = cameraMode === "3d";
    useEffect(() => {
        const onKeyDown = (e: any) => {
            if (e.key === "3") {
                setCameraMode(cameraMode === "2d" ? "3d" : "2d");
            }
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [cameraMode, setCameraMode]);

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
                        <ShaderGridPlane position={[0, 0, 0]} />
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
                <axesHelper args={[1]} />
                <ambientLight />
                <PcbEditorScene cameraMode={is3D ? "3d" : "2d"} />
                <Stats />
            </Canvas>
        </>
    );
}

export default App;
