const database =
  process.env.NODE_ENV === "production"
    ? "mongodb://heroku_6h410gcz:5hmnad1jg9kak433luvo82ccs6@ds129043.mlab.com:29043/heroku_6h410gcz"
    : "mongodb://localhost:27017";

module.exports = {
  // Secret key for the JWT signing and encyrption
  secret: "3 ducks walked into an elephant",
  // Database connection
  database: database,
  // Setting port for the server
  port: process.env.PORT || 3001,
  // Alpha Vantage stock quote API key
  stockAPIkey: "IT717SBUULYDIMTY"
};
