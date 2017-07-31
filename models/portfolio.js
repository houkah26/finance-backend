const mongoose = require('mongoose'),  
      Schema = mongoose.Schema;

//================================
// Portfolio Schema
//================================
const PortfolioSchema = new Schema({
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
  totalShares: {
    type: Number,
    min: 0,
    required: true
  }
});

module.exports = PortfolioSchema;