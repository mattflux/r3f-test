import React from "react";
import selectors from "../pcbSelectors";
import {usePcbVirtualDomStore} from "../PcbVirtualDomStore";
import {usePcbEditorUiStore} from "../Scene";
import AbstractVia from "./AbstractVia";
import PcbLayoutBaseNode, {IPcbLayoutBaseNodeProps} from "./PcbLayoutBaseNode";
import PhysicalVia from "./PhysicalVia";

type IViaProps = IPcbLayoutBaseNodeProps;

function Via(props: IViaProps) {
    const {pcbLayoutNodeName, isDragable} = usePcbVirtualDomStore(
        selectors.useSelectNodeFields(props.uid),
    );
    const isAbstract = usePcbEditorUiStore((state) => state.cameraMode === "2d");
    return (
        <PcbLayoutBaseNode uid={props.uid} isDragable={isDragable}>
            <group name={pcbLayoutNodeName}>
                <group visible={isAbstract}>
                    <AbstractVia uid={props.uid} />
                </group>
                <group visible={!isAbstract}>
                    <PhysicalVia uid={props.uid} />
                </group>
            </group>

            {props.children}
        </PcbLayoutBaseNode>
    );
}

export default React.memo(Via);
