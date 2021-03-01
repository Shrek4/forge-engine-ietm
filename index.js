const express = require('express')
const Axios = require('axios');
const bodyParser = require('body-parser');
const WebSocket = require('ws');
const FORGE_CLIENT_ID= "A90ZYBE6V9tKBKoH3dXrUE9waQGcdFF0";
const FORGE_CLIENT_SECRET= "EIIW4U9y8svJh96j";
const WEB_SOCKET_PORT = 3030;

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


let wsCount = 0;
const wss = new WebSocket.Server({ port: WEB_SOCKET_PORT });//{ port: 3030 }
wss.on('connection', function connection(ws) {
    let wsNum = wsCount++;
    console.log("WSS - new client ws " + wsNum + " connected to server")
    ws.on("open", () => console.log("ws " + wsNum + " opened"));
    ws.on("close", () => console.log("ws " + wsNum + " closed"));
    ws.on("error", () => console.log("ws " + wsNum + " error"));
});
wss.on("close", () => console.log("WSS closed"));
wss.on("error", () => console.log("WSS error"));
wss.on("listening", () => console.log("WSS listening"));


const os = require('os');
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

