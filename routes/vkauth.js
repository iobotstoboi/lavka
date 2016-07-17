var VK = require('vksdk');
var User = require('../models/user').User;
var https = require('https');

exports.get = function(req, res, next) {
	console.log(req.query.code);
	var code = req.query.code;
	var options = {
	  host: 'oauth.vk.com',
	  path: '/access_token?client_id=5548425&client_secret=GAsHSJEXN5spuCbZmlpF&redirect_uri=http://lavka.club/vkauth&code='+code
	};
	console.log(options);
	callback = function(response) {
	  var str = '';

	  //another chunk of data has been recieved, so append it to `str`
	  response.on('data', function (chunk) {
	    str += chunk;
	  });

	  //the whole response has been recieved, so we just print it out here
	  response.on('end', function () {
	    console.log(str);
	    str = JSON.parse(str);
	    console.log(str.email);
	    var username;
	    if (str.email == undefined) {
	    	var username = str.user_id;
	    } else {
	    	var username = str.email;
	    }
		   	User.authorize(username, "", "vkauth", function(err, user) {
	            if (err) {
	                if (err instanceof AuthError) {
	                    //return next(new HttpError(403, err.message));
	                    console.log('Ошибка получается ' + err.message);
	                    req.session.message = "Ошибка авторизации";
	                    //res.send({});
	                    //res.render('login');
	                    res.redirect('/')
	                } else {
	                    return next(err);
	                }
	            } else {
	                req.session.user = user._id;
	                req.session.authenticated  = true;
	                req.session.message = " Вы авторизовались";
	                //console.log('\n_______________________$$$$$$\n______________________$$$$$$\n______________________$$$$\n______________________$$\n_________$$$$$$$$$$$$$_$$$$$$$$$$$$$\n______$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$\n____$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$\n___$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$\n__$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$\n_$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$\n_$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$\n_$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$\n_$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$\n__$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$\n___$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$\n____$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$\n_____$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$\n______$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$\n________$$$$$$$$$$$$$$$$$$$$$$$$$$$$$\n__________$$$$$$$$$$$$$$$$$$$$$$$$$\n____________$$$$$$$$$$$$$$$$$$$$$\n______________$$$$$$$$__$$$$$$$\n')
	                //res.send({});
	                //res.render('login');
	                res.redirect('/')
	            }
	        }, {username: username});
	    //res.redirect('/?email='+str.email);
	  });
	}
	https.request(options, callback).end();
	/*
	vk.requestServerToken();

	vk.on('serverTokenReady', function(_o) {
	    // Here will be server access token
	    vk.setToken(_o.access_token);
	});
	// Turn on requests with access tokens
	vk.setSecureRequests(true);

	// Request server API method
	vk.request('secure.getSMSHistory', {}, function(_dd) {
	    console.log(_dd);
	});
	vk.setToken(access_token);

	// Request 'users.get' method
	vk.request('users.get', {'user_id' : 1}, function(_o) {
	    console.log(_o);
	});
	*/
}