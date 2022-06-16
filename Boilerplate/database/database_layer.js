module.exports = {
    db_insert_single_record: async (collection, insert_data) => {
        let new_data = await collection.create(insert_data);
        return new_data;
    },
    db_read_single_record: async (collection, read_filter) => {
        return await collection.findOne(read_filter);
    },
    db_read_multiple_records: async (collection, read_filter) => {
        return await collection.find(read_filter);
    },
    db_update_single_record: async (collection, read_filter, update_filter) => {
        return await collection.updateOne(read_filter, update_filter);
    },
    db_update_multiple_records: async (collection, read_filter, update_filter) => {
        return await collection.updateMany(read_filter, update_filter);
    },
    db_delete_record: async (collection, delete_filter) => {
        return await collection.deleteMany(delete_filter);
    }
}
