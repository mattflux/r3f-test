import {get, set} from "./cache";
import {
    BasePcbLayoutNodeTypes,
    IPcbLayoutFootprintNodeData,
    IPcbLayoutLayoutNodeData,
    IPcbLayoutNode,
    IPcbLayoutNodesMap,
} from "./SharedDataModels";

interface IGlobalIndexCache {
    getAncestorUidByTypeIndex: IGetAncestorUidByTypeIndex;
    getAncestorUidsIndex: IGetAncestorUidsIndex;
    getDefaultFootprintIndex: IPcbLayoutNode | undefined;
    getDefaultLayoutIndex: IPcbLayoutNode | undefined;
    getRootLevelPcbLayoutNodeUidsIndex: string[] | undefined;
    getRootLevelLayoutNodeDataIndex: IPcbLayoutLayoutNodeData[];
    isChildOfNodeUidIndex: IIsChildOfNodeUidIndex;
    isChildOfNonRootFootprintIndex: IIsChildOfRootFootprintIndex;
    isChildOfRootFootprintIndex: IIsChildOfRootFootprintIndex;
    isChildOfRootLayoutIndex: IIsChildOfRootLayoutIndex;
    isNodeChildOfParentNodeIndex: IIsNodeChildOfParentNodeIndex;
    isRootFootprintIndex: IIsRootFootprintIndex;
    isRootLayoutIndex: IIsRootLayoutIndex;
}

interface IGetAncestorUidsIndex {
    [nodeUid: string]: {
        ancestorUids: string[];
    };
}
interface IIsChildOfRootFootprintIndex {
    [nodeUid: string]: {
        isChild: boolean;
    };
}

interface IIsChildOfRootLayoutIndex {
    [nodeUid: string]: {
        isChild: boolean;
    };
}

interface IIsChildOfNodeUidIndex {
    [nodeUid: string]: {
        isChild: boolean;
    };
}
interface IIsNodeChildOfParentNodeIndex {
    [key: string]: {
        isChild: boolean;
    };
}
interface IGetAncestorUidByTypeIndex {
    [key: string]: {
        ancestorUid: string | undefined;
    };
}
interface IIsRootLayoutIndex {
    [nodeUid: string]: {isRootLayoutIndex: boolean};
}
interface IIsRootFootprintIndex {
    [nodeUid: string]: {isRootFootprint: boolean};
}

export class PcbLayoutNodeTreeTraveler {
    public static readonly rootNodeId: string = "ROOT";
    public set pcbLayoutNodes(pcbLayoutNodes: IPcbLayoutNodesMap) {
        this.cachedIndexes = this.indexInitState();
        this._pcbLayoutNodes = pcbLayoutNodes;
    }

    private _pcbLayoutNodes: IPcbLayoutNodesMap;
    private cachedIndexes: IGlobalIndexCache;

    constructor(pcbLayoutNodes: IPcbLayoutNodesMap, useGlobalCacheKey: string | undefined = undefined) {
        this._pcbLayoutNodes = pcbLayoutNodes;

        this.cachedIndexes = this.indexInitState();

        if (useGlobalCacheKey) {
            const globalCacheKeyWithPrefix = `PcbLayoutNodeTreeTraveler_key:${useGlobalCacheKey}`;
            const cachedIndexes: IGlobalIndexCache = get(globalCacheKeyWithPrefix);

            if (cachedIndexes) {
                this.cachedIndexes = cachedIndexes;
            }

            set(globalCacheKeyWithPrefix, this.cachedIndexes);
        }
    }

    public getAncestorUidByType(childNodeUid: string, nodeType: BasePcbLayoutNodeTypes, documentUid: string) {
        const indexKey = `${childNodeUid}:${nodeType}:${documentUid}`;
        const indexedResult = this.cachedIndexes.getAncestorUidByTypeIndex[indexKey];
        if (indexedResult) {
            return indexedResult.ancestorUid;
        }

        let ancestorUid;

        const node = this._pcbLayoutNodes[childNodeUid];

        let ancestorUids: string[] = [];
        if (node) {
            ancestorUids = this.getAncestorUidsIncludingRoot(node);
        }

        if (ancestorUids.includes(PcbLayoutNodeTreeTraveler.rootNodeId) && nodeType === BasePcbLayoutNodeTypes.root) {
            ancestorUid = PcbLayoutNodeTreeTraveler.rootNodeId;
        } else {
            ancestorUid = ancestorUids.find((ancestorUid) => this._pcbLayoutNodes[ancestorUid]?.type === nodeType);
        }

        this.cachedIndexes.getAncestorUidByTypeIndex[indexKey] = {
            ancestorUid: ancestorUid,
        };

        return ancestorUid;
    }

    // the order of the returned uids matters!
    public getAncestorUids(node: IPcbLayoutNode): string[] {
        const indexedResult = this.cachedIndexes.getAncestorUidsIndex[node.uid];

        if (indexedResult) {
            return indexedResult.ancestorUids;
        }

        const ancestors: string[] = [];
        const parentNode = this._pcbLayoutNodes[node?.parentUid];

        if (parentNode) {
            ancestors.push(node.parentUid);

            return [...ancestors, ...this.getAncestorUids(parentNode)];
        }

        this.cachedIndexes.getAncestorUidsIndex[node.uid] = {
            ancestorUids: ancestors,
        };

        return ancestors;
    }

    public getNodeUidsParentLayoutUid(nodeUid: string) {
        const node = this._pcbLayoutNodes[nodeUid];
        const ancestorUids = this.getAncestorUids(node);
        return ancestorUids.find(
            (ancestorUid) => this._pcbLayoutNodes[ancestorUid]?.type === BasePcbLayoutNodeTypes.layout,
        );
    }

    public getNodeUidsParentElementUid(nodeUid: string) {
        const node = this._pcbLayoutNodes[nodeUid];
        const ancestorUids = this.getAncestorUids(node);
        return ancestorUids.find(
            (ancestorUid) => this._pcbLayoutNodes[ancestorUid]?.type === BasePcbLayoutNodeTypes.element,
        );
    }

    // the order of the returned uids matters!
    public getAncestorUidsIncludingRoot(node: IPcbLayoutNode): string[] {
        const ancestors = this.getAncestorUids(node);
        const lastNodeUid = ancestors[ancestors.length - 1];
        const lastNode = this._pcbLayoutNodes[lastNodeUid];

        if (lastNode?.parentUid) {
            ancestors.push(lastNode.parentUid);
        }

        return ancestors;
    }

    public getChildNodeOfContainerType(parentUid: string, name: string) {
        return Object.values(this._pcbLayoutNodes).find(
            (node) => node.name.toLowerCase().endsWith(name?.toLowerCase()) && node.parentUid === parentUid,
        );
    }

    public getDefaultFootprint(documentUid: string) {
        const result = Object.values(this._pcbLayoutNodes).find((node) => this.isRootFootprint(node.uid, documentUid));

        this.cachedIndexes.getDefaultFootprintIndex = result;

        return result as IPcbLayoutFootprintNodeData;
    }

    public getDefaultLayout(documentUid: string) {
        if (this.cachedIndexes.getDefaultLayoutIndex) {
            return this.cachedIndexes.getDefaultLayoutIndex as IPcbLayoutLayoutNodeData;
        }

        const result = Object.values(this._pcbLayoutNodes).find((node) => this.isRootLayout(node.uid, documentUid));

        this.cachedIndexes.getDefaultLayoutIndex = result;

        return result as IPcbLayoutLayoutNodeData;
    }

    public getRootLayouts(documentUid: string) {
        if (
            this.cachedIndexes.getRootLevelLayoutNodeDataIndex &&
            this.cachedIndexes.getRootLevelLayoutNodeDataIndex.length
        ) {
            return this.cachedIndexes.getRootLevelLayoutNodeDataIndex;
        }

        const result = Object.values(this._pcbLayoutNodes).filter((node) =>
            this.isRootLayout(node.uid, documentUid),
        ) as IPcbLayoutLayoutNodeData[];

        this.cachedIndexes.getRootLevelLayoutNodeDataIndex = result;
        return result;
    }
    // There is no root node! Children of root have the document Uid set as parentUid instead
    public getRootLevelPcbLayoutNodeUids(_documentUid: string) {
        if (this.cachedIndexes.getRootLevelPcbLayoutNodeUidsIndex) {
            return this.cachedIndexes.getRootLevelPcbLayoutNodeUidsIndex;
        }

        const rootUids = Object.values(this._pcbLayoutNodes)
            .filter((node) => node.parentUid === PcbLayoutNodeTreeTraveler.rootNodeId)
            .map((node) => node.uid);

        this.cachedIndexes.getRootLevelPcbLayoutNodeUidsIndex = rootUids;

        return rootUids;
    }

    public isChildOfNodeUid(childNodeUid: string, nodeUid: string) {
        const indexedResult = this.cachedIndexes.isChildOfNodeUidIndex[childNodeUid];
        if (indexedResult) {
            return indexedResult.isChild;
        }

        let isChild = false;

        if (this._pcbLayoutNodes[childNodeUid]) {
            const ancestorUids = this.getAncestorUidsIncludingRoot(this._pcbLayoutNodes[childNodeUid]);

            isChild = ancestorUids.includes(nodeUid);
        }

        this.cachedIndexes.isChildOfNodeUidIndex[childNodeUid] = {
            isChild: isChild,
        };

        return isChild;
    }

    public isChildOfNonRootFootprint(childNodeUid: string, documentUid: string): boolean {
        const indexedResult = this.cachedIndexes.isChildOfNonRootFootprintIndex[childNodeUid];
        if (indexedResult) {
            return indexedResult.isChild;
        }

        const ancestorFootprintUid = this.getAncestorUidByType(
            childNodeUid,
            BasePcbLayoutNodeTypes.footprint,
            documentUid,
        );

        let isChild = false;

        if (ancestorFootprintUid) {
            const footprintAncestorUids = this.getAncestorUids(this._pcbLayoutNodes[ancestorFootprintUid]);

            const isLayoutChild = footprintAncestorUids.find(
                (footprintAncestorUid) =>
                    this._pcbLayoutNodes[footprintAncestorUid].type === BasePcbLayoutNodeTypes.layout,
            );

            isChild = !!isLayoutChild;
        }

        this.cachedIndexes.isChildOfNonRootFootprintIndex[childNodeUid] = {
            isChild: isChild,
        };

        return isChild;
    }

    public isChildOfRootFootprint(childNodeUid: string, documentUid: string): boolean {
        const indexedResult = this.cachedIndexes.isChildOfRootFootprintIndex[childNodeUid];
        if (indexedResult) {
            return indexedResult.isChild;
        }

        const ancestorFootprintUid = this.getAncestorUidByType(
            childNodeUid,
            BasePcbLayoutNodeTypes.footprint,
            documentUid,
        );

        let isChild = false;

        if (ancestorFootprintUid) {
            const footprintAncestorUids = this.getAncestorUids(this._pcbLayoutNodes[ancestorFootprintUid]);

            const isLayoutChild = footprintAncestorUids.find(
                (footprintAncestorUid) =>
                    this._pcbLayoutNodes[footprintAncestorUid].type === BasePcbLayoutNodeTypes.layout,
            );

            isChild = !isLayoutChild;
        }

        this.cachedIndexes.isChildOfRootFootprintIndex[childNodeUid] = {
            isChild: isChild,
        };

        return isChild;
    }

    public isChildOfRootLayout(childNodeUid: string, documentUid: string): boolean {
        const indexedResult = this.cachedIndexes.isChildOfRootLayoutIndex[childNodeUid];
        if (indexedResult) {
            return indexedResult.isChild;
        }

        const ancestorLayoutUid = this.getAncestorUidByType(childNodeUid, BasePcbLayoutNodeTypes.layout, documentUid);

        let isChild = !!ancestorLayoutUid;

        this.cachedIndexes.isChildOfRootLayoutIndex[childNodeUid] = {
            isChild: isChild,
        };

        return isChild;
    }

    public isNodeChildOfParentNode(node: IPcbLayoutNode, parentNode: IPcbLayoutNode) {
        const indexKey = `${node.uid}:${parentNode.uid}`;
        const indexedResult = this.cachedIndexes.isNodeChildOfParentNodeIndex[indexKey];
        if (indexedResult) {
            return indexedResult.isChild;
        }

        let isChild = false;

        if (parentNode.childrenUids.includes(node.uid)) {
            isChild = true;
        } else {
            parentNode.childrenUids.some((childUid) => {
                isChild = this.isNodeChildOfParentNode(node, this._pcbLayoutNodes[childUid]);

                return isChild;
            });

            isChild = false;
        }

        this.cachedIndexes.isNodeChildOfParentNodeIndex[indexKey] = {
            isChild: isChild,
        };

        return isChild;
    }

    public isRootFootprint(nodeUid: string, _documentUid: string) {
        if (this.cachedIndexes.isRootFootprintIndex[nodeUid]) {
            return this.cachedIndexes.isRootFootprintIndex[nodeUid].isRootFootprint;
        }

        const node = this._pcbLayoutNodes[nodeUid];
        let result: boolean = false;

        if (this.isRootNode(node) && node.type === BasePcbLayoutNodeTypes.footprint) {
            result = true;
        } else if (node.type === BasePcbLayoutNodeTypes.footprint) {
            const ancestorUids = this.getAncestorUids(node);

            const nextAncestorIsFootprintOrLayout = ancestorUids.find(
                (ancestorUid) =>
                    this._pcbLayoutNodes[ancestorUid]?.type === BasePcbLayoutNodeTypes.footprint ||
                    this._pcbLayoutNodes[ancestorUid]?.type === BasePcbLayoutNodeTypes.layout,
            );

            result = !nextAncestorIsFootprintOrLayout;
        }

        this.cachedIndexes.isRootFootprintIndex[nodeUid] = {
            isRootFootprint: result,
        };

        return result;
    }

    public isRootLayout(nodeUid: string, _documentUid: string) {
        if (this.cachedIndexes.isRootLayoutIndex[nodeUid]) {
            return this.cachedIndexes.isRootLayoutIndex[nodeUid].isRootLayoutIndex;
        }

        const node = this._pcbLayoutNodes[nodeUid];
        let result: boolean = false;

        if (this.isRootNode(node) && node.type === BasePcbLayoutNodeTypes.layout) {
            result = true;
        } else if (node.type === BasePcbLayoutNodeTypes.layout) {
            const ancestorUids = this.getAncestorUids(node);

            const nextAncestorIsLayout = ancestorUids.find(
                (ancestorUid) => this._pcbLayoutNodes[ancestorUid]?.type === BasePcbLayoutNodeTypes.layout,
            );

            result = !nextAncestorIsLayout;
        }

        this.cachedIndexes.isRootLayoutIndex[nodeUid] = {
            isRootLayoutIndex: result,
        };

        return result;
    }

    public isRootNode(node: IPcbLayoutNode) {
        return node.parentUid === PcbLayoutNodeTreeTraveler.rootNodeId;
    }

    private indexInitState() {
        return {
            getAncestorUidsIndex: {},
            isChildOfRootFootprintIndex: {},
            isChildOfRootLayoutIndex: {},
            isChildOfNonRootFootprintIndex: {},
            isChildOfNodeUidIndex: {},
            isNodeChildOfParentNodeIndex: {},
            getAncestorUidByTypeIndex: {},
            getRootLevelLayoutNodeDataIndex: [],
            getRootLevelPcbLayoutNodeUidsIndex: undefined,
            getDefaultFootprintIndex: undefined,
            getDefaultLayoutIndex: undefined,
            isRootLayoutIndex: {},
            isRootFootprintIndex: {},
        };
    }
}
