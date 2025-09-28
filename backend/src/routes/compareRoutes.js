const express = require('express');
const compareController = require('../controllers/compareController');
const router = express.Router();

router.get('/', compareController.compareProfiles);

module.exports = router;
