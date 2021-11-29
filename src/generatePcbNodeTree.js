"use strict";
exports.__esModule = true;
/* eslint-disable @typescript-eslint/no-unused-vars */
// use this to create mock pcb data
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
function makeNode(name, parentUid, type, rules) {
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
        uid: uuid()
    };
}
function makeRule(key, value) {
    return {
        key: key,
        value: value,
        uid: uuid()
    };
}
var template = [
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
    { type: SharedDataModels_1.BasePcbLayoutNodeTypes.pad, rules: { positionX: 20, positionY: 10 } },
    { type: SharedDataModels_1.BasePcbLayoutNodeTypes.via, rules: { positionX: -30, positionY: 30 } },
    { type: SharedDataModels_1.BasePcbLayoutNodeTypes.via, rules: { positionX: 30, positionY: -30 } },
];
function makeTree(parent, children) {
    var _a;
    // wanna append a bunch of pads/vias (and maybe later routes and routeSegments here)
    var result = (_a = {}, _a[layoutNode.uid] = layoutNode, _a);
    children.forEach(function (child) {
        var node = makeNode(child.type + "_blah", parent.uid, child.type, child.rules);
        parent.childrenUids.push(node.uid);
        result[node.uid] = node;
        if (child.children) {
            Object.assign(result, makeTree(node, child.children));
        }
    });
    return result;
}
(0, fs_1.writeFileSync)("./src/pcbNodes.json", JSON.stringify(makeTree(layoutNode, template)));
