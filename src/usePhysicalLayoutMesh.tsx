import {useMemo} from "react";
import {ExtrudeGeometry, Mesh, Shape} from "three";




export default function usePhysicalLayoutMesh(boardShapeWithHoles: Shape, materials: any) {
    return useMemo(() => {
        const extrudeSettings = {
            steps: 1,
            depth: 0.000001, // check this
            bevelEnabled: false,
            material: 0, //frontMaterial
            extrudeMaterial: 1, //sideMaterial
            curveSegments: 128,
        };

        const geometry = new ExtrudeGeometry(boardShapeWithHoles, extrudeSettings);

        const mesh = new Mesh(geometry, materials);

        mesh.geometry.center();
        return mesh;
    }, [boardShapeWithHoles, materials]);
}
