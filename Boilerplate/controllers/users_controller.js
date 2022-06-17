const database_layer = require('../database/database_layer');
const responses = require('../utils/responses');
const userModel = require('../models/user_model');
const userUtils = require('../utils/user_utils');
const constants = require('../utils/constants');
const common_utils = require('../utils/common_utils');


module.exports = {
    createController: async (req, res) => {
        insert_data = req.body;
        insert_data[constants.EMAIL_ADDRESS] = await insert_data[constants.EMAIL_ADDRESS].trim();
        password_array = await common_utils.encrypt_password(insert_data[constants.PASSWORD]);
        insert_data[constants.PASSWORD] = password_array[0];
        insert_data[constants.PASSWORD_SALT] = password_array[1];
        let new_user = await database_layer.db_insert_single_record(collection=userModel, insert_data=req.body);
        var new_user_obj = userUtils.get_user_object(new_user);
        return res.status(responses.CODE_CREATED).send(
            responses.get_response_object(responses.CODE_CREATED, {user: new_user_obj}, responses.MESSAGE_CREATED(constants.USER)));
    },
    readController: async(req, res) => {
        const read_filter = req.query || {};
        let users = await database_layer.db_read_multiple_records(userModel, read_filter);
        users = await userUtils.filter_user_object(users);
        return res.status(responses.CODE_SUCCESS).send(
            responses.get_response_object(responses.CODE_SUCCESS, {users: users}, responses.MESSAGE_SUCCESS));
    },
    updateController: async (req, res) => {
        const read_filter = { uid: req.body.uid };
        let user = await database_layer.db_read_single_record(userModel, read_filter);
        if (!user) {
            let response_obj = responses.get_response_object(responses.CODE_UNROCESSABLE_ENTITY,
                {}, responses.MESSAGE_NOT_FOUND([constants.USER, constants.UID]))
            delete response_obj.response_data;
            return res.status(responses.CODE_SUCCESS).send(response_obj);
        }
        const update_filter = req.body;
        delete update_filter.uid;
        let update_user = await database_layer.db_update_single_record(userModel, read_filter, update_filter);
        update_user = await database_layer.db_read_single_record(userModel, read_filter);
        return res.status(200).send(responses.get_response_object(responses.CODE_SUCCESS,
            {user: userUtils.get_user_object(update_user)}, responses.MESSAGE_SUCCESS));
    },
    deleteController: async (req, res) => {
        const delete_filter = { uid: req.params.id };
        let user = await database_layer.db_read_single_record(userModel, delete_filter);
        if (!user) {
            let response_obj = responses.get_response_object(responses.CODE_UNROCESSABLE_ENTITY,
                {}, responses.MESSAGE_NOT_FOUND([constants.USER, constants.UID]))
            delete response_obj.response_data;
            return res.status(responses.CODE_SUCCESS).send(response_obj);
        }
        let deleted_user = await database_layer.db_delete_record(userModel, delete_filter);
        let users = await database_layer.db_read_multiple_records(userModel, {});
        return res.status(responses.CODE_SUCCESS).send(responses.get_response_object(responses.CODE_SUCCESS,
            {users: userUtils.filter_user_object(users)}, responses.MESSAGE_SUCCESS));
    }
}
