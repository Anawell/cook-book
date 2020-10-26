const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const Utilisateur = require('./models/Utilisateur');



module.exports = function(passport) {
    passport.use(
        new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
            // Checkk if user email matches
            Utilisateur.findOne({ email: email })
            .then(user => {
                if(!user) {
                    return done(null, false, { message: `Cet e-mail n'est pas enregistré...` });
                }
                // Check if password matches
                bcrypt.compare(password, user.password, (error, isMatch) => {
                    if(error) {
                        throw error;
                    }
                    if(isMatch) {
                        done(null, user);
                    } else {
                        done(null, false, { message: 'Le mot de passe est incorrect' });
                    }
                });
            })
            .catch(error => console.log(error));
        })
    );

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });
      
    passport.deserializeUser((id, done) => {
        Utilisateur.findById(id, function(err, user) {
            done(err, user);
        });
    });
}