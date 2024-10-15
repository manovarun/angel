var express = require('express');
const {
  getHistoricalData,
  getSymbolData,
  shortStraddleSeSd,
  getHistoricalDataForExpiredContract,
} = require('../controllers/backtestController');
var router = express.Router();

router.route('/').get(getHistoricalData);
router.route('/symbol').get(getSymbolData);

//Short Straddle Single Expiry Single Day
router.route('/shortstraddlesesd').get(shortStraddleSeSd);

//Short Straddle Multiple Expiry Multiple Day
router.route('/histoptions').get(getHistoricalDataForExpiredContract);

module.exports = router;
