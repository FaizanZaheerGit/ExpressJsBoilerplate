module.exports = {
    get_response_object: (response_code, response_data=null, response_message=null) => {
        let response = {};
        response["response_code"] = response_code;
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
    CODE_UNAUTHORIZED_ACCESS: 401,
    CODE_UNPROCESSABLE_ENTITY: 422,
    CODE_GENERAL_ERROR: 452,
    CODE_MISSING_PARAMETERS: 4001,
    CODE_ALREADY_EXISTS: 4002,
    CODE_VALIDATION_FAILED: 4003,
    MESSAGE_SUCCESS: "Successful Response",
    MESSAGE_UNAUTHORIZED_ACCESS: "Unauthorized Access",
    MESSAGE_CREATED: (collection_name) => { return `${collection_name} created successfully` },
    MESSAGE_NOT_FOUND: (params) => { return `${params[0]} with this ${params[1]} is not found` },
    MESSAGE_INVALID_EMAIL_ADDRESS_OR_PASSWORD: "Invalid email address or password",
    MESSAGE_ALREADY_EXISTS: (params) => { return `${params[0]} with this ${params[1]} already exists` },
    MESSAGE_GENERAL_ERROR: "Something Went Wrong",
    MESSAGE_SERVER_ERROR: "Internal Server Error",
    MESSAGE_MISSING_PARAMTERS: (params) => { return `Some Paramters Are Missing: ${params}` },
    MESSAGE_VALIDATION_FAILED: "Validation failed "
};
