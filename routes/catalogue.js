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
                callback(null, catalogueTree);
            });
        },
        function(catalogueTree, callback) {
            var productTree =[];

            //This is your async worker function
            //It takes the item first and the callback second
            function getProductByCategory(category, callback) {

                //There's no true asynchronous code here, so use process.nextTick
                //to prove we've really got it right
                process.nextTick(function () {

                    var idishki=[];
                    for(var el in category.childs) {
                        idishki.push(category.childs[el]._id);
                    }
                    console.log('Идишники ' + util.inspect(idishki));
                    // Получим дочерние элементы
                    Product.find({_categoryId:{ $in: idishki }, 'active':'true'}).sort('-created').limit(12).exec(function(err, parray) {
                            var cat={};
                            cat['self']=category.self;
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
                callback(null, catalogueTree, productTree);
            }

            async.map(catalogueTree, getProductByCategory, done);
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
            ServiceProduct.find({"type" : "highlight"}, function(err, highlighted){
                var highlightarray=[];
                for (var i in highlighted) {
                    highlightarray[highlighted[i].productid] = highlighted[i];
                }
                callback(null, catalogueTree, productTree, superproducts, latestProducts, prodWorkInfo, highlightarray)
            })
        }
    ], function (err, catalogueTree, productTree, superproducts,latestProducts, prodWorkInfo, highlightarray ) {
        res.render('catalogue', {
            datka:catalogueTree,
            path: req.path,
            superproducts:superproducts,
            latestProducts:latestProducts,
            productTree:productTree,
            prodWorkInfo:prodWorkInfo,
            highlightarray:highlightarray
        });
    });
};