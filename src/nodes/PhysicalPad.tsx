import React from "react";

import PhysicalCircularPad from "./PhysicalCircularPad";
import {IPcbLayoutBaseNodeProps} from "./PcbLayoutBaseNode";

function AbstractPad(props: IPcbLayoutBaseNodeProps) {
    return <PhysicalCircularPad uid={props.uid} />;
}

export default React.memo(AbstractPad);
