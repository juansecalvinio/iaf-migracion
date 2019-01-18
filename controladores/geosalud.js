require('dotenv').config();
const mysql = require('mysql');
const loggerFile = require('./logger').getLogger('file');
const markey = require('./markey');
const tunnel = require('tunnel-ssh');

const conectarTunel = () => {
    return new Promise((resolve, reject) => {
        setTimeout( () => {
            tunnel({
                host: '172.27.184.7',
                port: 22,
                dstHost: '172.27.184.11',
                dstPort: 3306,
                localHost: '127.0.0.1',
                localPort: 3334,
                username: 'root',
                password: 'Claro.2017'
            }, (err) => {
                if(err) reject(err);
                loggerFile.info('Tunel conectado.');
                // Conexion a GEOSalud
                let conexion = mysql.createConnection({
                    host: process.env.GEOSALUD_HOST,
                    port: process.env.GEOSALUD_PORT,
                    user: process.env.GEOSALUD_USER,
                    password: process.env.GEOSALUD_PASS,
                    database: process.env.GEOSALUD_DB
                });
                conexion.on('error', err => {
                    conexion.end();
                    reject(err);
                });
                conexion.connect((err) => {
                    if(err) {
                        conexion.end();
                        reject(err);
                    }
                    resolve(conexion);
                })
            })
        }, 100);
    });
}

function obtenerDiagnosticos() {
    return new Promise(function(resolve, reject) {
        setTimeout(() => {
            var diagnosticos = [];
            markey.obtenerUltimaFecha().then((data) => {
                if(!data) {
                    loggerFile.info('No se encontró información en obtenerUltimaFecha.');
                } else {
                    var ultimaFecha = data[0].Fecha;
                    var queryDiagnosticosGeo = `SELECT distinct TRS1.TipOSAbrev as 'Tipo', o.OsId as 'OS', DATE_FORMAT(o.OSFchHor, '%Y-%m-%d') as 'Fecha',
                    o.OsPersId as 'Persona', OSRRHHID, RRHHDESC, Concat(Concat(o.OSPersApe, ' ', o.OSPersApe2) , ' ', Concat(o.OSPersNom, ' ', o.OSPersNom2)) as 'Persona1', 
                    TRS1.FicNom as 'Ficha', TRS1.PregFrmDinaDesc as 'Pregunta', TRS1.OsFicResPregValTabDinValId as 'CodigoRespuesta', 
                    UPPER(TRS1.OsFicResPregResultado) as 'Respuesta'
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
                    where DATE_FORMAT(o.OSFchHor, '%Y-%m-%d') between '${ultimaFecha}' and CURDATE()
                    and TRS1.OsFicResPregResultado <> ''
                    order by o.OSFchHor ASC;`;
                    conectarTunel().then((conexion) => {
                        conexion.query(queryDiagnosticosGeo, (error, resultado) => {
                            if(error) {
                                conexion.query(queryDiagnosticosGeo, (error, resultado) => {
                                    if(error) {
                                        reject(`Error en la consulta de obtenerDiagnosticos: ${error}`);
                                    } else if(resultado.length != 0) {
                                        var response = {
                                            'diagnosticos': JSON.parse(JSON.stringify(resultado))
                                        }
                                        response.diagnosticos.forEach(diagnostico => {
                                            diagnosticos.push(diagnostico);
                                        })
                                        resolve(diagnosticos);
                                        conexion.end();
                                    } else {
                                        reject('No hay diagnosticos para migrar');
                                        conexion.end();
                                    }
                                })
                            } else {
                                var response = {
                                    'diagnosticos': JSON.parse(JSON.stringify(resultado))
                                }
                                response.diagnosticos.forEach(diagnostico => {
                                    diagnosticos.push(diagnostico);
                                })
                                resolve(diagnosticos);
                                conexion.end();
                            }  
                        });
                    }).catch((err) => {
                        reject(`No se pudo generar el tunel de conexión con GEOSalud: ${err}`);
                        conexion.end();
                    });                    
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
        res.status(404).send(`Hubo un problema consultando los diagnosticos: ${err}`);
    });
}

function migrarDiagnosticos(req, res) {
    obtenerDiagnosticos().then((data) => {
        res.send(markey.insertDiagnosticos(data));
    })
    .catch((err) => {
        loggerFile.error(`Hubo un problema consultando los diagnosticos: ${err}`);
        res.status(404).send(`Hubo un problema consultando los diagnosticos: ${err}`);
    });
}

module.exports = {
    obtenerDiagnosticos: obtenerDiagnosticos,
    migrarDiagnosticos: migrarDiagnosticos,
    mostrarDiagnosticos: mostrarDiagnosticos
}