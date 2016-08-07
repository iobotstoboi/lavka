var https = require('https');
var postdata = require('postdata');
var Product = require('../models/product').Product;
var async = require('async');
var crypto = require('crypto');

exports.get = function(req, res, next) {
	var method = req.params.method;
	//console.log(req.query.groupid[0]);
	if (method == "getgroupid") {
		console.log(req.query.grouplink);
		var options = {
		  host: 'api.vk.com',
		  path: '/method/groups.getById?group_ids='+req.query.grouplink
		};
		https.request(options, function(response) {
			var str = '';
			response.on('data', function (chunk) {
			    str += chunk;
			});
			response.on('end', function () {
				console.log(str);
				str = JSON.parse(str);
				res.send(str);
			});
		}).end();
	}
	if (method == "getalbums") {
		console.log(req.query.groupid);
		var options = {
		  host: 'api.vk.com',
		  path: '/method/photos.getAlbums?owner_id=-'+req.query.groupid+'&need_covers=1&&access_token='+req.session.token+'&v=5.53'
		};
		https.request(options, function(response) {
			var str = '';
			response.on('data', function (chunk) {
			    str += chunk;
			});
			response.on('end', function () {
				console.log(str);
				str = JSON.parse(str);
				res.send(str);
			});
		}).end();
	}
	if (method == 'vkmarket') {
		var options = {
		  host: 'api.vk.com',
		  path: '/method/market.get?owner_id=-'+req.query.groupid[0]+'&album_id=&extended=1&access_token='+req.session.token+'&v=5.53'
		};
		https.request(options, function(response) {
			var str = '';
			response.on('data', function (chunk) {
			    str += chunk;
			});
			response.on('end', function () {
				console.log(str);
				res.send(str);
			});
		}).end();
	}
	if (method == 'vkalbum') {
		console.log(req.query.albumid)
		var options = {
		  host: 'api.vk.com',
		  path: '/method/photos.get?owner_id=-'+req.query.groupid[0]+'&album_id='+req.query.albumid+'&extended=1&access_token='+req.session.token+'&v=5.53'
		};
		https.request(options, function(response) {
			var str = '';
			response.on('data', function (chunk) {
			    str += chunk;
			});
			response.on('end', function () {
				console.log(str);
				res.send(str);
			});
		}).end();
	}
	if (method == 'okalbum') {
		console.log('groupid',req.query.groupid[0]);
		console.log('albumid',req.query.albumid);
	    var str = '';
	    var token = req.session.token;
	    console.log(token);
	    var signature = 'aid='+req.query.albumid+'application_key=CBAGKPFLEBABABABAformat=JSONgid='+req.query.groupid[0]+'method=photos.getPhotos'+crypto.createHash('md5').update(token.toString()+'D7F536D8ACE7EF94376C93EC').digest("hex");
	    signature = crypto.createHash('md5').update(signature).digest("hex");
	    console.log(signature);

	    https.request({
	    	host: 'api.ok.ru',
	    	path: '/fb.do?method=photos.getPhotos&gid='+req.query.groupid[0]+'&aid='+req.query.albumid+'&application_key=CBAGKPFLEBABABABA&format=JSON&access_token='+req.session.token+'&sig='+signature,
	    }, function(response) {
	    	response.on('data', function (chunk) {
			    str += chunk;
			});
			response.on('end', function () {
				console.log(str);
				str = JSON.parse(str);
				res.send(str);
			});
	    }).end();
	}
}
exports.post = function(req, res, next) {
	postdata(req, res, function (err, data) {
		//console.log(data);
		var products = JSON.parse(data.importers);
		console.log(products.length)
		/*products.forEach(function(item) {
			console.log(item);
		})
		*/
		function getOrdersElements(productData, callback) {
            process.nextTick(function () {
            	var product = new Product({
	                _userId: productData.user,
	                _workshopId:productData.workshop,
	                _categoryId:productData.category,
	                name:productData.title,
	                description:productData.description,
	                previewImg: productData.previewImg,
	                previewImg640: productData.productimage,
	                gallery:productData.productimage,
	                price:productData.price,
	                active: "true",
	                available: 1
            	});
            	product.save(function() {
            		console.log(product);
            		callback(null, product);
            	});
            });
        }
        function done(error, result) {
        	console.log('All saved');
        	res.send();
        }
		async.map(products, getOrdersElements, done);
	})
}
