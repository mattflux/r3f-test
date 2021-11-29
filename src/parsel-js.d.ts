declare module "parsel-js" {
    interface Tokens {
        type: "class" | "attribute" | "id" | "type" | "pseudo-element" | "pseudo-class" | "comma" | "combinator";
        content: string;
        name: string;
        namespace?: string;
        value?: string;
        pos: [number, number];
        operator?: string;
        argument?: string;
        subtree?: AST;
        caseSensitive?: "i";
    }

    interface Complex {
        type: "complex";
        combinator: string;
        right?: Complex | Compound | Tokens;
        left: Complex | Compound | Tokens;
    }
    interface Compound {
        type: "compound";
        list: Tokens[];
    }

    export interface List {
        type: "list";
        list: AST[];
    }
    export type AST = Complex | Compound | List | Tokens;
    interface ParserOptions {
        recursive?: boolean;
        list?: boolean;
    }
    interface SpecificityOptions {
        format?: string;
    }

    /**
     * Get AST:
     */
    export function parse(selector: string, options?: ParserOptions): AST;

    /**
     * Get list of tokens as a flat array:
     */
    export function tokenize(selector: string): Tokens[];

    /**
     * Traverse all tokens of a (sub)tree:
     */
    export function walk(node: AST, cb: (node: AST, parentNode: AST) => {}): void;

    /**
     * Calculate specificity (returns an array of 3 numbers):
     */
    export function specificity(selector: string | AST, options?: SpecificityOptions): number[];

    /**
     *  To convert the specificity array to a number
     */
    export function specificityToNumber(specificity: number[], base?: number): number;
}
