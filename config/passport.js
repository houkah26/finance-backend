const passport = require('passport'),  
      User = require('../models/users'),
      config = require('./main'),
      JwtStrategy = require('passport-jwt').Strategy,
      ExtractJwt = require('passport-jwt').ExtractJwt,
      LocalStrategy = require('passport-local');

const localOptions = { usernameField: 'username' };

// Setting up local login strategy
const localLogin = new LocalStrategy(localOptions, function(username, password, done) {  
  User.findOne({ username: username }, function(err, user) {
    if(err) { return done(err); }
    if(!user) { 
      return done(null, false, { message: 'User not found. Please try again.' }); }

    user.comparePassword(password, function(err, isMatch) {
      if (err) { return done(err); }
      if (!isMatch) { return done(null, false, { message: 'Invalid login credentials. Please try again.' }); }

      return done(null, user);
    });
  });
});

// JWT authentication options
const jwtOptions = {  
  // Telling Passport to check authorization headers for JWT
  jwtFromRequest: ExtractJwt.fromAuthHeader(),
  // Telling Passport where to find the secret
  secretOrKey: config.secret
};

// Setting up JWT login strategy
const jwtLogin = new JwtStrategy(jwtOptions, (payload, done) => { 
  User.findById(payload._id, (err, user) => {
    if (err) { return done(err, false); }

    if (user) {
      done(null, user);
    } else {
      done(null, false);
    }
  });
});

// Allow passport to use defined strategies
passport.use(jwtLogin);  
passport.use(localLogin); 