const { authenticator } = require('otplib');
const { SmartAPI } = require('smartapi-javascript');
const expressAsyncHandler = require('express-async-handler');
const AppError = require('../utils/AppError');

// Initialize SmartAPI
const smartApi = new SmartAPI({
  api_key: process.env.SMARTAPI_KEY,
});

exports.generateSmartApiSession = expressAsyncHandler(
  async (req, res, next) => {
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

      res.status(200).json({
        status: 'success',
        sessionData,
        profileData,
      });
    } catch (error) {
      next(new AppError('Error generating SmartAPI session', 400));
    }
  }
);
