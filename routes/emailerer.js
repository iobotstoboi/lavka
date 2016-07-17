var postdata = require('postdata');
var nodemailer = require('nodemailer');
var async = require('async');
var util=require('util');

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

// Обрабатываем GET запрос - загрузка страницы авторизации
exports.post = function(req, res) {
    async.waterfall([
        function(callback){ // ПОЛУЧАЕМ ДАННЫЕ С ФОРМЫ
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
        function(data,callback) {
            console.log(util.inspect(data));
            transporter.sendMail({
                from: 'info@lavka.club',
                to: data['lavkamail'],
                subject: 'Сообщение с формы обратной связи на сайте lavka.club',
                text: 'Пользователь ' + data['username'] + ' (' + data['usercontact'] + ' ' + data['usermail'] + ') отправил вам сообщение с формы обратной связи. Текст сообщения: ' + data['usercomment']
            }, function(err){
                if (err) {
                    console.log(err);
                    callback(err);
                } else {
                    callback(null);
                }
            });
        }
    ], function (err) {
        if (err) {
            req.session.message = " Произошла ошибка. Пожалуйста, попробуйте отправить письмо еще раз. " + err.message;
            res.redirect('/contacts');
        } else {
            req.session.message = " Письмо отправлено. Благодарим Вас."
            res.redirect('/contacts');
        }


    })  ;
};

