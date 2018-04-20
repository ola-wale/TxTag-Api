var mongoose = require('mongoose');
const uuidv4 = require('uuid/v4');

const transactionSchema = mongoose.Schema({
  _id: {
    type: String,
    default: () => {
      return uuidv4();
    }
  },
  date: {
    type: Number,
    required: true,
    default: () => {
      return Date.now();
    }
  },
  ownerId: {
    type: String,
    required: true
  },
  hash: {
    type: String,
    required: true
  },
  tags: {
    type: [String],
    required: false,
  },
});

module.exports = mongoose.model('Transaction', transactionSchema);
