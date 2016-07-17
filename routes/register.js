var User = require('../models/user').User;
var multiparty = require('multiparty');
var HttpError = require('../error').HttpError;
var AuthError = require('../models/user').AuthError;
var util = require('util');
var async = require('async');
var Category = require('../models/category').Category;
var PricePlan = require('../models/priceplan').PricePlan
var VK = require('vksdk');
// Обрабатываем GET запрос - загрузка страницы авторизации
exports.get = function(req, res) {
    async.waterfall([
        function(callback){ //Получим список тарифов
            PricePlan.getFreePlan(function(pricePlan) {
                console.log('Получили базовый тариф');
                console.log(util.inspect(pricePlan));
                callback(null, pricePlan);
            });
        },
        function(pricePlan, callback){ // получим дерево каталога
            Category.getCatalogueTree(function(catalogueTree){
                callback(null, pricePlan, catalogueTree );
            });
        }
    ], function (err, pricePlan, catalogueTree) {
        // result now equals 'done'
        res.render('register', { datka : catalogueTree, path : req.path, priceplan : pricePlan });
    });
};

// Обрабатываем ПОСТ запрос
exports.post = function(req, res, next) {

    // Получим данные формы
    var form2 = new multiparty.Form();
    var formdata ={};
    form2.on('field', function(name,value) {
        formdata[name] = value;
        // console.log('Поле ' + name + " : " + value);
    })



    form2.parse(req, function(err, fields, files) {

        Object.keys(fields).forEach(function(name) {
            //console.log('got field named ' + name);
        });

        var username = formdata['emailInput']; //req.body.username;
        var password = formdata['passwordInput']; //req.body.username;
        var firstName = formdata['firstNameInput']; //req.body.username;
        var secondName = formdata['secondNameInput']; //req.body.username;
        var birthDate = Date.parse(formdata['birthDateInput']); //req.body.username;
        var subscirbe = formdata['subscribeInput']; //req.body.username;

        if (isNaN(birthDate)) {birthDate = undefined}
        User.createNew(username, password, firstName, secondName, birthDate, subscirbe , function(err,user) {
            if (err) {
                if (err instanceof AuthError) {
                    return next(new HttpError(403, err.message));
                } else {
                    return next(err);
                }
            }

            req.session.user = user._id;
            req.session.authenticated  = true;
            //res.send({});
            //res.render('login');
            res.redirect('/personal')
        })
    });

};