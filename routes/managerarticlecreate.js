var Category = require('../models/category').Category;
var ServiceProduct = require('../models/serviceproduct').ServiceProduct;
var Product = require('../models/product').Product;
var util = require('util');
var async = require('async');
var Workshop = require('../models/workshop').Workshop;
var Article = require('../models/article').Article;
var postdata = require('postdata');
exports.get = function(req, res) {
    res.render('managernewarticle', {

    });
}
exports.post = function(req, res) {
	postdata(req, res, function (err, data) {
        if (err) {
            console.log(err);
        } else {
        	var title = data.title;
        	var body = data.body;
        	var intro = data.intro;
            var preview = data.preview;
            var article = new Article({"title": title, "body": body, "introtext": intro, "previewImg": preview});
            article.save(function(err) {
                if (err) console.log(err);
                res.send();
            });
    	}
    });
}