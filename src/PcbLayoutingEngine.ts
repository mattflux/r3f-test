/* eslint-disable @typescript-eslint/consistent-type-assertions */
/* eslint-disable @typescript-eslint/member-ordering */
import * as parsel from "parsel-js";

import {get, set} from "./cache";
import {SortOrder} from "./sort";
import {metersToInch, metersToMm} from "./unitConversion";
import R from "./resources/Namespace";
import {isCopperLayer, IStackupConfig} from "./Stackups";
import {
    BasePcbLayoutNodeTypes,
    IAssetsMap,
    IElementData,
    IElementsMap,
    IGlobalPcbLayoutRuleSetData,
    IPcbLayoutElementNodeData,
    IPcbLayoutFootprintNodeData,
    IPcbLayoutLayoutNodeData,
    IPcbLayoutNode,
    IPcbLayoutNodeData,
    IPcbLayoutNodesMap,
    IPcbLayoutPadNodeData,
    IPcbLayoutRouteNodeData,
    IPcbLayoutRouteSegmentNodeData,
    IPcbLayoutRuleData,
    IPcbLayoutRuleSetsMap,
    IPcbLayoutRulesMap,
    IPcbLayoutViaNodeData,
    IRouteData,
    IRoutesMap,
    PcbBoardLayer,
    PcbLayoutRuleValue,
    PcbViaType,
} from "./SharedDataModels";

// import {PartStorageHelper} from "../storage_engine/helpers/PartStorageHelper";

// import {PcbDomFactory} from "./PcbDomFactory";
import {PcbLayoutNodeTreeTraveler} from "./PcbLayoutNodeTreeTraveler";
import {IRuleConfigData, LayoutRules} from "./PcbLayoutRules";
import {mechanicalEvaluateExpression, normalizeEvaluatedExpression} from "./evaluateExpression";
import {FootPrintPadHoleType, IPcbLayoutBakedBaseEndPositionNodeRules, IPcbLayoutBakedBasePositionNodeRules, IPcbLayoutBakedBaseRotationNodeRules, IPcbLayoutBakedBaseScaleNodeRules, IPcbLayoutBakedBaseSizeNodeRules, IPcbLayoutBakedBaseStartPositionNodeRules, IPcbLayoutBakedLayoutNodeRules, IPcbLineShapeStyles, IVector2, IVector3, LayerOrientation, PcbBoardLayersMap, PcbBoardShape, PcbLayoutFootprintPadShape, PcbViaThermalReliefConductorAngle, PcbViaThermalReliefConductors, PcbViaThermalReliefTypes} from "./bakedModels";

export interface IPcbLayoutRuleSetsWithSpecificityMap {
    [ruleSetUid: string]: IPcbLayoutRuleSetsWithSpecificity;
}

export enum FileSuffix {
    modFile = ".mod",
    kicadModFile = ".kicad_mod",
}

export enum PcbRuleSetType {
    objectSpecific = "object",
    runtime = "runtime",
    global = "global",
    inheritedGlobal = "inheritedGlobal",
    foreignGlobal = "foreignGlobal",
    systemDefaultGlobal = "systemDefaultGlobal",
}

export interface IPcbLayoutRuleSetsWithSpecificity {
    specificity: number;
    ruleSet: IGlobalPcbLayoutRuleSetData;
    type: PcbRuleSetType;
}

interface IUnevaluatedVector3 {
    x: number | undefined;
    y: number | undefined;
    z: number | undefined;
}

interface IGetRulesFromRuleSetBasedOnSelectorIndex {
    [nodeUid: string]: {
        ruleSets: IPcbLayoutRuleSetsWithSpecificityMap;
    };
}

type SupportedSubjectTypes = IPcbLayoutNodeData | IElementData | IRouteData //| IDocumentData | ITerminalData;

export class PcbLayoutEngine {
    private static systemDefaultRulesAppendix: string = "system-default-rules";
    private documentUid: string;

    public elements: IElementsMap;
    public routes: IRoutesMap;
    public assets: IAssetsMap;
    public pcbLayoutNodes: IPcbLayoutNodesMap;
    public pcbLayoutRules: IPcbLayoutRuleSetsMap;
    private readonly defaultRootRuleSets: Readonly<IPcbLayoutRuleSetsMap>;
    private readonly runtimePcbLayoutRules: IPcbLayoutRuleSetsMap = {};
    private pcbLayoutNodeTreeTraveler: PcbLayoutNodeTreeTraveler;
    // private pcbFactory: PcbDomFactory;

    constructor(
        documentUid: string,
        elements: IElementsMap,
        routes: IRoutesMap,
        assets: IAssetsMap,
        pcbLayoutNodes: IPcbLayoutNodesMap,
        pcbLayoutRules: IPcbLayoutRuleSetsMap,
    ) {
        this.documentUid = documentUid;
        this.elements = elements;
        this.routes = routes;
        this.assets = assets;
        this.pcbLayoutNodes = pcbLayoutNodes;
        this.pcbLayoutRules = pcbLayoutRules;
        this.pcbLayoutNodeTreeTraveler = new PcbLayoutNodeTreeTraveler(this.pcbLayoutNodes);
        // this.pcbFactory = new PcbDomFactory(this.documentUid, this.pcbLayoutNodes);
        this.defaultRootRuleSets = this.getSystemDefaultLayoutRules();
    }

    public static getInstance(
        documentUid: string,
        elements: IElementsMap,
        routes: IRoutesMap,
        assets: IAssetsMap,
        pcbLayoutNodes: IPcbLayoutNodesMap,
        pcbLayoutRules: IPcbLayoutRuleSetsMap,
    ): PcbLayoutEngine {
        if (!PcbLayoutEngine.instance || documentUid !== PcbLayoutEngine.instance.documentUid) {
            PcbLayoutEngine.instance = new PcbLayoutEngine(
                documentUid,
                elements,
                routes,
                assets,
                pcbLayoutNodes,
                pcbLayoutRules,
            );
        } else {
            PcbLayoutEngine.instance.documentUid = documentUid;
            PcbLayoutEngine.instance.elements = elements;
            PcbLayoutEngine.instance.routes = routes;
            PcbLayoutEngine.instance.assets = assets;
            PcbLayoutEngine.instance.pcbLayoutNodes = pcbLayoutNodes;
            PcbLayoutEngine.instance.pcbLayoutRules = pcbLayoutRules;

            PcbLayoutEngine.instance.pcbLayoutNodeTreeTraveler.pcbLayoutNodes = pcbLayoutNodes;
        }

        return PcbLayoutEngine.instance;
    }

    public static getExistingInstance() {
        return PcbLayoutEngine.instance;
    }

    private static instance: PcbLayoutEngine;

    // Modeling our CSS like layouting engine after how browsers do it
    // Mozilla: https://hacks.mozilla.org/2017/08/inside-a-super-fast-css-engine-quantum-css-aka-stylo/
    public applyPcbLayoutRulesToPcbDOM() {
        const rootLevelPcbLayoutNodeUids = this.pcbLayoutNodeTreeTraveler.getRootLevelPcbLayoutNodeUids(
            this.documentUid,
        );

        rootLevelPcbLayoutNodeUids.forEach((nodeUid) => {
            this.traverseNodes(nodeUid);
        });
    }

    public getObjectSpecificRules(nodeUid: string): IPcbLayoutRulesMap {
        const node = this.pcbLayoutNodes[nodeUid];
        return node.pcbNodeRuleSet || {};
    }

    private getNodeLayoutRuleChainIndex: {
        [nodeUid: string]: {
            rules: IPcbLayoutRuleSetsWithSpecificityMap;
        };
    } = {};

    public getNodeLayoutRuleChain(nodeUid: string): IPcbLayoutRuleSetsWithSpecificityMap {
        const pcbLayoutRules = {...this.runtimePcbLayoutRules, ...this.pcbLayoutRules};

        const defaultRootRuleSetsThatApplyToCurrentNodeWithSpecificity = this.getSelectorBasedObjectLayoutRules(
            this.defaultRootRuleSets,
            this.pcbLayoutNodes[nodeUid].type,
            nodeUid,
            PcbRuleSetType.systemDefaultGlobal,
        );

        const rulesInheritedFromAncestorsWithSpecificity = this.getRulesInheritedFromAncestors(nodeUid);

        const selectorRulesThatApplyToCurrentNodeWithSpecificity = this.getSelectorBasedObjectLayoutRules(
            pcbLayoutRules,
            this.pcbLayoutNodes[nodeUid].type,
            nodeUid,
            PcbRuleSetType.inheritedGlobal,
        );

        const foreignRulesForNode = this.getForeignRulesForNode(nodeUid);
        const foreignRulesThatApplyToCurrentNodeWithSpecificity = this.getSelectorBasedObjectLayoutRules(
            foreignRulesForNode,
            this.pcbLayoutNodes[nodeUid].type,
            nodeUid,
            PcbRuleSetType.foreignGlobal,
        );

        const results = {
            ...defaultRootRuleSetsThatApplyToCurrentNodeWithSpecificity,
            ...rulesInheritedFromAncestorsWithSpecificity,
            ...selectorRulesThatApplyToCurrentNodeWithSpecificity,
            ...foreignRulesThatApplyToCurrentNodeWithSpecificity,
        };

        this.getNodeLayoutRuleChainIndex[nodeUid] = {
            rules: results,
        };

        return results;
    }

    public static parseSelector(rule: IGlobalPcbLayoutRuleSetData): {
        specificityNumber: number;
        parsedSelector: parsel.AST | undefined;
    } {
        const cacheKey = `parseSelector selector:${rule.selector}`;
        const cachedRule = get(cacheKey);

        if (cachedRule) {
            return cachedRule;
        }

        let specificityNumber: number = 0;
        let parsedSelector: parsel.AST | undefined;
        try {
            const specificity = parsel.specificity(rule.selector);
            specificityNumber = parsel.specificityToNumber(specificity);

            // There is a interactive demo here to play with the result object: https://projects.verou.me/parsel
            parsedSelector = parsel.parse(rule.selector);
        } catch (error) {
        }

        const result = {specificityNumber, parsedSelector};

        set(cacheKey, result);

        return result;
    }

    public static createUidAttributeSelector(objectKey: BasePcbLayoutNodeTypes, objectUid: string) {
        return `${objectKey}[uid="${objectUid}"]`;
    }

    public static getRuleSetBasedOnSelector(selector: string, pcbLayoutRuleSets: IPcbLayoutRuleSetsMap) {
        const ruleSet = Object.values(pcbLayoutRuleSets || {}).find((ruleSet) => ruleSet.selector === selector);

        return ruleSet;
    }

    private getForeignRulesForNode(nodeUid: string): IPcbLayoutRuleSetsMap {
        // const elementId = PcbDomFactory.getImportingElementId(nodeUid);
        // if (elementId && this.elements[elementId]) {
        //     const element = this.elements[elementId];
        //     return element.part_version_data_cache?.pcbLayoutRuleSets || {};
        // }
        return {};
    }

    private getRulesInheritedFromAncestors(nodeUid: string): IPcbLayoutRuleSetsWithSpecificityMap {
        // reversing the order here as to start iterating from root downward
        const ancestorUids = this.pcbLayoutNodeTreeTraveler.getAncestorUids(this.pcbLayoutNodes[nodeUid]).reverse();

        let rulesInheritedFromAncestorsWithSpecificity: IPcbLayoutRuleSetsWithSpecificityMap = {};

        const defaultRootRules = this.getSelectorBasedObjectLayoutRules(
            {...this.defaultRootRuleSets},
            BasePcbLayoutNodeTypes.root,
            this.documentUid,
        );

        ancestorUids.forEach((ancestorUid, ancestorIndex) => {
            const selectorRulesThatApplyToCurrentNodeWithSpecificity = this.getSelectorBasedObjectLayoutRules(
                {...this.defaultRootRuleSets, ...this.pcbLayoutRules},
                this.pcbLayoutNodes[ancestorUid].type,
                ancestorUid,
            );

            Object.entries({...defaultRootRules, ...selectorRulesThatApplyToCurrentNodeWithSpecificity}).forEach(
                ([key, ruleSetWithSpecificity]) => {
                    Object.values(ruleSetWithSpecificity.ruleSet.rules).forEach((rule) => {
                        const ruleConfig = LayoutRules[rule.key];

                        if (ruleConfig && ruleConfig.allChildNodesWillInheritThisRule) {
                            if (ruleSetWithSpecificity.specificity === 0) {
                                // specificity becomes a function of the height of the ancestor, range from -1 to 0
                                ruleSetWithSpecificity.specificity =
                                    (ancestorIndex + 1) / (ancestorUids.length + 1) - 1;
                            }
                            rulesInheritedFromAncestorsWithSpecificity[key] = {
                                ...ruleSetWithSpecificity,
                                type: PcbRuleSetType.inheritedGlobal,
                            };
                        }
                    });
                },
            );
        });

        return rulesInheritedFromAncestorsWithSpecificity;
    }

    public getSelectorBasedObjectLayoutRules(
        pcbLayoutRules: IPcbLayoutRuleSetsMap,
        objectType: BasePcbLayoutNodeTypes,
        nodeUid: string,
        type: PcbRuleSetType = PcbRuleSetType.global,
    ): IPcbLayoutRuleSetsWithSpecificityMap {
        let results: IPcbLayoutRuleSetsWithSpecificityMap = {};

        const nodeData = this.pcbLayoutNodes[nodeUid];

        if (nodeData) {
            const objectData = this.getSubjectDataFromNode(nodeData);

            Object.values(pcbLayoutRules).forEach((ruleSet) => {
                const result = this.getRulesFromRuleSetBasedOnSelector(
                    ruleSet,
                    objectData,
                    objectType,
                    nodeUid,
                    nodeData,
                    type,
                );

                results = {
                    ...results,
                    ...result,
                };
            });
        }

        return results;
    }

    private getRulesFromRuleSetBasedOnSelectorIndex: IGetRulesFromRuleSetBasedOnSelectorIndex = {};

    private getRulesFromRuleSetBasedOnSelector(
        ruleSet: IGlobalPcbLayoutRuleSetData,
        objectData: IPcbLayoutNode | IElementData | IRouteData,
        objectType: BasePcbLayoutNodeTypes,
        nodeUid: string,
        nodeData: IPcbLayoutNode,
        type: PcbRuleSetType,
    ): IPcbLayoutRuleSetsWithSpecificityMap {
        if (!ruleSet.selector) {
            return {};
        }

        const indexKey = `${nodeUid}.${ruleSet.uid}`;
        const indexObject = this.getRulesFromRuleSetBasedOnSelectorIndex[indexKey];
        if (indexObject) {
            return indexObject.ruleSets;
        }

        let {specificityNumber, parsedSelector} = PcbLayoutEngine.parseSelector(ruleSet);

        if (!parsedSelector) {
            return {};
        }

        const results: IPcbLayoutRuleSetsWithSpecificityMap = {};

        if (PcbLayoutEngine.isSystemDefaultRule(ruleSet)) {
            // system rules have lowest priority so they can be easily overwritten by any other rule
            specificityNumber = 0;
        }

        if (parsedSelector.type === "id") {
            if (this.idSelectorMatchesObjectData(parsedSelector, objectType, objectData)) {
                results[ruleSet.uid] = {
                    specificity: specificityNumber,
                    ruleSet: ruleSet,
                    type,
                };
            }
        } else if (parsedSelector.type === "list") {
            parsedSelector.list.forEach((individualSelector) => {
                if (individualSelector.type === "id") {
                    if (this.idSelectorMatchesObjectData(individualSelector, objectType, objectData)) {
                        results[ruleSet.uid] = {
                            specificity: specificityNumber,
                            ruleSet: ruleSet,
                            type,
                        };
                    }
                } else if (individualSelector.type === "compound") {
                    const matches = this.compoundSelectorMatchesObjectData(individualSelector, objectType, objectData);

                    if (matches) {
                        results[ruleSet.uid] = {
                            specificity: specificityNumber,
                            ruleSet: ruleSet,
                            type,
                        };
                    }
                } else if (individualSelector.type === "type") {
                    if (this.typeSelectorMatchesObjectData(individualSelector, objectType)) {
                        results[ruleSet.uid] = {
                            specificity: specificityNumber,
                            ruleSet: ruleSet,
                            type,
                        };
                    }
                }
            });
        } else if (parsedSelector.type === "compound") {
            const matches = this.compoundSelectorMatchesObjectData(parsedSelector, objectType, objectData);

            if (matches) {
                results[ruleSet.uid] = {
                    specificity: specificityNumber,
                    ruleSet: ruleSet,
                    type,
                };
            }
        } else if (parsedSelector.type === "type") {
            if (this.typeSelectorMatchesObjectData(parsedSelector, objectType)) {
                results[ruleSet.uid] = {
                    specificity: specificityNumber,
                    ruleSet: ruleSet,
                    type,
                };
            }
        } else if (parsedSelector.type === "complex") {
            const left = parsedSelector.left;
            const right = parsedSelector.right;

            if (parsedSelector.combinator === ">") {
                const matches: boolean[] = [];

                if (left) {
                    const ancestorUids = this.pcbLayoutNodeTreeTraveler.getAncestorUids(nodeData);

                    ancestorUids.forEach((ancestorUid) => {
                        const ancestorNodeData = this.pcbLayoutNodes[ancestorUid];
                        const ancestorNodeObjectData = this.getSubjectDataFromNode(ancestorNodeData);

                        if (ancestorNodeData) {
                            if (left.type === "compound") {
                                const match = this.compoundSelectorMatchesObjectData(
                                    left,
                                    ancestorNodeData.type,
                                    ancestorNodeObjectData,
                                );

                                matches.push(match);
                            } else if (left.type === "id") {
                                const match = this.idSelectorMatchesObjectData(
                                    left,
                                    ancestorNodeData.type,
                                    ancestorNodeObjectData,
                                );
                                matches.push(match);
                            } else if (left.type === "type") {
                                const match = this.typeSelectorMatchesObjectData(left, ancestorNodeData.type);

                                matches.push(match);
                            }
                        }
                    });
                }

                if (right) {
                    if (right.type === "compound") {
                        const match = this.compoundSelectorMatchesObjectData(right, nodeData.type, objectData);

                        matches.push(match);
                    } else if (right.type === "id") {
                        const match = this.idSelectorMatchesObjectData(right, nodeData.type, objectData);

                        matches.push(match);
                    } else if (right.type === "type") {
                        const match = this.typeSelectorMatchesObjectData(right, nodeData.type);

                        matches.push(match);
                    }
                }

                if (matches.filter((match) => match).length >= 2) {
                    results[ruleSet.uid] = {
                        specificity: specificityNumber,
                        ruleSet: ruleSet,
                        type,
                    };
                }
            }
        }

        this.getRulesFromRuleSetBasedOnSelectorIndex[indexKey] = {
            ruleSets: results,
        };

        return results;
    }

    public static isSystemDefaultRule(rule: IGlobalPcbLayoutRuleSetData) {
        return rule.uid.includes(PcbLayoutEngine.systemDefaultRulesAppendix);
    }

    // We are implementing this as closely as makes sense to CSS: https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/Cascade_and_inheritance
    public static orderRulesBySpecificity(
        objectRules: IPcbLayoutRuleSetsWithSpecificityMap,
    ): IPcbLayoutRuleSetsWithSpecificity[] {
        const objectRulesArray = Object.values(objectRules);

        const sortedRules = objectRulesArray.sort((a, b) => {
            const result =
                a.specificity < b.specificity
                    ? -1
                    : a.specificity > b.specificity
                    ? 1
                    : b.ruleSet.uid.localeCompare(a.ruleSet.uid); // fallback to alphabetical to ensure deterministic ordering
            return result * SortOrder.asc;
        });
        return sortedRules;
    }

    // This method will flatten all incoming rules in their order into one final list to apply to the node
    public static flattenRules(rankedRuleSetsArray: IGlobalPcbLayoutRuleSetData[]): IPcbLayoutRulesMap {
        const result: IPcbLayoutRulesMap = {};

        rankedRuleSetsArray.forEach((rankedRuleSet) => {
            Object.values(rankedRuleSet.rules || {}).forEach((rankedRule) => {
                if (this.shouldApplyRule(rankedRule)) {
                    result[rankedRule.key] = rankedRule;
                }
            });
        });

        return result;
    }

    public static rankAndFlatten(
        selectorBasedRules: IPcbLayoutRuleSetsWithSpecificityMap,
        objectSpecificRules: IPcbLayoutRulesMap,
    ) {
        const rankedRulesChain = PcbLayoutEngine.orderRulesBySpecificity(selectorBasedRules);
        const rankedLayoutRules = PcbLayoutEngine.flattenRules(
            rankedRulesChain.map((ruleWithSpecificity) => ruleWithSpecificity.ruleSet),
        );

        // here we give objectSpecific rules full precedence over selector-based rules
        const activeObjectSpecificRules: IPcbLayoutRulesMap = Object.values(objectSpecificRules)
            .filter((rule) => this.shouldApplyRule(rule))
            .reduce((newObject, rule) => ({...newObject, [rule.key]: rule}), {});

        return {...rankedLayoutRules, ...activeObjectSpecificRules};
    }

    private static shouldApplyRule(rule: IPcbLayoutRuleData) {
        return !rule.disabled && rule.value !== undefined && rule.value !== null && rule.value !== "";
    }

    public static evaluateNumericInputValue(
        value: number | string,
        unitRule: IPcbLayoutRuleData | undefined,
        convertToUnit: "m" | "rad" | undefined, // undefined means don't convert (eg for scale units)
    ): number {
        const cacheKey = `evaluateNumericInputValue_params:${value}-${unitRule}-${convertToUnit}`;
        const cachedEvaluation = get(cacheKey);

        if (cachedEvaluation) {
            return cachedEvaluation;
        }

        try {
            const normalizedValue = PcbLayoutEngine.convertToNumberIfIsNumeric(value);

            let defaultUnit = undefined;
            if (unitRule) {
                defaultUnit = unitRule.value;
            } else if (convertToUnit === "m") {
                defaultUnit = LayoutRules.unit.default;
            } else if (convertToUnit === "rad") {
                defaultUnit = LayoutRules.rotationUnit.default;
            }

            if (normalizedValue && typeof normalizedValue === "string") {
                const evaluatedExpression = mechanicalEvaluateExpression(normalizedValue, true);

                const evaluatedValue = normalizeEvaluatedExpression(evaluatedExpression, false, false, convertToUnit);

                if (typeof evaluatedValue === "number") {
                    const result = this.enforceGridPrecisionInMeters(evaluatedValue);

                    set(cacheKey, result);
                    return result;
                } else {
                    return 0;
                }
            } else if (normalizedValue && typeof normalizedValue === "number") {
                let evaluatedExpression;
                if (defaultUnit) {
                    evaluatedExpression = mechanicalEvaluateExpression(`${normalizedValue} ${defaultUnit}`, true);
                } else {
                    evaluatedExpression = mechanicalEvaluateExpression(`${normalizedValue}`, true);
                }

                const evaluatedValue = normalizeEvaluatedExpression(evaluatedExpression, false, false, convertToUnit);

                const result = this.enforceGridPrecisionInMeters(evaluatedValue);

                set(cacheKey, result);
                return result;
            } else {
                const result = Number(normalizedValue);
                set(cacheKey, result);
                return result;
            }
        } catch (error) {
            return 0;
        }
    }

    public static enforceGridPrecisionInMeters(valueInMeters: number) {
        return Number(valueInMeters.toFixed(R.behaviors.pcb_editor.gridPositionInMetersDecimals));
    }

    public static enforceGridPrecisionInMm(valueInMm: number) {
        return Number(valueInMm.toFixed(R.behaviors.pcb_editor.gridPositionInMmDecimals));
    }

    public static humanizePositionValue(value: number, unitValue: string | undefined) {
        if (!unitValue || unitValue === "mm") {
            return `${PcbLayoutEngine.enforceGridPrecisionInMm(metersToMm(value))}mm`;
        } else if (unitValue === "inch") {
            return `${PcbLayoutEngine.enforceGridPrecisionInMm(metersToInch(value))}inch`;
        }
    }

    private typeSelectorMatchesObjectData(individualSelector: parsel.Tokens, objectKey: BasePcbLayoutNodeTypes) {
        return ((individualSelector.name as string) || "").toLowerCase() === objectKey.toLowerCase();
    }

    private idSelectorMatchesObjectData(
        individualSelector: parsel.Tokens,
        objectKey: BasePcbLayoutNodeTypes,
        objectData: SupportedSubjectTypes,
    ) {
        if (objectKey === BasePcbLayoutNodeTypes.root) {
            return individualSelector.name === (objectData as any).name;
        } else if (objectKey === BasePcbLayoutNodeTypes.element) {
            return individualSelector.name === (objectData as IElementData).label;
        } else if (objectKey === BasePcbLayoutNodeTypes.route) {
            return individualSelector.name === (objectData as IRouteData).label;
        } else if (objectKey === BasePcbLayoutNodeTypes.pad) {
            if (this.pcbLayoutNodeTreeTraveler.isChildOfRootFootprint(objectData.uid, this.documentUid)) {
                return individualSelector.name === (objectData as IElementData).label;
            } else {
                return individualSelector.name === (objectData as IPcbLayoutNodeData).name;
            }
        } else {
            return individualSelector.name === (objectData as IPcbLayoutNodeData).name;
        }
    }

    private compoundSelectorMatchesObjectData(
        individualSelector: parsel.Compound,
        objectKey: BasePcbLayoutNodeTypes,
        objectData: SupportedSubjectTypes,
    ) {
        const individualSelectorList = individualSelector.list;
        let matchedCompoundSelectors: number = 0;

        individualSelectorList.forEach((compoundSelectorEntry) => {
            const result = PcbLayoutEngine.parseCompoundSelectorEntry(compoundSelectorEntry, objectKey, objectData);
            if (result) {
                matchedCompoundSelectors += 1;
            }
        });

        let matches: boolean = false;
        if (individualSelectorList.length === matchedCompoundSelectors) {
            matches = true;
        }
        return matches;
    }

    private static parseCompoundSelectorEntry(
        compoundSelector: parsel.Tokens,
        objectKey: BasePcbLayoutNodeTypes,
        objectData: SupportedSubjectTypes,
    ): boolean {
        if (compoundSelector.type === "type" && compoundSelector.name === objectKey) {
            return true;
        } else if (compoundSelector.type === "id") {
            if (objectKey === BasePcbLayoutNodeTypes.root) {
                const document = objectData as any;
                if (compoundSelector.name === document.name) {
                    return true;
                }
            } else if (objectKey === BasePcbLayoutNodeTypes.element) {
                const element = objectData as IElementData;
                if (compoundSelector.name === element.label) {
                    return true;
                }
            } else if (objectKey === BasePcbLayoutNodeTypes.route) {
                const route = objectData as IRouteData;
                if (compoundSelector.name === route.label) {
                    return true;
                }
            }

            // catch generic node attributes
            const nodeObjectData = objectData as IPcbLayoutNodeData;
            if (compoundSelector.name === nodeObjectData?.name) {
                return true;
            }
        } else if (compoundSelector.type === "attribute") {
            if (objectKey === BasePcbLayoutNodeTypes.root) {
                const document = objectData as any;
                if (compoundSelector.name === "uid") {
                    return this.parseAttribute(compoundSelector, document?.uid);
                } else if (compoundSelector.name === "name") {
                    return this.parseAttribute(compoundSelector, document?.name);
                } else if (compoundSelector.name === "description") {
                    return this.parseAttribute(compoundSelector, document?.description);
                }
            } else if (objectKey === BasePcbLayoutNodeTypes.element) {
                const element = objectData as IElementData;
                if (compoundSelector.name === "uid") {
                    return this.parseAttribute(compoundSelector, element?.uid);
                } else if (compoundSelector.name === "designator") {
                    return this.parseAttribute(compoundSelector, element?.label);
                } else if (compoundSelector.name === "partName") {
                    // return this.parseAttribute(compoundSelector, element?.part_version_data_cache?.name);
                }
            } else if (objectKey === BasePcbLayoutNodeTypes.route) {
                const route = objectData as IRouteData;
                if (compoundSelector.name === "uid") {
                    return this.parseAttribute(compoundSelector, route?.uid);
                } else if (compoundSelector.name === "designator") {
                    return this.parseAttribute(compoundSelector, route?.label);
                }
            }

            // catch generic node attributes
            const nodeObjectData = objectData as IPcbLayoutNodeData;
            if (compoundSelector.name === "uid") {
                return this.parseAttribute(compoundSelector, nodeObjectData?.uid);
            } else if (compoundSelector.name === "name") {
                return this.parseAttribute(compoundSelector, nodeObjectData?.name);
            }
        } else if (compoundSelector.type === "pseudo-class") {
            // TODO: need to add support for pseudo classes
        }

        return false;
    }

    // Implements https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/Selectors/Attribute_selectors
    private static parseAttribute(compoundSelector: parsel.Tokens, value: string | undefined): boolean {
        if (value) {
            const compoundSelectorValue = this.removeDoubleQuotes(compoundSelector.value || "");

            if (!compoundSelector.operator && !compoundSelectorValue) {
                // Matches elements with an attr attribute (whose name is the value in square brackets).
                return true;
            } else if (compoundSelector.operator === "=") {
                // Matches elements with an attr attribute whose value is exactly value — the string inside the quotes.
                if (compoundSelector.caseSensitive === "i") {
                    return compoundSelectorValue.toLowerCase() === value.toLowerCase();
                } else {
                    return compoundSelectorValue === value;
                }
            } else if (compoundSelector.operator === "~=") {
                // Matches elements with an attr attribute whose value is exactly value, or contains value in its (space separated) list of values.
                if (compoundSelector.caseSensitive === "i") {
                    return (
                        value.toLowerCase() === compoundSelectorValue.toLowerCase() ||
                        value.toLowerCase().includes(` ${compoundSelectorValue.toLowerCase()} `)
                    );
                } else {
                    return value === compoundSelectorValue || value.includes(` ${compoundSelectorValue} `);
                }
            } else if (compoundSelector.operator === "|=") {
                // Matches elements with an attr attribute whose value is exactly value or begins with value immediately followed by a hyphen.
                if (compoundSelector.caseSensitive === "i") {
                    return (
                        value.toLowerCase() === compoundSelectorValue.toLowerCase() ||
                        value.toLowerCase().startsWith(`${compoundSelectorValue.toLowerCase()}-`)
                    );
                } else {
                    return value === compoundSelectorValue || value.startsWith(`${compoundSelectorValue}-`);
                }
            } else if (compoundSelector.operator === "^=") {
                // Matches elements with an attr attribute (whose name is the value in square brackets), whose value begins with value.
                if (compoundSelector.caseSensitive === "i") {
                    return value.toLowerCase().startsWith(compoundSelectorValue.toLowerCase());
                } else {
                    return value.startsWith(compoundSelectorValue);
                }
            } else if (compoundSelector.operator === "$=") {
                // Matches elements with an attr attribute whose value ends with value.
                if (compoundSelector.caseSensitive === "i") {
                    return value.toLowerCase().endsWith(compoundSelectorValue.toLowerCase());
                } else {
                    return value.endsWith(compoundSelectorValue);
                }
            } else if (compoundSelector.operator === "*=") {
                // Matches elements with an attr attribute whose value contains value anywhere within the string.
                if (compoundSelector.caseSensitive === "i") {
                    return value.toLowerCase().includes(compoundSelectorValue.toLowerCase());
                } else {
                    return value.includes(compoundSelectorValue);
                }
            }
        }

        return false;
    }

    private static removeDoubleQuotes(value: string) {
        if (value) {
            return value.replace(/^"(.+)"$/, "$1");
        }

        return value;
    }

    private static isNumeric(n: any) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }

    private static convertToNumberIfIsNumeric(value: string | number) {
        let result;

        if (typeof value === "string" && PcbLayoutEngine.isNumeric(value)) {
            result = Number(value);
        } else {
            result = value;
        }

        return result;
    }

    public getSubjectDataFromNode(pcbLayoutNode: IPcbLayoutNode): IPcbLayoutNode | IElementData | IRouteData {
        switch (pcbLayoutNode?.type) {
            case BasePcbLayoutNodeTypes.layout: {
                return pcbLayoutNode;
            }
            case BasePcbLayoutNodeTypes.element: {
                return this.elements[pcbLayoutNode.uid];
            }
            case BasePcbLayoutNodeTypes.route: {
                return this.routes[pcbLayoutNode.uid];
            }
            case BasePcbLayoutNodeTypes.pad: {
                if (this.elements[pcbLayoutNode.uid]) {
                    return this.elements[pcbLayoutNode.uid];
                } else {
                    return pcbLayoutNode;
                }
            }
            default: {
                return pcbLayoutNode;
            }
        }
    }

    private traverseNodes(nodeUid: string) {
        const nodeData = this.pcbLayoutNodes[nodeUid];

        if (nodeData) {
            this.bakeRulesToNode(nodeData);

            const sanitizedChildrenUids = nodeData.childrenUids || [];

            sanitizedChildrenUids.forEach((nodeUid) => {
                this.traverseNodes(nodeUid);
            });
        }
    }

    public bakeRulesToNode(nodeData: IPcbLayoutNode) {
        const rulesChain = this.getNodeLayoutRuleChain(nodeData.uid);
        const objectSpecificRules = this.getObjectSpecificRules(nodeData.uid);

        const flattenedRules = PcbLayoutEngine.rankAndFlatten(rulesChain, objectSpecificRules);

        const nodeType = nodeData.type;

        // Apply Rules
        switch (nodeType) {
            case BasePcbLayoutNodeTypes.pad: {
                this.computePadNodeRules(flattenedRules, nodeData.uid);
                break;
            }
            case BasePcbLayoutNodeTypes.footprint: {
                this.computeFootprintNodeRules(flattenedRules, nodeData.uid);
                break;
            }
            case BasePcbLayoutNodeTypes.layout: {
                this.computeLayoutNodeRules(flattenedRules, nodeData.uid);
                break;
            }
            // case BasePcbLayoutNodeTypes.model: {
            //     this.computeModelNodeRules(flattenedRules, nodeData.uid);
            //     break;
            // }
            case BasePcbLayoutNodeTypes.element: {
                this.computeElementNodeRules(flattenedRules, nodeData.uid);
                break;
            }
            // case BasePcbLayoutNodeTypes.text: {
            //     this.computeTextShapeNodeRules(flattenedRules, nodeData.uid);
            //     break;
            // }
            // case BasePcbLayoutNodeTypes.line: {
            //     this.computeLineShapeNodeRules(flattenedRules, nodeData.uid);
            //     break;
            // }
            // case BasePcbLayoutNodeTypes.circle: {
            //     this.computeCircleShapeNodeRules(flattenedRules, nodeData.uid);
            //     break;
            // }
            // case BasePcbLayoutNodeTypes.rectangle: {
            //     this.computeRectangleShapeNodeRules(flattenedRules, nodeData.uid);
            //     break;
            // }
            case BasePcbLayoutNodeTypes.route: {
                this.computeRouteNodeRules(flattenedRules, nodeData.uid);
                break;
            }
            case BasePcbLayoutNodeTypes.via: {
                this.computeViaNodeRules(flattenedRules, nodeData.uid);
                break;
            }
            case BasePcbLayoutNodeTypes.routeSegment: {
                this.computeRouteSegmentNodeRules(flattenedRules, nodeData.uid);
                break;
            }
        }
    }

    private getNodePosition(nodeLayoutRules: IPcbLayoutRulesMap, nodeUid: string) {
        const evaluatedPosition = PcbLayoutEngine.getEvaluatedVector(
            nodeLayoutRules.position,
            nodeLayoutRules.positionX,
            nodeLayoutRules.positionY,
            nodeLayoutRules.positionZ,
            nodeLayoutRules.unit,
            "m",
        );

        const zIsUp = PcbLayoutEngine.getZIsUp(nodeLayoutRules.zIsUp?.value);

        const bakedRules = this.pcbLayoutNodes[nodeUid]?.bakedRules as IPcbLayoutBakedBasePositionNodeRules;

        if (
            bakedRules?.position.x !== evaluatedPosition.x ||
            bakedRules?.position.y !== evaluatedPosition.y ||
            bakedRules?.position.z !== evaluatedPosition.z ||
            bakedRules?.position.zIsUp !== zIsUp
        ) {
            return {
                x: evaluatedPosition.x ?? bakedRules?.position.x ?? Number(LayoutRules.positionX.default),
                y: evaluatedPosition.y ?? bakedRules?.position.y ?? Number(LayoutRules.positionY.default),
                z: evaluatedPosition.z ?? bakedRules?.position.z ?? Number(LayoutRules.positionZ.default),
                zIsUp: zIsUp,
            };
        } else {
            return bakedRules?.position;
        }
    }

    public static getEvaluatedVector(
        vectorRule: IPcbLayoutRuleData | undefined,
        vectorXRule: IPcbLayoutRuleData | undefined,
        vectorYRule: IPcbLayoutRuleData | undefined,
        vectorZRule: IPcbLayoutRuleData | undefined,
        unitRule: IPcbLayoutRuleData | undefined,
        convertToUnit: "m" | "rad" | undefined,
    ) {
        let evaluatedVector: IUnevaluatedVector3 = {
            x: undefined,
            y: undefined,
            z: undefined,
        };

        if (vectorRule?.value && (typeof vectorRule?.value === "string" || typeof vectorRule?.value === "number")) {
            const values = this.parseVectorFromString(vectorRule.value.toString());
            evaluatedVector = this.evaluateVector3(values, unitRule, convertToUnit);
        }

        // Specific rules beat unspecific ones! Hence vectorXRule or vectorYRule overwrite vectorRule
        if (vectorXRule?.value) {
            evaluatedVector.x = PcbLayoutEngine.evaluateNumericInputValue(
                vectorXRule.value as string,
                unitRule,
                convertToUnit,
            );
        }

        if (vectorYRule?.value) {
            evaluatedVector.y = PcbLayoutEngine.evaluateNumericInputValue(
                vectorYRule.value as string,
                unitRule,
                convertToUnit,
            );
        }

        if (vectorZRule?.value) {
            evaluatedVector.z = PcbLayoutEngine.evaluateNumericInputValue(
                vectorZRule.value as string,
                unitRule,
                convertToUnit,
            );
        }
        return evaluatedVector;
    }

    static evaluateVector3(
        values: string[],
        unitRule: IPcbLayoutRuleData | undefined,
        convertToUnit: "m" | "rad" | undefined,
    ) {
        return {
            x: PcbLayoutEngine.evaluateNumericInputValue(values[0] ?? "", unitRule, convertToUnit),
            y: PcbLayoutEngine.evaluateNumericInputValue(
                values[values.length > 1 ? 1 : 0] ?? "",
                unitRule,
                convertToUnit,
            ),
            z: PcbLayoutEngine.evaluateNumericInputValue(
                values[values.length > 1 ? 2 : 0] ?? "",
                unitRule,
                convertToUnit,
            ),
        };
    }

    private evaluateVector2(
        values: string[],
        unitRule: IPcbLayoutRuleData | undefined,
        convertToUnit: "m" | "rad" | undefined,
    ) {
        return {
            x: PcbLayoutEngine.evaluateNumericInputValue(values[0] ?? "", unitRule, convertToUnit),
            y: PcbLayoutEngine.evaluateNumericInputValue(
                values[values.length > 1 ? 1 : 0] ?? "",
                unitRule,
                convertToUnit,
            ),
        };
    }

    private getNodeStartPosition(nodeLayoutRules: {[key: string]: IPcbLayoutRuleData}, nodeUid: string) {
        const evaluatedPosition = PcbLayoutEngine.getEvaluatedVector(
            nodeLayoutRules.startPosition,
            nodeLayoutRules.startPositionX,
            nodeLayoutRules.startPositionY,
            nodeLayoutRules.startPositionZ,
            nodeLayoutRules.unit,
            "m",
        );

        const zIsUp = PcbLayoutEngine.getZIsUp(nodeLayoutRules.zIsUp?.value);

        const bakedRules = this.pcbLayoutNodes[nodeUid]?.bakedRules as IPcbLayoutBakedBaseStartPositionNodeRules;

        if (
            bakedRules?.startPosition.x !== evaluatedPosition.x ||
            bakedRules?.startPosition.y !== evaluatedPosition.y ||
            bakedRules?.startPosition.z !== evaluatedPosition.z ||
            bakedRules?.startPosition.zIsUp !== zIsUp
        ) {
            return {
                x: evaluatedPosition.x ?? bakedRules?.startPosition.x ?? Number(LayoutRules.startPositionX.default),
                y: evaluatedPosition.y ?? bakedRules?.startPosition.y ?? Number(LayoutRules.startPositionY.default),
                z: evaluatedPosition.z ?? bakedRules?.startPosition.z ?? Number(LayoutRules.startPositionZ.default),
                zIsUp: zIsUp,
            };
        } else {
            return bakedRules?.startPosition;
        }
    }

    private getNodeEndPosition(nodeLayoutRules: {[key: string]: IPcbLayoutRuleData}, nodeUid: string) {
        const evaluatedPosition = PcbLayoutEngine.getEvaluatedVector(
            nodeLayoutRules.endPosition,
            nodeLayoutRules.endPositionX,
            nodeLayoutRules.endPositionY,
            nodeLayoutRules.endPositionZ,
            nodeLayoutRules.unit,
            "m",
        );

        const zIsUp = PcbLayoutEngine.getZIsUp(nodeLayoutRules.zIsUp?.value);

        const bakedRules = this.pcbLayoutNodes[nodeUid]?.bakedRules as IPcbLayoutBakedBaseEndPositionNodeRules;

        if (
            bakedRules?.endPosition.x !== evaluatedPosition.x ||
            bakedRules?.endPosition.y !== evaluatedPosition.y ||
            bakedRules?.endPosition.z !== evaluatedPosition.z ||
            bakedRules?.endPosition.zIsUp !== zIsUp
        ) {
            return {
                x: evaluatedPosition.x ?? bakedRules?.endPosition.x ?? Number(LayoutRules.endPositionX.default),
                y: evaluatedPosition.y ?? bakedRules?.endPosition.y ?? Number(LayoutRules.endPositionY.default),
                z: evaluatedPosition.z ?? bakedRules?.endPosition.z ?? Number(LayoutRules.endPositionZ.default),
                zIsUp: zIsUp,
            };
        } else {
            return bakedRules?.endPosition;
        }
    }

    static parseVectorFromString(value: string) {
        return value
            .toString()
            .trim()
            .split(" ")
            .filter((pos) => !!pos)
            .map((pos) => pos.trim());
    }

    private getNodeSize(subjectLayoutRules: IPcbLayoutRulesMap, nodeUid: string) {
        const evaluatedSize = PcbLayoutEngine.getEvaluatedVector(
            subjectLayoutRules.size,
            subjectLayoutRules.sizeX,
            subjectLayoutRules.sizeY,
            subjectLayoutRules.sizeZ,
            subjectLayoutRules.unit,
            "m",
        );

        const bakedRules = this.pcbLayoutNodes[nodeUid]?.bakedRules as IPcbLayoutBakedBaseSizeNodeRules;

        if (
            bakedRules?.size.x !== evaluatedSize.x ||
            bakedRules?.size.y !== evaluatedSize.y ||
            bakedRules?.size.z !== evaluatedSize.z
        ) {
            return {
                x: evaluatedSize.x ?? bakedRules?.size.x,
                y: evaluatedSize.y ?? bakedRules?.size.y,
                z: evaluatedSize.z ?? bakedRules?.size.z,
            };
        } else {
            return bakedRules?.size;
        }
    }

    private getCopperLayerThickness(
        parentRootLayoutUid: string | undefined,
        parentRootFootprintUid: string | undefined,
        nodeLayer: LayerOrientation | string | undefined,
    ): number {
        if (!parentRootLayoutUid) {
            return 0;
        }

        const rootNode = parentRootLayoutUid ? parentRootLayoutUid : parentRootFootprintUid;
        if (!rootNode) {
            return 0;
        }
        const layoutBakedRules = this.pcbLayoutNodes[rootNode]?.bakedRules as IPcbLayoutBakedLayoutNodeRules;
        const pcbLayoutNodeLayers: PcbBoardLayer[] = Object.values(layoutBakedRules.stackup);

        const layer = pcbLayoutNodeLayers.find(
            (layer) => (layer.uid === nodeLayer || layer.orientation === nodeLayer) && isCopperLayer(layer.material),
        );

        return layer?.thickness || 0;
    }

    private getSolderPasteLayerThickness(
        parentRootLayoutUid: string | undefined,
        parentRootFootprintUid: string | undefined,
        nodeLayer: LayerOrientation | string | undefined,
    ): number {
        if (!parentRootLayoutUid) {
            return 0;
        }

        const rootNode = parentRootLayoutUid ? parentRootLayoutUid : parentRootFootprintUid;
        if (!rootNode) {
            return 0;
        }
        const layoutBakedRules = this.pcbLayoutNodes[rootNode]?.bakedRules as IPcbLayoutBakedLayoutNodeRules;
        const pcbLayoutNodeLayers: PcbBoardLayer[] = Object.values(layoutBakedRules.stackup);

        const layer = pcbLayoutNodeLayers.find(
            (layer) => (layer.uid === nodeLayer || layer.orientation === nodeLayer) && layer.type === "Solder Paste",
        );

        return layer?.thickness || 0;
    }

    private getSolderMaskLayerThickness(
        parentRootLayoutUid: string | undefined,
        parentRootFootprintUid: string | undefined,
        nodeLayer: LayerOrientation | string | undefined,
    ): number {
        if (!parentRootLayoutUid) {
            return 0;
        }

        const rootNode = parentRootLayoutUid ? parentRootLayoutUid : parentRootFootprintUid;
        if (!rootNode) {
            return 0;
        }
        const layoutBakedRules = this.pcbLayoutNodes[rootNode]?.bakedRules as IPcbLayoutBakedLayoutNodeRules;
        const pcbLayoutNodeLayers: PcbBoardLayer[] = Object.values(layoutBakedRules.stackup);

        const layer = pcbLayoutNodeLayers.find(
            (layer) => (layer.uid === nodeLayer || layer.orientation === nodeLayer) && layer.type === "Solder Mask",
        );

        return layer?.thickness || 0;
    }

    private getLayerPositionZ(
        parentRootLayoutUid: string | undefined,
        parentRootFootprintUid: string | undefined,
        nodeLayer: LayerOrientation | string | undefined,
    ): number {
        let layerZPosition = 0;

        if (!parentRootLayoutUid) {
            return layerZPosition;
        }

        const rootNode = parentRootLayoutUid ? parentRootLayoutUid : parentRootFootprintUid;
        if (!rootNode) {
            return layerZPosition;
        }
        const layoutBakedRules = this.pcbLayoutNodes[rootNode]?.bakedRules as IPcbLayoutBakedLayoutNodeRules;
        const pcbLayoutNodeLayers: PcbBoardLayer[] = Object.values(layoutBakedRules.stackup);

        const sortedLayerConfigs = pcbLayoutNodeLayers.sort((a, b) => (a.order > b.order ? 1 : -1));

        if (nodeLayer === LayerOrientation.bottom) {
            sortedLayerConfigs.forEach((existingLayer) => {
                layerZPosition = layerZPosition + (existingLayer.thickness || 0);
            });
        } else if (!nodeLayer || nodeLayer === LayerOrientation.top) {
            layerZPosition = 0;
        } else {
            sortedLayerConfigs.some((existingLayer) => {
                layerZPosition = layerZPosition + (existingLayer.thickness || 0);

                return existingLayer.uid === nodeLayer;
            });
        }
        return layerZPosition;
    }

    private getNodeLayer(nodeLayoutRules: IPcbLayoutRulesMap) {
        if (nodeLayoutRules.layer?.value) {
            return nodeLayoutRules.layer?.value as string;
        }
    }

    private getThermalReliefRules(nodeLayoutRules: IPcbLayoutRulesMap) {
        let thermalRelief;
        if (nodeLayoutRules.thermalRelief?.value) {
            thermalRelief = (<any>PcbViaThermalReliefTypes)[nodeLayoutRules.thermalRelief.value.toString()];
        }

        let conductors;
        if (nodeLayoutRules.thermalReliefConductors?.value) {
            conductors = (<any>PcbViaThermalReliefConductors)[nodeLayoutRules.thermalReliefConductors.value.toString()];
        }

        let thermalReliefConductorAngle;
        if (nodeLayoutRules.thermalReliefConductorAngle?.value) {
            thermalReliefConductorAngle = (<any>PcbViaThermalReliefConductorAngle)[
                nodeLayoutRules.thermalReliefConductorAngle.value.toString()
            ];
        }

        let airGapWidth: number | undefined = undefined;
        if (nodeLayoutRules.thermalReliefAirGapWidth?.value) {
            airGapWidth = PcbLayoutEngine.evaluateNumericInputValue(
                nodeLayoutRules.thermalReliefAirGapWidth.value as string,
                nodeLayoutRules.unit,
                "m",
            );
        }

        let conductorWidth: number | undefined = undefined;
        if (nodeLayoutRules.thermalReliefConductorWidth?.value) {
            conductorWidth = PcbLayoutEngine.evaluateNumericInputValue(
                nodeLayoutRules.thermalReliefConductorWidth.value as string,
                nodeLayoutRules.unit,
                "m",
            );
        }

        return {
            thermalRelief,
            conductors,
            thermalReliefConductorAngle,
            airGapWidth,
            conductorWidth,
        };
    }

    private getConnectedLayersRule(subjectLayoutRules: IPcbLayoutRulesMap): string[] {
        if (subjectLayoutRules.connectedLayers?.value) {
            return (subjectLayoutRules.connectedLayers.value as string).split(",");
        }

        return [];
    }

    private getStackup(subjectLayoutRules: IPcbLayoutRulesMap) {
        let stackup: PcbBoardLayersMap | undefined = undefined;
        if (subjectLayoutRules.stackup?.value) {
            const stackupValue = subjectLayoutRules.stackup.value;

            let stackupConfig: IStackupConfig | undefined;

            if (PcbLayoutEngine.isNumeric(stackupValue)) {
                stackupConfig = Object.values(R.stackups.standard).find(
                    (stackup) =>
                        Object.values(stackup.layers).filter((layerConfig) => isCopperLayer(layerConfig.material))
                            .length === Number(stackupValue),
                );
            } else {
                Object.values(R.stackups).forEach((stackupCategory) => {
                    stackupConfig = Object.values(stackupCategory).find(
                        (stackup) => stackup.key === stackupValue || stackup.label === stackupValue,
                    );
                });
            }

            if (stackupConfig) {
                stackup = stackupConfig.layers || {};
            }
        }
        return stackup;
    }

    private getSilkShapeRules(nodeLayoutRules: IPcbLayoutRulesMap) {
        let silkColor: string | undefined = undefined;
        if (nodeLayoutRules.silkColor?.value) {
            silkColor = nodeLayoutRules.silkColor.value.toString();
        }

        let strokeWidth: number | undefined = undefined;
        if (nodeLayoutRules.strokeWidth?.value) {
            strokeWidth = PcbLayoutEngine.evaluateNumericInputValue(
                nodeLayoutRules.strokeWidth.value as string,
                nodeLayoutRules.unit,
                "m",
            );
        }

        let strokeStyle: IPcbLineShapeStyles | undefined = undefined;
        if (nodeLayoutRules.strokeStyle?.value) {
            if (nodeLayoutRules.strokeStyle.value === IPcbLineShapeStyles.dashed) {
                strokeStyle = IPcbLineShapeStyles.dashed;
            } else if (nodeLayoutRules.strokeStyle.value === IPcbLineShapeStyles.solid) {
                strokeStyle = IPcbLineShapeStyles.solid;
            }
        }

        let strokeLength: number | undefined = undefined;
        if (nodeLayoutRules.strokeLength?.value) {
            strokeLength = PcbLayoutEngine.evaluateNumericInputValue(
                nodeLayoutRules.strokeLength.value as string,
                nodeLayoutRules.unit,
                "m",
            );
        }

        let strokeSpacing: number | undefined = undefined;
        if (nodeLayoutRules.strokeSpacing?.value) {
            strokeSpacing = PcbLayoutEngine.evaluateNumericInputValue(
                nodeLayoutRules.strokeSpacing.value as string,
                nodeLayoutRules.unit,
                "m",
            );
        }

        return {
            silkColor,
            strokeWidth,
            strokeStyle,
            strokeLength,
            strokeSpacing,
        };
    }

    private getNodeRotation(nodeLayoutRules: IPcbLayoutRulesMap, nodeUid: string) {
        const evaluatedRotation = PcbLayoutEngine.getEvaluatedVector(
            nodeLayoutRules.rotation,
            nodeLayoutRules.rotationX,
            nodeLayoutRules.rotationY,
            nodeLayoutRules.rotationZ,
            nodeLayoutRules.rotationUnit,
            "rad",
        );

        const zIsUp = PcbLayoutEngine.getZIsUp(nodeLayoutRules.zIsUp?.value);

        const bakedRules = this.pcbLayoutNodes[nodeUid]?.bakedRules as IPcbLayoutBakedBaseRotationNodeRules;

        if (
            bakedRules?.rotation.x !== evaluatedRotation.x ||
            bakedRules?.rotation.y !== evaluatedRotation.y ||
            bakedRules?.rotation.z !== evaluatedRotation.z ||
            bakedRules?.rotation.zIsUp !== zIsUp
        ) {
            return {
                x: evaluatedRotation.x ?? bakedRules?.rotation.x ?? Number(LayoutRules.rotationX.default),
                y: evaluatedRotation.y ?? bakedRules?.rotation.y ?? Number(LayoutRules.rotationY.default),
                z: evaluatedRotation.z ?? bakedRules?.rotation.z ?? Number(LayoutRules.rotationZ.default),
                zIsUp: zIsUp,
            };
        } else {
            return bakedRules?.rotation;
        }
    }

    public static getZIsUp(value: PcbLayoutRuleValue) {
        if (value) {
            const normalizedValue = value.toString().trim().toLowerCase();
            return normalizedValue === "true" || normalizedValue === "1";
        }
        return true;
    }

    private computePadNodeRules(subjectLayoutRules: IPcbLayoutRulesMap, nodeUid: string) {
        const padNode = this.pcbLayoutNodes[nodeUid] as IPcbLayoutPadNodeData;
        console.log("pad rules");
        if (padNode) {
            const {parentRootLayoutUid, parentRootFootprintUid} = this.getRootParentNodeUid(nodeUid);

            console.log("founda  pad", padNode, parentRootLayoutUid, parentRootFootprintUid);

            const position = this.getNodePosition(subjectLayoutRules, nodeUid);
            const rotation = this.getNodeRotation(subjectLayoutRules, nodeUid);
            let size = this.getNodeSize(subjectLayoutRules, nodeUid);
            const {thermalRelief, conductors, thermalReliefConductorAngle, airGapWidth, conductorWidth} =
                this.getThermalReliefRules(subjectLayoutRules);
            const connectedLayerUids = this.getConnectedLayersRule(subjectLayoutRules);
            const layer = this.getNodeLayer(subjectLayoutRules);
            const layerZPosition = this.getLayerPositionZ(parentRootLayoutUid, parentRootFootprintUid, layer);
            const copperLayerThickness = this.getCopperLayerThickness(
                parentRootLayoutUid,
                parentRootFootprintUid,
                layer,
            );
            const solderPasteLayerThickness = this.getSolderPasteLayerThickness(
                parentRootLayoutUid,
                parentRootFootprintUid,
                layer,
            );
            const solderMaskLayerThickness = this.getSolderMaskLayerThickness(
                parentRootLayoutUid,
                parentRootFootprintUid,
                layer,
            );
            const holeSize = this.getHoleSize(subjectLayoutRules, padNode?.bakedRules?.hole?.holeSize, size);

            let shape: PcbLayoutFootprintPadShape | undefined;
            if (subjectLayoutRules.padShape?.value) {
                if (subjectLayoutRules.padShape.value !== padNode.bakedRules?.shape) {
                    shape = subjectLayoutRules.padShape.value as PcbLayoutFootprintPadShape;
                }
            }

            let holeType: FootPrintPadHoleType | undefined;
            if (subjectLayoutRules.padHoleType?.value) {
                if (subjectLayoutRules.padHoleType.value !== padNode.bakedRules?.hole?.holeType) {
                    holeType = subjectLayoutRules.padHoleType.value as FootPrintPadHoleType;
                }
            }

            let cornerRadius;
            if (subjectLayoutRules.cornerRadius?.value) {
                cornerRadius = PcbLayoutEngine.evaluateNumericInputValue(
                    subjectLayoutRules.cornerRadius.value as string,
                    subjectLayoutRules.unit,
                    "m",
                );
            }

            const currentHoleType = holeType || padNode.bakedRules?.hole?.holeType;
            let holePosition: IVector2 | undefined = undefined;
            if (
                (currentHoleType === FootPrintPadHoleType.platedThroughHole ||
                    currentHoleType === FootPrintPadHoleType.nonPlatedHole) &&
                subjectLayoutRules.holePosition?.value !== undefined
            ) {
                const parsedVectorString = PcbLayoutEngine.parseVectorFromString(
                    subjectLayoutRules.holePosition.value as string,
                );
                const evaluatedVector2 = this.evaluateVector2(parsedVectorString, subjectLayoutRules.unit, "m");
                // TODO we should check if the hole position might be out of bounds of the pad and prevent that
                if (
                    evaluatedVector2?.x !== undefined &&
                    evaluatedVector2?.y !== undefined &&
                    (evaluatedVector2.x !== padNode.bakedRules?.hole?.holePosition.x ||
                        evaluatedVector2.y !== padNode.bakedRules?.hole?.holePosition.y)
                ) {
                    holePosition = {
                        x: evaluatedVector2.x,
                        y: evaluatedVector2.y,
                    };
                }
            }

            let solderMaskExpansion: number | undefined = undefined;
            if (subjectLayoutRules.solderMaskExpansion?.value) {
                solderMaskExpansion = PcbLayoutEngine.evaluateNumericInputValue(
                    subjectLayoutRules.solderMaskExpansion.value as string,
                    subjectLayoutRules.unit,
                    "m",
                );
            }

            let solderMaskExpansionFromTheHoleEdge: number | undefined = undefined;
            if (subjectLayoutRules.solderMaskExpansionFromTheHoleEdge?.value) {
                solderMaskExpansionFromTheHoleEdge = PcbLayoutEngine.evaluateNumericInputValue(
                    subjectLayoutRules.solderMaskExpansionFromTheHoleEdge.value as string,
                    subjectLayoutRules.unit,
                    "m",
                );
            }

            let pasteMaskExpansion: number | undefined = undefined;
            if (subjectLayoutRules.solderPasteMaskExpansion?.value) {
                pasteMaskExpansion = PcbLayoutEngine.evaluateNumericInputValue(
                    subjectLayoutRules.solderPasteMaskExpansion.value as string,
                    subjectLayoutRules.unit,
                    "m",
                );
            }

            let solderMaskForceCompleteTentingOnTop: boolean = false;
            if (subjectLayoutRules.solderMaskForceCompleteTentingOnTop?.value) {
                solderMaskForceCompleteTentingOnTop =
                    (subjectLayoutRules.solderMaskForceCompleteTentingOnTop.value as string).toLowerCase() === "true";
            }

            let solderMaskForceCompleteTentingOnBottom: boolean = false;
            if (subjectLayoutRules.solderMaskForceCompleteTentingOnBottom?.value) {
                solderMaskForceCompleteTentingOnBottom =
                    (subjectLayoutRules.solderMaskForceCompleteTentingOnBottom.value as string).toLowerCase() ===
                    "true";
            }

            if (
                subjectLayoutRules.unit?.value &&
                subjectLayoutRules.rotationUnit?.value &&
                position &&
                rotation &&
                size &&
                thermalRelief &&
                shape &&
                connectedLayerUids &&
                layer
            ) {
                padNode.bakedRules = {
                    parentRootLayoutUid,
                    parentRootFootprintUid,
                    unit: subjectLayoutRules.unit.value as string,
                    rotationUnit: subjectLayoutRules.rotationUnit.value as string,
                    position,
                    rotation,
                    size,
                    shape,
                    cornerRadius,
                    connectedLayerUids,
                    layer,
                    layerZPosition,
                    copperLayerThickness,
                    solderPasteLayerThickness,
                    solderMaskLayerThickness,
                    thermalReliefType: thermalRelief,
                    solderMask: {
                        expansion: solderMaskExpansion,
                        expansionFromTheHoleEdge: solderMaskExpansionFromTheHoleEdge,
                        forceCompleteTentingOnTop: solderMaskForceCompleteTentingOnTop,
                        forceCompleteTentingOnBottom: solderMaskForceCompleteTentingOnBottom,
                    },
                    solderPasteMaskExpansion: pasteMaskExpansion,
                };

                if (padNode.bakedRules && holeSize && holeType && holePosition) {
                    padNode.bakedRules.hole = {
                        holeType,
                        holeSize,
                        holePosition,
                    };

                    if (
                        parentRootLayoutUid &&
                        (holeType === FootPrintPadHoleType.platedThroughHole ||
                            holeType === FootPrintPadHoleType.nonPlatedHole)
                    ) {
                        const layoutNode = this.pcbLayoutNodes[parentRootLayoutUid] as IPcbLayoutLayoutNodeData;

                        if (layoutNode?.bakedRules) {
                            layoutNode.bakedRules.holeNodes[nodeUid] = {nodeUid, throughHole: true};
                        }
                    }
                }

                if (padNode.bakedRules && airGapWidth && thermalReliefConductorAngle && conductorWidth && conductors) {
                    padNode.bakedRules.thermalReliefConnectConfig = {
                        angle: thermalReliefConductorAngle,
                        conductors,
                        airGapWidth,
                        conductorWidth,
                    };
                }

                console.log("yup", padNode.bakedRules);
            }
        }
    }

    private getHoleSize(
        subjectLayoutRules: IPcbLayoutRulesMap,
        existingBakedHoleSize: IVector2 | undefined,
        nodeSize: IVector3 | undefined,
    ) {
        let holeSize: IVector2 | undefined;

        if (subjectLayoutRules.holeSize?.value) {
            const values = PcbLayoutEngine.parseVectorFromString(subjectLayoutRules.holeSize?.value.toString());
            const evaluatedVector = PcbLayoutEngine.evaluateVector3(values, subjectLayoutRules.unit, "m");

            if (evaluatedVector.x !== existingBakedHoleSize?.x && evaluatedVector.y !== existingBakedHoleSize?.y) {
                holeSize = evaluatedVector;

                if (nodeSize && (holeSize.x > nodeSize.x || holeSize.y > nodeSize.y)) {
                    holeSize = {
                        x: nodeSize.x,
                        y: nodeSize.y,
                    };
                }
            }
        }
        return holeSize;
    }

    private getPositionRelativeToTargetAncestor(
        currentNodeUid: string,
        targetAncestorNodeUid: string,
        position?: IVector3,
    ): IVector3 {
        const node = this.pcbLayoutNodes[currentNodeUid];
        const parentUid = node.parentUid;

        const parentNode = this.pcbLayoutNodes[parentUid];
        const parentNodeBakedRules = parentNode.bakedRules as IPcbLayoutBakedBasePositionNodeRules;

        if (!position) {
            position = {
                x: 0,
                y: 0,
                z: 0,
            };
        }

        if (parentUid !== targetAncestorNodeUid) {
            if (parentNodeBakedRules?.position) {
                position = {
                    x: position.x + parentNodeBakedRules.position.x,
                    y: position.y + parentNodeBakedRules.position.y,
                    z: position.z + parentNodeBakedRules.position.z,
                };
            }

            return this.getPositionRelativeToTargetAncestor(parentUid, targetAncestorNodeUid, position);
        }

        return position;
    }

    private computeLayoutNodeRules(subjectLayoutRules: IPcbLayoutRulesMap, nodeUid: string) {
        const layoutNode = this.pcbLayoutNodes[nodeUid] as IPcbLayoutLayoutNodeData;

        if (layoutNode) {
            const {parentRootLayoutUid, parentRootFootprintUid} = this.getRootParentNodeUid(nodeUid);
            const position = this.getNodePosition(subjectLayoutRules, nodeUid);
            const rotation = this.getNodeRotation(subjectLayoutRules, nodeUid);
            const size = this.getNodeSize(subjectLayoutRules, nodeUid);
            const stackup = this.getStackup(subjectLayoutRules);
            const layoutThickness = this.getLayoutThickness(Object.values(stackup || {}));

            let color: string | undefined = undefined;
            if (subjectLayoutRules.boardColor?.value) {
                color = subjectLayoutRules.boardColor.value as string;
            }

            const shape = subjectLayoutRules.boardShape?.value as PcbBoardShape;

            const isSubLayout = !!parentRootLayoutUid && !parentRootFootprintUid;

            if (
                subjectLayoutRules.unit?.value &&
                subjectLayoutRules.rotationUnit?.value &&
                position &&
                rotation &&
                size &&
                color &&
                shape &&
                stackup
            ) {
                layoutNode.bakedRules = {
                    parentRootLayoutUid,
                    parentRootFootprintUid,
                    unit: subjectLayoutRules.unit.value as string,
                    rotationUnit: subjectLayoutRules.rotationUnit.value as string,
                    position,
                    rotation,
                    size,
                    color,
                    shape,
                    stackup,
                    isSubLayout,
                    layoutThickness,
                    holeNodes: {},
                };
            }
        }
    }

    private getLayoutThickness(pcbLayoutNodeLayers: PcbBoardLayer[]) {
        let layoutThickness = 0;

        pcbLayoutNodeLayers.forEach((existingLayer) => {
            layoutThickness = layoutThickness + (existingLayer.thickness || 0);
        });
        return layoutThickness;
    }

    private computeElementNodeRules(subjectLayoutRules: {[key: string]: IPcbLayoutRuleData}, nodeUid: string) {
        const elementNode = this.pcbLayoutNodes[nodeUid] as IPcbLayoutElementNodeData;

        if (elementNode) {
            const {parentRootLayoutUid, parentRootFootprintUid} = this.getRootParentNodeUid(nodeUid);
            const position = this.getNodePosition(subjectLayoutRules, nodeUid);
            const rotation = this.getNodeRotation(subjectLayoutRules, nodeUid);
            const layer = this.getNodeLayer(subjectLayoutRules);
            const layerZPosition = this.getLayerPositionZ(parentRootLayoutUid, parentRootFootprintUid, layer);

            if (
                subjectLayoutRules.unit?.value &&
                subjectLayoutRules.rotationUnit?.value &&
                position &&
                rotation &&
                layer
            ) {
                elementNode.bakedRules = {
                    parentRootLayoutUid,
                    parentRootFootprintUid,
                    unit: subjectLayoutRules.unit.value as string,
                    rotationUnit: subjectLayoutRules.rotationUnit.value as string,
                    position,
                    rotation,
                    layer,
                    layerZPosition,
                };
            }
        }
    }

    private computeViaNodeRules(subjectLayoutRules: IPcbLayoutRulesMap, nodeUid: string) {
        const viaNode = this.pcbLayoutNodes[nodeUid] as IPcbLayoutViaNodeData;

        if (viaNode) {
            const {parentRootLayoutUid, parentRootFootprintUid} = this.getRootParentNodeUid(nodeUid);
            const position = this.getNodePosition(subjectLayoutRules, nodeUid);
            let size = this.getNodeSize(subjectLayoutRules, nodeUid);
            const {thermalRelief, conductors, thermalReliefConductorAngle, airGapWidth, conductorWidth} =
                this.getThermalReliefRules(subjectLayoutRules);
            const connectedLayerUids = this.getConnectedLayersRule(subjectLayoutRules);
            const layer = this.getNodeLayer(subjectLayoutRules);
            const layerZPosition = this.getLayerPositionZ(parentRootLayoutUid, parentRootFootprintUid, layer);
            const copperLayerThickness = this.getCopperLayerThickness(
                parentRootLayoutUid,
                parentRootFootprintUid,
                layer,
            );
            const solderMaskLayerThickness = this.getSolderMaskLayerThickness(
                parentRootLayoutUid,
                parentRootFootprintUid,
                layer,
            );
            const holeSize = this.getHoleSize(subjectLayoutRules, viaNode?.bakedRules?.holeSize, size);

            let solderMaskTopExpansion: number | undefined = undefined;
            if (subjectLayoutRules.solderMaskTopExpansion?.value) {
                solderMaskTopExpansion = PcbLayoutEngine.evaluateNumericInputValue(
                    subjectLayoutRules.solderMaskTopExpansion.value as string,
                    subjectLayoutRules.unit,
                    "m",
                );
            }

            let solderMaskBottomExpansion: number | undefined = undefined;
            if (subjectLayoutRules.solderMaskBottomExpansion?.value) {
                solderMaskBottomExpansion = PcbLayoutEngine.evaluateNumericInputValue(
                    subjectLayoutRules.solderMaskBottomExpansion.value as string,
                    subjectLayoutRules.unit,
                    "m",
                );
            }

            let solderMaskExpansionFromTheHoleEdge: number | undefined = undefined;
            if (subjectLayoutRules.solderMaskExpansionFromTheHoleEdge?.value) {
                solderMaskExpansionFromTheHoleEdge = PcbLayoutEngine.evaluateNumericInputValue(
                    subjectLayoutRules.solderMaskExpansionFromTheHoleEdge.value as string,
                    subjectLayoutRules.unit,
                    "m",
                );
            }

            let viaType;
            if (subjectLayoutRules.viaType?.value) {
                viaType = (<any>PcbViaType)[subjectLayoutRules.viaType.value.toString()];
            }

            if (
                subjectLayoutRules.unit?.value &&
                subjectLayoutRules.rotationUnit?.value &&
                position &&
                size &&
                viaType &&
                thermalRelief &&
                holeSize &&
                connectedLayerUids &&
                layer
            ) {
                viaNode.bakedRules = {
                    parentRootLayoutUid,
                    parentRootFootprintUid,
                    connectedLayerUids,
                    thermalReliefType: thermalRelief,
                    viaType: viaType,
                    unit: subjectLayoutRules.unit.value as string,
                    rotationUnit: subjectLayoutRules.rotationUnit.value as string,
                    position,
                    size,
                    layer,
                    layerZPosition,
                    copperLayerThickness,
                    solderMaskLayerThickness,
                    holeSize,
                    solderMaskExpansion: {
                        topExpansion: solderMaskTopExpansion,
                        bottomExpansion: solderMaskBottomExpansion,
                        expansionFromTheHoleEdge: solderMaskExpansionFromTheHoleEdge,
                    },
                };

                if (
                    parentRootLayoutUid &&
                    (viaType === PcbViaType.throughHole || viaType === PcbViaType.buriedOrBlind)
                ) {
                    const layoutNode = this.pcbLayoutNodes[parentRootLayoutUid] as IPcbLayoutLayoutNodeData;

                    if (layoutNode?.bakedRules) {
                        layoutNode.bakedRules.holeNodes[nodeUid] = {
                            nodeUid,
                            throughHole: viaType === PcbViaType.throughHole,
                        };
                    }
                }

                if (airGapWidth && thermalReliefConductorAngle && conductorWidth && conductors) {
                    viaNode.bakedRules.thermalReliefConnectConfig = {
                        airGapWidth,
                        angle: thermalReliefConductorAngle,
                        conductorWidth,
                        conductors,
                    };
                }
            }
        }
    }

    private computeRouteNodeRules(subjectLayoutRules: IPcbLayoutRulesMap, nodeUid: string) {
        const routeNode = this.pcbLayoutNodes[nodeUid] as IPcbLayoutRouteNodeData;

        if (routeNode) {
            const {parentRootLayoutUid, parentRootFootprintUid} = this.getRootParentNodeUid(nodeUid);
            const position = this.getNodePosition(subjectLayoutRules, nodeUid);
            const rotation = this.getNodeRotation(subjectLayoutRules, nodeUid);
            const size = this.getNodeSize(subjectLayoutRules, nodeUid);
            const layer = this.getNodeLayer(subjectLayoutRules);
            const layerZPosition = this.getLayerPositionZ(parentRootLayoutUid, parentRootFootprintUid, layer);

            if (
                subjectLayoutRules.unit?.value &&
                subjectLayoutRules.rotationUnit?.value &&
                position &&
                size &&
                layer &&
                rotation
            ) {
                routeNode.bakedRules = {
                    parentRootLayoutUid,
                    parentRootFootprintUid,
                    unit: subjectLayoutRules.unit.value as string,
                    rotationUnit: subjectLayoutRules.rotationUnit.value as string,
                    position,
                    rotation,
                    size,
                    layer,
                    layerZPosition,
                };
            }
        }
    }

    private computeRouteSegmentNodeRules(subjectLayoutRules: IPcbLayoutRulesMap, nodeUid: string) {
        const routeSegmentNode = this.pcbLayoutNodes[nodeUid] as IPcbLayoutRouteSegmentNodeData;

        if (routeSegmentNode) {
            const {parentRootLayoutUid, parentRootFootprintUid} = this.getRootParentNodeUid(nodeUid);
            const position = this.getNodePosition(subjectLayoutRules, nodeUid);
            const startPosition = this.getNodeStartPosition(subjectLayoutRules, nodeUid);
            const endPosition = this.getNodeEndPosition(subjectLayoutRules, nodeUid);
            const rotation = this.getNodeRotation(subjectLayoutRules, nodeUid);
            const size = this.getNodeSize(subjectLayoutRules, nodeUid);
            const layer = this.getNodeLayer(subjectLayoutRules);
            const layerZPosition = this.getLayerPositionZ(parentRootLayoutUid, parentRootFootprintUid, layer);
            const copperLayerThickness = this.getCopperLayerThickness(
                parentRootLayoutUid,
                parentRootFootprintUid,
                layer,
            );

            if (
                subjectLayoutRules.unit?.value &&
                subjectLayoutRules.rotationUnit?.value &&
                position &&
                size &&
                layer &&
                rotation
            ) {
                routeSegmentNode.bakedRules = {
                    parentRootLayoutUid,
                    parentRootFootprintUid,
                    unit: subjectLayoutRules.unit.value as string,
                    rotationUnit: subjectLayoutRules.rotationUnit.value as string,
                    startPosition,
                    endPosition,
                    position,
                    rotation,
                    size,
                    layer,
                    layerZPosition,
                    copperLayerThickness,
                };
            }
        }
    }

    private computeFootprintNodeRules(subjectLayoutRules: IPcbLayoutRulesMap, nodeUid: string) {
        const footprintNode = this.pcbLayoutNodes[nodeUid] as IPcbLayoutFootprintNodeData;

        if (footprintNode) {
            const {parentRootLayoutUid, parentRootFootprintUid} = this.getRootParentNodeUid(nodeUid);
            const position = this.getNodePosition(subjectLayoutRules, nodeUid);
            const rotation = this.getNodeRotation(subjectLayoutRules, nodeUid);

            let stackup: PcbBoardLayersMap | undefined;
            if (this.pcbLayoutNodeTreeTraveler.isRootFootprint(nodeUid, this.documentUid)) {
                stackup = this.getStackup(subjectLayoutRules);
            }

            let silkColor: string | undefined = undefined;
            if (subjectLayoutRules.silkColor?.value) {
                silkColor = subjectLayoutRules.silkColor.value.toString();
            }

            if (
                subjectLayoutRules.unit?.value &&
                subjectLayoutRules.rotationUnit?.value &&
                position &&
                rotation &&
                silkColor
            ) {
                footprintNode.bakedRules = {
                    parentRootLayoutUid,
                    parentRootFootprintUid,
                    unit: subjectLayoutRules.unit.value as string,
                    rotationUnit: subjectLayoutRules.rotationUnit.value as string,
                    position,
                    rotation,
                    silkColor,
                    stackup,
                };
            }
            Object.values(this.runtimePcbLayoutRules).forEach((rule) => {
                if (rule.inheritedFromAncestorNodeUid === footprintNode.uid) {
                    delete this.runtimePcbLayoutRules[rule.uid];
                }
            });
        }
    }

    private getRootParentNodeUid(nodeUid: string) {
        const parentRootLayoutUid = this.pcbLayoutNodeTreeTraveler.getAncestorUidByType(
            nodeUid,
            BasePcbLayoutNodeTypes.layout,
            this.documentUid,
        );

        const parentRootFootprintUid = this.pcbLayoutNodeTreeTraveler.getAncestorUidByType(
            nodeUid,
            BasePcbLayoutNodeTypes.footprint,
            this.documentUid,
        );

        return {
            parentRootLayoutUid: parentRootLayoutUid,
            parentRootFootprintUid: parentRootFootprintUid,
        };
    }


    private getSystemDefaultLayoutRules(): IPcbLayoutRuleSetsMap {
        const cacheKey = "SystemDefaultPcbLayoutRules";

        if (get(cacheKey)) {
            return get(cacheKey);
        }

        // Compile system default rules from rules config
        const defaultRules = this.addGenericRuleConfigBasedRules();

        const defaultRuleSetsMap = Object.values(defaultRules).reduce((acc, defaultRule) => {
            return {...acc, [defaultRule.ruleSet.uid]: defaultRule.ruleSet};
        }, {});

        set(cacheKey, defaultRuleSetsMap);

        return defaultRuleSetsMap;
    }

    private addGenericRuleConfigBasedRules(): IPcbLayoutRuleSetsWithSpecificityMap {
        const defaultRules: IPcbLayoutRuleSetsWithSpecificityMap = {};

        Object.values(BasePcbLayoutNodeTypes).forEach((nodeType) => {
            const nodeTypeBaseRules = Object.values(LayoutRules).filter((ruleConfig) => {
                if (!ruleConfig.setByDefault) {
                    return false;
                }

                if (!ruleConfig.supportedNodeTypes && !ruleConfig.unsupportedNodeTypes) {
                    return true;
                }

                if (ruleConfig.supportedNodeTypes?.length === 0 && ruleConfig.unsupportedNodeTypes?.length === 0) {
                    return true;
                }

                if (
                    ruleConfig.supportedNodeTypes &&
                    ruleConfig.supportedNodeTypes?.includes(nodeType) &&
                    (!ruleConfig.unsupportedNodeTypes?.includes(nodeType) || !ruleConfig.unsupportedNodeTypes)
                ) {
                    return true;
                }

                if (!ruleConfig.supportedNodeTypes && !ruleConfig.unsupportedNodeTypes?.includes(nodeType)) {
                    return true;
                }

                return false;
            });

            nodeTypeBaseRules.forEach((ruleConfig) => {
                if (!ruleConfig.defaultForType) {
                    const rootRules: IPcbLayoutRulesMap = {};

                    rootRules[ruleConfig.key] = this.createDefaultRootRuleFromRuleConfig(
                        ruleConfig,
                        ruleConfig.default,
                    );

                    this.addSystemDefaultRules(defaultRules, nodeType, rootRules);
                } else if (ruleConfig.defaultForType) {
                    Object.entries(ruleConfig.defaultForType).forEach(([key, defaultValueForType]) => {
                        const nodeTypeSpecificRules: IPcbLayoutRulesMap = {};

                        nodeTypeSpecificRules[ruleConfig.key] = this.createDefaultRootRuleFromRuleConfig(
                            ruleConfig,
                            defaultValueForType,
                        );

                        this.addSystemDefaultRules(defaultRules, key as BasePcbLayoutNodeTypes, nodeTypeSpecificRules);
                    });
                }
            });
        });

        return defaultRules;
    }

    private getSystemDefaultRuleUid(key: BasePcbLayoutNodeTypes) {
        return `${key}-${PcbLayoutEngine.systemDefaultRulesAppendix}`;
    }

    private addSystemDefaultRules(
        defaultRules: IPcbLayoutRuleSetsWithSpecificityMap,
        nodeType: BasePcbLayoutNodeTypes,
        rules: IPcbLayoutRulesMap,
    ) {
        const nodeTypeUid = this.getSystemDefaultRuleUid(nodeType);

        defaultRules[nodeTypeUid] = {
            ...(defaultRules[nodeTypeUid] || {}),
            specificity: 0,
            ruleSet: {
                ...(defaultRules[nodeTypeUid]?.ruleSet || {}),
                uid: nodeTypeUid,
                selector: nodeType,
                rules: {
                    ...(defaultRules[nodeTypeUid]?.ruleSet?.rules || {}),
                    ...rules,
                },
            },
        };
    }

    private createDefaultRootRuleFromRuleConfig(
        ruleConfig: IRuleConfigData,
        value: PcbLayoutRuleValue,
    ): IPcbLayoutRuleData {
        return {
            uid: `root-${ruleConfig.key}-rule`,
            key: ruleConfig.key,
            value: value,
            referenceOfDocumentUid: this.documentUid,
        };
    }
}
