var async = require('async');
var util = require('util');
var Product = require('../models/product').Product;

var mongoose = require('../lib/mongoose'),
    Schema = mongoose.Schema;

var serviceproductSchema = new Schema({
    productid: Schema.Types.ObjectId,
    type: {        type: String    },
    created: {
        type: Date,
        default: Date.now
    },
    enddate: {        type: Date    }
});

serviceproductSchema.statics.createNew = function(product, type, enddate, callback) {
    var ServiceProduct = this;

    async.waterfall([
        function(callback) {
            ServiceProduct.findOne({productid: product, type:type}, function(err, serviceproduct){
                callback(null, serviceproduct);
            });
        },
        function(serviceproduct, callback) {
            if (serviceproduct) {
                // Если такая услуга уже применена к товару - значит надо вывести уведомления для пользователя
                callback();
            } else {
                // Еслу услуга еще не применена - применяем
                var serviceproduct = new ServiceProduct({   productid: product,
                    type: type, //userFields['passwordInput'],
                    enddate: enddate
                });
                serviceproduct.save(function(err) {
                    if (err) return callback(err);
                    callback(null, serviceproduct);
                });
            }
        }
    ], callback);
};

serviceproductSchema.statics.findSuperProducts = function(callback) {
    var ServiceProduct = this;
    var now = new Date();
    console.log(now);
    //ServiceProduct.find({type:'super','$where': 'new Date(this.enddate.toJSON().slice(0, 10)) >= new Date()'}, function(err, serviceproducts){
    ServiceProduct.find({type:'super'}, function(err, serviceproducts){


        if (serviceproducts) {
            var superproducts = [];

            //This is your async worker function
            //It takes the item first and the callback second
            function getProductObject(serviceproduct, callback) {

                //There's no true asynchronous code here, so use process.nextTick
                //to prove we've really got it right
                process.nextTick(function () {

                    // Получим дочерние элементы
                    Product.findById(serviceproduct.productid, function (err, product) {
                        // Теперь мы имеем подэлементы
                        if (product) {
                            superproducts.push(product);
                        }
                        //the callback's first argument is an error, which must be null
                        //for success, then the value you want to yield as a result
                        callback(null, product);
                    });


                });
            }

            //The done function must take an error first
            // and the results array second
            function done(error, result) {
                //console.log("map completed. Error: ", error, " result: ", util.inspect(superproducts));
                callback(superproducts);
            }

            async.map(serviceproducts, getProductObject, done);
        } else {callback(null);}
    })
};

serviceproductSchema.statics.findBestProducts = function(callback) {
    var ServiceProduct = this;
    ServiceProduct.find({type:'best'}, function(err, serviceproducts){

        var bestproducts =[];

        //This is your async worker function
        //It takes the item first and the callback second
        function getProductObject(serviceproduct, callback) {

            //There's no true asynchronous code here, so use process.nextTick
            //to prove we've really got it right
            process.nextTick(function () {

                // Получим дочерние элементы
                Product.findById(serviceproduct.productid, function(err,product) {
                    // Теперь мы имеем подэлементы

                    bestproducts.push(product);
                    //the callback's first argument is an error, which must be null
                    //for success, then the value you want to yield as a result
                    callback(null, product);
                });


            });
        }

        //The done function must take an error first
        // and the results array second
        function done(error, result) {
            //console.log("map completed. Error: ", error, " result: ", util.inspect(bestproducts));
            callback(bestproducts);
        }

        async.map(serviceproducts, getProductObject, done);
    })
}
serviceproductSchema.statics.findHighProducts = function(callback) {
    var ServiceProduct = this;
    ServiceProduct.find({type:'highlight'}, function(err, serviceproducts){

        var highlightedproducts =[];

        //This is your async worker function
        //It takes the item first and the callback second
        function getProductObject(serviceproduct, callback) {

            //There's no true asynchronous code here, so use process.nextTick
            //to prove we've really got it right
            process.nextTick(function () {

                // Получим дочерние элементы
                Product.findById(serviceproduct.productid, function(err,product) {
                    // Теперь мы имеем подэлементы

                    highlightedproducts.push(product);
                    //the callback's first argument is an error, which must be null
                    //for success, then the value you want to yield as a result
                    callback(null, product);
                });


            });
        }

        //The done function must take an error first
        // and the results array second
        function done(error, result) {
            //console.log("map completed. Error: ", error, " result: ", util.inspect(bestproducts));
            callback(highlightedproducts);
        }

        async.map(serviceproducts, getProductObject, done);
    })
}

exports.ServiceProduct = mongoose.model('serviceproducts', serviceproductSchema);
