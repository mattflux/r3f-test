import React, {useCallback} from "react";
import selectors from "../pcbSelectors";
import {usePcbVirtualDomStore} from "../PcbVirtualDomStore";
import {usePcbEditorUiStore} from "../Scene";
import {IPcbLayoutBaseNodeProps} from "./PcbLayoutBaseNode";
import {useAbstractDrillHoleMesh, useAbstractViaOutlineMesh, useThroughHoleViaMesh} from "./useAbstractCircularPadSolderMaskMesh";

function AbstractThroughHoleVia(props: IPcbLayoutBaseNodeProps) {
    const {bakedRules, layerColor, parentRootLayoutUid, layoutThickness, parentRootFootprintUid} =
        usePcbVirtualDomStore(selectors.useViaFields(props.uid));
    const pcbLayoutNodeName = usePcbVirtualDomStore(
        useCallback((state) => state.pcbLayoutNodes[props.uid]?.name, [props.uid]),
    );

    const activeRootLayoutUid = usePcbVirtualDomStore(selectors.useActiveRootLayoutUid);

    const visibility = true;

    const drillHoleVisibility = true;

    const focussed = false;

    const viaMesh = useThroughHoleViaMesh(
        layerColor,
        bakedRules?.copperLayerThickness || 0,
        layoutThickness,
        bakedRules,
        focussed,
    );
    const drillHoleMesh = useAbstractDrillHoleMesh(bakedRules?.holeSize, props.uid);
    const viaOutlineMesh = useAbstractViaOutlineMesh(bakedRules?.size, focussed);

    if (!bakedRules || !viaMesh || !viaOutlineMesh) {
        return null;
    }

    return (
        <>
            <primitive visible={visibility} key={viaMesh.uuid} object={viaMesh} name={pcbLayoutNodeName} />
            {drillHoleMesh && (
                <primitive
                    key={drillHoleMesh.uuid}
                    object={drillHoleMesh}
                    name={pcbLayoutNodeName}
                    position={[0, 0, 0.001]}
                    visible={drillHoleVisibility}
                />
            )}

            <primitive
                key={viaOutlineMesh.uuid}
                object={viaOutlineMesh}
                name={pcbLayoutNodeName}
                position={[0, 0, 0.002]}
                visible={visibility}
            />
        </>
    );
}

export default React.memo(AbstractThroughHoleVia);
