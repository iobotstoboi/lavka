var async = require('async');
var util = require('util');

var mongoose = require('../lib/mongoose'),
    Schema = mongoose.Schema;

var articleSchema = new Schema({
    title: {type: String},
    longtitle: {type: String},
    introtext: {type: String},
    body: {
        type: String
    },
    previewImg:{type:String},
    _userId: Schema.Types.ObjectId,
    sortIndex: String,
    moderated: String,
    publishedDate: {type: Date},
    created: {
        type: Date,
        default: Date.now
    }
});

exports.Article = mongoose.model('articles', articleSchema);
