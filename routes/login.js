var User = require('../models/user').User;
var multiparty = require('multiparty');
var HttpError = require('../error').HttpError;
var AuthError = require('../models/user').AuthError;
var async = require('async');
var util = require('util');
var Category = require('../models/category').Category;

// Обрабатываем GET запрос - загрузка страницы авторизации
exports.get = function(req, res) {
    res.render('login', {datka:docs, path: req.path});
};

// Обрабатываем ПОСТ запрос
exports.post = function(req, res, next) {

    // Получим данные формы
    var form = new multiparty.Form();
    var formdata ={};
    form.on('field', function(name,value) {
        formdata[name] = value;
    });

    form.parse(req, function() {

        console.log('Обработали форму ' + util.inspect(formdata));
        var username = formdata['loginInputEmail']; //req.body.username;
        var password = formdata['loginInputPassword']; //req.body.password;
        console.log('Запрос на авторизацию: ' + username + ' ' + password);

        User.authorize(username, password, "emailauth", function(err, user) {
            if (err) {
                if (err instanceof AuthError) {
                    //return next(new HttpError(403, err.message));
                    console.log('Ошибка получается ' + err.message);
                    req.session.message = "Ошибка авторизации";
                    //res.send({});
                    //res.render('login');
                    res.redirect('/')
                } else {
                    return next(err);
                }
            } else {
                req.session.user = user._id;
                req.session.authenticated  = true;
                req.session.message = " Вы авторизовались";
                console.log('\n_______________________$$$$$$\n______________________$$$$$$\n______________________$$$$\n______________________$$\n_________$$$$$$$$$$$$$_$$$$$$$$$$$$$\n______$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$\n____$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$\n___$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$\n__$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$\n_$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$\n_$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$\n_$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$\n_$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$\n__$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$\n___$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$\n____$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$\n_____$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$\n______$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$\n________$$$$$$$$$$$$$$$$$$$$$$$$$$$$$\n__________$$$$$$$$$$$$$$$$$$$$$$$$$\n____________$$$$$$$$$$$$$$$$$$$$$\n______________$$$$$$$$__$$$$$$$\n')
                //res.send({});
                //res.render('login');
                res.redirect('/')
            }
        });
    });
};