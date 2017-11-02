const axios = require("axios"),
  User = require("../models/users"),
  helperFunctions = require("./helperFunctions"),
  config = require("../config/main");
setUserInfoForResponse = helperFunctions.setUserInfoForResponse;

//========================================
// User Info Route
//========================================
exports.getInfo = (req, res) => {
  userInfo = setUserInfoForResponse(req.user);

  res.status(200).json({
    user: userInfo
  });
};

//========================================
// User Add Funds Route
//========================================
exports.addFunds = (req, res, next) => {
  const fundAmount = parseFloat(req.body.fundAmount);

  // Return error if fund amount is not valid
  if (isNaN(fundAmount) || fundAmount < 0) {
    return res
      .status(422)
      .send({ message: "You must enter a valid fund amount." });
  }

  // Return error if fund amount is not valid
  if (fundAmount > 1000000) {
    return res.status(418).send({
      message:
        "WHAT?! You think I'm just going give you over a million dollars? You're crazy!"
    });
  }

  User.findById(req.user._id, (err, user) => {
    if (err) {
      return next(err);
    } else {
      // Update user cash amount by adding fund amount
      user.cash += fundAmount;

      // Update user total funds added
      user.cashAdded += fundAmount;

      user.save((err, user) => {
        if (err) {
          return next(err);
        }

        const userInfo = setUserInfoForResponse(user);

        // respond with updated user
        res.status(200).json({
          user: userInfo
        });
      });
    }
  });
};

//========================================
// User Get History Routes
//========================================
exports.getHistory = (req, res, next) => {
  User.findById(req.user._id, (err, user) => {
    if (err) {
      return next(err);
    } else {
      // respond with history
      res.status(200).json({
        history: user.transactionHistory
      });
    }
  });
};

//========================================
// User Portfolio Route, Get Current Stock Price and Respond with Portfolio
//========================================
exports.getPortfolio = (req, res, next) => {
  const portfolio = req.user.portfolio;

  // If Portfolio is empty respond with empty array
  if (portfolio.length === 0) {
    res.status(200).json({
      portfolio: []
    });

    return next();
  }

  const symbolsArray = portfolio.map(stock => stock.stockSymbol);
  const symbolsString = symbolsArray.join();

  const headers = {
    headers: { Authorization: config.stockAPIkey, Accept: "application/json" }
  };

  axios
    .get(
      `https://sandbox.tradier.com/v1/markets/quotes?symbols=${symbolsString}`,
      headers
    )
    .then(response => {
      const quoteResponse = response.data.quotes;

      // Convert to array if not array (single quote)
      const quoteArray = Array.isArray(quoteResponse.quote)
        ? quoteResponse.quote
        : [quoteResponse.quote];

      const portfolioWithPrices = mapPrices(portfolio, quoteArray);

      // respond with portfolio including current prices
      res.status(200).json({
        portfolio: portfolioWithPrices
      });
    })
    .catch(error => {
      next(error);
    });
};

//========================================
// Helper Functions
//========================================

// Map prices to portfolio
const mapPrices = (portfolio, quoteArray) => {
  return portfolio.map(stock => {
    // convert mongoose doc to regular js object
    const stockWithPrice = stock.toObject();

    // Add price for matching symbol from quoteArray
    quoteArray.forEach(stockQuote => {
      if (stock.stockSymbol === stockQuote.symbol) {
        stockWithPrice.price = stockQuote.last;
        stockWithPrice.total =
          stockWithPrice.price * stockWithPrice.totalShares;
      }
    });
    return stockWithPrice;
  });
};
