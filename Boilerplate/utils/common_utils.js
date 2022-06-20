const bcrypt = require('bcryptjs');
const config = require('../config/config');
const responses = require('./responses');
const jwt = require('jsonwebtoken');

require('dotenv').config()
const { ACCESS_TOKEN_SECRET_KEY, REFRESH_TOKEN_SECRET_KEY } = process.env;

module.exports = {
    get_current_epoch_time: () => {
        /*
            This function will return the current epoch time
            parameters:
            return:
        */
        return Math.trunc(( Date.now() / 1000 ))
    },
    encrypt_password: async (password) => {
        /*
            This function will create a salt and encrypted password
            parameters: password
            return: encrypted password and salt
        */
        const salt = await bcrypt.genSalt(config["SALT_WORK_FACTOR"]);
        const hashed_password = bcrypt.hashSync(password, salt);
        return [hashed_password, salt];
    },
    compare_password: async (input_password, user_password) => {
        /*
            This function will compare 2 encrypted passwords
            parameters: input_password, user_password
            return: boolean of comparison
        */
        return await bcrypt.compare(input_password, user_password).catch((err) => false);
    },
    validate_request_body: async(request_body, required_params, optional_params) => {
        /*
            This function will validate a request body for values and required and optional parameter values,
            and remove the extra paramters
            parameters: request_body, requried_params, optional_params
            return:
        */
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
    },
    create_jwt_token: async (data) => {
        /*
            This function will create a new jwt token
            parameters: data
            return:
        */
        return jwt.sign(data, ACCESS_TOKEN_SECRET_KEY);
    },
    verify_jwt_token: async (token) => {
        /*
            This function will verify a jwt token
            parameters: token
            return:
        */
        return jwt.verify(token, ACCESS_TOKEN_SECRET_KEY, (err, user) => {
            if (err) {
                console.log(err);
                return {code: 401, user: null};
            }
            else {
                return {code: 200, user: user};
            }
        });
    }
}
