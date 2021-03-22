var annotations = {};

showEngineDescription();

function openNav() {
    document.getElementById("mySidenav").style.width = "300px";
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
    WinPrint.print();
}

function selectionPart() {
    document.getElementById('info').innerHTML = `<h1>Информация о детали:</h1>
    <div id="partdesc">
        <p>Выберите деталь</p>
    </div>`
}

function startAnimation(id) {
    loadAnimation(doc1, id);
}

function addAnnotation(x, y, z, annotationText, id) {
    annotations[id] = {
        x: x,
        y: y,
        z: z,
        text: annotationText
    }

    displayAnnotation(id);
    setAnotationPosition(id);

    // let annotationNumber = document.querySelector("#annotation-index-" + id);
    // annotationNumber.dispatchEvent(new Event("click"));
}

function displayAnnotation(id) {
    const annotation = document.createElement('div');
    annotation.id = 'annotation-' + id;
    annotation.classList.add('annotation', 'hidden');
    document.querySelector('#viewer').appendChild(annotation);
    const annotationText = document.createElement('p');
    annotationText.id = 'annotation-text-' + id;
    annotationText.innerText = annotations[id].text;
    annotationText.style.fontSize = "15px";
    annotation.appendChild(annotationText);
    // const annotationNumber = document.createElement('div');
    // annotationNumber.id = 'annotation-index-' + id;
    // annotationNumber.innerText = + id;
    // annotationNumber.classList.add('annotation-number');
    // //annotationNumber.addEventListener('click', () => this.hideAnnotation(id));
    // document.querySelector('#viewer').appendChild(annotationNumber);
}

function setAnotationPosition(id) {
    let p2 = new THREE.Vector3(annotations[id].x, annotations[id].y, annotations[id].z);
    if (!viewer.impl.camera.position.equals(p2)) {
        clientPos = viewer.impl.worldToClient(p2, viewer.impl.camera);
        p2.x = clientPos.x;
        p2.y = clientPos.y;
        document.querySelector('#annotation-' + id).style.left = p2.x + "px";
        document.querySelector('#annotation-' + id).style.top = p2.y + "px";
        // document.querySelector('#annotation-index-' + id).style.left = p2.x - 15 + "px";
        // document.querySelector('#annotation-index-' + id).style.top = p2.y - 15 + "px";
    }
}

function annotationUpdate() {
    for (const id in annotations) {
        let p2 = new THREE.Vector3(annotations[id].x, annotations[id].y, annotations[id].z);
        if (!viewer.impl.camera.position.equals(p2)) {
            clientPos = viewer.impl.worldToClient(p2, viewer.impl.camera);
            p2.x = clientPos.x;
            p2.y = clientPos.y;
            if (document.querySelector('#annotation-' + id)) {
                document.querySelector('#annotation-' + id).style.left = p2.x + "px";
                document.querySelector('#annotation-' + id).style.top = p2.y + "px";
            }
            // document.querySelector('#annotation-index-' + id).style.left = p2.x - 15 + "px";
            // document.querySelector('#annotation-index-' + id).style.top = p2.y - 15 + "px";
        }
    }
}

function deleteAllAnnotations() {
    for (const id in annotations) {
        delete annotations[id];
        // document.querySelector("#annotation-index-" + id).remove();
        document.querySelector("#annotation-" + id).remove();
    }
}

function getCenterOfNodeId(nodeId) {
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

    return worldMatrix.getPosition().clone();
}

function hideAnnotation(id) {
    const annotation = document.querySelector('#annotation-' + id);
    const hidden = annotation.classList.contains('hidden');
    document.querySelector('#annotation-text-' + id).innerHTML = hidden ? annotations[id].text : '';

    annotation.classList.add('hidden');

}