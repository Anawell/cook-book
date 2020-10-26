if (process.env.NODE_ENV !== 'production') { 
    require('dotenv').config(); 
}

const path = require('path');
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose'); 
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('express-flash');
const passport = require('passport');

const app = express();

// Passport config
require('./passport-config')(passport);

// EJS Layouts setup
app.use(expressLayouts);
app.set('view engine', 'ejs'); 
app.set('views', __dirname + '/views'); 
app.set('layout', 'layouts/layout'); 

// Method override setup
app.use(methodOverride('_method'))

// Public folder setup
app.use(express.static(path.join(__dirname, 'public'))); 

// Body parser
app.use(express.urlencoded({ limit: '10mb', extended: false }));
app.use(express.json());

// DB setup
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true }); // eviter les warnings de deprecation
const db = mongoose.connection; 
db.on('error', error => console.error(error)); 
db.once('open', () => console.log('Connected to Mongoose')); 

// Express session setup
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false, // Veut-on resauver si aucun changement
    saveUninitialized: false // Veut-on sauver une valeur vide s'il n'y a pas de valeur
}));

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Flash messages setup (when redirect)
app.use(flash());
app.use((req, res, next) => {
    res.locals.success_message = req.flash('success_message'); // register user success
    res.locals.error_message = req.flash('error_message'); // register user fail
    res.locals.error = req.flash('error'); // login user fail > error system implemented by Passport failureFlash
    next();
})

// Routes setup
const indexRouter = require('./routes/index'); 
const dashboardRouter = require('./routes/dashboard');
const utilisateurRouter = require('./routes/utilisateurs');
const ingredientRouter = require('./routes/ingredients');
const recetteRouter = require('./routes/recettes');

app.use('/', indexRouter);
app.use('/dashboard', dashboardRouter); 
app.use('/authentification', utilisateurRouter);
app.use('/ingredients', ingredientRouter);
app.use('/recettes', recetteRouter);

// Port setup
app.listen(process.env.PORT || 3000);