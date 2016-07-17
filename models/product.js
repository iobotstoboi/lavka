//var searchPlugin = require('mongoose-search-plugin');
//var textSearch = require('mongoose-text-search');
var async = require('async');
var util = require('util');

var mongoose = require('../lib/mongoose'),
    Schema = mongoose.Schema;

var productSchema = new Schema({
    _userId: Schema.Types.ObjectId,
    _workshopId: Schema.Types.ObjectId,
    _categoryId: Schema.Types.ObjectId,
    name: String,
    introText: {type:String},
    description: {
        type: String
    },
    previewImg: {type: String},
    previewImg640: {type: String},
    gallery: { type:String},
    created: {
        type: Date,
        default: Date.now
    },
    published: {
        type: Date,
        default: Date.now
    },
    date_sort: {
        type: Date,
        default: Date.now
    },
    price: {type:String},
    rating: {type:String, default: "0"},
    super : {type:Boolean},
    best : {type:Boolean},
    highlight : {type:Boolean},

    superProductStartDate: {
        type: Date
        },
    superProductEndDate: {
        type: Date
    },
    bestProductStartDate: {
        type: Date
    },
    bestProductEndDate: {
        type: Date
    },
    highlightProductStartDate: {
        type: Date
    },
    highlightProductEndDate: {
        type: Date
    },
    attributes: {type:String},
    active: {type: String},
    alias: {type: String},
    url: {type: String},
    views: {type: Number},
    available: {
        type: Number,
        default: 0
    }
});

/*
productSchema.plugin(searchPlugin, {
    fields: ['name', 'introText', 'description']
});*/

//productSchema.plugin(textSearch);
//productSchema.index({ name: 'text',  introText: 'text', description: 'text' });
//productSchema.index({ introText: 'text' });
//productSchema.index({ description: 'text' });


/*
// Метод для нахождения родительской категории каталога
productSchema.methods.getParentCategory = function getParentCategory (callback) {
    return this.model('products').findById(this._categoryId, function (err, doc){
        callback(doc);
    });
};

// Метод для нахождения пользователя добавившего товар
productSchema.methods.getChilds = function getChilds (callback) {
    return this.model('categories').find({ _parentId: this._id }, function(err,doc) {
        callback(doc);
    });
};

// Метод для нахождения Мастерской разместившей товар
productSchema.methods.getChilds = function getChilds (callback) {
    return this.model('categories').find({ _parentId: this._id }, function(err,doc) {
        callback(doc);
    });
};

// Метод нахождения товарав по категории каталога
productSchema.statics.getMainCategories = function(callback) {
    var Category=this;
    Category.find({ '_parentId': undefined }, function (err, docs) {
        callback(docs);
    });

// Метод для нахождения товаров мастерской
productSchema.statics.getMainCategories = function(callback) {
    var Category=this;
    Category.find({ '_parentId': undefined }, function (err, docs) {
        callback(docs);
    });

*/


// Метод для создания нового товара
        productSchema.statics.createNewProduct = function(productData, callback) {
            var Product = this;

            //console.log('Мы в методже создания новго продукта ' + productData['namename']);
            //console.log(productData['active']);
            var gallery=[];
            console.log('Available', productData['available']);
            gallery.push(productData['productimage-default']);
            var product = new Product({
                _userId: productData['user'],
                _workshopId:productData['workshop'],
                _categoryId:productData['category'],
                name:productData['namename'],
                introText:productData['intro'],
                description:productData['description'],
                previewImg: productData['previewimage'],
                previewImg640: productData['productimage'],
                gallery:gallery,
                price:productData['price'],
                active: productData['active'],
                alias: productData['alias'],
                available: productData['availableProduct']
            });
            console.log('Записали новый продукт');
            product.save(function(err, product) {
                if (err) {
                    console.log(util.inspect(err));
                    return callback(err);
                }
                callback(null,product);
            });

            /*
            async.waterfall([
                function(callback) {
                    //Workshop.findOne({_userAccountId: userAccountId}, callback); // Проверим есть ли у этого пользователя уже мастерская
                    console.log('---------------------')
                    console.log(util.inspect(productData));
                    // Здесь мы будем проверять возможности тарифа Мастерской и превышение лимита на товары
                    callback();
                },
                function(callback) {
                        var product = new Product({
                            _userId: productData['user'],
                            _workshopId:productData['workshop'],
                            _categoryId:productData['category'],
                            name:productData['name'],
                            introText:productData['intro'],
                            description:productData['description'],
                            previewImg:productData['image'],
                            gallery:productData['gallery'],
                            price:productData['price']
                        });
                        product.save(function(err) {
                            if (err) return callback(err);
                            colsole.log('Записали новый продукт');
                            callback(null, product);
                        });
                }
            ], callback); */
        };

// Метод нахождения товаров по категории
productSchema.statics.getProductsByCategory = function getProductsByCategory(cat_id, callback) {
    var Product=this;
    Product.find({ '_categoryId': cat_id, 'active':'true'}, function (err, matchedProducts) {
        callback(matchedProducts);
    });

};

// Метод нахождения товаров по мастерской
productSchema.statics.getProductsByWorkshop = function getProductsByWorkshop(workshop_id, callback) {
    var Product=this;
    Product.find({ '_workshopId': workshop_id}, function (err, matchedProducts) {
        callback(matchedProducts);
    });

};

// Метод нахождения товаров по мастерской
productSchema.statics.checkProductEdit = function checkProductEdit(workshop_id, callback) {
    var Product=this;
    Product.find({ '_workshopId': workshop_id }, function (err, matchedProducts) {
        callback(matchedProducts);
    });

};

productSchema.statics.getLatest = function checkProductEdit(callback) {
    var Product=this;
    Product.find({'active':'true'}).sort('-created').limit(12).exec(function(err, products){
        //console.log(util.inspect(products));
        callback(products);
    });
};
productSchema.statics.getPopular = function checkProductEdit(callback) {
    var Product=this;
    Product.find({'active':'true'}).sort('-views').limit(12).exec(function(err, products){
        if (err) {
            //console.log(err);
        } else {
            //console.log(util.inspect(products));
            callback(products);
        }
    });
};
/*
// Метод для удаления товара из базы
        productSchema.statics.getMainCategories = function(callback) {
            var Category=this;
            Category.find({ '_parentId': undefined }, function (err, docs) {
                callback(docs);
            });
*/



exports.Product = mongoose.model('products', productSchema);
