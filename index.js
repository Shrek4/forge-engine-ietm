const express = require('express')
const Axios = require('axios');
const bodyParser = require('body-parser');
const FORGE_CLIENT_ID = "7TQxVjm16exkmJcwsFmkaJe5bwa9uewI";
const FORGE_CLIENT_SECRET = "EDnxgAsO6jxL4rRc";

const app = express();
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));
const port = process.env.PORT || 3000;

const querystring = require('querystring');
let access_token = '';
const scopes = 'data:read data:write data:create bucket:create bucket:read';

app.get('/oauth', function (req, res) {
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

const os = require('os');
const { default: axios } = require('axios');
function getIp() {
    for (let key in os.networkInterfaces()) {
        if (os.networkInterfaces()[key][1].address != undefined) return os.networkInterfaces()[key][1].address;
    }
}
const ipAddress = getIp();

app.get('/getIp', function (req, res) {
    res.send(ipAddress);// Возможность узнать IP сервера
});

app.listen(port, () => {
    console.log('The app is running on  http://localhost:' + port);
    console.log('Net address:  http://' + ipAddress + ':' + port);
});

let sqlite3 = require('sqlite3').verbose();

// open the database
let db = new sqlite3.Database('info.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the database.');
});

db.all("SELECT * FROM components", [], (err, rows) => {
    if (err) {
        console.error(err.message);
    }
    app.get('/components', function (req, res) {
        res.send(rows);
    })
});

db.all("SELECT * FROM procedures", [], (err, rows) => {
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


db.all("SELECT * FROM comments", [], (err, rows) => {
    if (err) {
        console.error(err.message);
    }
    app.get('/comments', function (req, res) {
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

app.post('/addComment', function (req, res) {
        db.run('INSERT INTO comments (name, text, procedure_id, date) VALUES (?, ?, ?, ?)', [req.body.name, req.body.text, req.body.procedure_id, req.body.date], (err) => {
            if (err) {
                return console.log(err.message);
            }
            console.log(`Row was added to the table "comments": ` + JSON.stringify(req.body));
            res.send();
        });
});
