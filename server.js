const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const migracion = require('./routes/diagnostico.route');

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use('/', migracion);

const puerto = '3335';

app.listen(puerto, () => {
    console.log(`Escuchando desde el puerto ${puerto}`);
});