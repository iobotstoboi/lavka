var Category = require('../models/category').Category;
var ServiceProduct = require('../models/serviceproduct').ServiceProduct;
var Product = require('../models/product').Product;
var util = require('util');
var async = require('async');
var Workshop = require('../models/workshop').Workshop;
var Article = require('../models/article').Article;

exports.get = function(req, res) {

    async.waterfall([
        function(callback){ //Получим дерево каталога
            Category.getCatalogueTree(function(catalogueTree){
                callback(null, catalogueTree);
            });
        },
        function(catalogueTree, callback){
            Article.findById(req.params.id, function(err, currentArticle){
                callback(null, catalogueTree, currentArticle);
            });
        }
    ], function (err, catalogueTree, currentArticle ) {
        res.render('articlepage', {
            datka:catalogueTree,
            path: req.path,
            currentArticle:currentArticle
        });
    });
};