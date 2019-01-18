require('dotenv').config();
const mssql = require('mssql');
const loggerFile = require('./logger').getLogger('file');

const config = {
    user: process.env.MKE_USER,
    password: process.env.MKE_PASS,
    server: process.env.MKE_SERVER,
    database: process.env.MKE_DB,
    // user: process.env.MK_USER,
    // password: process.env.MK_PASS,
    // server: process.env.MK_SERVER,
    // database: process.env.MK_DB,
    pool: {
        max: 0,
        min: 0,
        increment: 0,
        idleTimeoutMillis: 1000000
    },
    options: {
        encrypt: true
    }
};

const sqlConnection = new mssql.ConnectionPool(config);

function insertDiagnosticos(data) {
    sqlConnection.close();
    sqlConnection.connect(config).then(pool => {
        var request = new mssql.Request(pool);
        Array.prototype.forEach.call(data, obj => {
            var queryUpdate = `UPDATE DIAGNOSTICOSGEO SET Tipo = '${obj.Tipo}', OS = '${obj.OS}', Fecha = '${obj.Fecha}', Persona = ${obj.Persona}, Nombre = '${obj.Persona1}', 
            Ficha = '${obj.Ficha}', Pregunta = '${obj.Pregunta}', Codigo_Respuesta = ${obj.CodigoRespuesta}, Respuesta = '${obj.Respuesta}', audi_Fecha = CONVERT(VARCHAR, GETDATE(), 120)
            WHERE Tipo = '${obj.Tipo}'
            AND OS = '${obj.OS}'
            AND Fecha = '${obj.Fecha}'
            AND Persona = ${obj.Persona}
            AND Nombre = '${obj.Persona1}'
            AND Ficha = '${obj.Ficha}'
            AND Pregunta = '${obj.Pregunta}'
            AND Codigo_Respuesta = ${obj.CodigoRespuesta}
            AND Respuesta = '${obj.Respuesta}'`;
            request.query(queryUpdate).then((recordset) => {
                if (recordset.rowsAffected == 0) {
                    var query = `INSERT INTO DIAGNOSTICOSGEO (Tipo, OS, Fecha, Persona, Nombre, Ficha, Pregunta, Codigo_Respuesta, Respuesta, audi_Fecha) 
                    VALUES ('${obj.Tipo}', ${obj.OS}, '${obj.Fecha}', ${obj.Persona}, '${obj.Persona1}', '${obj.Ficha}', 
                    '${obj.Pregunta}', ${obj.CodigoRespuesta}, '${obj.Respuesta}', CONVERT(VARCHAR, GETDATE(), 120))`;
                    request.query(query).then((recordset) => {
                        if (recordset.rowsAffected == 0) {
                            loggerFile.error(`No se ha insertado ningún dato | Tipo: ${obj.Tipo} ; OS: ${obj.OS} ; Fecha OS: ${obj.Fecha} ; Persona: ${obj.Persona} - ${obj.Persona1}`);
                        } else {
                            loggerFile.info(`Dato insertado correctamente. Rows affected: ${recordset.rowsAffected} | Tipo: ${obj.Tipo} ; OS: ${obj.OS} ; Fecha OS: ${obj.Fecha} ; Persona: ${obj.Persona} - ${obj.Persona1}`);
                        }
                    }).catch((err) => {
                        loggerFile.error(`Hubo un problema insertando ${err} | Tipo: ${obj.Tipo} ; OS: ${obj.OS} ; Fecha OS: ${obj.Fecha} ; Persona: ${obj.Persona} - ${obj.Persona1}`);
                    })
                } else {
                    loggerFile.info(`Dato actualizado correctamente. Rows updated: ${recordset.rowsAffected} | Tipo: ${obj.Tipo} ; OS: ${obj.OS} ; Fecha OS: ${obj.Fecha} ; Persona: ${obj.Persona} - ${obj.Persona1}`);
                }
            }).catch((err) => {
                loggerFile.error(`Hubo un problema actualizando ${err} | Tipo: ${obj.Tipo} ; OS: ${obj.OS} ; Fecha OS: ${obj.Fecha} ; Persona: ${obj.Persona} - ${obj.Persona1}`);
            })
        })
    }).catch((err) => {
        loggerFile.error(`Hubo un problema con la conexión ${err}`);
    });
}

function obtenerUltimaFecha() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            var query = `SELECT TOP 1 CONVERT(VARCHAR, Fecha, 120) as Fecha FROM DIAGNOSTICOSGEO ORDER BY Fecha DESC`;
            sqlConnection.close();
            sqlConnection.connect(config).then(pool => {
                var request = new mssql.Request(pool);
                request.query(query).then((recordset) => {
                    if (recordset.recordset == '') {
                        resolve(null);
                    } else {
                        var fecha = recordset.recordset;
                        resolve(fecha);
                    }
                }).catch((err) => {
                    reject(err);
                })
            }).catch((err) => {
                reject(err);
            });
        }, 100);
    });
}

module.exports = {
    insertDiagnosticos: insertDiagnosticos,
    obtenerUltimaFecha: obtenerUltimaFecha
}