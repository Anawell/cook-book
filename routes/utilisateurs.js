const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const passport = require('passport');

const Utilisateur = require('../models/Utilisateur');


router.get('/login', (req, res) => {
    res.render('authentification/login', {
        title: `S'identifier`,
        path: req.path
    });
});

router.get('/register', (req, res) => {
    res.render('authentification/register', {
        title: `S'enregistrer`,
        path: req.path
    });
});

router.post('/register', async (req, res) => {
    const { username, email, password, confirmpassword } = req.body;
    let errors = [];

    // Check and manage errors
    if (!username || !email  || !password || !confirmpassword) {
        errors.push({ message: 'Merci de remplir tous les champs' });
    }
    if (password.length < 8) {
        errors.push({ message: 'Le mot de passe doit contenir au moins 8 caractères' })
    }
    if (password !== confirmpassword) {
        errors.push({ message: 'Les mots de passe ne correspondent pas' });
    }
    if (errors.length > 0) {
        res.render('authentification/register', {
            errors,
            username,
            email,
            password,
            confirmpassword
        })
    } else {
        // Check if user already exists
        Utilisateur.findOne({ email: email })
        .then(async function(user) {
            if (user) {
                errors.push({ message: 'Votre email existe déjà !' });
                res.render('authentification/register', {
                    errors,
                    username,
                    email,
                    password,
                    confirmpassword
                })

            } else {

                try {
                    const hashedPassword = await bcrypt.hash(password, 10);
                    const utilisateur = new Utilisateur({ 
                        username: username,
                        email: email,
                        password: hashedPassword
                    });
                    utilisateur.save();
                    req.flash('success_message', 'Votre compte a bien été créé. Vous pouvez vous connecter dès à présent.');
                    res.redirect('/authentification/login');
                } catch {
                    res.redirect('/authentification/register');
                }

            }
        })
       
    }
 
});

router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/authentification/login',
        failureFlash: true
    })(req, res, next);
});

router.get('/logout', (req, res, next) => {
    req.logout(); // function from Passport middelware
    req.flash('success_message', 'Vous avez été déconnecté(e) avec succès');
    res.redirect('/authentification/login');
});


module.exports = router;