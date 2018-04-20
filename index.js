/**
 * Process.env
 */
require('dotenv').config();

const express = require('express');
const app = express();
global.__basedir = __dirname;

/**
 * Headers
 */
 app.use(function(req, res, next) {
   res.header("Access-Control-Allow-Origin", "*");
   res.header("Access-Control-Allow-Headers", "Authorization, Origin, Content-Type, Accept");
   res.header("Access-Control-Allow-Methods", "POST, GET, DELETE");
   res.header("Access-Control-Allow-Credentials", true);
   next();
 });

/**
 * Mongoose
 */
var mongoose = require('mongoose');
var db = mongoose.connection;
mongoose.connect(`mongodb://${process.env.DB_HOST}/${process.env.DB_NAME}`);
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("Connected to MongoDB");
  if(process.env.DB_NAME == 'test'){ //if TxTag API is running as test, clear the test database each time!.
    mongoose.connection.dropDatabase();
  }
});

/**
 * Passport
 */
var passport = require('passport');
require('./config/passport')(passport);
app.use(passport.initialize());

/**
 * Body/Payload Parser
 */
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

/**
 * Express validator
 */
var expressValidator = require('express-validator');
var customExpressValidators = require('./validators/express-custom-validators');
app.use(expressValidator(customExpressValidators));

var privateApiRoutes = require('./routes/private/private');

/**
 * Routing
 */
app.use('/private', privateApiRoutes);

var server = app.listen(3000, () => console.log('Example app listening on port 3000!'))

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.status(404).json("Invalid Endpoint");
});

module.exports = server;
