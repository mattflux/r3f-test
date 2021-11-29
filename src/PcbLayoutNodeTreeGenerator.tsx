import React from "react";

import Box from "./components/Box";

// import CircleShape from "./nodes/circle_shape/CircleShape";
// import PcbLayoutBaseNode from "./nodes/common/base_node/PcbLayoutBaseNode";
// import Element from "./nodes/element/Element";
// import Footprint from "./nodes/footprint/Footprint";
// import Layout from "./nodes/layout/Layout";
// import LineShape from "./nodes/line_shape/LineShape";
// import Model from "./nodes/model/Model";
// import Pad from "./nodes/pad/Pad";
// import RectangleShape from "./nodes/rectangle_shape/RectangleShape";
// import Route from "./nodes/route/Route";
// import RouteSegment from "./nodes/route_segment/RouteSegment";
// import TextShape from "./nodes/text_shape/TextShape";
// import Via from "./nodes/via/Via";

import Layout from "./nodes/Layout";
import Pad from "./nodes/Pad";
import Via from "./nodes/Via";
import selectors from "./pcbSelectors";
import {usePcbVirtualDomStore} from "./PcbVirtualDomStore";
import {BasePcbLayoutNodeTypes} from "./SharedDataModels";

interface IPcbLayoutNodeProps {
    uid: string;
}

export interface IPcbLayoutBaseNodeProps {
    uid: string;
    children?: React.ReactNode;
}

function PcbLayoutNodeTreeGenerator(props: IPcbLayoutNodeProps) {
    // Redux State
    const {pcbLayoutNodeType, pcbLayoutNodeChildUids} = usePcbVirtualDomStore(
        selectors.usePcbLayoutNodeSelector(props.uid),
    );

    switch (pcbLayoutNodeType) {
        case BasePcbLayoutNodeTypes.layout: {
            return (
                <Layout key={props.uid} uid={props.uid}>
                    {pcbLayoutNodeChildUids.map((childUid) => (
                        <PcbLayoutNodeTreeGenerator uid={childUid} key={childUid} />
                    ))}
                </Layout>
            );
        }
        case BasePcbLayoutNodeTypes.pad: {
            return (
                <Pad key={props.uid} uid={props.uid}>
                    {pcbLayoutNodeChildUids.map((childUid) => (
                        <PcbLayoutNodeTreeGenerator uid={childUid} key={childUid} />
                    ))}
                </Pad>
            );
        }
        case BasePcbLayoutNodeTypes.via: {
            return (
                <Via key={props.uid} uid={props.uid}>
                    {pcbLayoutNodeChildUids.map((childUid) => (
                        <PcbLayoutNodeTreeGenerator uid={childUid} key={childUid} />
                    ))}
                </Via>
            );
        }
        // case BasePcbLayoutNodeTypes.route: {
        //     return (
        //         <Route key={props.uid} uid={props.uid}>
        //             {pcbLayoutNodeChildUids.map((childUid) => (
        //                 <PcbLayoutNodeTreeGenerator uid={childUid} key={childUid} />
        //             ))}
        //         </Route>
        //     );
        // }
        // case BasePcbLayoutNodeTypes.routeSegment: {
        //     return (
        //         <RouteSegment key={props.uid} uid={props.uid}>
        //             {pcbLayoutNodeChildUids.map((childUid) => (
        //                 <PcbLayoutNodeTreeGenerator uid={childUid} key={childUid} />
        //             ))}
        //         </RouteSegment>
        //     );
        // }


        // case BasePcbLayoutNodeTypes.text: {
        //     return (
        //         <TextShape key={props.uid} uid={props.uid}>
        //             {pcbLayoutNodeChildUids.map((childUid) => (
        //                 <PcbLayoutNodeTreeGenerator uid={childUid} key={childUid} />
        //             ))}
        //         </TextShape>
        //     );
        // }
        // case BasePcbLayoutNodeTypes.line: {
        //     return (
        //         <LineShape key={props.uid} uid={props.uid}>
        //             {pcbLayoutNodeChildUids.map((childUid) => (
        //                 <PcbLayoutNodeTreeGenerator uid={childUid} key={childUid} />
        //             ))}
        //         </LineShape>
        //     );
        // }
        // case BasePcbLayoutNodeTypes.circle: {
        //     return (
        //         <CircleShape key={props.uid} uid={props.uid}>
        //             {pcbLayoutNodeChildUids.map((childUid) => (
        //                 <PcbLayoutNodeTreeGenerator uid={childUid} key={childUid} />
        //             ))}
        //         </CircleShape>
        //     );
        // }
        // case BasePcbLayoutNodeTypes.rectangle: {
        //     return (
        //         <RectangleShape key={props.uid} uid={props.uid}>
        //             {pcbLayoutNodeChildUids.map((childUid) => (
        //                 <PcbLayoutNodeTreeGenerator uid={childUid} key={childUid} />
        //             ))}
        //         </RectangleShape>
        //     );
        // }
        default: {
            return (
                null
            );
        }
    }
}

export default React.memo(PcbLayoutNodeTreeGenerator);
