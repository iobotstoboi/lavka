var Message = require('../models/message').Message;
var postdata = require('postdata');
exports.post = function(req, res, next) {
	postdata(req, res, function (err, data) {
		console.log(data);
		Message.saveMessage(data.user1, data.user2, data.user1Name, data.messagebody, data.from, function(err, message) {
			if (err) {
				console.log(err);
			} else {
				res.send({});
			}
		})
	});
}