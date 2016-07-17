var Category = require('../models/category').Category;
var Token = require('../models/tokens').Token;
var User = require('../models/user').User;
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
        function(callback) {
            console.log('Начали поехали');
            // Получим данные формы
            var form = new multiparty.Form();
            var formdata ={};
            form.on('field', function(name,value) {
                console.log(name + ' : ' + value);
                formdata[name] = value;
            });

            form.parse(req, function(err,fields, files) {

                if ((formdata['token']) && (formdata['password'] == formdata['confirmpassword'])) {

                    // Сверим данные токена
                    Token.findOne({token:formdata['token']}, function(err, token){
                        if (err) {
                            // Нет такого токена - ошибка.
                            conasole.log('Токен не найден ' + formdata['token']);
                            callback(new HttpError('Ошибка. Токен не найден. Попробуйте еще'));
                        } else {
                            // сравним данные с формы и токена из базы
                            if (token.data === formdata['email']) {
                                // Все отлично. Токен совпал идем дальше менять пароль
                                console.log('Все нашлось, идем дальше');
                                callback(null, formdata);
                            } else {
                                console.log(token.data + ' не совпал с ' + formdata['email']);
                                callback(new HttpError('Ошибка. Токен не тот. Попробуйте еще'));
                            }
                        }
                    });
                } else {
                    console.log('Или токена нет или парол не совпали');
                    callback(new HttpError('НЕ найден токен или пароли не совпали'))
                }
            });
        },
        function(formdata, callback){
            // Меняем пароль у пользователя
            User.findOne({username: formdata['email']}, function(err, user){
                if (err) {
                    callback(new HttpError('Ошибка поиска пользователя'));
                } else {
                    if (user) {
                        // Нашли нашего юзера
                        user.password = formdata['password'];
                        user.save(function(err) {
                            if (err) {
                                console.log('Замена пароля не случилась.');
                                callback(new HttpError('Замена пароля не случилась.'));
                            } else {
                                callback(null, formdata);
                            }
                        });
                    } else {
                        // Нет такого пользователя
                        console.log('Пользователь не найден');
                        callback(new HttpError('Пользователь не найден'));
                    }
                }
            })
        },
        function(formdata, callback){
            // Удалим токен
            Token.findOne({token: formdata['token']}, function(err, token){
               token.remove(function(err){
                   callback(null);
               })
            });
        }

    ], function (err) {
        if (err) {
            req.session.message = err.message;
        } else {
            req.session.message = "Пароль изменен. Авторизуйтесь";
        }
        res.redirect('/')
    });
};


// Отдаем страницу с формой для ввода нового пароля
exports.get = function(req, res) {
    async.waterfall([
        function(callback){ //Получим дерево каталога
            Category.getCatalogueTree(function(catalogueTree){
                callback(null, catalogueTree);
            });
        },
        function(catalogueTree, callback) {
            // Найдем токен
            Token.findOne({token:req.params.token}, function(err, token){
                if (err) {
                    // Токен не найден
                    // Перенаправляем на главную просто
                    callback(new HttpError("Возникла ошибка. Попробуйте снова"));
                } else {
                    // Все пучком нашли токен
                    callback(null, catalogueTree, token);
                }
            })
        }

    ], function (err, catalogueTree, token ) {
        if (err) {
            req.session.message = err.message;
            res.redirect('/');
        } else {
            res.render('enternewpass', {
                datka:catalogueTree,
                path: req.path,
                token:token
            });
        }
    });
};