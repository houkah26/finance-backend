const axios = require("axios"),
  User = require("../models/users"),
  helperFunctions = require("./helperFunctions");
setUserInfoForResponse = helperFunctions.setUserInfoForResponse;
CSVToArray = helperFunctions.CSVToArray;

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
  const symbolsArray = portfolio.map(stock => stock.stockSymbol);
  const symbolsString = formatStockSymbols(symbolsArray);

  axios
    .get(
      `http://download.finance.yahoo.com/d/quotes.csv?f=sl1&s=${symbolsString}`
    )
    .then(response => {
      const dataArray = CSVToArray(response.data);

      const portfolioWithPrices = mapPrices(portfolio, dataArray);

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

// Format array of symbols and return string separated by '+' (ie: 'MSFT+AAPL+AMZN')
const formatStockSymbols = symbols => {
  let symbolString = "";

  symbols.forEach((symbol, index, array) => {
    if (index < array.length - 1) {
      symbolString += symbol + "+";
    } else {
      symbolString += symbol;
    }
  });

  return symbolString;
};

// Map prices to portfolio
const mapPrices = (portfolio, priceArray) => {
  return portfolio.map(stock => {
    // convert mongoose doc to regular js object
    const stockWithPrice = stock.toObject();

    // Add price for matching symbol from priceArray
    priceArray.forEach(stockPrice => {
      if (stock.stockSymbol === stockPrice[0]) {
        stockWithPrice.price = parseFloat(stockPrice[1]);
        stockWithPrice.total =
          stockWithPrice.price * stockWithPrice.totalShares;
      }
    });
    return stockWithPrice;
  });
};
