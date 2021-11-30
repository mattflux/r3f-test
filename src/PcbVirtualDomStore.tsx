import { produce } from "immer";
import { useEffect, useMemo } from "react";
import create from "zustand";
import { devtools } from "zustand/middleware";
import docState from "./mockDocument.json";

import {
    IApplicationState,
    IGlobalPcbLayoutRuleSetData,
    IPcbLayoutNode,
    IPcbLayoutNodesMap,
    IPcbLayoutRuleSetsMap,
    IPcbLayoutRulesMap,
    LayoutRuleName,
} from "./SharedDataModels";
import {PcbLayoutEngine} from "./PcbLayoutingEngine";
import {PcbLayoutNodeTreeTraveler} from "./PcbLayoutNodeTreeTraveler";

const doc = (docState as IApplicationState).document.present;

export interface IPcbVirtualDomStore {
    pcbLayoutRuleSets: IPcbLayoutRuleSetsMap;
    applyPcbLayoutRuleSetsFromMainStore: (
        ruleSets: IPcbLayoutRuleSetsMap
    ) => void;
    setPcbLayoutRuleSets: (ruleSets: IGlobalPcbLayoutRuleSetData[]) => void;
    removePcbLayoutRuleSets: (ruleSetUids: string[]) => void;
    pcbLayoutNodes: IPcbLayoutNodesMap;
    applyPcbLayoutNodesFromMainStore: (nodes: IPcbLayoutNodesMap) => void;
    setPcbLayoutNodes: (nodes: IPcbLayoutNode[]) => void;
    setPcbLayoutNodeLayoutRules: (
        nodeUid: string,
        pcbLayoutRules: IPcbLayoutRulesMap
    ) => void;
    removePcbLayoutNodeLayoutRules: (
        nodeUid: string,
        ruleKeys: LayoutRuleName[]
    ) => void;
    setTogglePcbRule: (
        pcbLayoutRuleSetUid: string,
        toggleState: boolean,
        pcbLayoutRuleUid?: string
    ) => void;
    setToggleObjectSpecificPcbRule: (
        nodeUid: string,
        pcbLayoutRuleUid: string,
        toggleState: boolean
    ) => void;
    removePcbLayoutNodes: (nodeUids: string[]) => void;
    activeLayoutNode?: IPcbLayoutNode;
    setActiveLayoutNode: (node: IPcbLayoutNode) => void;
}

export function getDefaultLayoutOrFootprint(state: IPcbVirtualDomStore) {
    const documentUid = doc.uid;
    if (documentUid) {
        const treeTraveler = new PcbLayoutNodeTreeTraveler(state.pcbLayoutNodes);
        let defaultLayoutOrFootprint: IPcbLayoutNode = treeTraveler.getDefaultLayout(documentUid);
        if (!defaultLayoutOrFootprint) {
            defaultLayoutOrFootprint = treeTraveler.getDefaultFootprint(documentUid);
        }
        return defaultLayoutOrFootprint;
    }
}


// TODO: implement this and call it on each change as-per-graviton
// this will allow the rules to reside on the PCB nodes as we want
function bakeChanges(state: IPcbVirtualDomStore) {
    const pcbLayoutEngine = new PcbLayoutEngine(
        doc.uid,
        doc.elements,
        doc.routes,
        {},
        state.pcbLayoutNodes,
        {}, // no mocked rulesets yet. but when we do it should reference 'state' (not doc)
    );

    pcbLayoutEngine.applyPcbLayoutRulesToPcbDOM();
}

export function usePcbVirtualDomStoreSync() {
    const applyPcbLayoutNodesFromMainStore = usePcbVirtualDomStore(
        (state) => state.applyPcbLayoutNodesFromMainStore
    );
    const applyPcbLayoutRuleSetsFromMainStore = usePcbVirtualDomStore(
        (state) => state.applyPcbLayoutRuleSetsFromMainStore
    );

    const documentPcbLayoutNodes = doc.pcbLayoutNodes;
    const documentPcbLayoutRuleSets = useMemo(() => ({}), []);

    useEffect(() => {
        if (documentPcbLayoutNodes) {
            applyPcbLayoutNodesFromMainStore(documentPcbLayoutNodes);
        }
    }, [documentPcbLayoutNodes, applyPcbLayoutNodesFromMainStore]);

    useEffect(() => {
        if (documentPcbLayoutRuleSets) {
            applyPcbLayoutRuleSetsFromMainStore(documentPcbLayoutRuleSets);
        }
    }, [documentPcbLayoutRuleSets, applyPcbLayoutRuleSetsFromMainStore]);
}

export const usePcbVirtualDomStore = create<IPcbVirtualDomStore>(
    devtools((set) => ({
        pcbLayoutRuleSets: {},
        applyPcbLayoutRuleSetsFromMainStore: (
            ruleSets: IPcbLayoutRuleSetsMap
        ) =>
            set(
                produce((state: IPcbVirtualDomStore) => {
                    state.pcbLayoutRuleSets = ruleSets;
                    bakeChanges(state);
                })
            ),
        setPcbLayoutRuleSets: (ruleSets: IGlobalPcbLayoutRuleSetData[]) =>
            set(
                produce((state: IPcbVirtualDomStore) => {
                    ruleSets.forEach((ruleSet) => {
                        state.pcbLayoutRuleSets[ruleSet.uid] = ruleSet;
                    });
                    bakeChanges(state);
                })
            ),
        removePcbLayoutRuleSets: (ruleSetUids: string[]) =>
            set(
                produce((state: IPcbVirtualDomStore) => {
                    ruleSetUids.forEach((ruleSetUid) => {
                        delete state.pcbLayoutRuleSets[ruleSetUid];
                    });
                    bakeChanges(state);
                })
            ),
        pcbLayoutNodes: {},
        setActiveLayoutNode: (node: IPcbLayoutNode) => {
            set(
                produce((state: IPcbVirtualDomStore) => {
                    state.activeLayoutNode = node;
                })
            );
        },
        applyPcbLayoutNodesFromMainStore: (nodes: IPcbLayoutNodesMap) =>
            set(
                produce((state: IPcbVirtualDomStore) => {
                    //TODO this will always trigger a re-layout which issn't always necessary

                    state.pcbLayoutNodes = {};

                    Object.values(nodes).forEach((node) => {
                        state.pcbLayoutNodes[node.uid] = { ...node };
                    });
                    state.activeLayoutNode = getDefaultLayoutOrFootprint(state); // TODO @matt: re-implement this
                    bakeChanges(state);
                })
            ),
        setPcbLayoutNodes: (nodes: IPcbLayoutNode[]) =>
            set(
                produce((state: IPcbVirtualDomStore) => {
                    nodes.forEach((node) => {
                        state.pcbLayoutNodes[node.uid] = node;
                    });
                    bakeChanges(state);
                })
            ),
        removePcbLayoutNodes: (nodeUids: string[]) =>
            set(
                produce((state: IPcbVirtualDomStore) => {
                    nodeUids.forEach((nodeUid) => {
                        delete state.pcbLayoutNodes[nodeUid];
                    });
                    bakeChanges(state);
                })
            ),
        setPcbLayoutNodeLayoutRules: (
            nodeUid: string,
            pcbLayoutRules: IPcbLayoutRulesMap
        ) =>
            set(
                produce((state: IPcbVirtualDomStore) => {
                    const node = state.pcbLayoutNodes[nodeUid];

                    if (node) {
                        if (!node.pcbNodeRuleSet) {
                            node.pcbNodeRuleSet = {};
                        }

                        Object.values(pcbLayoutRules).forEach(
                            (pcbLayoutRule) => {
                                node.pcbNodeRuleSet[pcbLayoutRule.key] =
                                    pcbLayoutRule;
                            }
                        );
                        bakeChanges(state);
                    }
                })
            ),
        removePcbLayoutNodeLayoutRules: (
            nodeUid: string,
            ruleKeys: LayoutRuleName[]
        ) =>
            set(
                produce((state: IPcbVirtualDomStore) => {
                    const node = state.pcbLayoutNodes[nodeUid];

                    if (node && node.pcbNodeRuleSet) {
                        ruleKeys.forEach((ruleUid) => {
                            delete node.pcbNodeRuleSet[ruleUid];
                        });
                    }
                    bakeChanges(state);
                })
            ),
        setTogglePcbRule: (
            pcbLayoutRuleSetUid: string,
            toggleState: boolean,
            pcbLayoutRuleUid?: string
        ) =>
            set(
                produce((state: IPcbVirtualDomStore) => {
                    const rule =
                        pcbLayoutRuleSetUid &&
                        state.pcbLayoutRuleSets[pcbLayoutRuleSetUid];
                    if (rule) {
                        if (!pcbLayoutRuleUid) {
                            // toggle the whole rule
                            rule.disabled = toggleState;
                            Object.values(rule.rules).forEach(
                                (subRule) => (subRule.disabled = rule.disabled)
                            );
                        } else {
                            // toggle just the sub-rule
                            const subRule = Object.values(rule.rules).find(
                                (rule) => rule.uid === pcbLayoutRuleUid
                            );
                            if (subRule) {
                                subRule.disabled = toggleState;
                                rule.disabled = Object.values(rule.rules).every(
                                    (subRule) => subRule.disabled
                                );
                            }
                        }
                    }
                    bakeChanges(state);
                })
            ),
        setToggleObjectSpecificPcbRule: (
            nodeUid: string,
            pcbLayoutRuleUid: string,
            toggleState: boolean
        ) =>
            set(
                produce((state: IPcbVirtualDomStore) => {
                    const node = nodeUid && state.pcbLayoutNodes[nodeUid];
                    if (node) {
                        const rule = Object.values(node.pcbNodeRuleSet).find(
                            (rule) => rule.uid === pcbLayoutRuleUid
                        );
                        if (rule) {
                            rule.disabled = toggleState;
                        }
                    }
                    bakeChanges(state);
                })
            ),
    }))
);
