import {useFrame} from "@react-three/fiber";
import React, {useMemo} from "react";
import {Object3D, Scene, Vector3} from "three";
import {Line2, LineGeometry} from "three-stdlib";
import {getSceneObjectByUuid, IPcbNodeToObject3dMapStore, usePcbNodeToObject3dMapStore} from "../PcbNodeToObject3dMapStore";
import {IApplicationState, IElementTerminalData} from "../SharedDataModels";
import useSelector from "../useSelector";
import {IPcbLayoutBaseNodeProps} from "./PcbLayoutBaseNode";
import {useLineMaterial} from "./useAbstractCircularPadSolderMaskMesh";

type IRouteProps = IPcbLayoutBaseNodeProps;

export function createNestedNodeId(existingNodeId: string, elementId: string) {
        if (existingNodeId === undefined) {
            return ``;
        }
        if (existingNodeId.startsWith(elementId)) {
            return existingNodeId;
        }
        return `${elementId}${"__"}${existingNodeId}`;
    }

function memoize<T>(ob: T): T {
    return ob;
}

const useStartTerminalSelector = (nodeUid: string) => {
    return useMemo(
        () =>
            memoize((state: IApplicationState) => {
                const route = state.document.present?.routes[nodeUid];
                return route?.endpoints.start_element_terminal;
            }),
        [nodeUid],
    );
};

const useEndTerminalSelector = (nodeUid: string) => {
    return useMemo(
        () =>
            memoize((state: IApplicationState) => {
                const route = state.document.present?.routes[nodeUid];
                return route?.endpoints.end_element_terminal;
            }),
        [nodeUid],
    );
};

const useGetStartNodeObject3dIdSelector = (startTerminalState?: IElementTerminalData) => {
    return useMemo(
        () =>
            memoize((state: IPcbNodeToObject3dMapStore) => {
                if (!startTerminalState) return null;
                const terminalNodeUid = createNestedNodeId(
                    startTerminalState?.terminal_uid,
                    startTerminalState?.element_uid,
                );

                return (
                    state.nodeUidToObject3dUuidMap[terminalNodeUid] ||
                    state.nodeUidToObject3dUuidMap[startTerminalState?.element_uid]
                );
            }),
        [startTerminalState],
    );
};

const useGetEndNodeObject3dIdSelector = (endTerminalState?: IElementTerminalData) => {
    return useMemo(
        () =>
            memoize((state: IPcbNodeToObject3dMapStore) => {
                if (!endTerminalState) return null;
                const terminalNodeUid = createNestedNodeId(
                    endTerminalState?.terminal_uid,
                    endTerminalState?.element_uid,
                );

                return (
                    state.nodeUidToObject3dUuidMap[terminalNodeUid] ||
                    state.nodeUidToObject3dUuidMap[endTerminalState?.element_uid]
                );
            }),
        [endTerminalState],
    );
};

function getMeshWorldPosition(nodeObject3dUuid: string, scene: Scene) {
    const foundObject3d = getSceneObjectByUuid(scene, nodeObject3dUuid);

    const target = new Vector3();

    if (foundObject3d) {
        foundObject3d.getWorldPosition(target);
    }

    return target;
}

function getPoints(mesh: Object3D, startNodeObject3dUuid: string, endNodeObject3dUuid: string, scene: Scene) {
    if (mesh && startNodeObject3dUuid && endNodeObject3dUuid) {
        const startPosition = getMeshWorldPosition(startNodeObject3dUuid, scene);
        const endPosition = getMeshWorldPosition(endNodeObject3dUuid, scene);

        const localStart = mesh.worldToLocal(startPosition);
        const localEnd = mesh.worldToLocal(endPosition);

        const zPos = 0.00001;

        return [localStart.x, localStart.y, zPos, localEnd.x, localEnd.y, zPos];
    }

    return [];
}

function Route(props: IRouteProps) {
    // States
    const startTerminalState = useSelector(useStartTerminalSelector(props.uid));
    const endTerminalState = useSelector(useEndTerminalSelector(props.uid));

    const startNodeObject3dUuid = usePcbNodeToObject3dMapStore(useGetStartNodeObject3dIdSelector(startTerminalState));
    const endNodeObject3dId = usePcbNodeToObject3dMapStore(useGetEndNodeObject3dIdSelector(endTerminalState));

    const visible = true;
    const transparent = false;
    const opacity = 1;

    const material = useLineMaterial({
        color: "pink",
        linewidth: 0.002,
        transparent: transparent,
        opacity: opacity,
        polygonOffset: true, //Force lines forward in the zbuffer
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1,
    });

    const lineGeometry = useMemo(() => {
        return new LineGeometry();
    }, []);

    const mesh = useMemo(() => {
        if (lineGeometry && material && startNodeObject3dUuid && endNodeObject3dId) {
            return new Line2(lineGeometry, material);
        }
    }, [endNodeObject3dId, lineGeometry, material, startNodeObject3dUuid]);

    let cachedPoints: Array<number> = [];

    let arraysAreDifferent = (a: Array<number>, b: Array<number>) => {
        if (b.length !== a.length) return true;
        for (let idx = 0, l = a.length; idx < l; idx++) if (a[idx] !== b[idx]) return true;
        return false;
    };
    useFrame((state) => {
        if (lineGeometry && mesh && startNodeObject3dUuid && endNodeObject3dId) {
            const pointArray: number[] = getPoints(mesh, startNodeObject3dUuid, endNodeObject3dId, state.scene);
            //Cache this by caching start and end point and only updating this when they've changed..
            //Otherwise it's both a floatarray alloc and a buffer upload happening for every line every frame.
            if (arraysAreDifferent(cachedPoints, pointArray)) {
                if (pointArray.length === 6) lineGeometry.setPositions(pointArray);
                cachedPoints = pointArray;
            }
        }
    });

    return (
        <group name={"route"}>
            <>{mesh && <primitive object={mesh} visible={visible} />}</>
            {props.children}
        </group>
    );
}

export default React.memo(Route);
