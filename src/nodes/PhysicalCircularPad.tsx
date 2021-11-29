import React from "react";
import {DoubleSide, Mesh} from "three";
import {FootPrintPadHoleType} from "../bakedModels";
import selectors from "../pcbSelectors";
import {usePcbVirtualDomStore} from "../PcbVirtualDomStore";
import {useMeshPhongMaterial} from "../PhysicalLayoutView";
import {usePcbEditorUiStore} from "../Scene";
import {mmToMeters} from "../unitConversion";
import {IPcbLayoutBaseNodeProps} from "./PcbLayoutBaseNode";
import {useCircularPadGeometry} from "./useCircularPadGeometry";
import {useCircularPadSolderPasteGeometry} from "./useCircularPadSolderPasteGeometry";

function PhysicalCircularPad(props: IPcbLayoutBaseNodeProps) {
    const {bakedRules, layoutThickness} = usePcbVirtualDomStore(
        selectors.usePadFields(props.uid),
    );

    const focussed = usePcbEditorUiStore(
        selectors.useFocusedNodeByMaterial(bakedRules?.layer, "Copper"),
    );

    const visibility = usePcbEditorUiStore(
        selectors.useNodeVisibilityByMaterial(bakedRules?.layer, "Copper"),
    );

    const padMaterial = useMeshPhongMaterial({color: "gold", side: DoubleSide});
    const padSolderPasteMaterial = useMeshPhongMaterial(
        {color: "silver", shininess: 100, side: DoubleSide});

    const circularPadGeometry = useCircularPadGeometry(
        bakedRules?.copperLayerThickness || 0,
        bakedRules?.hole?.holeType,
        layoutThickness,
        bakedRules?.hole?.holeSize,
        bakedRules?.hole?.holePosition,
        bakedRules?.size,
    );
    const circularPadSolderPasteGeometry = useCircularPadSolderPasteGeometry(0, bakedRules?.size);

    const circularPadMesh = React.useMemo(() => {
        let padPosZ = 0;

        if (bakedRules?.hole?.holeType === FootPrintPadHoleType.platedThroughHole) {
            padPosZ = -(layoutThickness + (bakedRules?.copperLayerThickness || 0));
        }

        const mesh = new Mesh(circularPadGeometry, padMaterial);

        mesh.position.z = padPosZ;

        return mesh;
    }, [
        bakedRules?.copperLayerThickness,
        bakedRules?.hole?.holeType,
        layoutThickness,
        padMaterial,
        circularPadGeometry,
    ]);

    const circularPadSolderPasteMesh = React.useMemo(() => {
        return new Mesh(circularPadSolderPasteGeometry, padSolderPasteMaterial);
    }, [circularPadSolderPasteGeometry, padSolderPasteMaterial]);

    if (!bakedRules || !circularPadMesh) {
        console.log("failing to render physical circular pad", bakedRules, circularPadMesh);
        return null;
    }

    console.log("rendering physical circular pad");

    return (
        <>
            <primitive visible={visibility} key={circularPadMesh.uuid} object={circularPadMesh}></primitive>

            {circularPadSolderPasteMesh && (
                <primitive
                    position={[0, 0, (bakedRules?.copperLayerThickness || 0) + mmToMeters(0.0001)]}
                    key={circularPadSolderPasteMesh.uuid}
                    object={circularPadSolderPasteMesh}
                ></primitive>
            )}
        </>
    );
}

export default React.memo(PhysicalCircularPad);
