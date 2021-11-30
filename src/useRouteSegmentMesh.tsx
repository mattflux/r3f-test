import {useMemo} from "react";
import {BoxGeometry, Material, Mesh, Vector3} from "three";
import {IVector3} from "./bakedModels";

export default function useRouteSegmentMesh(
    startPosition: IVector3 | undefined,
    endPosition: IVector3 | undefined,
    size: IVector3 | undefined,
    copperLayerThickness: number | undefined,
    material: Material,
) {
    //const padSolderPasteMaterial = useMeshPhongMaterial({color: "silver", shininess: 100, side: DoubleSide});

    const startVector = useMemo(() => {
        if (startPosition) {
            return new Vector3(startPosition.x, startPosition.y, startPosition.z);
        }
    }, [startPosition]);

    const endVector = useMemo(() => {
        if (endPosition) {
            return new Vector3(endPosition.x, endPosition.y, endPosition.z);
        }
    }, [endPosition]);

    const plane = useMemo(() => {
        return new BoxGeometry(1, 1, 1);
    }, []);

    return useMemo(() => {
        if (startVector && endVector && copperLayerThickness && size) {
            const vector12 = new Vector3().copy(endVector).sub(startVector);

            const midPoint = new Vector3().copy(vector12).multiplyScalar(0.5).add(startVector);

            const lineMesh = new Mesh(plane, material);

            lineMesh.position.copy(midPoint);
            lineMesh.scale.x = vector12.length();
            lineMesh.scale.y = size.x * 1;
            lineMesh.scale.z = copperLayerThickness * 1;
            lineMesh.position.z = copperLayerThickness / 2;
            lineMesh.rotation.z = -Math.atan2(-vector12.y, vector12.x);

            return lineMesh;
        }
    }, [endVector, plane, copperLayerThickness, material, startVector, size]);
}
