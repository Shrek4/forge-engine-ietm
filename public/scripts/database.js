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
        let description = `<div id="tools"></div>`;
        description += data[id].description;
        description += `<div id="comments"></div>`;
        $("#info").html(description);
        showComments(id);

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

        //data = sortComponents(data);
        for (let i = 1; i < data.length; i++) {

            contentstable += `<tr>
        <td><a href="javascript:viewer.isolate(` + data[i].node_ids + `)">` + data[i].name + `</a></td>
        <td>` + data[i].description + `</td>
        </tr>`
        }

        contentstable += "</tbody></table>"

        $("#info").html(contentstable);
        console.log(sortComponents(data));
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
    let newdata = [];
    for (let i = 1; i < data.length; i++) {
        if (data[i].parent_id == 1) newdata.push(data[i]);
        else {
            let el = newdata.find((el) => el.id == data[i].parent_id)
            el["children"] = [];
            el.children.push(data[i]);
        }
    }
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

async function addComment(name, text, procedure_id, date) {
    let data = { name: name, text: text, procedure_id: procedure_id, date: date };
    $.post({
        traditional: true,
        url: '/addComment',
        contentType: 'application/json',
        data: JSON.stringify(data),
        dataType: 'json',
        success: function (response) { console.log(response); }
    });
}

async function showComments(id) {
    $.get("http://localhost:3000/comments", function (data) {
        let curdata = data.filter(element => element.procedure_id - 1 == id);
        let comments = `<div class="comments">
        <h3 class="title-comments">Комментарии</h3>`
        if (curdata.length != 0) {
            comments = `<div class="comments">
            <h3 class="title-comments">Комментарии</h3>
            <ul class="media-list">`;
            for (let i = 0; i < curdata.length; i++) {
                comments += `<li class="media">
                <div class="media-body">
                  <div class="media-heading">
                    <div class="author">`+ curdata[i].name + `</div>
                    <div class="metadata">
                      <span class="date">`+ curdata[i].date + `</span>
                    </div>
                  </div>
                  <div class="media-text text-justify">`+ curdata[i].text + `</div>
                  <div class="footer-comment">
                    <a class="btn btn-default" href="#">Ответить</a>
                  </div>
                  <hr>`
            }
            comments += `</ul></div>`
        }
        else comments += `</div>`

        comments += `<form>
        <label for="name">Ваше имя:</label><br>
        <input type="text" id="inputname" required><br>
        <label for="text">Сообщение:</label><br>
        <textarea cols="50" id="inputtext" required></textarea><br>
        <input type="submit" value="Оставить комментарий" id="commentsubmit">
        </form>`

        $("#comments").html(comments);
        let sendcomment = document.querySelector('#commentsubmit');
        sendcomment.onclick = function (event) {
            event.preventDefault();
            addComment($('#inputname').val(), $('#inputtext').val(), id, new Date());
        }
    });
}

async function showParts(id) {

}