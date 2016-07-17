var User = require('../models/user').User;
var multiparty = require('multiparty');
var HttpError = require('../error').HttpError;
var AuthError = require('../models/user').AuthError;
var async = require('async');
var fs = require('fs');
var path = require("path");
var randtoken = require('rand-token');

// Обрабатываем ПОСТ запрос
exports.post = function(req, res, next) {

    // Получим данные формы
    var form = new multiparty.Form();
    var formdata ={};
    form.on('field', function(name,value) {
        formdata[name] = value;
        // console.log('Поле ' + name + " : " + value);
    })


    form.on('error', function(err) {
        console.log('Error parsing form: ' + err.stack);
    });

    // Обрабатываем файл
    var size = '';
    var fileName = '';
    form.on('part', function(part){
        if(!part.filename) return;
        size = part.byteCount;
        fileName = part.filename;
    });


    form.on('file', function(name,file){
        console.log(file.path);
        console.log(__dirname);
        console.log('filename: ' + fileName);
        console.log('fileSize: '+ (size / 1024));
        var tmp_path = file.path;
        var token = randtoken.generate(16);
        newfilename = token + fileName.replace(/([^a-z0-9.]+)/gi, '-');
        var target_path = path.normalize(__dirname + "/../public/uploads/avatars/") + newfilename;
        fs.rename(tmp_path, target_path, function() { /* ... */  })
        // res.redirect('../uploads/' + fileName);
        formdata['filepath'] = '../uploads/avatars/' + newfilename;
        console.log(target_path);
    });

    form.parse(req, function(err, fields, files) {

        Object.keys(fields).forEach(function(name) {
            //console.log('got field named ' + name);
        });

        var userAccountId = req.session.user;

        var username = formdata['emailInput']; //req.body.username;
        var password = formdata['passwordInput']; //req.body.username;
        var firstName = formdata['firstNameInput']; //req.body.username;
        var secondName = formdata['secondNameInput']; //req.body.username;
        var birthDate = formdata['birthDateInput']; //req.body.username;
        var subscirbe = formdata['subscribeInput']; //req.body.username;

        var update={};
        if (formdata['emailInput']) {update.username = formdata['emailInput']}
        if (formdata['passwordInput']) {update.password = formdata['passwordInput']}
        if (formdata['firstNameInput']) {update.firstName = formdata['firstNameInput']}
        if (formdata['secondNameInput']) {update.secondName = formdata['secondNameInput']}
        if (formdata['birthDateInput']) {update.birthDate = formdata['birthDateInput']}
        if (formdata['subscribeInput']) {update.subscirbe = formdata['subscribeInput']}

        var conditions = { _id: userAccountId }
            /*, update = { username: formdata['emailInput'],
                         password: formdata['passwordInput'],
                         firstName: formdata['firstNameInput'],
                         secondName: formdata['secondNameInput'],
                         birthDate: formdata['birthDateInput'],
                         subscribe: formdata['subscribeInput'],
                         avatar: formdata['filepath']}*/
            , options = {};


        User.update(conditions, update, options, function() {
            res.redirect('/personal');
        });

    });

};