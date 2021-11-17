import React, { useEffect, useRef, useState } from "react";
import { Box3, Mesh, MeshPhongMaterial, MeshPhysicalMaterial, Vector2, Vector3 } from "three";
import { useStore } from "./Scene";
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
    const flipCameraState = useStore((state) => state.flipped);
    const contentContainerRef = useRef();
    const frameTextRef = useRef<any>(null!);

    const boardShapeWithHoles = useLayoutShape("rectangle");

    const surfaceMaterial = new MeshPhysicalMaterial({
        metalness: 0,
        roughness: 1.145,
        reflectivity: 0.75,
        aoMapIntensity: 1,
        normalScale: new Vector2(1, 1),
        color: 0x000000,
    });
    const sideMaterial = useMeshPhongMaterial({color: "darkgoldenrod"});

    const materials = [surfaceMaterial, sideMaterial];

    const mesh = usePhysicalLayoutMesh(boardShapeWithHoles, materials);

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

    if (!mesh) {
        return null;
    }

    console.log("text position", textPosition);


    return (
        <primitive
            key={mesh.uuid}
            object={mesh}
            position={[0, 0, -(0.0001 / 2)]}
            visible={true}
            name={nodeName}
        />
    );
}

export default React.memo(AbstractLayoutView);
