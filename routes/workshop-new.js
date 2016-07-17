var Category = require('../models/category').Category;
var User = require('../models/user').User;
var Workshop = require('../models/workshop').Workshop;
var Product = require('../models/product').Product;
var util = require('util');
var async = require('async');
var ServiceProduct = require('../models/serviceproduct').ServiceProduct;

/*exports.get = function(req, res) {
    console.log(req.params.id);
    var ObjectId = require('mongoose').Types.ObjectId;
    var objId = new ObjectId((req.params.id.length < 12) ? "123456789012" : req.params.id);
    async.waterfall([
        function(callback){
            console.log(req.params.id);
            Workshop.findOne({
                $or: [
                    {'_id' : objId},
                    {'alias': req.params.id}
                ]
               },callback);
        },*/


exports.get = function(req, res) {
    console.log(req.params.id);
    async.waterfall([
        function(callback){
            console.log(req.params.id);
            Workshop.findOne({
                $or: [
                    {'alias': req.params.id}
                ]
            },callback);
        },
        function(work, callback){ //Получим дерево каталога
            if (!work) {
                console.log (work);
                return res.render('../views/404');
            }
            Category.getCatalogueTree(function(catalogueTree){
                callback(null, work, catalogueTree);
            });
        },
        function( work, catalogueTree,  callback){
            Product.getProductsByWorkshop(work._id, function(matchedProducts) {
                callback(null,  work, catalogueTree, matchedProducts);
            });
        },
        function( work, catalogueTree, matchedProducts, callback){
            var productsWorkshops = [];
            for (var i in matchedProducts) {
                    productsWorkshops.push(matchedProducts[i]._id);
            }
            //console.log('********************' + util.inspect(productsWorkshops));
            callback(null, work, catalogueTree, matchedProducts, productsWorkshops);
        },
        function( work, catalogueTree, matchedProducts, productsWorkshops, callback){

            var prodWorkInfo = [];
            function getProductsWorkshop(productid, callback) {
                process.nextTick(function () {
                    Product.findById(productid, function(err, productobj){
                        Workshop.findById(productobj._workshopId, function(err, workshoper){
                            prodWorkInfo[productid] = workshoper;
                            callback(null, prodWorkInfo);
                        })
                    });
                });
            }

            function done(error, result) {
                callback(null,  work, catalogueTree, matchedProducts, prodWorkInfo);
            }

            async.map(productsWorkshops, getProductsWorkshop, done);
        },
        function( work, catalogueTree, matchedProducts, prodWorkInfo, callback){
            ServiceProduct.find({"type" : "highlight"}, function(err, highlighted){
                var highlightarray=[];
                for (var i in highlighted) {
                    highlightarray[highlighted[i].productid] = highlighted[i];
                }
                callback(null,  work, catalogueTree, matchedProducts, prodWorkInfo, highlightarray);
            });
        },
        function( work, catalogueTree, matchedProducts, prodWorkInfo, highlightarray, callback) {
            Workshop.findById(work._id, function(err, workshoptocustomer){
                callback(null,  work, catalogueTree, matchedProducts, prodWorkInfo, highlightarray,workshoptocustomer )
            })
        }
    ], function (err,  work, catalogueTree, matchedProducts, prodWorkInfo, highlightarray, workshoptocustomer) {
        res.render('workshop', {
            datka:catalogueTree,
            path: req.path,
            matchedProducts:matchedProducts,
            prodWorkInfo:prodWorkInfo,
            highlightarray:highlightarray,
            workshoptocustomer:workshoptocustomer
        });
    });
};