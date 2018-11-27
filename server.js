const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const loggerFile  = require('./controladores/logger').getLogger('file');
var loggerConsole = require('./controladores/logger').getLogger('console');

const app = express();

const migracion = require('./routes/diagnostico.route');

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use('/', migracion);

const puerto = '3335';

function httpRequest(){
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            request({
                    url: 'http://localhost:3335/',
                    json: true
                }, (error, response, body) => {
                if(error) {
                    reject(error);
                } else {
                    resolve(body);
                }
            })       
        }, 100);
    });
}

httpRequest().then(data => {
    loggerConsole.info(data);
    loggerFile.info(data);
}).catch(err => {
    loggerConsole.error(err);
    loggerFile.error(err);
});

app.listen(puerto, () => {
    loggerConsole.info(`Escuchando desde el puerto ${puerto}`);
    loggerFile.info(`Escuchando desde el puerto ${puerto}`);
});