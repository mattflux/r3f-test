import React from "react";
import selectors from "../pcbSelectors";
import {usePcbVirtualDomStore} from "../PcbVirtualDomStore";
import {usePcbEditorUiStore} from "../Scene";
import AbstractRouteSegment from "./AbstractRouteSegment";
import PcbLayoutBaseNode, {IPcbLayoutBaseNodeProps} from "./PcbLayoutBaseNode";
import PhysicalRouteSegment from "./PhysicalRouteSegment";

function RouteSegment(props: IPcbLayoutBaseNodeProps) {
    const {layer, pcbLayoutNodeName, parentRootLayoutUid, parentRootFootprintUid} = usePcbVirtualDomStore(
        selectors.useSelectNodeFields(props.uid),
    );
    const isAbstract = usePcbEditorUiStore((state) => state.cameraMode === "2d");
    const activeRootLayoutUid = usePcbVirtualDomStore(selectors.useActiveRootLayoutUid);
    const visibility = usePcbEditorUiStore(
        selectors.useNodeVisibilityByMaterial(
            layer,
            "Copper",
            activeRootLayoutUid,
            parentRootLayoutUid,
            parentRootFootprintUid,
        ),
    );

    return (
        <PcbLayoutBaseNode uid={props.uid}>
            {props.children}

            <group visible={visibility} name={pcbLayoutNodeName}>
                <group visible={isAbstract}>
                    <AbstractRouteSegment uid={props.uid} />
                </group>
                <group visible={!isAbstract}>
                    <PhysicalRouteSegment uid={props.uid} />
                </group>
            </group>
        </PcbLayoutBaseNode>
    );
}

export default React.memo(RouteSegment);
