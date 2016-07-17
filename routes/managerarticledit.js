var Category = require('../models/category').Category;
var ServiceProduct = require('../models/serviceproduct').ServiceProduct;
var Product = require('../models/product').Product;
var util = require('util');
var async = require('async');
var Workshop = require('../models/workshop').Workshop;
var Article = require('../models/article').Article;
var postdata = require('postdata');
exports.get = function(req, res) {
	console.log(req.params.id);
	Article.find({"_id": req.params.id}, function(err, article) {
		console.log(article);
		res.render('managerarticledit', {
			article: article
		}); 
	});
}
exports.post = function(req, res) {
	postdata(req, res, function (err, data) {
        if (err) {
            console.log(err);
        } else {
        	var title = data.title;
        	var body = data.body;
        	var id = data.id;
        	var intro = data.intro;
            var preview = data.preview;
        	id = id.replace("\"", "");
        	id = id.replace("\"", "");
            Article.findOneAndUpdate({"_id": id}, {"title": title, "body": body, "introtext": intro, "previewImg": preview, "created": new Date()}, {upsert:true}, function(err, art) {
            	if (err) {
            		console.log(err);
            	}
            	res.send();
            	console.log(art);
            });
    	}
    });
}