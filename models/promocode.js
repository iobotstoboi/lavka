var async = require('async');

var mongoose = require('../lib/mongoose'),
    Schema = mongoose.Schema;

var promocodeSchema = new Schema({
    code: {type:String},
    sum:{type:String},
    active:{type:String},
    created: {
        type: Date,
        default: Date.now
    },
    enddate: {type: Date    },
    partnerid: Schema.Types.ObjectId,

    userid: Schema.Types.ObjectId,
    activatedDate:  {type: Date    },
    activatInfo: {type:String}
});

promocodeSchema.statics.createPromocode = function(thecode, callback) {
    var Promocode = this;

    async.waterfall([
        function(callback) {
            Promocode.findOne({promocode: thecode}, function(err, promocode){
                if (promocode) {
                    //Обломись, уже етсь такой промокод
                    callback(new HttpError(401, "Уже есть промокод"))
                } else {
                    callback(null);
                }
            });
            // Проверим есть ли у этого пользователя уже мастерская
        },
        function(callback) {

                var enddate = new Date();
                enddate.setDate(enddate.getDate()+ 30);

                console.log('Сейчас созадим промокод ' + thecode)
                var prmcd = new Promocode({
                    code: thecode,
                    sum: '100',
                    active: 'true',
                    enddate: enddate
                });
                prmcd.save(function(err) {
                    if (err) return callback(err);
                    callback(null, prmcd);
                });

        }
    ], callback);
};

exports.Promocode = mongoose.model('promocodes', promocodeSchema);
