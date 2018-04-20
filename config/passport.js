// load all the things we need
var LocalStrategy = require('passport-local').Strategy;
// load up the user model
var User = require(`${global.__basedir}/models/User`);

var authController = require(`${global.__basedir}/controllers/AuthController`);

/**
 * JWT
 */
const passportJWT = require("passport-jwt");
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

// expose this function to our app using module.exports
module.exports = function(passport) {

  passport.serializeUser(function(user, done) {
    done(null, user);
  });

  passport.deserializeUser(function(user, done) {
    done(null, user);
  });

  passport.use(new JWTStrategy({
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_KEY
    },
    function(jwtPayload, next) {
      return User.findOne({_id:jwtPayload.user},function (err, user) {
        if(user){
          return next(null, user);
        } else {
          return next(null, false);
        }
      })
    }
  ));

  passport.use('local-login', new LocalStrategy({
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true
    },
    function(req, email, password, done) {
      User.findOne({
        email: email
      }).select('+password').exec((err, user) => {

        // if there are any errors, return the error before anything else
        if (err) {
          return done(err, false, {
            code: 401,
            case: 'Invalid-Credentials',
            messages: ['Incorrect email or password.']
          });
        }
        // if no user is found, return the message
        if (!user) {
          return done(null, false, {
            code: 401,
            case: 'Invalid-Credentials',
            messages: ['Incorrect email or password.']
          });
        }

        user.isPasswordValid(user, password).then((match) => {
          if (!match) {
            return done(null, false, {
              code: 401,
              case: 'Invalid-Credentials',
              messages: ['Incorrect email or password.']
            });
          } else {
            return done(null, user);
          }
        }).catch((err) => {
          //error verifying password
        })
      });
    }
  ));
};
