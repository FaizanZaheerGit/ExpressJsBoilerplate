const responses = require('../utils/responses');

function error_middleware(err, req, res, next){
    err_code = String(err.status);
    if (err_code[0] == 4) {
        return res.status(200).send(responses.get_response_object(response_code=CODE_GENERAL_ERROR,
            response_data=null, response_message=responses.MESSAGE_GENERAL_ERROR))
    }
    if(err_code == 5) {
        return res.status(200).send(responses.get_response_object(response_code=err.status,
            response_data=null, response_message=responses.MESSAGE_SERVER_ERROR))
    }
    next()
}
module.exports = error_middleware
