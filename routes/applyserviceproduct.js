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
var ServiceProduct = require('../models/serviceproduct').ServiceProduct;

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

        console.log('Айди продукта' + formdata['productid'])
        // Теперь логика такая:
        // Проверить кто пытается изменить товар
        // Получить баланс пользователя и сверить с требуемой суммой
        // Снять соответствующую сумму со счета пользователя
        // Сделать новую запись в сооответствующей таблице БД (сперпредложения, лучшие предложения, выделение товара)
        // Вернуть сообщение, что все отлично


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
            function(product,callback) {
                User.findById(req.session.user, function(err, user) {
                    var servicePrice;
                    console.log('Подключаем услугу ' + formdata['service'])

                    switch (formdata['service']) {
                        case 'highlight':
                            servicePrice=50;
                            break;
                        case 'super':
                            servicePrice=150;
                            break;
                        case 'best':
                            servicePrice=80;
                            break;
                        default:
                            /* callback(new HttpError(401, "Выберите услугу")); */
                    }
                    console.log('Цена услуги ' + servicePrice);
                    console.log('Баланс пользователя' + parseInt(user.balance));
                    if (parseInt(user.balance) >= servicePrice) {
                        // Значит средств у пользователя достаточно
                        callback(null, product, user, servicePrice)
                    } else {
                        callback(new HttpError(401, "Недостаточно средств"));
                    }
                });
            },
            function(product, user, servicePrice, callback){ // проверим баланс
                var newbalance = parseInt(user.balance) - servicePrice;
                var conditions = { _id: req.session.user }
                    , update = {balance: newbalance}
                    , options = {};
                // Обновляем объект в БД
                User.update(conditions, update, options, function() {
                    callback(null, product, user, servicePrice);
                });
            },
            function(product, user, servicePrice, callback){
                var EndDate = new Date();
                var StartDate = new Date();
                EndDate.setDate(EndDate.getDate()+ 10);
                var conditions = { _id: product._id},
                    update
                    , options = {};
                switch (formdata['service']) {
                    case 'highlight':
                        update={ highlight: true, highlightProductStartDate: StartDate, highlightProductEndDate: EndDate};
                        break;
                    case 'super':
                        update={ super: true, superProductStartDate: StartDate, superProductEndDate: EndDate};
                        break;
                    case 'best':
                        update={ best: true, bestProductStartDate: StartDate, bestProductEndDate: EndDate};
                        break;
                    default:
                    /* callback(new HttpError(401, "Выберите услугу")); */
                }
                Product.update(conditions, update, options, function() {
                    callback(null, product, user, servicePrice);
                });
            },
            function(product, user, servicePrice, callback) {

                var enddate = new Date();
                enddate.setDate(enddate.getDate()+ 10);

                ServiceProduct.createNew(product._id, formdata['service'], enddate, function(err, serviceproduct) {
                    callback(null);
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
