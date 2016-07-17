//var searchPlugin = require('mongoose-search-plugin');
//var textSearch = require('mongoose-text-search');
var async = require('async');
var util = require('util');

var mongoose = require('../lib/mongoose'),
    Schema = mongoose.Schema;

var messageSchema = new Schema({
    user1: Schema.Types.ObjectId,
    user2: Schema.Types.ObjectId,
    user1Name: {
        type: String
    },
    items: {type: 'Mixed'},
    created: {
        type: Date,
        default: Date.now
    }
});
messageSchema.statics.saveMessage = function saveMessage(user1, user2, firstName, messagebody, from, callback) {
    var Message=this;
    Message.find({user1:user1, user2: user2}, function(err, message) {
        if (message.length >= 1) {
            console.log('OLD BRANCH');
            message[0].items.push({text: messagebody,from: from || user1});
            Message.update({'_id': message[0]._id}, {items: message[0].items}, { multi: true }, function(err, num) {
                console.log(err);
                console.log(num);
                callback(null, message);
            })
        } else {
            console.log('NEW BRANCH');
            console.log(firstName);
            var message = new Message({
                user1: user1,
                user2: user2,
                user1Name: firstName,
                items: [
                    {
                        text: messagebody,
                        from: from || user1
                    }
                ]
            })
            message.save(function(err) {
                if (err) {
                    console.log(err);
                    callback(err, null);
                } else {
                    callback(null, message);
                }
            })
        }
    })
    
}

exports.Message = mongoose.model('message', messageSchema);
