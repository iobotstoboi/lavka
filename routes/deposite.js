var User = require('../models/user').User;
var multiparty = require('multiparty');
var HttpError = require('../error').HttpError;
var AuthError = require('../models/user').AuthError;
var async = require('async');
var Category = require('../models/category').Category;
var postdata = require('postdata');
var Payment = require('../models/payment').Payment;

// Обрабатываем GET запрос - загрузка страницы авторизации
exports.get = function(req, res) {
    Category.getCatalogueTree(function(catalogueTree){
        var message = req.session.message;
        req.session.message = null; //

        res.render('deposite', {datka:catalogueTree, path: req.path, message:message});
    });
};



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
            if (data['WMI_ORDER_STATE'] === 'Accepted') {
                callback(null, data);
            } else {
                callback(new Error('Заказ не оплачен'));
            }
        },
        function(data,callback){
            // Найдем для начала есть ли уже такая запись в журнале
            Payment.findOne({agr_order_id: data['WMI_ORDER_ID']}, function(err, payment){
                if (err) {
                    callback(err);
                } else {
                    callback(null, data, payment);
                }
            })
        },
        function(data, paymentOld, callback) {
            if (paymentOld) {
                // платеж уже есть в системе. Значит в прошлый раз просто не получилось начислить пользователю средства
                callback(null, data, paymentOld);
            }  else {
                var payment = new Payment({
                    sum:data['WMI_PAYMENT_AMOUNT'], // Сумма
                    currency: data['WMI_CURRENCY_ID'], // Валюта
                    agr_user:data['WMI_TO_USER_ID'], // Идентификатор пользователя в системе аггрегаторе платежей
                    agr_payment_no:data['WMI_PAYMENT_NO'], //Номер платежа в системе аггрегатора
                    agr_order_id: data['WMI_ORDER_ID'], // Идентификаторв платежа в системе агратора
                    adr_descritpion:data['WMI_DESCRIPTION'], // Описание платежа в системе агрегатора
                    agr_create_date: data['WMI_CREATE_DATE'], // Дата создания платежа в системе агрегатора
                    agr_update_date: data['WMI_UPDATE_DATE'], // Дата изменение платежа в системе агрегатора
                    agr_order_state: data['WMI_ORDER_STATE'], // Статус платежа в системе агрегатора
                    status:'false'
                });

                payment.save(function(err) {
                    if (err) {
                        console.log(util.inspect(err));
                        return callback(err);
                    }
                    callback(null, data, payment);
                });
            }
        },
        function(data,payment,callback) {
            // Из полученных данных нам понадобится:
            // WMI_PAYMENT_AMOUNT   Сумма которую оплатил пользователь
            // WMI_CURRENCY_ID      Валюта надо проерить если это рубли (643)
            // WMI_TO_USER_ID       Номер кошелька владельца
            // WMI_PAYMENT_NO	    Идентификатор заказа в системе учета интернет-магазина. !!!
            // WMI_ORDER_ID	        Идентификатор заказа в системе учета Единой кассы. !!!
            // WMI_DESCRIPTION	    Описание заказа.
            // WMI_EXPIRED_DATE	    Срок истечения оплаты в западно-европейском часовом поясе (UTC+0).
            // WMI_CREATE_DATE      Дата создания в западно-европейском часовом поясе (UTC+0).
            // WMI_UPDATE_DATE	    Дата изменения заказа в западно-европейском часовом поясе (UTC+0).
            // WMI_ORDER_STATE	    Состояние оплаты заказа: Accepted  — заказ оплачен;
            // WMI_SIGNATURE	    Подпись уведомления об оплате, сформированная с использованием «секретного ключа» интернет-магазина.
            // userid               иденификатор нашего пользователя !!!

            User.findById(data['userid'], function(err, user){
                if (user) {
                    var oldbalance = parseInt(user.balance);
                    user.balance = parseInt(user.balance) + parseInt(data['WMI_PAYMENT_AMOUNT']);
                    user.save(function(err) {
                        if (err) {
                            console.log('Не получилось начислить пользователю оплаченные средства');
                            callback(new HttpError('Не получилось начислить пользователю оплаченные средства'));
                        } else {
                            // Теперрь запомним что платеж прошел удачно
                            payment.status = 'true';
                            payment.save(function(err){
                                if (err) {
                                    console.log(util.inspect(err));
                                    console.log('Денег пользователю начислили, а записать не получилось');
                                    callback(err);
                                }
                                callback(null);
                            })
                        }
                    });
                } else {
                    // а вот если пользователь не найден что делать?
                    callback(null);
                }

            });

        }
    ], function (err) {
        if (err) {
            res.send('WMI_RESULT=RETRY');
        } else {
            // в ответ нам надо отправить запрос с данными WMI_RESULT=OK
            res.send('WMI_RESULT=OK');
        }
    })  ;
};
