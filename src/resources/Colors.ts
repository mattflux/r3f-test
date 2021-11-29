const colors = {
    foreground: "#FFFFFF",
    highlighted: "#1DFDC0",
    unselectedWire: "#01b2fd",
    hovered: "#9DFEDA",
    alignmentGuide: "#FF4081",
    debug: "green",
    canvas: {
        background: "#100F0F",
        pcb: {
            grid: {
                gridLine: "#875e75",
                gridCenterLine: "#0a0987",
            },
            via: {
                outline: "#BDBDBD",
            },
            layout: {
                layoutOutline: "#39B54A",
                layoutFill: "#000000",
                layoutDrillHoles: "#39B54A",
                gridLine: "#FFFFFF",
                // Colors as per https://coda.io/d/PCB-Canvas-UI_d9K6txxtr-Z/Layer-Color-Spec_suge_#_lulDm
                stackupLayerColors: {
                    meta: "#FFFFFF",
                    topOverlay: "#00FFFF",
                    topSolderPaste: "#E39CE5",
                    topSolderMask: "#1DBC6C",
                    topCopper: "#FF0000",
                    midLayer1: "#FFCE00",
                    midLayer2: "#00BDFF",
                    midLayer3: "#00FF00",
                    midLayer4: "#E600FF",
                    midLayer5: "#FFFF00",
                    midLayer6: "#00FC83",
                    midLayer7: "#ED1E79",
                    midLayer8: "#00DBFF",
                    midLayer9: "#FF6D00",
                    midLayer10: "#5E13D3",
                    midLayer11: "#46BC8F",
                    midLayer12: "#BF1D5F",
                    midLayer13: "#FF9700",
                    midLayer14: "#4AC6BA",
                    bottomCopper: "#3939FF",
                    bottomSolderMask: "#90F490",
                    bottomSolderPaste: "#F7A28B",
                    bottomOverlay: "#FF00FF",
                },
            },
        },
    },
    code: {
        background: "#1E1E1E",
    },
    grid: {
        foreground: "#2C2C2C",
    },
    routes: {
        foreground: "#D1D1D1",
    },
    plots: {
        connectorLine: "#2E2E2E",
    },
    elements: {
        foreground: "#D1D1D1",
        background: "#484646",
        labels: {
            foreground: "#7F7D7D",
            highlighted: "#1DFDC0",
            opacity: 1,
            lightOpacity: 1,
        },
        terminals: {
            hoverLabels: "#D1D1D1",
            opacity: 1,
            labelBackgroundColor: "#7F7D7D",
        },
        branchPoint: {
            unconnected: "#FF262B",
        },
        pcb: {
            model: {
                gold: {
                    color: "#edbe51",
                    originColors: ["#f2d63c", "#ff9f37"],
                },
                pcbGreen: {
                    color: "#3a873d",
                    originColors: ["#036003"],
                },
                glossyPlastic: {
                    color: "#919191",
                    originColors: ["#010202"],
                },
                mattePlastic: {
                    color: "#464646",
                    originColors: ["#003700", "#6e6550", "#2d2d2d"],
                },
                matteCeramic: {
                    color: undefined,
                    originColors: ["#003700"],
                },
                matteAluminium: {
                    color: undefined,
                    originColors: ["#969696"],
                },
                rubber: {
                    color: "#808080",
                    originColors: ["#161513"],
                },
                translucentWhitePlastic: {
                    color: undefined,
                    originColors: ["#cccccc"],
                },
                darkGreen: {
                    color: "#002001",
                    originColors: ["#04350f"],
                },
                tin: {
                    color: undefined,
                    originColors: ["#9eaaba", "#a4a291"],
                },
                copper: {
                    color: undefined,
                    originColors: ["#604619"],
                },
                chrome: {
                    color: "#ffffff",
                    originColors: ["#8b949e"],
                },
                glossyCeramic: {
                    color: undefined,
                    originColors: ["#89652c"],
                },
            },
        },
    },
    styledInputBase: {
        background: "#1D1E1E",
        border: "#171717",
    },
    changeHistoryBrowser: {
        listItem: {
            background: "#303030",
            active: "#202122",
        },
    },
    userPresence: {
        userColors: [
            {color: "#0011FF"},
            {color: "#00B2FF"},
            {color: "#07015D"},
            {color: "#264653"},
            {color: "#467A9C"},
            {color: "#678EFE"},
            {color: "#6A0B13"},
            {color: "#8E5E4A"},
            {color: "#9D1114"},
            {color: "#A448B7"},
            {color: "#CEAD61"},
            {color: "#CF8896"},
            {color: "#E77357"},
            {color: "#E94842"},
            {color: "#EB385B"},
            {color: "#F25FB5"},
            {color: "#F4A467"},
            {color: "#F78324"},
            {color: "#FB2C8D"},
            {color: "#FF1F7C"},
            {color: "#FFC030"},
            {color: "#00C29A"},
            {color: "#00DF8E"},
            {color: "#25D0BA"},
            {color: "#2DC3B5"},
            {color: "#2E9F93"},
            {color: "#81B29B"},
        ],
    },
};

export default colors;
