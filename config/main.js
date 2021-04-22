const database =
  process.env.NODE_ENV === "production"
    ? "mongodb+srv://finance_admin:finance@finance.5dpkk.mongodb.net/Finance?retryWrites=true&w=majority"
    : "mongodb://localhost:27017";

module.exports = {
  // Secret key for the JWT signing and encyrption
  secret: "3 ducks walked into an elephant",
  // Database connection
  database: database,
  // Setting port for the server
  port: process.env.PORT || 3001,
  // Tradier stock quote API key
  stockAPIkey: "Bearer 2ZZ2CFrXTmRuIuHX2XFyw1GLA3zc",
};
