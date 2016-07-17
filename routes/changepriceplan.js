var Category = require('../models/category').Category;
var User = require('../models/user').User;
var Workshop = require('../models/workshop').Workshop;
var Product = require('../models/product').Product;
var HttpError = require('../error').HttpError;
var async = require('async');
var multiparty = require('multiparty');
var AuthError = require('../models/user').AuthError;
var util = require('util');
var PricePlan = require('../models/priceplan').PricePlan;


exports.post = function(req,res) {

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

        Object.keys(fields).forEach(function(name) {
            //console.log('got field named ' + name);
        });



        if (req.session.user && req.session.workshop) {
            // Есть и сессия и мастерская
            // Наш пользователь
            var userAccountId = req.session.user;
            var workshopId = req.session.workshop;
            // в запросе id тарифа на котрый необходимо изменить тарифный план мастерской
            // затем надо получить объект тарифного плана
            // затем надо получить баланс пользователя
            // затем надо проверить хватит ли средств пользователя для изменения тарифа
            // затем необходимо снять со счета пользователя стоимость тарифного плана
            // затем надо изменить тарифный план в профиле мастерской
            // и перезагрузить страницу личного кабинета мастерской


            async.waterfall([
                function(callback){
                    PricePlan.getPricePlanObject(formdata['changePricePlanIdInput'], function(priceplan){
                        callback(null, priceplan);
                    })
                },
                function(priceplan,callback){
                    console.log('Изменение тарифного плана. Ищем юзера по айди ' + req.session.user);
                    User.findById(req.session.user, function(err, user){
                        console.log('Изменение тарифного плана. Найден юзер ' + util.inspect(user) );
                        console.log('Стоимость тарифа ' + priceplan.price);
                        if (parseInt(priceplan.price) < parseInt(user.balance)) {
                            callback(null, priceplan, user)
                        } else {
                            // Не хватает средств у пользователя для оплаты тарифа - кидай ошибку
                        }
                    });
                },
                function(priceplan, user,callback) {
                    var newbalance = user.balance-priceplan.price;
                    var conditions = { _id: user._id }
                        , update = { balance: newbalance}
                        , options = { multi: false };

                    User.update(conditions, update, options, function(err, numAffected) {
                        // numAffected is the number of updated documents
                        if (err) {
                            console.log(util.inspect(err));
                        } else {
                            console.log('Изменен баланс пользователя' + numAffected);
                            callback(null, priceplan);
                        }
                    });

                },
                function(priceplan, callback){
                    var pricePlanEndDate = new Date();
                    var pricePlanStartDate = new Date();
                    var planLimit = priceplan.limitation;
                    pricePlanEndDate.setDate(pricePlanEndDate.getDate()+ planLimit);
                    var conditions = { _id: req.session.workshop }
                        , update = { priceplan: formdata['changePricePlanIdInput'], pricePlanEndDate: pricePlanEndDate, pricePlanStartDate: pricePlanStartDate }
                        , options = { multi: false };
                    Workshop.update(conditions, update, options, function(err, numAffected) {
                        // numAffected is the number of updated documents
                        if (err) {
                            console.log(util.inspect(err));
                        } else {
                            console.log('Изменен баланс пользователя' + numAffected);
                            callback(null);
                        }
                    });
                }
            ],function(err) {
                console.log('Поменяли тарифный план')
            })

        } else {
            // в сессии нет пользователя или мастерской
            // проверить чего не хватает и обработать ошибку
        }




        console.log('В сессии записан воркшоп ' + req.session.workshop)
        // Данные с формы
        formdata['user'] = userAccountId;
        formdata['workshop'] = workshopId;

        console.log('МАссив данных для создания товара выглядит так');
        console.log(util.inspect(formdata));

        var conditions = { _id: formdata['_id'] }
            , update = { name: formdata['namename'],
                _categoryId: formdata['category'],
                introText: formdata['introText'],
                description: formdata['description'],
                price: formdata['price'],
                previewImg: formdata['image']}
            , options = {};


        // Обновляем объект в БД
        Product.update(conditions, update, options, function() {
            res.redirect('/workshop-private');
        });


    });



}
