var Category = require('../models/category').Category;
var ServiceProduct = require('../models/serviceproduct').ServiceProduct;
var Product = require('../models/product').Product;
var util = require('util');
var async = require('async');
var Workshop = require('../models/workshop').Workshop;
var Article = require('../models/article').Article;
var randy = require('randy');
var io = require('../lib/socket')(io);
exports.get = function(req, res) {
    async.waterfall([
        function(callback){ //Получим дерево каталога
            Category.getCatalogueTree(function(catalogueTree){
                callback(null, catalogueTree);
            });
        },
        function(catalogueTree, callback){
            ServiceProduct.findSuperProducts(function(superproducts0){
                //console.log('Суперпродукты ' + util.inspect(superproducts));
                if (superproducts0) {superproducts = superproducts0.reverse();} else {superproducts = superproducts0}
                callback(null, catalogueTree, superproducts);
            })
        },
        function(catalogueTree, superproducts, callback){
            Product.getLatest(function(latestProductsNotShuffled){
                var latestProducts = randy.shuffle(latestProductsNotShuffled);
                callback(null, catalogueTree, superproducts,latestProducts );
            })
        },
        function(catalogueTree, superproducts,latestProducts, callback){
            var productsWorkshops = [];
            if (superproducts) {
                for (var i in superproducts) {
                    if (superproducts[i]) {
                        productsWorkshops.push(superproducts[i]._id);
                    }
                }
            }
            for (var i in latestProducts) {
                productsWorkshops.push(latestProducts[i]._id);
            }
            //console.log('********************' + util.inspect(productsWorkshops));
            callback(null,catalogueTree, superproducts,latestProducts, productsWorkshops);
        },
        function(catalogueTree, superproducts,latestProducts, productsWorkshops, callback){

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
                callback(null, catalogueTree, superproducts,latestProducts, prodWorkInfo);
            }

            async.map(productsWorkshops, getProductsWorkshop, done);
        },
        function(catalogueTree, superproducts,latestProducts, prodWorkInfo, callback){
            ServiceProduct.find({"type" : "highlight"}, function(err, highlighted){
                var highlightarray=[];
                for (var i in highlighted) {
                    highlightarray[highlighted[i].productid] = highlighted[i];
                }
                callback(null, catalogueTree, superproducts,latestProducts, prodWorkInfo, highlightarray)
            })
        },
        function(catalogueTree, superproducts,latestProducts, prodWorkInfo, highlightarray, callback){
            Article.find({}).sort({'sortindex':'desc'}).limit(3).exec(function(err, articles) {
                callback(null, catalogueTree, superproducts,latestProducts, prodWorkInfo, highlightarray, articles);
            });
        },
        function(catalogueTree, superproducts,latestProducts, prodWorkInfo, highlightarray, articles, callback){
            // Посчитаем записи в таблице
            Product.count({}, function(err, c)
            {
                var productscount = parseInt(c) + 2150;
                callback(null, catalogueTree, superproducts,latestProducts, prodWorkInfo, highlightarray, articles, productscount);
            });
        },
        function(catalogueTree, superproducts,latestProducts, prodWorkInfo, highlightarray, articles, productscount, callback) {
            // Посчитаем записи в таблице
            Workshop.count({}, function(err, c)
            {
                var workshopcount = parseInt(c) + 500;
                callback(null, catalogueTree, superproducts,latestProducts, prodWorkInfo, highlightarray, articles, productscount, workshopcount);
            });
        }, function (catalogueTree, superproducts,latestProducts, prodWorkInfo, highlightarray, articles, productscount, workshopcount, callback) {
            Product.getPopular(function(popularProductsNotShuffled){
                var popularProducts = randy.shuffle(popularProductsNotShuffled);
                callback(null, catalogueTree, superproducts,latestProducts, prodWorkInfo, highlightarray, articles, productscount, workshopcount, popularProducts);
            })
        }
    ], function (err, catalogueTree, superproducts,latestProducts, prodWorkInfo, highlightarray, articles, productscount, workshopcount, popularProducts) {
        if (req.session.message) {
            var message = req.session.message;
            req.session.message = null; //

        }
        console.log(popularProducts);
        res.render('index', {
            datka:catalogueTree,
            path: req.path,
            superproducts:superproducts,
            latestProducts:latestProducts,
            prodWorkInfo:prodWorkInfo,
            highlightarray:highlightarray,
            message: message,
            articles:articles,
            productscount:productscount,
            workshopcount:workshopcount,
            popularProducts: popularProducts
        });
    });
};