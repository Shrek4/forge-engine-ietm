const express = require('express')
const Axios = require('axios');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const clientSessions = require("client-sessions");
const FORGE_CLIENT_ID = "7TQxVjm16exkmJcwsFmkaJe5bwa9uewI";
const FORGE_CLIENT_SECRET = "EDnxgAsO6jxL4rRc";

const app = express();
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));
const port = process.env.PORT || 3000;

const querystring = require('querystring');
let access_token = '';
const scopes = 'data:read data:write data:create bucket:create bucket:read';

//Заголовки для CORS
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Credentials", true);
    next();
});

app.get('/oauth', function (req, res) {//авторизация в Forge
    Axios({
        method: 'POST',
        url: 'https://developer.api.autodesk.com/authentication/v1/authenticate',
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
        },
        data: querystring.stringify({
            client_id: FORGE_CLIENT_ID,
            client_secret: FORGE_CLIENT_SECRET,
            grant_type: 'client_credentials',
            scope: scopes
        })
    })
        .then(function (response) {
            // Success
            access_token = response.data.access_token;
            res.send(response.data)
        })
        .catch(function (error) {
            // Failed
            console.log(error);
            res.send('Failed to authenticate');
        });
});

app.listen(port, () => {
    console.log('The app is running on  http://localhost:' + port);
});

let sqlite3 = require('sqlite3').verbose();

app.use(clientSessions({//настройки клиентских сессий
    secret: '5hR3k1sL0v35hR3k1sL1f3',
    duration: 60 * 60 * 1000,
    cookie: {

    }
}));

//открытие базы данных
let db = new sqlite3.Database('info.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the database.');
});

db.all("SELECT * FROM components", [], (err, rows) => {//получение компонентов
    if (err) {
        console.error(err.message);
    }
    app.get('/components', function (req, res) {
        res.send(rows);
    })
});

db.all("SELECT * FROM procedures", [], (err, rows) => {//получение процедур
    if (err) {
        console.error(err.message);
    }
    app.get('/procedures', function (req, res) {
        res.send(rows);
    })
});

db.all("SELECT * FROM other", [], (err, rows) => {
    if (err) {
        console.error(err.message);
    }
    app.get('/other', function (req, res) {
        res.send(rows);
    })
});

db.all("SELECT * FROM parts", [], (err, rows) => {
    if (err) {
        console.error(err.message);
    }
    app.get('/parts', function (req, res) {
        res.send(rows);
    })
});

db.all("SELECT * FROM tools", [], (err, rows) => {
    if (err) {
        console.error(err.message);
    }
    app.get('/tools', function (req, res) {
        res.send(rows);
    })
});

db.all("SELECT * FROM documents", [], (err, rows) => {
    if (err) {
        console.error(err.message);
    }
    app.get('/documents', function (req, res) {
        res.send(rows);
    })
});

app.get('/comments', function (req, res) {
    processData(res, "SELECT * FROM comments");
});

app.post('/addComment', function (req, res) {
    db.serialize(function () {
        db.run('INSERT INTO comments (name, text, procedure_id, date) VALUES (?, ?, ?, ?)', [req.body.name, req.body.text, req.body.procedure_id, req.body.date], (err) => {
            if (err) {
                return console.log(err.message);
            }
            console.log(`Row was added to the table "comments": ` + JSON.stringify(req.body));
            res.send();
        });
    });
});

function processData(res, sql) {
    db.serialize(function () {
        db.all(sql,
            function (err, rows) {
                if (err) {
                    console.error(err);
                    res.status(500).send(err);
                }
                else
                    sendData(res, rows, err);
            });
    });
}

function sendData(res, data, err) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.send(data);
}

app.post('/register', function (req, res) {
    if (req.body.password === req.body.repeatpassword) {
        db.serialize(function () {
            db.all(`SELECT * FROM users WHERE username = ?`, [req.body.username], (err, rows) => {
                if (rows.length == 0) {
                    db.run('INSERT INTO users (username, password) VALUES (?, ?)', [req.body.username, bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10), null)], (err) => {
                        if (err) {
                            return console.log(err.message);
                        }
                        console.log(`Пользователь добавлен: ` + JSON.stringify(req.body.username));
                        res.sendStatus(200);
                    });
                }
                else {
                    console.error('Такой пользователь уже есть');
                    res.sendStatus(404);
                }
            });
        });
    }
    else {
        console.error('Не совпадает пароль и подтверждение пароля');
        res.sendStatus(400);
    }
});

app.post(`/login`, function (req, res) {
    db.serialize(function () {
        db.all(`SELECT * FROM users WHERE username = ?`, [req.body.username], (err, rows) => {
            if (rows.length == 1) {
                if (isValidPassword(rows[0], req.body.password)) {
                    req.session_state.username = req.body.username;
                    req.session_state.admin = rows[0].admin;
                    res.send(req.body.username);
                }
                else {
                    console.error('Неправильный пароль');
                    res.sendStatus(400);
                }
            }
            else {
                console.error('Неправильный логин');
                res.sendStatus(404);
            }
        });
    });
});

let isValidPassword = function (user, password) {
    return bcrypt.compareSync(password, user.password);
}
app.get('/currentuser', function (req, res) {
    res.send({ username: req.session_state.username, isadmin: req.session_state.admin });
});

app.get('/logout', function (req, res) {
    req.session_state.reset();
    res.send();
});

app.post('/deletecomment', function (req, res) {
    let comments = [];
    db.serialize(function () {
        db.all("SELECT * FROM comments WHERE procedure_id = ?", [req.body.proc_id], (err, rows) => {
            if (err) {
                console.error(err.message);
            }
            comments = rows;
            db.all(`DELETE FROM comments WHERE id = ?`, [comments[req.body.id].id], (err, rows) => {
                if (err) {
                    return console.log(err.message);
                }
                console.log("Removed comment: " + JSON.stringify(comments[req.body.id]));
                res.send();
            });
        });
    });
});

app.post('/getUsers', function (req, res) {//получение списка пользователей
    if (req.session_state.admin == 1) {
        db.all("SELECT * FROM users", [], (err, rows) => {
            if (err) {
                console.error(err.message);
            }
            res.send(rows);
        });
    }
    else res.sendStatus(400);
});

app.post('/removeUser', function (req, res) {//удаление пользователя
    if (req.session_state.admin == 1) {
        db.all(`DELETE FROM users WHERE id = ?`, [req.body.id], (err, rows) => {
            if (err) {
                return console.log(err.message);
            }
            console.log("Removed user: " + req.body.id);
            res.send();
        });
    }
    else res.sendStatus(400);
});