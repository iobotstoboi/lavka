var Category = require('../models/category').Category;
var ServiceProduct = require('../models/serviceproduct').ServiceProduct;
var Product = require('../models/product').Product;
var util = require('util');
var async = require('async');
var Workshop = require('../models/workshop').Workshop;

exports.get = function(req, res) {

    async.waterfall([
        function(callback){ //Получим дерево каталога
            Category.getCatalogueTree(function(catalogueTree){
                for (var i in catalogueTree){
                    if (catalogueTree[i].self._id.toString() == req.params.id){
                        var subctgs = catalogueTree[i].childs;

                    }
                }
                callback(null, catalogueTree);
            });
        }
    ], function (err, catalogueTree) {
        if (err) {
            res.render('rules', {
                datka:catalogueTree,
                path: req.path,
                message:err.message});
        } else {
            res.render('rules', {
                datka:catalogueTree,
                path: req.path});
        }
    });
};