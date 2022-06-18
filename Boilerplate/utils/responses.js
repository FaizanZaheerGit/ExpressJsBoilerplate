module.exports = {
    get_response_object: (response_code, response_data=null, response_message=null) => {
        let response = {};
        response["repsonse_code"] = response_code;
        if (response_data) {
            response["response_data"] = response_data;
        }
        if (response_message) {
            response["response_message"] = response_message;
        }
        return response;
    },
    CODE_SUCCESS: 200,
    CODE_CREATED: 201,
    CODE_UNROCESSABLE_ENTITY: 422,
    CODE_GENERAL_ERROR: 452,
    MESSAGE_SUCCESS: "Successful Response",
    MESSAGE_CREATED: (collection_name) => { return `${collection_name} created successfully` },
    MESSAGE_NOT_FOUND: (params) => { return `${params[0]} with this ${params[1]} is not found` },
    MESSAGE_GENERAL_ERROR: "Something Went Wrong",
    MESSAGE_SERVER_ERROR: "Internal Server Error"
};
