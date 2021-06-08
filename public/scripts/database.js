const socket = "http://195.133.144.86:4015";

async function showPartDescription(id) { //показывает описание детали
    $.get( socket + "/components", function (data) {
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
    $.get( socket + "/components", function (data) {
        $("#info").html(data[0].description);
    });
    if (animationLoaded) stopAnimation();
    if (!isModelLoaded) loadModel();
}

async function getAnnotations(id) { //берёт аннотации к анимации процедуры из БД
    $.get( socket + "/procedures", function (data) {
        annotations = JSON.parse(data[id].annotations);
    });
}

async function showProcedureDescription(id) { //показывает страницу процедуры
    $.get( socket + "/procedures", function (data) {
        let description = `<h1>` + data[id].proc_name + `</h1>`
        description += `<div id="tools"></div>`;
        description += data[id].description;
        description += `<div id="comments"></div>`;
        $("#info").html(description);
        getAnnotations(id);
        getProcedureTools(id);
        showComments(id);
        if (!isModelLoaded) loadModel();
    });
}

async function showContents() { //показывает состав двигателя
    $.get( socket + "/components", function (data) {
        let contentstable = `<div class="table-box"><table class="table contentstable">
    <thead class="thead-light">
      <tr>
        <th scope="col">Компонент</th>
        <th scope="col">Описание</th>
      </tr>
    </thead>
    <tbody>`;

        data = sortComponents(data);
        //добавление строк таблицы в соответствии с иерархией
        for (let i = 0; i < data.length; i++) { //первый уровень иерархии
            contentstable += `<tr class="level1">
        <td><a href="javascript:viewer.isolate(` + data[i].node_ids + `)">` + data[i].name + `</a></td>
        <td>` + data[i].description + `</td>
        </tr>`

            if (data[i].children != undefined)
                for (let j = 0; j < data[i].children.length; j++) {//второй уровень иерархии
                    contentstable += `<tr class="level2">
                <td><a href="javascript:viewer.isolate(` + data[i].children[j].node_ids + `)">` + data[i].children[j].name + `</a></td>
                <td>` + data[i].children[j].description + `</td>
                </tr>`;


                    if (data[i].children[j].children != undefined)//третий уровень иерархии
                        for (let k = 0; k < data[i].children[j].children.length; k++) {
                            contentstable += `<tr class="level3">
                            <td><a href="javascript:viewer.isolate(` + data[i].children[j].children[k].node_ids + `)">` + data[i].children[j].children[k].name + `</a></td>
                            <td>` + data[i].children[j].children[k].description + `</td>
                            </tr>`;

                            if (data[i].children[j].children[k].children != undefined)//четвёртый уровень иерархии
                                for (let l = 0; l < data[i].children[j].children[k].children.length; l++) {
                                    contentstable += `<tr class="level4">
                                <td padding="20px"><a href="javascript:viewer.isolate(` + data[i].children[j].children[k].children[l].node_ids + `)">` + data[i].children[j].children[k].children[l].name + `</a></td>
                                <td>` + data[i].children[j].children[k].children[l].description + `</td>
                                </tr>`;
                                }
                        }

                }

        };
        contentstable += `</tbody></table></div>`;

        $("#info").html(contentstable);
    });
    if (animationLoaded) stopAnimation();
    if (!isModelLoaded) loadModel();
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
    $.get( socket + "/procedures", function (data) {
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
    $.get( socket + "/other", function (data) {
        $("#info").html(data[0].description);
    });
    if (!isModelLoaded) loadModel();
}

async function showDiagnostic() { //показывает диагностику неисправностей
    $.get( socket + "/other", function (data) {
        $("#info").html(data[1].description);
    });
    if (!isModelLoaded) loadModel();
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
    $.get( socket + "/comments", async function (data) {
        let curdata = data.filter(element => element.procedure_id - 1 == id);
        let current_user = await getCurrentUser();

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
                    <a class="btn btn-default" href="javascript:void(0)" onclick="reply('`+ curdata[i].name + `')">Ответить</a>
                  </div>`
                if (current_user.isadmin == 1) comments += `<a class="btn btn-default" href="javascript:void(0)" onclick="deleteComment(` + i + `, ` + (id + 1) + `)">Удалить</a>`;
                comments += `<hr>`;
            }

            comments += `</ul></div>`;
        }
        else comments += `</div>`

        if (current_user.username != undefined) {
            comments += `<form id="commentform">
            <label for="name">Ваше имя:</label><br>
            <input disabled type="text" id="inputname" required><br>
            <label for="text">Сообщение:</label><br>
            <textarea cols="50" id="inputtext" required></textarea><br>
            <p></p>
            <input type="submit" value="Оставить комментарий" id="commentsubmit">
            </form>`;
            $("#comments").html(comments);
            $('#inputname').val(current_user.username);
            let commentform = document.querySelector('#commentform');
            commentform.onsubmit = function (event) {
                event.preventDefault();
                addComment(current_user.username, $('#inputtext').val(), id + 1, new Date().toLocaleString('ru-RU')).then(() => showComments(id));
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
    $.get( socket + "/parts", function (data) {
        info += `<h1>Расходники</h1>
        <div class="table-box"><table class="table toolstable">
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
        info += `</tbody></table></div>`;

    }).then(() => {
        $.get( socket + "/tools", function (data) {
            info += `<h1>Инструменты</h1>
            <div class="table-box"><table class="table toolstable">
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

            info += `</tbody></table></div>`;

            $("#info").html(info);
        });
    });
    if (!isModelLoaded) loadModel();
}

async function getProcedureTools(id) { //показывает инструменты и расходники на странице процедуры
    let info = `<h2>Вам понадобится:</h2>`;
    $.get( socket + "/parts", function (data) {
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
        $.get( socket + "/tools", function (data) {
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
    $.get( socket + "/documents", function (data) {
        let info = `<h2>Документы ИЭТР</h2><ul>`;
        for (let i = 0; i < data.length; i++) {
            info += `<li><a href="javascript:void(0)" onclick="showDoc('` + data[i].file + `')">` + data[i].name + `</a></li`;
        }
        info += `</ul>`;
        $("#info").html(info);
    });
}

function showDoc(doc) {
    $("#viewer").html(`<iframe src="` + doc + `" width="100%" height="100%"></iframe>`);
    console.log(doc)
    isModelLoaded = false;
}

async function login(username, password) {
    let data = { username: username, password: password };
    $.post({
        traditional: true,
        url: '/login',
        contentType: 'application/json',
        data: JSON.stringify(data),
        dataType: 'html',
        success: function (response) {
            $("#loginbutton").html(response);
            showEngineDescription();
            document.getElementById('id01').style.display = 'none';
            $("#logout").append(`<button id="logoutbutton" type="button" onclick="logout()" class="cancelbtn btn btn-secondary">Выйти</button>`)
        },
        error: function (error) {
            alert("Неправильный логин или пароль");
        }
    });
}

async function register(username, password, repeatPassword) {
    let data = { username: username, password: password, repeatpassword: repeatPassword };
    $.post({
        traditional: true,
        url: '/register',
        contentType: 'application/json',
        data: JSON.stringify(data),
        dataType: 'html',
        success: function (response) { alert("Успех") },
        error: function (error) { alert("Проверьте правильность пароля") }
    });
}

async function deleteComment(id, proc_id) {
    $.post({
        traditional: true,
        url: '/deletecomment',
        contentType: 'application/json',
        data: JSON.stringify({ id: id, proc_id: proc_id }),
        dataType: 'html',
        success: function (response) { showComments(proc_id - 1) }
    });
}

async function getCurrentUser() {
    let result;
    $.ajax({
        url:  socket + "/currentuser",
        type: 'get',
        dataType: 'json',
        async: false,
        success: function (data) {
            result = data;
        }
    });
    return { username: result.username, isadmin: result.isadmin };
}

async function logout() {
    $.get( socket + "/logout", function (data) {
        $("#loginbutton").html("Войти");
        document.getElementById('id01').style.display = 'none';
        showEngineDescription();
        $("#logoutbutton").remove();
    });
}

async function showTechicalDescription() {
    $.get( socket + "/other", function (data) {
        $("#info").html(data[2].description);
    });
    if (!isModelLoaded) loadModel();
}

async function showUsers() {
    $.post({
        traditional: true,
        url: '/getUsers',
        contentType: 'application/json',
        data: {},
        dataType: 'html',
        success: function (response) { console.log(response); },
        error: function (error) { console.log("Войдите под учётной записью администратора"); }
    });
}

async function removeUser(id) {
    let data = { id: id };
    $.post({
        traditional: true,
        url: '/removeUser',
        contentType: 'application/json',
        data: JSON.stringify(data),
        dataType: 'html',
        success: function (response) { console.log("Пользователь удалён"); },
        error: function (error) { console.log("Войдите под учётной записью администратора"); }
    });
}