var express = require('express');
const {
  getHistoricalData,
  getSymbolData,
  backtestStrategy,
} = require('../controllers/OptionsController');
var router = express.Router();

router.route('/').get(getHistoricalData);
router.route('/symbol').get(getSymbolData);
router.route('/backtest').get(backtestStrategy);

module.exports = router;
