require('dotenv').config()

const { MONGODB_URI } = process.env;

if (!MONGODB_URI) { console.log('EMPTY MONGO DB URI!') }

module.exports = {
    SALT_WORK_FACTOR: 10,
    MONGO_DB_URI: MONGODB_URI
}
