const cors = require('cors');
const bodyParser = require("body-parser");
const express = require('express');
const responses = require('./utils/responses');

const app = express();
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())


require('dotenv').config()
const { PORT } = process.env;

// CONNECTING TO DB
require('./database/database_intialization');

const port = PORT || 5000;
const logger = require('./logger/logger');


// ROUTES
app.get("/", (req, res) => {
    res.status(200).send(responses.get_response_object(response_code=responses.CODE_SUCCESS,
        response_data=null, response_message="Server is Up And Running"))
    logger.info('200: Server is Up and Running')
    return;
});

app.use('/api/users', require('./routes/users_views'))

// SETUP LISTEN FOR APP ON PORT
app.listen(port, () => {
    console.log(`SERVER STARTED:  LISTENTING ON PORT ${port}`)
});
