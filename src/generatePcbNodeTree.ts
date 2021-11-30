/* eslint-disable @typescript-eslint/no-unused-vars */
// use this to create mock IApplicationState data
import { writeFileSync } from "fs";
import { IVector2 } from "./bakedModels";

import {
    BasePcbLayoutNodeTypes,
    IApplicationState,
    IElementData,
    IElementsMap,
    IPcbLayoutElementNodeData,
    IPcbLayoutLayoutNodeData,
    IPcbLayoutNode,
    IPcbLayoutNodeData,
    IPcbLayoutNodesMap,
    IPcbLayoutPadNodeData,
    IPcbLayoutRouteNodeData,
    IPcbLayoutRouteSegmentNodeData,
    IPcbLayoutRuleData,
    IPcbLayoutRulesMap,
    IPcbLayoutViaNodeData,
    IRouteData,
    IRoutesMap,
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
    | IPcbLayoutViaNodeData
    | IPcbLayoutElementNodeData;
type NodeType =
    | BasePcbLayoutNodeTypes.layout
    | BasePcbLayoutNodeTypes.pad
    | BasePcbLayoutNodeTypes.route
    | BasePcbLayoutNodeTypes.routeSegment
    | BasePcbLayoutNodeTypes.via
    | BasePcbLayoutNodeTypes.element;
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
    elementUid: string,
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
        uid: elementUid ? `${elementUid}__${uuid()}` : uuid(),
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

type Template = Array<{
    elementId: string;
    template: Children[];
    diagramPosition: IVector2;
}>;

// basically the config for the whole thing
const template: Template = [
    {
        elementId: "elementOne",
        diagramPosition: { x: 0, y: 0 },
        template: [
            {
                type: BasePcbLayoutNodeTypes.pad,
                rules: { positionX: 10, positionY: -10 },
            },
            {
                type: BasePcbLayoutNodeTypes.pad,
                rules: { positionX: -10, positionY: 10 },
                children: [
                    { type: BasePcbLayoutNodeTypes.via },
                    { type: BasePcbLayoutNodeTypes.via },
                ],
            },
            {
                type: BasePcbLayoutNodeTypes.pad,
                rules: { positionX: 20, positionY: 10 },
            },
            {
                type: BasePcbLayoutNodeTypes.via,
                rules: { positionX: -30, positionY: 30 },
            },
            {
                type: BasePcbLayoutNodeTypes.via,
                rules: { positionX: 30, positionY: -30 },
            },
            {
                type: BasePcbLayoutNodeTypes.routeSegment,
                rules: { positionX: 30, positionY: -40 },
            },
        ],
    },
        {
        elementId: "elementTwo",
        diagramPosition: { x: 20, y: 30 },
        template: [
            {
                type: BasePcbLayoutNodeTypes.pad,
                rules: { positionX: 30, positionY: -15 },
            },
            {
                type: BasePcbLayoutNodeTypes.routeSegment,
                rules: { positionX: 30, positionY: -40 },
            },
        ],
    },
];

type Children = {
    type: NodeType;
    rules?: Rules;
    children?: Children[];
};

function makeElements(template: Template) {
    const result: IElementsMap = {};
    template.forEach((element) => {
        const e: IElementData = {
            uid: element.elementId,
            diagram_position: {
                x: element.diagramPosition.x,
                y: element.diagramPosition.y,
            },
        };
        result[e.uid] = e;
    });
    return result;
}

function makeRoutes(template: Template, nodes: IPcbLayoutNodesMap) {
    const result: IRoutesMap = {};
    for (var i = 0; i < template.length; i++) {
        for (var j = i + 1; j < template.length; j++) {
            // route from i to j
            const from = template[i];
            const to = template[j];
            /* 
                a genesis terminal elementUid of a part doc ends up being, for a containing doc:
                - the suffix of the pad node (with container element as prefix)
                - the terminal_uid of the associated route
            */
            const fromPad = Object.values(nodes).find(
                (n) =>
                    n.parentUid === from.elementId &&
                    n.type === BasePcbLayoutNodeTypes.pad
            );
            const toPad = Object.values(nodes).find(
                (n) =>
                    n.parentUid === to.elementId &&
                    n.type === BasePcbLayoutNodeTypes.pad
            );

            if (!fromPad || !toPad) {
                throw new Error("No suitable pad found in template");
            }

            const route: IRouteData = {
                uid: uuid(),
                properties: {},
                canAutoRoute: false,
                endpoints: {
                    start_element_terminal: {
                        uid: "",
                        element_uid: from.elementId,
                        terminal_uid: fromPad!.uid.replace(
                            `${from.elementId}__`,
                            ""
                        ),
                    },
                    end_element_terminal: {
                        uid: "",
                        element_uid: to.elementId,
                        terminal_uid: toPad!.uid.replace(
                            `${to.elementId}__`,
                            ""
                        ),
                    },
                },
            };
            result[route.uid] = route;
        }
    }
    return result;
}

function addRouteNodes(nodes: IPcbLayoutNodesMap, routes: IRoutesMap) {
    const layout = Object.values(nodes).find(n => n.type === BasePcbLayoutNodeTypes.layout); // in Graviton this is a 'nets' container
    if (!layout) {
        throw new Error("layout not found");
    }
    Object.values(routes).forEach(route => {
        const r: IPcbLayoutRouteNodeData = {
            uid: route.uid,
            name: route.label || "",
            type: BasePcbLayoutNodeTypes.route,
            parentUid: layout.uid,
            childrenUids: [],
            pcbNodeRuleSet: {},
        }
        nodes[r.uid] = r;
        layout.childrenUids.push(r.uid);
    })
}

function makePcbLayoutNodes(template: Template) {
    const result: IPcbLayoutNodesMap = { [layoutNode.uid]: layoutNode };

    function makeTree(
        parent: Node,
        children: Children[],
        elementUid: string
    ): IPcbLayoutNodesMap {
        // wanna append a bunch of pads/vias (and maybe later routes and routeSegments here)
        children.forEach((child) => {
            const node = makeNode(
                `${child.type}_blah`,
                parent.uid,
                child.type,
                elementUid,
                child.rules
            );
            parent.childrenUids.push(node.uid);
            result[node.uid] = node;
            if (child.children) {
                Object.assign(
                    result,
                    makeTree(node, child.children, elementUid)
                );
            }
        });
        return result;
    }

    template.forEach((element) => {
        const elementNode: Node = makeNode(
            "element",
            layoutNode.uid,
            BasePcbLayoutNodeTypes.element,
            element.elementId
        );
        (elementNode as any).uid = element.elementId;
        layoutNode.childrenUids.push(elementNode.uid);
        result[elementNode.uid] = elementNode;
        makeTree(elementNode, element.template, elementNode.uid);
    });
    return result;
}

const pcbLayoutNodes = makePcbLayoutNodes(template);
const elements = makeElements(template);
const routes = makeRoutes(template, pcbLayoutNodes);
addRouteNodes(pcbLayoutNodes, routes);

const result: IApplicationState = {
    document: {
        present: {
            uid: "my-document",
            name: "",
            description: "",
            slug: "",
            owner_handle: "",
            properties: {},
            pcbLayoutRuleSets: {},
            pcbLayoutNodes,
            elements,
            routes,
        },
    },
};

writeFileSync("./src/mockDocument.json", JSON.stringify(result));
