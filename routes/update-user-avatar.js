var User = require('../models/user').User;
var multiparty = require('multiparty');
var HttpError = require('../error').HttpError;
var AuthError = require('../models/user').AuthError;
var async = require('async');
var fs = require('fs');
var path = require("path");
var randtoken = require('rand-token');
var mkdirp = require('mkdirp');
var im = require('imagemagick');
// Обрабатываем ПОСТ запрос
exports.post = function(req, res, next) {

    // Получим данные формы
    var form = new multiparty.Form();
    var formdata ={};
    form.on('field', function(name,value) {
        formdata[name] = value;
        // console.log('Поле ' + name + " : " + value);
    })


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
            var newPath = path.normalize(__dirname + "/../public/uploads/avatars/" + userfolder);
            fs.writeFile(newPath, data, function (err) {
            });
        });


        // Путь 320x240
        var preview_image_dir = path.normalize(__dirname + "/../public/uploads/avatars/" + userfolder + '/320');
        var preview_image_path = path.normalize(__dirname + "/../public/uploads/avatars/" + userfolder + '/320/') + token + 'tmb.jpg';
        var preview_image_relpath = "../uploads/avatars/" + userfolder + '/320/' + token + 'tmb.jpg';
        // Путь 640x480
        var product_image_dir = path.normalize(__dirname + "/../public/uploads/avatars/" + userfolder);
        var product_image_path = path.normalize(__dirname + "/../public/uploads/avatars/" + userfolder + '/') + token  + '.jpg';
        var product_image_relpath = "../uploads/avatars/" + userfolder + '/' + token + '.jpg';
        // Путь 40x40
        var preview_image_dir_mini = path.normalize(__dirname + "/../public/uploads/avatars/" + userfolder + '/40');
        var preview_image_path_mini = path.normalize(__dirname + "/../public/uploads/avatars/" + userfolder + '/40/') + token  + '.jpg';
        var preview_image_relpath_mini = "../uploads/avatars/" + userfolder + '/40/' + token + '.jpg';

        var target_path = path.normalize(__dirname + "/../public/uploads/products-previews/") + '.jpg';


        if (file.path) {
            formdata['img320'] = preview_image_relpath;
            formdata['img640'] = product_image_relpath;
            formdata['img40'] = preview_image_relpath_mini;
        } else {
            formdata['img320'] = 'assets/images/tovar.png';
            formdata['img640'] = 'assets/images/tovar.png';
            formdata['img40'] = 'assets/images/tovar.png';
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
                                }, function(err, stdout, stderr){
                                    if (err) {
                                        // Что то пошло не так
                                    } else {
                                        // Все отлично

                                    }
                                });
                                im.crop({
                                    srcPath: product_image_path,
                                    dstPath: product_image_path,
                                    width: 640,
                                    height: 480,
                                    format: 'jpg',
                                    quality: 1,
                                    gravity: "center"
                                }, function(err, stdout, stderr){
                                    if (err) {
                                        // Что то пошло не так
                                    } else {
                                        // Все отлично

                                    }
                                });

                            }
                        });
                        mkdirp(preview_image_dir_mini, function(err) {
                            im.crop({
                                srcPath: product_image_path,
                                dstPath: preview_image_path_mini,
                                width: 40,
                                height: 40,
                                format: 'jpg',
                                quality: 1,
                                gravity: "center"
                            }, function(err, stdout, stderr){
                                if (err) {
                                    // Что то пошло не так
                                } else {
                                    // Все отлично

                                }
                            });
                        });
                    }

                });

            }
        });

    });

    form.parse(req, function(err, fields, files) {

        Object.keys(fields).forEach(function(name) {
            //console.log('got field named ' + name);
        });

        var userAccountId = req.session.user;

        if (formdata['img320']) {
            var conditions = { _id: userAccountId }
                , update = { img320: formdata['img320'],
                img640: formdata['img640'],
                img40: formdata['img40']}
                , options = {};

            User.update(conditions, update, options, function() {
                res.redirect('/personal');
            });
        }


    });

};