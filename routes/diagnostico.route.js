const express = require('express');
const router = express.Router();

const geosalud = require('../controladores/geosalud');

router.get('/', geosalud.migrarDiagnosticos);

module.exports = router;