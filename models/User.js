var mongoose = require('mongoose');
const uuidv4 = require('uuid/v4');
const argon2 = require('argon2');

const userSchema = mongoose.Schema({
  _id: {
    type: String,
    default: () => {
      return uuidv4();
    }
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true,
    select: false
  },
});

/**
 * Hash the password before save
 */
userSchema.pre('save', function(next) {
  var user = this;
  if (user.isModified('password')) {
    argon2.hash(user.password).then(hash => {
      user.password = hash;
      next();
    }).catch(err => {
      next();
    });
  }
});

/**
 * Is the user's password valid?
 * @param  {String} password the password to compare against.
 * @return {Bool}          true/false if the password is valid
 */
userSchema.methods.isPasswordValid = function(user, password) {
  return argon2.verify(user.password, password);
};

module.exports = mongoose.model('User', userSchema);
