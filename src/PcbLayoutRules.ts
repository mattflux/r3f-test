import {FootPrintPadHoleType, FootPrintPadShape, IPcbLineShapeStyles, LayerOrientation, PcbBoardShape, PcbViaThermalReliefConductorAngle, PcbViaThermalReliefConductors, PcbViaThermalReliefTypes, PcbViaType} from "./bakedModels";
import {BasePcbLayoutNodeTypes, PcbLayoutRuleValue, PropertyValueTypes} from "./SharedDataModels";
import stackups, {DEFAULT_FOOTPRINT_STACKUP_KEY} from "./Stackups";

export enum SystemPcbLayoutRulesValues {
    auto = "auto",
}

export enum DynamicAutoCompleteSources {
    assets = "assets",
    copperLayers = "copperLayers",
    midCopperLayers = "midCopperLayers",
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

export interface IRuleConfigData {
    key: LayoutRuleName;
    label: string; // User facing name of the rule
    valueType?: PropertyValueTypes;
    auto_complete_options?: string[];
    dynamic_auto_complete_source?: DynamicAutoCompleteSources; // this adds auto complete options from a dynamic source such as assets in the project
    default: PcbLayoutRuleValue; // the default value for this rule. This will be used by the layout engine when no rule is set for a object
    defaultForType?: NodeTypeBasedRuleConfigDefault;
    setByDefault?: boolean; // the default value for this rule. This will be used by the layout engine when no rule is set for a object
    allChildNodesWillInheritThisRule: boolean; // this implements a model like CSS inheritance: https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/Cascade_and_inheritance
    supportedNodeTypes?: BasePcbLayoutNodeTypes[]; // Optional parameter to indicate which node types this rule with affect
    unsupportedNodeTypes?: BasePcbLayoutNodeTypes[]; // Optional parameter to indicate which node types this rule will NOT affect
}

type NodeTypeBasedRuleConfigDefault = {[TKey in BasePcbLayoutNodeTypes]?: PcbLayoutRuleValue};

export function getAllStackupConfigLabels() {
    const results: string[] = [];

    Object.values(stackups).forEach((stackupConfigs) => {
        Object.values(stackupConfigs).forEach((stackupConfig) => {
            results.push(stackupConfig.label);
        });
    });

    return results;
}

export const LayoutRules = {
    unit: {
        key: "unit",
        label: "Dimension Unit",
        default: "mm",
        setByDefault: true,
        allChildNodesWillInheritThisRule: true,
        auto_complete_options: ["um", "mm", "mil", "inch", "cm", "ft", "m"],
    },
    rotationUnit: {
        key: "rotationUnit",
        label: "Rotation Unit",
        default: "deg",
        setByDefault: true,
        allChildNodesWillInheritThisRule: true,
        auto_complete_options: ["deg", "rad", "grad"],
    },
    zIsUp: {
        key: "zIsUp",
        label: "Z axis is Up",
        default: true,
        setByDefault: true,
        allChildNodesWillInheritThisRule: true,
        auto_complete_options: ["true", "false"],
        supportedNodeTypes: [BasePcbLayoutNodeTypes.element],
    },
    position: {
        key: "position",
        label: "Position",
        default: 0,
        setByDefault: true,
        allChildNodesWillInheritThisRule: false,
        auto_complete_options: [SystemPcbLayoutRulesValues.auto],
        unsupportedNodeTypes: [
            BasePcbLayoutNodeTypes.root,
            BasePcbLayoutNodeTypes.route,
            BasePcbLayoutNodeTypes.container,
        ],
    },
    positionX: {
        key: "positionX",
        label: "X Position",
        default: 0,
        allChildNodesWillInheritThisRule: false,
        auto_complete_options: [SystemPcbLayoutRulesValues.auto],
        unsupportedNodeTypes: [
            BasePcbLayoutNodeTypes.root,
            BasePcbLayoutNodeTypes.route,
            BasePcbLayoutNodeTypes.container,
        ],
    },
    positionY: {
        key: "positionY",
        label: "Y Position",
        default: 0,
        allChildNodesWillInheritThisRule: false,
        auto_complete_options: [SystemPcbLayoutRulesValues.auto],
        unsupportedNodeTypes: [
            BasePcbLayoutNodeTypes.root,
            BasePcbLayoutNodeTypes.route,
            BasePcbLayoutNodeTypes.container,
        ],
    },
    positionZ: {
        key: "positionZ",
        label: "Z Position",
        default: 0,
        allChildNodesWillInheritThisRule: false,
        auto_complete_options: [SystemPcbLayoutRulesValues.auto],
        unsupportedNodeTypes: [
            BasePcbLayoutNodeTypes.root,
            BasePcbLayoutNodeTypes.route,
            BasePcbLayoutNodeTypes.container,
        ],
    },
    startPosition: {
        key: "startPosition",
        label: "Start Position",
        defaultForType: {
            [BasePcbLayoutNodeTypes.routeSegment]: "-5mm 0",
            [BasePcbLayoutNodeTypes.rectangle]: "-5mm 5mm",
            [BasePcbLayoutNodeTypes.line]: "-5mm 0",
        },
        setByDefault: true,
        allChildNodesWillInheritThisRule: false,
        supportedNodeTypes: [
            BasePcbLayoutNodeTypes.line,
            BasePcbLayoutNodeTypes.rectangle,
            BasePcbLayoutNodeTypes.routeSegment,
        ],
    },
    startPositionX: {
        key: "startPositionX",
        label: "Start X Position",
        allChildNodesWillInheritThisRule: false,
        supportedNodeTypes: [
            BasePcbLayoutNodeTypes.line,
            BasePcbLayoutNodeTypes.rectangle,
            BasePcbLayoutNodeTypes.routeSegment,
        ],
    },
    startPositionY: {
        key: "startPositionY",
        label: "Start Y Position",
        allChildNodesWillInheritThisRule: false,
        supportedNodeTypes: [
            BasePcbLayoutNodeTypes.line,
            BasePcbLayoutNodeTypes.rectangle,
            BasePcbLayoutNodeTypes.routeSegment,
        ],
    },
    startPositionZ: {
        key: "startPositionZ",
        label: "Start Z Position",
        allChildNodesWillInheritThisRule: false,
    },
    endPosition: {
        key: "endPosition",
        label: "End Position",
        defaultForType: {
            [BasePcbLayoutNodeTypes.routeSegment]: "5mm 0",
            [BasePcbLayoutNodeTypes.rectangle]: "5mm -5mm",
            [BasePcbLayoutNodeTypes.line]: "5mm 0",
        },
        setByDefault: true,
        allChildNodesWillInheritThisRule: false,
        supportedNodeTypes: [
            BasePcbLayoutNodeTypes.line,
            BasePcbLayoutNodeTypes.rectangle,
            BasePcbLayoutNodeTypes.routeSegment,
        ],
    },
    endPositionX: {
        key: "endPositionX",
        label: "End X Position",
        allChildNodesWillInheritThisRule: false,
        supportedNodeTypes: [
            BasePcbLayoutNodeTypes.line,
            BasePcbLayoutNodeTypes.rectangle,
            BasePcbLayoutNodeTypes.routeSegment,
        ],
    },
    endPositionY: {
        key: "endPositionY",
        label: "End Y Position",
        allChildNodesWillInheritThisRule: false,
        supportedNodeTypes: [
            BasePcbLayoutNodeTypes.line,
            BasePcbLayoutNodeTypes.rectangle,
            BasePcbLayoutNodeTypes.routeSegment,
        ],
    },
    endPositionZ: {
        key: "endPositionZ",
        label: "End Z Position",
        allChildNodesWillInheritThisRule: false,
    },
    rotation: {
        key: "rotation",
        label: "Rotation",
        default: 0,
        setByDefault: true,
        allChildNodesWillInheritThisRule: false,
        unsupportedNodeTypes: [
            BasePcbLayoutNodeTypes.root,
            BasePcbLayoutNodeTypes.route,
            BasePcbLayoutNodeTypes.circle,
        ],
    },
    rotationX: {
        key: "rotationX",
        label: "X Rotation",
        default: 0,
        allChildNodesWillInheritThisRule: false,
        unsupportedNodeTypes: [
            BasePcbLayoutNodeTypes.root,
            BasePcbLayoutNodeTypes.route,
            BasePcbLayoutNodeTypes.circle,
        ],
    },
    rotationY: {
        key: "rotationY",
        label: "Y Rotation",
        default: 0,
        allChildNodesWillInheritThisRule: false,
        unsupportedNodeTypes: [
            BasePcbLayoutNodeTypes.root,
            BasePcbLayoutNodeTypes.route,
            BasePcbLayoutNodeTypes.circle,
        ],
    },
    rotationZ: {
        key: "rotationZ",
        label: "Z Rotation",
        default: 0,
        allChildNodesWillInheritThisRule: false,
        unsupportedNodeTypes: [
            BasePcbLayoutNodeTypes.root,
            BasePcbLayoutNodeTypes.route,
            BasePcbLayoutNodeTypes.circle,
        ],
    },
    size: {
        key: "size",
        label: "Size",
        defaultForType: {
            [BasePcbLayoutNodeTypes.routeSegment]: "10mil",
            [BasePcbLayoutNodeTypes.circle]: "5mm",
            [BasePcbLayoutNodeTypes.layout]: "16cm 10cm",
            [BasePcbLayoutNodeTypes.pad]: "1.6mm",
            [BasePcbLayoutNodeTypes.via]: "0.6mm",
        },
        setByDefault: true,
        allChildNodesWillInheritThisRule: false,
        supportedNodeTypes: [
            BasePcbLayoutNodeTypes.pad,
            BasePcbLayoutNodeTypes.via,
            BasePcbLayoutNodeTypes.layout,
            BasePcbLayoutNodeTypes.circle,
            BasePcbLayoutNodeTypes.routeSegment,
        ],
    },
    sizeX: {
        key: "sizeX",
        label: "X Size",
        allChildNodesWillInheritThisRule: false,
        supportedNodeTypes: [
            BasePcbLayoutNodeTypes.pad,
            BasePcbLayoutNodeTypes.via,
            BasePcbLayoutNodeTypes.layout,
            BasePcbLayoutNodeTypes.circle,
            BasePcbLayoutNodeTypes.routeSegment,
        ],
    },
    sizeY: {
        key: "sizeY",
        label: "Y Size",
        allChildNodesWillInheritThisRule: false,
        supportedNodeTypes: [
            BasePcbLayoutNodeTypes.pad,
            BasePcbLayoutNodeTypes.via,
            BasePcbLayoutNodeTypes.layout,
            BasePcbLayoutNodeTypes.circle,
            BasePcbLayoutNodeTypes.routeSegment,
        ],
    },
    sizeZ: {
        key: "sizeZ",
        label: "Z Size",
        allChildNodesWillInheritThisRule: false,
        supportedNodeTypes: [BasePcbLayoutNodeTypes.layout],
    },
    scale: {
        key: "scale",
        label: "Scale",
        default: "1",
        setByDefault: true,
        allChildNodesWillInheritThisRule: false,
        supportedNodeTypes: [
            BasePcbLayoutNodeTypes.model,
            BasePcbLayoutNodeTypes.text,
            BasePcbLayoutNodeTypes.circle,
            BasePcbLayoutNodeTypes.line,
            BasePcbLayoutNodeTypes.rectangle,
        ],
    },
    scaleX: {
        key: "scaleX",
        label: "X Scale",
        default: "1",
        allChildNodesWillInheritThisRule: false,
        supportedNodeTypes: [
            BasePcbLayoutNodeTypes.model,
            BasePcbLayoutNodeTypes.text,
            BasePcbLayoutNodeTypes.circle,
            BasePcbLayoutNodeTypes.line,
            BasePcbLayoutNodeTypes.rectangle,
        ],
    },
    scaleY: {
        key: "scaleY",
        label: "Y Scale",
        default: "1",
        allChildNodesWillInheritThisRule: false,
        supportedNodeTypes: [
            BasePcbLayoutNodeTypes.model,
            BasePcbLayoutNodeTypes.text,
            BasePcbLayoutNodeTypes.circle,
            BasePcbLayoutNodeTypes.line,
            BasePcbLayoutNodeTypes.rectangle,
        ],
    },
    scaleZ: {
        key: "scaleZ",
        label: "Z Scale",
        default: "1",
        allChildNodesWillInheritThisRule: false,
        supportedNodeTypes: [
            BasePcbLayoutNodeTypes.model,
            BasePcbLayoutNodeTypes.text,
            BasePcbLayoutNodeTypes.circle,
            BasePcbLayoutNodeTypes.line,
            BasePcbLayoutNodeTypes.rectangle,
        ],
    },
    margin: {
        key: "margin",
        label: "Margin",
        default: undefined,
        defaultForType: {
            [BasePcbLayoutNodeTypes.pad]: "1mm",
        },
        allChildNodesWillInheritThisRule: false,
        supportedNodeTypes: [
            BasePcbLayoutNodeTypes.pad,
            BasePcbLayoutNodeTypes.footprint,
            BasePcbLayoutNodeTypes.element,
        ],
    },
    cornerRadius: {
        key: "cornerRadius",
        label: "Corner Radius",
        default: undefined,
        allChildNodesWillInheritThisRule: true,
        supportedNodeTypes: [BasePcbLayoutNodeTypes.pad],
    },
    padShape: {
        key: "padShape",
        label: "Pad Shape",
        default: FootPrintPadShape.circular,
        setByDefault: true,
        allChildNodesWillInheritThisRule: true,
        auto_complete_options: [
            FootPrintPadShape.rectangle,
            FootPrintPadShape.circular,
            FootPrintPadShape.obround,
            FootPrintPadShape.trapezoid,
        ],
        supportedNodeTypes: [BasePcbLayoutNodeTypes.pad],
    },
    padHoleType: {
        key: "padHoleType",
        label: "Pad Hole Type",
        default: FootPrintPadHoleType.SurfaceMountDevice,
        setByDefault: true,
        allChildNodesWillInheritThisRule: true,
        auto_complete_options: [
            FootPrintPadHoleType.SurfaceMountDevice,
            FootPrintPadHoleType.nonPlatedHole,
            FootPrintPadHoleType.platedThroughHole,
            FootPrintPadHoleType.testPinOrCardEdgeConnector,
        ],
        supportedNodeTypes: [BasePcbLayoutNodeTypes.pad],
    },
    viaType: {
        key: "viaType",
        label: "Via Type",
        default: PcbViaType.throughHole,
        setByDefault: true,
        allChildNodesWillInheritThisRule: true,
        auto_complete_options: [PcbViaType.throughHole, PcbViaType.buriedOrBlind, PcbViaType.microVia],
        supportedNodeTypes: [BasePcbLayoutNodeTypes.via],
    },
    thermalRelief: {
        key: "thermalRelief",
        label: "Thermal Relief",
        default: PcbViaThermalReliefTypes.directConnect,
        setByDefault: true,
        allChildNodesWillInheritThisRule: true,
        auto_complete_options: [
            PcbViaThermalReliefTypes.reliefConnect,
            PcbViaThermalReliefTypes.directConnect,
            PcbViaThermalReliefTypes.noConnect,
        ],
        supportedNodeTypes: [BasePcbLayoutNodeTypes.via, BasePcbLayoutNodeTypes.pad],
    },
    thermalReliefConductors: {
        key: "thermalReliefConductors",
        label: "Thermal Relief Conductors",
        default: PcbViaThermalReliefConductors.two,
        setByDefault: true,
        allChildNodesWillInheritThisRule: true,
        auto_complete_options: [PcbViaThermalReliefConductors.two, PcbViaThermalReliefConductors.four],
        supportedNodeTypes: [BasePcbLayoutNodeTypes.via, BasePcbLayoutNodeTypes.pad],
    },
    thermalReliefConductorWidth: {
        key: "thermalReliefConductorWidth",
        label: "Thermal Relief Conductor Width",
        default: "10mil",
        setByDefault: true,
        allChildNodesWillInheritThisRule: true,
        supportedNodeTypes: [BasePcbLayoutNodeTypes.via, BasePcbLayoutNodeTypes.pad],
    },
    thermalReliefConductorAngle: {
        key: "thermalReliefConductorAngle",
        label: "Thermal Relief Conductor Angle",
        default: PcbViaThermalReliefConductorAngle.nintyDegree,
        setByDefault: true,
        allChildNodesWillInheritThisRule: true,
        auto_complete_options: [
            PcbViaThermalReliefConductorAngle.nintyDegree,
            PcbViaThermalReliefConductorAngle.fourtyFiveDegree,
        ],
        supportedNodeTypes: [BasePcbLayoutNodeTypes.via, BasePcbLayoutNodeTypes.pad],
    },
    thermalReliefAirGapWidth: {
        key: "thermalReliefAirGapWidth",
        label: "Thermal Relief Air Gap Width",
        default: "10mil",
        setByDefault: true,
        allChildNodesWillInheritThisRule: true,
        supportedNodeTypes: [BasePcbLayoutNodeTypes.via, BasePcbLayoutNodeTypes.pad],
    },
    solderPasteMaskExpansion: {
        key: "solderPasteMaskExpansion",
        label: "Solder Paste Mask Expansion",
        default: undefined,
        allChildNodesWillInheritThisRule: true,
        supportedNodeTypes: [BasePcbLayoutNodeTypes.pad],
    },
    solderMaskExpansion: {
        key: "solderMaskExpansion",
        label: "Solder Mask Expansion",
        default: undefined,
        allChildNodesWillInheritThisRule: true,
        supportedNodeTypes: [BasePcbLayoutNodeTypes.pad],
    },
    solderMaskTopExpansion: {
        key: "solderMaskTopExpansion",
        label: "Solder Mask Top Expansion",
        default: undefined,
        allChildNodesWillInheritThisRule: true,
        supportedNodeTypes: [BasePcbLayoutNodeTypes.via],
    },
    solderMaskBottomExpansion: {
        key: "solderMaskBottomExpansion",
        label: "Solder Mask Bottom Expansion",
        default: undefined,
        allChildNodesWillInheritThisRule: true,
        supportedNodeTypes: [BasePcbLayoutNodeTypes.via],
    },
    solderMaskExpansionFromTheHoleEdge: {
        key: "solderMaskExpansionFromTheHoleEdge",
        label: "Solder Mask Expansion From Hole Edge",
        default: undefined,
        allChildNodesWillInheritThisRule: true,
        supportedNodeTypes: [BasePcbLayoutNodeTypes.via, BasePcbLayoutNodeTypes.pad],
    },
    solderMaskForceCompleteTentingOnTop: {
        key: "solderMaskForceCompleteTentingOnTop",
        label: "Solder Mask Force Complete Tenting On Top",
        default: false,
        allChildNodesWillInheritThisRule: true,
        auto_complete_options: ["true", "false"],
        supportedNodeTypes: [BasePcbLayoutNodeTypes.pad],
    },
    solderMaskForceCompleteTentingOnBottom: {
        key: "solderMaskForceCompleteTentingOnBottom",
        label: "Solder Mask Force Complete Tenting On Bottom",
        default: false,
        allChildNodesWillInheritThisRule: true,
        auto_complete_options: ["true", "false"],
        supportedNodeTypes: [BasePcbLayoutNodeTypes.pad],
    },
    connectedLayers: {
        key: "connectedLayers",
        label: "Connected Layers",
        default: undefined,
        allChildNodesWillInheritThisRule: false,
        dynamic_auto_complete_source: DynamicAutoCompleteSources.copperLayers,
        supportedNodeTypes: [BasePcbLayoutNodeTypes.via, BasePcbLayoutNodeTypes.pad],
    },
    holeSize: {
        key: "holeSize",
        label: "Hole Size",
        defaultForType: {
            [BasePcbLayoutNodeTypes.pad]: "0.7mm",
            [BasePcbLayoutNodeTypes.via]: "0.3mm",
        },
        setByDefault: true,
        allChildNodesWillInheritThisRule: true,
        supportedNodeTypes: [BasePcbLayoutNodeTypes.via, BasePcbLayoutNodeTypes.pad],
    },
    holePosition: {
        key: "holePosition",
        label: "Hole Position",
        default: 0,
        setByDefault: true,
        allChildNodesWillInheritThisRule: true,
        supportedNodeTypes: [BasePcbLayoutNodeTypes.pad],
    },
    boardColor: {
        key: "boardColor",
        label: "Board Color",
        default: "green",
        auto_complete_options: ["green", "blue", "yellow", "white", "red", "black", "purple"],
        setByDefault: true,
        allChildNodesWillInheritThisRule: true,
        supportedNodeTypes: [BasePcbLayoutNodeTypes.layout],
    },
    boardShape: {
        key: "boardShape",
        label: "Board Shape",
        default: PcbBoardShape.rectangle,
        setByDefault: true,
        allChildNodesWillInheritThisRule: true,
        auto_complete_options: [PcbBoardShape.rectangle, PcbBoardShape.circular, PcbBoardShape.flux],
        supportedNodeTypes: [BasePcbLayoutNodeTypes.layout],
    },
    silkColor: {
        key: "silkColor",
        label: "Silk Color",
        default: "white",
        auto_complete_options: ["white", "red", "blue", "black", "yellow", "purple"],
        setByDefault: true,
        allChildNodesWillInheritThisRule: true,
    },
    asset: {
        key: "asset",
        label: "Asset",
        default: undefined,
        dynamic_auto_complete_source: DynamicAutoCompleteSources.assets,
        allChildNodesWillInheritThisRule: true,
        supportedNodeTypes: [BasePcbLayoutNodeTypes.model, BasePcbLayoutNodeTypes.footprint],
    },
    physicalMaterials: {
        key: "physicalMaterials",
        label: "Physical Materials",
        default: "true",
        setByDefault: true,
        auto_complete_options: ["true", "false"],
        allChildNodesWillInheritThisRule: true,
        supportedNodeTypes: [BasePcbLayoutNodeTypes.model],
    },
    stackup: {
        key: "stackup",
        label: "Stackup",
        defaultForType: {
            [BasePcbLayoutNodeTypes.layout]: "4",
            [BasePcbLayoutNodeTypes.footprint]: DEFAULT_FOOTPRINT_STACKUP_KEY,
        },
        setByDefault: true,
        auto_complete_options: getAllStackupConfigLabels(),
        allChildNodesWillInheritThisRule: true,
        supportedNodeTypes: [BasePcbLayoutNodeTypes.layout, BasePcbLayoutNodeTypes.footprint],
    },
    layer: {
        key: "layer",
        label: "Layer",
        default: LayerOrientation.top,
        setByDefault: true,
        dynamic_auto_complete_source: DynamicAutoCompleteSources.midCopperLayers,
        auto_complete_options: [LayerOrientation.top, LayerOrientation.bottom],
        allChildNodesWillInheritThisRule: true,
        supportedNodeTypes: [
            BasePcbLayoutNodeTypes.element,
            BasePcbLayoutNodeTypes.text,
            BasePcbLayoutNodeTypes.line,
            BasePcbLayoutNodeTypes.circle,
            BasePcbLayoutNodeTypes.rectangle,
            BasePcbLayoutNodeTypes.route,
            BasePcbLayoutNodeTypes.routeSegment,
            BasePcbLayoutNodeTypes.pad,
            BasePcbLayoutNodeTypes.via,
            BasePcbLayoutNodeTypes.model,
        ],
    },
    content: {
        key: "content",
        label: "Content",
        default: undefined,
        allChildNodesWillInheritThisRule: false,
        supportedNodeTypes: [BasePcbLayoutNodeTypes.text],
    },
    fontSize: {
        key: "fontSize",
        label: "Font Size",
        setByDefault: true,
        default: "1mm",
        allChildNodesWillInheritThisRule: true,
        supportedNodeTypes: [BasePcbLayoutNodeTypes.text],
    },
    strokeWidth: {
        key: "strokeWidth",
        label: "Stroke Width",
        default: "0.1524mm",
        setByDefault: true,
        allChildNodesWillInheritThisRule: true,
        auto_complete_options: [SystemPcbLayoutRulesValues.auto],
        supportedNodeTypes: [
            BasePcbLayoutNodeTypes.line,
            BasePcbLayoutNodeTypes.circle,
            BasePcbLayoutNodeTypes.rectangle,
        ],
    },
    strokeStyle: {
        key: "strokeStyle",
        label: "Stroke Style",
        default: IPcbLineShapeStyles.solid,
        setByDefault: true,
        allChildNodesWillInheritThisRule: true,
        auto_complete_options: [IPcbLineShapeStyles.solid, IPcbLineShapeStyles.dashed],
        supportedNodeTypes: [
            BasePcbLayoutNodeTypes.line,
            BasePcbLayoutNodeTypes.circle,
            BasePcbLayoutNodeTypes.rectangle,
        ],
    },
    strokeLength: {
        key: "strokeLength",
        label: "Stroke Length",
        default: "0.4mm",
        setByDefault: true,
        allChildNodesWillInheritThisRule: true,
        supportedNodeTypes: [
            BasePcbLayoutNodeTypes.line,
            BasePcbLayoutNodeTypes.circle,
            BasePcbLayoutNodeTypes.rectangle,
        ],
    },
    strokeSpacing: {
        key: "strokeSpacing",
        label: "Stroke Spacing",
        default: "0.4mm",
        setByDefault: true,
        allChildNodesWillInheritThisRule: true,
        supportedNodeTypes: [
            BasePcbLayoutNodeTypes.line,
            BasePcbLayoutNodeTypes.circle,
            BasePcbLayoutNodeTypes.rectangle,
        ],
    },
    linePath: {
        key: "linePath",
        label: "Line Path",
        default: undefined,
        setByDefault: false,
        allChildNodesWillInheritThisRule: false,
        supportedNodeTypes: [BasePcbLayoutNodeTypes.line],
    },
} as {[key in LayoutRuleName]: IRuleConfigData};
