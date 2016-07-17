exports.post = function(req, res) {
    console.log('Runaway runaway');
    req.session.destroy(function() {
        //res.clearCookie('connect.sid', { path: '/' });
        res.redirect('/');
    });
    console.log('Session destroyed');

};