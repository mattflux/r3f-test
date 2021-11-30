import React from "react";
import selectors from "../pcbSelectors";
import { IPcbLayoutBaseNodeProps } from "./PcbLayoutBaseNode";
import { usePcbVirtualDomStore } from "../PcbVirtualDomStore";
import { usePcbEditorUiStore } from "../Scene";
import { FootPrintPadHoleType } from "../bakedModels";
import useAbstractCircularPadMesh from "./useAbstractCircularPadMesh";
import {
    useAbstractCircularPadSolderMaskMesh,
    useAbstractCircularPadSolderPasteMesh,
    useAbstractDrillHoleMesh,
} from "./useAbstractCircularPadSolderMaskMesh";

function AbstractCircularPad(props: IPcbLayoutBaseNodeProps) {
    const {
        bakedRules,
        copperLayerColor,
        solderPasteLayerColor,
        solderMaskLayerColor,
        layoutThickness,
        parentRootLayoutUid,
        parentRootFootprintUid,
    } = usePcbVirtualDomStore(selectors.usePadFields(props.uid));

    const isAbstract = usePcbEditorUiStore(
        (state) => state.cameraMode === "2d"
    );

    const activeRootLayoutUid = usePcbVirtualDomStore(
        selectors.useActiveRootLayoutUid
    );

    const copperFocussed = usePcbEditorUiStore(
        selectors.useFocusedNodeByMaterial(
            bakedRules?.layer,
            "Copper",
            activeRootLayoutUid,
            parentRootLayoutUid,
            parentRootFootprintUid
        )
    );

    const solderPasteFocussed = usePcbEditorUiStore(
        selectors.useFocusedNodeByType(
            bakedRules?.layer,
            "Solder Paste",
            activeRootLayoutUid,
            parentRootLayoutUid,
            parentRootFootprintUid
        )
    );

    const solderMaskFocussed = usePcbEditorUiStore(
        selectors.useFocusedNodeByType(
            bakedRules?.layer,
            "Solder Mask",
            activeRootLayoutUid,
            parentRootLayoutUid,
            parentRootFootprintUid
        )
    );

    const copperVisibility = true;

    const drillHoleVisibility = true;

    const solderPasteVisibility = true;

    const solderMaskVisibility = true;

    const circularPadMesh = useAbstractCircularPadMesh(
        bakedRules,
        layoutThickness,
        copperLayerColor,
        copperFocussed
    );
    const circularPadSolderMaskMesh = useAbstractCircularPadSolderMaskMesh(
        bakedRules,
        layoutThickness,
        solderMaskLayerColor,
        solderMaskFocussed
    );
    const circularPadSolderPasteMesh = useAbstractCircularPadSolderPasteMesh(
        bakedRules,
        layoutThickness,
        solderPasteLayerColor,
        solderPasteFocussed
    );
    const drillHoleMesh = useAbstractDrillHoleMesh(
        bakedRules?.hole?.holeSize,
        props.uid
    );

    if (!circularPadMesh) {
        return null;
    }

    return (
        <>
            <primitive
                visible={copperVisibility}
                key={circularPadMesh.uuid}
                object={circularPadMesh}
            />

            {circularPadSolderMaskMesh && isAbstract && (
                <primitive
                    visible={solderMaskVisibility}
                    key={circularPadSolderMaskMesh.uuid}
                    object={circularPadSolderMaskMesh}
                ></primitive>
            )}

            {circularPadSolderPasteMesh && isAbstract && (
                <primitive
                    visible={solderPasteVisibility}
                    key={circularPadSolderPasteMesh.uuid}
                    object={circularPadSolderPasteMesh}
                ></primitive>
            )}

            {drillHoleMesh &&
                isAbstract &&
                (bakedRules?.hole?.holeType ===
                    FootPrintPadHoleType.platedThroughHole ||
                    bakedRules?.hole?.holeType ===
                        FootPrintPadHoleType.nonPlatedHole) && (
                    <primitive
                        visible={drillHoleVisibility}
                        key={drillHoleMesh.uuid}
                        object={drillHoleMesh}
                        position={[
                            bakedRules?.hole?.holePosition.x,
                            bakedRules?.hole?.holePosition.y,
                            0,
                        ]}
                    />
                )}
        </>
    );
}

export default React.memo(AbstractCircularPad);
