var Category = require('../models/category').Category;
var User = require('../models/user').User;
var Workshop = require('../models/workshop').Workshop;
var Product = require('../models/product').Product;
var HttpError = require('../error').HttpError;
var async = require('async');
var multiparty = require('multiparty');
var util = require('util');
var PricePlan = require('../models/priceplan').PricePlan;
var ServiceProduct = require('../models/serviceproduct').ServiceProduct;
var crontab = require('node-crontab');
var fs = require('fs');
var nodemailer = require('nodemailer');
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


//Работа крон
var date = new Date();
var  log = [];

    main();

function main(){ //Главный код
var  log = [];
    async.waterfall([
        function (callback) {
            //Удаление Купленных продуктов
            ServiceProduct.find(function (err, products) {
                if (err) {
                    err = 'Провал с купленными продуктами: ' + err;
                    callback(null, err);
                } else {
                    products.forEach(function (product) {
                        if (date > product.enddate) {
                            log.push('Remove from Services products '+product._id+"\r\n");
                            product.remove();
                        }
                    });
                    callback(null);
                }
            });
        },
        function (callback) {
            //Смена тарифа
            Workshop.find(function (err, workshops) {
                if (err) {
                    console.log('Провал Воркшопами:');
                    callback(null, err);
                } else {
                    callback(null, workshops);
                }
            });
        },
        function (workshops, callback) {
            async.each(workshops, function(workshop, callback){
                changePriceplan(workshop);
                callback();
            }, function(err){
                callback();
            });
        }
    ], function (err) {
        fs.open("../logs/cron-log.txt", "a", 0644, function(err, file_handle) {
            if (!err) {
                console.log('Выполнилось');
                fs.write(file_handle, log.join(" "));
            } else {
                console.log('Ошибка');
                // Обработка ошибок при открытии
            }
        });
    });
	return;
}


function  changePriceplan(workshop){ //Работа с тарифами
    async.waterfall([
        function (callback) { //Находим мастерские, которые нужно изменить
            if ((date > workshop.pricePlanEndDate) && (workshop.priceplan != '54049946dabc8f863d17b49e')) {
                log.push('Shop update:'+workshop.name+'-'+workshop._id);
                console.log('Обновляем магазин ' + workshop.name);
                PricePlan.findById(workshop.priceplan, function (err, workshopplan) {
                    console.log('Нашли тариф');
                    callback(null, workshop, workshopplan);
                });
            } else {
                log.push('Shop not update:'+workshop.name+'-'+workshop._id+"\r\n");
                console.log('Не обновляем магазин ' + workshop.name);
                callback(true);
            }
        },
        function (workshop, workshopplan, callback) { //Проверяем автопродление, баланс и генерируем тескт письма
                User.findById(workshop._userAccountId, function (err, user) {
                    var change = 1;
                    var username = user.username;
                    var mailText;
                    if (workshop.autoUpdate == "true") {
                        log.push(', Включено автопродление');
                        console.log('Автопродление включено');
                        if (parseInt(workshopplan.price) < parseInt(user.balance)) {

                            console.log("Денег хватает");
                            workshops.splice(workshops.indexOf(workshop._id), 1);
                            var newbalance = parseInt(user.balance) - parseInt(workshopplan.price);
                            var conditions = {_id: user._id}
                                , update = {balance: newbalance}
                                , options = {};

                            User.update(conditions, update, options, function(err, user){

                                mailText = 'Тариф "'+workshopplan.name+'" для пользователя "'+user.username+'" был автоматически продлен';
                                change = 0;
                                log.push('Тариф продлен:'+workshopplan.name+', Баланс был уменьшен на '+workshopplan.price+' и теперь составлет '+user.balance);
                                callback(null, workshop, username, mailText, change);
                            });

                        } else {
                            mailText = 'На балансе пользователя "'+user.username+'" недостаточно средств для автоматического продления тарифа: "'+workshopplan.name;
                            log.push(', Недостаточно средств');
                            callback(null, workshop, username, mailText, change);
                        }
                    } else {
                        mailText = 'На аккаунте пользователя "'+user.username+'" закончился тариф "'+workshopplan.name+'". Тариф был автоматически заменен на "Тестовый"';
                        callback(null,workshop, username, mailText, change);
                    }
                });
        },
        function (workshop, username, mailText, change, callback) {//Высылаем письмо
            console.log(username+' '+mailText);
            transporter.sendMail({
                from: 'info@lavka.club',
                to: username,
                subject: 'Сообщение с сайта lavka.club',
                text: mailText
            }, function (err) {
                if (change == 1){
                    log.push(', заменен тариф на тестовый'+"\r\n");
                    callback(null, workshop);
                } else {
                    callback(true);
                }
            });
        },
        function (workshop, callback) { //Удаления товаров для мастериских с тестовым тарифом
            console.log('Удаляем товары');
            Product.find({_workshopId: workshop._id, active: true}, function (err, products) {
                var limit = products.length - 10;
                console.log(limit);
                var i = 0;
                async.forEach(products, function (product, callback) {
                    var conditions1 = {_id: product._id}
                        , options1 = {};
                    if (i < limit) {
                        log.push('Был удален товар: '+product._id+"\r\n");
                        var  update1 = {active: false};

                    } else {
                        var update1 = {active: true};
                    }
                    Product.update(conditions1, update1, options1, callback);
                    i++;
                }, callback(null,workshop));
            });
        },
        function (workshop, callback) { //Обновляем тариф для магазина
            var conditions = {_id: workshop._id}
                , update = {priceplan: '54049946dabc8f863d17b49e'}
                , options = {};

            Workshop.update(conditions, update, options, callback);
        }
    ]);
}

