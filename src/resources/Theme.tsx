import R from "./Namespace";

const grey = {} as any;

// NOTE: Light mode has never been tested. It is here for future compatibility.
export function getThemeConfig(prefersDarkMode: boolean): any {
    if (prefersDarkMode) {
        const paper = "#2E2E2E";
        return {
            // see https://material-ui.com/customization/palette/
            palette: {
                type: "dark",
                // see https://www.figma.com/file/ddlwY6dkQdcNhVTEc7R7GV/%E2%9D%87%EF%B8%8F-Flux-Design-System?node-id=0%3A7243
                text: {
                    disabled: "rgba(255, 255, 255, 0.38)",
                    hint: "rgba(255, 255, 255, 0.38)",
                    primary: "#FFFFFF",
                    secondary: "#A3A3A3",
                },

                primary: {
                    contrastText: "#000000",
                    dark: "#00C990",
                    light: "#9DFEDA",
                    main: "#1DFDC0",
                    background: "rgb(31 144 112 / 8%)",
                    border: "rgb(31 144 112 / 50%)",
                },

                secondary: {
                    contrastText: "#000000",
                    dark: "#0083CB",
                    light: "#69E4FF",
                    main: "#00B2FF",
                },

                success: {
                    contrastText: "#FFFFFF",
                    dark: "#3B873E",
                    light: "#7BC67E",
                    main: "#4CAF50",
                },

                info: {
                    contrastText: "#FFFFFF",
                    dark: "#0B79D0",
                    light: "#64B6F7",
                    main: "#2196F3",
                },

                warning: {
                    contrastText: "rgba(0, 0, 0, 0.87)",
                    dark: "#C77700",
                    light: "#FFB547",
                    main: "#FF9800",
                },

                error: {
                    contrastText: "#FFFFFF",
                    dark: "#E31B0C",
                    light: "#F88078",
                    main: "#F44336",
                },

                background: {
                    paper,
                    canvas: "#100F0F",
                    neutralBackground: "rgba(255, 255, 255, 0.08)",
                    // QUESTION: "default" is previous to design system update... do we still need it?
                    default: "#202122",
                },
                divider: "#191B1B",
            },
            typography: {
                fontFamily: [R.fonts.primary, "sans-serif"].join(","),
            },

            overrides: {
                MuiCssBaseline: {
                    // TODO: upgrade with v5 of Material-UI that will have this build in. Details: https://next.material-ui.com/components/css-baseline/#scrollbars
                    "@global": {
                        body: {
                            scrollbarColor: grey["600"] + " " + paper,
                            "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
                                backgroundColor: paper,
                            },
                            "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
                                borderRadius: 8,
                                backgroundColor: grey["600"],
                                minHeight: 24,
                                border: "3px solid " + paper,
                            },
                            "&::-webkit-scrollbar-thumb:focus, & *::-webkit-scrollbar-thumb:focus": {
                                backgroundColor: grey["500"],
                            },
                            "&::-webkit-scrollbar-thumb:active, & *::-webkit-scrollbar-thumb:active": {
                                backgroundColor: grey["500"],
                            },
                            "&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover": {
                                backgroundColor: grey["600"] + " " + paper,
                            },
                            "&::-webkit-scrollbar-corner, & *::-webkit-scrollbar-corner": {
                                backgroundColor: paper,
                            },
                            // See https://stackoverflow.com/a/64267916/200312
                            '& input[type="search"]::-webkit-search-cancel-button': {
                                "-webkit-appearance": "none",
                            },
                        },
                    },
                },
            },
            zIndex: {
                modal: 10000,
            },
        };
    } else {
        return {
            palette: {
                type: "light",
            },
            typography: {
                fontFamily: [R.fonts.primary, "sans-serif"].join(","),
            },
        };
    }
}
