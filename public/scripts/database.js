var current_user;

async function showPartDescription(id) { //показывает описание детали
    $.get("http://localhost:3000/components", function (data) {
        for (let i = 0; i < data.length; i++) { //поиск элемента, содержащего айди
            let nodeid = JSON.parse(data[i].node_ids);
            if (nodeid.includes(id)) {
                viewer.select(nodeid);
                $("#partdesc").html("<h2>" + data[i].name + "</h2>" + data[i].description);
            }
        }
    });
}

async function showEngineDescription() { //показывает описание двигателя
    $.get("http://localhost:3000/components", function (data) {
        $("#info").html(data[0].description);
    });
    if (animationLoaded) stopAnimation();
}

async function getAnnotations(id) { //берёт аннотации к анимации процедуры из БД
    $.get("http://localhost:3000/procedures", function (data) {
        annotations = JSON.parse(data[id].annotations);
    });
}

async function showProcedureDescription(id) { //показывает страницу процедуры
    $.get("http://localhost:3000/procedures", function (data) {
        let description = `<h1>` + data[id].proc_name + `</h1>`
        description += `<div id="tools"></div>`;
        description += data[id].description;
        description += `<div id="comments"></div>`;
        $("#info").html(description);
        getAnnotations(id);
        getProcedureTools(id);
        showComments(id);
    });
}

async function showContents() { //показывает состав двигателя
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

        for (let i = 0; i < data.length; i++) { //добавление строк таблицы в соответствии с иерархией
            contentstable += `<tr class="level1">
        <td><a href="javascript:viewer.isolate(` + data[i].node_ids + `)">` + data[i].name + `</a></td>
        <td>` + data[i].description + `</td>
        </tr>`

            if (data[i].children != undefined)
                for (let j = 0; j < data[i].children.length; j++) {
                    contentstable += `<tr class="level2">
                <td><a href="javascript:viewer.isolate(` + data[i].children[j].node_ids + `)">` + data[i].children[j].name + `</a></td>
                <td>` + data[i].children[j].description + `</td>
                </tr>`;


                    if (data[i].children[j].children != undefined)
                        for (let k = 0; k < data[i].children[j].children.length; k++) {
                            contentstable += `<tr class="level3">
                            <td><a href="javascript:viewer.isolate(` + data[i].children[j].children[k].node_ids + `)">` + data[i].children[j].children[k].name + `</a></td>
                            <td>` + data[i].children[j].children[k].description + `</td>
                            </tr>`;

                            if (data[i].children[j].children[k].children != undefined)
                                for (let l = 0; l < data[i].children[j].children[k].children.length; l++) {
                                    contentstable += `<tr class="level4">
                                <td padding="20px"><a href="javascript:viewer.isolate(` + data[i].children[j].children[k].children[l].node_ids + `)">` + data[i].children[j].children[k].children[l].name + `</a></td>
                                <td>` + data[i].children[j].children[k].children[l].description + `</td>
                                </tr>`;
                                }
                        }

                }

        };
        contentstable += `</tbody></table>`;

        $("#info").html(contentstable);
    });
    if (animationLoaded) stopAnimation();
}

function sortComponents(data) { //сортирует массив компонентов в иерархическом виде
    let newdata = [];
    for (let i = 1; i < data.length; i++) {
        if (data[i].parent_id == 1) newdata.push(data[i]);
        else if (data[i].parent_id != 1) {
            let el = data.find((el) => el.id == data[i].parent_id);
            if (el.children == undefined) el.children = [];
            el.children.push(data[i]);
        }
    }
    return newdata;
}

async function showProcedures() { //показывает список процедур в меню
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

async function showRequirements() { //показывает технические требования
    $.get("http://localhost:3000/other", function (data) {
        $("#info").html(data[0].description);
    });
}

async function showDiagnostic() { //показывает диагностику неисправностей
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
                    <a class="btn btn-default" href="#" onclick="reply('`+ curdata[i].name + `')">Ответить</a>
                  </div>
                  <hr>`
            }
            comments += `</ul></div>`
        }
        else comments += `</div>`

        if (current_user != undefined) {
            comments += `<form id="commentform">
            <label for="name">Ваше имя:</label><br>
            <input disabled type="text" id="inputname" required><br>
            <label for="text">Сообщение:</label><br>
            <textarea cols="50" id="inputtext" required></textarea><br>
            <p></p>
            <input type="submit" value="Оставить комментарий" id="commentsubmit">
            </form>`;
            $("#comments").html(comments);
            $('#inputname').val(current_user);
            let commentform = document.querySelector('#commentform');
            commentform.onsubmit = function (event) {
                event.preventDefault();
                addComment(current_user, $('#inputtext').val(), id + 1, new Date().toLocaleString('ru-RU')).then(() => showComments(id));
            }
        }
        else {
            $("#comments").html(comments);
        }
    });
}

function reply(name) {
    $('#inputtext').val('<b>' + name + ',</b> ');
}

async function showPartsAndTools() { //показывает инструменты и расходники
    let info = ``;
    $.get("http://localhost:3000/parts", function (data) {
        info += `<h1>Расходники</h1>
        <table class="table toolstable">
        <thead class="thead-light">
          <tr>
            <th scope="col">Расходник</th>
            <th scope="col">Фотография</th>
            <th scope="col">Описание</th>
          </tr>
        </thead>
        <tbody>`;
        for (let i = 0; i < data.length; i++) {
            info += `<tr>
            <td>`+ data[i].name + `</td>
            <td>`+ data[i].image + `</td>
            <td>`+ data[i].description + `</td>
            </tr>`;
        }
        info += `</tbody></table>`;

    }).then(() => {
        $.get("http://localhost:3000/tools", function (data) {
            info += `<h1>Инструменты</h1>
            <table class="table toolstable">
            <thead class="thead-light">
              <tr>
                <th scope="col">Инструмент</th>
                <th scope="col">Фотография</th>
                <th scope="col">Описание</th>
              </tr>
            </thead>
            <tbody>`;

            for (let i = 0; i < data.length; i++) {
                info += `<tr>
                <td>`+ data[i].name + `</td>
                <td>`+ data[i].image + `</td>
                <td>`+ data[i].description + `</td>
                </tr>`;
            }

            info += `</tbody></table>`;

            $("#info").html(info);
        });
    });
    //hideButton();
}

async function getProcedureTools(id) { //показывает инструменты и расходники на странице процедуры
    let info = `<h2>Вам понадобится:</h2>`;
    $.get("http://localhost:3000/parts", function (data) {
        let data1 = data.filter((val) => { return JSON.parse(val.procedure_ids).includes(id + 1) }); //фильтр расходников, связанных с процедурой
        if (data1.length != 0) {
            info += `<table class="table toolstable">
            <thead class="thead-light">
              <tr>
                <th scope="col">Расходник</th>
                <th scope="col">Фотография</th>
              </tr>
            </thead>
            <tbody>`;
            for (let i = 0; i < data1.length; i++) {
                info += `<tr>
                <td>`+ data1[i].name + `</td>
                <td>`+ data1[i].image + `</td>
                </tr>`;
            }
            info += `</tbody></table>`;
        }

    }).then(() => {
        $.get("http://localhost:3000/tools", function (data) {
            let data2 = data.filter((val) => { return JSON.parse(val.procedure_ids).includes(id + 1) }); //фильтр инструментов, связанных с процедурой
            if (data2.length != 0) {
                info += `<table class="table toolstable">
            <thead class="thead-light">
              <tr>
                <th scope="col">Инструмент</th>
                <th scope="col">Фотография</th>
              </tr>
            </thead>
            <tbody>`;

                for (let i = 0; i < data2.length; i++) {
                    info += `<tr>
                <td>`+ data2[i].name + `</td>
                <td>`+ data2[i].image + `</td>
                </tr>`;
                }

                info += `</tbody></table>`;
            }
            $("#tools").html(info);
        });
    });
}

async function showDocuments() { //показывает документы
    $.get("http://localhost:3000/documents", function (data) {
        let info = `<h2>Документы ИЭТР</h2><ul>`;
        for (let i = 0; i < data.length; i++) {
            info += `<li><a href="javascript:void(0)" onclick="showDoc(` + data[i].doc + `)">` + data[i].name + `</a></li`;
        }
        info += `</ul>`;
        $("#info").html(info);
    });
}

function showDoc(doc) {
    $("#viewer").html(`<iframe src="` + doc + `" style="width:100%; height:100%;" frameborder="0"></iframe>`);
}

async function login(username, password) {
    let data = { username: username, password: password };
    $.post({
        traditional: true,
        url: '/login',
        contentType: 'application/json',
        data: JSON.stringify(data),
        dataType: 'html',
        success: function (response) { current_user = response; $("#loginbutton").html(response); showEngineDescription(); document.getElementById('id01').style.display='none'},
        error: function(error) {
            alert("Неправильный логин или пароль");
        }
    });
}

async function register(username, password, repeatPassword) {
    let data = { username: username, password: password, repeatPassword: repeatPassword };
    $.post({
        traditional: true,
        url: '/register',
        contentType: 'application/json',
        data: JSON.stringify(data),
        dataType: 'json',
        success: function (response) { console.log(response); }
    });
}

async function deleteComment(id){

}