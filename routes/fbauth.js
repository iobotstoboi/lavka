var VK = require('vksdk');
var User = require('../models/user').User;
var https = require('https');

exports.get = function(req, res, next) {
	var username = req.query.username;
	console.log(username);
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
	                res.redirect('/');
	            }
	}, {username: username});
}
