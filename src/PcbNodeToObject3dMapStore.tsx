import {produce} from "immer";
import {Object3D, Scene} from "three";
import create from "zustand";

export interface IPcbNodeToObject3dMapStore {
    nodeUidToObject3dUuidMap: {[nodeUid: string]: string};
    setNodeUidToObject3dIdMap: (nodeUid: string, object3dUuid: string) => void;
    removeNodeUidToObject3dIdMap: (nodeUid: string) => void;
}

export function getDrillHoleNodeUid(drillHoleNodeUid: string) {
    return `${drillHoleNodeUid}.drillHole`;
}

const sceneObjectIndex: {[indexKey: string]: Object3D} = {};

export function getSceneObjectByUuid(scene: Scene, layoutObject3dUuid: string) {
    const key = `getSceneObjectByUuid_params${JSON.stringify({sceneUuid: scene.uuid, layoutObject3dUuid})}`;
    let sceneObject: Object3D | undefined = sceneObjectIndex[key];

    if (!sceneObject) {
        sceneObject = scene.getObjectByProperty("uuid", layoutObject3dUuid);

        if (sceneObject) {
            sceneObjectIndex[key] = sceneObject;
        }
    }

    return sceneObject;
}

export const usePcbNodeToObject3dMapStore = create<IPcbNodeToObject3dMapStore>((set) => ({
    nodeUidToObject3dUuidMap: {},
    setNodeUidToObject3dIdMap: (nodeUid: string, object3dUuid: string) =>
        set(
            produce((state: IPcbNodeToObject3dMapStore) => {
                state.nodeUidToObject3dUuidMap[nodeUid] = object3dUuid;
            }),
        ),
    removeNodeUidToObject3dIdMap: (nodeUid: string) =>
        set(
            produce((state: IPcbNodeToObject3dMapStore) => {
                delete state.nodeUidToObject3dUuidMap[nodeUid];
            }),
        ),
}));
