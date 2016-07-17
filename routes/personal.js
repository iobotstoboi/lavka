var Category = require('../models/category').Category;
var Product = require('../models/product').Product;
var User = require('../models/user').User;
var Workshop = require('../models/workshop').Workshop;
var async = require('async');

exports.get = function(req, res) {
    Category.getCatalogueTree(function(catalogueTree){
        Workshop.getWorkshopByUser(req.session.user, function(wsh) {
            //console.log(wsh['name']);
            
            User.find({'_id': req.session.user}, function(err, user) {
            	var favFinal = [];
            	console.log(user[0].favourite);
            	async.map(user[0].favourite, getFavProducts, function (e, r) {
            		console.log('FINISH');
  					console.log(r);
  					res.render('personal', {datka:catalogueTree, path: req.path, workshop: wsh, favourite: r});
				});
				function getFavProducts(fav, callback) {
				 	process.nextTick(function () {
				 		console.log('Tick')
				 		console.log(fav.productId);
				 		Product.find({'_id': fav.productId}, function(err, product) {
				 			//console.log(product);
				 			var toadd = {};
				 			toadd = product[0];
				 			favFinal.push(toadd);
				 			callback(null, favFinal);
				 		})
				 	});
				}
            });
            
        });
    });
};
