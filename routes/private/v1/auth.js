var express = require('express');
var router = express.Router();
var passport = require('passport');
var AuthController = require(`${global.__basedir}/controllers/AuthController`);

/**
 * Signup route
 */
router.post('/signup',AuthController.signup);

/**
 * Login route
 */
router.post('/login', function(req, res, next) {
  if(!req.body.email || !req.body.password){ //if the email || password payload is missing
    //send a response with status code 400 (Bad Request);
    return res.status(400).send();
  }
  passport.authenticate('local-login', function(err, user, info) {
    if (!user) {
      return res.status(info.code).send({case:info.case,messages:info.messages});
    } else {
      AuthController.login(req,res,user);
    }
  })(req, res, next)});


router.post('/user',passport.authenticate('jwt', {session: false}),AuthController.user);

module.exports = router;
