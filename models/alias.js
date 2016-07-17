var async = require('async');
var util = require('util');

var mongoose = require('../lib/mongoose'),
    Schema = mongoose.Schema;

var aliasSchema = new Schema({
    resourceId: {type: String},
    resourceType: {type: String},
    resourceAlias: {type: String},
    resourceUrl: {type: String}
});

aliasSchema.statics.createNewAlias = function(resourceId, resourceType, resourceAlias, resourceUrl, callback) {
    var Alias = this;
            var alias = Alias.findOne({resourceId: resourceId}, callback); // Проверим наличие Alias
            console.log('Начало');
            if (alias) {
                console.log('Молодец');
                var options = {upsert: true};
                var conditions = {resourceId: resourceId};
                var update = {
                    resourceAlias: resourceAlias,
                    resourceUrl: resourceUrl
                };
                // Обновляем объект в БД
                Alias.update(conditions, update, options, function (err) {
                    console.log(util.inspect(err))});
                callback();
            } else {
                console.log('Ошибка');
                var alias = new Alias({
                    resourceId: resourceId,
                    resourceType: resourceType,
                    resourceAlias: resourceAlias,
                    resourceUrl: resourceUrl
                });

                alias.save(function (err) {
                    console.log(util.inspect(err));
                    callback();
                });
            }
};






exports.Alias = mongoose.model('Alias', aliasSchema);
