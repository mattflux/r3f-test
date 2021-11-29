import { useMemo } from "react";
import { ExtrudeGeometry, Shape } from "three";
import { FootPrintPadHoleType, IVector2 } from "../bakedModels";

export function createCircleOrOblongShape(
    size: IVector2,
    position: IVector2,
    resolution: number
): Shape {
    let shape;
    if (!shape) {
        const { sin, cos, min } = Math;
        let lx: number,
            ly: number,
            x: number,
            y: number,
            nx: number,
            ny: number;

        let makePoly = (nsides: number) => {
            const poly: { x: number; y: number; nx: number; ny: number }[] = [];

            for (let idx = 0, l = nsides + 2; idx <= l; idx++) {
                const a = ((idx - 0.5) * Math.PI * 2) / nsides;
                const an = a + Math.PI / nsides;

                poly.push({ x: sin(a), y: cos(a), nx: sin(an), ny: cos(an) });
            }
            return poly;
        };

        let rshape = (
            edges: { x: number; y: number; nx: number; ny: number }[],
            rx: number,
            ry: number,
            radius: number
        ) => {
            const shp: { p: { x: number; y: number }[] } = { p: [] };
            rx *= radius;
            ry *= radius;

            for (let idx = 0, l = edges.length - 2; idx < l; idx++) {
                let r = edges[idx];
                let r1 = edges[idx + 1];
                let dx = x;
                let dy = y;
                let out = false;
                let out1 = true;
                if (r.nx * nx + r.ny * ny < 0) {
                    dx = lx;
                    dy = ly;
                    out = true;
                }
                if (r1.nx * nx + r1.ny * ny >= 0) {
                    out1 = false;
                }

                let rdx = dx + r.x * rx;
                let rdy = dy + r.y * ry;
                let rdx1 = dx + r1.x * rx;
                let rdy1 = dy + r1.y * ry;

                shp.p.push({ x: rdx, y: rdy });
                if (out !== out1) {
                    rdx = lx + r1.x * rx;
                    rdy = ly + r1.y * ry;
                    rdx1 = x + r1.x * rx;
                    rdy1 = y + r1.y * ry;
                    shp.p.push({ x: rdx1, y: rdy1 });
                }
            }
            lx = x;
            ly = y;
            return shp;
        };

        const width = size.x;
        const height = size.y;

        const amin = min(width, height);

        x = y = lx = ly = 0;
        lx = width > height ? width - height : 0;
        ly = width > height ? 0 : height - width;
        nx = (x - lx) * 0.5;
        ny = (y - ly) * 0.5;

        const poly = makePoly(resolution);
        const pshape = rshape(poly, 0.5, 0.5, amin);

        const p = pshape.p;
        shape = new Shape();

        let ox = position.x + nx;
        let oy = position.y + ny;

        for (let idx = 0; idx < p.length; idx++) {
            shape[idx ? "lineTo" : "moveTo"](p[idx].x + ox, p[idx].y + oy);
        }
    }
    return shape.clone();
}

export const useCircularPadGeometry = (
    copperLayerThickness: number,
    holeType: FootPrintPadHoleType | undefined,
    layoutThickness: number,
    holeSize: IVector2 | undefined,
    holePosition: IVector2 | undefined,
    size: IVector2 | undefined
) => {
    return useMemo(() => {
        let geometry;
        if (holeType === FootPrintPadHoleType.nonPlatedHole) {
            return undefined;
        }

        let padDepth = copperLayerThickness;

        if (holeType === FootPrintPadHoleType.platedThroughHole) {
            padDepth = copperLayerThickness * 2 + layoutThickness;
        }

        const extrudeSettings = {
            steps: 1,
            depth: padDepth,
            bevelEnabled: false,
            //material: 0, //frontMaterial
            //extrudeMaterial: 1, //sideMaterial
            curveSegments: 128,
        };

        if (size) {
            const shape = createCircleOrOblongShape(size, { x: 0, y: 0 }, 64);

            if (
                holeSize &&
                holePosition &&
                holeType === FootPrintPadHoleType.platedThroughHole
            ) {
                // lets drill a hole into the pad, shall we?
                const holeShape = createCircleOrOblongShape(
                    holeSize,
                    holePosition,
                    64
                );

                shape.holes.push(holeShape);
            }

            geometry = new ExtrudeGeometry(shape, extrudeSettings);
        }
        return geometry;
    }, [
        copperLayerThickness,
        holeType,
        layoutThickness,
        holeSize,
        holePosition,
        size,
    ]);
};
