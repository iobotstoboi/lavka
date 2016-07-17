var Category = require('../models/category').Category;
var User = require('../models/user').User;
var Token = require('../models/tokens').Token;
var multiparty = require('multiparty');
var HttpError = require('../error').HttpError;
var AuthError = require('../models/user').AuthError;
var async = require('async');
var util = require('util');
var randtoken = require('rand-token');
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
    host: 'smtp.lavka.club',
    port: '25',
    secure:false,
    //secureConnection: true,
    tls: {rejectUnauthorized: false},
    auth: {
        user: 'info@lavka.club',
        pass: 'appleby2'
    }
});


exports.post = function(req, res) {



    async.waterfall([
        function(callback){ //Получим дерево каталога
            Category.getCatalogueTree(function(catalogueTree){
                callback(null, catalogueTree);
            });
        },
        function(catalogueTree, callback) {

            console.log('Начали поехали');
            // Получим данные формы
            var form = new multiparty.Form();
            var formdata ={};
            form.on('field', function(name,value) {
                console.log(name + ' : ' + value);
                formdata[name] = value;
            });

            form.parse(req, function(err,fields, files) {

                if (formdata['email']) {
                    User.findOne({username:formdata['email']}, function(err, user){
                        if (user) {
                            //Пользователь найден - отправляем письмо с токеном
                            // Делаем токен
                            var token= randtoken.generate(32);
                            // Делаем ссылку
                            var linkToken = 'http://lavka.club/reset'+ token;

                            // Запишем пару email-token в базу данных, чтобы затем сверить
                            Token.createToken('email', user.username, token, function(err){

                                if (err) {console.log('Ошибка сохранения токена')};

                                transporter.sendMail({
                                    from: 'info@lavka.club',
                                    to: user.username,
                                    subject: 'Восстановление пароля на сайте lavka.club',
                                    text: 'Перейдите по ссылке для изменения пароля ' + linkToken
                                }, function(err){
                                    if (err) {
                                        console.log(err);
                                        callback(err);
                                    } else {
                                        callback(null, catalogueTree);
                                    }
                                });

                            });

                        } else {
                            callback(new HttpError('Пользователь с таким email не зарегистрирован'));
                        }
                    })
                } else {
                    console.log('Не было email в форме');
                    callback(new HttpError('Не было email в форме'))
                }
            });

        }

    ], function (err, catalogueTree, currentArticle ) {
        if (err) {
            req.session.message = err.message;
        } else {
            req.session.message = "Сообщение со ссылкой для изменения пароля отправлено на ваш email";
        }

        res.redirect('/')
    });
};