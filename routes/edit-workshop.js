var postdata = require('postdata');
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
exports.post = function(req, res) {
    async.waterfall([
        function(callback) {
// Обрабатываем ПОСТ запрос
            postdata(req, res, function (err, data) {
                if (err) {
                    console.log(err);
                    callback(err)
                } else {
                    switch (data['action']) {
                        case 'update-auto':
                            var workshopId = req.session.workshop;
                            console.log(workshopId);
                            console.log(data['update']);
                            var options = {upsert: false};
                            var conditions = {_id: workshopId};
                            if (data['update'] == 'true'){
                                console.log('da');
                                var update = {autoUpdate: true};
                            }else {
                                console.log('net');
                                var update = {autoUpdate: false};
                            }
                            // Обновляем объект в БД
                            Workshop.update(conditions, update, options, callback);
                            break;
                        default:
                            callback(err);
                    }


                }
            });
        }
    ],function (err) {
        if (err){
            res.send('Произошла ошибка');
        }else{
            res.send('Успешно завершено!');
        }

    })
};