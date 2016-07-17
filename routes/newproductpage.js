var Category = require('../models/category').Category;
var ServiceProduct = require('../models/serviceproduct').ServiceProduct;
var Product = require('../models/product').Product;
var util = require('util');
var async = require('async');
var Workshop = require('../models/workshop').Workshop;
var mongoose = require('mongoose');
var fs = require('fs');
var path = require("path");

exports.get = function(req, res) {
    async.waterfall([
        function(callback){
            //if (fs.) {res.sendFile()}
            fs.stat(path.resolve(__dirname + req.url), function(err, stat) {
                if(err == null) {
                    console.log('ФАИЛ' + req.url);
                    res.sendFile(path.resolve(__dirname + req.url))
                } else {

            console.log('НЕФАИЛ' + req.url);
            var aliasArray = req.params.id.split('_');
            //var reqId = aliasArray[1];
            console.log(util.inspect(aliasArray));
            var lastaliasarray = aliasArray.length;
            console.log('Ищем ' + lastaliasarray);
            console.log(aliasArray[lastaliasarray-1]);
            //Без этого выбивает ошибку
            if (mongoose.Types.ObjectId.isValid(aliasArray[lastaliasarray-1])) {
                var idtolookfor = mongoose.Types.ObjectId(aliasArray[lastaliasarray-1]);
            }
            console.log('Ищем ' + aliasArray[lastaliasarray-1]);
            Product.findById(idtolookfor, function(err, product){
                if (!product){
                    console.log('Такого url не существует');
                    return res.render('../views/404');
                } else {
                    var resourceId = product._id;
                }
                callback(null, resourceId);
            });

                }
            });
        },
        function(resourceId) {
            async.waterfall([
                function(callback){ //Получим дерево каталога
                    Category.getCatalogueTree(function(catalogueTree){
                        callback(null, catalogueTree);
                    });
                },
                function(catalogueTree, callback) {
                    var productTree=[];
                    callback(null, catalogueTree, productTree);
                },
                function(catalogueTree, productTree, callback){
                    ServiceProduct.findSuperProducts(function(superproducts){
                        callback(null, catalogueTree, productTree, superproducts);
                    })
                },
                function(catalogueTree, productTree, superproducts, callback){
                    Product.getLatest(function(latestProducts){
                        callback(null, catalogueTree, productTree, superproducts,latestProducts );
                    })
                },
                function(catalogueTree, productTree, superproducts, latestProducts, callback){
                    var productsWorkshops = [];
                    for (var i in productTree) {
                        for (var j in productTree[i].products){
                            productsWorkshops.push(productTree[i].products[j]._id);
                        }
                    }
                    for (var i in superproducts) {
                        productsWorkshops.push(superproducts[i]._id);
                    }
                    //console.log('********************' + util.inspect(productsWorkshops));
                    callback(null,catalogueTree, productTree, superproducts,latestProducts, productsWorkshops );
                },
                function(catalogueTree, productTree, superproducts,latestProducts, productsWorkshops, callback){

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
                        callback(null, catalogueTree, productTree, superproducts, latestProducts, prodWorkInfo);
                    }

                    async.map(productsWorkshops, getProductsWorkshop, done);
                },
                function(catalogueTree, productTree, superproducts, latestProducts, prodWorkInfo, callback){
                    Product.findById(resourceId, function(err, currentProduct){
                        callback(null, catalogueTree, productTree, superproducts, latestProducts, prodWorkInfo, currentProduct);
                    });
                },
                function(catalogueTree, productTree, superproducts, latestProducts, prodWorkInfo, currentProduct, callback){
                    Workshop.findById(currentProduct._workshopId, function(err, currentWorkshop){
                        callback(null, catalogueTree, productTree, superproducts, latestProducts, prodWorkInfo, currentProduct, currentWorkshop);
                    })
                },
                function(catalogueTree, productTree, superproducts, latestProducts, prodWorkInfo, currentProduct, currentWorkshop, callback) {
                    Category.findById(currentProduct._categoryId, function(err, currentCategory){
                        callback(null, catalogueTree, productTree, superproducts, latestProducts, prodWorkInfo, currentProduct, currentWorkshop, currentCategory);
                    })
                },
                function(catalogueTree, productTree, superproducts, latestProducts, prodWorkInfo, currentProduct, currentWorkshop, currentCategory, callback){
                    var optionsProduct = {upsert: false};
                    var conditionsProduct = {_id: currentProduct._id};
                    console.log(currentProduct._id+currentProduct.views);
                    if (currentProduct.views){
                        var updateProduct = {views: currentProduct.views + 1};
                    } else {
                        var updateProduct = {views: 1};
                    }
                    Product.update(conditionsProduct, updateProduct, optionsProduct, function(){
                        callback(null, catalogueTree, productTree, superproducts, latestProducts, prodWorkInfo, currentProduct, currentWorkshop, currentCategory)
                    });
                }
            ], function (err, catalogueTree, productTree, superproducts, latestProducts, prodWorkInfo, currentProduct, currentWorkshop,currentCategory ) {
                res.render('productpage', {
                    datka:catalogueTree,
                    path: req.path,
                    superproducts:superproducts,
                    latestProducts:latestProducts,
                    productTree:productTree,
                    prodWorkInfo:prodWorkInfo,
                    currentProduct:currentProduct,
                    currentWorkshop:currentWorkshop,
                    currentCategory:currentCategory
                });
            });

        }
        ]);



};