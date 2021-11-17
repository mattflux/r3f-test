import {GizmoHelper, GizmoViewcube} from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import CameraControls from "./camera-controls";
import { useCallback, useEffect, useRef } from "react";
import * as THREE from "three";
import { Box3, Scene, Vector3 } from "three";
import {useStore} from "./Scene";
import { useNavigationControls } from "./useNavigationControls";

CameraControls.install({ THREE: THREE });

function PerspectiveNavigationControlsContent({controls}: {controls: CameraControls}) {
    const clock = useRef(new THREE.Clock());
    const {camera} = useThree();

    useFrame(() => controls.update(clock.current.getDelta()));
    useNavigationControls(controls);

    const onUpdate = useCallback(() => {
        controls.setLookAt(camera.position.x, camera.position.y, camera.position.z, 0, 0, 0, true);
        controls.dispatchEvent({type: "controlend"});
    }, [camera, controls]);

    return (
        <group>
            <GizmoHelper
                alignment={"top-right"}
                margin={[50, 50]}
                onTarget={() => controls.getTarget(new Vector3())}
                onUpdate={onUpdate}
            >
                <GizmoViewcube />
            </GizmoHelper>
        </group>
    );
}

function buildCameraControls(camera: THREE.OrthographicCamera | THREE.PerspectiveCamera, canvas: HTMLCanvasElement) {
    const controls = new CameraControls(camera, canvas);
    controls.dampingFactor = 0.25;
    controls.draggingDampingFactor = 1;
    controls.dollyToCursor = true;
    controls.infinityDolly = true;

    // touch screens
    controls.touches.one = CameraControls.ACTION.TOUCH_ROTATE;
    controls.touches.two = CameraControls.ACTION.TOUCH_ZOOM_TRUCK;

    // mouse
    controls.mouseButtons.pinch = CameraControls.ACTION.ZOOM;
    controls.mouseButtons.wheel = CameraControls.ACTION.TRUCK;
    controls.mouseButtons.right = CameraControls.ACTION.NONE;

    controls.updateCameraUp();
    return controls;
}


// We get called with both our custom camera and the default r3f canvas camera so we need
// to do some wrapping to manage orbitcontrols correctly.
export default function PerspectiveNavigationControls() {
    const { camera, scene } = useThree();
    const gl = useThree((state) => state.gl);
    const controlsRef = useRef<CameraControls>();
    const flipped = useStore(state => state.flipped);

    const zoomToFit = useCallback(async () => {
        const controls = controlsRef.current;
        const bounds = calculateBoundingBox(scene, {});
        const padding = 0.01;
        if (bounds && controls) {
            await controls.reset(false);
            if (flipped) {
                controls?.rotateTo(Math.PI, Math.PI);
            } else {
                controls?.rotateTo(0, 0);
            }
            await controls.update(1);

            await controls.fitToBox(bounds, true, {
                paddingLeft: padding,
                paddingRight: padding,
                paddingTop: padding,
                paddingBottom: padding,
            });
        }
    }, [scene, flipped]);

    function calculateBoundingBox(
        scene: Scene,
        selectedPcbNodes: { [nodeId: string]: boolean }
    ) {
        const bounds = new Box3();
        let boxEmpty = true;
        scene.traverse((object) => {
            const anyPcbNodesSelected = Object.values(selectedPcbNodes).length;
            const includeInCalculation =
                (!anyPcbNodesSelected && object.userData.id) ||
                selectedPcbNodes[object.userData.id];
            if (includeInCalculation) {
                const b = new Box3();
                b.expandByObject(object);
                bounds.union(b);
                boxEmpty = false;
            }
        });
        if (boxEmpty) {
            return null;
        }
        // we only care about the bounding box on the x/y plane
        bounds.min.z = 0;
        bounds.max.z = 0;
        return bounds;
    }
    useEffect(() => {
        const cb = (e: KeyboardEvent) => {
            if (e.key === "z") {
                zoomToFit();
            }
        };
        window.addEventListener("keydown", cb);
        return () => window.removeEventListener("keydown", cb);
    }, [zoomToFit]);

    useEffect(() => {
        // Wait until three has activated the camera we want.
        if (!camera.userData?.main3d) return;

        controlsRef.current = buildCameraControls(camera, gl.domElement);
        return () => {
            controlsRef.current?.dispose();
        };
    }, [camera, gl.domElement]);

    if (controlsRef.current) {
        return (
            <PerspectiveNavigationControlsContent
                controls={controlsRef.current}
            />
        );
    } else {
        return null;
    }
}
