const express = require('express');
const usersController = require('../controllers/users_controller');
const constants = require('../utils/constants');
const common_utils = require('../utils/common_utils');
const authentication_middleware = require('../middlewares/authentication_middleware');
const logger = require('../logger/logger');
const multer = require('multer');

const router = express.Router();

const Multer = multer({
    storage: multer.memoryStorage(),
    limits: 5 * 1024 * 1024,

})

router.post('/create', async (req, res) => {
    let required_list = [constants.NAME, constants.EMAIL_ADDRESS, constants.PASSWORD];
    let optional_list = [constants.IMAGE];
    let response = await common_utils.validate_request_body(req.body, required_list, optional_list)
    if (response["response_code"] != 200) {
        logger.error(`Missing Paramters: ${JSON.stringify(response["response_message"])}`)
        return res.status(200).send(response)
    }
    req.body = response["response_data"];
    return usersController.createController(req, res);
});

router.get('/read', async (req, res) => {
    let required_list = [];
    let optional_list = [constants.EMAIL_ADDRESS];
    let response = await common_utils.validate_request_body(req.query, required_list, optional_list)
    if (response["response_code"] != 200) {
        return res.status(200).send(response)
    }
    req.query = response["response_data"]
    return usersController.readController(req, res);
});

router.put('/update', authentication_middleware, async (req, res) => {
    let required_list = [constants.UID];
    let optional_list = [constants.NAME, constants.STATUS, constants.IMAGE];
    let response = await common_utils.validate_request_body(req.body, required_list, optional_list)
    if (response["response_code"] != 200) {
        logger.error(`Missing Paramters: ${JSON.stringify(response["response_message"])}`)
        return res.status(200).send(response)
    }
    req.body = response["response_data"];
    return usersController.updateController(req, res);
});

router.delete('/delete/:id', async (req, res) => {
    return usersController.deleteController(req, res);
});

router.post('/login', async (req, res) => {
    let required_list = [constants.EMAIL_ADDRESS, constants.PASSWORD];
    let response = await common_utils.validate_request_body(req.body, required_list, [])
    if (response["response_code"] != 200) {
        logger.error(`Missing Paramters: ${JSON.stringify(response["response_message"])}`)
        return res.status(200).send(response)
    }
    req.body = response["response_data"];
    return usersController.loginController(req, res);
})

router.get('/logout', authentication_middleware, async(req, res) => {
    return usersController.logoutController(req, res);
})

router.post('/forget-password', async (req, res) => {
    let required_list = [constants.EMAIL_ADDRESS]
    let response = await common_utils.validate_request_body(req.body, required_list, [])
    if (response["response_code"] != 200) {
        return res.status(200).send(response);
    };
    return usersController.forget_password_controller(req, res);
});

router.post('/reset-password', async (req, res) => {
    let required_list = [constants.UID, constants.TOKEN, constants.NEW_PASSWORD]
    let response = await common_utils.validate_request_body(req.body, required_list, [])
    if (response["response_code"] != 200) {
        return res.status(200).send(response);
    };
    return usersController.reset_passsword_controller(req, res);
});

router.post('/change-password', authentication_middleware, async (req, res) => {
    let required_list = [constants.UID, constants.OLD_PASSWORD, constants.NEW_PASSWORD]
    let response = await common_utils.validate_request_body(req.body, required_list, [])
    if (response["response_code"] != 200) {
        return res.status(200).send(response);
    };
    return usersController.change_passsword_controller(req, res);
})

router.post('/upload/:type', authentication_middleware, Multer.single('file'), async (req, res) => {
    return usersController.uploadImageController(req, res);
})

router.post('/social/login/:channel', async (req, res) => {
    let required_list = [constants.OAUTH_CODE];
    let optional_list = [constants.NAME];
    let response = await common_utils.validate_request_body(req.body, required_list, optional_list);
    if (response.response_code != 200) {
      return res.status(200).send(response);
    };
    req.body = response.response_data;
    return usersController.socialLoginController(req, res);
  })

module.exports = router;
