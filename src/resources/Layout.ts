const layout = {
    canvas: {
        top: 65,
    },
    grid: {
        size: 100000,
        divisions: 6500,
    },
    terminals: {
        segments: 22,
        radius: 2,
        clickTargetRadius: 3,
        routeDistanceInRadius: 3,
        upsideDownMargin: 1.5,
        autoConvertOverlapPreventionMargin: 20,
    },
    modules: {
        pinLength: 5,
        pin_margin_top: 5,
        pin_margin_bottom: 5,
        pin_to_pin_margin: 10,
        min_object_width: 60,
        min_object_height: 30,
        terminalLabelMarginX: 5,
        terminalLabelMarginY: 0,
        segments: 0,
    },
    elements: {
        framePadding: 10,
        nameLabelHeight: 5,
        nameLabelVerticalOffset: 8,
        labelBottomMargin: 5,
        labelFontSize: 10,
        maxLabelCharacters: 15,
    },
    presence: {
        maxLabelCharacters: 20,
        scale: 0.8,
    },
    routes: {
        route_width: 9,
        route_width_factor: 1.055,
        clickTargetWidth: 4,
    },
    z_order: {
        grid: -1,
        default: 1,
        route: 2,
        element: 3,
        element_label: 4,
        terminal: 1,
        terminal_label: 5,
        dragging_subject: 5,
        presence: 11,
        commentThreadPin: 9,
        dragging_comment_thread_pin: 10,
        focused_comment_thread_pin: 10,
        branch_point: 3,
        alignment_guide: 11,
    },
    labels: {
        font_face: {
            regular: "/fonts/roboto-v20-latin-ext_latin_greek-ext_greek-regular.woff",
            bold: "/fonts/roboto-v20-latin-ext_latin_greek-ext_greek-700.woff",
        },
        font_size: 6,
    },
    code_editor: {
        font_size: 16,
    },
    timeline: {
        height: 20,
        width: 20,
        padding: 2,
        offset: 15,
    },
    plots: {
        movingWindowLength: 30,
        xAxisSvgWidth: 6,
        xAxisWidth: 4,
        svgWidth: 36,
        svgHeight: 12,
    },
    error_pins: {
        outerRingRadius: 1.5,
        outerRingWidth: 0.5,
        innerRingRadius: 0.75,
        innerRingWidth: 0.75,
        innerRedRingRadius: 0.75,
    },
};

export default layout;
