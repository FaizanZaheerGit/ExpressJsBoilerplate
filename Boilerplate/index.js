const cors = require('cors');
const bodyParser = require("body-parser");
const express = require('express');
const fs = require('fs');
import helmet from "helmet";
const authentication_middleware = require('./middlewares/authentication_middleware');
const responses = require('./utils/responses');
const static_data = require('./config/static_data');
const firebase_utils = require('./utils/firebase_utils');

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(helmet());


require('dotenv').config()
const { PORT } = process.env;

// CONNECTING TO DB
require('./database/database_intialization');

const port = PORT || 5000;
const logger = require('./logger/logger');
const firebase_app = firebase_utils.FIREBASE_APP;

// ROUTES
app.get("/", (req, res) => {
    res.status(200).send(responses.get_response_object(responses.CODE_SUCCESS, null, "Server is Up And Running"));
    logger.info('200: Server is Up and Running');
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
                responses.CODE_INVALID_CALL, null, responses.MESSAGE_INVALID_CALL
            ))
        }
    else if ( req.params.type.toLowerCase() == "error") {
           fs.readFile('./error.log', (err, data) => {
            if (err) {
                logger.error("ERROR FROM READ LOGS API: " + err + " PARAM DATA: " + req.params);
                return res.status(responses.CODE_SUCCESS).send(responses.get_response_object(
                    responses.CODE_GENERAL_ERROR, { error: err.message }, responses.MESSAGE_GENERAL_ERROR
                ))
            }
            return res.status(responses.CODE_SUCCESS).send(responses.get_response_object(
                responses.CODE_SUCCESS, { data: data.toString() }, responses.MESSAGE_SUCCESS
            ))
            })
        }
        else if ( req.params.type.toLowerCase() == "combined") {
            fs.readFile('./combined.log', (err, data) => {
            if (err) {
                logger.error("ERROR FROM READ LOGS API: " + err + " PARAM DATA: " + req.params);
                return res.status(responses.CODE_SUCCESS).send(responses.get_response_object(
                    responses.CODE_GENERAL_ERROR, { error: err.message }, responses.MESSAGE_GENERAL_ERROR
                ))
            }
            return res.status(responses.CODE_SUCCESS).send(responses.get_response_object(
                responses.CODE_SUCCESS, { data: data.toString() }, responses.MESSAGE_SUCCESS
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
