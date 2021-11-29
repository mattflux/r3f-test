import {useMemo} from "react";
import {DoubleSide, Mesh, MeshBasicMaterial, MeshBasicMaterialParameters, Color} from "three";
import {IPcbLayoutBakedPadNodeRules} from "../bakedModels";
import {useCircularPadGeometry} from "./useCircularPadGeometry";


export const getMeshBasicMaterial = (parameters: MeshBasicMaterialParameters) => {
    let material;

    if (!material) {
        material = new MeshBasicMaterial({...parameters, color: new Color(parameters.color).convertSRGBToLinear()});
    }

    return material;
};

export const useMeshBasicMaterial = (parameters: MeshBasicMaterialParameters) => {
    return useMemo(() => {
        return getMeshBasicMaterial(parameters);
    }, [parameters]);
};


export default function useAbstractCircularPadMesh(
    bakedRules: IPcbLayoutBakedPadNodeRules | undefined,
    layoutThickness: number,
    copperLayerColor: string | undefined,
    focussed: boolean | undefined | null,
) {
    const material = useMeshBasicMaterial({color: copperLayerColor, side: DoubleSide});

    const geometry = useCircularPadGeometry(
        bakedRules?.copperLayerThickness || 0,
        bakedRules?.hole?.holeType,
        layoutThickness,
        bakedRules?.hole?.holeSize,
        bakedRules?.hole?.holePosition,
        bakedRules?.size,
    );

    return useMemo(() => {
        return new Mesh(geometry, material);
    }, [material, geometry]);
}
