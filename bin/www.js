#!/usr/bin/env node
var debug = require('debug')('Lavka.club');
var config = require('../config');
var app = require('../app');
var cron = require('node-cron');
var ServiceProduct = require('../models/serviceproduct').ServiceProduct;
//var io = require('socket.io')(3000);

app.set('port', process.env.PORT || config.get('port'));

var server = app.listen(app.get('port'), function() {
	console.log('Express server listening on port ' + server.address().port);
    debug('Express server listening on port ' + server.address().port);
});
io = require('socket.io')(server);
io.sockets.on('connection', function (socket) {
      console.log('*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_**_*_*_*_*_*_*_*_*_*_*_*_*_*_*_**_*_*_*_*_*_*_*_*_*_*_*_*_*_*_**_*_*_*_*_*_*_*_*_*_*_*_*_*_*_**_*_*_*_*_*_*_*_*_*_*_*_*_*_*_**_*_*_*_*_*_*_*_*_*_*_*_*_*_*_**_*_*_*_*_*_*_*_*_*_*_*_*_*_*_**_*_*_*_*_*_*_*_*_*_*_*_*_*_*_**_*_*_*_*_*_*_*_*_*_*_*_*_*_*_**_*_*_*_*_*_*_*_*_*_*_*_*_*_*_**_*_*_*_*_*_*_*_*_*_*_*_*_*_*_**_*_*_*_*_*_*_*_*_*_*_*_*_*_*_**_*_*_*_*_*_*_*_*_*_*_*_*_*_*_**_*_*_*_*_*_*_*_*_*_*_*_*_*_*_**_*_*_*_*_*_*_*_*_*_*_*_*_*_*_**_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*')
        socket.on('captain', function(data) {
            console.log(data);

            socket.emit('Hello');
        });
        socket.on('message', function(msg){
          console.log('Socket get message!');

          socket.broadcast.emit('message', msg);
        });
});
cron.schedule('*/5 * * * *', function(){
  console.log('Checking serviceproducts');
  ServiceProduct.find({}, function(err, serviceproducts) {
  	var countService = Object.keys(serviceproducts).length;
  	for (var i = 0; countService > i; i++) {
  		console.log('Doing');
  		if (serviceproducts[i].enddate < new Date()) {
  			ServiceProduct.remove({'_id': serviceproducts[i]._id}, function(err, removed) {
  				if (err) {
  					console.log(err);
  				}
  				console.log(removed);
  			});
  		}
  	}
  });
});