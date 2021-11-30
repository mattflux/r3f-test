import React, { useEffect, useRef, useState } from "react";
import { Box3, Mesh, MeshPhongMaterial, Vector3 } from "three";
import { usePcbEditorUiStore } from "./Scene";
import { Text } from "@react-three/drei";

import useAbstractLayoutMesh from "./useAbstractLayoutMesh";
import useLayoutShape from "./useLayoutShape";
import usePhysicalLayoutMesh from "./usePhysicalLayoutMesh";
import {useFrame, useThree} from "@react-three/fiber";

const useMeshPhongMaterial = (parameters: any) => {
    return new MeshPhongMaterial(parameters);
};

const frameFontSize = 0.0015;

function getFrameFontSize(zoom: number) {
    return frameFontSize / (zoom / 10000);
}

function AbstractLayoutView(props: any) {
    // TODO pcbLayoutNodeHoles is dirty everytime...so had to put in isEqual for now until thats fixed
    const { nodeName } = { nodeName: "layout" };
    const {camera} = useThree();
    const flipCameraState = usePcbEditorUiStore((state) => state.flipped);
    const forceFillMeshToBack = flipCameraState ? 0.001 : -0.001;
    const contentContainerRef = useRef();
    const frameTextRef = useRef<any>(null!);

    const boardShapeWithHoles = useLayoutShape("rectangle");

    const fillMaterial = useMeshPhongMaterial({ color: "purple", transparent: true, opacity: 0.2 });
    const materials = [fillMaterial, fillMaterial];

    const outlineMesh = useAbstractLayoutMesh(boardShapeWithHoles);
    const fillMesh = usePhysicalLayoutMesh(boardShapeWithHoles, materials);

    const [textPosition, setTextPosition] = useState<[number, number, number]>([0, 0, 0]);

    useEffect(() => {
        if (contentContainerRef.current) {
            const bbox = new Box3().setFromObject(contentContainerRef.current);

            if (!bbox.isEmpty()) {
                const size = new Vector3();
                bbox.getSize(size);

                if (size) {
                    if (flipCameraState) {
                        setTextPosition([size.x / 2, size.y / 2, 0]);
                    } else {
                        setTextPosition([-size.x / 2, size.y / 2, 0]);
                    }
                }
            }
        }
    }, [flipCameraState]);

    useFrame(() => {
        if (frameTextRef.current) {
            frameTextRef.current.fontSize = getFrameFontSize(camera.zoom);
        }
    });

    if (!outlineMesh || !fillMesh) {
        return null;
    }

    const hp = Math.PI;

    return (
        <group>
            <group position={textPosition} name={"frameTextContainer"}>
                <Text
                    name={"frameText"}
                    ref={frameTextRef}
                    // raycast={meshBounds}
                    // onPointerOver={handlePointerOver}
                    // onPointerOut={handlePointerOut}
                    // onClick={handleOnFrameTextClick}
                    fontSize={getFrameFontSize(camera.zoom)}
                    color="black"
                    textAlign={"left"}
                    anchorX="left"
                    anchorY="bottom"
                    rotation={[
                        0,
                        flipCameraState ? hp : 0,
                        0,
                    ]}
                >
                    {"Hello!"}
                </Text>
            </group>
            <group ref={contentContainerRef} userData={{ id: props.uid }}>
                <primitive
                    visible={true}
                    key={outlineMesh.uuid}
                    object={outlineMesh}
                    name={nodeName}
                ></primitive>
                <primitive
                    key={fillMesh.uuid}
                    object={fillMesh}
                    position={[0, 0, forceFillMeshToBack]}
                    name={nodeName}
                />
            </group>
        </group>
    );
}

export default React.memo(AbstractLayoutView);
