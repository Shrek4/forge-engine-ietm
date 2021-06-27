let viewer; //текущий вьювер
let doc1; //текущий документ вьювера
let isModelLoaded = true;
let animationLoaded = false; //загружена ли анимация
let currentAnimId; //текущий айди анимации
//айди модели из models.autodesk.io
let FORGE_MODEL_URN = "urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6bW9kZWwyMDIxLTA1LTExLTE3LTM0LTM1LWQ0MWQ4Y2Q5OGYwMGIyMDRlOTgwMDk5OGVjZjg0MjdlL3pldGVjJTIwZW5naW5lJTIwYW5pbWF0YWJsZSUyMHY0NC5mM2Q";

const options = {
    env: "AutodeskProduction",
    api: "derivativeV2", // for models uploaded to EMEA change this option to 'derivativeV2_EU'
    getAccessToken: getForgeToken
};

function getForgeToken(onTokenReady) {
    $.get("/oauth", (data) => {
        const token = data.access_token;
        const timeInSeconds = data.expires_in; // Use value provided by Forge Authentication (OAuth) API
        onTokenReady(token, timeInSeconds);
    });
}

Autodesk.Viewing.Initializer(options, function () {
    loadModel();
});

function loadModel() {//загружает модель без анимации
    $("#viewer").html(`<img src="../images/forge.png" class="logo"></img>`);/*устанавливает изначальное содержимое блока, 
        чтобы когда с документа обратно на 3д-модель переключаешься, логотип тоже был*/
    isModelLoaded = true;
    const htmlDiv = document.getElementById("viewer");
    const config = {
        extensions: ['Autodesk.Fusion360.Animation', 'Autodesk.NPR'],//тут подключаются расширения
        externals: { EventsEmitter: 'EventsEmmitter' }
    };

    viewer = new Autodesk.Viewing.GuiViewer3D(htmlDiv, config);
    
    const startedCode = viewer.start();
    if (startedCode > 0) {
        console.error("Failed to create a Viewer: WebGL not supported.");
        return;
    }

    console.log("Initialization complete, loading a model next...");
    viewer.addEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, (e) => {//срабатывает после загрузки модели
        viewer.setLightPreset(8);
    });

    Autodesk.Viewing.Document.load(//загружает документ
        FORGE_MODEL_URN,
        onDocumentLoadSuccess,
        onDocumentLoadFailure
    );
}

function loadAnimation(doc, id) {//загружает модель с анимацией под номером id

    var viewerDiv = document.getElementById('viewer');
    var config = {
        extensions: ['Autodesk.Fusion360.Animation', 'Autodesk.NPR'],
        externals: { EventsEmitter: 'EventsEmitter' }
    };

    // Create the Viewer 3D instance with default UI
    viewer = new Autodesk.Viewing.Private.GuiViewer3D(viewerDiv, config);

    let animationsFolder = doc.getRoot().search({ 'type': 'folder', 'role': 'animation' });
    let animations = animationsFolder[0];

    let animationUrl = doc.getViewablePath(animations.children[id]);

    viewer.start(animationUrl, {}, onLoadModelSuccess2, onLoadModelError);
    currentAnimId = id;
}

function onLoadModelSuccess(model) {//загрузка модели без анимации

    viewer.addEventListener(Autodesk.Viewing.CAMERA_CHANGE_EVENT, (e) => {
        //срабатывает после загрузки модели
    });

    viewer.addEventListener(Autodesk.Viewing.ANIMATION_READY_EVENT, (e) => {//срабатывает после загрузки анимации
        animationExt = viewer.getExtension("Autodesk.Fusion360.Animation");
        viewer.setProgressiveRendering(false); //отключает активное отображение
    });
}
function onLoadModelSuccess2(model) {//загрузка модели с анимацией

    viewer.addEventListener(Autodesk.Viewing.CAMERA_CHANGE_EVENT, (e) => {
        //срабатывает после загрузки модели
    });

    viewer.addEventListener(Autodesk.Viewing.ANIMATION_READY_EVENT, (e) => {//срабатывает после загрузки анимации
        animationExt = viewer.getExtension("Autodesk.Fusion360.Animation");
        animationLoaded = true;
        animationExt.play();//запуск анимации
        viewer.setProgressiveRendering(false); //отключает активное отображение
    });
}

function onLoadModelError(viewerErrorCode) {
    console.error("onLoadModelError() - errorCode:" + viewerErrorCode);
}

function onDocumentLoadSuccess(doc) {
    const defaultModel = doc.getRoot().getDefaultGeometry();
    viewer.loadDocumentNode(doc, defaultModel);
    doc1 = doc;
}

function onDocumentLoadFailure() {
    console.error("Failed fetching Forge manifest");
}

function onViewerClick() {//обратотка кликов по деталям
    if (document.getElementById('partdesc')) {
        let shrek = viewer.getSelection()[0];
        if (shrek) {
            showPartDescription(shrek);
        }
    }
}