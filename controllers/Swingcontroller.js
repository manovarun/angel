const axios = require('axios');
const fs = require('fs');
const expressAsyncHandler = require('express-async-handler');
const AppError = require('../utils/AppError');
const { generateSessionAndFeedToken } = require('../utils/AppSession');

// Controller to backtest Nifty50 stock or index using token, symbol, or name
exports.HistoSwing = expressAsyncHandler(async (req, res, next) => {
  try {
    // Step 1: Get session and feed token
    const { feedToken, smartApi } = await generateSessionAndFeedToken();

    // Step 2: Extract parameters from req.body (token, symbol, name, fromdate, todate, interval)
    const { token, symbol, name, fromdate, todate, interval } = req.body;

    // Ensure that fromdate, todate, and interval are provided
    if (!fromdate || !todate || !interval) {
      return next(
        new AppError('Please provide valid fromdate, todate, and interval', 400)
      );
    }

    // Step 3: Read the OpenAPIScripMaster.json file to get stock/index token details
    const filePath = './OpenAPIScripMaster.json'; // Adjust the path as needed
    const scripMasterData = fs.readFileSync(filePath, 'utf8');
    const scripMaster = JSON.parse(scripMasterData);

    let stockDetails;

    // Step 4: Search for stock/index by token, symbol, or name
    if (token) {
      stockDetails = scripMaster.find((item) => item.token === token);
    } else if (symbol) {
      stockDetails = scripMaster.find(
        (item) => item.symbol.toUpperCase() === symbol.toUpperCase()
      );
    } else if (name) {
      stockDetails = scripMaster.find(
        (item) => item.name.toUpperCase() === name.toUpperCase()
      );
    }

    // If no stock or index is found, return a 404 error
    if (!stockDetails) {
      return next(
        new AppError('Stock/Index not found in OpenAPIScripMaster.json', 404)
      );
    }

    const stockToken = stockDetails.token;

    // Step 5: Make a request to the Historical API for fetching the stock/index's historical data
    const histoData = await smartApi.getCandleData({
      exchange: 'NSE',
      symboltoken: stockToken, // Use the token from OpenAPIScripMaster
      interval, // Pass the interval dynamically
      fromdate, // Pass the fromdate dynamically
      todate, // Pass the todate dynamically
    });

    // Step 6: Ensure the data is valid
    if (!histoData || !histoData.status) {
      return next(
        new AppError('Error fetching historical data for the stock/index', 400)
      );
    }

    // Step 7: Return the historical data for the specified stock/index and time period
    res.status(200).json({
      status: 'success',
      stock: stockDetails,
      historicalData: histoData.data, // Array of candle data
    });
  } catch (error) {
    console.error('Error during stock/index backtest:', error);
    next(new AppError('Failed to backtest the stock/index', 500));
  }
});
