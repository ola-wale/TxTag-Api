/**
 * Models
 */
var Transaction = require(`${global.__basedir}/models/Transaction`);

exports.new = function(req, res) {
  req.checkBody('hash', 'Enter a valid Bitcoin transaction hash').matches(/^[a-zA-Z0-9]{64}$/,"i");
  req.checkBody('hash', 'This transaction has already been tagged by you.').hashExists(req.user._id);
  req.asyncValidationErrors().then(() => {
    var newTransaction = new Transaction(req.body);
    newTransaction.ownerId = req.user._id;
    newTransaction.save().then(() => {
      res.send(newTransaction);
    });
  }).catch((errors) => {
    if (errors) {
      return res.status(400).json({
        success: false,
        errors: errors
      });
    };
  })
}

exports.list = function(req, res) {
  Transaction.find({ownerId:req.user._id}).sort({date: 'descending'}).exec((err,transaction) => {
    if(err){
      return res.status(409);
    }
    return res.send(transaction);
  });
}

exports.delete = function(req,res){
  Transaction.remove({ownerId:req.user._id,_id:req.body.id},(err,removed) => {
    if(removed.n){
      return res.status(200).json({});
    } else {
      return res.status(409).json({});
    }
  })

}
