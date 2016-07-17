var Category = require('../models/category').Category;
var ServiceProduct = require('../models/serviceproduct').ServiceProduct;
var Product = require('../models/product').Product;
var util = require('util');
var async = require('async');
var Workshop = require('../models/workshop').Workshop;
var mongoose = require('../lib/mongoose');
var postdata = require('postdata');
var allproducts = [];
exports.get = function(req, res) {
	var catId = 
    Product.getProductsByCategory(catId, function(products) {
		console.log(products);
		res.render('managercatalog', {products: products});
	})
};
exports.post = function(req, res) {
	
}