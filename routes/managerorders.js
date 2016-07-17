var Category = require('../models/category').Category;
var ServiceProduct = require('../models/serviceproduct').ServiceProduct;
var Product = require('../models/product').Product;
var Order = require('../models/order').Order;
var util = require('util');
var async = require('async');
var Workshop = require('../models/workshop').Workshop;
var mongoose = require('../lib/mongoose');
var postdata = require('postdata');
exports.get = function(req, res) {
	var orders = [];
    Order.find({}).sort('-created').exec(function(err, justorders) {
    	var countOrd = Object.keys(justorders).length;
    	for (var i = 0; i <= countOrd - 1; i++) {
			orders.push(justorders[i])
		}
		//console.log(orders);
    	res.render('managerorders', {orders: orders});
    });
};
exports.post = function(req, res) {
	
}