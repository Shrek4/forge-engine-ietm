async function showPartDescription(id) {
    $.get("http://localhost:3000/components", function (data) {
        for (let i = 0; i < data.length; i++) { //поиск элемента, содержащего айди
            let nodeid = JSON.parse(data[i].node_ids);
            if (nodeid.indexOf(id) != -1) {
                viewer.select(nodeid);
                $("#partdesc").html("<h2>" + data[i].name + "</h2>" + data[i].description);
            }
        }

    });
}

async function showEngineDescription() {
    $.get("http://localhost:3000/components", function (data) {
        $("#info").html(data[0].description);
    });
}

async function getAnnotations(id) {
    $.get("http://localhost:3000/procedures", function (data) {
        annotations = JSON.parse(data[id].annotations);
    });
}

async function showProcedureDescription(id) {
    $.get("http://localhost:3000/procedures", function (data) {
        $("#info").html(data[id].description);
    });
}

async function showContents() {
    $.get("http://localhost:3000/components", function (data) {
        let contentstable = `<table class="table contentstable">
    <thead class="thead-light">
      <tr>
        <th scope="col">Компонент</th>
        <th scope="col">Описание</th>
      </tr>
    </thead>
    <tbody>`;

        data = sortComponents(data);
        for (let i = 1; i < data.length; i++) {

            contentstable += `<tr>
        <td><a href="javascript:viewer.isolate(` + data[i].node_ids + `)">` + data[i].name + `</a></td>
        <td>` + data[i].description + `</td>
        </tr>`
        }

        contentstable += "</tbody></table>"

        $("#info").html(contentstable);
    });
    if (animationLoaded) stopAnimation();
}

// function checkLevel(data, id) {
//     let level;
//     console.log(data[id].parent_id, data[data[id].parent_id - 1].parent_id)
//     if (data[id].parent_id == 1) level = 1;
//     else if (data[data[id].parent_id - 1].parent_id == 1) level = 2;
//     else if (data[data[data[id].parent_id - 1].parent_id].parent_id == 1) level = 3;
//     else level = 4
//     return level;
// }

function sortComponents(data) {
    let newdata = data;
    newdata.splice(8, 0, newdata[61]);
    newdata.splice(53, 0, newdata[63]);
    newdata.splice(53, 0, newdata[65]);
    newdata.splice(53, 0, newdata[67]);
    newdata.splice(65, 4);
    return newdata;
}

async function showProcedures() {
    $.get("http://localhost:3000/procedures", function (data) {
        let mn = ``;
        let rep = ``;
        for (let i = 0; i < data.length; i++) {
            if (data[i].type == "maintenance") mn += `<li><a href="javascript:void(0)" onclick="closeNav(), showProcedureDescription(` + i + `)">` + data[i].proc_name + `</a></li>`;
            else if (data[i].type == "repair") rep += `<li><a href="javascript:void(0)" onclick="closeNav(), showProcedureDescription(` + i + `)">` + data[i].proc_name + `</a></li>`;
        }
        $("#maintenance").html(mn);
        $("#repair").html(rep);
    });
}

async function showRequirements() {
    $.get("http://localhost:3000/other", function (data) {
        $("#info").html(data[0].description);
    });
}

async function showDiagnostic() {
    $.get("http://localhost:3000/other", function (data) {
        $("#info").html(data[1].description);
    });
}