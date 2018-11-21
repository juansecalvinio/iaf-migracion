const express = require('express');
const router = express.Router();

const geosalud = require('../controladores/geosalud');
const markey = require('./../controladores/markey');


router.get('/', geosalud.migrarDiagnosticos);
router.get('/insertar', markey.insertPrueba);
router.get('/geosalud', geosalud.mostrarDiagnosticos);
router.get('/markey', markey.obtenerDiagnosticos);
router.get('/fecha', markey.obtenerUltimaFecha);


module.exports = router;