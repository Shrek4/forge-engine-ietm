async function showPartDescription(id) {
  $.get("http://localhost:3000/components", function (data) {
    //if (animationLoaded) $("#partdesc").html(data[id - 1].description); else $("#partdesc").html(data[id].description);

    for (let i = 0; i < data.length; i++) { //поиск элемента, содержащего айди
      let nodeid=JSON.parse(data[i].node_ids);
      if (animationLoaded) {
        if (nodeid.indexOf(id) != -1) {
          viewer.select(nodeid);
          $("#partdesc").html(data[i-1].description);
        }
      }
      else {
        if (nodeid.indexOf(id) != -1) {
          viewer.select(nodeid);
          $("#partdesc").html(data[i].description);
        }
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
    stages = JSON.parse(data[id].stages);
    let desc = `<h2>` + data[id].proc_name + `</h2>
<button onclick="startAnimation(`+ id + `)">Запустить анимацию</button>
<p></p>`;
    for (let i = 0; i < stages.length; i++) {
      desc += `<h3 id="stage-` + i + `">` + stages[i].title + `</h3>` +
        `<p>` + stages[i].description + `</p>`;
    }
    $("#info").html(desc);
  });
}

async function showContents() {
  $.get("http://localhost:3000/components", function (data) {
    let contentstable = `<table class="table">
    <thead class="thead-light">
      <tr>
        <th scope="col">Компонент</th>
        <th scope="col">Описание</th>
      </tr>
    </thead>
    <tbody>`;

    for (let i = 1; i < data.length; i++) {
      contentstable+=`<tr>
      <td><a href="javascript:viewer.isolate(`+data[i].node_ids+`)">`+data[i].name+`</a></td>
      <td>`+data[i].description+`</td>
      </tr>`
    }

    contentstable += "</tbody></table>"

    $("#info").html(contentstable);
  });
}