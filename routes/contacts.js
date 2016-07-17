var Category = require('../models/category').Category;
var Product = require('../models/product').Product;
var util = require('util');
var async = require('async');
var Workshop = require('../models/workshop').Workshop;

exports.get = function(req, res) {

    async.waterfall([
        function(callback){ //Получим дерево каталога
            Category.getCatalogueTree(function(catalogueTree){
                callback(null, catalogueTree);
            });
        }
    ], function (err, catalogueTree) {
        if (err) {
            res.render('contacts', {
                datka:catalogueTree,
                path: req.path,
                message:err.message});
        } else {
            if (req.session.message) {
                var message = req.session.message;
                req.session.message = null; //
            }
            res.render('contacts', {
                datka:catalogueTree,
                path: req.path,
                message:message});
        }
    });
};