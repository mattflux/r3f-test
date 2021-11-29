import {meshBounds, Text, useHelper} from "@react-three/drei";
import {ThreeEvent, useFrame, useThree} from "@react-three/fiber";
import produce from "immer";
import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {Mesh} from "three";
import {IPcbLayoutBakedBasePositionNodeRules, IPcbLayoutBakedBaseScaleNodeRules} from "../bakedModels";
import {IPcbVirtualDomStore, usePcbVirtualDomStore} from "../PcbVirtualDomStore";

export interface IPcbLayoutBaseNodeProps {
    uid: string;
    isDragable?: boolean;
    children?: React.ReactNode;
    visible?: boolean;
}

export function getRelativeMousePosition(domElement: HTMLCanvasElement, clientX: number, clientY: number) {
    const viewportOffset = domElement.getBoundingClientRect();

    const offsetLeft = viewportOffset.left;
    const offsetTop = viewportOffset.top;
    const clientWidth = domElement.clientWidth;
    const clientHeight = domElement.clientHeight;

    const mouseX = ((clientX - offsetLeft) / clientWidth) * 2 - 1;
    const mouseY = -((clientY - offsetTop) / clientHeight) * 2 + 1;
    return {mouseX, mouseY};
}

const frameFontSize = 0.0015;

function getFrameFontSize(zoom: number) {
    return frameFontSize / (zoom / 10000);
}

function PcbLayoutBaseNode(props: IPcbLayoutBaseNodeProps) {
    // const interact = usePcbEditorUiStore((s) => s.interact);
    // const interactionState = usePcbEditorUiStore((s) => s.interactionState);
    // const setEnableCameraControls = () => interact("END_INTERACTION");
    // const setDisableCameraControls = () => interact("DISABLE");
    // const setPosition = useHighFrequencyEditorState((state) => state.setData);
    // const cameraMode = usePcbEditorUiStore((state) => state.cameraMode);
    // const editorMode = usePersistedDocumentUiStore((state) => state.editorMode);
    // const camera = useThree((state) => state.camera);
    // const gl = useThree((state) => state.gl);

    // const isSelected = useSelector(selectors.document.baseDocument.useIsSubjectSelected(props.uid));
    // const {layerZPosition, parentLayerZPosition, parentLayer} = usePcbVirtualDomStore(
    //     selectors.document.pcbLayoutNodes.usePcbLayoutNodeLayerData(props.uid),
    // );
    // const flipCameraState = usePcbEditorUiStore((state) => state.flippedCamera) && camera instanceof OrthographicCamera;
    // const setHoveredNodeUid = usePcbHoverStore((state) => state.setHoveredNodeUid);
    // const hoveredNodeUid = usePcbHoverStore((state) => state.nodeUid);
    // const hovered = useMemo(() => {
    //     return props.uid === hoveredNodeUid;
    // }, [hoveredNodeUid, props.uid]);

    // const dispatch = useDispatch();

    // // States
    // const setContextMenu = useContextMenuStore((state) => state.setContextMenu);

    // const setNodeUidToObject3dIdMap = usePcbNodeToObject3dMapStore((state) => state.setNodeUidToObject3dIdMap);
    // const removeNodeUidToObject3dIdMap = usePcbNodeToObject3dMapStore((state) => state.removeNodeUidToObject3dIdMap);
    // const setPcbLayoutNodeLayoutRules = usePcbVirtualDomStore((state) => state.setPcbLayoutNodeLayoutRules);

    const pcbLayoutNodePosition = usePcbVirtualDomStore(
        useCallback(
            (state) => {
                const bakedRules = state.pcbLayoutNodes[props.uid]?.bakedRules as IPcbLayoutBakedBasePositionNodeRules;
                return bakedRules?.position;
            },
            [props.uid],
        ),
    );

    // const pcbLayoutNodeRotation = usePcbVirtualDomStore(
    //     useMemo(
    //         () =>
    //             memoize((state: IPcbVirtualDomStore) => {
    //                 const bakedRules = state.pcbLayoutNodes[props.uid]
    //                     ?.bakedRules as IPcbLayoutBakedBaseRotationNodeRules;
    //                 return bakedRules?.rotation;
    //             }),
    //         [props.uid],
    //     ),
    // );

    // const pcbLayoutNodeScale = usePcbVirtualDomStore(
    //     useMemo(
    //         () =>
    //             (state: IPcbVirtualDomStore) => {
    //                 const bakedRules = state.pcbLayoutNodes[props.uid]?.bakedRules as IPcbLayoutBakedBaseScaleNodeRules;
    //                 return bakedRules?.scale;
    //             },
    //         [props.uid],
    //     ),
    // );

    // const pcbLayoutNodeLayer = usePcbVirtualDomStore(
    //     useMemo(
    //         () =>
    //             memoize((state: IPcbVirtualDomStore) => {
    //                 const bakedRules = state.pcbLayoutNodes[props.uid]?.bakedRules as IPcbLayoutBakedBaseLayerNodeRules;
    //                 return bakedRules?.layer;
    //             }),
    //         [props.uid],
    //     ),
    // );

    // const isSubLayout = usePcbVirtualDomStore<boolean>(
    //     useMemo(
    //         () =>
    //             memoize((state: IPcbVirtualDomStore) => {
    //                 const nodeType = state.pcbLayoutNodes[props.uid]?.type;

    //                 if (nodeType === BasePcbLayoutNodeTypes.layout) {
    //                     const bakedRules = state.pcbLayoutNodes[props.uid]
    //                         ?.bakedRules as IPcbLayoutBakedLayoutNodeRules;
    //                     return !!bakedRules?.isSubLayout;
    //                 }

    //                 return false;
    //             }),
    //         [props.uid],
    //     ),
    // );

    const pcbLayoutNodeName = usePcbVirtualDomStore(
        useMemo(() => (state: IPcbVirtualDomStore) => state.pcbLayoutNodes[props.uid]?.name, [props.uid]),
    );

    const pcbLayoutNodeType = usePcbVirtualDomStore(
        useMemo(() => (state: IPcbVirtualDomStore) => state.pcbLayoutNodes[props.uid]?.type, [props.uid]),
    );

    // const isSelectable = useMemo(() => {
    //     return pcbLayoutNodeType !== BasePcbLayoutNodeTypes.container;
    // }, [pcbLayoutNodeType]);

    // const isFrame = useMemo(() => {
    //     return pcbLayoutNodeType === BasePcbLayoutNodeTypes.layout && !isSubLayout;
    // }, [isSubLayout, pcbLayoutNodeType]);

    const positionRef = useRef<Mesh>(null!);
    // const frameTextRef = useRef<any>(null!);

    // const [isDragging, setIsDragging] = useState<boolean>(false);

    // useEffect(() => {
    //     setNodeUidToObject3dIdMap(props.uid, positionRef.current.uuid);

    //     return () => {
    //         removeNodeUidToObject3dIdMap(props.uid);
    //     };
    // }, [props.uid, removeNodeUidToObject3dIdMap, setNodeUidToObject3dIdMap]);

    // const isDragable = useMemo(() => {
    //     return (
    //         editorMode === EditorModes.pcb && !!props.isDragable && store.getState().auth.currentUserHasEditPermission
    //     );
    // }, [editorMode, props.isDragable]);

    // const bind = useGesture(
    //     {
    //         onDragStart: (state) => {
    //             if (state.event.buttons === 1) {
    //                 setDisableCameraControls();
    //                 setIsDragging(true);
    //                 dispatch(selectSubjects([props.uid], store.getState().auth.currentUserHasEditPermission));
    //             }
    //         },
    //         onDrag: ({buttons, delta: [x, y]}) => {
    //             if (buttons === 1) {
    //                 let posX = positionRef.current.position.x + x;
    //                 let posY = positionRef.current.position.y + y;

    //                 posX = PcbLayoutEngine.enforceGridPrecisionInMeters(posX);
    //                 posY = PcbLayoutEngine.enforceGridPrecisionInMeters(posY);

    //                 positionRef.current.position.x = posX;
    //                 positionRef.current.position.y = posY;

    //                 setPosition({
    //                     uid: props.uid,
    //                     payload: {
    //                         x: positionRef.current.position.x,
    //                         y: positionRef.current.position.y,
    //                         z: positionRef.current.position.z,
    //                     },
    //                 });
    //             }
    //         },
    //         onDragEnd: (_state) => {
    //             setEnableCameraControls();

    //             const updatedPosition: IVector3 = {
    //                 x: positionRef.current.position.x,
    //                 y: positionRef.current.position.y,
    //                 z: positionRef.current.position.z,
    //             };

    //             const node = usePcbVirtualDomStore.getState().pcbLayoutNodes[props.uid];

    //             const newPcbLayoutRuleSet = updateNodePositionRules(node, updatedPosition);
    //             setPcbLayoutNodeLayoutRules(node.uid, newPcbLayoutRuleSet);

    //             dispatch(setNodeLayoutRules(node.uid, newPcbLayoutRuleSet));

    //             setIsDragging(false);
    //         },
    //         onAbort: (_state) => {
    //             setEnableCameraControls();
    //             setIsDragging(false);
    //         },
    //     },
    //     {
    //         transform: ([x, y]) => {
    //             const sceneMousePosition = getSceneMousePosition(x, y, gl.domElement, camera);

    //             return [sceneMousePosition.x, sceneMousePosition.y];
    //         },
    //         drag: {
    //             filterTaps: true,
    //             useTouch: true,
    //         },
    //         enabled: cameraMode === CameraMode.two_d && isDragable,
    //     },
    // );

    // const updateNodePositionRules = useCallback((node: IPcbLayoutNode, updatedPosition: IVector3) => {
    //     return produce(node.pcbNodeRuleSet, (draft) => {
    //         if (draft.position) {
    //             delete draft.position;
    //         }

    //         const xPositionValue = PcbLayoutEngine.humanizePositionValue(updatedPosition.x, node.bakedRules?.unit);
    //         const yPositionValue = PcbLayoutEngine.humanizePositionValue(updatedPosition.y, node.bakedRules?.unit);

    //         if (draft.positionX) {
    //             draft.positionX.value = xPositionValue;
    //             draft.positionX.disabled = false;
    //         } else {
    //             draft.positionX = {
    //                 uid: "positionX",
    //                 key: "positionX",
    //                 value: xPositionValue,
    //                 disabled: false,
    //             };
    //         }
    //         if (draft.positionY) {
    //             draft.positionY.value = yPositionValue;
    //             draft.positionY.disabled = false;
    //         } else {
    //             draft.positionY = {
    //                 uid: "positionY",
    //                 key: "positionY",
    //                 value: yPositionValue,
    //                 disabled: false,
    //             };
    //         }
    //     });
    // }, []);

    // const updatePositionDebounced = useDebouncedCallback((position: IVector3) => {
    //     const node = usePcbVirtualDomStore.getState().pcbLayoutNodes[props.uid];

    //     const newPcbLayoutRuleSet = updateNodePositionRules(node, position);

    //     setPcbLayoutNodeLayoutRules(node.uid, newPcbLayoutRuleSet);

    //     dispatch(setNodeLayoutRules(node.uid, newPcbLayoutRuleSet));
    // }, R.behaviors.storage.writeDelaySlow);

    // // Manual force trigger the debouncer when component unmounts or context changes to prevent data loss
    // useEffect(() => {
    //     updatePositionDebounced.flush();

    //     return () => {
    //         updatePositionDebounced.flush();
    //     };
    // }, [updatePositionDebounced]);

    // UseWindowKeyboardEvent("keydown", (event: Event) => {
    //     function updatePosition(updatedPosition: IVector3) {
    //         positionRef.current.position.x = updatedPosition.x;
    //         positionRef.current.position.y = updatedPosition.y;

    //         setPosition({
    //             uid: props.uid,
    //             payload: updatedPosition,
    //         });

    //         updatePositionDebounced(updatedPosition);
    //     }

    //     if (isDragable && isSelected) {
    //         // TODO: probably wanna switch these to imperial when the node is in imperial mode
    //         const majorStep = 0.0001;
    //         const minorStep = 0.00001;

    //         if (HotKeysHelper.isHotkey(R.keyCommands.minor_nudge_left.keys, event as KeyboardEvent)) {
    //             event.preventDefault();

    //             const updatedPosition: IVector3 = {
    //                 x: positionRef.current.position.x - minorStep,
    //                 y: positionRef.current.position.y,
    //                 z: positionRef.current.position.z,
    //             };

    //             updatePosition(updatedPosition);
    //         } else if (HotKeysHelper.isHotkey(R.keyCommands.nudge_left.keys, event as KeyboardEvent)) {
    //             event.preventDefault();

    //             const updatedPosition: IVector3 = {
    //                 x: positionRef.current.position.x - majorStep,
    //                 y: positionRef.current.position.y,
    //                 z: positionRef.current.position.z,
    //             };

    //             updatePosition(updatedPosition);
    //         }

    //         if (HotKeysHelper.isHotkey(R.keyCommands.minor_nudge_right.keys, event as KeyboardEvent)) {
    //             event.preventDefault();

    //             const updatedPosition: IVector3 = {
    //                 x: positionRef.current.position.x + minorStep,
    //                 y: positionRef.current.position.y,
    //                 z: positionRef.current.position.z,
    //             };

    //             updatePosition(updatedPosition);
    //         } else if (HotKeysHelper.isHotkey(R.keyCommands.nudge_right.keys, event as KeyboardEvent)) {
    //             event.preventDefault();

    //             const updatedPosition: IVector3 = {
    //                 x: positionRef.current.position.x + majorStep,
    //                 y: positionRef.current.position.y,
    //                 z: positionRef.current.position.z,
    //             };

    //             updatePosition(updatedPosition);
    //         }

    //         if (HotKeysHelper.isHotkey(R.keyCommands.minor_nudge_up.keys, event as KeyboardEvent)) {
    //             event.preventDefault();

    //             const updatedPosition: IVector3 = {
    //                 x: positionRef.current.position.x,
    //                 y: positionRef.current.position.y + minorStep,
    //                 z: positionRef.current.position.z,
    //             };

    //             updatePosition(updatedPosition);
    //         } else if (HotKeysHelper.isHotkey(R.keyCommands.nudge_up.keys, event as KeyboardEvent)) {
    //             event.preventDefault();

    //             const updatedPosition: IVector3 = {
    //                 x: positionRef.current.position.x,
    //                 y: positionRef.current.position.y + majorStep,
    //                 z: positionRef.current.position.z,
    //             };

    //             updatePosition(updatedPosition);
    //         }

    //         if (HotKeysHelper.isHotkey(R.keyCommands.minor_nudge_down.keys, event as KeyboardEvent)) {
    //             event.preventDefault();

    //             const updatedPosition: IVector3 = {
    //                 x: positionRef.current.position.x,
    //                 y: positionRef.current.position.y - minorStep,
    //                 z: positionRef.current.position.z,
    //             };

    //             updatePosition(updatedPosition);
    //         } else if (HotKeysHelper.isHotkey(R.keyCommands.nudge_down.keys, event as KeyboardEvent)) {
    //             event.preventDefault();

    //             const updatedPosition: IVector3 = {
    //                 x: positionRef.current.position.x,
    //                 y: positionRef.current.position.y - majorStep,
    //                 z: positionRef.current.position.z,
    //             };

    //             updatePosition(updatedPosition);
    //         }
    //     }
    // });

    // useEffect(() => {
    //     // Apply y-rotation from layer orientation first, then add rule-specified rotation,
    //     // because order matters, and it gives incorrect results if the layer orientation is
    //     // applied after the rule-specified rotation.
    //     const isBottom = (layer: string | null) => layer === LayerOrientation.bottom; // If layer is unset, consider it top.
    //     const flipLayer = isBottom(parentLayer) !== isBottom(pcbLayoutNodeLayer);
    //     const baseRotation = new Euler(0, flipLayer ? Math.PI : 0, 0);
    //     positionRef.current.position.z = pcbLayoutNodePosition?.z ?? 0;
    //     positionRef.current.position.z += (parentLayerZPosition - layerZPosition) * (isBottom(parentLayer) ? -1 : 1);
    //     const rotationMatrix = new Matrix4().makeRotationFromEuler(baseRotation);
    //     if (pcbLayoutNodeRotation) {
    //         const specifiedRotation = new Euler(
    //             pcbLayoutNodeRotation.x,
    //             pcbLayoutNodeRotation.y,
    //             pcbLayoutNodeRotation.z,
    //         );
    //         const specifiedRotationMatrix = new Matrix4().makeRotationFromEuler(specifiedRotation);
    //         rotationMatrix.multiply(specifiedRotationMatrix);
    //     }
    //     positionRef.current.rotation.setFromRotationMatrix(rotationMatrix);
    // }, [
    //     pcbLayoutNodePosition,
    //     pcbLayoutNodeRotation,
    //     pcbLayoutNodeLayer,
    //     layerZPosition,
    //     parentLayer,
    //     parentLayerZPosition,
    // ]);

    // useEffect(() => {
    //     if (pcbLayoutNodeScale && positionRef.current) {
    //         positionRef.current.scale.set(pcbLayoutNodeScale.x, pcbLayoutNodeScale.y, pcbLayoutNodeScale.z);
    //     }
    // }, [pcbLayoutNodeScale]);

    useEffect(() => {
            const posX = pcbLayoutNodePosition?.x || 0;
            const posY = pcbLayoutNodePosition?.y || 0;

            positionRef.current.position.x = posX;
            positionRef.current.position.y = posY;

    }, [pcbLayoutNodePosition, props.uid]);

    // useEffect(() => {
    //     if (interactionState.state !== "DEFAULT") {
    //         return;
    //     }
    //     if (hovered && !!props.isDragable) {
    //         gl.domElement.style.cursor = "pointer";
    //     } else {
    //         gl.domElement.style.cursor = "auto";
    //     }
    // }, [gl.domElement.style, hovered, props.isDragable, interactionState]);

    // const selectNode = useCallback(
    //     (event: ThreeEvent<PointerEvent | MouseEvent>) => {
    //         if (!isSelectable) {
    //             return;
    //         }

    //         let selection: string[];

    //         const selectedSubjects = store.getState().document.present?.selectedSubjects || [];

    //         if (event.metaKey || event.ctrlKey) {
    //             if (selectedSubjects.includes(props.uid)) {
    //                 const cloneSelectedSubjects = selectedSubjects.slice();

    //                 const index = cloneSelectedSubjects.indexOf(props.uid);
    //                 if (index > -1) {
    //                     cloneSelectedSubjects.splice(index, 1);
    //                 }

    //                 selection = cloneSelectedSubjects;
    //             } else {
    //                 selection = [props.uid, ...(selectedSubjects || [])];
    //             }
    //         } else {
    //             selection = [props.uid];
    //         }

    //         dispatch(selectSubjects(selection, store.getState().auth.currentUserHasEditPermission));
    //     },
    //     [dispatch, isSelectable, props.uid],
    // );

    // const handleOnFrameTextClick = useCallback(
    //     (event: ThreeEvent<PointerEvent | MouseEvent>) => {
    //         event.stopPropagation();

    //         selectNode(event);
    //     },
    //     [selectNode],
    // );

    // const handleOnFrameClick = useCallback(
    //     (event: ThreeEvent<PointerEvent | MouseEvent>) => {
    //         event.stopPropagation();

    //         dispatch(selectSubjects([], store.getState().auth.currentUserHasEditPermission));
    //     },
    //     [dispatch],
    // );

    // const handleOnClick = useCallback(
    //     (event: ThreeEvent<PointerEvent | MouseEvent>) => {
    //         event.stopPropagation();

    //         selectNode(event);
    //     },
    //     [selectNode],
    // );

    // const onFrameContextMenu = useCallback(
    //     (event: ThreeEvent<MouseEvent>) => {
    //         if (event.object.name === pcbLayoutNodeName) {
    //             event.stopPropagation();
    //             dispatch(selectSubjects([props.uid], store.getState().auth.currentUserHasEditPermission));
    //             setContextMenu("pcb", {x: event.clientX, y: event.clientY});
    //         }
    //     },
    //     [dispatch, pcbLayoutNodeName, props.uid, setContextMenu],
    // );

    // const onContextMenu = useCallback(
    //     (event: ThreeEvent<MouseEvent>) => {
    //         event.stopPropagation();
    //         dispatch(selectSubjects([props.uid], store.getState().auth.currentUserHasEditPermission));
    //         setContextMenu("pcb", {x: event.clientX, y: event.clientY});
    //     },
    //     [dispatch, props.uid, setContextMenu],
    // );

    // const handlePointerOver = useCallback(
    //     (event: ThreeEvent<PointerEvent>) => {
    //         if (!isSelectable) {
    //             return;
    //         }
    //         event.stopPropagation();
    //         setHoveredNodeUid(props.uid);
    //     },
    //     [isSelectable],
    // );

    // const handlePointerOut = useCallback(
    //     (event: ThreeEvent<PointerEvent>) => {
    //         if (!isSelectable) {
    //             return;
    //         }
    //         event.stopPropagation();
    //         setHoveredNodeUid(null);
    //     },
    //     [isSelectable],
    // );

    // const outlineThickness = useMemo(() => {
    //     if (!isSelectable) {
    //         return;
    //     }

    //     if (isSelected) {
    //         return 2;
    //     }

    //     if (hovered) {
    //         return 4;
    //     }
    // }, [hovered, isSelectable, isSelected]);

    // const outlineColor = useMemo(() => {
    //     if (!isSelectable) {
    //         return;
    //     }

    //     if (isSelected) {
    //         return R.colors.highlighted;
    //     }

    //     if (hovered) {
    //         return R.colors.hovered;
    //     }
    // }, [hovered, isSelectable, isSelected]);

    // // TODO: find out why textPosition doesn't get intialised properly
    // const [textPosition, setTextPosition] = useState<number[]>([0, 0, 0]);

    // const contentContainerRef = useRef<Group>(null!);

    // useEffect(() => {
    //     if (contentContainerRef.current && isFrame) {
    //         const bbox = new Box3().setFromObject(contentContainerRef.current);

    //         if (!bbox.isEmpty()) {
    //             const size = new Vector3();
    //             bbox.getSize(size);

    //             if (size) {
    //                 if (flipCameraState) {
    //                     setTextPosition([size.x / 2, size.y / 2, 0]);
    //                 } else {
    //                     setTextPosition([-size.x / 2, size.y / 2, 0]);
    //                 }
    //             }
    //         }
    //     }
    // }, [isFrame, flipCameraState]);

    // useHelper<typeof FluxBoxHelper | undefined>(
    //     !isFrame ? positionRef : contentContainerRef,
    //     outlineColor ? FluxBoxHelper : undefined,
    //     outlineThickness, // line width
    //     outlineColor, // line color
    // );

    // useFrame(() => {
    //     if (frameTextRef.current && cameraMode === CameraMode.two_d) {
    //         frameTextRef.current.fontSize = getFrameFontSize(camera.zoom);
    //     }
    // });

        return (
            <group
                // {...(bind() as any)}
                userData={{id: props.uid}}
                ref={positionRef}
                // onPointerOver={handlePointerOver}
                // onPointerOut={handlePointerOut}
                // onClick={handleOnClick}
                // onContextMenu={onContextMenu}
                name={pcbLayoutNodeType}
            >
                {props.children}
            </group>
        );
}

export default React.memo(PcbLayoutBaseNode);
