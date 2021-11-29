const behaviors = {
    camera: {
        pcb: {
            two_d: {
                frustrum: {
                    near: 0.001,
                    far: 100000,
                },
            },
            three_d: {
                frustrum: {
                    near: 0.001,
                    far: 100000,
                },
            },
        },
        schematic: {
            frustrum: {
                near: 0,
                far: 15,
            },
        },
        default_state: {
            two_d: {
                zoom: 50_000,
                offset: {x: 0, y: 0, z: 0},
                position: {x: 0, y: 0, z: 1},
                target: {x: 0, y: 0, z: 0},
                rotation: {azimuth: 0, polar: 0},
            },
            three_d: {
                zoom: 1,
                offset: {x: 0, y: 0, z: 0},
                position: {x: 0, y: 0, z: 0.1},
                target: {x: 0, y: 0, z: 0},
                rotation: {azimuth: 0, polar: 0},
            },
        },
    },
    navigation_controls: {
        damping_factor: 0.25,
        key_pan_speed: 15,
        panning_speed: 1000, // lower is faster
        pcb_key_pan_speed: 0.0025,
    },
    load: {
        maximum_retry: 1,
        reload_delay: 3000,
        reload_delay_fast_in_ms: 1000,
        retry_wait_time_in_ms_max: 10000,
        retry_wait_time_in_ms_min: 1000,
        backoff_wait_time_per_try_in_ms: 3000,
    },
    zoom_controls: {
        pcb_dolly: {
            min: 0.004,
            max: 0.6,
            step: 0.3,
        },
        pcb_zoom: {
            min: 1,
            max: 300_000,
            step: 0.1,
        },
        pcbMinZoom: 1,
        pcbMaxZoom: 2000_000,
        pcbZoomSpeed: 1 / 100,
        minZoom: 0.01,
        maxZoom: 12,
        minZoomBleed: 0.1,
        default_zoom: 2.5,
        navigation_threshold: 0.030000000000000672,
        manual_zoom_step: 0.3,
        zoomToFitPadding: 0.4,
        writeDelay: 3000,
        zoomSpeed: 1 / 48,
    },
    select_controls: {
        raycaster_line_precision: 5,
    },
    subjects: {
        labels: {},
    },
    action_panel: {
        duplicate: {
            spacing: 150,
        },
    },
    inspector: {
        outputs_panel: {
            metrics_update_rate: 100,
        },
    },
    storage: {
        writeDelayFast: 300,
        writeDelay: 1000,
        writeDelaySlow: 2000,
        writeMaxWait: 3000,
        actionRecords: {
            limit: 50,
        },
        userPresence: {
            writeDelay: 60000,
        },
    },
    diagram_editor: {
        default_metamodule_scale: 0.4,
        terminal_visibility_after_edit: 10000,
        glb_loader: {
            geometry_reducer: {
                threshold: 1000,
                reduction_factor: 0.7, // higher is more aggressive
            },
        },
        metamodule_snap_size: 10,
        max_metamodule_zoom_level: 3,
        windowResizeDebounceDelay: 1000 / 60,
        versionHistory: {
            displayShaLengthInDigits: 8,
        },
        snappingMultiplier: 1,
        snappingOffset: 6,
        snappingDefaultThreshold: 0.5,
        writeDelay: 200,
    },
    pcb_editor: {
        gridPositionInMetersDecimals: 7, // since scene is in meters this allows for precision up to 0.0635mm (0.0000635m).
        gridPositionInMmDecimals: 4, // same as gridPositionInMetersDecimals but for mm inputs
        unfocussed_layer_opacity: 0.2,
    },
    code_editor: {
        writeMaxWait: 3000,
    },
    profile: {
        recentWindowInMinutes: 4320,
        nowWindowInMinutes: 5,
    },
    realtime_networking: {
        bufferExpirationTimeInMS: 2000,
        networkFlushBufferRateInMS: 200,
        networkClientUpdateRateInMs: 1000 / 60,
        minBufferSize: 2,
        maxBufferSize: 80,
        hideCursorAfterMS: 3 * 60 * 1000,
        recentWindowInMinutes: 5,
    },
    dragging: {
        snapSensitivity: 3,
        gridPrecision: 1,
    },
    simulator: {
        loopInterval: 0.5,
        throttleUIStateInterval: 1000,
        throttleSliderControlMax: 300,
        throttleSliderControlDefault: 2,
    },
};

export default behaviors;
