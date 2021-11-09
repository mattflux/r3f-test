import {useThree} from "@react-three/fiber";
import CameraControls from "camera-controls";
// import keycode from "keycode";
import {useCallback, useEffect, useState} from "react";
// import {useSelector} from "react-redux";
import {PerspectiveCamera} from "three";

// import {isMobile} from "../../../../../../../helpers/platform";
// import selectors from "../../../../../../../redux_selectors";
// import R from "../../../../../../../resources/Namespace";
// import {InteractionControls} from "../common/InteractionControls";
// import {HotKeysHelper} from "../hotkeys/helpers/HotKeysHelper";
// import {usePcbEditorUiStore} from "../pcb_editor/state/PcbEditorUiStore";

export function useNavigationControls(controls: CameraControls) {
    const {camera, gl} = useThree();
    // const anySelected = useSelector(selectors.document.baseDocument.useIsAnySubjectSelected());
    const [mouseIsDown, setMouseIsDown] = useState(false);
    // const interact = usePcbEditorUiStore((s) => s.interact);
    const interactionState = "DEFAULT" as "PANNING" | "DEFAULT";
    const is3D = camera instanceof PerspectiveCamera;

    // const onKeyDown = useCallback(
    //     (event: KeyboardEvent) => {
    //         if (keycode(event) === "space" && !HotKeysHelper.inputFieldIsActive()) {
    //             interact("START_PANNING");
    //         }
    //     },
    //     [interact],
    // );

    // const onKeyUp = useCallback(
    //     (event: KeyboardEvent) => {
    //         if (keycode(event) === "space" && interactionState === "PANNING") {
    //             interact("END_INTERACTION");
    //             // Restore button config when we're done panning.
    //             return;
    //         }

    //         const speed =
    //             camera instanceof PerspectiveCamera
    //                 ? R.behaviors.navigation_controls.pcb_key_pan_speed
    //                 : R.behaviors.navigation_controls.key_pan_speed;
    //         const offset = InteractionControls.calculateKeyPanOffset(camera, keycode(event), speed);
    //         if (offset && !anySelected && !HotKeysHelper.inputFieldIsActive()) {
    //             event.preventDefault();
    //             controls.truck(offset.x, -offset.y, false);
    //         }
    //     },
    //     [interactionState, camera, anySelected, interact, controls],
    // );

    const onMouseDown = useCallback(() => {
        setMouseIsDown(true);
    }, []);

    const onMouseUp = useCallback(() => {
        setMouseIsDown(false);
    }, []);

    // useEffect(() => {
    //     if (isMobile()) return;

    //     gl.domElement.addEventListener("mousedown", onMouseDown, {passive: true});
    //     gl.domElement.addEventListener("mouseup", onMouseUp, {passive: true});

    //     window.addEventListener("keydown", onKeyDown, {passive: true});
    //     window.addEventListener("keyup", onKeyUp);

    //     return () => {
    //         gl.domElement.removeEventListener("mousedown", onMouseDown);
    //         gl.domElement.removeEventListener("mouseup", onMouseUp);

    //         window.removeEventListener("keydown", onKeyDown);
    //         window.removeEventListener("keyup", onKeyUp);
    //     };
    // }, [camera, gl, onKeyDown, onKeyUp, onMouseDown, onMouseUp]);

    useEffect(() => {
        if (interactionState === "PANNING") {
            controls.mouseButtons.left = CameraControls.ACTION.TRUCK;
            if (mouseIsDown) {
                gl.domElement.style.cursor = "grabbing";
            } else {
                gl.domElement.style.cursor = "grab";
            }
        } else if (interactionState === "DEFAULT") {
            if (is3D) {
                controls.mouseButtons.left = CameraControls.ACTION.ROTATE;
            } else {
                controls.mouseButtons.left = CameraControls.ACTION.NONE;
            }
            gl.domElement.style.cursor = "default";
        }
    }, [gl.domElement.style, interactionState, mouseIsDown, controls.mouseButtons, is3D]);
}
