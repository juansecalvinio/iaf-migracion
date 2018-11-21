var Agenda = require('agenda');
var mongoConnectionString = '127.0.0.1:27017/migracion_diagnosticos';

var agenda = new Agenda({db: {address: mongoConnectionString, collection: 'log'}});

agenda.define('enviarLogs', (job) => {
    console.log(`Enviando log. Hora: ${new Date().getMinutes()} : ${new Date().getSeconds()}`);
});

agenda.on('ready', () => {
    agenda.every('3 seconds', 'enviarLogs');
    agenda.start();
})