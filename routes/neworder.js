var User = require('../models/user').User;
var HttpError = require('../error').HttpError;
var AuthError = require('../models/user').AuthError;
var async = require('async');
var Category = require('../models/category').Category;
var postdata = require('postdata');
var util = require('util');
var Order = require('../models/order').Order;
var Product = require('../models/product').Product;
var nodemailer = require('nodemailer');
var Workshop = require('../models/workshop').Workshop;
var randtoken = require('rand-token');

var transporter = nodemailer.createTransport({
    host: 'smtp.lavka.club',
    port: '25',
    secure:false,
    //secureConnection: true,
    debug:true,
    tls: {rejectUnauthorized: false},
    auth: {
        user: 'info@lavka.club',
        pass: 'appleby2'
    }
});

// Просто добавляем заказ
exports.post = function(req, res) {
    async.waterfall([
        function(callback){
            //console.log('User url: ' + util.inspect(req));
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
            // Найдем по быстренькому мастерскую - хозяина товара
            if (data['productid']) {
                Product.findById(data['productid'], function(err, product){
                    if (err) {
                        console.log('Ошибка когда искали продукт' + util.inspect(err));
                        callback(err);
                    } else {
                        productWorkshop = product._workshopId;
                        console.log('Нашли продукт' + util.inspect(product));
                        callback(null, data,productWorkshop )
                    }
                });
            }
        },
        function(data,productWorkshop, callback){
            // СОЗДАЕМ НОВЫЙ ЗАКАЗ
            var ordernumber = randtoken.generate(5);
            if ((data['userid']) && (data['productid'])) {
                var order = new Order({ user: data['userid'],
                    product: data['productid'],
                    workshop: productWorkshop,
                    comment:data['comment'],
                    ordernumber:ordernumber
                });
                console.log(order);
                order.save(function(err) {
                    if (err) return callback(err);
                    callback(null, productWorkshop, data['userid']);
                });
            }   else {
                callback(new HttpError('Не получен один из необходимых параметров'));
            }
        },
        function(productWorkshop, userdata,  callback){
            // Нам нужен email для отправки заказа
            Workshop.findById(productWorkshop, function(err, wrkshp) {
                if (err) {
                    console.log('Ошибка когда искали мастерскую' + util.inspect(err));
                    callback(new HttpError('Не найдена мастерская'));
                } else {
                    console.log('Нашли мастерскую' + util.inspect(wrkshp));
                    callback(null, wrkshp, userdata)
                }

            });
        },
        function(wrkshp,userdata, callback){
            // Нам нужен email для отправки заказа
            User.findById(wrkshp['_userAccountId'], function(err, workshopuser) {
                if (err) {
                    console.log('Ошибка когда искали пользователя' + util.inspect(err));
                    callback(new HttpError('Не найдена мастерская'));
                } else {
                    console.log('Нашли пользователя' + util.inspect(workshopuser));
                    callback(null, wrkshp, workshopuser, userdata)
                }

            });
        },
        function(wrkshp, workshopuser, userdata, callback){
            // Нам нужен email для отправки заказа
            User.findById(userdata, function(err, userbuyer) {
                if (err) {
                    console.log('Ошибка когда искали пользователя' + util.inspect(err));
                    callback(new HttpError('Не найдена мастерская'));
                } else {
                    console.log('Нашли пользователя' + util.inspect(userbuyer));
                    callback(null, wrkshp, workshopuser,userdata, userbuyer)
                }

            });
        },
        function(wrkshp, workshopuser, userdata,userbuyer,callback) {
            transporter.sendMail({
                from: 'info@lavka.club',
                to: workshopuser.username,
                subject: 'Новый заказ на сайте lavka.club',
                text: 'У Вас новый заказ на сайте lavka.club'
            }, function(err){
                if (err) {
                    console.log(err);
                    callback(err);
                } else {
                    callback(null, wrkshp, workshopuser, userdata, userbuyer);
                }
            });
        },
        function(wrkshp, workshopuser, userdata,userbuyer, callback) {
            transporter.sendMail({
                from: 'info@lavka.club',
                to: userbuyer.username,
                subject: 'Ваш заказ на сайте lavka.club',
                text: 'Вы совершили заказ на сайте lavka.club. В ближайшее время с Вами свяжется представитель мастерской для подтверждения заказа и согласования способа оплаты и доставки.'
            }, function(err){
                if (err) {
                    console.log(err);
                    callback(err);
                } else {
                    callback(null);
                }
            });
        }
    ], function (err) {
        if (err) {
            console.log(err);
            console.log('NO NO NO')
            req.session.message = "Произошла ошибка. Повторите пожалуйста еще раз.";
            //res.redirect('/')
        } else {
            // в ответ нам надо отправить запрос с данными WMI_RESULT=OK
            console.log('OK OK');
            req.session.cart = null;
            req.session.message = "Заказ отправлен. Благодарим Вас.";
            res.redirect('/')
            res.send({});
        }
    })  ;
};
