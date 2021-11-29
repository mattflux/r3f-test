import {IPcbLayoutBakedElementNodeRules, IPcbLayoutBakedFootprintNodeRules, IPcbLayoutBakedLayoutNodeRules, IPcbLayoutBakedPadNodeRules, IPcbLayoutBakedRouteNodeRules, IPcbLayoutBakedRouteSegmentNodeRules, IPcbLayoutBakedViaNodeRules, IVector2, IVector3, LayerOrientation, PcbBoardLayerDielectricMaterials, PcbBoardLayerMaterials, PcbBoardLayerType} from "./bakedModels";

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

export interface IPcbLayoutFootprintNodeData extends IPcbLayoutNodeData {
    type: BasePcbLayoutNodeTypes.footprint;
    bakedRules?: IPcbLayoutBakedFootprintNodeRules;
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
    | IPcbLayoutLayoutNodeData
    | IPcbLayoutFootprintNodeData
    | IPcbLayoutElementNodeData;

export type IPcbLayoutBakedData =
    IPcbLayoutBakedViaNodeRules
    | IPcbLayoutBakedRouteNodeRules
    | IPcbLayoutBakedRouteSegmentNodeRules
    | IPcbLayoutBakedPadNodeRules
    | IPcbLayoutBakedLayoutNodeRules
    | IPcbLayoutBakedFootprintNodeRules
    | IPcbLayoutBakedElementNodeRules


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

export interface PcbBoardLayer extends IBaseMixin {
    name: string;
    color?: string;
    material?: PcbBoardLayerMaterials;
    dielectricMaterial?: PcbBoardLayerDielectricMaterials;
    dielectric?: number;
    orientation?: LayerOrientation | string;
    order: number;
    thickness?: number;
    weight?: number;
    process?: string;
    type: PcbBoardLayerType;
}

export interface IPcbLayoutElementNodeData extends IPcbLayoutNodeData {
    type: BasePcbLayoutNodeTypes.element;
    bakedRules?: IPcbLayoutBakedElementNodeRules;
}

export interface PcbBoardLayerExtendedMap {
    [uid: string]: PcbBoardLayerExtended;
}

export interface PcbBoardLayerExtended extends PcbBoardLayer {
    hidden: boolean;
    copperFilled: boolean;
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

export interface IPcbLayoutRuleSetsWithSpecificityMap {
    [ruleSetUid: string]: IPcbLayoutRuleSetsWithSpecificity;
}

export interface IPcbLayoutRuleSetsWithSpecificity {
    specificity: number;
    ruleSet: IGlobalPcbLayoutRuleSetData;
    type: PcbRuleSetType;
}

export enum PcbRuleSetType {
    objectSpecific = "object",
    runtime = "runtime",
    global = "global",
    inheritedGlobal = "inheritedGlobal",
    foreignGlobal = "foreignGlobal",
    systemDefaultGlobal = "systemDefaultGlobal",
}

/*  Document ones   */

export interface IElementsMap {
    [uid: string]: IElementData;
}


export interface IElementData {
    label?: string;
    readonly part_uid: string;
    part_version: string;
    diagram_position: IVector2;
    properties: IPropertiesMap;
    sortedPropertyKeys?: string[];
    uid: string;
}

export interface IPropertiesMap {
    [uid: string]: IPropertyData;
}

export interface IPropertyData extends IBaseMixin {
    name: string;
    value: PropertyValues;
    order?: number;
    unit?: string;
    key?: string;
    valueType?: PropertyValueTypes;
}


export type PropertyValues = PropertyBasicValues | IVectorObjectValue;
export type VectorObjectValueTypes = "vector2" | "vector3";
export type PropertyValueTypes = "string" | "number" | "boolean" | VectorObjectValueTypes;

export type PropertyBasicValues = string | number | boolean;

export interface IVectorObjectValue {
    type: VectorObjectValueTypes;
    data: IVector2 | IVector3;
}

export interface IRoutesMap {
    [uid: string]: IRouteData;
}

export interface IRouteData {
    uid: string;
    label?: string; // Reference designator
    properties: IPropertiesMap;
    endpoints: IRouteEndpoints;
    canAutoRoute: boolean;
}

export interface IRouteEndpoints {
    start_element_terminal: IElementTerminalData;
    end_element_terminal: IElementTerminalData;
}

export interface IElementTerminalData extends IBaseMixin {
    element_uid: string;
    terminal_uid: string;
}

export interface IAssetsMap {
    [key: string]: IAssetData;
}


export interface IAssetData {
    uid: string;
    name: string;
    rawName: string;
    storageName: string;
    label: string;
    fileType: AssetFileTypes;
    isDefault: boolean;
    isThumbnail: boolean;
    isFootprint: boolean;
    is3dModel: boolean;
    isPcbBoardShape: boolean;
}

export type AssetFileTypes =
    | "svg"
    | "png"
    | "glb"
    | "jpg"
    | "jpeg"
    | "kicad_mod"
    | "mod"
    | "pcblib"
    | "dxf"
    | "step"
    | "stp"
    | "gltf";


    