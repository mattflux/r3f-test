export enum Platform {
    mac,
    nonMac,
    windows,
    nonWindows,
    linux,
    nonLinux,
    iOS,
    nonIOS,
    android,
    nonAndroid,
}

export interface IKeyCommand {
    section?: string;
    description: string;
    key_name?: string | IAdvancedKeyName[];
    keys: IAdvancedKeyCommand[] | string[] | string;
}

export interface IAdvancedKeyCommand {
    platform: Platform;
    key: string;
}

export interface IAdvancedKeyName {
    platform: Platform;
    name: string;
}

const keyCommands = {
    open_hotkey_viewer: {
        section: "General",
        description: "Open Keyboard shortcut viewer",
        keys: [
            {key: "meta+h", platform: Platform.mac} as IAdvancedKeyCommand,
            {key: "ctrl+h", platform: Platform.nonMac} as IAdvancedKeyCommand,
        ],
    } as IKeyCommand,
    browser_zoom_in: {
        section: "General",
        description: "Browser Zoom In",
        key_name: "CTRL + \\+",
        keys: [
            {key: "ctrl+=", platform: Platform.nonMac},
            {key: "meta+=", platform: Platform.mac},
        ],
    },
    browser_zoom_out: {
        section: "General",
        description: "Browser Zoom Out",
        key_name: "CTRL + -",
        keys: [
            {key: "ctrl+-", platform: Platform.nonMac},
            {key: "meta+-", platform: Platform.mac},
        ],
    },
    navigate_left: {
        section: "Navigation",
        description: "Navigate left",
        keys: ["left"],
    },
    navigate_up: {
        section: "Navigation",
        description: "Navigate up",
        keys: ["up"],
    },
    navigate_right: {
        section: "Navigation",
        description: "Navigate right",
        keys: ["right"],
    },
    navigate_down: {
        section: "Navigation",
        description: "Navigate down",
        keys: ["down"],
    },
    zoom_in: {
        section: "Navigation",
        description: "Zoom in",
        key_name: "\\+",
        keys: ["Equal", "NumpadAdd"],
    },
    zoom_out: {
        section: "Navigation",
        description: "Zoom out",
        key_name: "-",
        keys: ["Minus", "NumpadSubtract"],
    },
    zoomToFit: {
        section: "Navigation",
        description: "Zoom to fit entire circuit or selected subjects",
        key_name: "\\",
        keys: ["Backslash"],
    },
    store_viewport_position: {
        section: "Navigation",
        description: "Assign current viewport position to hotkey",
        key_name: [
            {name: "CTRL + 6 - 9", platform: Platform.mac},
            {name: "ALT + 6 - 9", platform: Platform.nonMac},
        ],
        keys: ["ctrl+6", "ctrl+7", "ctrl+8", "ctrl+9"],
    },
    recall_viewport_position: {
        section: "Navigation",
        description: "Recall viewport position from hotkey",
        key_name: "5 - 9",
        keys: ["6", "7", "8", "9"],
    },
    select_all: {
        section: "Selection",
        description: "Select all subjects on canvas",
        keys: [
            {key: "ctrl+a", platform: Platform.nonMac},
            {key: "meta+a", platform: Platform.mac},
        ],
    },
    unselect_all: {
        section: "Selection",
        description: "Unselect selected subjects",
        keys: [
            {key: "ctrl+shift+a", platform: Platform.nonMac},
            {key: "meta+shift+a", platform: Platform.mac},
        ],
    },
    delete: {
        section: "Subject Actions",
        description: "Delete selected subjects",
        keys: ["Backspace", "Delete"],
    },
    copy: {
        section: "Subject Actions",
        description: "Copy selected subjects",
        keys: [
            {key: "ctrl+c", platform: Platform.nonMac},
            {key: "meta+c", platform: Platform.mac},
        ],
    },
    cut: {
        section: "Subject Actions",
        description: "Cut selected subjects",
        keys: [
            {key: "ctrl+x", platform: Platform.nonMac},
            {key: "meta+x", platform: Platform.mac},
        ],
    },
    paste: {
        section: "Subject Actions",
        description: "Paste subjects",
        keys: [
            {key: "ctrl+v", platform: Platform.nonMac},
            {key: "meta+v", platform: Platform.mac},
        ],
    },
    nudge_left: {
        section: "Subject Actions",
        description: "Nudge selected element major step left",
        keys: ["arrowleft"],
    },
    nudge_up: {
        section: "Subject Actions",
        description: "Nudge selected element major step up",
        keys: ["arrowup"],
    },
    nudge_right: {
        section: "Subject Actions",
        description: "Nudge selected element major step right",
        keys: ["arrowright"],
    },
    nudge_down: {
        section: "Subject Actions",
        description: "Nudge selected element major step down",
        keys: ["arrowdown"],
    },
    minor_nudge_left: {
        section: "Subject Actions",
        description: "Nudge selected element minor step left",
        keys: ["shift+arrowleft"],
    },
    minor_nudge_up: {
        section: "Subject Actions",
        description: "Nudge selected element minor step up",
        keys: ["shift+arrowup"],
    },
    minor_nudge_right: {
        section: "Subject Actions",
        description: "Nudge selected element minor step right",
        keys: ["shift+arrowright"],
    },
    minor_nudge_down: {
        section: "Subject Actions",
        description: "Nudge selected element minor step down",
        keys: ["shift+arrowdown"],
    },
    rotate_clockwise: {
        section: "Subject Actions",
        description: "Rotate selected subjects clockwise around common axis",
        keys: [
            {key: "ctrl+]", platform: Platform.nonMac},
            {key: "meta+]", platform: Platform.mac},
        ],
    },
    rotate_counter_clockwise: {
        section: "Subject Actions",
        description: "Rotate selected subjects counter clockwise around common axis",
        keys: [
            {key: "ctrl+[", platform: Platform.nonMac},
            {key: "meta+[", platform: Platform.mac},
        ],
    },
    rotate_clockwise_individually: {
        section: "Subject Actions",
        description: "Rotate selected subjects clockwise around each individual axis",
        keys: [
            {key: "]", platform: Platform.nonMac},
            {key: "]", platform: Platform.mac},
        ],
    },
    rotate_counter_clockwise_individually: {
        section: "Subject Actions",
        description: "Rotate selected subjects counter clockwise around each individual axis",
        keys: [
            {key: "[", platform: Platform.nonMac},
            {key: "[", platform: Platform.mac},
        ],
    },
    flip: {
        section: "Subject Actions",
        description: "Flip selected subjects horizontally around common axis",
        keys: [
            {key: "ctrl+'", platform: Platform.nonMac},
            {key: "meta+'", platform: Platform.mac},
        ],
    },
    flip_individually: {
        section: "Subject Actions",
        description: "Flip selected subjects horizontally around each individual axis",
        keys: [
            {key: "'", platform: Platform.nonMac},
            {key: "'", platform: Platform.mac},
        ],
    },
    flip_route: {
        section: "Subject Actions",
        description: "Flip the 'L' shape of projected routes",
        keys: ["f"],
    },
    convert_to_part: {
        section: "Subject Actions",
        description: "Convert selected subjects into new part",
        keys: [
            {key: "ctrl+p", platform: Platform.nonMac},
            {key: "meta+p", platform: Platform.mac},
        ],
    },
    edit_part: {
        section: "Subject Actions",
        description: "Edit selected element part",
        keys: [
            {key: "ctrl+e", platform: Platform.nonMac},
            {key: "meta+e", platform: Platform.mac},
        ],
    },
    align_elements: {
        section: "Subject Actions",
        description: "Automatically align selected elements across common axis",
        keys: [
            {key: "ctrl+i", platform: Platform.nonMac},
            {key: "meta+i", platform: Platform.mac},
        ],
    },
    space_elements: {
        section: "Subject Actions",
        description: "Automatically space selected elements evenly.",
        keys: [
            {key: "ctrl+o", platform: Platform.nonMac},
            {key: "meta+o", platform: Platform.mac},
        ],
    },
    store_part_hotkey: {
        section: "Subject Actions",
        description: "Assign currently selected part to hotkey",
        key_name: [
            {name: "CTRL + 1 - 5", platform: Platform.mac},
            {name: "ALT + 1 - 5", platform: Platform.nonMac},
        ],
        keys: [
            {key: "ctrl+1", platform: Platform.mac},
            {key: "ctrl+2", platform: Platform.mac},
            {key: "ctrl+3", platform: Platform.mac},
            {key: "ctrl+4", platform: Platform.mac},
            {key: "ctrl+5", platform: Platform.mac},
            {key: "alt+1", platform: Platform.nonMac},
            {key: "alt+2", platform: Platform.nonMac},
            {key: "alt+3", platform: Platform.nonMac},
            {key: "alt+4", platform: Platform.nonMac},
            {key: "alt+5", platform: Platform.nonMac},
        ],
    },
    insert_part_hotkey: {
        section: "Subject Actions",
        description: "Insert part from hotkey",
        key_name: "1 - 5",
        keys: ["1", "2", "3", "4", "5"],
    },
    search: {
        section: "Part Browser",
        description: "Find Part",
        keys: [
            {key: "ctrl+f", platform: Platform.nonMac},
            {key: "meta+f", platform: Platform.mac},
        ],
    },
    cancel: {
        section: "Subject Actions",
        description: "Cancel current action",
        keys: ["Escape"],
    },
    rename_subject: {
        section: "Subject Actions",
        description: "Rename selected subject",
        keys: ["ctrl+r"],
    },
    new_document: {
        section: "Document Actions",
        description: "Create new Document",
        keys: ["ctrl+n"],
    },
    clone_document: {
        section: "Document Actions",
        description: "Clone current Document",
        keys: ["ctrl+d"],
    },
    redo: {
        section: "General",
        description: "Redo",
        keys: [
            {key: "ctrl+shift+z", platform: Platform.nonMac},
            {key: "meta+shift+z", platform: Platform.mac},
        ],
    },
    undo: {
        section: "General",
        description: "Undo",
        keys: [
            {key: "ctrl+z", platform: Platform.nonMac},
            {key: "meta+z", platform: Platform.mac},
        ],
    },
    solve_routing: {
        section: "Subject Actions",
        description: "Auto connect selected Elements",
        keys: [
            {key: "ctrl+s", platform: Platform.nonMac},
            {key: "meta+s", platform: Platform.mac},
        ],
    },
    revertDocumentVersion: {
        section: "Document Actions",
        description: "Revert Document Version",
        keys: [
            {key: "ctrl+shift+r", platform: Platform.nonMac},
            {key: "meta+shift+r", platform: Platform.mac},
        ],
    },
    insert_comment: {
        section: "General",
        description: "Insert Comment",
        keys: [
            {key: "ctrl+g", platform: Platform.nonMac},
            {key: "meta+g", platform: Platform.mac},
        ],
    },
    close_comment_thread_view: {
        section: "General",
        description: "Close Comments",
        keys: ["escape"],
    },
};

export default keyCommands;
