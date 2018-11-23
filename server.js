const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const Agenda = require('agenda');
const app = express();

const migracion = require('./routes/diagnostico.route');

const agenda = new Agenda({db: {address: '127.0.0.1:27017/migracion_diagnosticos', collection: 'log'}});

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

agenda.define('migrarDiagnosticos', (job) => {
    console.log(`Migrando diagnosticos. Hora: ${new Date().getMinutes()} : ${new Date().getSeconds()}`);
    httpRequest().then(data => {
        console.log(data);
        console.log('Migración finalizada');
    }).catch(err => {
        console.log(err);
    });
});

agenda.on('ready', () => {
    agenda.every('10 seconds', 'migrarDiagnosticos');
    agenda.start();
})


// httpRequest().then(data => {
//     console.log(data);
// }).catch(err => {
//     console.log(err);
// });

app.listen(puerto, () => {
    console.log(`Escuchando desde el puerto ${puerto}`);
});