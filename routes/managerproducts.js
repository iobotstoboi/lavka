var Category = require('../models/category').Category;
var ServiceProduct = require('../models/serviceproduct').ServiceProduct;
var Product = require('../models/product').Product;
var util = require('util');
var async = require('async');
var Workshop = require('../models/workshop').Workshop;

exports.get = function(req, res) {
    async.waterfall([
        function(callback){

            Category.findOne({alias: req.params.id}, function(err, category){
                if (!category){
                    console.log('Такого url не существует');
                    return res.render('../views/404');
                } else {
                    var resourceId = category._id;
                }
                callback(null, resourceId);
            });
        },
        function(resourceId) {
                async.waterfall([
                    function(callback){ //Получим дерево каталога
                        Category.getCatalogueTree(function(catalogueTree){
                            for (var i in catalogueTree){
                                if (catalogueTree[i].self._id.toString() == resourceId){
                                    var subctgs = catalogueTree[i].childs;

                                }
                            }
                            callback(null, catalogueTree, subctgs);
                        });
                    },
                    function(catalogueTree, subctgs, callback){
                        Category.findById(resourceId, function(err, currentCategory){
                            callback(null, catalogueTree, subctgs, currentCategory)
                        });
                    },
                    function(catalogueTree, subctgs, currentCategory, callback) {


                        var productTree =[];
                        //This is your async worker function
                        //It takes the item first and the callback second
                        function getProductByCategory(category, callback) {

                            //There's no true asynchronous code here, so use process.nextTick
                            //to prove we've really got it right
                            process.nextTick(function () {

                                // Получим дочерние элементы
                                Product.find({_categoryId: category._id, 'active':'true'}).sort('-created').limit(12).exec(function(err, parray) {
                                    var cat={};
                                    cat['self']=category;
                                    cat['products'] = parray;
                                    productTree.push(cat);
                                    //console.log('-----------------------');
                                    //console.log(util.inspect(cat));
                                    //console.log('-----------------------');
                                    callback(null, productTree);
                                });
                            });
                        }

                        //The done function must take an error first
                        // and the results array second
                        function done(error, result) {
                            //console.log("map completed. Error: ", error, " result: ", util.inspect(catalogueTree));
                            var productsMatched=[];
                            callback(null, catalogueTree, subctgs,currentCategory, productTree, productsMatched);
                        }

                        if (subctgs) {
                            async.map(subctgs, getProductByCategory, done);
                        } else {
                            Product.find({_categoryId:resourceId, 'active':'true'}, function(err,productsMatched){
                                callback(null, catalogueTree, subctgs, currentCategory, productTree, productsMatched);
                            })
                        }

                    },
                    function(catalogueTree, subctgs, currentCategory, productTree, productsMatched, callback){
                        ServiceProduct.findBestProducts(function(bestproducts){
                            // Теперь надо прочесать продукты
                            // Нам необходимо сформировать массив идентификаторов подходящих категорий
                            var catids=[];
                            for(var key in catalogueTree){
                                if (catalogueTree[key].self._id.toString() == resourceId) {
                                    catids.push(resourceId);
                                    for (var chilkey in catalogueTree[key].childs) {
                                        catids.push(catalogueTree[key].childs[chilkey]._id);
                                    }
                                } else {
                                    for (var chilkey in catalogueTree[key].childs) {
                                        if (catalogueTree[key].childs[chilkey]._id.toString() == resourceId) {
                                            catids.push(resourceId);
                                        }
                                    }
                                }
                            }

                            console.log('Айдишники подходящих категорий ' + util.inspect(catids));
                            var bbst=[];
                            for(var i in catids) {
                                for (var j in bestproducts){
                                    if (bestproducts[j]) {
                                        if (bestproducts[j]._categoryId.toString() == catids[i]){
                                            bbst.push(bestproducts[j]);
                                        }}
                                }
                            }

                            console.log('Лучшие товары этой и дочерних категорий ' + util.inspect(bbst));

                            callback(null, catalogueTree, currentCategory, productTree, bbst, productsMatched);
                        })
                    },
                    function(catalogueTree, currentCategory, productTree, bestproducts, productsMatched, callback){
                        var productsWorkshops = [];
                        // ТОвары по категориям
                        for (var i in productTree) {
                            for (var j in productTree[i].products){
                                productsWorkshops.push(productTree[i].products[j]._id);
                            }
                        }
                        // ТОвары крайней категории
                        for (var i in productsMatched){
                            productsWorkshops.push(productsMatched[i]._id);
                        }

                        for (var i in bestproducts){
                            productsWorkshops.push(bestproducts[i]._id);
                        }
                        //console.log('********************' + util.inspect(productsWorkshops));
                        callback(null,catalogueTree, currentCategory, productTree, bestproducts, productsWorkshops, productsMatched );
                    },
                    function(catalogueTree, currentCategory, productTree, bestproducts,productsWorkshops, productsMatched, callback){

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
                            callback(null, catalogueTree, currentCategory, productTree, bestproducts,  prodWorkInfo, productsMatched);
                        }

                        async.map(productsWorkshops, getProductsWorkshop, done);
                    },
                    function(catalogueTree, currentCategory, productTree, bestproducts,  prodWorkInfo, productsMatched, callback){
                        ServiceProduct.find({"type" : "highlight"}, function(err, highlighted){
                            var highlightarray=[];
                            for (var i in highlighted) {
                                highlightarray[highlighted[i].productid] = highlighted[i];
                            }
                            callback(null, catalogueTree, currentCategory, productTree, bestproducts,  prodWorkInfo, productsMatched, highlightarray)
                        })
                    }
                ], function (err, catalogueTree, currentCategory, productTree, bestproducts, prodWorkInfo, productsMatched, highlightarray) {
                    if (err) {
                        res.render('managerproducts', {
                            datka:catalogueTree,
                            path: req.path,
                            currentCategory:currentCategory,
                            productTree:productTree,
                            bestproducts:bestproducts,
                            prodWorkInfo:prodWorkInfo,
                            productsMatched:productsMatched,
                            highlightarray:highlightarray,
                            message:err.message});
                    } else {
                        res.render('managerproducts', {
                            datka:catalogueTree,
                            path: req.path,
                            currentCategory:currentCategory,
                            productTree:productTree,
                            bestproducts:bestproducts,
                            prodWorkInfo:prodWorkInfo,
                            productsMatched:productsMatched,
                            highlightarray:highlightarray});
                    }
                });
        }
        ]);



};