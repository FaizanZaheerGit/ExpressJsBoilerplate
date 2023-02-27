const mongoose = require('mongoose');
const { v4 : uuidv4 } = require('uuid')
const common_utils = require('../utils/common_utils');

const Schema = mongoose.Schema;

const TokenSchema = new mongoose.Schema({
    uid: {type: String, required: true, unique: true, default: uuidv4()},
    user: { type: Schema.Types.ObjectId, ref: 'users' },
    token: {type: String, default: ""},
    purpose: {type: String, default: ""},
    expiry_time: {type: Number, default: 0},
    is_expired: {type: Boolean, default: false},
    created_at: {type: Number, default: common_utils.get_current_epoch_time()},
    updated_at: {type: Number, default: common_utils.get_current_epoch_time()}
},
{versionKey: false});

const TokenModel = mongoose.model("token", TokenSchema);
module.exports = TokenModel;
