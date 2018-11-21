const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DiagnosticoSchema = new Schema({
    tipo: { type: String, max: 100 },
    os: { type: String, max: 100 },
    fecha: { type: String, max: 100 },
    persona: { type: String, max: 100 },
    nombre: { type: String, max: 100 },
    ficha: { type: String, max: 100 },
    pregunta: { type: String, max: 100 },
    codigoRespuesta: { type: String, max: 100 },
    respuesta: { type: String, max: 100 },
});

module.exports = mongoose.model('Diagnostico', DiagnosticoSchema);