require('dotenv').config();
const mysql = require('mysql');
const loggerConsole = require('./logger').getLogger('console');
const loggerFile = require('./logger').getLogger('file');
//const Diagnostico = require('../models/diagnostico.model');
const markey = require('./markey');

// Conexion a GEOSalud
const conexion = mysql.createConnection({
    host: process.env.GEOSALUD_HOST,
    port: process.env.GEOSALUD_PORT,
    user: process.env.GEOSALUD_USER,
    password: process.env.GEOSALUD_PASS,
    database: process.env.GEOSALUD_DB
});

var queryDiagnosticosGeo;

markey.obtenerUltimaFecha().then((data) => {
    if(!data) {
        loggerFile.info('DATA NULL');
        loggerConsole.info('DATA NULL');
    } else {
        var ultimaFecha = data[0].Fecha;
        queryDiagnosticosGeo = `SELECT distinct TRS1.TipOSAbrev as 'Tipo', o.OsId as 'OS', DATE_FORMAT(o.OSFchHor, '%Y-%m-%d') as 'Fecha',
        o.OsPersId as 'Persona', OSRRHHID, RRHHDESC, Concat(Concat(o.OSPersApe, ' ', o.OSPersApe2) , ' ', Concat(o.OSPersNom, ' ', o.OSPersNom2)) as 'Persona1', 
        TRS1.FicNom as 'Ficha', TRS1.PregFrmDinaDesc as 'Pregunta', TRS1.OsFicResPregValTabDinValId as 'CodigoRespuesta', 
        TRS1.OsFicResPregResultado as 'Respuesta'
        FROM OS o JOIN (
        Select of1.TipOSId, of1.OsId, of1.OsFicResPregResultado, of1.OsFicResPregValTabDinValId, fic.FicNom, pre.PregFrmDinaDesc, tio.TipOSAbrev
        From OsFicResPregVal of1, Ficha fic, PregFrmDina pre, TipOS tio 
        Where of1.OsFicResPregLin = (
        Select max(of2.OsFicResPregLin) 
        From OsFicResPregVal of2
        Where of2.TipOSId=of1.TipOSId and of2.OsId=of1.OsId and of2.FicId=of1.FicId and of2.FicVerItemsId=of1.FicVerItemsId
        and of2.OsFicResId=of1.OsFicResId and of2.PregFrmDinaId=of1.PregFrmDinaId) and of1.FicId in (1,2) and of1.PregFrmDinaId in(45,14,62) 
        and (fic.FicId = of1.FicId) and (pre.PregFrmDinaId = of1.PregFrmDinaId ) 
        and (tio.TipOSId = of1.TipOSId)) TRS1 ON (TRS1.TipOSId = o.TipOSId and TRS1.osId = o.OsId) JOIN RRHH RH ON O.OSRRHHId = RH.RRHHID
        where (o.OSFchHor between (DATE_FORMAT('${ultimaFecha}', '%Y-%m-%d') + interval 1 day) and (DATE_FORMAT('${ultimaFecha}', '%Y-%m-%d') + interval 1 day))
        order by o.OSFchHor ASC;`;
    }  
});


function obtenerDiagnosticos() {
    return new Promise(function(resolve, reject) {
        setTimeout(() => {
            var diagnosticos = [];
            conexion.query(queryDiagnosticosGeo, (error, resultado, fields) => {
                if(error) {
                    reject(error);
                } else {
                    var response = {
                        'diagnosticos': JSON.parse(JSON.stringify(resultado))
                    }
                    response.diagnosticos.forEach(diagnostico => {
                        diagnosticos.push(diagnostico);
                    })
                    resolve(diagnosticos);
                }  
            });
        }, 100);
    });
}

function mostrarDiagnosticos(req, res) {
    obtenerDiagnosticos().then((data) => {
        res.send(data);
    }).catch((err) => {
        loggerFile.error(`Hubo un problema consultando los diagnosticos: ${err}`);
        loggerConsole.error(`Hubo un problema consultando los diagnosticos: ${err}`);
        res.status(404).send(`Hubo un problema consultando los diagnosticos: ${err}`);
    });
}

function migrarDiagnosticos(req, res) {
    obtenerDiagnosticos().then((data) => {
        res.send(markey.insertDiagnosticos(data));
    })
    .catch((err) => {
        loggerFile.error(`Hubo un problema consultando los diagnosticos: ${err}`);
        loggerConsole.error(`Hubo un problema consultando los diagnosticos: ${err}`);
        res.status(404).send(`Hubo un problema consultando los diagnosticos: ${err}`);
    });    
}

module.exports = {
    obtenerDiagnosticos: obtenerDiagnosticos,
    migrarDiagnosticos: migrarDiagnosticos,
    mostrarDiagnosticos: mostrarDiagnosticos
}