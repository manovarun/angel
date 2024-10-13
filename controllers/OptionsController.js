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

    // Historical Methods
    const histoData = await smartApi.getCandleData({
      exchange: 'NFO', // NSE Futures and Options
      symboltoken: '43414', // Token for Nifty50 Futures
      interval: 'ONE_MINUTE', // Use suitable interval (ONE_MINUTE, FIVE_MINUTE, etc.)
      fromdate: '2024-10-01 09:15', // Start date and time for fetching data
      todate: '2024-10-10 15:30', // End date and time for fetching data
    });

    res.status(200).json({
      status: 'success',
      sessionData,
      profileData,
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

    // Read and parse the JSON file
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading the file:', err);
        return;
      }
      // Parse the JSON data
      const scripMaster = JSON.parse(data);

      // Filter to find the specific Nifty50 Futures or Options
      const niftyInstruments = scripMaster.filter((item) =>
        item.symbol.includes('BANKNIFTY')
      );

      res.status(200).json({
        status: 'success',
        niftyInstruments,
      });
    });
  } catch (error) {
    next(new AppError(error, 400));
  }
});
