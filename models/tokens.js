var async = require('async');

var mongoose = require('../lib/mongoose'),
    Schema = mongoose.Schema;

var tokenSchema = new Schema({
    type: String,
    token:String,
    data:{type:String},
    created: {
        type: Date,
        default: Date.now
    },
    enddate: {type:Date}
});

tokenSchema.statics.createToken = function(type, data, token, callback) {
    var Token = this;

    async.waterfall([
        function(callback) {
            var enddate = new Date();
            enddate.setDate(enddate.getDate()+ 1);

            var thetoken = new Token({
                type: type,
                token: token,
                data: data,
                enddate: enddate
            });
            thetoken.save(function(err) {
                if (err) return callback(err);
                callback(null, thetoken);
            });

        }
    ], callback);
};

exports.Token = mongoose.model('tokens', tokenSchema);
