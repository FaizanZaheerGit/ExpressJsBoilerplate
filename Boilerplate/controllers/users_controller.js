const database_layer = require('../database/database_layer');
const responses = require('../utils/responses');
const userModel = require('../models/user_model');
const userUtils = require('../utils/user_utils');
const constants = require('../utils/constants');
const common_utils = require('../utils/common_utils');
const UsersModel = require('../models/user_model');
const TokenModel = require('../models/token_model');
const logger = require('../logger/logger');
const config = require('../config/config');
const static_data = require('../config/static_data');
const axios = require('axios').default;
const jwt = require('jsonwebtoken');


module.exports = {
    createController: async (req, res) => {
        /*
            This function will validate and create a new user
            parameters: request, response
            return:
        */
        try {
        let insert_data = req.body;
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
        let new_user = await database_layer.db_insert_single_record(userModel, insert_data);
        var new_user_obj = userUtils.get_user_object(new_user);
        return res.status(responses.CODE_CREATED).send(
            responses.get_response_object(responses.CODE_CREATED, {user: new_user_obj}, responses.MESSAGE_CREATED(constants.USER)));
        }
        catch (err) {
            logger.error("ERROR FROM CREATE CONTROLLER: " + err + " POST DATA: " + JSON.stringify(req.body))
            return res.status(200).send(
                responses.get_response_object(
                    responses.CODE_GENERAL_ERROR, null, responses.MESSAGE_GENERAL_ERROR
                )
            )
        }
    },
    readController: async(req, res) => {
        /*
            This function will read a list of all users, based on filters,
            if no filters given, it returns all users
            parameters: request, response
            return:
        */
        try {
        const read_filter = req.query || {};
        let users = await database_layer.db_read_multiple_records(userModel, read_filter);
        users = await userUtils.filter_user_object(users);
        return res.status(responses.CODE_SUCCESS).send(
            responses.get_response_object(responses.CODE_SUCCESS, {users: users}, responses.MESSAGE_SUCCESS));
        }
        catch (err) {
            logger.error("ERROR FROM READ CONTROLLER: " + err + " QUERY DATA: " + JSON.stringify(req.query))
            return res.status(200).send(
                responses.get_response_object(
                    responses.CODE_GENERAL_ERROR, null, responses.MESSAGE_GENERAL_ERROR
                )
            )
        }
    },
    updateController: async (req, res) => {
        /*
            This function will validate and update information of a existing user
            parameters: request, response
            return:
        */
        try {
        const read_filter = { uid: req.body.uid };
        let user = await database_layer.db_read_single_record(userModel, read_filter);
        if (!user) {
            let response_obj = responses.get_response_object(responses.CODE_UNPROCESSABLE_ENTITY,
                null, responses.MESSAGE_NOT_FOUND([constants.USER, constants.UID]))
            return res.status(responses.CODE_SUCCESS).send(response_obj);
        }
        const update_filter = req.body;
        delete update_filter.uid;
        const { error } = await common_utils.validate_data(update_filter);
        if (error) {
            return res.status(responses.CODE_SUCCESS).send(responses.get_response_object(
                responses.CODE_VALIDATION_FAILED, responses.MESSAGE_VALIDATION_FAILED + ": " + error.details[0].context?.key
            ))
        }
        let update_user = await database_layer.db_update_single_record(userModel, read_filter, update_filter);
        update_user = await database_layer.db_read_single_record(userModel, read_filter);
        return res.status(200).send(responses.get_response_object(responses.CODE_SUCCESS,
            {user: userUtils.get_user_object(update_user)}, responses.MESSAGE_SUCCESS));
        }
        catch (err) {
            logger.error("ERROR FROM UPDATE CONTROLLER: " + err + " POST DATA: " + JSON.stringify(req.body))
            return res.status(200).send(
                responses.get_response_object(
                    responses.CODE_GENERAL_ERROR, null, responses.MESSAGE_GENERAL_ERROR
                )
            )
        }
    },
    deleteController: async (req, res) => {
        /*
            This function will delete a user
            parameters: request, response
            return:
        */
        try {
        const delete_filter = { uid: req.params.id };
        let user = await database_layer.db_read_single_record(userModel, delete_filter);
        if (!user) {
            let response_obj = responses.get_response_object(responses.CODE_UNPROCESSABLE_ENTITY,
                null, responses.MESSAGE_NOT_FOUND([constants.USER, constants.UID]))
            return res.status(responses.CODE_SUCCESS).send(response_obj);
        }
        let deleted_user = await database_layer.db_delete_record(userModel, delete_filter);
        let users = await database_layer.db_read_multiple_records(userModel, {});
        return res.status(responses.CODE_SUCCESS).send(responses.get_response_object(responses.CODE_SUCCESS,
            {users: userUtils.filter_user_object(users)}, responses.MESSAGE_SUCCESS));
        }
        catch (err) {
            logger.error("ERROR FROM DELETE CONTROLLER: " + err + " PARAM DATA: " + req.params)
            return res.status(200).send(
                responses.get_response_object(
                    responses.CODE_GENERAL_ERROR, null, responses.MESSAGE_GENERAL_ERROR
                )
            )
        }
    },
    loginController: async (req, res) => {
        /*
            This function will validate and login a user
            parameters: request, response
            return:
        */
        try {
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
        token_data[constants.TOKEN] = access_token
        token_data[constants.PURPOSE] = "session_management"
        let token = await database_layer.db_insert_single_record(TokenModel, token_data)
        return res.status(responses.CODE_SUCCESS).send(responses.get_response_object(responses.CODE_SUCCESS,
            {token: token[constants.TOKEN]}, responses.MESSAGE_SUCCESS));
        }
        catch (err) {
            logger.error("ERROR FROM LOGIN CONTROLLER: " + err + " POST DATA: " + JSON.stringify(req.body))
            return res.status(200).send(
                responses.get_response_object(
                    responses.CODE_GENERAL_ERROR, null, responses.MESSAGE_GENERAL_ERROR
                )
            )
        }
    },
    logoutController: async (req, res) => {
        try {
        const auth_header = req.headers['authorization'];
        const token = auth_header && auth_header.split(' ')[1];
        const updated_token = await database_layer.db_update_single_record(TokenModel, { token: token }, 
            { is_expired: true, expiry_time: common_utils.get_current_epoch_time() })
        return res.status(responses.CODE_SUCCESS).send(responses.get_response_object(responses.CODE_SUCCESS, null, 
            responses.MESSAGE_SUCCESS));
        }
        catch (err) {
            logger.error("ERROR FROM LKOGUT CONTROLLER: " + err)
            return res.status(200).send(
                responses.get_response_object(
                    responses.CODE_GENERAL_ERROR, null, responses.MESSAGE_GENERAL_ERROR
                )
            )
        }
    },
    socialLoginController: async (req, res) => {
        /*
          This function will socially login the account from the third party application's account
          parameters: request, response
          return:
      */
      try {
        let oauth_code = req.body[constants.OAUTH_CODE]
        req.params.channel = await req.params.channel.trim().toLowerCase()
        if (req.params.channel != 'google' && req.params.channel != 'facebook' && req.params.channel != 'apple') {
          return res.status(responses.CODE_SUCCESS).send(responses.get_response_object(
            responses.CODE_INVALID_CALL, null, responses.MESSAGE_INVALID_CALL
          ))
        }

        else if (req.params.channel == 'google') {
          let google_response = await axios.post(
                config.GOOGLE_CONFIG["web"]["token_uri"], {
                client_id: config.GOOGLE_CONFIG["web"]["client_id"],
                client_secret: config.GOOGLE_CONFIG["web"]["client_secret"],
                redirect_uri: (config.GOOGLE_CONFIG["web"]["redirect_uris"][0]),
                grant_type: "authorization_code",
                code: oauth_code
            }
          )
          if (google_response.status != 200) {
            console.log('RESPONSE FROM GOOGLE TOKEN: ' + JSON.stringify(google_response))
            logger.info('RESPONSE FROM GOOGLE TOKEN: ' + JSON.stringify(google_response))
            return res.status(200).send(responses.get_response_object(
              responses.CODE_UNPROCESSABLE_ENTITY, null, responses.MESSAGE_INVALID_CALL
            ))
          }
          google_response = google_response?.data
          console.log('RESPONSE FROM GOOGLE TOKEN: ' + JSON.stringify(google_response))
          logger.info('RESPONSE FROM GOOGLE TOKEN: ' + JSON.stringify(google_response))

          let google_user_info_uri = await axios.get(
            config.GOOGLE_CONFIG["web"]["get_user_info_uri"], {
              headers: { Authorization: `Bearer ${google_response["access_token"]}` } }
          )
          if (google_user_info_uri.status != 200) {
            return res.status(200).send(responses.get_response_object(
              responses.CODE_UNPROCESSABLE_ENTITY, null, responses.MESSAGE_INVALID_CALL
            ))
          }
          if (google_user_info_uri.status != 200) {
            console.log('RESPONSE FROM GOOGLE USER INFO URI: ' + JSON.stringify(google_user_info_uri))
            logger.info('RESPONSE FROM GOOGLE USER INFO URI: ' + JSON.stringify(google_user_info_uri))
            return res.status(200).send(responses.get_response_object(
              responses.CODE_UNPROCESSABLE_ENTITY, null, responses.MESSAGE_INVALID_CALL
            ))
          }
          google_user_info_uri = google_user_info_uri?.data
          console.log('RESPONSE FROM GOOGLE USER INFO URI: ' + JSON.stringify(google_user_info_uri))
          logger.info('RESPONSE FROM GOOGLE USER INFO URI: ' + JSON.stringify(google_user_info_uri))
    
          let user = {}
          let existing_user = await database_layer.db_read_single_record(userModel, 
            { oauth_code: google_user_info_uri["id"], registration_channel: static_data.REGISTRATION_CHANNELS[1], status: static_data.STATUSES[0] })
    
          if(!existing_user) {
            let user_insert_data = {
              name: google_user_info_uri[constants.NAME],
              email_address: google_user_info_uri["email"],
              oauth_code: google_user_info_uri["id"],
              registration_channel: static_data.REGISTRATION_CHANNELS[1],
              status: static_data.STATUSES[0]
            }
            let new_user = await database_layer.db_insert_single_record(userModel, user_insert_data)
            user = new_user
          }
          else {
            user = existing_user
          }
          let token_data = {}
          token_data[constants.USER] = user
          const updated_tokens = await database_layer.db_update_multiple_records(
            TokenModel,
            { user: token_data[constants.USER], purpose: "session_management" },
            { is_expired: true, expiry_time: common_utils.get_current_epoch_time() }
          );
          let user_data = JSON.stringify(user);
          let access_token = await common_utils.create_jwt_token(user_data);
          token_data[constants.TOKEN] = access_token;
          token_data[constants.PURPOSE] = constants.SESSION_MANAGEMENT;
          let token = await database_layer.db_insert_single_record(TokenModel, token_data);
          return res.status(responses.CODE_SUCCESS).send(responses.get_response_object(
            responses.CODE_SUCCESS, 
            {token: token[constants.TOKEN], user: await userUtils.get_user_object(user) }, 
            responses.MESSAGE_SUCCESS
          ))
        }

        else if (req.params.channel == 'facebook') {
          let facebook_user_info_uri = await axios.get(
            config.FACEBOOK_CONFIG["web"]["get_user_info_uri"], {
              params : { 
                fields: "id,email,name",
                access_token: oauth_code
              }
            }
          )
          if (facebook_user_info_uri.status != 200) {
            console.log('RESPONSE FROM FACEBOOK USER INFO URI: ' + JSON.stringify(facebook_user_info_uri))
            logger.info('RESPONSE FROM FACEBOOK USER INFO URI' + JSON.stringify(facebook_user_info_uri))
            return res.status(200).send(responses.get_response_object(
              responses.CODE_UNPROCESSABLE_ENTITY, null, responses.MESSAGE_INVALID_CALL
            ))
          }
          facebook_user_info_uri = facebook_user_info_uri?.data
          console.log('RESPONSE FROM FACEBOOK USER INFO URI: ' + JSON.stringify(facebook_user_info_uri))
          logger.info('RESPONSE FROM FACEBOOK USER INFO URI' + JSON.stringify(facebook_user_info_uri))
    
          let user = {}
          if (!facebook_user_info_uri.hasOwnProperty("email")) {
                let uid = uuidv4().substring(0, 5)
                facebook_user_info_uri["email"] = "User-" + uid + "@mail.com"
          }
          let existing_user = await database_layer.db_read_single_record(userModel, 
            { oauth_code: facebook_user_info_uri["id"], registration_channel: static_data.REGISTRATION_CHANNELS[2], status: static_data.STATUSES[0] })

          if (!existing_user) {
            let user_insert_data = {
              name: facebook_user_info_uri[constants.NAME],
              email_address: facebook_user_info_uri["email"],
              oauth_code: facebook_user_info_uri["id"],
              registration_channel: static_data.REGISTRATION_CHANNELS[2],
              status: static_data.STATUSES[0]
            }
            let new_user = await database_layer.db_insert_single_record(userModel, user_insert_data)
            user = new_user
          }
          else {
            user = existing_user
          }
          let token_data = {}
          token_data[constants.USER] = user
          const updated_tokens = await database_layer.db_update_multiple_records(
            TokenModel,
            { user: token_data[constants.USER], purpose: "session_management" },
            { is_expired: true, expiry_time: common_utils.get_current_epoch_time() }
          );
          let user_data = JSON.stringify(user);
          let access_token = await common_utils.create_jwt_token(user_data);
          token_data[constants.TOKEN] = access_token;
          token_data[constants.PURPOSE] = constants.SESSION_MANAGEMENT;
          let token = await database_layer.db_insert_single_record(TokenModel, token_data);
          return res.status(responses.CODE_SUCCESS).send(responses.get_response_object(
            responses.CODE_SUCCESS, 
            {token: token[constants.TOKEN], user: await userUtils.get_user_object(user) }, 
            responses.MESSAGE_SUCCESS
          ))
        }

        else if (req.params.channel == 'apple') {
          let client_secret = jwt.sign({}, config.APPLE_CONFIG["private_key"], {
            algorithm: 'ES256',
            expiresIn: '1h',
            audience: APPLE_DOMAIN,
            issuer: config.APPLE_CONFIG["team_id"],
            subject: config.APPLE_CONFIG["service_id"],
            keyid: config.APPLE_CONFIG["key_id"]
          });
    
          console.log('GENERATED CLIENT SECRET: ', client_secret)
          logger.info("GENERATED CLIENT SECRET: ", client_secret)
    
          config.APPLE_CONFIG["client_secret"] = client_secret
    
          let apple_response = await axios.post(
            'https://appleid.apple.com/auth/token',
            {
                grant_type: 'authorization_code',
                oauth_code,
                client_secret: config.APPLE_CONFIG["client_secret"],
                client_id: config.APPLE_CONFIG["client_id"],
                redirect_uri: config.APPLE_CONFIG["redirect_uris"][0]
            },
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, } );
    
            if (apple_response.status != 200) {
              console.log('APPLE TOKEN URI RESPONSE: ' + JSON.stringify(apple_response))
              logger.info('APPLE TOKEN URI RESPONSE: ' + JSON.stringify(apple_response))
              return res.status(200).send(responses.get_response_object(
                responses.CODE_UNPROCESSABLE_ENTITY, null, responses.MESSAGE_INVALID_CALL
              ))
            }
            apple_response = JSON.parse(apple_response?.data)
            console.log('APPLE TOKEN URI RESPONSE: ' + JSON.stringify(apple_response))
            logger.info("APPLE TOKEN URI RESPONSE: " + JSON.stringify(apple_response))
    
          let id_token = apple_response["id_token"]
          console.log('ID TOKEN FOR APPLE SIGN: ', id_token)
          logger.info("ID TOKEN FOR APPLE SIGN: : ", id_token)
    
          let apple_user_info = jwt.decode(id_token)
          console.log('ID TOKEN FOR APPLE SIGN: ', JSON.stringify(apple_user_info))
          logger.info("ID TOKEN FOR APPLE SIGN: : ", JSON.stringify(apple_user_info))
    
          let existing_user = await database_layer.db_read_single_record(userModel, 
            { oauth_code: apple_user_info["email"], registration_channel: static_data.REGISTRATION_CHANNELS[3], status: static_data.STATUSES[0] })

          let user = {}
          if (!existing_user) {
            let user_insert_data = {
              name: apple_user_info[constants.NAME],
              email_address: apple_user_info["email"],
              oauth_code: apple_user_info["sub"],
              registration_channel: static_data.REGISTRATION_CHANNELS[3],
              status: static_data.STATUSES[0]
            }
            let new_user = await database_layer.db_insert_single_record(userModel, user_insert_data)
            user = new_user
          }
          else {
            user = existing_user
          }
          let token_data = {}
          token_data[constants.USER] = user
          const updated_tokens = await database_layer.db_update_multiple_records(
            TokenModel,
            { user: token_data[constants.USER], purpose: "session_management" },
            { is_expired: true, expiry_time: common_utils.get_current_epoch_time() }
          );
          let user_data = JSON.stringify(user);
          let access_token = await common_utils.create_jwt_token(user_data);
          token_data[constants.TOKEN] = access_token;
          token_data[constants.PURPOSE] = constants.SESSION_MANAGEMENT;
          let token = await database_layer.db_insert_single_record(TokenModel, token_data);
          let customer = await database_layer.db_read_single_record(customer_model, { user: user._id });
          return res.status(responses.CODE_SUCCESS).send(responses.get_response_object(
            responses.CODE_SUCCESS, 
            {token: token[constants.TOKEN], user: await userUtils.get_user_object(user) }, 
            responses.MESSAGE_SUCCESS
        ))
        }

        return res.status(200).send(responses.get_response_object(
          responses.CODE_SUCCESS, null, responses.MESSAGE_SUCCESS
        ))
      }
        catch(err) {
          console.log('ERROR IN SOCIAL LOGIN CONTROLLER: ' + err)
          logger.error('ERROR IN SOCIAL LOGIN CONTROLLER: ' + err)
          return res.status(responses.CODE_SUCCESS).send( responses.get_response_object(
            responses.CODE_GENERAL_ERROR, null, responses.MESSAGE_GENERAL_ERROR
        ))
      }
    }
}
