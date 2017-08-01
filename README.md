# Finance Back-End

Rest API for a fake (real stock prices not real money) stock trading app.

[Finance App hosted on heroku](https://finance-frontend.herokuapp.com/)

[Cooresponding front-end code](https://github.com/houkah26/finance-frontend)

## Features
* User Authentication utilizing JSON Web Tokens
* Real time (15 minute delay) stock prices via a Yahoo API
* Buy/Sell stocks
* View stock portfolio and transaction history
* Add funds/cash

## Technologies
* Language: Node-JS
* Framework: Express
* Database: MongoDB and Mongoose (for express integration)
* Authentication: PassportJS
* Client Side Routing: React-Router (as well as React-Router-Redux)
* Deployment: Heroku

## TO-DO
* Pagination for history
* Improve error handeling
* Rounding Error (limit all prices/cash amounts to two decimals)