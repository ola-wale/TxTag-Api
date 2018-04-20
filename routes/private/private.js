var express = require('express');
var router = express.Router();
var app = express();

var v1AuthRoute = require("./v1/auth");
var v1TransactionRoute = require("./v1/transaction");
router.use('/v1/auth',v1AuthRoute);
router.use('/v1/transactions',v1TransactionRoute);

module.exports = router;
