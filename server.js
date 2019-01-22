const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const loggerFile  = require('./controladores/logger').getLogger('file');
const CronJob = require('cron').CronJob;

const app = express();

const migracion = require('./routes/diagnostico.route');

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use('/', migracion);

const puerto = '3335';

const httpRequest = () => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            request({ url: 'http://localhost:3335/', json: true }, (error, response) => {
                if(error) {
                    request({ url: 'http://localhost:3335/', json: true }, (error, response) => {
                        if(error) {
                            request({ url: 'http://localhost:3335/', json: true }, (error, response) => {
                                if(error) {
                                    reject(error);
                                } else if (response.statusCode == 404) {
                                    reject(response.body);
                                } else if (response.statusCode == 'ECONNRESET') {
                                    reject(response.body);
                                } else {
                                    resolve(response.body);
                                }
                            })
                        } else if (response.statusCode == 404) {
                            reject(response.body);
                        } else if (response.statusCode == 'ECONNRESET') {
                            reject(response.body);
                        } else {
                            resolve(response.body);
                        }
                    });
                } else if (response.statusCode == 404) {
                    reject(response.body);
                } else if (response.statusCode == 'ECONNRESET') {
                    reject(response.body);
                } else {
                    resolve(response.body);
                }
            });
        }, 100);
    });
}

const job = new CronJob('00 30 05 * * *', () => {
    httpRequest().then(() => {
        loggerFile.info('Realizando HTTP Request.');
    })
    .catch(err => {
        loggerFile.error(err);
    })
});

job.start();


app.listen(puerto, () => {
    loggerFile.info(`Escuchando desde el puerto ${puerto}`);
});