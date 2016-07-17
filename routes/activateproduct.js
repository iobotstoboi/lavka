var Category = require('../models/category').Category;
var User = require('../models/user').User;
var Workshop = require('../models/workshop').Workshop;
var Product = require('../models/product').Product;
var HttpError = require('../error').HttpError;
var async = require('async');
var multiparty = require('multiparty');
var AuthError = require('../models/user').AuthError;
var path = require("path");
var util = require('util');
var PricePlan=require('../models/priceplan').PricePlan;

exports.post = function(req,res) {

    console.log('ДОбрались до скрипта обработки запроса');
    // Получим данные формы
    var form = new multiparty.Form();
    var formdata ={};
    form.on('field', function(name,value) {
        formdata[name] = value;
        console.log('Поле ' + name + " : " + value);
    });

    form.on('error', function(err) {
        console.log('Error parsing form: ' + err.stack);
    });

    form.parse(req, function(err,fields, files) {

        console.log("Мультипарти парсер начался");
        Object.keys(fields).forEach(function(name) {
            //console.log('got field named ' + name);
        });

        // Наш пользователь
        var userAccountId = req.session.user;
        var workshopId = req.session.workshop;
        console.log('Айдишник продукта активации ' + formdata['productid'])
        async.waterfall([
            function(callback){ //проверим продукт и его хозяина
                Product.findById(formdata['productid'], function(err, product){
                    if (err) {
                        // Нет такого товара
                        console.log('ПО ходу товар не найден');
                        callback(err);
                    } else {
                        console.log('Товар найден ' +  product.name);
                        if ((product._userId == req.session.user) && (product._workshopId == req.session.workshop)){
                            console.log('Все чики пуки идем дальше');
                            callback(null,product);
                        }   else {
                            // Пользователь не тот
                            callback(new HttpError(401, "Вы не авторизованы"));
                        }
                    }
                });
            },
            function(product, callback){ // проверим тариф
                if (req.session.workshop) {
                    workshopid=req.session.workshop;
                    Product.getProductsByWorkshop(req.session.workshop, function(matchedProducts) {
                        console.log('НАшли товары мастерской, их ' + matchedProducts.length);
                        callback(null, product, matchedProducts);
                    });
                }
            },
            function(product, matchedProducts, callback){
                Workshop.findById(req.session.workshop, function(err, workshop){
                    // НАс интересует тариф
                    console.log('Есть мастерская ' + util.inspect(workshop) );
                    callback(null, product, matchedProducts, workshop);
                })
            },
            function(product, matchedProducts, workshop, callback){
                PricePlan.findById(workshop.priceplan, function(err, priceplan){
                    var cocount=0; // Количество активных товаров
                    for(var val in matchedProducts){
                        if (matchedProducts[val].active == "true") {cocount++;}
                    }
                    console.log('Активных товаров у пользователя ' + cocount);
                    if (parseInt(priceplan['product-limit-high']) > cocount || parseInt(priceplan['product-limit-high']) == 0) {
                        // Место еще есть и можно активировать
                        var conditions = { _id: formdata['productid'] }
                            , update = { active: 'true'}
                            , options = {};


                        // Обновляем объект в БД
                        Product.update(conditions, update, options, function() {
                            callback(null);
                        });


                    } else {
                        // нет места. Надо менять тариф юзеру
                        console.log('нет места. Надо менять тариф юзеру');
                    }
                })
            }
        ], function (err) {
            // result now equals 'done'
            if (err) {
                console.log(util.inspect(err));
            } else {
                res.redirect('/workshop-private');
            }
        });

    });

};
