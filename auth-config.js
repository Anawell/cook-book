module.exports = { // functtions from Passport
    ensureAuthenticated: function(req, res, next) {
        if(req.isAuthenticated()) {
            return next()
        }
        req.flash('error_message', 'Merci de vous identifier pour accéder à ce contenu');
        res.redirect('/authentification/login');
    }
}