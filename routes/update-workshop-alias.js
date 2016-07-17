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
var postdata = require('postdata');

exports.post = function(req, res) {
    //console.log('начало');
    //console.log(util.inspect(req));
    //console.log('конец');
    // Вот здесь должен быть какой-то результат
    async.waterfall([
        function(callback){
            postdata(req, res, function(err, data) {
                if (err) {
                    console.log(err);
                    callback('Произошла непредвиденная ошибка');
                    return;
                } else {
                    data['alias'] = data['alias'].replace(/[^\d\w_]/g, '');
                    if (data['alias'] == ''){
                        callback('Укажите псевдоним')
                        return;
                    }
                    console.log(data); //logs an object like '{ param1: 'value1', param2: 'value2' }'
                    callback(null,data)
                }
            });
        },
        function(data, callback) {
            Workshop.findById(data['workshop'], function(err, workshop){
                if (workshop.alias){
                    callback('У вашей мастерской уже есть псевдоним');
                    return;
                }
                callback(null, data);
            });
        },
        function(data, callback) {
            Workshop.findOne({alias: data['alias']}, function(err, workshop){
                if (workshop){
                    callback('Такой псевдоним уже занят');
                    return;
                }
                callback(null, data);
            });
        },
        function (data, callback) {
            var workshopId = data['workshop'];
            var alias = data['alias'];
                    // Создать алиас
            var optionsAlias = {upsert: true};
            var conditionsAlias = {resourceId: workshopId};
            var updateAlias = {
                resourceId: workshopId,
                resourceType: 'workshop',
                resourceAlias: alias,
                resourceUrl: '/workshops/' + alias
            };
                    // Обновляем объект в БД
            Alias.update(conditionsAlias, updateAlias, optionsAlias);
            var options = {};
            var conditions = { _id: workshopId};
            var update = {
                alias: alias
            };
            Workshop.update(conditions, update, options,callback);
        }
        ], function (err) {
        if (err) {
            res.send(err);
        } else {
            res.send('success');
        }
    });
    // postdata - используется для получения данных как в $_POST, но с передачей фалов не работает
    // multyparty - можно передавать и данные и файлы в форме
}