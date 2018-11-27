require('dotenv').config();
const mssql = require('mssql');
const loggerConsole = require('./logger').getLogger('console');
const loggerFile = require('./logger').getLogger('file');

const config = {
    user: process.env.MKE_USER,
    password: process.env.MKE_PASS,
    server: process.env.MKE_SERVER,
    database: process.env.MKE_DB,
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

function obtenerDiagnosticos(req, res) {
    const query = 'select top 1 * from DIAGNOSTICOSGEO order by Fecha desc';
    sqlConnection.close();
    sqlConnection.connect().then(() => {
        const request = new mssql.Request(sqlConnection);
        request.query(query, (err, result) => {
            if (err) {
                loggerFile.error(`Error en la consulta ${err}`);
                loggerConsole.error(`Error en la consulta ${err}`);
                res.status(404).send(`Error en la consulta ${err}`);
            } else {
                var response = {
                    'diagnostico': result.recordset
                }
                res.send(JSON.stringify(response));
                sqlConnection.close();
            }
        });
    }).catch((err) => {
        loggerFile.error(`Error en la conexión: ${err}`);
        loggerConsole.error(`Error en la conexión: ${err}`);
        res.status(500).send(`Error en la conexión: ${err}`);
        sqlConnection.close();
    });
}

function insertPrueba(req, res) {
    sqlConnection.connect().then(pool => {
        const request = new mssql.Request(pool);
        request.input('Tipo', 'CEXT');
        request.input('OS', 125291);
        request.input('Fecha', '2018-11-01');
        request.input('Persona', 92530);
        request.input('Nombre', 'GUERRERO  MONICA INES ');
        request.input('Ficha', 'PRIMERA CONSULTA');
        request.input('Pregunta', 'DIAGNOSTICO ONCOL. TUM.SOLIDOS');
        request.input('CodigoRespuesta', 12);
        request.input('Respuesta', 'MELANOMA');
        var queryMigracion = `INSERT INTO DIAGNOSTICOSGEO (Tipo, OS, Fecha, Persona, Nombre, Ficha, Pregunta, Codigo_Respuesta, Respuesta, audi_Fecha) 
                    VALUES (@Tipo, @Os, @Fecha, @Persona, @Nombre, @Ficha, 
                    @Pregunta, @CodigoRespuesta, @Respuesta, GETDATE())`;
        request.query(queryMigracion).then((recordset) => {
            if (recordset.rowsAffected === 0) {
                loggerFile.error('No se ha insertado ningún dato');
                loggerConsole.error('No se ha insertado ningún dato');
                res.status(422).send('No se ha insertado ningún dato');
            } else {
                loggerFile.info(`Dato insertado correctamente. Rows affected: ${recordset.rowsAffected}`);
                loggerConsole.info(`Dato insertado correctamente. Rows affected: ${recordset.rowsAffected}`);
                res.send(recordset.rowsAffected);
            }
            sqlConnection.close();
        }).catch((err) => {
            loggerFile.error(`Hubo un problema con la consulta ${err}`);
            loggerConsole.error(`Hubo un problema con la consulta ${err}`);
            res.status(404).send(`Hubo un problema con la consulta ${err}`);
            sqlConnection.close();
        });
    }).catch((err) => {
        loggerFile.error(`Hubo un problema con la conexión ${err}`);
        loggerConsole.error(`Hubo un problema con la conexión ${err}`);
        res.status(500).send(`Hubo un problema con la conexión ${err}`);
        sqlConnection.close();
    });
}

function insertPruebaPorParametro(data, req, res) {
    sqlConnection.close();
    sqlConnection.connect().then(pool => {
        var request = new mssql.Request(pool);
        request.input('Tipo', data.Tipo);
        request.input('OS', data.OS);
        request.input('Fecha', data.Fecha);
        request.input('Persona', data.Persona);
        request.input('Nombre', data.Persona1);
        request.input('Ficha', data.Ficha);
        request.input('Pregunta', data.Pregunta);
        request.input('CodigoRespuesta', data.CodigoRespuesta);
        request.input('Respuesta', data.Respuesta);
        var queryMigracion = `INSERT INTO DIAGNOSTICOSGEO (Tipo, OS, Fecha, Persona, Nombre, Ficha, Pregunta, Codigo_Respuesta, Respuesta, audi_Fecha) 
                    VALUES (@Tipo, @Os, @Fecha, @Persona, @Nombre, @Ficha, 
                    @Pregunta, @CodigoRespuesta, @Respuesta, GETDATE())`;
        request.query(queryMigracion).then((recordset) => {
            if (recordset.rowsAffected === 0) {
                loggerFile.error('No se ha insertado ningún dato');
                loggerConsole.error('No se ha insertado ningún dato');
                res.status(422).send('No se ha insertado ningún dato');
            } else {
                loggerFile.info(`Dato insertado correctamente. Rows affected: ${recordset.rowsAffected}`);
                loggerConsole.info(`Dato insertado correctamente. Rows affected: ${recordset.rowsAffected}`);
                res.send(recordset.rowsAffected);
            }
            sqlConnection.close();
        }).catch((err) => {
            loggerFile.error(`Hubo un problema con la consulta ${err}`);
            loggerConsole.error(`Hubo un problema con la consulta ${err}`);
            res.status(404).send(`Hubo un problema con la consulta ${err}`);
            sqlConnection.close();
        });
    }).catch((err) => {
        loggerFile.error(`Hubo un problema con la conexión ${err}`);
        loggerConsole.error(`Hubo un problema con la conexión ${err}`);
        res.status(500).send(`Hubo un problema con la conexión ${err}`);
        sqlConnection.close();
    });
}

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
                            loggerFile.error('No se ha insertado ningún dato');
                            loggerConsole.error('No se ha insertado ningún dato');
                        } else {
                            loggerFile.info(`Dato insertado correctamente. Rows affected: ${recordset.rowsAffected}`);
                            loggerConsole.info(`Dato insertado correctamente. Rows affected: ${recordset.rowsAffected}`);
                        }
                    }).catch((err) => {
                        loggerFile.error(`Hubo un problema con la consulta ${err}`);
                        loggerConsole.error(`Hubo un problema con la consulta ${err}`);
                    })
                } else {
                    loggerFile.info(`Dato insertado correctamente. Rows affected: ${recordset.rowsAffected}`);
                    loggerConsole.info(`Dato insertado correctamente. Rows affected: ${recordset.rowsAffected}`);
                }
            }).catch((err) => {
                loggerFile.error(`Hubo un problema con la consulta ${err}`);
                loggerConsole.error(`Hubo un problema con la consulta ${err}`);
            })
        })
    }).catch((err) => {
        loggerFile.error(`Hubo un problema con la conexión ${err}`);
        loggerConsole.error(`Hubo un problema con la conexión ${err}`);
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
    insertPrueba: insertPrueba,
    insertPruebaPorParametro: insertPruebaPorParametro,
    insertDiagnosticos: insertDiagnosticos,
    obtenerDiagnosticos: obtenerDiagnosticos,
    obtenerUltimaFecha: obtenerUltimaFecha
}