require('dotenv').config()

const { MONGODB_URI } = process.env;
module.exports = {
    SALT_WORK_FACTOR: 10,
    MONGO_DB_URI: MONGODB_URI
}
