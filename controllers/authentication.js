const jwt = require('jsonwebtoken'),  
      crypto = require('crypto'),
      User = require('../models/users'),
      config = require('../config/main'),
      helperFunctions = require('./helperFunctions');

// generated JWT for user object
const generateToken = (user) => {
  /* remove portfolio, cash, and transactionHistory 
  from user info for token generation */
  const tokenUserInfo = Object.assign({}, user);
  delete tokenUserInfo.cash;
  delete tokenUserInfo.portfolio;
  delete tokenUserInfo.transactionHistory;
  
  return jwt.sign(tokenUserInfo, config.secret, {
    expiresIn: 24*60*60 // 1 day in seconds
  });
}

//========================================
// Login Route
//========================================
exports.login = (res, user) => {
  let userInfo = helperFunctions.setUserInfoForResponse(user);

  res.status(200).json({
    token: 'JWT ' + generateToken(userInfo),
    user: userInfo
  });
}

//========================================
// Registration Route
//========================================
exports.register = (req, res, next) => {  
  // Check for registration errors
  const username = req.body.username;
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const password = req.body.password;

  // Return error if no username provided
  if (!username) {
    return res.status(422).send({ message: 'You must enter an username address.'});
  }

  // Return error if full name not provided
  if (!firstName || !lastName) {
    return res.status(422).send({ message: 'You must enter your full name.'});
  }

  // Return error if no password provided
  if (!password) {
    return res.status(422).send({ message: 'You must enter a password.' });
  }

  User.findOne({ username: username }, (err, existingUser) => {
      if (err) { return next(err); }

      // If user is not unique, return error
      if (existingUser) {
        return res.status(409).send({ message: 'That username address is already in use.' });
      }

      // If username is unique and password was provided, create account
      let user = new User({
        username: username,
        password: password,
        profile: { firstName: firstName, lastName: lastName }
      });

      user.save((err, user) => {
        if (err) { return next(err); }

        // Respond with JWT if user was created
        let userInfo = helperFunctions.setUserInfoForResponse(user);

        res.status(201).json({
          token: 'JWT ' + generateToken(userInfo),
          user: userInfo
        });
      });
  });
}

// //========================================
// // Authorization Middleware
// //========================================

// // Role authorization check
// exports.roleAuthorization = (role) => {  
//   return (req, res, next) => {
//     const user = req.user;

//     User.findById(user._id, (err, foundUser) => {
//       if (err) {
//         res.status(422).json({ error: 'No user was found.' });
//         return next(err);
//       }

//       // If user is found, check role.
//       if (foundUser.role == role) {
//         return next();
//       }

//       res.status(401).json({ error: 'You are not authorized to view this content.' });
//       return next('Unauthorized');
//     })
//   }
// }