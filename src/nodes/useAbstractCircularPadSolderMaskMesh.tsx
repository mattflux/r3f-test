import {useEffect, useMemo} from "react";
import {Color, DoubleSide, ExtrudeGeometry, Material, Mesh} from "three";
import {LineMaterial, LineMaterialParameters, Line2, LineGeometry} from "three-stdlib";
import {IPcbLayoutBakedPadNodeRules, IPcbLayoutBakedViaNodeRules, IVector2, IVector3} from "../bakedModels";
import {useMeshBasicMaterial} from "./useAbstractCircularPadMesh";
import {createCircleOrOblongShape, useCircularPadGeometry} from "./useCircularPadGeometry";

export function useAbstractCircularPadSolderMaskMesh(
    bakedRules: IPcbLayoutBakedPadNodeRules | undefined,
    layoutThickness: number,
    color: string | undefined,
    focussed: boolean | undefined | null,
) {
    const material = useMeshBasicMaterial({color: color, side: DoubleSide});

    //TODO add support for other .solderMask properties
    const geometry = useCircularPadGeometry(
        bakedRules?.solderMaskLayerThickness || 0,
        bakedRules?.hole?.holeType,
        layoutThickness,
        bakedRules?.hole?.holeSize,
        bakedRules?.hole?.holePosition,
        {
            x: (bakedRules?.size.x || 0) + (bakedRules?.solderMask?.expansion || 0) * 2,
            y: (bakedRules?.size.y || 0) + (bakedRules?.solderMask?.expansion || 0) * 2,
        },
    );

    return useMemo(() => {
        const mesh = new Mesh(geometry, material);

        mesh.position.z =
            (bakedRules?.copperLayerThickness || 0) +
            (bakedRules?.solderPasteLayerThickness || 0) +
            (bakedRules?.solderMaskLayerThickness || 0) +
            0.01;

        return mesh;
    }, [
        bakedRules?.copperLayerThickness,
        bakedRules?.solderMaskLayerThickness,
        bakedRules?.solderPasteLayerThickness,
        geometry,
        material,
    ]);
}


export function useAbstractCircularPadSolderPasteMesh(
    bakedRules: IPcbLayoutBakedPadNodeRules | undefined,
    layoutThickness: number,
    color: string | undefined,
    focussed: boolean | undefined | null,
) {
    const material = useMeshBasicMaterial({color: color, side: DoubleSide});

    const geometry = useCircularPadGeometry(
        bakedRules?.solderPasteLayerThickness || 0,
        bakedRules?.hole?.holeType,
        layoutThickness,
        {
            x: (bakedRules?.hole?.holeSize.x || 0) + (bakedRules?.solderPasteMaskExpansion || 0) * 2,
            y: (bakedRules?.hole?.holeSize.y || 0) + (bakedRules?.solderPasteMaskExpansion || 0) * 2,
        },
        bakedRules?.hole?.holePosition,
        bakedRules?.size,
    );

    return useMemo(() => {
        const mesh = new Mesh(geometry, material);

        mesh.position.z = (bakedRules?.copperLayerThickness || 0) + (bakedRules?.solderPasteLayerThickness || 0) + 0.01;

        return mesh;
    }, [bakedRules?.copperLayerThickness, bakedRules?.solderPasteLayerThickness, geometry, material]);
}

export const getLineMaterial = (parameters: LineMaterialParameters) => {
    let material;

    if (!material) {
        material = new LineMaterial({
            ...parameters,
            color: new Color(parameters.color).convertSRGBToLinear(),
        });
    }

    return material;
};

export const useLineMaterial = (parameters: LineMaterialParameters) => {
    return useMemo(() => {
        return getLineMaterial(parameters);
    }, [parameters]);
};


export function useAbstractDrillHoleMesh(holeSize: IVector2 | undefined, parentNodeUid: string) {
    const drillHoleGeometry = useCircleGeometry(holeSize);

    const material = useLineMaterial({
        color: "yellow",
        linewidth: 0.001,
        polygonOffset: true,
        polygonOffsetFactor: -10,
        polygonOffsetUnits: 10,
    });

    return useMemo(() => {
        if (drillHoleGeometry) {
            const line = new Line2(drillHoleGeometry, material);

            return line;
        }
    }, [drillHoleGeometry, material]);
}

export function useCircleGeometry(holeSize: IVector2 | undefined, segments: number = 64) {
    return useMemo(() => {
        let geometry;

        if (!geometry) {
            if (holeSize) {
                const holeShape = createCircleOrOblongShape(holeSize, {x: 0, y: 0}, segments);

                const points = holeShape.getPoints(segments);

                geometry = new LineGeometry();

                const pointArray: number[] = [];

                points.forEach((point) => {
                    pointArray.push(point.x);
                    pointArray.push(point.y);
                    pointArray.push(0);
                });

                geometry.setPositions(pointArray);
                geometry.center();
            }
        }
        return geometry;
    }, [holeSize, segments]);
}

export function useThroughHoleViaMesh(
    layerColor: string | undefined,
    baseCopperThickness: number,
    layoutThickness: number,
    bakedRules: IPcbLayoutBakedViaNodeRules | undefined,
    focussed: boolean | undefined | null,
) {
    const viaMaterial = useMeshBasicMaterial({color: layerColor, side: DoubleSide});

    const viaGeometry = useThroughHoleViaGeometry(
        baseCopperThickness,
        layoutThickness,
        bakedRules?.holeSize,
        bakedRules?.size,
    );

    return useMemo(() => {
        const padPosZ = -(layoutThickness + baseCopperThickness);

        const mesh = new Mesh(viaGeometry, viaMaterial);

        mesh.position.z = padPosZ;

        return mesh;
    }, [baseCopperThickness, layoutThickness, viaMaterial, viaGeometry]);
}

export const useThroughHoleViaGeometry = (
    baseCopperThickness: number,
    layoutThickness: number,
    holeSize: IVector2 | undefined,
    size: IVector3 | undefined,
) => {
    return useMemo(() => {
        let geometry;

        if (!geometry) {
            const padDepth = baseCopperThickness * 2 + layoutThickness;

            const extrudeSettings = {
                steps: 1,
                depth: padDepth,
                bevelEnabled: false,
                //material: 0, //frontMaterial
                //extrudeMaterial: 1, //sideMaterial
                curveSegments: 128,
            };

            if (size && holeSize) {
                const shape = createCircleOrOblongShape(size, {x: 0, y: 0}, 64);

                // lets drill a hole into the pad, shall we?
                const holeShape = createCircleOrOblongShape(holeSize, {x: 0, y: 0}, 64);

                shape.holes.push(holeShape);

                geometry = new ExtrudeGeometry(shape, extrudeSettings);
            }
        }

        return geometry;
    }, [baseCopperThickness, layoutThickness, holeSize, size]);
};

export function useAbstractViaOutlineMesh(size: IVector2 | undefined, focussed: boolean | undefined | null) {
    const drillHoleGeometry = useCircleGeometry(size);

    const material = useLineMaterial({color: "orange", linewidth: 0.001});

    useFocusedMaterial(material, focussed);

    return useMemo(() => {
        if (drillHoleGeometry) {
            return new Line2(drillHoleGeometry, material);
        }
    }, [drillHoleGeometry, material]);
}

export function useFocusedMaterial(material: Material | undefined, focussed: boolean | undefined | null) {
    useEffect(() => {
        if (!material) return;
        if (focussed === null) {
            material.transparent = false;
        } else {
            material.transparent = true;
            material.opacity = focussed ? 1 : 0.5;
        }
    }, [focussed, material]);
}