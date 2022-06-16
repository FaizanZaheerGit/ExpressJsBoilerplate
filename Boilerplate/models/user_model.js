const mongoose = require('mongoose');
const { v4 : uuidv4 } = require('uuid')
const common_utils = require('../utils/common_utils');
const static_data = require('../config/static_data');

const UsersSchema = new mongoose.Schema({
    uid: {type: String, required: true, unique: true, default: uuidv4()},
    name: {type: Object, required: true, unique: true},  // FORMAT -> {first: "a", middle: "b", last: "c"}
    email_address: {type: String, required: true, unique: true, lowercase: true},
    password: {type: String, required: true},
    password_salt: {type: String, reqruied: true},
    status: {type: Object, required: true, default: static_data.STATUSES[0]},
    created_at: {type: Number, default: common_utils.get_current_epoch_time()},
    updated_at: {type: Number, default: common_utils.get_current_epoch_time()}
});


const UsersModel = mongoose.model("users", UsersSchema);
module.exports = UsersModel;