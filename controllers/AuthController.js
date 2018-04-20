/**
 * Handles User Authentication
 */
var fs = require('fs');
var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');

/**
 * Models
 */
var User = require(`${global.__basedir}/models/User`);

/**
 * login
 * creates a signed jwt with the user's ID as payload.
 * then sends the token along with status code 200
 */
exports.login = function(req, res,user) {
  const token = generateJWT(user);
  res.status(200).send({token:token});
};

function generateJWT(user){
  return jwt.sign({user:user._id}, process.env.JWT_KEY,{ expiresIn: '3h' });
}

exports.signup = function(req, res) {
  req.checkBody('email', 'This email address is already registered').userExists();
  req.checkBody('email', 'A valid email address is required').isEmail();
  req.checkBody('password', 'Passwords must be 6 characters or more in length & contain at least 1 lowercase character, 1 uppercase character & a number')
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}$/, "i");
  req.checkBody('confirmPassword', 'Passwords must match').equals(req.body.password);
  /**
   * return errors JSON if they exist
   */
  req.asyncValidationErrors().then(() => {
    var newUser = new User(req.body);
    newUser.save().then(() => {
      User.findOne({
        email: req.body.email
      }, function(err, user) {
        const token = generateJWT(user);
        res.status(200).send({token:token});
      });
    }).catch((err) => {
      //error saving user
    })
  }).catch((errors) => {
    if (errors) {
      return res.status(200).json({
        success: false,
        errors: errors
      });
    };
  });
};

/**
 * Sends the current user {_id,email} as a json response
 */
exports.user = function(req,res,next){
  res.json(req.user);
}
