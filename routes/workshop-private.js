var Category = require('../models/category').Category;
var ServiceProduct = require('../models/serviceproduct').ServiceProduct;
var User = require('../models/user').User;
var Workshop = require('../models/workshop').Workshop;
var Product = require('../models/product').Product;
var Order = require('../models/order').Order;
var util = require('util');
var async = require('async');
var PricePlan = require('../models/priceplan').PricePlan;
var Alias = require('../models/alias').Alias;
var Message = require('../models/message').Message;
exports.get = function(req, res) {

    console.log('Start loading data');
    async.waterfall([
        function(callback) { // Зафиксим айдишник мастерской
            // Если мы по каким-то причинам не знаем id мастерской то достанем и положим его в сессию
            if (!req.session.workshop) {
                Workshop.getWorkshopByUser(req.session.user, function(wsh) {
                    req.session.workshop = wsh._id;
                    callback(null, req.session.workshop);
                });
            } else {callback(null, req.session.workshop);}
        },
        function(workshopid,callback) {
            Workshop.getWorkshop(workshopid, function(workshop) {
                if (workshop.pricePlanEndDate){
                    var newMonth = workshop.pricePlanEndDate.getMonth() + 1;
                    var newDay = workshop.pricePlanEndDate.getDate();
                    if (newMonth < 10) newMonth = '0' + newMonth;
                    if (newDay < 10) newDay = '0' + newDay;
                    workshop.end = newDay+"."+newMonth+ "."+workshop.pricePlanEndDate.getFullYear();
                }
                callback(null, workshopid, workshop);
            });
        },
        function(workshopid, workshop, callback){ //Получим товары по айдишнику мастерской
            Product.getProductsByWorkshop(workshopid, function(matchedProducts) {
                matchedProducts.forEach(function(product){
                    if (product.bestProductEndDate){
                        var newMonth = product.bestProductEndDate.getMonth() + 1;
                        var newDay = product.bestProductEndDate.getDate();
                        if (newMonth < 10) newMonth = '0' + newMonth;
                        if (newDay < 10) newDay = '0' + newDay;
                        product.bestdate = newDay+"."+newMonth+ "."+product.bestProductEndDate.getFullYear();
                    }
                    if (product.superProductEndDate) {
                        var newMonth = product.superProductEndDate.getMonth() + 1;
                        var newDay = product.superProductEndDate.getDate();
                        if (newMonth < 10) newMonth = '0' + newMonth;
                        if (newDay < 10) newDay = '0' + newDay;
                        product.superdate = newDay+"."+newMonth+ "."+product.superProductEndDate.getFullYear();
                    }
                });
               callback(null, workshop, matchedProducts);
            });
        },
        function(workshop, matchedProducts, callback){ // получим дерево каталога
            Category.getCatalogueTree(function(catalogueTree){
                callback(null, workshop, matchedProducts, catalogueTree );
            });
        },
        function(workshop, matchedProducts, catalogueTree, callback) { //Получим данные о текущем плане
            PricePlan.getPricePlanObject(workshop.priceplan, function(priceplan){
                callback(null,workshop, matchedProducts, catalogueTree, priceplan);
            });
        },
        function(workshop, matchedProducts, catalogueTree, priceplan, callback) {
            console.log('get the priceplans now');
            PricePlan.getPricePlans(function(pricePlans){
                //console.log('-------------------------------');
                //console.log(util.inspect(pricePlans));
                callback(null, workshop, matchedProducts, catalogueTree, priceplan, pricePlans);
            })
        },
        function(workshop, matchedProducts, catalogueTree, priceplan,pricePlans, callback) {
            //console.log('get the orders now');
            Order.find({workshop:workshop._id, status:{$ne: "deleted"}},function(err,orders){
                if (err){
                    callback(err);
                } else {
                    //console.log('-------------------------------');
                    //console.log(util.inspect(orders));
                    callback(null, workshop, matchedProducts, catalogueTree, priceplan, pricePlans, orders);
                }
            })
        },
        function(workshop, matchedProducts, catalogueTree, priceplan, pricePlans, orders, callback){
                var orderrays = [];
                function getOrdersElements(order, callback) {
                    process.nextTick(function () {
                        Product.findById(order.product, function(err, productobj){
                            if (err) {
                                callback(err)
                            } else {
                                console.log('Товар заказа ' + productobj);
                                User.findById(order.user, function(err,usersuplier){
                                    if (err) {
                                        callback(err);
                                    } else {
                                        var orderray = order;
                                        orderray.productobj = productobj;
                                        orderray.usersuplier = usersuplier;
                                        orderrays.push(orderray);
                                        console.log('Заказ целиком теперь ' + util.inspect(orderray))
                                        callback(null, orderrays);
                                    }
                                })
                            }
                        });
                    });
                }

                function done(error, result) {
                    callback(null,workshop, matchedProducts, catalogueTree, priceplan, pricePlans, orderrays);
                }

                async.map(orders, getOrdersElements, done);
        },
        function(workshop, matchedProducts, catalogueTree, priceplan, pricePlans, orderrays, callback){
            ServiceProduct.findSuperProducts(function(superproducts){
                console.log('SuperArray here:' + superproducts);
                var superProductsArray=[];
                for (var i in superproducts) {
                    superProductsArray[superproducts[i]._id] = superproducts[i];
                }
                console.log('SuperArray here:' + superProductsArray);
                callback(null, workshop, matchedProducts, catalogueTree, priceplan, pricePlans, orderrays,  superProductsArray);
            })
        },
        function(workshop, matchedProducts, catalogueTree, priceplan, pricePlans, orderrays,  superProductsArray, callback){
            ServiceProduct.find({"type" : "highlight"}, function(err, highlighted){
                var highlightarray=[];
                for (var i in highlighted) {
                    highlightarray[highlighted[i].productid] = highlighted[i];
                }
                callback(null, workshop, matchedProducts, catalogueTree, priceplan, pricePlans, orderrays,  superProductsArray, highlightarray)
            })
        },
        function(workshop, matchedProducts, catalogueTree, priceplan, pricePlans, orderrays,  superProductsArray,highlightarray, callback){
            ServiceProduct.find({"type" : "best"}, function(err, bestes){
                var bestproducts=[];
                for (var i in bestes) {
                    bestproducts[bestes[i].productid] = bestes[i];
                }
                callback(null, workshop, matchedProducts, catalogueTree, priceplan, pricePlans, orderrays,  superProductsArray, highlightarray,bestproducts)
            })
        },
        function(workshop, matchedProducts, catalogueTree, priceplan, pricePlans, orderrays,  superProductsArray,highlightarray,bestproducts, callback){
            Message.find({'user2':workshop._userAccountId}, function(err, messages1){
                if (err) {
                    console.log(err);
                }
                console.log(workshop._userAccountId);
                console.log('Messages', messages1);
                Message.find({'user1':workshop._userAccountId}, function(err, messages2){
                    if (err) {
                        console.log(err);
                    }
                    console.log(workshop._userAccountId);
                    console.log('Messages', messages2);
                    function collect() {
                      var ret = {};
                      var len = arguments.length;
                      for (var i=0; i<len; i++) {
                        for (p in arguments[i]) {
                          if (arguments[i].hasOwnProperty(p)) {
                            ret[p] = arguments[i][p];
                          }
                        }
                      }
                      return ret;
                    }
                    console.log('-_-_-_-_--_-_-_-_--_-_-_-_- messages1 -_-_-_-_--_-_-_-_-')
                    console.log(messages1)
                    console.log('-_-_-_-_--_-_-_-_--_-_-_-_- messages2 -_-_-_-_--_-_-_-_-')
                    console.log(messages2)
                    var messages = messages1.concat(messages2);
                    console.log('-_-_-_-_--_-_-_-_--_-_-_-_- All -_-_-_-_--_-_-_-_-')
                    console.log(messages)
                    
                    callback(null, workshop, matchedProducts, catalogueTree, priceplan, pricePlans, orderrays,  superProductsArray, highlightarray,bestproducts,messages)
                })
            })
        }

    ], function (err,workshop, matchedProducts, catalogueTree, priceplan, pricePlans, orders,  superProductsArray, highlightarray,bestproducts,messages) {
        // result now equals 'done'
        console.log('Just a moment before rendering ' + util.inspect(priceplan));
        if (req.session.message) {
            var message = req.session.message;
            req.session.message = null; //
        }

        res.render('workshop-private', {
            datka:catalogueTree,
            path: req.path,
            workshop: workshop,
            alias: Alias,
            workshopProducts: matchedProducts,
            priceplan:priceplan,
            priceplans:pricePlans,
            message:message,
            orders:orders,
            superProductsArray:superProductsArray,
            highlightarray:highlightarray,
            bestproducts:bestproducts,
            messages:messages
        });
    });



    /*
    Category.getCatalogueTree(function(catalogueTree){
        // Если мы по каким-то причинам не знаем id мастерской то достанем и положим его в сессию
        if (!req.session.workshop) {
            Workshop.getWorkshopByUser(req.session.user, function(wsh) {
                //console.log(wsh['name']);
                req.session.workshop = wsh._id;
                console.log(util.inspect(req.session));
                res.render('workshop-private', {datka:docs, path: req.path, workshop: wsh});
            });
        } else {
            //В сессии уже есть id, получим объект с этим id и отправим его на рендер
            Workshop.findOne({_id : req.session.workshop}, function (err, wsh){
                    res.render('workshop-private', {datka:catalogueTree, path: req.path, workshop: wsh})
                });

        }

    }); */

};