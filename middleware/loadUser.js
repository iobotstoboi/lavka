var User = require('../models/user').User;

module.exports = function(req, res, next) {
    req.user = res.locals.user = null;
    req.cart = res.locals.cart = null;
    req.token = res.locals.token = null;
    req.cart = res.locals.cart = req.session.cart;
    req.token = res.locals.token = req.session.token;
    // Если в сессии нет юзера идем дальше
    if (!req.session.user) return next();

    // Ищем пользователя
    User.findById(req.session.user, function(err, user) {
        if (err) return next(err);
        req.user = res.locals.user = user;
        
        next();
    });
};