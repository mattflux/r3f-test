import {useThree} from "@react-three/fiber";
import CameraControls from "camera-controls";
// import {clamp} from "lodash";
import {useCallback, useEffect, useMemo} from "react";
// import {useSelector} from "react-redux";
import {Box3, Group, PerspectiveCamera, Scene, Vector3} from "three";

// import {isMobile} from "../../../../../../../helpers/platform";
// import selectors from "../../../../../../../redux_selectors";
// import R from "../../../../../../../resources/Namespace";
// import {InteractionControls, ZoomDirection} from "../common/InteractionControls";
// import {HotKeysHelper} from "../hotkeys/helpers/HotKeysHelper";

// import {usePcbEditorCommands} from "./usePcbEditorCommands";

function calculateBoundingBox(scene: Scene) {
    const bounds = new Box3();
    let boxEmpty = true;
    scene.traverse((object) => {
        const includeInCalculation = object instanceof Group;
        if (includeInCalculation) {
            const b = new Box3();
            b.expandByObject(object);
            b.min.z = 0;
            bounds.union(b);
            boxEmpty = false;
        }
    });
    return boxEmpty ? null : bounds;
}

export function useZoomControls(controls: CameraControls) {
    const {camera, gl, scene} = useThree();
    const command = {
        type: "NONE"
    };
    // const selectedPcbNodes = useSelector(selectors.document.baseDocument.selectSelectedPcbNodeIds);

    // const selectedPcbNodesMap = useMemo(() =>
    //     selectedPcbNodes?.reduce((acc: {[nodeId: string]: boolean}, curr: string) => {
    //         acc[curr] = true;
    //         return acc;
    //     }, {}) || {}
    // , [selectedPcbNodes]);

    const zoomToFit = useCallback(async () => {   
        const bounds = calculateBoundingBox(scene);
        const padding = 0.01;
        if (bounds) {
            await controls.reset(false);
            await controls.update(1);
            await controls.fitToBox(bounds, true, {
                paddingLeft: padding,
                paddingRight: padding,
                paddingTop: padding,
                paddingBottom: padding,
            });
        }
    }, [controls, scene]);

    // const onKeyUp = useCallback(
    //     (event: KeyboardEvent) => {
    //         function zoomStep(zoomDirection: ZoomDirection) {
    //             if (InteractionControls.isOrthographicCamera(camera)) {
    //                 const {min, max, step} = R.behaviors.zoom_controls.pcb_zoom;
    //                 const factor = 1 + (zoomDirection === "in" ? step : -step);
    //                 const clampedZoom = clamp(camera.zoom * factor, min, max);
    //                 controls.zoomTo(clampedZoom, false);
    //             } else {
    //                 const {min, max, step} = R.behaviors.zoom_controls.pcb_dolly;
    //                 const factor = 1 + (zoomDirection === "in" ? -step : step);
    //                 const clampedDistance = clamp(controls.distance * factor, min, max);
    //                 controls.dollyTo(clampedDistance, false);
    //             }
    //         }

    //         if (HotKeysHelper.isHotkey(R.keyCommands.zoomToFit.keys, event)) {
    //             event.preventDefault();
    //             zoomToFit();
    //         }

    //         if (HotKeysHelper.isHotkey(R.keyCommands.zoom_in.keys, event)) {
    //             event.preventDefault();
    //             zoomStep("in");
    //         }

    //         if (HotKeysHelper.isHotkey(R.keyCommands.zoom_out.keys, event)) {
    //             event.preventDefault();
    //             zoomStep("out");
    //         }
    //     },
    //     [camera, controls, zoomToFit],
    // );

    useEffect(() => {
        if (command && command.type === "ZOOM_TO_FIT") {
            zoomToFit();
        }
    }, [command, zoomToFit]);

    // useEffect(() => {
    //     if (isMobile()) return;

    //     window.addEventListener("keyup", onKeyUp);

    //     return () => {
    //         window.removeEventListener("keyup", onKeyUp);
    //     };
    // }, [camera, gl, onKeyUp]);
}
