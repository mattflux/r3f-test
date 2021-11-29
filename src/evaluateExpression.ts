import {
    absDependencies,
    addDependencies,
    BigNumber,
    bignumberDependencies,
    BigNumberDependencies,
    booleanDependencies,
    cosDependencies,
    create,
    createUnitDependencies,
    divideDependencies,
    evaluateDependencies,
    formatDependencies,
    isNaNDependencies,
    isNegativeDependencies,
    isPositiveDependencies,
    logDependencies,
    MathJsStatic,
    maxDependencies,
    minDependencies,
    multiplyDependencies,
    numberDependencies,
    powDependencies,
    roundDependencies,
    sinDependencies,
    stringDependencies,
    subtractDependencies,
    tanDependencies,
    toDependencies,
    typeOfDependencies,
    UnitDependencies,
    unitDependencies,
} from "mathjs";

import {IPcbLayoutRuleData, IPropertyData} from "./SharedDataModels";

// floating point rounding errors were creating real world issues with large and small numbers
// so switching mathjs to use BigNumbers
// https://mathjs.org/docs/datatypes/bignumbers.html
export function createMathJsBigNumberInstance() {
    // There is a way to tree shake mathjs but I couldn't figure out which dependecies it needed
    // https://mathjs.org/docs/custom_bundling.html
    return create(
        {
            evaluateDependencies,
            createUnitDependencies,
            typeOfDependencies,
            divideDependencies,
            multiplyDependencies,
            addDependencies,
            subtractDependencies,
            numberDependencies,
            bignumberDependencies,
            UnitDependencies,
            unitDependencies,
            BigNumberDependencies,
            tanDependencies,
            sinDependencies,
            cosDependencies,
            minDependencies,
            maxDependencies,
            logDependencies,
            roundDependencies,
            powDependencies,
            toDependencies,
            formatDependencies,
            absDependencies,
            booleanDependencies,
            stringDependencies,
            isNaNDependencies,
            isPositiveDependencies,
            isNegativeDependencies,
        },
        {
            number: "BigNumber",
            precision: 64,
        },
    );
}

export function createMathJsBigNumberInstanceWithOnlyUnitConversion() {
    // There is a way to tree shake mathjs but I couldn't figure out which dependecies it needed
    // https://mathjs.org/docs/custom_bundling.html
    return create(
        {
            evaluateDependencies,
            createUnitDependencies,
            typeOfDependencies,
            numberDependencies,
            bignumberDependencies,
            UnitDependencies,
            unitDependencies,
            BigNumberDependencies,
            toDependencies,
        },
        {
            number: "BigNumber",
            precision: 64,
        },
    );
}

const electricalEvaluationMathjs = createMathJsBigNumberInstance();
const electricalOnlyUnitConversionEvaluationMathjs = createMathJsBigNumberInstanceWithOnlyUnitConversion();
configureCustomUnits(electricalEvaluationMathjs);
configureCustomUnits(electricalOnlyUnitConversionEvaluationMathjs);

const mechanicalEvaluationMathjs = createMathJsBigNumberInstance();
const mechanicalOnlyUnitConversionEvaluationMathjs = createMathJsBigNumberInstanceWithOnlyUnitConversion();

function configureCustomUnits(mathjs: Partial<MathJsStatic>) {
    mathjs.createUnit?.(
        "yocto",
        {
            definition: "0.000000000000000000000001",
            aliases: ["y", "Yocto"],
        },
        {override: true},
    );
    mathjs.createUnit?.("zepto", {definition: "0.000000000000000000001", aliases: ["z", "Zepto"]}, {override: true});
    mathjs.createUnit?.("atto", {definition: "0.000000000000000001", aliases: ["a", "Atto"]}, {override: true});
    mathjs.createUnit?.("femto", {definition: "0.000000000000001", aliases: ["f", "Femto"]}, {override: true});
    mathjs.createUnit?.("pico", {definition: "0.000000000001", aliases: ["p", "Pico"]}, {override: true});
    mathjs.createUnit?.("nano", {definition: "0.000000001", aliases: ["n", "Nano"]}, {override: true});
    mathjs.createUnit?.("micro", {definition: "0.000001", aliases: ["μ", "u", "Micro"]}, {override: true});
    mathjs.createUnit?.("milli", {definition: "0.001", aliases: ["m", "Milli"]}, {override: true});
    mathjs.createUnit?.("centi", {definition: "0.01", aliases: ["c", "Centi"]}, {override: true});
    mathjs.createUnit?.("deci", {definition: "0.1", aliases: ["d", "Deci"]}, {override: true});
    mathjs.createUnit?.("deca", {definition: "10", aliases: ["da", "Deca"]}, {override: true});
    mathjs.createUnit?.("hecto", {definition: "100", aliases: ["h", "Hecto"]}, {override: true});
    mathjs.createUnit?.("kilo", {definition: "1000", aliases: ["k", "Kilo", "K"]}, {override: true});
    mathjs.createUnit?.("mega", {definition: "1000000", aliases: ["M", "Mega"]}, {override: true});
    mathjs.createUnit?.("giga", {definition: "1000000000", aliases: ["G", "Giga"]}, {override: true});
    mathjs.createUnit?.("tera", {definition: "1000000000000", aliases: ["T", "Tera"]}, {override: true});
    mathjs.createUnit?.("peta", {definition: "1000000000000000", aliases: ["P", "Peta"]}, {override: true});
    mathjs.createUnit?.("exa", {definition: "1000000000000000000", aliases: ["E", "Exa"]}, {override: true});
    mathjs.createUnit?.("zetta", {definition: "1000000000000000000000", aliases: ["Z", "Zetta"]}, {override: true});
    mathjs.createUnit?.(
        "yotta",
        {
            definition: "1000000000000000000000000",
            aliases: ["Y", "Yotta"],
        },
        {override: true},
    );
    // This is going beyond Math.js official API, but here we assign the uppercase 'K' prefix the same meaning as lowercase 'k
    (mathjs as any).Unit.PREFIXES.SHORT["K"] = (mathjs as any).Unit.PREFIXES.SHORT["k"];
}

function createCustomScope() {
    return {
        ohmsLaw: (voltageSource: number, voltageDrop: number, current: number) => {
            return (voltageSource - voltageDrop) / current;
        },
    };
}

export function isExpression(expression: string) {
    return expression.trim().startsWith("=");
}

export function electricalEvaluateExpression(expression: string, forceUnitConversions: boolean = false) {
    const scope = createCustomScope();

    if (!isExpression(expression) && forceUnitConversions) {
        try {
            // eval capabilities are defined by the imported dependencies when creating the mathjs instance
            return electricalOnlyUnitConversionEvaluationMathjs.evaluate!(expression.toString(), scope);
        } catch {
            return expression;
        }
    } else if (isExpression(expression)) {
        const expressionWithoutEquals = expression.trim().substring(1).trim();
        try {
            // eval capabilities are defined by the imported dependencies when creating the mathjs instance
            return electricalEvaluationMathjs.evaluate!(expressionWithoutEquals.toString(), scope);
        } catch (error) {
            return expression;
        }
    } else {
        return expression;
    }
}

export function mechanicalEvaluateExpression(expression: string, forceUnitConversions: boolean = false) {
    const scope = createCustomScope();

    if (!isExpression(expression) && forceUnitConversions) {
        try {
            // eval capabilities are defined by the imported dependencies when creating the mathjs instance
            return mechanicalOnlyUnitConversionEvaluationMathjs.evaluate!(expression.toString(), scope);
        } catch {
            return expression;
        }
    } else if (isExpression(expression)) {
        const expressionWithoutEquals = expression.trim().substring(1).trim();
        try {
            // eval capabilities are defined by the imported dependencies when creating the mathjs instance
            return mechanicalEvaluationMathjs.evaluate!(expressionWithoutEquals.toString(), scope);
        } catch (error) {
            return expression;
        }
    } else {
        return expression;
    }
}

export function normalizeEvaluatedExpression(
    evaluation: any,
    addUnitPostfix: boolean = false,
    returnBigNumberType = true,
    convertToUnit?: string | undefined,
) {
    if (typeof evaluation === "string") {
        return evaluation;
    } else if (typeof evaluation === "number") {
        return evaluation;
    } else if (electricalEvaluationMathjs.typeOf?.(evaluation) === "BigNumber") {
        if (returnBigNumberType) {
            return evaluation as BigNumber;
        } else {
            return electricalEvaluationMathjs.number!(evaluation) as number;
        }
    } else if (electricalEvaluationMathjs.typeOf?.(evaluation) === "Unit") {
        if (convertToUnit) {
            return evaluation.toNumber(convertToUnit);
        } else {
            if (addUnitPostfix) {
                return evaluation.toString();
            } else {
                return JSON.parse(evaluation["value"]);
            }
        }
    }
}

function stringifyNumber(propertyValue: number, propertyUnit?: string | undefined) {
    if (propertyUnit && !propertyValue.toString().endsWith(propertyUnit)) {
        return `${humanizeBigNumber(propertyValue.toString())}${propertyUnit}`;
    } else {
        return humanizeBigNumber(propertyValue.toString());
    }
}

function stringifyBoolean(propertyValue: boolean, propertyUnit?: string | undefined) {
    if (propertyUnit && !propertyValue.toString().endsWith(propertyUnit)) {
        return `${propertyValue.toString()} ${propertyUnit}`;
    } else {
        return propertyValue.toString();
    }
}

function stringifyString(propertyValue: string, propertyUnit?: string | undefined): string {
    if (!isExpression(propertyValue)) {
        if (propertyUnit && !propertyValue.endsWith(propertyUnit)) {
            return `${propertyValue}${propertyUnit}`;
        } else {
            return propertyValue;
        }
    }

    const evaluatedExpression = electricalEvaluateExpression(propertyValue);
    const normalizedEvaluatedExpression = normalizeEvaluatedExpression(evaluatedExpression, !propertyUnit);

    if (typeof normalizedEvaluatedExpression === "string") {
        const newValue = humanizeBigNumber(normalizedEvaluatedExpression);

        if (normalizedEvaluatedExpression === propertyValue) {
            if (propertyUnit && !normalizedEvaluatedExpression.endsWith(propertyUnit)) {
                return `${normalizedEvaluatedExpression}${propertyUnit}`;
            } else {
                return normalizedEvaluatedExpression;
            }
        } else if (propertyUnit && !newValue.endsWith(propertyUnit)) {
            return `${newValue}${propertyUnit}`;
        } else {
            return newValue;
        }
    } else if (typeof normalizedEvaluatedExpression === "number") {
        const fixedValue = normalizedEvaluatedExpression.toFixed(20);
        const newValue = humanizeBigNumber(fixedValue);

        if (normalizedEvaluatedExpression === Number(propertyValue)) {
            if (propertyUnit && !newValue.endsWith(propertyUnit)) {
                return `${normalizedEvaluatedExpression}${propertyUnit}`;
            } else {
                return fixedValue;
            }
        } else if (propertyUnit && !newValue.endsWith(propertyUnit)) {
            return `${newValue}${propertyUnit}`;
        } else {
            return newValue;
        }
    } else if (electricalEvaluationMathjs.typeOf?.(normalizedEvaluatedExpression) === "BigNumber") {
        const newValue = humanizeBigNumber(
            electricalEvaluationMathjs.number!(normalizedEvaluatedExpression).toString(),
        );
        if (propertyUnit && !newValue.endsWith(propertyUnit)) {
            return `${newValue}${propertyUnit}`;
        } else {
            return newValue;
        }
    }

    return propertyValue;
}

export function stringifyPropertyValue(propertyData: IPropertyData): string {
    if (typeof propertyData.value === "string") {
        return stringifyString(propertyData.value, propertyData.unit);
    } else if (typeof propertyData.value === "number") {
        return stringifyNumber(propertyData.value, propertyData.unit);
    } else if (typeof propertyData.value === "boolean") {
        return stringifyBoolean(propertyData.value, propertyData.unit);
    }

    return "";
}

export function stringifyPcbLayoutRuleValue(pcbLayoutRuleData: IPcbLayoutRuleData): string {
    if (typeof pcbLayoutRuleData.value === "string") {
        return stringifyString(pcbLayoutRuleData.value);
    } else if (typeof pcbLayoutRuleData.value === "number") {
        return stringifyNumber(pcbLayoutRuleData.value);
    } else if (typeof pcbLayoutRuleData.value === "boolean") {
        return stringifyBoolean(pcbLayoutRuleData.value);
    }

    return "";
}

function humanizeNumbersUnderOne(valueUnit: math.Unit) {
    const units = ["m", "u", "n", "p", "f", "a", "z"];
    let i = 0;
    let iteratorValue = valueUnit.clone().toString();

    do {
        iteratorValue = electricalEvaluationMathjs.format!(
            electricalEvaluationMathjs.multiply!(
                electricalEvaluationMathjs.bignumber!(iteratorValue),
                electricalEvaluationMathjs.bignumber!(1000),
            ),
            {notation: "fixed"},
        );
        i++;
    } while (iteratorValue.startsWith("0") && i < units.length);

    const convertedValue = electricalEvaluationMathjs.format!(valueUnit.toNumber(units[i - 1]), {notation: "fixed"});

    return `${convertedValue}${units[i - 1]}` || "";
}

function humanizeNumbersOverOneThousand(valueUnit: math.Unit) {
    const units = ["k", "M", "G", "T", "P", "E", "Z", "Y"];
    let i = 0;
    let iteratorValue = valueUnit.clone().toString();

    do {
        iteratorValue = electricalEvaluationMathjs.format!(
            electricalEvaluationMathjs.divide!(
                electricalEvaluationMathjs.bignumber!(iteratorValue),
                electricalEvaluationMathjs.bignumber!(1000),
            ),
            {notation: "fixed"},
        );
        i++;
    } while (iteratorValue.toString().endsWith("0") && i < units.length);

    const convertedValue = valueUnit.toNumber(units[i - 1]);

    return `${numberWithCommas(convertedValue)}${units[i - 1]}` || "";
}

function humanizeNumbersBetweenOneAndOneThousand(value: string) {
    const valueParts = value.split(" ");

    if (valueParts.length === 2) {
        const numberPart = valueParts[0];

        return `${numberWithCommas(Number(numberPart))} ${valueParts[1]}` || "";
    } else {
        return numberWithCommas(Number(value)).toString() || "";
    }
}

function valueHasTrailingZeros(value: string) {
    return value.toString().endsWith("0");
}

function valueHasLeadingZeros(value: string) {
    return value.toString().startsWith("0");
}

export function humanizeBigNumber(value: string) {
    try {
        const valueUnit = electricalEvaluationMathjs.unit!(value);

        if (Number(value) === 0) {
            return value;
        }

        const ValueUnitAsNumber = valueUnit.toNumeric("");

        if (value && valueHasTrailingZeros(value) && ValueUnitAsNumber >= 1000) {
            return humanizeNumbersOverOneThousand(valueUnit);
        } else if (value && valueHasLeadingZeros(value) && ValueUnitAsNumber < 1) {
            return humanizeNumbersUnderOne(valueUnit);
        } else {
            return humanizeNumbersBetweenOneAndOneThousand(value);
        }
    } catch {
        return value;
    }
}

function numberWithCommas(value: number) {
    const parts = value.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}
