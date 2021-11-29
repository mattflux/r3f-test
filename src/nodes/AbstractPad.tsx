import React from "react";

import AbstractCircularPad from "./AbstractCircularPad";
import {IPcbLayoutBaseNodeProps} from "./PcbLayoutBaseNode";

function AbstractPad(props: IPcbLayoutBaseNodeProps) {
    // defualt to circluar pads
    return <AbstractCircularPad uid={props.uid} />
}

export default React.memo(AbstractPad);
