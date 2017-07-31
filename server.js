const express = require('express'),  
      app = express(),
      bodyParser = require('body-parser'),
      logger = require('morgan'),
      mongoose = require('mongoose'),
      config = require('./config/main')
      router = require('./router');

// Database connection
mongoose.Promise = global.Promise;
mongoose.connect(config.database);

// Start the server
const server = app.listen(config.port);
console.log(`Your server is running on port ${config.port}.`);

// Setting up basic middleware for all Express requests
app.use(logger('dev')); // Log requests to console using morgan

// Enable CORS from client-side
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Credentials");
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

// Add body-parser to parse urlencoded bodies to JSON
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

router(app);
