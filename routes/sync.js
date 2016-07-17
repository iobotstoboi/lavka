var fs = require('fs');
var request = require('request');
var path = require('path');
var mkdirp = require('mkdirp');

exports.get = function(req, res, next) {
	process.on('uncaughtException', function (err) {
	  console.error(err);
	  //console.log("Node NOT Exiting...");
	});
	var download = function(uri, filename, callback){
	  request.head(uri, function(err, res, body){
	    console.log('content-type:', res.headers['content-type']);
	    console.log('content-length:', res.headers['content-length']);
	    //console.log('This is res headers', res);
	    if (err) {
	    	console.log(err);
	    	callback(err);
	    	return;
	    } else {
	    	var imagename = req.query.path.split('/')[req.query.path.split('/').length-1];
	    	console.log(imagename);
	    	mkdirp(__dirname + "/../public"+req.query.path.replace(imagename, ''), function(err) {
	    		console.log(err);
	    		request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
	    	});
	  	}
	  });
	};
	var newPath = path.normalize(__dirname + "/../public"+req.query.path);
	download(req.query.img, newPath, function(){
	  console.log('done');
	  res.send(newPath);
	});
}