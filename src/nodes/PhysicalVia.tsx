import React, {useCallback} from "react";
import {DoubleSide, Mesh} from "three";
import selectors from "../pcbSelectors";
import {usePcbVirtualDomStore} from "../PcbVirtualDomStore";
import {useMeshPhongMaterial} from "../PhysicalLayoutView";
import {IPcbLayoutBaseNodeProps} from "./PcbLayoutBaseNode";
import {useThroughHoleViaGeometry} from "./useAbstractCircularPadSolderMaskMesh";

function PhysicalThroughHoleVia(props: IPcbLayoutBaseNodeProps) {
    const {bakedRules, layoutThickness} = usePcbVirtualDomStore(
        selectors.useViaFields(props.uid),
    );
    const pcbLayoutNodeName = usePcbVirtualDomStore(
        useCallback((state) => state.pcbLayoutNodes[props.uid]?.name, [props.uid]),
    );

    const viaMaterial = useMeshPhongMaterial({color: "gold", side: DoubleSide});

    const viaGeometry = useThroughHoleViaGeometry(
        bakedRules?.copperLayerThickness || 0,
        layoutThickness,
        bakedRules?.holeSize,
        bakedRules?.size,
    );

    const viaMesh = React.useMemo(() => {
        const padPosZ = -(layoutThickness + (bakedRules?.copperLayerThickness || 0));

        const mesh = new Mesh(viaGeometry, viaMaterial);

        mesh.position.z = padPosZ;

        return mesh;
    }, [bakedRules?.copperLayerThickness, layoutThickness, viaMaterial, viaGeometry]);

    if (!viaMesh) {
        return null;
    }

    return <primitive key={viaMesh.uuid} object={viaMesh} name={pcbLayoutNodeName}></primitive>;
}

export default React.memo(PhysicalThroughHoleVia);
