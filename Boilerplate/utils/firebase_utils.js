const firebase_admin = require('firebase-admin');
const { FIREBASE_CONFIG } = require('../config/config');
const { v4: uuidv4 } = require('uuid');
const logger = require('../logger/logger');
const responses = require('../utils/responses');

const firebaseApp = firebase_admin.initializeApp({
    credential: firebase_admin.credential.cert(FIREBASE_CONFIG),
    storageBucket: FIREBASE_CONFIG.storageBucket
});
const storage = firebase_admin.storage(firebaseApp).bucket();

async function uploadImage(file) {
        /*
            This function will upload images to the firebase
            parameters: file
            return:
        */
    if (!file) {
        return responses.get_response_object(responses.CODE_MISSING_PARAMETERS,
            null, responses.MESSAGE_MISSING_PARAMTERS("File"))
    }
    const fileName = Date.now() + "-" + uuidv4() + "." + file.originalname.split('.').pop();
    const _file = storage.file(fileName)
    const stream = _file.createWriteStream({
        metadata: {
            contentType: file.mimetype
        }
    });
    stream.on("error", (err) => {
        console.log('COULD NOT UPLOAD IMAGE TO FIREBASE: ' + err);
        logger.error('COULD NOT UPLOAD IMAGE TO FIREBASE: ' + err);
    })
    stream.on("finish", async () => {
        try {
            await _file.makePublic()
            return `https://storage.googleapis.com/${FIREBASE_CONFIG.storageBucket}/${fileName}`

        } catch (err) {
            console.log('COULD NOT UPLOAD IMAGE TO FIREBASE: ' + err);
            logger.error('COULD NOT UPLOAD IMAGE TO FIREBASE: ' + err);
        }
    })
    stream.end(file.buffer);
    return `https://storage.googleapis.com/${FIREBASE_CONFIG.storageBucket}/${fileName}`
}

module.exports = {
    FIREBASE_APP: firebaseApp,
    STORAGE: storage,
    UPLOAD_IMAGE: uploadImage
};
