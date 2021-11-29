import { useMemo } from "react";
import { ExtrudeGeometry } from "three";
import { IVector2 } from "../bakedModels";
import { createCircleOrOblongShape } from "./useCircularPadGeometry";

export const useCircularPadSolderPasteGeometry = (
    solderPasteThickness: number,
    size: IVector2 | undefined
) => {
    return useMemo(() => {
        let geometry;

        if (!geometry) {
            if (solderPasteThickness === 0) {
                return undefined;
            }

            const extrudeSettings = {
                steps: 1,
                depth: solderPasteThickness,
                bevelEnabled: true,
                bevelThickness: 0.00001,
                bevelSize: 0.00001,
                //material: 0, //frontMaterial
                //extrudeMaterial: 1, //sideMaterial
                curveSegments: 128,
            };

            if (size) {
                const shape = createCircleOrOblongShape(
                    size,
                    { x: 0, y: 0 },
                    64
                );

                geometry = new ExtrudeGeometry(shape, extrudeSettings);
            }
        }

        return geometry;
    }, [size, solderPasteThickness]);
};
