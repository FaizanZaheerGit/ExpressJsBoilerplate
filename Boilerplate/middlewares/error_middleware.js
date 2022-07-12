const responses = require("../utils/responses");

function error_middleware (err, req, res, next) {
    console.log("ERROR: \n" + JSON.stringify(err));
    if (err) {
        return res.status(200).send(responses.get_response_object( 452, null, "Something Went Wrong!" ))
    }
    next();
}

module.exports = error_middleware;
