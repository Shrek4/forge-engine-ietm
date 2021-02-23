let viewer;

//let FORGE_MODEL_URN="urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6bW9kZWwyMDIxLTAxLTI3LTE5LTI5LTQ5LWQ0MWQ4Y2Q5OGYwMGIyMDRlOTgwMDk5OGVjZjg0MjdlL1doaXBwZXQlMjAxMGNjJTIwZW5naW5lJTIwdjEuZjNk";
//let FORGE_MODEL_URN="urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6bW9kZWwyMDIxLTAxLTMwLTEwLTAwLTUwLWQ0MWQ4Y2Q5OGYwMGIyMDRlOTgwMDk5OGVjZjg0MjdlL2VuZ2luZSUyMDIlMjB2MC5mM2Q"
let FORGE_MODEL_URN = "urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6bW9kZWwyMDIxLTAxLTMwLTE3LTU3LTQxLWQ0MWQ4Y2Q5OGYwMGIyMDRlOTgwMDk5OGVjZjg0MjdlL2VuZ2luZSUyMDIlMjB2Mi5mM2Q"
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

 function loadModel() {
    const htmlDiv = document.getElementById("viewer");
    const config = {
        extensions: ['Autodesk.Fusion360.Animation', 'Autodesk.NPR'],
        externals: { EventsEmitter: 'EventsEmmitter' }
    };

    viewer = new Autodesk.Viewing.GuiViewer3D(htmlDiv, config);
    const startedCode = viewer.start();
    if (startedCode > 0) {
        console.error("Failed to create a Viewer: WebGL not supported.");
        return;
    }

    console.log("Initialization complete, loading a model next...");
    viewer.addEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, (e) => {
        // Функция, срабатывает после полной загрузки модели
        viewer.setLightPreset(8);
    });

    // let animationsFolder = viewer.getDocument().getRoot().search({ 'type': 'folder', 'role': 'animation' });
    // if (animationsFolder.length === 0) {
    //     console.error('Document contains no animations.');
    //     return;
    // }

    // let animations = animationsFolder[0];
    // let animationUrl = viewer.getDocument().getViewablePath(animations.children[1]);

    // viewer.start(animationUrl, {}, onLoadModelSuccess, onLoadModelError);
    // console.log(animations);

    Autodesk.Viewing.Document.load(
        FORGE_MODEL_URN,
        onDocumentLoadSuccess,
        onDocumentLoadFailure
    );


}

function stopViewer() {
    viewer.finish();
    viewer = null;
    document.getElementById("viewer").innerHTML = "";
}

function startViewer(success, fail) {
    Autodesk.Viewing.Initializer(options, function onInitialized() {
        // Загрузка документа CAD модели
        Autodesk.Viewing.Document.load(FORGE_MODEL_URN, success, fail);
    });
}

function loadAnimation(doc, id) {
    // Create Viewer instance
    var viewerDiv = document.getElementById("viewer");
    var config = {
        extensions: ["Autodesk.Fusion360.Animation", "Autodesk.NPR"],
        externals: { EventsEmitter: "EventsEmmitter" }
    };

    // Create the Viewer 3D instance with default UI
    viewer = new Autodesk.Viewing.Private.GuiViewer3D(viewerDiv, config);

    let animationsFolder = doc
        .getRoot()
        .search({ type: "folder", role: "animation" });
    if (animationsFolder.length === 0) {
        console.error("Document contains no animations.");
        return;
    }

    let animations = animationsFolder[0];
    let animationUrl = doc.getViewablePath(animations.children[id]);

    viewer.addEventListener(
        Autodesk.Viewing.TOOLBAR_CREATED_EVENT,
        onToolBarCreated
    );

    viewer.start(animationUrl, {}, onLoadModelSuccess, onLoadModelError);
}

function onLoadModelSuccess(model) {

    viewer.addEventListener(Autodesk.Viewing.CAMERA_CHANGE_EVENT, (e) => {
        // Функция, срабатывает после полной загрузки модели
        // onTimerTick();
    });

    viewer.addEventListener(Autodesk.Viewing.ANIMATION_READY_EVENT, (e) => {
        animationExt = viewer.getExtension("Autodesk.Fusion360.Animation");
        //checkSeconds();
    });
}

function onLoadModelError(viewerErrorCode) {
    console.error("onLoadModelError() - errorCode:" + viewerErrorCode);
}

// function onDocumentLoadSuccess(doc) {
//     const defaultModel = doc.getRoot().getDefaultGeometry();
//     viewer.loadDocumentNode(doc, defaultModel);
// }
function onDocumentLoadSuccess(doc) {
    const defaultModel = doc.getRoot().getDefaultGeometry();
    viewer.loadDocumentNode(doc, defaultModel);
    // A document contains references to 3D and 2D geometries.

    // Create Viewer instance
    var viewerDiv = document.getElementById('viewer');
    var config = {
        extensions: ['Autodesk.Fusion360.Animation', 'Autodesk.NPR'],
        externals: { EventsEmitter: 'EventsEmitter' }
    };

    // Create the Viewer 3D instance with default UI
    viewer = new Autodesk.Viewing.Private.GuiViewer3D(viewerDiv, config);

    let animationsFolder = doc.getRoot().search({ 'type': 'folder', 'role': 'animation' });
    let animations = animationsFolder[0];
    let animationUrl = doc.getViewablePath(animations.children[0]);


    viewer.start(animationUrl, {}, onLoadModelSuccess, onLoadModelError);


}

function onDocumentLoadFailure() {
    console.error("Failed fetching Forge manifest");
}


