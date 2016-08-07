var async = require('async');
var util = require('util');
var PricePlan = require('../models/priceplan').PricePlan;

var mongoose = require('../lib/mongoose'),
    Schema = mongoose.Schema;
var ObjectId = mongoose.Types.ObjectId;

var workshopSchema = new Schema({
    /*_id: Schema.Types.ObjectId,*/
    _userAccountId: Schema.Types.ObjectId,
    name: {
        type: String
    },
    description: {
        type: String
    },
    adres: {
        type: String
    },
    phone: {
        type: String
    },
    workshopLogo: {type:String, default: 'assets/images/tovar.png'},
    img320: {type:String},
    img640: {type:String},
    img40: {type:String},
    priceplan: {
        type: Schema.Types.ObjectId,
        default: function () {return ObjectId("54049946dabc8f863d17b49e")}
    },
    pricePlanStartDate: {type:Date},
    pricePlanEndDate: {type:Date},
    created: {
        type: Date,
        default: Date.now
    },
    alias: {type: String},
    autoUpdate: {type: Boolean},
    views: {type: Number, default: 0}
});

// Метод для нахождения пользователя к которому прикреплена мастерская
workshopSchema.methods.getUser = function getUser (callback) {
    return this.model('users').findById(this._userAccountId, function (err, doc){
        callback(doc);
    });
};



workshopSchema.statics.getProductLimit = function getProductLimit(workshopid, callback) {
    var Workshop = this;
    console.log('Ищем лимит для воркшопа ' + workshopid);

    return this.model('workshops').findById(workshopid, function (err, wsh){
        console.log('поймали воркшоп' + util.inspect(wsh));
        PricePlan.findById(wsh.priceplan, function (err, priceplan){
            callback(priceplan);
        });
    });
};

// Метод для получения объекта мастерской по id
workshopSchema.statics.getWorkshop = function getWorkshop (_id, callback) {
    return this.model('workshops').findById(_id, function (err, wsh){
        callback(wsh);
    });
};

workshopSchema.statics.createNewWorkshop = function(userAccountId, workshopName, description, adres, phone, callback) {
    var Workshop = this;
    console.log('аккаунт '+userAccountId);
    async.waterfall([
        function(callback) {
            Workshop.findOne({_userAccountId: userAccountId}, callback); // Проверим есть ли у этого пользователя уже мастерская
        },
        function(workshop, callback) {
            if (workshop) {
                // Если такой пользователь уже существует
                //callback(new AuthError("У пользователя уже есть воркшоп "));
                callback();
            } else {
                // Если такого пользователя еще нет в базе

                var workshop = new Workshop({   _userAccountId: userAccountId,
                    name: workshopName,
                    description: description, //userFields['passwordInput'],
                    adres: adres, //userFields['firstNameInput'],
                    phone: phone, //userFields['secondNameInput'],
                    alias: ''
                });
                workshop.save(function(err) {
                    console.log(err);
                    if (err) return callback(err);
                    callback(null, workshop);
                });
            }
        }
    ], callback);
};


// Найти магазин по юзеру
workshopSchema.statics.getWorkshopByUser = function getWorkshopByUser(userid, callback) {
    return this.model('workshops').findOne({_userAccountId : userid}, function (err, wsh){
        callback(wsh);
    });
};


/*
// Метод для нахождения товаров категорий
categorySchema.methods.getChilds = function getChilds (callback) {
    return this.model('categories').find({ _parentId: this._id }, function(err,doc) {
        callback(doc);
    });
}; */

/*
categorySchema.statics.getMainCategories = function(callback) {
    var Category=this;
    Category.find({ '_parentId': undefined }, function (err, docs) {
        callback(docs);
    });

}; */
exports.Workshop = mongoose.model('workshops', workshopSchema);

/*
function AuthError(message) {
    Error.apply(this, arguments);
    Error.captureStackTrace(this, AuthError);

    this.message = message;
}

util.inherits(AuthError, Error);

AuthError.prototype.name = 'AuthError';

exports.AuthError = AuthError; */
