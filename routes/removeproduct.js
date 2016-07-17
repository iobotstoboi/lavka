var multiparty = require('multiparty');
var Product = require('../models/product').Product;
var util = require('util');
var mongoose = require('../lib/mongoose');
var Alias = require('../models/alias').Alias;
exports.post = function(req, res, next) {
    console.log('Удаляем товар');
    // Получим данные формы
    var form = new multiparty.Form();
    var formdata ={};
    form.on('field', function(name,value) {
        formdata[name] = value;
        console.log('Поле ' + name + " : " + value);
    });

    form.on('error', function(err) {
        console.log('Error parsing form: ' + err.stack);
    });

    form.parse(req, function(err,fields, files) {

        console.log("Мультипарти парсер начался");
        Object.keys(fields).forEach(function(name) {
            //console.log('got field named ' + name);
        });

        // Наш пользователь
        var userAccountId = req.session.user;
        var workshopId = req.session.workshop;
        console.log('Ищем товар ' + formdata['_id']);
        Product.findById(mongoose.Types.ObjectId(formdata['_id']), function(err, product){
            console.log(util.inspect(product));
            console.log('Пользователь ' + userAccountId + ' пытается удалить');
            console.log('Товар пользователя ' + product._userId);
            if (product._userId == userAccountId) {
                Product.remove({"_id": formdata['_id']}, function(err) {
                    console.log('Мы удалили товар');
                    Alias.remove({resourceId: mongoose.Types.ObjectId(formdata['_id']), resourceType: 'product'}, function(err){
                        console.log('Мы удалили псевдоним');
                        res.redirect('/workshop-private');
                    });
                });

            } else {
                // У пользователя нет права удалять этот товар
                res.redirect('/workshop-private');
            }
        });
    });
};