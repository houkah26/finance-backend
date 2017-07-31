const axios = require("axios"),
  User = require("../models/users"),
  helperFunctions = require("./helperFunctions");
setUserInfoForResponse = helperFunctions.setUserInfoForResponse;
CSVToArray = helperFunctions.CSVToArray;

//========================================
// Get stock price middleware for stock routes
//========================================
exports.fetchStockPrice = (req, res, next) => {
  const stockSymbol = req.body.stockSymbol.toUpperCase();

  axios
    .get(
      `http://download.finance.yahoo.com/d/quotes.csv?f=snl1&s=${stockSymbol}`
    )
    .then(response => {
      const dataArray = CSVToArray(response.data);
      const stock = dataArray[0]; //first item in array is requested stock

      res.locals.stockSymbol = stock[0];
      res.locals.stockName = stock[1];
      res.locals.price = parseFloat(stock[2]);

      // Return error message if price is not a number
      if (isNaN(res.locals.price)) {
        return res.status(409).json({ message: "Invalid stock symbol" });
      }

      next();
    })
    .catch(error => {
      next(error);
    });
};

//========================================
// Quote Stock Route for User
//========================================
exports.quoteStock = (req, res, next) => {
  res.status(200).json({
    stockSymbol: res.locals.stockSymbol,
    stockName: res.locals.stockName,
    price: res.locals.price
  });
};

//========================================
// Buy Stock Route for User
//========================================
exports.buyStock = (req, res, next) => {
  // Set transaction values to desired format/types from body and locals
  const transaction = formatTransaction(req.body, res.locals);

  const { shares, price, action } = transaction;

  // Check for appropriate action type
  if (action !== "BUY") {
    return res.status(409).send({ message: "Invalid transaction type" });
  }

  // Check for valid number of shares
  if (shares <= 0) {
    return res.status(409).send({ message: "Invalid transaction" });
  }

  User.findById(req.user._id, (err, user) => {
    if (err) {
      return next(err);
    } else {
      // Calculate cost of transaction
      const transactionCost = shares * price;

      // Check if user has enough funds
      if (user.cash < transactionCost) {
        return res.status(409).send({ message: "Insufficient funds" });
      }

      // Subtract transaction cost from user's cash
      user.cash -= transactionCost;

      // Add transaction to user's history
      user.transactionHistory.push(transaction);

      // Add stock to user's portfolio
      updatePortfolio(user.portfolio, transaction);

      user.save((err, user) => {
        if (err) {
          return next(err);
        }

        const userInfo = setUserInfoForResponse(user);

        // respond with updated user
        res.status(201).json({
          user: userInfo
        });
      });
    }
  });
};

//========================================
// Sell Stock Route for User
//========================================
exports.sellStock = (req, res, next) => {
  // Set transaction values to desired format/types from body and locals
  const transaction = formatTransaction(req.body, res.locals);

  const { shares, price, action, stockSymbol } = transaction;

  // Check for appropriate action type
  if (action !== "SELL") {
    return res.status(409).send({ message: "Invalid transaction type" });
  }

  // Check for valid number of shares
  if (shares <= 0) {
    return res.status(409).send({ message: "Invalid transaction" });
  }

  User.findById(req.user._id, (err, user) => {
    if (err) {
      return next(err);
    } else {
      // Check if user has enough shares
      if (!hasEnoughShares(user.portfolio, stockSymbol, shares)) {
        return res.status(409).send({ message: "Invalid transaction" });
      }

      // Calculate cost of transaction
      const transactionCost = shares * price;

      // Add transaction cost to user's cash
      user.cash += transactionCost;

      // Add transaction to user's history
      user.transactionHistory.push(transaction);

      // Update user's portfolio
      updatePortfolio(user.portfolio, transaction);

      user.save((err, user) => {
        if (err) {
          return next(err);
        }

        const userInfo = setUserInfoForResponse(user);

        // respond with updated user
        res.status(201).json({
          user: userInfo
        });
      });
    }
  });
};

//========================================
// Helper Functions
//========================================

// check if stock exists in portfolio
const containsStock = (portfolio, stockSymbol) => {
  return portfolio.some(stock => stock.stockSymbol === stockSymbol);
};

// update stock portfolio
const updatePortfolio = (portfolio, transaction) => {
  const { stockSymbol, stockName, action, shares } = transaction;

  // Check if user already own's stock
  if (containsStock(portfolio, stockSymbol)) {
    // updated number of shares for given stock
    updateStock(portfolio, stockSymbol, shares, action);
  } else if (action === "BUY") {
    // If user doesn't own, add stock to user's prortfolio
    const stockToAdd = {
      stockSymbol: stockSymbol,
      stockName: stockName,
      totalShares: shares
    };
    portfolio.push(stockToAdd);
  }
};

// update portfolio when user owns stock already
const updateStock = (portfolio, stockSymbol, shares, action) => {
  portfolio.map(stock => {
    if (stock.stockSymbol === stockSymbol) {
      // Calculate total shares after transaction
      let totalShares;
      if (action === "BUY") {
        totalShares = stock.totalShares + shares;
      } else if (action === "SELL") {
        totalShares = stock.totalShares - shares;
      }

      // Remove stock from portfolio if there are zero shares left
      if (totalShares === 0) {
        stock.remove();
      } else {
        // Otherwise update number of shares of stock in portfolio
        stock.totalShares = totalShares;
        return stock;
      }
    } else {
      return stock;
    }
  });
};

// Set transaction values to desired format
const formatTransaction = (reqBody, resLocals) => {
  const transaction = {
    shares: parseInt(reqBody.shares),
    action: reqBody.action.toUpperCase(),
    stockSymbol: resLocals.stockSymbol,
    stockName: resLocals.stockName,
    price: resLocals.price
  };

  return transaction;
};

// Check if user has enough shares
const hasEnoughShares = (portfolio, stockSymbol, shares) => {
  return portfolio.some(stock => {
    // return true if stock matches and there are enough shares for transaction
    return stock.stockSymbol === stockSymbol && stock.totalShares >= shares;
  });
};
