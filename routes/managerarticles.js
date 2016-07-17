var Category = require('../models/category').Category;
var ServiceProduct = require('../models/serviceproduct').ServiceProduct;
var Product = require('../models/product').Product;
var util = require('util');
var async = require('async');
var Workshop = require('../models/workshop').Workshop;
var Article = require('../models/article').Article;
var postdata = require('postdata');
var mongoose = require('../lib/mongoose');
exports.get = function(req, res) {
	Article.find({}, function(err, articles) {
		if (!err) {
			console.log(articles);
			res.render('managerarticles', {
				articles: articles
			});
		}
	});
};
exports.post = function(req, res) {
	postdata(req, res, function (err, data) {
		if (err) {
            console.log(err);
        } else {
            var operation = data.oper;
            console.log(data);
            if (operation == "delete") {
            	var articleId = data.articleId;
            	articleId = articleId.replace("\"", "");
            	articleId = articleId.replace("\"", "");
            Article.remove({"_id": mongoose.Types.ObjectId(articleId)}, function(err,removed) {
					if (err) {
						console.log(err);
					}
					console.log(removed);
					res.send();
				});
        	}
        }
	});
};