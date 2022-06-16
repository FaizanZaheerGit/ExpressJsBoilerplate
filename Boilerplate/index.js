const cors = require('cors');
const express = require('express');
const responses = require('./utils/responses');

const app = express();
app.use(cors())
app.use(express.json())

require('dotenv').config()
const { PORT } = process.env;

// CONNECTING TO DB
require('./database/database_intialization');

const port = PORT || 5000;


// ROUTES
app.get("/", (req, res) => {
    res.status(200).send(responses.get_response_object(response_code=responses.CODE_SUCCESS,
        response_data=null, response_message="Server is Up And Running"))
});

app.use('/api/users', require('./routes/users_views'))

// SETUP LISTEN FOR APP ON PORT
app.listen(port, () => {
    console.log(`SERVER STARTED:  LISTENTING ON PORT ${port}`)
});
