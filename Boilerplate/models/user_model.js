const mongoose = require('mongoose');
const common_utils = require('../utils/common_utils');
const static_data = require('../config/static_data');

const UsersSchema = new mongoose.Schema({
    name: {type: String, required: true},
    email_address: {type: String, required: true, unique: true, lowercase: true},
    password: {type: String, required: true},
    password_salt: {type: String, reqruied: true},
    image: {type: String, required: false, default: ""},
    oauth_code: {type: String, required: false, default: ""},
    status: {type: Object, required: true, enum: static_data.STATUSES, default: static_data.STATUSES[0]},
    registration_channel: {type: Object, required: false, enum: static_data.REGISTRATION_CHANNELS, default: static_data.REGISTRATION_CHANNELS[0]},
    created_at: {type: Number, default: common_utils.get_current_epoch_time()},
    updated_at: {type: Number, default: common_utils.get_current_epoch_time()}
},
{versionKey: false});


const UsersModel = mongoose.model("users", UsersSchema);
module.exports = UsersModel;
