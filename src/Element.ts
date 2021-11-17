// picked the common AND safe ones.... maybe

import FluxAPI from "./FluxApi";

// from from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects
const SandboxGlobals = [
    "Math",
    "Date",
    "Number",
    "BigInt",
    "Boolean",
    "String",
    "Object",
    "Error",
    "EvalError",
    "RangeError",
    "ReferenceError",
    "SyntaxError",
    "TypeError",
    "URIError",
    "parseFloat",
    "parseInt",
    "encodeURI",
    "decodeURI",
    "decodeURIComponent",
    "encodeURIComponent",
    "escape",
    "unescape",
    "PropertyKey",
    "isNaN",
    "NaN",
    "isFinite",
    "Infinity",
    "RegExp",
    "Array",
    "ArrayBuffer",
    "DataView",
    "Set",
    "WeakSet",
    "JSON",
    "Promise",
    "Map",
    "WeakMap",
    "setInterval",
    "clearInterval",
    "setTimeout",
    "clearTimeout",
];


function compileCode(sourceCode: string) {
    const compiler = require("@nx-js/compiler-util");

    const cleanSourceCode = catchSandboxRuntimeErrors(sourceCode);
    const jsSourceCode = asyncWrapper(cleanSourceCode);

    if (sourceCode && !jsSourceCode) {
        // eslint-disable-next-line no-console -- allow legacy console statements
        console.error(sourceCode, true);
        // eslint-disable-next-line no-console -- allow legacy console statements
        console.error("Sourcecode Syntax Error. Transpiling was aborted!", true);
    }

    compiler.expose.apply(undefined, SandboxGlobals);

    return compiler.compileCode(jsSourceCode);
}

function catchSandboxRuntimeErrors(balancedCurlyBrackets: string) {
    return `try {const result = ${balancedCurlyBrackets}; flux.print(result); return result;} catch(error) {flux.print(error.message)}`;
}

function asyncWrapper(code: string) {
    return `
        const $asyncWrapperFunction = async () => {
          ${code};
        }
        return $asyncWrapperFunction()
      `;
}



export class Element {
    fluxApi: FluxAPI;
    constructor(setMessage: any) {
        this.fluxApi = new FluxAPI(setMessage);
    }
    public async runCode(sourceCode: string) {
        try {
            const code = compileCode(sourceCode);
            const context = {flux: this.fluxApi};
            const result = await code(context);
            return result;
        } catch (error) {
            console.log(error, true);
            return null;
        }
    }

}
