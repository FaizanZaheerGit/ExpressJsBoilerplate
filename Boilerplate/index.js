const cors = require('cors');
const bodyParser = require("body-parser");
const express = require('express');
const fs = require('fs');
const authentication_middleware = require('./middlewares/authentication_middleware');
const responses = require('./utils/responses');
const static_data = require('./config/static_data');

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

app.get('/api/static-data', (req, res) => {
    return res.status(responses.CODE_SUCCESS).send(
        responses.get_response_object(responses.CODE_SUCCESS, static_data, responses.MESSAGE_SUCCESS)
    )
})

app.get("/api/logs/:type", authentication_middleware, (req, res) => {
    try {
    if (req.params.type.toLowerCase() != "error" && req.params.type.toLowerCase() != "combined") {
            return res.status(responses.CODE_SUCCESS).send(responses.get_response_object(
                responses.CODE_GENERAL_ERROR, null, responses.MESSAGE_GENERAL_ERROR
            ))
        }
    else if ( req.params.type.toLowerCase() == "error") {
           fs.readFile('./error.log', (err, data) => {
            if (err) {
                logger.error("ERROR FROM READ LOGS API: " + err + " PARAM DATA: " + req.params);
                return res.status(responses.CODE_SUCCESS).send(responses.get_response_object(
                    responses.CODE_GENERAL_ERROR, { error: error }, responses.MESSAGE_GENERAL_ERROR
                ))
            }
            return res.status(responses.CODE_SUCCESS).send(responses.get_response_object(
                responses.CODE_SUCCESS, { data: data }, responses.MESSAGE_SUCCESS
            ))
            })
        }
        else if ( req.params.type.toLowerCase() == "combined") {
            fs.readFile('./combined.log', (err, data) => {
            if (err) {
                logger.error("ERROR FROM READ LOGS API: " + err + " PARAM DATA: " + req.params);
                return res.status(responses.CODE_SUCCESS).send(responses.get_response_object(
                    responses.CODE_GENERAL_ERROR, { error: error }, responses.MESSAGE_GENERAL_ERROR
                ))
            }
            return res.status(responses.CODE_SUCCESS).send(responses.get_response_object(
                responses.CODE_SUCCESS, { data: data }, responses.MESSAGE_SUCCESS
            ))
            })
        }
    }
    catch (err) {
        logger.error("ERROR FROM READ LOGS API: " + err + " PARAM DATA: " + req.params);
        return res.status(responses.CODE_SUCCESS).send(responses.get_response_object(
            responses.CODE_GENERAL_ERROR, null, responses.MESSAGE_GENERAL_ERROR
        ))
    }
})

app.use('/api/users', require('./routes/users_views'))

// SETUP LISTEN FOR APP ON PORT
app.listen(port, () => {
    console.log(`SERVER STARTED:  LISTENTING ON PORT ${port}`)
});
