var Category = require('../models/category').Category;
var ServiceProduct = require('../models/serviceproduct').ServiceProduct;
var Product = require('../models/product').Product;
var Workshop = require('../models/workshop').Workshop;
var postdata = require('postdata');
var async = require('async');

exports.get = function(req, res) {
    res.render('manager');
};
exports.post = function(req, res) {
	postdata(req, res, function (err, data) {
		//console.log(data);
		var operation = data.operation;

		//Создание категории
		if (operation == "createcat") {
			var name = data.catname;
			var fullname = data.fullcatname;
			var description = data.catdescription;
			var url = data.caturl;
			var alias = data.catalias;
			var parent = data.catparent;
			if (parent != '/') {
				var category = new Category({
					"name": name,
					"fullname": fullname,
					"description": description,
					"alias": alias,
					"url": url,
					"_parentId": parent
				});
			} else {
				var category = new Category({
					"name": name,
					"fullname": fullname,
					"description": description,
					"alias": alias,
					"url": url
				});
			}
			category.save(function(err) {
				if (err) {
					console.log(err);
					return err;
				}
				res.send({});
			});
		}

		//Удаление категории
		if (operation == "deletecat") {
			var catId = data.catId;
			var DeleteCategoryStuff = [
				function (callback) {
					Product.remove({"_categoryId": catId}, function(err, removed) {
						if (err) {
							console.log(err);
						} else {
							console.log(removed);
							callback(null, removed);
						}
					});
				},
				function (callback) {
					Category.remove({"_parentId": catId}, function(err, removed) {
						if (err) {
							console.log(err);
						} else {
							console.log(removed);
							callback(null, removed);
						}
					});
				},
				function (callback) {
					Category.remove({"_id": catId}, function(err, removed) {
						if (err) {
							console.log(err);
						} else {
							console.log(removed);
							callback(null, removed);
						}
					});
				}
			]
			async.series(DeleteCategoryStuff, function(err, results) {
				if (err) {
					console.log(err);
				} else {
					console.log('Is Removed');
					res.send({});
				}
			});
		}

		if (operation == "getproductsbycat") {
			var catId = data.catId;
			Product.getProductsByCategory(catId, function(products) {
				//console.log(products);
				res.send({products: products});
			})
		}
	});
}