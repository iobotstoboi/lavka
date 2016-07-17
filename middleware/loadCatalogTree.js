var Category = require('../models/category').Category;

module.exports = function(req, res, next) {
    req.catalog = res.locals.catalog = null;

	Category.getCatalogueTree(function(catalog) {
		req.catalog = res.locals.catalog = catalog;
		next();
	});
};