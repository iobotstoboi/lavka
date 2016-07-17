var async = require('async');
var util = require('util');
var Product = require('../models/product').Product;
var User = require('../models/user').User;

var mongoose = require('../lib/mongoose'),
    Schema = mongoose.Schema;

var orderSchema = new Schema({
    user: Schema.Types.ObjectId,
    product: Schema.Types.ObjectId,
    workshop:Schema.Types.ObjectId,
    status:String,
    created: {
        type: Date,
        default: Date.now
    },
    confirm_date: { type: Date },
    comment: String,
    ordernumber: String
});

exports.Order = mongoose.model('orders', orderSchema);
