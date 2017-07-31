module.exports = {
  // Secret key for the JWT signing and encyrption
  'secret': '3 ducks walked into an elephant',
  // Database connection
  'database': 'mongodb://localhost:27017',
  // Setting port for the server
  'port': process.env.PORT || 3001,
  // Alpha Vantage stock quote API key
  'stockAPIkey': 'IT717SBUULYDIMTY'
}
