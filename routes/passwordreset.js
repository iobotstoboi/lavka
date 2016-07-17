var Category = require('../models/category').Category;
var async = require('async');

exports.get = function(req, res) {

    async.waterfall([
        function(callback){ //Получим дерево каталога
            Category.getCatalogueTree(function(catalogueTree){
                callback(null, catalogueTree);
            });
        }
    ], function (err, catalogueTree ) {
        res.render('passwordreset', {
            datka:catalogueTree,
            path: req.path,
        });
    });
};