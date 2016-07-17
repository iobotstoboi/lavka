var Category = require('../models/category').Category;
var ServiceProduct = require('../models/serviceproduct').ServiceProduct;
var Product = require('../models/product').Product;
var util = require('util');
var async = require('async');
var Workshop = require('../models/workshop').Workshop;
var postdata = require('postdata');

exports.get = function(req, res) {
    async.waterfall([
        function(callback){ //Получим дерево каталога
            Category.getCatalogueTree(function(catalogueTree){
                callback(null, catalogueTree);
            });
        }
    ], function (err, catalogueTree ) {
        res.render('cart', {
            datka:catalogueTree,
            path: req.path,
            cart: req.session.cart
        });
    });
};
exports.post = function(req, res) {
    postdata(req, res, function (err, data) {
        console.log(data);
        if (data.operation == "delete") {
            var cart = req.session.cart;
            console.log(cart);
            for (var i = 0; i < cart.length; i++) {
                    console.log(i);
                    if (cart[i]._id == data.product) {
                        var removed = cart.splice(i);
                        console.log('REMOVED');
                        console.log(removed);
                    }
                }
            console.log(cart);
            res.send({});
        }
        else if (data.operation == "clear") {
            console.log('clear')
            req.session.cart = null;
            res.send();
        } else {
            function contains(a, obj) {
                for (var i = 0; i < a.length; i++) {
                    console.log('orig', a[i]._id);
                    console.log('equlibrium', obj._idj);
                    if (a[i]._id == obj._id) {
                        return true;
                    }
                }
                return false;
            }
            req.session.cart = req.session.cart || [];
            var cart = req.session.cart;
            Product.find({"_id": data.product}, function(err, products) {
                console.log(cart.indexOf(products[0]))
                if (contains(cart, products[0])) {
                    console.log('Already there!');
                    res.send({message: "Товар уже в вашей корзине"});
                } else {
                    cart.push(products[0]);
                    console.log(cart);
                    res.send({message: "Товар добавлен в корзину"});
                }
                
            });
        }
    })
};