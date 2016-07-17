var Category = require('../models/category').Category;
var PricePlan = require('../models/priceplan').PricePlan
var util = require('util');
var async = require('async');

exports.get = function(req, res) {
    async.waterfall([
        function(callback){ //Получим список тарифов
            PricePlan.getFreePlan(function(pricePlan) {
                console.log('Получили базовый тариф');
                console.log(util.inspect(pricePlan));
                callback(null, pricePlan);
            });
        },
        function(pricePlan, callback){ // получим дерево каталога
            Category.getCatalogueTree(function(catalogueTree){
                callback(null, pricePlan, catalogueTree );
            });
        }
    ], function (err, pricePlan, catalogueTree) {
        // result now equals 'done'
        res.render('masters', { datka : catalogueTree, path : req.path, priceplan : pricePlan });
    });
};