const mongoose = require('mongoose');

const HistoricalSwingSchema = new mongoose.Schema(
  {
    stockSymbol: {
      type: String,
      required: true,
      index: true,
    },
    interval: {
      type: String,
      required: true,
      enum: [
        'ONE_MINUTE',
        'THREE_MINUTE',
        'FIVE_MINUTE',
        'TEN_MINUTE',
        'FIFTEEN_MINUTE',
        'THIRTY_MINUTE',
        'ONE_HOUR',
        'ONE_DAY',
      ],
      index: true,
    },
    timestamp: { type: Date, required: true, index: true },
    open: { type: Number, required: true },
    high: { type: Number, required: true },
    low: { type: Number, required: true },
    close: { type: Number, required: true },
    volume: { type: Number, required: true },
  },
  { timestamps: true }
);

const HistoricalSwing = mongoose.model(
  'HistoricalSwing',
  HistoricalSwingSchema
);

module.exports = HistoricalSwing;
