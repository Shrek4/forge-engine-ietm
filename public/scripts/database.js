async function showPartDescription(id) {
  $.get("http://localhost:3000/parts", function (data) {
    if (animationLoaded) $("#partdesc").html(data[id - 1].description); else $("#partdesc").html(data[id].description);
  });
}

async function showEngineDescription() {
  $.get("http://localhost:3000/parts", function (data) {
    $("#info").html(data[0].description);
  });
}

async function showProcedureDescription(id) {
  $.get("http://localhost:3000/procedures", function (data) {
    $("#info").html(data[id].description);
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