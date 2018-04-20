/**
 * Models
 */
var User = require(`${global.__basedir}/models/User`);
var Transaction = require(`${global.__basedir}/models/Transaction`);

var validators = {
    customValidators: {
        /**
         * Check if a current user exists by checking for the email in the DB
         * @param email user's email address
         * @returns {Promise<any>}
         */
        userExists: function(email) {
            return new Promise(function(resolve, reject) {
                User.findOne({'email': email}, function(err, results) {
                    if(!results) {
                        return resolve(err);
                    }
                    reject(err);
                });

            });
        },
        /**
         * Check if a current transaction hash exists by checking for the hash in the DB
         * cross check with the ownerId field so duplicate hashes can only be created
         * by different users.
         * @param hash tx hash
         * @returns {Promise<any>}
         */
        hashExists: function(hash,userId) {
            return new Promise(function(resolve, reject) {
                Transaction.findOne({'hash': hash,ownerId:userId}, function(err, results) {
                    if(!results) {
                        return resolve(err);
                    }
                    reject(err);
                });

            });
        }
    }
};
module.exports = validators;
