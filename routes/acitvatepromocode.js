var Promocode = require('../models/promocode').Promocode;
var User = require('../models/user').User;
var multiparty = require('multiparty');
var HttpError = require('../error').HttpError;
var AuthError = require('../models/user').AuthError;
var async = require('async');
var util = require('util');

// Обрабатываем POST запрос - активация промокода
exports.post = function(req, res) {

    async.waterfall([
        function(callback){
            var thecode = 'LVK';
            var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            for (var i= 0; i<9; i++){
                thecode += possible.charAt(Math.floor(Math.random() * possible.length))
            }
            console.log('Thecode now is ' + thecode);
            if (thecode.length == 12) {
                Promocode.createPromocode(thecode, function(err, promocode){
                    console.log('Новый промокод');
                    console.log(util.inspect(promocode));
                    callback(null);
                })
            }

        }, 
        function(callback){ // Загрузим данные с формы сначала

            var form = new multiparty.Form();
            var formdata ={};
            form.on('field', function(name,value) {
                formdata[name] = value;
            });

            form.parse(req, function(err, fields, files) {

                Object.keys(fields).forEach(function(name) {
                    //console.log('got field named ' + name);
                });

                callback(null, formdata);
            });
        },
        function(formdata, callback){
            // Проверим есть ли такой промокод
            Promocode.findOne({code:formdata['promocode']}, function(err, promocode){
                if (!promocode){
                    // Если промокод не найден
                    console.log('Промокод ' + formdata['promocode'] + 'не найден');
                    callback(new HttpError(403, 'Промокод не верен'));
                } else {
                    console.log('Промокод ' + formdata['promocode'] + ' найден');
                    console.log(util.inspect(promocode));
                    callback(null, formdata, promocode);
                }
            })
        },
        function(formdata, promocode, callback) {
            if (promocode.active == 'true') {
                callback(null, formdata, promocode)
            } else {
                callback(new HttpError(403, 'Промокод не действителен. Не пытайтесь повторно активировать промокод.'))
            }
        },
        function(formdata, promocode, callback) {
            // На всякий случай проверим дату
            var nowdate = new Date();
            // enddate.setDate(enddate.getDate()+ 10);
            if (promocode.enddate >= nowdate) {
                callback(null, formdata, promocode);
            } else {
                callback(new HttpError(403, 'Срок промокода уже вышел'))
            }
        },
        function(formdata, promocode, callback){
            // Необходимо проверить пользователя, чтобы один и тот же пользователь не активировал сразу миллион промокодов
            // но это в следующий раз

            callback(null, formdata, promocode);
        },
        function(formdata, promocode, callback){
            // Если мы до сюда дошли - значит с промокодм все хорошо
            // Деактивируем этот промокод
            var activateddate = new Date();
            var userid = req.session.user;
            var conditions = { _id: promocode._id }
                , update = { active : "false",
                    userid: userid,
                    activatedDate: activateddate}
                , options = {};


            // Обновляем объект в БД
            Promocode.update(conditions, update, options, function() {
                callback(null, formdata, promocode);
            });
        },
        function(formdata, promocode, callback){
            // Получим пользователя
            User.findById(req.session.user, function(err, currentuser){
                callback(null,formdata, promocode, currentuser)
            });
        },
        function(formdata, promocode, currentuser, callback){
            // Пора накинуть пользователю бабла
            var userid = req.session.user;
            var balance = currentuser.balance;
            console.log('Был баланс ' + balance);
            balance = parseInt(balance) + parseInt(promocode.sum);
            console.log('Стал баланс ' + balance);
            var conditions = { _id: userid }
                , update = { balance : balance}
                , options = {};


            // Обновляем объект в БД
            User.update(conditions, update, options, function() {
                callback(null, formdata, promocode);
            });
        },
        function(formdata, promocode, callback){
            // Обязательно сделать запись в журнал
            callback(null, formdata, promocode);
        }
    ], function (err, formdata, promocode) {
        if (err) {
            req.session.message = err.message;
            console.log('Ошибочка вышла');
            console.log(util.inspect(err));
        } else { req.session.message = 'Промокод успешно активирован';}
        res.redirect('/deposite');
    });
};