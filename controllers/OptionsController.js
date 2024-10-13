const { authenticator } = require('otplib');
const { SmartAPI } = require('smartapi-javascript');
const fs = require('fs');
const expressAsyncHandler = require('express-async-handler');
const AppError = require('../utils/AppError');

// Initialize SmartAPI
const smartApi = new SmartAPI({
  api_key: process.env.SMARTAPI_KEY,
});

exports.getHistoricalData = expressAsyncHandler(async (req, res, next) => {
  try {
    const clientCode = process.env.SMARTAPI_CLIENT_CODE;
    const password = process.env.SMARTAPI_PASSWORD;

    // Generate TOTP dynamically using the secret from the .env file
    const totp = authenticator.generate(process.env.SMARTAPI_TOTP_SECRET);

    const sessionData = await smartApi.generateSession(
      clientCode,
      password,
      totp
    );

    if (!sessionData.status) {
      return next(new AppError(`Error: ${sessionData.message}`, 400));
    }

    const profileData = await smartApi.getProfile();

    const { exchange, symboltoken, interval, fromdate, todate } = req.body;

    const histoData = await smartApi.getCandleData({
      exchange: exchange,
      symboltoken: symboltoken,
      interval: interval,
      fromdate: fromdate,
      todate: todate,
    });

    res.status(200).json({
      status: 'success',
      // sessionData,
      // profileData,
      histoData,
    });
  } catch (error) {
    next(new AppError('Error generating SmartAPI session', 400));
  }
});

exports.getSymbolData = expressAsyncHandler(async (req, res, next) => {
  try {
    // Path to the JSON file (you can download it and place it locally)
    const filePath = './OpenAPIScripMaster.json';

    // Extract the search criteria from the request body
    const { symbol, name, expiry, strike } = req.body;

    // Read and parse the JSON file
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading the file:', err);
        return next(new AppError('Error reading the file', 500));
      }

      // Parse the JSON data
      const scripMaster = JSON.parse(data);

      // Filter the data based on the provided search criteria
      const filteredInstruments = scripMaster.filter(
        (item) =>
          (!symbol || item.symbol === symbol) &&
          (!name || item.name === name) &&
          (!expiry || item.expiry === expiry) &&
          (!strike || item.strike === strike) // Ensure strike price is compared as a string
      );

      // Return the filtered instruments
      res.status(200).json({
        status: 'success',
        filteredInstruments,
      });
    });
  } catch (error) {
    next(new AppError(error, 400));
  }
});
