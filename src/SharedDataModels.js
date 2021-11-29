"use strict";
exports.__esModule = true;
exports.PcbRuleSetType = exports.PcbViaType = exports.BasePcbLayoutNodeTypes = void 0;
var BasePcbLayoutNodeTypes;
(function (BasePcbLayoutNodeTypes) {
    BasePcbLayoutNodeTypes["root"] = "root";
    BasePcbLayoutNodeTypes["layout"] = "layout";
    BasePcbLayoutNodeTypes["element"] = "element";
    BasePcbLayoutNodeTypes["via"] = "via";
    BasePcbLayoutNodeTypes["route"] = "route";
    BasePcbLayoutNodeTypes["routeSegment"] = "routeSegment";
    BasePcbLayoutNodeTypes["pad"] = "pad";
    BasePcbLayoutNodeTypes["footprint"] = "footprint";
    BasePcbLayoutNodeTypes["model"] = "model";
    BasePcbLayoutNodeTypes["container"] = "container";
    BasePcbLayoutNodeTypes["text"] = "text";
    BasePcbLayoutNodeTypes["line"] = "line";
    BasePcbLayoutNodeTypes["circle"] = "circle";
    BasePcbLayoutNodeTypes["rectangle"] = "rectangle";
})(BasePcbLayoutNodeTypes = exports.BasePcbLayoutNodeTypes || (exports.BasePcbLayoutNodeTypes = {}));
var PcbViaType;
(function (PcbViaType) {
    PcbViaType["throughHole"] = "throughHole";
    PcbViaType["buriedOrBlind"] = "buriedOrBlind";
    PcbViaType["microVia"] = "microVia";
})(PcbViaType = exports.PcbViaType || (exports.PcbViaType = {}));
var PcbRuleSetType;
(function (PcbRuleSetType) {
    PcbRuleSetType["objectSpecific"] = "object";
    PcbRuleSetType["runtime"] = "runtime";
    PcbRuleSetType["global"] = "global";
    PcbRuleSetType["inheritedGlobal"] = "inheritedGlobal";
    PcbRuleSetType["foreignGlobal"] = "foreignGlobal";
    PcbRuleSetType["systemDefaultGlobal"] = "systemDefaultGlobal";
})(PcbRuleSetType = exports.PcbRuleSetType || (exports.PcbRuleSetType = {}));
