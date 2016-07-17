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
    ServiceProduct.findHighProducts(function(superproducts){
        console.log(superproducts);
        res.render('managerhigh', {
        	product: superproducts
        })
    })
};
exports.post = function(req, res) {
	postdata(req, res, function (err, data) {
        if (err) {
            console.log(err);
        } else {
            var operation = data.oper;
            console.log(data);
			if (operation == "delete") {
				console.log('Delete');
				var productId = data.productId.replace("\"", "");
				var productId = productId.replace("\"", "");
				console.log(productId);
				ServiceProduct.remove({"productid": mongoose.Types.ObjectId(productId), "type": "highlight"}, function(err,removed) {
					if (err) {
						console.log(err);
					}
					console.log(removed);
				});
				res.send({});
			}
			if (operation == "addnew") {
				console.log("Add")	
				ServiceProduct.createNew(data.productId, data.type, data.enddate, function() {
					console.log('OK')
					res.send({});
				});
			}
    	}
    });
}