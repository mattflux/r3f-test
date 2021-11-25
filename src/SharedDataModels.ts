import {IPcbLayoutBakedLayoutNodeRules, IPcbLayoutBakedPadNodeRules, IPcbLayoutBakedRouteNodeRules, IPcbLayoutBakedRouteSegmentNodeRules, IPcbLayoutBakedViaNodeRules} from "./bakedModels";

export interface IBaseMixin {
    readonly uid: string;
}

export enum BasePcbLayoutNodeTypes {
    root = "root",
    layout = "layout",
    element = "element",
    via = "via",
    route = "route",
    routeSegment = "routeSegment",
    pad = "pad",
    footprint = "footprint",
    model = "model",
    container = "container",
    text = "text",
    line = "line",
    circle = "circle",
    rectangle = "rectangle",
}

export type LayoutRuleName =
    | "unit"
    | "rotationUnit"
    | "zIsUp"
    | "position"
    | "positionX"
    | "positionY"
    | "positionZ"
    | "startPosition"
    | "startPositionX"
    | "startPositionY"
    | "startPositionZ"
    | "endPosition"
    | "endPositionX"
    | "endPositionY"
    | "endPositionZ"
    | "rotation"
    | "rotationX"
    | "rotationY"
    | "rotationZ"
    | "size"
    | "sizeX"
    | "sizeY"
    | "sizeZ"
    | "scale"
    | "scaleX"
    | "scaleY"
    | "scaleZ"
    | "margin"
    | "cornerRadius"
    | "padShape"
    | "padHoleType"
    | "viaType"
    | "thermalRelief"
    | "thermalReliefConductors"
    | "thermalReliefConductorWidth"
    | "thermalReliefConductorAngle"
    | "thermalReliefAirGapWidth"
    | "solderPasteMaskExpansion"
    | "solderMaskExpansion"
    | "solderMaskTopExpansion"
    | "solderMaskBottomExpansion"
    | "solderMaskExpansionFromTheHoleEdge"
    | "solderMaskForceCompleteTentingOnTop"
    | "solderMaskForceCompleteTentingOnBottom"
    | "holeSize"
    | "holePosition"
    | "boardColor"
    | "boardShape"
    | "silkColor"
    | "asset"
    | "physicalMaterials"
    | "stackup"
    | "layer"
    | "content"
    | "fontSize"
    | "fontStyle"
    | "textAlign"
    | "strokeWidth"
    | "strokeStyle"
    | "strokeLength"
    | "strokeSpacing"
    | "connectedLayers"
    | "linePath";

export interface IPcbLayoutNodeData extends IBaseMixin {
    name: string;
    parentUid: string;
    childrenUids: string[];
    pcbNodeRuleSet: IPcbLayoutRulesMap;
    bakedRules?: IPcbLayoutBakedData;
}

export interface IPcbLayoutPadNodeData extends IPcbLayoutNodeData {
    type: BasePcbLayoutNodeTypes.pad;
    bakedRules?: IPcbLayoutBakedPadNodeRules;
    terminalId?: string;
}

export interface IPcbLayoutViaNodeData extends IPcbLayoutNodeData {
    type: BasePcbLayoutNodeTypes.via;
    bakedRules?: IPcbLayoutBakedViaNodeRules;
}

export interface IPcbLayoutRouteNodeData extends IPcbLayoutNodeData {
    type: BasePcbLayoutNodeTypes.route;
    bakedRules?: IPcbLayoutBakedRouteNodeRules;
}

export interface IPcbLayoutRouteSegmentNodeData extends IPcbLayoutNodeData {
    type: BasePcbLayoutNodeTypes.routeSegment;
    bakedRules?: IPcbLayoutBakedRouteSegmentNodeRules;
}

export interface IPcbLayoutLayoutNodeData extends IPcbLayoutNodeData {
    type: BasePcbLayoutNodeTypes.layout;
    bakedRules?: IPcbLayoutBakedLayoutNodeRules;
}

export type IPcbLayoutNode = 
    IPcbLayoutPadNodeData
    | IPcbLayoutViaNodeData
    | IPcbLayoutRouteNodeData
    | IPcbLayoutRouteSegmentNodeData
    | IPcbLayoutLayoutNodeData;

export type IPcbLayoutBakedData =
    IPcbLayoutBakedViaNodeRules
    | IPcbLayoutBakedRouteNodeRules
    | IPcbLayoutBakedRouteSegmentNodeRules
    | IPcbLayoutBakedPadNodeRules
    | IPcbLayoutBakedLayoutNodeRules


export type PcbLayoutRuleValue = string | number | boolean | undefined;
export type PcbLayoutValueType = "string" | "number" | "boolean" | "vector3";

export enum PcbViaType {
    throughHole = "throughHole",
    buriedOrBlind = "buriedOrBlind",
    microVia = "microVia",
}

export interface IPcbLayoutRuleData extends IBaseMixin {
    key: LayoutRuleName;
    value: PcbLayoutRuleValue;
    valueType?: PcbLayoutValueType;
    payloadAsBase64?: string;
    payloadFileName?: string;
    order?: number;
    disabled?: boolean;
    referenceOfDocumentUid?: string;
}

export interface IPcbLayoutNodesMap {
    [uid: string]: IPcbLayoutNode;
}

export type IPcbLayoutRulesMap = {
    [key in LayoutRuleName]?: IPcbLayoutRuleData;
};

export interface IGlobalPcbLayoutRuleSetData extends IBaseMixin {
    disabled?: boolean;
    selector: string;
    rules: IPcbLayoutRulesMap;
    name?: string;
    description?: string;
    referenceOfDocumentUid?: string; // referenceOfDocumentUid === documentId for the default global ruleset
    belongsToPartDocumentUid?: string;
    inheritedFromAncestorNodeUid?: string;
}

export interface IPcbLayoutRuleSetsMap {
    [uid: string]: IGlobalPcbLayoutRuleSetData;
}