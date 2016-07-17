var Category = require('../models/category').Category;
var User = require('../models/user').User;
var Workshop = require('../models/workshop').Workshop;
var Product = require('../models/product').Product;
var HttpError = require('../error').HttpError;
var async = require('async');
var multiparty = require('multiparty');
var AuthError = require('../models/user').AuthError;
var fs = require('fs');
var path = require("path");
var util = require('util');
var im = require('imagemagick');
var PricePlan=require('../models/priceplan').PricePlan;
var randtoken = require('rand-token');
var mkdirp = require('mkdirp');

exports.get = function(req, res) {
    // Загружаем страницу редактирования товара
    // id товара лежит в req.params.id

    async.waterfall([
        function(callback){ // Для начала проверим существует ли такой товар
            Product.findById(req.params.id, function(err, product){
                if (err) {
                    // Нет такого товара
                    callback(err);
                } else {
                    console.log('Товар найден ' +  product.name);
                    if ((product._userId == req.session.user) && (product._workshopId == req.session.workshop)){
                        callback(null,product);
                    }   else {
                        // Пользователь не тот
                        callback(new HttpError(401, "Вы не авторизованы"));
                    }
                }
            });
        },
        function(product, callback){ //проверим количество товаров мастерской
            if (req.session.workshop) {
                workshopid=req.session.workshop;
                Product.getProductsByWorkshop(req.session.workshop, function(matchedProducts) {
                    callback(null, product, matchedProducts, workshopid);
                });
            }
        },
        function(product, matchedProducts, workshopid, callback) {
            Workshop.getWorkshop(workshopid, function(workshop) {
                callback(null, product, matchedProducts, workshopid, workshop);
            });
        },
        function(product, matchedProducts, workshopid, workshop, callback) { //Получим данные о текущем плане
            PricePlan.getPricePlanObject(workshop.priceplan, function(priceplan){
                var cocount=0; // Количество активных товаров
                for(var val in matchedProducts){
                    if (matchedProducts[val].active == "true") {cocount++;}
                }
                console.log('Активных товаров ' + cocount);
                var abilityActivateProduct;
                if (parseInt(priceplan['product-limit-high']) > cocount || parseInt(priceplan['product-limit-high']) == 0) {
                    abilityActivateProduct = true;
                } else {
                    abilityActivateProduct = false;
                }
                callback(null,product, matchedProducts, workshopid, workshop, priceplan, abilityActivateProduct);

            });
        },
        function(product, matchedProducts, workshopid, workshop, priceplan, abilityActivateProduct, callback){
            Category.getCatalogueTree(function(catalogueTree){
                callback(null, product, matchedProducts, workshopid, workshop, priceplan, abilityActivateProduct, catalogueTree);
            });
        }
    ], function (err,  product, matchedProducts, workshopid, workshop, priceplan, abilityActivateProduct, catalogueTree) {
        res.render('editProduct', {datka:catalogueTree, path: req.path, product: product, abilityActivateProduct:abilityActivateProduct ,priceplan:priceplan, workshop:workshop});
    });
};

exports.post = function(req,res) {

    console.log('ДОбрались до скрипта обработки запроса');
    // Получим данные формы
    var form = new multiparty.Form();
    var formdata ={};
    form.on('field', function(name,value) {
        formdata[name] = value;
        console.log('Поле ' + name + " : " + value);
    });

    form.on('error', function(err) {
        console.log('Error parsing form: ' + err.stack);
    });

    // Обрабатываем файл
    var size = '';
    var fileName = '';
    form.on('part', function(part){
        if(!part.filename) return;
        size = part.byteCount;
        fileName = part.filename;
    });


    form.on('file', function(name,file){
        console.log('Wow wow, some file here, yeah?' + name);
        console.log('filename: ' + fileName + ' или ' + file.originalFilename);
        console.log('fileSize: '+ (file.size / 1024));
        var tmp_path = file.path;
        var token= randtoken.generate(16);
        var userfolder = req.session.user;


        fs.readFile(file.path, function (err, data) {
            var newPath = path.normalize(__dirname + "/../public/uploads/products-previews/" + userfolder);
            fs.writeFile(newPath, data, function (err) {
            });
        });


        // Путь к 320x240
        var preview_image_dir = path.normalize(__dirname + "/../public/uploads/products/" + userfolder + '/320');
        var preview_image_path = path.normalize(__dirname + "/../public/uploads/products/" + userfolder + '/320/') + token + 'tmb.jpg';
        var preview_image_relpath = "../uploads/products/" + userfolder + '/320/' + token + 'tmb.jpg';
        // Путь к 640x480
        var product_image_dir_640 = path.normalize(__dirname + "/../public/uploads/products/" + userfolder + '/640');
        var product_image_path_640 = path.normalize(__dirname + "/../public/uploads/products/" + userfolder + '/640/') + token  + 'tmb.jpg';
        var product_image_relpath_640 = "../uploads/products/" + userfolder + '/640/' + token + '.jpg';
        // Путь к самому файлу
        var product_image_dir = path.normalize(__dirname + "/../public/uploads/products/" + userfolder);
        var product_image_path = path.normalize(__dirname + "/../public/uploads/products/" + userfolder + '/') + token  + '.jpg';
        var product_image_relpath = "../uploads/products/" + userfolder + '/' + token + '.jpg';

        var target_path = path.normalize(__dirname + "/../public/uploads/products/") + '.jpg';


        if (file.path) {
            formdata['previewimage'] = preview_image_relpath;
            formdata['productimage'] = product_image_relpath_640;
            formdata['productimage-default'] = product_image_relpath;

        } else {
            formdata['previewimage'] = 'assets/images/tovar.png';
            formdata['productimage'] = 'assets/images/tovar.png';
            formdata['productimage-default'] = 'assets/images/tovar.png';
        }
        if (file.originalFilename.length < 2) {
            formdata['previewimage'] = false;
        }
        // Сначала перекинем изображение в директорию для картинок, а затем сделаем превьюху
        mkdirp(product_image_dir, function(err) {
            if (err) {
                // Беда беда
            } else {
                fs.rename(tmp_path, product_image_path, function(err) {

                    if (err) {
                        // Возникла ошибка
                    } else {
                        mkdirp(preview_image_dir, function(err) {
                            if (err) {
                                // Ошибка при создании директории
                            } else {
                                im.crop({
                                    srcPath: product_image_path,
                                    dstPath: preview_image_path,
                                    width: 320,
                                    height: 240,
                                    format: 'jpg',
                                    quality: 1,
                                    gravity: "center"
                                }, function (err, stdout, stderr) {
                                    if (err) {
                                        // Что то пошло не так
                                    } else {
                                        // Все отлично

                                    }
                                });
                                im.resize({
                                    srcPath: product_image_path,
                                    dstPath: product_image_path,
                                    width: 640,
                                    format: 'jpg'
                                }, function(err, stdout, stderr){
                                    if (err) {
                                        // Что то пошло не так
                                    } else {
                                        // Все отлично

                                    }
                                });
                            }
                        });
                        mkdirp(product_image_dir_640, function(err) {
                            if (err) {

                            } else {
                                im.crop({
                                    srcPath: product_image_path,
                                    dstPath: product_image_path_640,
                                    width: 640,
                                    height: 480,
                                    format: 'jpg',
                                    quality: 1,
                                    gravity: "center"
                                }, function (err, stdout, stderr) {
                                    if (err) {
                                        // Что то пошло не так
                                    } else {
                                        // Все отлично

                                    }
                                });
                            }
                        });

                    }

                });

            }
        });

    });


    form.parse(req, function(err,fields, files) {

        console.log("Мультипарти парсер начался");
        Object.keys(fields).forEach(function(name) {
            console.log('WAZZA got field named ' + name);
        });

        // Наш пользователь
        var userAccountId = req.session.user;
        var workshopId = req.session.workshop;
        console.log('В сессии записан воркшоп ' + req.session.workshop)
        // Данные с формы
        formdata['user'] = userAccountId;
        formdata['workshop'] = workshopId;

        console.log('МАссив данных для создания товара выглядит так');
        console.log(util.inspect(formdata));

        var conditions = { _id: formdata['_id']}
            , options = {}
            , update={};
        console.log('')
        if (!formdata['previewimage']){
            update = { name: formdata['namename'],
                _categoryId: formdata['category'],
                description: formdata['description'],
                available: formdata['availableProduct'],
                price: formdata['price']
            }
        } else {
            var gallery=[];
            console.log('PREVIEW', formdata['previewimage']);
            gallery.push(formdata['productimage-default']);
            update = { name: formdata['namename'],
                _categoryId: formdata['category'],
                description: formdata['description'],
                price: formdata['price'],
                previewImg: formdata['previewimage'],
                previewImg640: formdata['productimage'],
                available: formdata['availableProduct'],
                gallery:gallery}
        }

        // Обновляем объект в БД
        Product.update(conditions, update, options, function(err, product) {
            if (err) {
                console.log(err.message);
            } else {
                console.log('Все пучком');
            }
            res.redirect('/workshop-private');
        });
    });



};
