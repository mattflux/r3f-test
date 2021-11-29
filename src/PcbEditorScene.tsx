import { useThree } from "@react-three/fiber";
import React, { useEffect } from "react";
import { usePcbVirtualDomStore } from "./PcbVirtualDomStore";
import pcbSelectors from "./pcbSelectors";
import Box from "./components/Box";
import PhysicalLayoutView from "./PhysicalLayoutView";
import AbstractLayoutView from "./AbstractLayoutView";
import PcbLayoutNode from "./PcbLayoutNodeTreeGenerator";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface IPcbEditorSceneProps {
    cameraMode: "2d" | "3d";
}

function PcbEditorScene(_props: IPcbEditorSceneProps) {
    const cameraMode = _props.cameraMode;
    // Redux States
    const rootLevelPcbLayoutNodeUids = usePcbVirtualDomStore(
        pcbSelectors.useRootLevelPcbLayoutNodeUids()
    );
    // const setPosition = useHighFrequencyEditorState((state) => state.setData);

    const camera = useThree((state) => state.camera);
    const gl = useThree((state) => state.gl);

    // useEffect(() => {
    //     gl.domElement.onmousemove = (event) => {
    //         const sceneMousePosition = getSceneMousePosition(event.x, event.y, gl.domElement, camera);
    //         setPosition({
    //             uid: SystemUids.sceneMousePosition,
    //             payload: {
    //                 x: sceneMousePosition.x,
    //                 y: sceneMousePosition.y,
    //             },
    //         });
    //     };

    //     return () => {
    //         gl.domElement.onmousemove = null;
    //     };
    // }, [camera, gl, setPosition]);

    return (
        <>
            {rootLevelPcbLayoutNodeUids?.map((nodeUid) => (
                <PcbLayoutNode uid={nodeUid} key={nodeUid} />
            ))}
        </>
    );
}

export default React.memo(PcbEditorScene);
