import React from "react";
import AbstractLayoutView from "../AbstractLayoutView";
import {IPcbLayoutBaseNodeProps} from "../PcbLayoutNodeTreeGenerator";
import PhysicalLayoutView from "../PhysicalLayoutView";
import {usePcbEditorUiStore} from "../Scene";


export default function Layout(props: IPcbLayoutBaseNodeProps) {
    const cameraMode = usePcbEditorUiStore((state) => state.cameraMode);
    const is3D = cameraMode === "3d";
    return (
        <group>
            {props.children}
            <group name={"layout"}>
                {is3D ? (
                    <PhysicalLayoutView uid={"layout"} />
                ) : (
                    <AbstractLayoutView uid={"layout"} />
                )}
            </group>
        </group>
    );
}
