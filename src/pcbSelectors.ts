import { useCallback, useMemo } from "react";
import {
    IPcbLayoutBakedBaseLayerNodeRules,
    IPcbLayoutBakedLayoutNodeRules,
    LayerOrientation,
    PcbBoardLayer,
    PcbBoardLayerMaterials,
    PcbBoardLayerType,
} from "./bakedModels";
import { IPcbVirtualDomStore } from "./PcbVirtualDomStore";
import {PcbEditorUiState} from "./Scene";
import {
    BasePcbLayoutNodeTypes,
    IPcbLayoutLayoutNodeData,
    IPcbLayoutNode,
    IPcbLayoutPadNodeData,
    IPcbLayoutViaNodeData,
} from "./SharedDataModels";

export const getRootLevelPcbLayoutNodeUids = (state: IPcbVirtualDomStore) => {
    const pcbLayoutNodes = state.pcbLayoutNodes;

    if (pcbLayoutNodes) {
        return Object.values(pcbLayoutNodes)
            .filter((node) => node.parentUid === "ROOT")
            .map((node) => node.uid);
    }

    return [];
};

export const useRootLevelPcbLayoutNodeUids = () => {
    return useMemo(
        () => (state: IPcbVirtualDomStore) => {
            return getRootLevelPcbLayoutNodeUids(state);
        },
        []
    );
};

const usePcbLayoutNodeSelector = (nodeUid: string) => {
    return useMemo(
        () => (state: IPcbVirtualDomStore) => {
            const node = state.pcbLayoutNodes[nodeUid];
            const sanitizedChildrenUids = node?.childrenUids || [];

            return {
                pcbLayoutNodeType: node?.type,
                pcbLayoutNodeChildUids: sanitizedChildrenUids,
            };
        },
        [nodeUid]
    );
};

const useSelectNodeFields = (nodeUid: string) => {
    return useMemo(
        () => (state: IPcbVirtualDomStore) => {
            function isThisRootLayout(node: IPcbLayoutNode) {
                return (
                    node.parentUid === "ROOT" &&
                    node.type === BasePcbLayoutNodeTypes.layout
                );
            }

            const pcbLayoutNodes = state.pcbLayoutNodes;
            const node = pcbLayoutNodes[nodeUid];
            const bakedRules = node?.bakedRules;
            const layer = (
                node?.bakedRules as IPcbLayoutBakedBaseLayerNodeRules
            )?.layer;

            // TODO: @Jatin is is temp infra! Once you implement the proper selection controls we won't need this anymore
            // since users will be able to control what they select/drag/etc
            let isDragable: boolean = false;

            if (bakedRules?.parentRootFootprintUid) {
                const isRootFootprint = false; // overriden here

                isDragable = isRootFootprint;
            } else if (bakedRules?.parentRootLayoutUid) {
                const isRootLayout = isThisRootLayout(node);

                isDragable = isRootLayout;
            } else if (node?.type === BasePcbLayoutNodeTypes.layout) {
                const isRootLayout = isThisRootLayout(node);

                isDragable = isRootLayout;
            }

            return {
                pcbLayoutNodeName: node?.name,
                isDragable: isDragable,
                layer: layer,
                parentRootLayoutUid: node?.bakedRules?.parentRootLayoutUid,
                parentRootFootprintUid:
                    node?.bakedRules?.parentRootFootprintUid,
            };
        },
        [nodeUid]
    );
};

export function isCopperLayer(material: PcbBoardLayerMaterials | undefined) {
    if (material === "Copper" || material?.startsWith("CF-")) {
        return true;
    }

    return false;
}

export function getLayerColor(
    pcbLayoutNodeLayers: PcbBoardLayer[],
    nodeLayer: LayerOrientation | string | undefined,
    material: PcbBoardLayerMaterials | undefined,
    type: PcbBoardLayerType | undefined
) {
    const layer = pcbLayoutNodeLayers.find(
        (layer) =>
            layer.uid === nodeLayer ||
            (layer.orientation === nodeLayer &&
                ((material && layer.material === material) ||
                    (material === "Copper" && isCopperLayer(layer.material)) ||
                    (type && layer.type === type)))
    );

    if (layer?.color) {
        return layer?.color;
    } else {
        if (nodeLayer === LayerOrientation.top) {
            if (material && isCopperLayer(material)) {
                return "blue";
            }
        } else if (nodeLayer === LayerOrientation.bottom) {
            if (material && isCopperLayer(material)) {
                return "pink";
            }
        }
    }
}

const usePadFields = (nodeUid: string) => {
    return useMemo(
        () => (state: IPcbVirtualDomStore) => {
            const pcbLayoutNodes = state.pcbLayoutNodes;
            const node = pcbLayoutNodes[nodeUid] as IPcbLayoutPadNodeData;
            const bakedRules = node?.bakedRules;


            console.log("pad fields???", node, node?.bakedRules);

            let copperLayerColor;
            let solderPasteLayerColor;
            let solderMaskLayerColor;
            let layoutThickness = 0;

            if (bakedRules?.parentRootLayoutUid) {
                const layoutNode = pcbLayoutNodes[
                    bakedRules.parentRootLayoutUid
                ] as IPcbLayoutLayoutNodeData;
                const layoutBakedRules =
                    layoutNode?.bakedRules as IPcbLayoutBakedLayoutNodeRules;
                const pcbLayoutNodeLayers = Object.values(
                    layoutBakedRules?.stackup || {}
                );

                layoutThickness = layoutNode?.bakedRules?.layoutThickness || 0;

                copperLayerColor = getLayerColor(
                    pcbLayoutNodeLayers,
                    bakedRules?.layer,
                    "Copper",
                    undefined
                );
                solderPasteLayerColor = getLayerColor(
                    pcbLayoutNodeLayers,
                    bakedRules?.layer,
                    undefined,
                    "Solder Paste"
                );
                solderMaskLayerColor = getLayerColor(
                    pcbLayoutNodeLayers,
                    bakedRules?.layer,
                    undefined,
                    "Solder Mask"
                );
            } else {
                copperLayerColor = getLayerColor(
                    [],
                    bakedRules?.layer,
                    "Copper",
                    undefined
                );
                solderPasteLayerColor = getLayerColor(
                    [],
                    bakedRules?.layer,
                    undefined,
                    "Solder Paste"
                );
                solderMaskLayerColor = getLayerColor(
                    [],
                    bakedRules?.layer,
                    undefined,
                    "Solder Mask"
                );
            }

            return {
                bakedRules,
                copperLayerColor,
                solderPasteLayerColor,
                solderMaskLayerColor,
                layoutThickness,
                parentRootLayoutUid: bakedRules?.parentRootLayoutUid,
                parentRootFootprintUid: bakedRules?.parentRootFootprintUid,
            };
        },
        [nodeUid]
    );
};

const useFocusedNodeByMaterial = (
    layer: string | undefined,
    material: PcbBoardLayerMaterials,
    activeRootLayoutUid?: string,
    parentRootLayoutUid?: string,
    parentRootFootprintUid?: string,
) => {
    return useCallback(
        (state: PcbEditorUiState) => {
            if (state.focussedLayer === null) return;

            if (activeRootLayoutUid !== parentRootLayoutUid && activeRootLayoutUid !== parentRootFootprintUid) {
                return;
            }

            if (
                material === "Copper" &&
                isCopperLayer(state.focussedLayer.material) &&
                layer === state.focussedLayer.orientation
            ) {
                return true;
            }

            if (state.focussedLayer.material === material && layer === state.focussedLayer.orientation) {
                return true;
            }
            return false;
        },
        [layer, material, activeRootLayoutUid, parentRootLayoutUid, parentRootFootprintUid],
    );
};


const getLayerVisibility = (state: PcbEditorUiState, key: string) => {
    return state.layerVisibilityMap[key]!;
};

const useNodeVisibilityByMaterial = (
    layer: LayerOrientation | string | undefined,
    material: PcbBoardLayerMaterials,
    activeRootLayoutUid?: string,
    parentRootLayoutUid?: string,
    parentRootFootprintUid?: string,
) => {
    return useCallback(
        (state: PcbEditorUiState) => {
            if (!state.layerVisibilityMap) {
                return true;
            }

            if (activeRootLayoutUid !== parentRootLayoutUid && activeRootLayoutUid !== parentRootFootprintUid) {
                return true;
            }
            if (material === "Copper") {
                return !Object.keys(state.layerVisibilityMap)
                    .map((uid) => getLayerVisibility(state, uid))
                    .some(
                        (layerVisibility) =>
                            layerVisibility.hidden === true &&
                            isCopperLayer(layerVisibility.material) &&
                            (layerVisibility.orientation === layer || layerVisibility.uid === layer),
                    );
            } else {
                return !Object.keys(state.layerVisibilityMap)
                    .map((uid) => getLayerVisibility(state, uid))
                    .some(
                        (layerVisibility) =>
                            layerVisibility.hidden === true &&
                            layerVisibility.material === material &&
                            (layerVisibility.orientation === layer || layerVisibility.uid === layer),
                    );
            }
        },
        [layer, material, activeRootLayoutUid, parentRootLayoutUid, parentRootFootprintUid],
    );
};

const useActiveRootLayoutUid = (state: IPcbVirtualDomStore) => {
    return state.activeLayoutNode?.uid;
};

const useFocusedNodeByType = (
    layer: string | undefined,
    type: PcbBoardLayerType,
    activeRootLayoutUid?: string,
    parentRootLayoutUid?: string,
    parentRootFootprintUid?: string,
) => {
    return useCallback(
        (state: PcbEditorUiState) => {
            if (state.focussedLayer === null) return;
            if (activeRootLayoutUid !== parentRootLayoutUid && activeRootLayoutUid !== parentRootFootprintUid) {
                return;
            }
            if (
                state.focussedLayer.type === type &&
                (state.focussedLayer.orientation === layer || state.focussedLayer.uid === layer)
            ) {
                return true;
            }
            return false;
        },
        [layer, type, activeRootLayoutUid, parentRootLayoutUid, parentRootFootprintUid],
    );
};

const useNodeVisibilityByType = (
    layer: LayerOrientation | string | undefined,
    type: PcbBoardLayerType,
    activeRootLayoutUid?: string,
    parentRootLayoutUid?: string,
    parentRootFootprintUid?: string,
) => {
    return useCallback(
        (state: PcbEditorUiState) => {
            if (!state.layerVisibilityMap) {
                return true;
            }

            if (
                activeRootLayoutUid !== parentRootLayoutUid &&
                activeRootLayoutUid !== parentRootFootprintUid &&
                type !== "Metadata"
            ) {
                return true;
            }

            return !Object.keys(state.layerVisibilityMap)
                .map((uid) => getLayerVisibility(state, uid))
                .some(
                    (layerVisibility) =>
                        layerVisibility.hidden === true &&
                        layerVisibility.type === type &&
                        (layerVisibility.orientation === layer || layerVisibility.uid === layer),
                );
        },
        [layer, type, activeRootLayoutUid, parentRootLayoutUid, parentRootFootprintUid],
    );
};

const useViaFields = (nodeUid: string) => {
    return useMemo(
        () =>
            (state: IPcbVirtualDomStore) => {
                const pcbLayoutNodes = state.pcbLayoutNodes;
                const node = pcbLayoutNodes[nodeUid] as IPcbLayoutViaNodeData;
                const bakedRules = node?.bakedRules;

                let layerColor;
                let layoutThickness = 0;

                if (bakedRules?.parentRootLayoutUid) {
                    const layoutNode = pcbLayoutNodes[bakedRules.parentRootLayoutUid] as IPcbLayoutLayoutNodeData;
                    const layoutBakedRules = layoutNode?.bakedRules as IPcbLayoutBakedLayoutNodeRules;
                    const pcbLayoutNodeLayers = Object.values(layoutBakedRules?.stackup || {});

                    layoutThickness = layoutNode?.bakedRules?.layoutThickness || 0;

                    layerColor = getLayerColor(pcbLayoutNodeLayers, bakedRules?.layer, "Copper", undefined);
                } else {
                    layerColor = getLayerColor([], bakedRules?.layer, "Copper", undefined);
                }

                return {
                    bakedRules,
                    layerColor,
                    layoutThickness,
                    parentRootLayoutUid: bakedRules?.parentRootLayoutUid,
                    parentRootFootprintUid: bakedRules?.parentRootFootprintUid,
                };
            },
        [nodeUid],
    );
};


const selectors = {
    useRootLevelPcbLayoutNodeUids,
    usePcbLayoutNodeSelector,
    useSelectNodeFields,
    usePadFields,
    useFocusedNodeByMaterial,
    useNodeVisibilityByMaterial,
    useActiveRootLayoutUid,
    useFocusedNodeByType,
    useNodeVisibilityByType,
    useViaFields
};

export default selectors;
