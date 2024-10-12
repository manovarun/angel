var express = require('express');
var router = express.Router();
const axios = require('axios');

const { SmartAPI } = require('smartapi-javascript');
const expressAsyncHandler = require('express-async-handler');

// Initialize SmartAPI with your credentials
const smartApi = new SmartAPI({
  api_key: 'your_api_key', // Replace with your API key
  access_token: 'your_access_token', // Replace with your access token
  refresh_token: 'your_refresh_token', // Replace with your refresh token, if necessary
});

exports.getBankNiftyOptionsData = expressAsyncHandler(
  async (req, res, next) => {
    try {
      // Fetch instrument data for Bank Nifty options (find the correct instrument token for CE/PE)
      const instrument = 'BANKNIFTY'; // Bank Nifty symbol
      const expiry = '2024-10-31'; // Replace with actual expiry date
      const strikePrice = 51200; // Closest strike price to 51189.85
      const ceSymbol = `BANKNIFTY${expiry}${strikePrice}CE`; // Call Option symbol
      const peSymbol = `BANKNIFTY${expiry}${strikePrice}PE`; // Put Option symbol

      // Define params to fetch option chain
      const params = {
        exchange: 'NFO',
        symbol: ceSymbol, // Fetch CE data first
        interval: 'ONE_MINUTE',
        fromdate: '2024-10-11 15:00', // Start fetching at 15:00 to 15:15
        todate: '2024-10-11 15:15',
      };

      // Fetch CE (Call Option) data
      const ceData = await smartApi.getCandleData(params);
      console.log('CE Data:', ceData);

      // Now change params for PE (Put Option)
      params.symbol = peSymbol;

      // Fetch PE (Put Option) data
      const peData = await smartApi.getCandleData(params);
      console.log('PE Data:', peData);

      const bnOptionData = { ceData, peData };

      res.status(statusCode).json({ status: 'success', bnOptionData });
    } catch (error) {
      return next(new AppError('Error fetching Bank Nifty options data:', 400));
    }
  }
);

// router.get('/', getBankNiftyOptionsData);

router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
