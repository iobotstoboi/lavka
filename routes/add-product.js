var User = require('../models/user').User;
var multiparty = require('multiparty');
var Category = require('../models/category').Category;
var HttpError = require('../error').HttpError;
var AuthError = require('../models/user').AuthError;
var async = require('async');
var Workshop = require('../models/workshop').Workshop;
var Product = require('../models/product').Product;
var path = require('path');
var fs = require('fs');
var util = require('util');
var randtoken = require('rand-token');
var mkdirp = require('mkdirp');
//var easyimg = require('easyimage');
//var gm= require('gm');
var im = require('imagemagick');
var PricePlan = require('../models/priceplan').PricePlan;
var Alias = require('../models/alias').Alias;

// Обрабатываем ПОСТ запрос
// Добавление товара
exports.post = function(req, res, next) {


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
            console.log('NO FILE');
            formdata['previewimage'] = 'assets/images/tovar.png';
            formdata['productimage'] = 'assets/images/tovar.png';
            formdata['productimage-default'] = 'assets/images/tovar.png';
        }
        // Сначала перекинем изображение в директорию для картинок, а затем сделаем превьюху
        async.waterfall([
            function (callback) {
                mkdirp(product_image_dir, function (err) {
                    if (err) {
                        // Беда беда
                        throw err
                    } else {
                        fs.rename(tmp_path, product_image_path, function (err) {

                            if (err) {
                                // Возникла ошибка
                                throw err
                            } else {
                                mkdirp(preview_image_dir, function (err) {
                                    if (err) {
                                        // Ошибка при создании директории
                                        throw err
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
                                                console.log('stdout')
                                                console.log(stdout)
                                                console.log('stderr')
                                                console.log(stderr);
                                                throw err
                                            } else {
												im.resize({
														srcPath: product_image_path,
														dstPath: product_image_path,
														width: 640,
														format: 'jpg'
													}, function (err, stdout, stderr) {
														if (err) {
															// Что то пошло не так
                                                            throw err
														} else {
															mkdirp(product_image_dir_640, function (err) {
																if (err) {
                                                                    throw err
																} else {
																	im.resize({
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
																		    throw err
                                                                        } else {
																			callback(null);
																			// Все отлично
																			console.log('КОнец 3');

																		}
																	});
																}
															});
															console.log('КОнец 2');
														}
													});
                                                // Все отлично
                                                console.log('КОнец 1');
                                            }
                                        });
                                    }
                                });
                            }

                        });

                    }
                });
            }], function (err) {
            if (err) {
                console.log('Произошла ошибка');
                res.redirect('/workshop-private');
            } else {
                res.redirect('/workshop-private');
            }
        })
    });


    form.parse(req, function(err,fields, files) {

        console.log("Мультипарти парсер начался");
        Object.keys(fields).forEach(function(name) {
            //console.log('got field named ' + name);
        });

        // Наш пользователь
        var userAccountId = req.session.user;
        var workshopId = req.session.workshop;
        //console.log('В сессии записан воркшоп ' + req.session.workshop);
        // Данные с формы
        formdata['user'] = userAccountId;
        formdata['workshop'] = workshopId;
        formdata['available'] =  
        //console.log('МАссив данных для создания товара выглядит так');
        //console.log(util.inspect(formdata));

        Workshop.getProductLimit(workshopId, function(priceplan){
            //console.log("Лимит воркшопа " + priceplan['product-limit-high']);
            //Получим товары мастерской
            Product.getProductsByWorkshop(workshopId, function(matchedProducts) {
                if (matchedProducts.length < priceplan['product-limit-high'] || priceplan['product-limit-high'] == 0) {
                    formdata['active'] = true;
                } else {
                    formdata['active'] = false;
                }

                console.log('WHAT WILL SAVE', formdata)
                //console.log(formdata['active']);
                Product.createNewProduct(formdata, function(err,product) {
                    if (err) { console.log('ERROR!!!');
                        return next(err);
                    } else {
                        async.waterfall([
                            function (callback) {
                                var check = 0;
                                var categoryAlias = '';
                                var categoryId = formdata['category'];
                                async.whilst(function () {
                                        return check != 1;
                                    },
                                    function (next) {
                                        Category.findById(categoryId, function (err, category) {
                                            if (category){
                                                categoryAlias = category.alias + '/' + categoryAlias;
                                                categoryId = category._parentId;
                                                //console.log(category.alias);
                                            }else{
                                                check = 1;
                                                //console.log('stop');
                                            }
                                            next();
                                        });
                                    },
                                    function (err) {
                                        //console.log(categoryAlias);
                                        callback(null, categoryAlias);
                                        // All things are done!
                                    });

                            },
                            function (categoryAlias, callback) {
                                var resourceId = product._id;
                                var productAlias = formdata['alias'].replace(/[^\d\w_]/g, '');
                                if (productAlias == '' || !productAlias){
                                    productAlias = 'noname';
                                    return;
                                }
                                //добавляем alias
                                var optionsAlias = {upsert: true};
                                var conditionsAlias = {resourceId: resourceId};
                                var updateAlias = {
                                    resourceId: resourceId,
                                    resourceType: 'product',
                                    resourceAlias: productAlias,
                                    resourceUrl: '/catalog/' + categoryAlias + productAlias + '_' + resourceId
                                };
                                console.log('Запишем alias');
                                // Обновляем объект в БД
                                Alias.update(conditionsAlias, updateAlias, optionsAlias);

                                var optionsProduct = {upsert: false};
                                var conditionsProduct = {_id: resourceId};
                                var updateProduct = {url: '/catalog/' + categoryAlias + productAlias + '_' + resourceId};
                                console.log('Запишем url в product');
                                Product.update(conditionsProduct, updateProduct, optionsProduct,callback);
                            }
                        ]);
                    }
                    //req.session.authenticated  = true;
                    //res.send({});
                    //res.render('login');
                });
            });
        });

    });




};