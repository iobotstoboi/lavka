var User = require('../models/user').User;
var multiparty = require('multiparty');
var Category = require('../models/category').Category;
var HttpError = require('../error').HttpError;
var AuthError = require('../models/user').AuthError;
var async = require('async');
var Workshop = require('../models/workshop').Workshop;


// Обрабатываем ПОСТ запрос
// ДОБАВЛЕНИЕ НОВОЙ МАСТЕРСКОЙ по существующему аккаунту
exports.post = function(req, res, next) {

    // Получим данные формы
    var form3 = new multiparty.Form();
    var formdata3 ={};
    form3.on('field', function(name,value) {
        formdata3[name] = value;
        // console.log('Поле ' + name + " : " + value);
    });

    form3.parse(req, function(err,fields, files) {
        // Наш пользователь
        var userAccountId = req.session.user;
        // Данные с формы
        var workshopName = formdata3['workshopNameInput']; //req.body.username;
        var descritpion = formdata3['workshopDescriptiotInput']; //req.body.username;
        var adres = formdata3['workshopAdressInput']; //req.body.username;
        var phone = formdata3['workshopPhoneInput']; //req.body.username;

        Workshop.createNewWorkshop(userAccountId, workshopName, descritpion, adres, phone, function(err,workshop) {

            req.session.workshop = workshop._id;
            //req.session.authenticated  = true;
            //res.send({});
            //res.render('login');
            res.redirect('/personal')
        })

    });




};