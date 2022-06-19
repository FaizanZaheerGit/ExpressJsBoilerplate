var bcrypt = require('bcryptjs');
var config = require('../config/config');
const responses = require('./responses');

module.exports = {
    get_current_epoch_time: () => {
        return Math.trunc(( Date.now() / 1000 ))
    },
    encrypt_password: async (password) => {
        const salt = await bcrypt.genSalt(config["SALT_WORK_FACTOR"]);
        const hashed_password = bcrypt.hashSync(password, salt);
        return [hashed_password, salt];
    },
    compare_password: async (input_password, user_password) => {
        return await bcrypt.compare(input_password, user_password).catch((err) => false);
    },
    validate_request_body: async(request_body, required_params, optional_params) => {
        var request_body_keys = Object.keys(request_body);
        var all = required_params.concat(optional_params);
        var missing_list = []

        for (let i = 0; i < required_params.length; i++){
            if (request_body.hasOwnProperty(required_params[i]) == false){
                missing_list.push(required_params[i])
            }
            else if (request_body[required_params[i]] === undefined || request_body[required_params[i]] === ""){
                missing_list.push(required_params[i])
            }

            if (typeof(request_body[required_params[i]]) == "object"){
                if (Object.keys(request_body[required_params[i]]).length == 0) {
                    missing_list.push(required_params[i])
                }
            }
        }
        if (missing_list.length != 0) {
            return responses.get_response_object(responses.CODE_MISSING_PARAMETERS,
                    null, responses.MESSAGE_MISSING_PARAMTERS(missing_list))
        }
        for (let j = 0; j < request_body_keys.length; j++){
            if (!(all.includes(request_body_keys[j]))){
                delete request_body[request_body_keys[j]]
            }
        }
        return responses.get_response_object(responses.CODE_SUCCESS, request_body, responses.MESSAGE_SUCCESS)
    }
}
