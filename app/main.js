(async () => {
    const response = await fetch('gael_annotate_1713923665947.json');
    const json = await response.json();
    const data = json.historyLogs[1].data;

    const width = data.objects[0].width,
        height = data.objects[0].height;

    const canvasElement = document.getElementById('main');
    canvasElement.width = width;
    canvasElement.height = height;

    const canvas = window._canvas = new fabric.Canvas('main');
    canvas.loadFromJSON(JSON.stringify(data), canvas.renderAll.bind(canvas), function (o, object) {
        //fabric.log(o, object);
    });
})();

