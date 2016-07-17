var postdata = require('postdata');
var HttpError = require('../error').HttpError;
var async = require('async');
var util = require('util');
var Product = require('../models/product').Product;
var ServiceProduct = require('../models/serviceproduct').ServiceProduct;
var Workshop = require('../models/workshop').Workshop;
//var searchPlugin = require('mongoose-search-plugin');
//var textSearch = require('mongoose-text-search');

exports.post = function(req, res) {
    async.waterfall([
        function(callback){
            ServiceProduct.find({"type" : "highlight"}, function(err, highlighted){
                var highlightarray=[];
                for (var i in highlighted) {
                    highlightarray[highlighted[i].productid] = highlighted[i];
                }
                callback(null, highlightarray)
            })
        },
        function(highlightarray, callback){
            postdata(req, res, function(err, data) {
                if (err) {
                    console.log(err);
                    callback(err)
                } else {
                    console.log(data); //logs an object like '{ param1: 'value1', param2: 'value2' }'
                    callback(null,data,highlightarray)
                }
            });
        },
        function(data,highlightarray, callback){
            //{ $or:[ {'_id':param}, {'name':param}, {'nickname':param} ]}
            /*'/^'+data['searchphrase']+'/'} /*{ $text: { $search: "6" } }*/
            Product.find({ $or:[    {"name": new RegExp('^.*'+data['searchphrase']+'.*', "ig") }, //^.*DEF.*$
                                    {"introText": new RegExp('^.*'+data['searchphrase']+'.*', "ig") },
                                    {"description": new RegExp('^.*'+data['searchphrase']+'.*', "ig") }]}, function(err,datasearched){
                console.log('Wow ' + datasearched);
                callback(null, data, datasearched,highlightarray);
            });
        },
        function(data, datasearched,highlightarray, callback){
            var productsWorkshops = [];
            for (var i in datasearched){
                productsWorkshops.push(datasearched[i]._id);
            }
            //console.log('********************' + util.inspect(productsWorkshops));
            callback(null,data, datasearched,highlightarray,productsWorkshops );
        },
        function(data, datasearched,highlightarray,productsWorkshops,callback){

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
                console.log('prodWorkInfo');
                console.log(util.inspect(prodWorkInfo));
                callback(null, data, datasearched,highlightarray,productsWorkshops, prodWorkInfo);
            }

            async.map(productsWorkshops, getProductsWorkshop, done);
        }
    ], function (err,data, datasearched,highlightarray,productsWorkshops, prodWorkInfo) {
        if (err) {
            req.session.message = err.message;
            res.redirect('/')
        } else {
            res.render('searchresults',{
                searchquery:data['searchphrase'],
                results:datasearched,
                highlightarray:highlightarray,
                productsWorkshops:productsWorkshops,
                prodWorkInfo:prodWorkInfo
            });
        }
    });
};