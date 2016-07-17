var Product = require('../models/product').Product;
var User = require('../models/user').User;
var postdata = require('postdata');
exports.post = function(req, res) {
	postdata(req, res, function (err, data) {
		console.log('FAV');
		console.log(data);
		if (data.operation == "delete") {
			console.log('delete');
			User.find({'_id': data.user}, function(err, user) {
				console.log(user[0].favourite.length);
				for (var i = 0; i < user[0].favourite.length; i++) {
					console.log(i);
					if (user[0].favourite[i].productId == data.product) {
						console.log(''+ user[0].favourite[i].productId + ' ' + data.product)
						var removed = user[0].favourite.splice(i);
						console.log('REMOVED');
						console.log(removed);
					}
				}
				console.log(user[0].favourite)
				User.update({'_id': data.user}, {favourite:  user[0].favourite}, {multi: true}, function(err, num) {
					if (err) {
						console.log(err);
					} else {
						console.log(num);
						res.send({});
					}
				})
			});
		} else {
			User.find({'_id': data.user}, function(err, user) {
				console.log(typeof user[0].favourite);
				console.log(typeof user[0].favourite);
				if (user[0].favourite == undefined) {
					var favourite = {
						favourite: [{
							userId:  data.user,
							productId: data.product
						}]
					}
					User.update({'_id': data.user}, favourite, {multi: true}, function(err, num) {
						if (err) {
							console.log(err);
						} else {
							console.log(num);
							res.send({});
						}
					})
				} else {
					var favourite = {
							userId:  data.user,
							productId: data.product
						}
					var updatedFav = user[0].favourite;
					updatedFav.push(favourite);
					updatedFav = {favourite: updatedFav};
					console.log('UPDATE')
					console.log(updatedFav);
					console.log(data.user); 
					User.update({'_id': data.user}, updatedFav, {multi: true}, function(err, num) {
						if (err) {
							console.log(err);
						} else {
							console.log(num);
							res.send({});
						}
					})
				}
				
			});
		}
	});
	
}