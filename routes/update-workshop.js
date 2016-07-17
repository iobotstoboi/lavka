var User = require('../models/user').User;
var Workshop = require('../models/workshop').Workshop;
var Alias = require('../models/alias').Alias;
var multiparty = require('multiparty');
var HttpError = require('../error').HttpError;
var AuthError = require('../models/user').AuthError;
var async = require('async');
var fs = require('fs');
var path = require("path");
var util = require('util');
var randtoken = require('rand-token');

// Обрабатываем ПОСТ запрос
exports.post = function(req, res, next) {

    // Запишем данные с формы в массив
    var form = new multiparty.Form();
    var formdata ={};
    form.on('field', function(name,value) {
        formdata[name] = value;
        // console.log('Поле ' + name + " : " + value);
    });


    // Обработаем ошибку
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
        var tmp_path = file.path
        var token = randtoken.generate(16);
        newfilename = token + fileName.replace(/([^a-z0-9.]+)/gi, '-');
        var target_path = path.normalize(__dirname + "/../public/uploads/workshops/") + newfilename;
        fs.rename(tmp_path, target_path, function() { /* ... */  })
        // res.redirect('../uploads/' + fileName);
        formdata['filepath'] = '../uploads/workshops/' + newfilename;
        console.log(target_path);
    });



    // Обрабатываем запрос
    form.parse(req, function(err, fields, files) {

        Object.keys(fields).forEach(function(name) {
            //console.log('got field named ' + name);
        });

        // Определим id мастерской
        // var userAccountId = req.session.user;
        var workshopId = req.session.workshop;
        console.log('Редактируем мастерскую с ид ' + workshopId);
        console.log(util.inspect(req.session));
        // Подготовим данные для перезаписи обекта в бд
        var options = {};
        var conditions = { _id: workshopId };
        var update = { name: formdata['workshopNameInput'],
            description: formdata['workshopDescriptiotInput'],
            adres: formdata['workshopAdressInput'],
            phone: formdata['workshopPhoneInput']
        };
        //Проверка alias
        async.waterfall([
            function(callback){
                console.log(req.params.id);
                Workshop.findOne({alias:formdata['workshopAliasInput']},callback);
            },
            function(work, callback){
                if (!work) {
                    console.log('asdsad');
                    // Создать алиас
                    update.alias = formdata['workshopAliasInput'];
                    var optionsAlias = {upsert: true};
                    var conditionsAlias = {resourceId: workshopId};
                    var updateAlias = {
                        resourceId: workshopId,
                        resourceType: 'workshop',
                        resourceAlias: formdata['workshopAliasInput'],
                        resourceUrl: '/workshops/' + formdata['workshopAliasInput']
                    };
                    // Обновляем объект в БД
                    Alias.update(conditionsAlias, updateAlias, optionsAlias, callback);
                }else{
                    callback();
                }
            },
            function(){
                // Обновляем объект в БД
                Workshop.update(conditions, update, options, function() {
                    res.redirect('workshop-private');
                });
            }
        ]);
    });

};