var Category = require('../models/category').Category;
var ServiceProduct = require('../models/serviceproduct').ServiceProduct;
var Product = require('../models/product').Product;
var util = require('util');
var async = require('async');
var Workshop = require('../models/workshop').Workshop;
var User = require('../models/user').User;
var postdata = require('postdata');

exports.post = function(req, res) {
    postdata(req, res, function (err, data) {
        console.log(data);
        User.update({'_id': data.user}, {"productsTrained": true}, {multi: true}, function(err, num) {
            if (err) {
                console.log(err);
            } else {
                console.log(num);
                res.send({});
            }
        })
    })
};