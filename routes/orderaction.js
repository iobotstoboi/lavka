var postdata = require('postdata');
var HttpError = require('../error').HttpError;
var async = require('async');
var util = require('util');
var Order = require('../models/order').Order;
var Product = require('../models/product').Product;
//var Product = require('../models/product').Product;
//var ServiceProduct = require('../models/serviceproduct').ServiceProduct;
//var Workshop = require('../models/workshop').Workshop;
//var searchPlugin = require('mongoose-search-plugin');
//var textSearch = require('mongoose-text-search');

exports.post = function(req, res) {
    async.waterfall([
        function(callback){
            postdata(req, res, function(err, data) {
                if (err) {
                    console.log(err);
                    callback(err)
                } else {
                    console.log(data); //logs an object like '{ param1: 'value1', param2: 'value2' }'
                    callback(null,data)
                }
            });
        },
        function(data, callback){
            //console.log('Получили мы запрос на удаление заказа');
            //console.log(util.inspect(data));
            if (data['act'] == 'delete'){
                //console.log('Удаляем вот это заказ ' +  data['orderid']);
                Order.findById(data['orderid'],function (err, doc) {
                    if (err) {callback(err);}
                    doc.status = "deleted";
                    doc.save(function(){
                        callback(null);
                    })
                    /*doc.remove(function(){
                        callback(null)
                    }); //Removes the document
                    */
                })
            }
            if (data['act'] == 'confirm') {
                Order.findById(data['orderid'],function (err, doc) {
                    if (err) {callback(err);}
                    doc.status = "confirmed";
                    doc.save(function(){
                        Product.findById(doc.product, function(err, product) {
                            if (err) {callback(err);}
                            product.available = product.available-1;
                            console.log('PPPPPPPPPPPPPPPPPPPPPPPRODUCTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',product);
                            product.save(function() {
                                console.log('SAVED');
                            });
                            callback(null);
                        });
                        
                    })
                    console.log(doc);
                    /*doc.remove(function(){
                        callback(null)
                    }); //Removes the document
                    */
                });
                
            }
        }
    ], function (err) {
        if (err) {
            req.session.message = err.message;
            res.redirect('/workshop-private#editOrders')
        } else {
            res.redirect('/workshop-private#editOrders');
        }
    });
};