const winston = require('winston');


const log_format = winston.format.printf( ({level, message, timestamp, stack}) => {
    console.log('M: ' + message + '\nS: ' + stack)
    return `Time: ${timestamp}, level: ${level}, message: ${stack || message}`;
});

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
        winston.format.errors({stack: true}),
        log_format
    ),
    transports: [
        new winston.transports.File({filename: 'error.log', level: 'error'}),
        new winston.transports.File({filename: 'combined.log'})
    ]
});

module.exports = logger;