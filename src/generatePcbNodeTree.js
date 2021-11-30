"use strict";
exports.__esModule = true;
/* eslint-disable @typescript-eslint/no-unused-vars */
// use this to create mock IApplicationState data
var fs_1 = require("fs");
var SharedDataModels_1 = require("./SharedDataModels");
function uuid() {
    return Math.random().toString();
}
var layoutNode = {
    name: "layout",
    parentUid: "ROOT",
    childrenUids: [],
    pcbNodeRuleSet: {},
    uid: uuid(),
    type: SharedDataModels_1.BasePcbLayoutNodeTypes.layout
};
// just iterate through and make a bunch of these things
function makeNode(name, parentUid, type, elementUid, rules) {
    var pcbNodeRuleSet = {};
    if (rules) {
        Object.entries(rules).forEach(function (entry) {
            var _a = entry, key = _a[0], value = _a[1];
            pcbNodeRuleSet[key] = makeRule(key, value);
        });
    }
    return {
        name: name,
        type: type,
        parentUid: parentUid,
        pcbNodeRuleSet: pcbNodeRuleSet,
        childrenUids: [],
        uid: elementUid ? elementUid + "__" + uuid() : uuid()
    };
}
function makeRule(key, value) {
    return {
        key: key,
        value: value,
        uid: uuid()
    };
}
// basically the config for the whole thing
var template = [
    {
        elementId: "elementOne",
        diagramPosition: { x: 0, y: 0 },
        template: [
            {
                type: SharedDataModels_1.BasePcbLayoutNodeTypes.pad,
                rules: { positionX: 10, positionY: -10 }
            },
            {
                type: SharedDataModels_1.BasePcbLayoutNodeTypes.pad,
                rules: { positionX: -10, positionY: 10 },
                children: [
                    { type: SharedDataModels_1.BasePcbLayoutNodeTypes.via },
                    { type: SharedDataModels_1.BasePcbLayoutNodeTypes.via },
                ]
            },
            {
                type: SharedDataModels_1.BasePcbLayoutNodeTypes.pad,
                rules: { positionX: 20, positionY: 10 }
            },
            {
                type: SharedDataModels_1.BasePcbLayoutNodeTypes.via,
                rules: { positionX: -30, positionY: 30 }
            },
            {
                type: SharedDataModels_1.BasePcbLayoutNodeTypes.via,
                rules: { positionX: 30, positionY: -30 }
            },
            {
                type: SharedDataModels_1.BasePcbLayoutNodeTypes.routeSegment,
                rules: { positionX: 30, positionY: -40 }
            },
        ]
    },
    {
        elementId: "elementTwo",
        diagramPosition: { x: 20, y: 30 },
        template: [
            {
                type: SharedDataModels_1.BasePcbLayoutNodeTypes.pad,
                rules: { positionX: 30, positionY: -15 }
            },
            {
                type: SharedDataModels_1.BasePcbLayoutNodeTypes.routeSegment,
                rules: { positionX: 30, positionY: -40 }
            },
        ]
    },
];
function makeElements(template) {
    var result = {};
    template.forEach(function (element) {
        var e = {
            uid: element.elementId,
            diagram_position: {
                x: element.diagramPosition.x,
                y: element.diagramPosition.y
            }
        };
        result[e.uid] = e;
    });
    return result;
}
function makeRoutes(template, nodes) {
    var result = {};
    for (var i = 0; i < template.length; i++) {
        var _loop_1 = function () {
            // route from i to j
            var from = template[i];
            var to = template[j];
            /*
                a genesis terminal elementUid of a part doc ends up being, for a containing doc:
                - the suffix of the pad node (with container element as prefix)
                - the terminal_uid of the associated route
            */
            var fromPad = Object.values(nodes).find(function (n) {
                return n.parentUid === from.elementId &&
                    n.type === SharedDataModels_1.BasePcbLayoutNodeTypes.pad;
            });
            var toPad = Object.values(nodes).find(function (n) {
                return n.parentUid === to.elementId &&
                    n.type === SharedDataModels_1.BasePcbLayoutNodeTypes.pad;
            });
            if (!fromPad || !toPad) {
                throw new Error("No suitable pad found in template");
            }
            var route = {
                uid: uuid(),
                properties: {},
                canAutoRoute: false,
                endpoints: {
                    start_element_terminal: {
                        uid: "",
                        element_uid: from.elementId,
                        terminal_uid: fromPad.uid.replace(from.elementId + "__", "")
                    },
                    end_element_terminal: {
                        uid: "",
                        element_uid: to.elementId,
                        terminal_uid: toPad.uid.replace(to.elementId + "__", "")
                    }
                }
            };
            result[route.uid] = route;
        };
        for (var j = i + 1; j < template.length; j++) {
            _loop_1();
        }
    }
    return result;
}
function addRouteNodes(nodes, routes) {
    var layout = Object.values(nodes).find(function (n) { return n.type === SharedDataModels_1.BasePcbLayoutNodeTypes.layout; }); // in Graviton this is a 'nets' container
    if (!layout) {
        throw new Error("layout not found");
    }
    Object.values(routes).forEach(function (route) {
        var r = {
            uid: route.uid,
            name: route.label || "",
            type: SharedDataModels_1.BasePcbLayoutNodeTypes.route,
            parentUid: layout.uid,
            childrenUids: [],
            pcbNodeRuleSet: {}
        };
        nodes[r.uid] = r;
        layout.childrenUids.push(r.uid);
    });
}
function makePcbLayoutNodes(template) {
    var _a;
    var result = (_a = {}, _a[layoutNode.uid] = layoutNode, _a);
    function makeTree(parent, children, elementUid) {
        // wanna append a bunch of pads/vias (and maybe later routes and routeSegments here)
        children.forEach(function (child) {
            var node = makeNode(child.type + "_blah", parent.uid, child.type, elementUid, child.rules);
            parent.childrenUids.push(node.uid);
            result[node.uid] = node;
            if (child.children) {
                Object.assign(result, makeTree(node, child.children, elementUid));
            }
        });
        return result;
    }
    template.forEach(function (element) {
        var elementNode = makeNode("element", layoutNode.uid, SharedDataModels_1.BasePcbLayoutNodeTypes.element, element.elementId);
        elementNode.uid = element.elementId;
        layoutNode.childrenUids.push(elementNode.uid);
        result[elementNode.uid] = elementNode;
        makeTree(elementNode, element.template, elementNode.uid);
    });
    return result;
}
var pcbLayoutNodes = makePcbLayoutNodes(template);
var elements = makeElements(template);
var routes = makeRoutes(template, pcbLayoutNodes);
addRouteNodes(pcbLayoutNodes, routes);
var result = {
    document: {
        present: {
            uid: "my-document",
            name: "",
            description: "",
            slug: "",
            owner_handle: "",
            properties: {},
            pcbLayoutRuleSets: {},
            pcbLayoutNodes: pcbLayoutNodes,
            elements: elements,
            routes: routes
        }
    }
};
(0, fs_1.writeFileSync)("./src/mockDocument.json", JSON.stringify(result));
