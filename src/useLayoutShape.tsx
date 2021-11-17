import {Shape} from "three";

export default function useLayoutShape(shapeString: string): Shape {
    const boardShape = () => {
            let shape = new Shape();

            switch (shapeString) {
                case "rectangle": {
                    const sizeX = 0.5;
                    const sizeY = 0.3;

                    shape.moveTo(-sizeX / 2, sizeY / 2);
                    shape.lineTo(sizeX / 2, sizeY / 2);
                    shape.lineTo(sizeX / 2, -sizeY / 2);
                    shape.lineTo(-sizeX / 2, -sizeY / 2);
                    shape.lineTo(-sizeX / 2, sizeY / 2);

                    break;
                }
                case "circular": {
                    const radius = 0.5 / 2;

                    shape.moveTo(radius, 0);
                    shape.absarc(0, 0, radius, 0, 2 * Math.PI, false);

                    break;
                }
        }
        return shape;
    };
    return boardShape();
}