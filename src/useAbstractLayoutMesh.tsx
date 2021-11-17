import {useMemo} from "react";
import {Shape} from "three";
import {Line2, LineGeometry, LineMaterial} from "three-stdlib";

export default function useAbstractLayoutMesh(boardShapeWithHoles: Shape) {
    return useMemo(() => {
        const points = boardShapeWithHoles.getPoints(64);
        const geo = new LineGeometry();

        const pointArray: number[] = [];

        points.forEach((point) => {
            pointArray.push(point.x);
            pointArray.push(point.y);
            pointArray.push(0);
        });

        geo.setPositions(pointArray);
        geo.center();

        const material = new LineMaterial({color: "blue", linewidth: 0.001});

        const mesh = new Line2(geo, material);


        mesh.geometry.center();
        return mesh;
    }, [boardShapeWithHoles]);
}
