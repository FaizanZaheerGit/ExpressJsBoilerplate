var bcrypt = require('bcryptjs');
var config = require('../config/config');

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
    }
}
