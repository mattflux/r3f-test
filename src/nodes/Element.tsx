import React from "react";
import selectors from "../pcbSelectors";
import {usePcbVirtualDomStore} from "../PcbVirtualDomStore";
import PcbLayoutBaseNode, {IPcbLayoutBaseNodeProps} from "./PcbLayoutBaseNode";

function Element(props: IPcbLayoutBaseNodeProps) {
    const {pcbLayoutNodeName} = usePcbVirtualDomStore(selectors.useSelectNodeFields(props.uid));

    return (
        <PcbLayoutBaseNode uid={props.uid} isDragable={true}>
            <group name={pcbLayoutNodeName}>{props.children}</group>
        </PcbLayoutBaseNode>
    );
}

export default React.memo(Element);
