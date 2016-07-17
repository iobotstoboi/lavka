var async = require('async');
var util = require('util');

var mongoose = require('../lib/mongoose'),
    Schema = mongoose.Schema;

var categorySchema = new Schema({
    name: {
        type: String,
        unique: true,
        required: true
    },
    fullname: {
        type: String
    },
    description: {
        type: String
    },
    _parentId: Schema.Types.ObjectId,
    sortIndex: String,
    created: {
        type: Date,
        default: Date.now
    },
    alias: String,
    url: String
});

// Метод для нахождения родительской категории
categorySchema.methods.getParent = function getParent (callback) {
    return this.model('categories').findById(this._parentId, function (err, doc){
        callback(doc);
    });
};

// Метод для нахождения дочерних категорий
categorySchema.methods.getChilds = function getChilds (callback) {
    return this.model('categories').find({ _parentId: this._id }, function(err,doc) {
        callback(doc);
    });
};

categorySchema.statics.getMainCategories = function(callback) {
    var Category=this;
    Category.find({ '_parentId': undefined }, function (err, docs) {
        callback(docs);
    });

};

categorySchema.statics.getCatalogueTree = function(callback) {
    var Category=this;
    Category.find({ '_parentId': undefined }, function (err, docs) {

        var catatree =[];

        //This is your async worker function
        //It takes the item first and the callback second
        function addSubCuts(celem, callback) {

            //There's no true asynchronous code here, so use process.nextTick
            //to prove we've really got it right
            process.nextTick(function () {

                // Получим дочерние элементы
                Category.find({'_parentId':celem._id}, function(err,subdocs) {
                    // Теперь мы имеем подэлементы
                    var toadd={}
                    toadd.self = celem;
                    toadd.childs = subdocs;
                    // celem.childs=subdocs;
                    // console.log(util.inspect(toadd));
                    catatree.push(toadd);
                    // console.log(util.inspect(catatree));
                    // console.log('---------------------------');

                    //the callback's first argument is an error, which must be null
                    //for success, then the value you want to yield as a result
                    callback(null, toadd);
                });


            });
        }

        //The done function must take an error first
        // and the results array second
        function done(error, result) {
                //console.log("map completed. Error: ", error, " result: ", util.inspect(result));
                callback(result);
            }

        async.map(docs, addSubCuts, done);
    });

};

exports.Category = mongoose.model('categories', categorySchema);
