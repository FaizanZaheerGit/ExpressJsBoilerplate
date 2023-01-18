require('dotenv').config()

const { MONGODB_URI } = process.env;

if (!MONGODB_URI) { console.log('EMPTY MONGO DB URI!') }

const googleConfig = {
    "web": {
        "client_id": "",
        "project_id": "",
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_secret": "",
        "get_user_info_uri": "https://www.googleapis.com/oauth2/v2/userinfo",
        "redirect_uris": [
            "http://127.0.0.1:3000/social/signup",
        ],
        "javascript_origins": [
            "http://127.0.0.1:3000/"
        ]
    }
}

const facebookConfig = {
    "web": {
        "client_id": "",
        "client_secret": "",
        "token_uri": "https://graph.facebook.com/v12.0/oauth/access_token",
        "get_user_info_uri": "https://graph.facebook.com/v12.0/me",
        "redirect_uris": []
    }
}


const appleConfig = {
    "client_id": "",
    "client_secret": "",
    "private_key": "",
    "team_id": "",
    "key_id": "",
    "token_uri": "https://appleid.apple.com/auth/token",
    "client_secret_uri": 'https://appleid.apple.com',
    "redirect_uris": ['http://127.0.0.1:3000/signup/apple']
}

module.exports = {
    SALT_WORK_FACTOR: 10,
    MONGO_DB_URI: MONGODB_URI,
    GOOGLE_CONFIG: googleConfig,
    FACEBOOK_CONFIG: facebookConfig,
    APPLE_CONFIG: appleConfig
}
