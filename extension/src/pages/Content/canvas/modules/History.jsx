import { fabric } from "fabric";

// Undo and redo functionality for Fabric.js
const undoCanvas = (toolSettings, setToolSettings, [historyLogs, setHistoryLogs]) => {
    if (!toolSettings.canvas) return;
    const canvas = toolSettings.canvas;
    if (toolSettings.undoStack.length > 0) {
        const undoStack = [...toolSettings.undoStack];
        const redoStack = [...toolSettings.redoStack];
        const lastItem = undoStack.pop();
        redoStack.push(lastItem);
        // penultimate item is the last item before the last item
        const penultimateItem = undoStack[undoStack.length - 1];
        canvas.clear();
        canvas.renderAll();
        canvas.loadFromJSON(penultimateItem, () => {
            // De-select everything
            canvas.discardActiveObject();
            canvas.renderAll();
        });
        setToolSettings({
            ...toolSettings,
            undoStack,
            redoStack,
        });

        // History Logs
        setHistoryLogs([...historyLogs, { type: "undo", timestamp: Date.now(), data: null }]);
    }
};

const redoCanvas = (toolSettings, setToolSettings, [historyLogs, setHistoryLogs]) => {
    if (!toolSettings.canvas) return;
    const canvas = toolSettings.canvas;
    if (toolSettings.redoStack.length > 0) {
        const undoStack = [...toolSettings.undoStack];
        const redoStack = [...toolSettings.redoStack];
        const lastItem = redoStack.pop();
        undoStack.push(lastItem);
        canvas.loadFromJSON(lastItem, () => {
            // De-select everything
            canvas.discardActiveObject();
            canvas.renderAll();
        });
        setToolSettings({
            ...toolSettings,
            undoStack,
            redoStack,
        });

        // History Logs
        setHistoryLogs([...historyLogs, { type: "redo", timestamp: Date.now(), data: null }]);
    }
};

const saveCanvas = (toolSettings, setToolSettings, [historyLogs, setHistoryLogs]) => {
    if (!toolSettings.canvas) return;
    const canvas = toolSettings.canvas;

    let json = canvas.toJSON([
        "id",
        "selectable",
        "evented",
        "hasControls",
        "hasBorders",
        "hasRotatingPoint",
        "subTargetCheck",
        "originX",
        "originY",
        "perPixelTargetFind",
        "skipAutoWidthAdjustment",
    ]);

    const jsonString = JSON.stringify(json);
    const undoStack = [...toolSettings.undoStack, jsonString];
    setToolSettings({
        ...toolSettings,
        undoStack,
        redoStack: [],
    });

    // History Logs
    setHistoryLogs([...historyLogs, { type: "save", timestamp: Date.now(), data: json }]);
};

const checkChanges = (canvas, toolSettings, setToolSettings, historyState) => {
    // Check when objects are modified (after action is completed) to save the canvas

    const onChange = (e) => {
        saveCanvas(toolSettings, setToolSettings, historyState);
    };

    canvas.on("object:modified", onChange);

    return {
        removeEventListeners: function () {
            canvas.off("object:modified", onChange);
        },
    };
};

export { undoCanvas, redoCanvas, saveCanvas, checkChanges };
