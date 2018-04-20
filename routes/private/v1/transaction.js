var express = require('express');
var router = express.Router();
var passport = require('passport');
var TransactionController = require(`${global.__basedir}/controllers/TransactionController`);

/**
 * Login route
 */
router.get('/', passport.authenticate('jwt', {session: false}),TransactionController.list);
router.post('/',passport.authenticate('jwt', {session: false}), TransactionController.new);
router.delete('/',passport.authenticate('jwt', {session: false}), TransactionController.delete);

module.exports = router;
