var express = require('express');
const { generateSmartApiSession } = require('../controllers/OptionsController');
var router = express.Router();

router.route('/').get(generateSmartApiSession);

module.exports = router;
