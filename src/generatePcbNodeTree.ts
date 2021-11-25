/* eslint-disable @typescript-eslint/no-unused-vars */
// use this to create mock pcb data
import { writeFileSync } from "fs";
import { IVector2 } from "./bakedModels";

import {
    BasePcbLayoutNodeTypes,
    IPcbLayoutLayoutNodeData,
    IPcbLayoutNodeData,
    IPcbLayoutNodesMap,
    IPcbLayoutPadNodeData,
    IPcbLayoutRouteNodeData,
    IPcbLayoutRouteSegmentNodeData,
    IPcbLayoutRuleData,
    IPcbLayoutRulesMap,
    IPcbLayoutViaNodeData,
    LayoutRuleName,
    PcbLayoutRuleValue,
} from "./SharedDataModels";

function uuid() {
    return Math.random().toString();
}

// currently supporting: layout, route, routeSegment, pad, via
type Node =
    | IPcbLayoutLayoutNodeData
    | IPcbLayoutPadNodeData
    | IPcbLayoutRouteNodeData
    | IPcbLayoutRouteSegmentNodeData
    | IPcbLayoutViaNodeData;
type NodeType =
    | BasePcbLayoutNodeTypes.layout
    | BasePcbLayoutNodeTypes.pad
    | BasePcbLayoutNodeTypes.route
    | BasePcbLayoutNodeTypes.routeSegment
    | BasePcbLayoutNodeTypes.via;
type Rules = {
    [key in LayoutRuleName]?: PcbLayoutRuleValue;
};

const layoutNode: IPcbLayoutLayoutNodeData = {
    name: "layout",
    parentUid: "ROOT",
    childrenUids: [],
    pcbNodeRuleSet: {},
    uid: uuid(),
    type: BasePcbLayoutNodeTypes.layout,
};

// just iterate through and make a bunch of these things

function makeNode(
    name: string,
    parentUid: string,
    type: NodeType,
    rules?: Rules
): Node {
    let pcbNodeRuleSet: IPcbLayoutRulesMap = {};
    if (rules) {
        Object.entries(rules).forEach((entry) => {
            const [key, value] = entry as [LayoutRuleName, PcbLayoutRuleValue];
            pcbNodeRuleSet[key] = makeRule(key, value);
        });
    }
    return {
        name,
        type,
        parentUid,
        pcbNodeRuleSet,
        childrenUids: [],
        uid: uuid(),
    };
}

function makeRule(
    key: LayoutRuleName,
    value: PcbLayoutRuleValue
): IPcbLayoutRuleData {
    return {
        key,
        value,
        uid: uuid(),
    };
}

const template: Children[] = [
    {
        type: BasePcbLayoutNodeTypes.pad,
        rules: { positionX: 0.5, positionY: 0.5 },
    },
    {
        type: BasePcbLayoutNodeTypes.pad,
        children: [
            { type: BasePcbLayoutNodeTypes.via },
            { type: BasePcbLayoutNodeTypes.via },
        ],
    },
    { type: BasePcbLayoutNodeTypes.pad },
    { type: BasePcbLayoutNodeTypes.via },
    { type: BasePcbLayoutNodeTypes.via },
];

type Children = {
    type: NodeType;
    rules?: Rules;
    children?: Children[];
};

function makeTree(parent: Node, children: Children[]): IPcbLayoutNodesMap {
    // wanna append a bunch of pads/vias (and maybe later routes and routeSegments here)
    const result: IPcbLayoutNodesMap = {};
    children.forEach((child) => {
        const node = makeNode(
            `${child.type}_blah`,
            parent.uid,
            child.type,
            child.rules
        );
        parent.childrenUids.push(node.uid);
        result[node.uid] = node;
        if (child.children) {
            Object.assign(result, makeTree(node, child.children));
        }
    });
    return result;
}

writeFileSync(
    "./src/pcbNodes.json",
    JSON.stringify(makeTree(layoutNode, template))
);
