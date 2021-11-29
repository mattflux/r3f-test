export interface IPcbLayoutBakedBaseNodeRules {
    unit: string;
    rotationUnit: string;
    parentRootLayoutUid?: string;
    parentRootFootprintUid?: string;
}

export interface IPcbLayoutBakedBasePositionNodeRules {
    position: IVector3;
}

export interface IPcbLayoutBakedBaseStartPositionNodeRules {
    startPosition: IVector3;
}

export interface IPcbLayoutBakedBaseEndPositionNodeRules {
    endPosition: IVector3;
}

export interface IPcbLayoutBakedBaseRotationNodeRules {
    rotation: IVector3;
}

export interface IPcbLayoutBakedBaseSizeNodeRules {
    size: IVector3;
}

export interface IPcbLayoutBakedBaseScaleNodeRules {
    scale: IVector3;
}

export interface IPcbLayoutBakedBaseLayerNodeRules {
    layer: LayerOrientation | string;
    layerZPosition: number;
    copperLayerThickness?: number;
    solderPasteLayerThickness?: number;
    solderMaskLayerThickness?: number;
}

export interface IPcbLayoutBakedBaseShapeNodeRules {
    style: IPcbLineShapeStyles;
    spacing: number;
    length: number;
    strokeWidth: number;
    silkColor: string;
}

export interface IPcbLayoutBakedThermalReliefNodeRules {
    thermalReliefType: PcbViaThermalReliefTypes;
    thermalReliefConnectConfig?: {
        conductors: PcbViaThermalReliefConductors;
        conductorWidth: number;
        angle: PcbViaThermalReliefConductorAngle;
        airGapWidth: number;
    };
}

export interface IPcbLayoutBakedConnectedLayersNodeRules {
    connectedLayerUids: string[];
}

export interface IPcbLayoutBakedFootprintNodeRules
    extends IPcbLayoutBakedBaseNodeRules,
        IPcbLayoutBakedBasePositionNodeRules,
        IPcbLayoutBakedBaseRotationNodeRules {
    case?: IPcbLayoutBakedFootprintCaseRules;
    silkColor: string;
    stackup?: PcbBoardLayersMap;
}

export interface IPcbLayoutBakedFootprintCaseRules {
    position?: IVector3;
    size?: IVector3;
}

export interface IPcbLayoutBakedPadNodeRules
    extends IPcbLayoutBakedBaseNodeRules,
        IPcbLayoutBakedBasePositionNodeRules,
        IPcbLayoutBakedBaseRotationNodeRules,
        IPcbLayoutBakedThermalReliefNodeRules,
        IPcbLayoutBakedConnectedLayersNodeRules,
        IPcbLayoutBakedBaseLayerNodeRules,
        IPcbLayoutBakedBaseSizeNodeRules {
    shape: PcbLayoutFootprintPadShape;
    cornerRadius?: number;
    hole?: {
        holeType: FootPrintPadHoleType;
        holeSize: IVector2;
        holePosition: IVector2;
    };
    solderMask?: {
        expansion?: number;
        expansionFromTheHoleEdge?: number;
        forceCompleteTentingOnTop?: boolean;
        forceCompleteTentingOnBottom?: boolean;
    };
    solderPasteMaskExpansion?: number;
}

export interface IPcbLayoutBakedElementNodeRules
    extends IPcbLayoutBakedBaseNodeRules,
        IPcbLayoutBakedBasePositionNodeRules,
        IPcbLayoutBakedBaseRotationNodeRules,
        IPcbLayoutBakedBaseLayerNodeRules {}

export interface IPcbLayoutBakedViaNodeRules
    extends IPcbLayoutBakedBaseNodeRules,
        IPcbLayoutBakedBasePositionNodeRules,
        IPcbLayoutBakedThermalReliefNodeRules,
        IPcbLayoutBakedConnectedLayersNodeRules,
        IPcbLayoutBakedBaseLayerNodeRules,
        IPcbLayoutBakedBaseSizeNodeRules {
    viaType: PcbViaType;
    holeSize: IVector2;
    solderMaskExpansion?: {
        topExpansion?: number;
        bottomExpansion?: number;
        expansionFromTheHoleEdge?: number;
    };
}

export interface IPcbLayoutBakedRouteNodeRules
    extends IPcbLayoutBakedBaseNodeRules,
        IPcbLayoutBakedBaseLayerNodeRules,
        IPcbLayoutBakedBaseRotationNodeRules,
        IPcbLayoutBakedBaseSizeNodeRules,
        IPcbLayoutBakedBasePositionNodeRules {}

export interface IPcbLayoutBakedRouteSegmentNodeRules
    extends IPcbLayoutBakedBaseNodeRules,
        IPcbLayoutBakedBasePositionNodeRules,
        IPcbLayoutBakedBaseSizeNodeRules,
        IPcbLayoutBakedBaseStartPositionNodeRules,
        IPcbLayoutBakedBaseEndPositionNodeRules,
        IPcbLayoutBakedBaseRotationNodeRules,
        IPcbLayoutBakedBaseLayerNodeRules {}

export interface IPcbLayoutBakedLayoutNodeRules
    extends IPcbLayoutBakedBaseNodeRules,
        IPcbLayoutBakedBasePositionNodeRules,
        IPcbLayoutBakedBaseRotationNodeRules,
        IPcbLayoutBakedBaseSizeNodeRules {
    stackup: PcbBoardLayersMap;
    color: string;
    shape: PcbBoardShape | string;
    layoutThickness: number;
    isSubLayout: boolean;
    holeNodes: ILayoutHolesMap;
}

export enum PcbViaType {
    throughHole = "throughHole",
    buriedOrBlind = "buriedOrBlind",
    microVia = "microVia",
}

export enum PcbViaThermalReliefTypes {
    reliefConnect = "reliefConnect,",
    directConnect = "directConnect",
    noConnect = "noConnect",
}

export enum PcbViaThermalReliefConductors {
    two = "2",
    four = "4",
}

export enum PcbViaThermalReliefConductorAngle {
    fourtyFiveDegree = "45deg",
    nintyDegree = "90deg",
}

export enum LayerOrientation {
    top = "Top",
    bottom = "Bottom",
}

export enum IPcbLineShapeStyles {
    dashed = "dashed",
    solid = "solid",
}

export interface ILayoutHolesMap {
    [nodeUid: string]: {nodeUid: string; throughHole: boolean};
}

export interface IVector2 {
    x: number;
    y: number;
    orientation?: number;
    mirror?: boolean;
    flip?: boolean;
    scene_cursor_position?: boolean;
}

export interface IVector3 {
    x: number;
    y: number;
    z: number;
    orientation?: number;
    flip?: boolean;
    zIsUp?: boolean;
}
export enum FootPrintPadShape {
    circular = "circular",
    rectangle = "rectangle",
    obround = "obround",
    trapezoid = "trapezoid",
}

export enum PcbLayoutFootprintPadShape {
    circular = "circular",
    rectangle = "rectangle",
    octagonal = "octagonal",
    roundedRectangle = "roundedRectangle",
}

export enum FootPrintPadHoleType {
    platedThroughHole = "STD",
    SurfaceMountDevice = "SMD",
    testPinOrCardEdgeConnector = "CONN",
    nonPlatedHole = "HOLE",
}

export enum PcbBoardShape {
    circular = "circular",
    rectangle = "rectangle",
    flux = "flux",
}

export interface PcbBoardLayersMap {
    [uid: string]: PcbBoardLayer;
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

export type PcbBoardLayerMaterials =
    | "Surface Material" // Color Coating
    | "FR-4" // 0.32004mm // Dk 4.8
    | "Copper" // Unspecified
    | "CF-001" // 0.009mm     // Common Copper in Altium
    | "CF-002" // 0.012mm
    | "CF-003" // 0.018mm
    | "CF-004" // 0.035mm
    | "CF-005" // 0.07mm
    | "CF-006" // 0.105mm
    | "Prepreg" // Unspecified
    | "PP-006" // 0.07112mm // Dk 4.1     // Common Prepreg in Altium
    | "PP-013" // 0.09652mm // Dk 4.3
    | "PP-014" // 0.10668mm // Dk 4.2
    | "PP-015" // 0.11176mm // Dk 4.3
    | "PP-016" // 0.11684mm // Dk 4.4
    | "PP-017" // 0.12954mm // Dk 4.3
    | "Core" // Unspecified
    | "Core-011" // 0.1016mm // Dk 4.4      // Common Core in Altium
    | "Core-016" // 0.127mm // Dk 4.3
    | "Core-027" // 0.2286mm // Dk 4.5
    | "Core-035" // 0.4572mm // Dk 4.7
    | "Core-037" // 0.5334mm // Dk 4.8
    | "Core-039" // 0.7112mm // Dk 4.8
    | "Core-042" // 0.9906 // Dk 4.6
    | "Core-043" // 1.4986mm // Dk 4.3
    | "Solder Mask"
    | "PbSn";

export type PcbBoardLayerDielectricMaterials =
    | "Prepreg"
    | "Core"
    | "FR-4"
    | "Epoxy Liquid" // this is new
    | "Adhesive" // this is new
    | "Stiffener"; //this is new

export type PcbBoardLayerType =
    | "Overlay"
    | "Solder Paste" // This is new
    | "Solder Mask" // Previously Solder Mask/Copper
    | "Dielectric"
    | "Signal"
    | "Power Plane" // Previously separated
    | "Surface Finish"
    | "Layout Outline"
    | "Drill Holes"
    | "Metadata";

export interface IBaseMixin {
    readonly uid: string;
}