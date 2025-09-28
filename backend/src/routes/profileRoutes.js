const express = require('express');
const profileController = require('../controllers/profileController');
const router = express.Router();

router.get('/all', profileController.getAllProfiles);
router.get('/:username', profileController.getProfile);
router.get('/:username/posts', profileController.getPosts);
router.post('/:username/refresh', profileController.refreshProfile);

module.exports = router;
