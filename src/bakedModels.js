"use strict";
exports.__esModule = true;
exports.PcbBoardShape = exports.FootPrintPadHoleType = exports.PcbLayoutFootprintPadShape = exports.FootPrintPadShape = exports.IPcbLineShapeStyles = exports.LayerOrientation = exports.PcbViaThermalReliefConductorAngle = exports.PcbViaThermalReliefConductors = exports.PcbViaThermalReliefTypes = exports.PcbViaType = void 0;
var PcbViaType;
(function (PcbViaType) {
    PcbViaType["throughHole"] = "throughHole";
    PcbViaType["buriedOrBlind"] = "buriedOrBlind";
    PcbViaType["microVia"] = "microVia";
})(PcbViaType = exports.PcbViaType || (exports.PcbViaType = {}));
var PcbViaThermalReliefTypes;
(function (PcbViaThermalReliefTypes) {
    PcbViaThermalReliefTypes["reliefConnect"] = "reliefConnect,";
    PcbViaThermalReliefTypes["directConnect"] = "directConnect";
    PcbViaThermalReliefTypes["noConnect"] = "noConnect";
})(PcbViaThermalReliefTypes = exports.PcbViaThermalReliefTypes || (exports.PcbViaThermalReliefTypes = {}));
var PcbViaThermalReliefConductors;
(function (PcbViaThermalReliefConductors) {
    PcbViaThermalReliefConductors["two"] = "2";
    PcbViaThermalReliefConductors["four"] = "4";
})(PcbViaThermalReliefConductors = exports.PcbViaThermalReliefConductors || (exports.PcbViaThermalReliefConductors = {}));
var PcbViaThermalReliefConductorAngle;
(function (PcbViaThermalReliefConductorAngle) {
    PcbViaThermalReliefConductorAngle["fourtyFiveDegree"] = "45deg";
    PcbViaThermalReliefConductorAngle["nintyDegree"] = "90deg";
})(PcbViaThermalReliefConductorAngle = exports.PcbViaThermalReliefConductorAngle || (exports.PcbViaThermalReliefConductorAngle = {}));
var LayerOrientation;
(function (LayerOrientation) {
    LayerOrientation["top"] = "Top";
    LayerOrientation["bottom"] = "Bottom";
})(LayerOrientation = exports.LayerOrientation || (exports.LayerOrientation = {}));
var IPcbLineShapeStyles;
(function (IPcbLineShapeStyles) {
    IPcbLineShapeStyles["dashed"] = "dashed";
    IPcbLineShapeStyles["solid"] = "solid";
})(IPcbLineShapeStyles = exports.IPcbLineShapeStyles || (exports.IPcbLineShapeStyles = {}));
var FootPrintPadShape;
(function (FootPrintPadShape) {
    FootPrintPadShape["circular"] = "circular";
    FootPrintPadShape["rectangle"] = "rectangle";
    FootPrintPadShape["obround"] = "obround";
    FootPrintPadShape["trapezoid"] = "trapezoid";
})(FootPrintPadShape = exports.FootPrintPadShape || (exports.FootPrintPadShape = {}));
var PcbLayoutFootprintPadShape;
(function (PcbLayoutFootprintPadShape) {
    PcbLayoutFootprintPadShape["circular"] = "circular";
    PcbLayoutFootprintPadShape["rectangle"] = "rectangle";
    PcbLayoutFootprintPadShape["octagonal"] = "octagonal";
    PcbLayoutFootprintPadShape["roundedRectangle"] = "roundedRectangle";
})(PcbLayoutFootprintPadShape = exports.PcbLayoutFootprintPadShape || (exports.PcbLayoutFootprintPadShape = {}));
var FootPrintPadHoleType;
(function (FootPrintPadHoleType) {
    FootPrintPadHoleType["platedThroughHole"] = "STD";
    FootPrintPadHoleType["SurfaceMountDevice"] = "SMD";
    FootPrintPadHoleType["testPinOrCardEdgeConnector"] = "CONN";
    FootPrintPadHoleType["nonPlatedHole"] = "HOLE";
})(FootPrintPadHoleType = exports.FootPrintPadHoleType || (exports.FootPrintPadHoleType = {}));
var PcbBoardShape;
(function (PcbBoardShape) {
    PcbBoardShape["circular"] = "circular";
    PcbBoardShape["rectangle"] = "rectangle";
    PcbBoardShape["flux"] = "flux";
})(PcbBoardShape = exports.PcbBoardShape || (exports.PcbBoardShape = {}));
