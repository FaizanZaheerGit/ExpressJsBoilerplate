const constants = require("./constants")

module.exports = {
    get_user_object: (user) => {
        user_obj = {
            uid: user[constants.UID],
            name: user[constants.NAME],
            full_name: (user[constants.NAME][constants.FIRST] + " " 
            + user[constants.NAME][constants.MIDDLE] + " " + user[constants.NAME][constants.LAST]),
            email_address: user[constants.EMAIL_ADDRESS],
            status: user[constants.STATUS],
            created_at: user[constants.CREATED_AT],
            updated_at: user[constants.UPDATED_AT]
        }
        return user_obj;
    },
    filter_user_object: function (users) {
        user_list = []
        for (var i = 0; i < users.length; i++) {
            user_list.push( this.get_user_object(users[i]) );
        }
        return user_list;
    }
}
