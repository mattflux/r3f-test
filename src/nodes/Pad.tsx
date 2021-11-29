import React from "react";
import {IPcbLayoutBaseNodeProps} from "../PcbLayoutNodeTreeGenerator";

import selectors from "../pcbSelectors";
import {usePcbVirtualDomStore} from "../PcbVirtualDomStore";
import {usePcbEditorUiStore} from "../Scene";

import AbstractPad from "./AbstractPad";
import PcbLayoutBaseNode from "./PcbLayoutBaseNode";
import PhysicalPad from "./PhysicalPad";

function Pad(props: IPcbLayoutBaseNodeProps) {
    const {pcbLayoutNodeName, isDragable} = usePcbVirtualDomStore(
        selectors.useSelectNodeFields(props.uid),
    );
    const isAbstract = usePcbEditorUiStore((state) => state.cameraMode === "2d");

    return (
        <PcbLayoutBaseNode uid={props.uid} isDragable={isDragable}>
            <group name={pcbLayoutNodeName}>
                <group visible={isAbstract}>
                    <AbstractPad uid={props.uid} />
                </group>
                <group visible={!isAbstract}>
                    <PhysicalPad uid={props.uid} />
                </group>
            </group>

            {props.children}
        </PcbLayoutBaseNode>
    );
}

export default React.memo(Pad);
