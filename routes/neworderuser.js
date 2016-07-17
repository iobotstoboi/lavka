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
                    console.log('Произошла ошибка при обработке данных с формы' + err);
                    callback(err)
                } else {
                    console.log('Получены данные с формы ' + data);
                    console.log(data); //logs an object like '{ param1: 'value1', param2: 'value2' }'
                    callback(null,data)
                }
            });
        },
        function(data, callback){
            User.findOne({username: data['emailInput']}, function(err,user) {
                if (err) {
                    console.log(err);
                    callback(err);
                } else {
                    if(user) {
                        callback(new AuthError("Такой пользователь уже существует"));
                    }  else {
                        console.log('Будем регистрировать новго юзера')
                        callback(null,data);
                    }
                }
            }); // Проверим существует ли уже такой пользователь
        },
        function(data, callback){
            // Создаем пользователя
            if ((data['emailInput']) && (data['passwordInput'])) {
                var user = new User({ username: data['emailInput'],
                    password: data['passwordInput'],
                    firstName: data['firstNameInput'],
                    secondName: data['secondNameInput'],
                    phone: data['phoneInput']
                });
                console.log('Вот такой юзер')
                console.log(user);
                user.save(function(err) {
                    if (err) {
                        console.log('Ошибка при регистрации нового пользователя ' + util.inspect(err));
                        callback(err);
                    } else {
                        req.session.user = user._id;
                        console.log('Пользователь зарегистрирован ' + util.inspect(user));
                        callback(null, data, user);
                    }
                });
            }   else {
                callback(new HttpError('Не получен один из необходимых параметров'));
            }
        },
        function(data,userbuyer, callback){
            // Найдем по быстренькому мастерскую - хозяина товара
            if (data['productid']) {
                Product.findById    (data['productid'], function(err, product){
                    if (err) {
                        console.log('Ошибка когда искали продукт' + util.inspect(err));
                        callback(err);
                    } else {
                        console.log('Нашли продукт' + util.inspect(product));
                        productWorkshop = product._workshopId;
                        callback(null, data,userbuyer, productWorkshop )
                    }
                });
            }
        },
        function(data,userbuyer,productWorkshop, callback){
            // СОЗДАЕМ НОВЫЙ ЗАКАЗ
            var ordernumber = randtoken.generate(5);
            if ((userbuyer._id) && (data['productid'])) {
                var order = new Order({ user: userbuyer._id,
                    product: data['productid'],
                    workshop: productWorkshop,
                    comment:data['comment'],
                    ordernumber:ordernumber
                });
                order.save(function(err) {
                    if (err) return callback(err);
                    callback(null,productWorkshop,userbuyer,data);
                });
            }   else {
                callback(new HttpError('Не получен один из необходимых параметров'));
            }

        },
        function(productWorkshop, userbuyer,data,  callback){
            // Нам нужен email для отправки заказа
            Workshop.findById(productWorkshop, function(err, wrkshp) {
                if (err) {
                    console.log('Ошибка когда искали мастерскую' + util.inspect(err));
                    callback(new HttpError('Не найдена мастерская'));
                } else {
                    console.log('Нашли мастерскую' + util.inspect(wrkshp));
                    callback(null, wrkshp, userbuyer,data)
                }

            });
        },
        function(wrkshp,userbuyer,data, callback){
            // Нам нужен email для отправки заказа
            User.findById(wrkshp['_userAccountId'], function(err, workshopuser) {
                if (err) {
                    console.log('Ошибка когда искали пользователя' + util.inspect(err));
                    callback(new HttpError('Не найдена мастерская'));
                } else {
                    console.log('Нашли пользователя' + util.inspect(workshopuser));
                    callback(null, wrkshp, workshopuser, userbuyer,data)
                }

            });
        },
        function(wrkshp, workshopuser, userbuyer,data,callback) {
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
                    callback(null, wrkshp, workshopuser, userbuyer,data);
                }
            });
        },
        function(wrkshp, workshopuser, userbuyer,data, callback) {
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
                    callback(null, workshopuser, userbuyer, data, callback);
                }
            });
        }
    ], function (err, workshopuser, userbuyer, data, callback) {
        if (err) {
            console.log(err, workshopuser, userbuyer, data, callback);
            console.log('NO NO NO');
            req.session.message = "Произошла ошибка. " + err.message +" Повторите пожалуйста еще раз.";
            //res.redirect('/')
        } else {
            console.log('OK OK OK');
            // в ответ нам надо отправить запрос с данными WMI_RESULT=OK
            req.session.cart = null;
            console.log(userbuyer);
            req.session.message = "Заказ отправлен. Благодарим Вас.";
            res.send({userid: userbuyer});
            //res.redirect('/')
        }
    })  ;
};
