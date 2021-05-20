var annotations = {};
var timer;
//var comments = {};

showEngineDescription();
showProcedures();

function openNav() {
    document.getElementById("mySidenav").style.width = "350px";
}

function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
}

function CallPrint(strid) {
    var prtContent = document.getElementById(strid);
    var prtCSS =
        `<style>
    p {
        font-weight: bold;
    }
    body {
        width: 100%;
        grid-template-columns: 65% 35%;
        grid-template-rows: 60% 40%;
        font-family: "Open Sans", sans-serif;
    }
    .toolstable img{
        max-width:150px;
    }
    </style>`;
    var WinPrint = window.open('', '', 'left=50,top=50,width=800,height=640,toolbar=0,scrollbars=1,status=0');
    WinPrint.document.write('<head>');
    WinPrint.document.write(prtCSS);
    WinPrint.document.write('</head>');
    WinPrint.document.write('<body>');
    WinPrint.document.write(prtContent.innerHTML);
    WinPrint.document.write('</body>');
    WinPrint.document.close();
    WinPrint.focus();
    WinPrint.onload = () => {
        WinPrint.print();
    }
    WinPrint.onafterprint = () => {
        WinPrint.close();
    }
}

function selectionPart() {
    document.getElementById('info').innerHTML = `<h1>Информация о детали:</h1>
    <div id="partdesc">
        <p>Выберите деталь на модели</p>
    </div>`
    if (animationLoaded) stopAnimation();
}

function startAnimation(id) {
    loadAnimation(doc1, id);
    timer = setInterval(animTick, 100);
}

function displayAnnotation(id) {
    if (!document.querySelector('#annotation-' + id)) {
        const annotation = document.createElement('div');
        annotation.id = 'annotation-' + id;
        annotation.classList.add('annotation');
        document.querySelector('#viewer').appendChild(annotation);
        const annotationText = document.createElement('p');
        annotationText.innerText = annotations[id].text;
        annotationText.style.fontSize = "15px";
        annotation.appendChild(annotationText);
        setAnnotationPosition(id);
        viewer.select(annotations[id].nodeid);
    }
}

function setAnnotationPosition(id) {
    let p2 = getCenterOfNode(annotations[id].nodeid);
    if (!viewer.impl.camera.position.equals(p2)) {
        clientPos = viewer.impl.worldToClient(p2, viewer.impl.camera);
        p2.x = clientPos.x;
        p2.y = clientPos.y;
        document.querySelector('#annotation-' + id).style.left = p2.x + "px";
        document.querySelector('#annotation-' + id).style.top = p2.y + "px";
    }
}

function annotationUpdate() {
    for (let id in annotations) {
        let p2 = getCenterOfNode(annotations[id].nodeid);
        if (!viewer.impl.camera.position.equals(p2)) {
            clientPos = viewer.impl.worldToClient(p2, viewer.impl.camera); //рассчитывает проекцию точки на плоскость экрана
            p2.x = clientPos.x;
            p2.y = clientPos.y;
            if ((document.querySelector('#annotation-' + id)) && (p2.x < $('#viewer').width()) && (p2.y < $('#viewer').height()) && (p2.y > 0) && (p2.x > 0)) {

                document.querySelector('#annotation-' + id).style.left = p2.x + "px";
                document.querySelector('#annotation-' + id).style.top = p2.y + "px";
            }
        }
    }
}

function deleteAllAnnotations() {
    for (const id in annotations) {
        delete annotations[id];
        document.querySelector("#annotation-" + id).remove();
    }
}

function getCenterOfNode(nodeId) {
    if (!viewer) {
        console.error(`Viewer is not initialized`);
        return;
    }

    let fragId = viewer.impl.model.getData().fragments.fragId2dbId.indexOf(nodeId);
    if (fragId == -1) {
        console.error(`nodeId ${nodeId} not found`);
        return;
    }

    let fragProxy = viewer.impl.getFragmentProxy(viewer.impl.model, fragId);
    fragProxy.getAnimTransform();

    let worldMatrix = new THREE.Matrix4();
    fragProxy.getWorldMatrix(worldMatrix);

    var position = new THREE.Vector3();
    position.setFromMatrixPosition(worldMatrix);

    return position.clone();
}

function hideAnnotation(id) {
    if (document.querySelector('#annotation-' + id)) {
        $('#annotation-' + id).remove();
        viewer.clearSelection();
    }
}

function viewerMouseMove() {
    if (animationLoaded) {
        let animExt = viewer.getExtension("Autodesk.Fusion360.Animation");
        if (!animExt.isPlaying()) annotationUpdate();
    }

}

function animTick() {
    if (animationLoaded) {
        let animExt = viewer.getExtension("Autodesk.Fusion360.Animation");

        let progress = Math.floor(animExt.getCurrentTime() / animExt.getDuration() * 100); //прогресс в процентах

        annotations.forEach(element => {
            let start = annotations[annotations.indexOf(element)].start; //начало аннотации в процентах
            let end = annotations[annotations.indexOf(element)].end; //конец аннотации в процентах
            if ((progress >= start) && (progress < end)) {
                displayAnnotation(annotations.indexOf(element));
            }
            if ((progress < start) || (progress >= end)) {
                hideAnnotation(annotations.indexOf(element));
            }
        });

        if (animExt.isPlaying()) {
            annotationUpdate();
        }
    }
}

function stopAnimation() {
    clearInterval(timer);
    loadModel();
    animationLoaded = false;
}

// Get the modal
var modal = document.getElementById('id01');

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

let loginform = document.querySelector('#loginform');
loginform.onsubmit = function (event) {
    event.preventDefault();
    login($("#unameinput").val(), $("#pswinput").val());
}