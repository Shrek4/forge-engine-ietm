let animEnabled = false;
//айди деталей модели
const kolenval = [168, 172, 178, 174, 401, 176];
const shatun = 148;
const piston = [136, 146];
const rasprval = [20, 182];
const klapan1 = [16, 22, 30, 32];
const klapan2 = [18, 24, 26, 28];
const gear = 186;

function animSwitch() { //кнопка анимации
    animEnabled = !animEnabled;
    if (animEnabled) {
        document.getElementById("startanimation").innerHTML = "Остановить анимацию";
        startAnimation(169, 163);
        startAnimation(175, 163);
        startAnimation(173, 163);
        startAnimation(402, 163);
        startAnimation(171, 163);
        startAnimation(179, 163);
    }
    else {
        document.getElementById("startanimation").innerHTML = "Запустить анимацию";
        stopAnimation();
    }
}

function startAnimation(part_id, base_id) {

    let seconds_pivot = new THREE.Mesh();
    let pin_position = getFragmentWorldMatrixByNodeId(base_id).matrix[0].getPosition().clone();
    seconds_pivot.position.x = pin_position.x;
    seconds_pivot.position.y = pin_position.y;
    seconds_pivot.position.z = pin_position.z;

    let seconds_helper = new THREE.Mesh();
    seconds_helper.position.x = 13.75;
    seconds_helper.position.y = 65.34;
    seconds_helper.position.z = 10.44;
    console.log(seconds_helper.position.x)

    viewer.impl.scene.add(seconds_pivot);
    seconds_pivot.add(seconds_helper);

    setInterval(function () {
        seconds_pivot.rotation.z += Math.PI / 60;
        assignTransformations(seconds_helper, part_id);
        viewer.impl.sceneUpdated();
    }, 10);
}

function stopAnimation() {
    //очистка всех таймаутов
    var id = window.setTimeout(function () { }, 0);
    while (id--) {
        window.clearTimeout(id);
    }
}


function getFragmentWorldMatrixByNodeId(nodeId) {
    let result = {
        fragId: [],
        matrix: [],
    }

    let tree = viewer.model.getData().instanceTree;
    tree.enumNodeFragments(nodeId, function (frag) {

        let fragProxy = viewer.impl.getFragmentProxy(viewer.model, frag);
        let matrix = new THREE.Matrix4();

        fragProxy.getWorldMatrix(matrix);

        result.fragId.push(frag);
        result.matrix.push(matrix);
    });
    return result;
}

function assignTransformations(refererence_dummy, nodeId) {
    refererence_dummy.parent.updateMatrixWorld();
    var position = new THREE.Vector3();
    var rotation = new THREE.Quaternion();
    var scale = new THREE.Vector3();
    refererence_dummy.matrixWorld.decompose(position, rotation, scale);

    let tree = viewer.model.getData().instanceTree;
    tree.enumNodeFragments(nodeId, function (frag) {
        var fragProxy = viewer.impl.getFragmentProxy(viewer.model, frag);
        fragProxy.getAnimTransform();
        fragProxy.position = position;
        fragProxy.quaternion = rotation;
        fragProxy.updateAnimTransform();
    });

}