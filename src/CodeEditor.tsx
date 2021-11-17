import React, { useEffect, useState } from "react";
import MonacoEditor from "react-monaco-editor";
// eslint-disable-next-line import/no-webpack-loader-syntax
import SimElementWorker from "comlink-loader!./Element";
import create from "zustand";
import {proxy} from "comlink";


export const useStore = create<{
    message: string;
    setMessage: (m: string) => void;
}>((set) => ({
    message: "",
    setMessage: (m: string) => set((state) => ({ message: m })),
}));

const ElementWorkerInstance = new SimElementWorker();



export default function CodeEditor() {
    const [code, setCode] = useState("");
    const message = useStore(state => state.message);

    useEffect(() => {
        async function run() {
            const setMessage = (message: string) => {
                useStore.setState({ message });
                console.log("message", message);
            };
            const element = await new ElementWorkerInstance.Element(proxy(setMessage));
            try {
                element.runCode(code);
            } catch (e) {
                console.log("caught in use effect", e);
            }
        }
        run();
    }, [code]);

    return (
        <div style={{ display: "flex", height: "100vh" }}>
            <MonacoEditor
                language="typescript"
                theme="vs-dark"
                options={{
                    readOnly: false,
                    lineDecorationsWidth: 16,
                    lineNumbers: "on",
                    lineNumbersMinChars: 3,
                    wordWrap: "off", // off | on | bounded | wordWrapColumn
                    wrappingIndent: "same", // none | same | indent | deepIndent
                    scrollBeyondLastLine: false,
                    scrollBeyondLastColumn: 2,
                    smoothScrolling: true, // animate scrolling to a position
                    useTabStops: true,
                    showUnused: true, // fade out unused variables
                    folding: false, // must be off since July 2020 (messes with hidden wrapper)
                    cursorBlinking: "smooth", // solid | blink | smooth | phase
                    renderLineHighlight: "none",
                    renderWhitespace: "selection", // none | boundary | selection | all (default: none)
                    renderControlCharacters: false,
                    dragAndDrop: true,
                    links: false,

                    // disable code lens, which is not well documented, but a way to add stuff inline.
                    codeLens: false,

                    // not sure what this is, but we probably don't need it
                    lightbulb: { enabled: false },

                    quickSuggestions: true,
                    quickSuggestionsDelay: 800, // ms
                    acceptSuggestionOnEnter: "smart",
                    suggestSelection: "recentlyUsedByPrefix", // first | recentlyUsed | recentlyUsedByPrefix

                    tabCompletion: "on",
                    hover: {
                        enabled: true, // Defaults to true.

                        // Delay for showing the hover.
                        delay: 1000,

                        // Is the hover sticky such that it can be clicked and its contents selected?
                        // sticky?: boolean; // Defaults to true.
                    },
                    suggest: {
                        // Enable graceful matching. Defaults to true.
                        // filterGraceful?: boolean;

                        // Prevent quick suggestions when a snippet is active. Defaults to true.
                        // snippetsPreventQuickSuggestions?: boolean;

                        // Favours words that appear close to the cursor.
                        localityBonus: true,

                        // Enable using global storage for remembering suggestions.
                        shareSuggestSelections: true,

                        // Enable or disable icons in suggestions. Defaults to true.
                        // showIcons: false,

                        // Max suggestions to show in suggestions. Defaults to 12.
                        // maxVisibleSuggestions: 9,

                        // Names of suggestion types to filter.
                        // filteredTypes?: Record<string, boolean>;

                        // hideStatusBar: false,
                    },
                    scrollbar: {
                        useShadows: false,
                        verticalScrollbarSize: 9,
                        verticalSliderSize: 5,
                        horizontalScrollbarSize: 9,
                        horizontalSliderSize: 5,
                    },
                    minimap: {
                        enabled: true,
                    },
                }}
                value={code}
                onChange={(value) => {
                    setCode(value);
                }}
            />
            <p style={{flexBasis: "50%"}}>{`Output: ${message}`}</p>
        </div>
    );
}
