const mongoose = require('mongoose'),  
      Schema = mongoose.Schema;

//================================
// Stock History Schema
//================================
const HistorySchema = new Schema({
  // Stock ticker name
  stockSymbol: {
    type: String,
    uppercase: true,
    required: true
  },
  stockName: {
    type: String,
    required: true
  },
  action: {
    type: String,
    uppercase: true,
    enum: ['BUY', 'SELL'],
    required: true
  },
  // price per share
  price: {
    type: Number,
    min: 0,
    required: true
  },
  // Number of shares for the given transaction
  shares: {
    type: Number,
    min: 0,
    required: true
  }
},
{timestamps: true});

module.exports = HistorySchema;