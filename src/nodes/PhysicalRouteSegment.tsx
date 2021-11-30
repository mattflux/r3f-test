import React from "react";
import {DoubleSide} from "three";
import selectors from "../pcbSelectors";
import {usePcbVirtualDomStore} from "../PcbVirtualDomStore";
import {useMeshPhongMaterial} from "../PhysicalLayoutView";
import useRouteSegmentMesh from "../useRouteSegmentMesh";
import {IPcbLayoutBaseNodeProps} from "./PcbLayoutBaseNode";

function PhysicalRouteSegment(props: IPcbLayoutBaseNodeProps) {
    const {bakedRules} = usePcbVirtualDomStore(selectors.useRouteSegmentFields(props.uid));

    const copperMaterial = useMeshPhongMaterial({color: "gold", side: DoubleSide});

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

export default React.memo(PhysicalRouteSegment);
