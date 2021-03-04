const express = require('express')
const Axios = require('axios');
const bodyParser = require('body-parser');
const FORGE_CLIENT_ID = "A90ZYBE6V9tKBKoH3dXrUE9waQGcdFF0";
const FORGE_CLIENT_SECRET = "EIIW4U9y8svJh96j";

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

const sqlite3 = require('sqlite3').verbose();
var parts = "";
// open the database
let db = new sqlite3.Database('info.db', sqlite3.OPEN_READONLY, (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the database.');
});

db.all("SELECT * FROM parts", [], (err, rows) => {
    if (err) {
        console.error(err.message);
    }
    parts=rows;
});

app.get('/parts', function(req, res){
    res.send(parts);
})