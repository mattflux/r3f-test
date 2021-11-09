import {useFrame, useThree} from "@react-three/fiber";
import CameraControls from "camera-controls";
import {useEffect, useRef} from "react";
import * as THREE from "three";
import {useNavigationControls} from "./useNavigationControls";
import {useZoomControls} from "./useZoomControls";

// import R from "../../../../../../../../../../resources/Namespace";
// import {FluxCamera} from "../../../../common/InteractionControls";
// import {useFlipCameraState} from "../../../../hooks/useFlipCameraState";
// import {useNavigationControls} from "../../../../hooks/useNavigationControls";
// import {useViewStatePersistence} from "../../../../hooks/useViewStatePersistence";
// import {useZoomControls} from "../../../../hooks/useZoomControls";

CameraControls.install({THREE: THREE});

function OrthographicNavigationControlsContent({controls}: {controls: CameraControls}) {
    const clock = useRef(new THREE.Clock());

    useFrame(() => controls.update(clock.current.getDelta()));
    useNavigationControls(controls);
    useZoomControls(controls);
    // useFlipCameraState(controls);
    // useViewStatePersistence(controls);

    return <primitive object={controls} />;
}

// Note @matt: until InteractionControls.buildOrbitControls is removed, it should have a similar config to this
function buildCameraControls(camera: THREE.OrthographicCamera, canvas: HTMLCanvasElement) {
    const controls = new CameraControls(camera, canvas);
    controls.dampingFactor = 0.6;
    controls.draggingDampingFactor = 1;
    controls.touches.one = CameraControls.ACTION.TOUCH_TRUCK;
    controls.mouseButtons.left = CameraControls.ACTION.NONE;
    controls.mouseButtons.right = CameraControls.ACTION.NONE;
    controls.mouseButtons.wheel = CameraControls.ACTION.ZOOM;
    controls.updateCameraUp();
    return controls;
}

// We get called with both our custom camera and the default r3f canvas camera so we need
// to do some wrapping to manage orbitcontrols correctly.
export default function OrthographicNavigationControls() {
    const camera: THREE.OrthographicCamera = useThree((state) => state.camera) as THREE.OrthographicCamera;
    const gl = useThree((state) => state.gl);
    const controls = useRef<CameraControls>();

    useEffect(() => {
        console.log("hello", camera);
        // Wait until three has activated the camera we want.
        if (!camera.userData?.main2d) return;

        controls.current = buildCameraControls(camera, gl.domElement);
        console.log("building controls", controls.current);
        return () => {
            controls.current?.dispose();
        };
    }, [camera, gl.domElement]);

    if (controls.current) {
        return <OrthographicNavigationControlsContent controls={controls.current} />;
    } else {
        return null;
    }
}
