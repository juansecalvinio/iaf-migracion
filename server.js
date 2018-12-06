const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const loggerFile  = require('./controladores/logger').getLogger('file');

const app = express();

const migracion = require('./routes/diagnostico.route');

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use('/', migracion);

const puerto = '3335';

function httpRequest(){
    loggerFile.info('Realizando HTTP Request');
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            request({
                    url: 'http://localhost:3335/',
                    json: true
                }, (error, response) => {
                if(error) {
                    request({
                        url: 'http://localhost:3335/',
                        json: true
                    }, (error, response) => {
                        if(error) {
                            reject(error);
                        } else if (response.statusCode == 404) {
                            reject(response.body);
                        } else {
                            resolve(response.body);
                        }
                    })
                    reject(error);
                } else if (response.statusCode == 404) {
                    reject(response.body);
                } else {
                    resolve(response.body);
                }
            })       
        }, 100);
    });
}

httpRequest().then(data => {
    loggerFile.info(data);
}).catch(err => {
    loggerFile.error(err);
});

app.listen(puerto, () => {
    loggerFile.info(`Escuchando desde el puerto ${puerto}`);
});