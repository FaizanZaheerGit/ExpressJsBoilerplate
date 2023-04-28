const common_utils = require('../utils/common_utils');
const constants = require('../utils/constants');
const { v4 : uuidv4 } = require('uuid');

module.exports = {
    db_insert_single_record: async (collection, insert_data) => {
        insert_data[constants.UID] = uuidv4();
        insert_data[constants.CREATED_AT] = common_utils.get_current_epoch_time();
        insert_data[constants.UPDATED_AT] = common_utils.get_current_epoch_time();
        let new_data = await collection.create(insert_data);
        return new_data;
    },
    db_insert_many_records: async (collection, insert_data) => {
        insert_data.forEach(item => {
            item[constants.UID] = uuidv4();
            item[constants.CREATED_AT] = common_utils.get_current_epoch_time();
            item[constants.UPDATED_AT] = common_utils.get_current_epoch_time();
        });

        let new_data = await collection.insertMany(insert_data);
        return new_data;
    },
    db_read_single_record: async (collection, read_filter) => {
        return await collection.findOne(read_filter);
    },
    db_read_multiple_records: async (collection, read_filter, pageOptions={}) => {
        if(Object.keys(pageOptions).length != 0) {
            return collection.find(read_filter).skip(pageOptions.page * pageOptions.limit).limit(pageOptions.limit).sort({created_at: -1});
        }
        else {
            return await collection.find(read_filter).sort({created_at: -1});
        }
    },
    db_update_single_record: async (collection, read_filter, update_filter) => {
        update_filter[constants.UPDATED_AT] = common_utils.get_current_epoch_time();
        return await collection.updateOne(read_filter, update_filter);
    },
    db_update_multiple_records: async (collection, read_filter, update_filter) => {
        update_filter[constants.UPDATED_AT] = common_utils.get_current_epoch_time();
        return await collection.updateMany(read_filter, update_filter);
    },
    db_delete_record: async (collection, delete_filter) => {
        return await collection.deleteMany(delete_filter);
    }
}
