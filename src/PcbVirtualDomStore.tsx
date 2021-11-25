import { produce } from "immer";
import { useEffect, useMemo } from "react";
import create from "zustand";
import mockNodes from "./pcbNodes.json";
import { devtools } from "zustand/middleware";

import {
    IGlobalPcbLayoutRuleSetData,
    IPcbLayoutNode,
    IPcbLayoutNodesMap,
    IPcbLayoutRuleSetsMap,
    IPcbLayoutRulesMap,
    LayoutRuleName,
} from "./SharedDataModels";

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

export function usePcbVirtualDomStoreSync() {
    const applyPcbLayoutNodesFromMainStore = usePcbVirtualDomStore(
        (state) => state.applyPcbLayoutNodesFromMainStore
    );
    const applyPcbLayoutRuleSetsFromMainStore = usePcbVirtualDomStore(
        (state) => state.applyPcbLayoutRuleSetsFromMainStore
    );

    const documentPcbLayoutNodes = mockNodes as IPcbLayoutNodesMap;
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
                })
            ),
        setPcbLayoutRuleSets: (ruleSets: IGlobalPcbLayoutRuleSetData[]) =>
            set(
                produce((state: IPcbVirtualDomStore) => {
                    ruleSets.forEach((ruleSet) => {
                        state.pcbLayoutRuleSets[ruleSet.uid] = ruleSet;
                    });
                })
            ),
        removePcbLayoutRuleSets: (ruleSetUids: string[]) =>
            set(
                produce((state: IPcbVirtualDomStore) => {
                    ruleSetUids.forEach((ruleSetUid) => {
                        delete state.pcbLayoutRuleSets[ruleSetUid];
                    });
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
                    // state.activeLayoutNode = getDefaultLayoutOrFootprint(state); TODO @matt: re-implement this
                })
            ),
        setPcbLayoutNodes: (nodes: IPcbLayoutNode[]) =>
            set(
                produce((state: IPcbVirtualDomStore) => {
                    nodes.forEach((node) => {
                        state.pcbLayoutNodes[node.uid] = node;
                    });
                })
            ),
        removePcbLayoutNodes: (nodeUids: string[]) =>
            set(
                produce((state: IPcbVirtualDomStore) => {
                    nodeUids.forEach((nodeUid) => {
                        delete state.pcbLayoutNodes[nodeUid];
                    });
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
                })
            ),
    }))
);
