import React from "react";
import {DoubleSide} from "three";
import selectors from "../pcbSelectors";
import {usePcbVirtualDomStore} from "../PcbVirtualDomStore";
import useRouteSegmentMesh from "../useRouteSegmentMesh";
import {IPcbLayoutBaseNodeProps} from "./PcbLayoutBaseNode";
import {useMeshBasicMaterial} from "./useAbstractCircularPadMesh";

function AbstractRouteSegment(props: IPcbLayoutBaseNodeProps) {
    const {bakedRules, layerColor} = usePcbVirtualDomStore(
        selectors.useRouteSegmentFields(props.uid),
    );

    // const activeRootLayoutUid = usePcbVirtualDomStore(selectors.useActiveRootLayoutUid);
    // const focussed = usePcbEditorUiStore(
    //     selectors.useFocusedNodeByMaterial(
    //         bakedRules?.layer,
    //         "Copper",
    //         activeRootLayoutUid,
    //         bakedRules?.parentRootLayoutUid,
    //         bakedRules?.parentRootFootprintUid,
    //     ),
    // );

    const copperMaterial = useMeshBasicMaterial({color: layerColor, side: DoubleSide});

    const mesh = useRouteSegmentMesh(
        bakedRules?.startPosition,
        bakedRules?.endPosition,
        bakedRules?.size,
        bakedRules?.copperLayerThickness,
        copperMaterial,
    );

    if (!mesh) {
        return null;
    }

    return <primitive object={mesh} />;
}

export default React.memo(AbstractRouteSegment);
