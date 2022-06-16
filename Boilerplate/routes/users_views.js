const express = require('express');
const usersController = require('../controllers/users_controller');

const router = express.Router();

router.post('/create', (req, res) => {
    return usersController.createController(req, res);
});

router.get('/read', async (req, res) => {
    return usersController.readController(req, res);
});

router.put('/update', async (req, res) => {
    return usersController.updateController(req, res);
});

router.delete('/delete/:id', async (req, res) => {
    return usersController.deleteController(req, res);
});

module.exports = router;
