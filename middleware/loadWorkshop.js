var Workshop = require('../models/workshop').Workshop;

module.exports = function(req, res, next) {
    req.workshop = res.locals.workshop = null;

    // Если в сессии нет юзера идем дальше
    if (!req.session.workshop) return next();

    // Ищем пользователя
    Workshop.findById(req.session.workshop, function(err, workshop) {
        if (err) return next(err);

        req.workshop = res.locals.workshop = workshop;
        next();
    });
};