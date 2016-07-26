// MODULES
var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var log = require('./lib/log')(module);
var cookieParser = require('cookie-parser');
var multiparty = require('multiparty');
var util = require('util');
var http = require('http');
var config = require('./config');
var mongoose = require('./lib/mongoose');
var session = require('express-session')
var HttpError = require('./error').HttpError;
var errorHandler = require('errorhandler');
var subdomain = require('express-subdomain');

//
// Инициализируем скрипты шаблонов
var routes = require('./routes/index'); // Главная страница

// Создаем приложение
var app = express();

// Подлючаем шаблонизатор JADE
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


// Навешиваем мидлвэры
app.use(favicon());             // Иконка сайта
app.use(logger('dev'));
app.use(cookieParser());


app.use(session({
    secret: config.get('session:secret'),
    key: config.get('session:key'),
    cookie: config.get('session:cookie'),
    //store: new MongoStore({mongoose_connection: mongoose.connection})
    store: new (require('express-sessions'))({
        storage: 'mongodb',
        instance: mongoose, // optional
        host: 'localhost', // optional
        port: 3000, // optional
        db: 'lavka', // optional
        collection: 'sessions', // optional
        expire: 86400 // optional
    })
}));

app.use(require('./middleware/sendHttpError'));
app.use(require('./middleware/loadUser'));
app.use(require('./middleware/loadWorkshop'));

app.use(express.static(path.join(__dirname, 'public')));
var checkUser = subdomain('*.*', function(req, res, next) {
    console.log('$$$$$$$subdomain$$$$$$$$$');
    var domain = req.headers.host.split('.');
    console.log(domain);
    if (domain[0] != "lavka") {
        console.log(domain[0]);
        res.redirect('http://lavka.club/'+domain[0])
    }
    next();
});
app.use(checkUser);
// Прикрепляем скрипты шаблонов к URL-ам

app.use('/', routes);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    //next(err);
    res.render('404')
});
/// error handlers

// development error handler
// will print stacktrace
 if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}
// production error handler
// no stacktraces leaked to user
 app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

app.use(function(err, req, res, next) {
    if (typeof err == 'number') { // next(404);
        err = new HttpError(err);
    }

    if (err instanceof HttpError) {
        res.sendHttpError(err);
    } else {
        if (app.get('env') == 'development') {
            errorHandler()(err, req, res, next);
        } else {
            log.error(err);
            err = new HttpError(500);
            res.sendHttpError(err);
        }
    }
});



module.exports = app;
