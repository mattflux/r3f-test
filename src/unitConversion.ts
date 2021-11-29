const twoPi = 2 * Math.PI;

const lengthUnits = {
    // unitName: howManyPerMeter
    mm: 1000,
    cm: 100,
    meter: 1,
    inch: 1 / 0.0254, // Approx 39.37, but an inch is defined as exactly 2.54cm, so use the exact value not the approx.
};

const angleUnits = {
    // unitName: howManyInACircle
    rad: twoPi,
    deg: 360,
    grad: 400,
};

type LengthUnitType = keyof typeof lengthUnits;
type AngleUnitType = keyof typeof angleUnits;

export function convertLength(value: number, from: LengthUnitType, to: LengthUnitType) {
    return (value / lengthUnits[from]) * lengthUnits[to];
}

export function convertAngle(value: number, from: AngleUnitType, to: AngleUnitType) {
    return (value / angleUnits[from]) * angleUnits[to];
}

export function mmToMeters(mm: number) {
    return convertLength(mm, "mm", "meter");
}

export function metersToMm(meters: number) {
    return convertLength(meters, "meter", "mm");
}

export function metersToInch(meters: number) {
    return convertLength(meters, "meter", "inch");
}

export function radiansToDegrees(radians: number) {
    return convertAngle(radians, "rad", "deg");
}
