const log4js = require('log4js');
log4js.configure({
    appenders: { 
        log: { type: 'file', filename: './server.log' },
        console: { type: 'console' }
    },
    categories: {
        default: { appenders: ['log', 'console'], level: 'all' },
        file: { appenders: ['log'], level: 'all' },
        console: { appenders: ['console'], level: 'all' }
    }
});

module.exports = log4js;