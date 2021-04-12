var annotations = {};
var stages = {};
var tick;

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
    tick = setInterval(animTick, 100);
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
        setAnotationPosition(id);
    }
}

function setAnotationPosition(id) {
    //let p2 = new THREE.Vector3(annotations[id].x, annotations[id].y, annotations[id].z);
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
    for (const id in annotations) {
        //let p2 = new THREE.Vector3(annotations[id].x, annotations[id].y, annotations[id].z);
        let p2 = getCenterOfNode(annotations[id].nodeid);
        if (!viewer.impl.camera.position.equals(p2)) {
            clientPos = viewer.impl.worldToClient(p2, viewer.impl.camera);
            p2.x = clientPos.x;
            p2.y = clientPos.y;
            if (document.querySelector('#annotation-' + id)) {
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
    if (document.querySelector('#annotation-' + id)) $('#annotation-' + id).remove();
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
                //viewer.select(element.nodeid);
            }
            if ((progress < start) || (progress >= end)) {
                hideAnnotation(annotations.indexOf(element));
                //viewer.clearSelection();
            }
        });

        // stages.forEach(element => {
        //     let start;
        //     if(stages.indexOf(element)==0) start=1; else start=stages[stages.indexOf(element)].start;
        //     let end;
        //     if(stages.indexOf(element)==stages.length-1) end=100; else end=stages[stages.indexOf(element)+1].start;

        //     if ((progress >= start) && (progress < end)) {
        //         $('#stage-' + stages.indexOf(element)).css("color", "white");
        //         $('#stage-' + stages.indexOf(element)).css("background-color", "darkslategray");
        //     }
        //     if ((progress < start) || (progress >= end)) {
        //         $('#stage-' + stages.indexOf(element)).css("color", "black");
        //         $('#stage-' + stages.indexOf(element)).css("background-color", "transparent");
        //     }
        // });

        if (animExt.isPlaying()) {
            annotationUpdate();
        }
    }
}

function stopAnimation() {
    clearInterval(tick);
    loadModel();
    animationLoaded = false;
}