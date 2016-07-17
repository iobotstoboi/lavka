var Category = require('../models/category').Category;

// Обрабатываем GET запрос - загрузка страницы
exports.get = function(req, res) {

    Category.getCatalogueTree(function(catalogueTree){
        res.render('categories', {datka:catalogueTree, path: req.path});
    });

};