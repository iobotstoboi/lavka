var User = require('../models/user').User;
var multiparty = require('multiparty');
var HttpError = require('../error').HttpError;
var AuthError = require('../models/user').AuthError;
var async = require('async');
var Workshop = require('../models/workshop').Workshop;
var util = require('util');

// Обрабатываем ПОСТ запрос
exports.post = function(req, res, next) {


    // НАША ЗАДАЧА ЗАРЕГИСТРИРОВАТЬ НОВГО ПОЛЬЗОВАТЕЛЯ И ПРИКРЕПИТЬ К НЕМУ МАСТЕРСКУЮ

    // Получим данные формы
    var form = new multiparty.Form();
    var formdata ={};
    form.on('field', function(name,value) {
        formdata[name] = value;
        // console.log('Поле ' + name + " : " + value);
    })



    form.parse(req, function(err, fields, files) {

        Object.keys(fields).forEach(function(name) {
            //console.log('got field named ' + name);
        });

        var username = formdata['emailInput']; //req.body.username;
        var password = formdata['passwordInput']; //req.body.username;
        var firstName = formdata['firstNameInput']; //req.body.username;
        var secondName = formdata['secondNameInput']; //req.body.username;
        var birthDate =  Date.parse(formdata['birthDateInput']); //req.body.username;
        if (isNaN(birthDate)) {birthDate = undefined}
        var subscirbe = formdata['subscribeInput']; //req.body.username;
        var workshopName = formdata['workshopNameInput']; //req.body.username;
        var descritpion = formdata['workshopDescriptiotInput']; //req.body.username;
        var adres = formdata['workshopAdressInput']; //req.body.username;
        var phone = formdata['workshopPhoneInput']; //req.body.username;

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

            // Создаем новую мастерскую
            Workshop.createNewWorkshop(user._id, workshopName, descritpion, adres, phone, function(err,workshop) {

                console.log(util.inspect(workshop));
                req.session.workshop = workshop._id;
                //req.session.workshop = user._id;
                //req.session.authenticated  = true;
                //res.send({});
                //res.render('login');
                res.redirect('/personal')
            });
        })
    });

};