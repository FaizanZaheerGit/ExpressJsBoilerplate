const database_layer = require('../database/database_layer');
const responses = require('../utils/responses');
const userModel = require('../models/user_model');
const userUtils = require('../utils/user_utils');
const constants = require('../utils/constants');
const common_utils = require('../utils/common_utils');
const UsersModel = require('../models/user_model');
const TokenModel = require('../models/token_model');


module.exports = {
    createController: async (req, res) => {
        /*
            This function will validate and create a new user
            parameters: request, response
            return:
        */
        insert_data = req.body;
        const { error } = await common_utils.validate_data(insert_data);
        if (error) {
            return res.status(responses.CODE_SUCCESS).send(responses.get_response_object(
                responses.CODE_VALIDATION_FAILED, responses.MESSAGE_VALIDATION_FAILED + " key: " + error.details[0].context?.key
            ))
        }
        insert_data[constants.EMAIL_ADDRESS] = await insert_data[constants.EMAIL_ADDRESS].trim();
        insert_data[constants.EMAIL_ADDRESS] = await insert_data[constants.EMAIL_ADDRESS].toLowerCase();
        let existing_user = await database_layer.db_read_single_record(UsersModel, {email_address: insert_data[constants.EMAIL_ADDRESS]})
        if(existing_user) {
            return res.status(responses.CODE_SUCCESS).send(responses.get_response_object(
                responses.CODE_ALREADY_EXISTS, null, responses.MESSAGE_ALREADY_EXISTS([constants.USER, constants.EMAIL_ADDRESS])
            ))
        }
        password_array = await common_utils.encrypt_password(insert_data[constants.PASSWORD]);
        insert_data[constants.PASSWORD] = password_array[0];
        insert_data[constants.PASSWORD_SALT] = password_array[1];
        let new_user = await database_layer.db_insert_single_record(collection=userModel, insert_data=req.body);
        var new_user_obj = userUtils.get_user_object(new_user);
        return res.status(responses.CODE_CREATED).send(
            responses.get_response_object(responses.CODE_CREATED, {user: new_user_obj}, responses.MESSAGE_CREATED(constants.USER)));
    },
    readController: async(req, res) => {
        /*
            This function will read a list of all users, based on filters,
            if no filters given, it returns all users
            parameters: request, response
            return:
        */
        const read_filter = req.query || {};
        let users = await database_layer.db_read_multiple_records(userModel, read_filter);
        users = await userUtils.filter_user_object(users);
        return res.status(responses.CODE_SUCCESS).send(
            responses.get_response_object(responses.CODE_SUCCESS, {users: users}, responses.MESSAGE_SUCCESS));
    },
    updateController: async (req, res) => {
        /*
            This function will validate and update information of a existing user
            parameters: request, response
            return:
        */
        const read_filter = { uid: req.body.uid };
        let user = await database_layer.db_read_single_record(userModel, read_filter);
        if (!user) {
            let response_obj = responses.get_response_object(responses.CODE_UNPROCESSABLE_ENTITY,
                {}, responses.MESSAGE_NOT_FOUND([constants.USER, constants.UID]))
            delete response_obj.response_data;
            return res.status(responses.CODE_SUCCESS).send(response_obj);
        }
        const update_filter = req.body;
        delete update_filter.uid;
        const { error } = await common_utils.validate_data(update_filter);
        if (error) {
            return res.status(responses.CODE_SUCCESS).send(responses.get_response_object(
                responses.CODE_VALIDATION_FAILED, responses.MESSAGE_VALIDATION_FAILED + ": " + error.message
            ))
        }
        let update_user = await database_layer.db_update_single_record(userModel, read_filter, update_filter);
        update_user = await database_layer.db_read_single_record(userModel, read_filter);
        return res.status(200).send(responses.get_response_object(responses.CODE_SUCCESS,
            {user: userUtils.get_user_object(update_user)}, responses.MESSAGE_SUCCESS));
    },
    deleteController: async (req, res) => {
        /*
            This function will delete a user
            parameters: request, response
            return:
        */
        const delete_filter = { uid: req.params.id };
        let user = await database_layer.db_read_single_record(userModel, delete_filter);
        if (!user) {
            let response_obj = responses.get_response_object(responses.CODE_UNPROCESSABLE_ENTITY,
                {}, responses.MESSAGE_NOT_FOUND([constants.USER, constants.UID]))
            delete response_obj.response_data;
            return res.status(responses.CODE_SUCCESS).send(response_obj);
        }
        let deleted_user = await database_layer.db_delete_record(userModel, delete_filter);
        let users = await database_layer.db_read_multiple_records(userModel, {});
        return res.status(responses.CODE_SUCCESS).send(responses.get_response_object(responses.CODE_SUCCESS,
            {users: userUtils.filter_user_object(users)}, responses.MESSAGE_SUCCESS));
    },
    loginController: async (req, res) => {
        /*
            This function will validate and login a user
            parameters: request, response
            return:
        */
        let token_data = req.body;
        const { error } = await common_utils.validate_data(token_data);
        if (error) {
            return res.status(responses.CODE_SUCCESS).send(responses.get_response_object(
                responses.CODE_VALIDATION_FAILED, responses.MESSAGE_VALIDATION_FAILED + " key: " + error.details[0].context?.key
            ))
        }
        token_data[constants.EMAIL_ADDRESS] = await token_data[constants.EMAIL_ADDRESS].trim();
        token_data[constants.EMAIL_ADDRESS] = await token_data[constants.EMAIL_ADDRESS].toLowerCase();
        let user = await database_layer.db_read_single_record(UsersModel, {email_address: token_data[constants.EMAIL_ADDRESS]})
        if(!user) {
            return res.status(responses.CODE_SUCCESS).send(responses.get_response_object(
                responses.CODE_UNPROCESSABLE_ENTITY, null, responses.MESSAGE_INVALID_EMAIL_ADDRESS_OR_PASSWORD)
                )
        }
        let is_password = common_utils.compare_password(token_data[constants.PASSWORD], user[constants.PASSWORD])
        if (!is_password) {
            return res.status(responses.CODE_SUCCESS).send(responses.get_response_object(
                responses.CODE_UNPROCESSABLE_ENTITY, null, responses.MESSAGE_INVALID_EMAIL_ADDRESS_OR_PASSWORD)
            )
        }
        delete token_data[constants.EMAIL_ADDRESS]
        delete token_data[constants.PASSWORD]
        token_data[constants.USER] = user;
        const updated_tokens = await database_layer.db_update_multiple_records(TokenModel, { user: token_data[constants.USER] }, 
            { is_expired: true, expiry_time: common_utils.get_current_epoch_time(), purpose: "session_management" })
        const user_data = JSON.stringify(user);
        let access_token = await common_utils.create_jwt_token(user_data)
        token_data[constants.ACCESS_TOKEN] = access_token
        token_data[constants.PURPOSE] = "session_management"
        let token = await database_layer.db_insert_single_record(TokenModel, token_data)
        return res.status(responses.CODE_SUCCESS).send(responses.get_response_object(responses.CODE_SUCCESS,
            {access_token: token[constants.ACCESS_TOKEN]}, responses.MESSAGE_SUCCESS));
    },
    logoutController: async (req, res) => {
        const auth_header = req.headers['authorization'];
        const token = auth_header && auth_header.split(' ')[1];
        const updated_token = await database_layer.db_update_single_record(TokenModel, { access_token: token }, 
            { is_expired: true, expiry_time: common_utils.get_current_epoch_time() })
        return res.status(responses.CODE_SUCCESS).send(responses.get_response_object(responses.CODE_SUCCESS, null, 
            responses.MESSAGE_SUCCESS));
    }
}
