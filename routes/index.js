var express = require('express');
const {
  getHistoricalData,
  getSymbolData,
} = require('../controllers/OptionsController');
var router = express.Router();

router.route('/').get(getHistoricalData);
router.route('/symbol').get(getSymbolData);

module.exports = router;
