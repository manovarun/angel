var express = require('express');
const { getBankNiftyOptionsData } = require('../controllers/OptionsController');
var router = express.Router();

router.route('/').get(getBankNiftyOptionsData);

module.exports = router;
