const mongoose = require('mongoose');
const config = require('../config/config')

// CONNECT TO MONGO DB
mongoose.connect(config["MONGO_DB_URI"], {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// CHECK CONNECTION
mongoose.connection
.on('open', () => { console.log('DB CONNECTION SUCCESSFUL') })
.on('close', () => { console.log('DB CONNECTION CLOSED') })
.on('error', (error) => { console.log('ERROR IN CONNECTING DB:\n' + error) });

module.exports = mongoose;
