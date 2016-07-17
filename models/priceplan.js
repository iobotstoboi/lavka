var async = require('async');
var util = require('util');

var mongoose = require('../lib/mongoose'),
    Schema = mongoose.Schema;

var pricePlanSchema = new Schema({
    "name": { type: String },
    "fullname": { type: String },
    "description": { type: String },
    "price": {type:String},
    "limitation": {type:Number},
    "product-limit-low": {type:String},
    "product-limit-high": {type:String},
    "category-limit-low": {type:String},
    "category-limit-high": {type:String}
});


pricePlanSchema.statics.getPricePlans = function(callback) {
    var PricePlan=this;
    /*
    PricePlan.find({}, function (err, pricePlans) {
        callback(pricePlans);
    }); */

    PricePlan.find(
        {},
        function(err, priceplans) {
            if (!err){
                console.log(util.inspect(err));
                console.log(priceplans);
                callback(priceplans);
                //process.exit();
            }
            else { throw err; console.log(util.inspect(err));}

        }
    );
};

pricePlanSchema.statics.getFreePlan = function(callback) {
    var PricePlan=this;
    PricePlan.findOne({"price": "0"}, function (err, pricePlan) {
        callback(pricePlan);
    });

};

pricePlanSchema.statics.getPricePlanObject = function(priceplanid, callback) {
    var PricePlan=this;
    PricePlan.findById(priceplanid, function (err, pricePlan) {
        callback(pricePlan);
    });

};

exports.PricePlan = mongoose.model('priceplans', pricePlanSchema);
