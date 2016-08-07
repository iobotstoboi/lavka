var VK = require('vksdk');
var User = require('../models/user').User;
var https = require('https');
var crypto = require('crypto');

exports.get = function(req, res, next) {
	console.log(req.query.code);
	var code = req.query.code;
	var data = {};
	var options = {
	  host: 'api.ok.ru',
	  port: 443,
	  path: '/oauth/token.do?client_id=1247716608&client_secret=D7F536D8ACE7EF94376C93EC&redirect_uri=http://lavka.club/okauth&grant_type=authorization_code&code='+code,
	  method: 'POST'
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
	    str = JSON.parse(str);
	    console.log(str);
	    var strnext = '';
	    console.log(str.access_token);
	    var sig = 'application_key=CBAGKPFLEBABABABAfields=email,first_name,last_name,pic_1,pic_2,pic_3format=JSONmethod=users.getCurrentUser'+crypto.createHash('md5').update(str.access_token+'D7F536D8ACE7EF94376C93EC').digest("hex");
	    var sig = crypto.createHash('md5').update(sig).digest("hex");
	    console.log(sig);
	    req.session.token = str.access_token;
	    https.request({
	    	host: 'api.ok.ru',
	    	path: '/fb.do?method=users.getCurrentUser&application_key=CBAGKPFLEBABABABA&format=JSON&fields=email,first_name,last_name,pic_1,pic_2,pic_3&access_token='+str.access_token+'&sig='+sig,
	    }, function(response) {
	    	response.on('data', function (chunk) {
			    strnext += chunk;
			});
			response.on('end', function () {
				console.log(strnext);
				strnext = JSON.parse(strnext);
				console.log(strnext);
				if (strnext.email != undefined) {
					var username = strnext.email;
				} else {
			    	var username = strnext.uid;
				}
				var firstName = strnext.first_name;
				var secondName = strnext.last_name;
				var avatar = strnext.pic_3;
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
					req.session.token = str.access_token
			                //console.log('\n_______________________$$$$$$\n______________________$$$$$$\n______________________$$$$\n______________________$$\n_________$$$$$$$$$$$$$_$$$$$$$$$$$$$\n______$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$\n____$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$\n___$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$\n__$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$\n_$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$\n_$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$\n_$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$\n_$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$\n__$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$\n___$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$\n____$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$\n_____$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$\n______$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$\n________$$$$$$$$$$$$$$$$$$$$$$$$$$$$$\n__________$$$$$$$$$$$$$$$$$$$$$$$$$\n____________$$$$$$$$$$$$$$$$$$$$$\n______________$$$$$$$$__$$$$$$$\n')
			                //res.send({});
			                //res.render('login');
			                res.redirect('/')
			            }
			        }, {username: username, firstName: firstName, avatar: avatar, secondName: secondName});
			});
	    }).end();
	    /*
	    
	    */
	  });
	}
	https.request(options, callback).end();
}
